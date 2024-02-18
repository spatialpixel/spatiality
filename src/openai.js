/**
 * @module Spaciality.OpenAIInterface
 * @description A convenience interface for OpenAI.
 * @author William Martin
 * @version 0.1.0
 */

import * as Interface from './interface.js';

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';


export class Chat {
  constructor () {
    this.id = uuidv4();
    this.model = "gpt-4-1106-preview";
    this.messages = null;
  }
  
  addMessage (message) {
    this.messages.push(message);
  }
  
  initialize (defaultContext) {
    this.messages = [
      {
        "role": "system",
        "content": defaultContext
      },
    ];
  }
  
  restore () {
    
  }
}

const API_STORAGE_KEY = 'spatiality-openai-api-key';

export class OpenAIInterface {
  constructor (state, addMessageToList) {
    this.state = state;
    this.addMessageToList = addMessageToList;

    this._openai = null;
  }
  
  async initialize () {
    this.initializeUIBehaviors();
  }
  
  // =============================================================================
  // UI Stuff - TODO: Consider moving to its own class.
  
  initializeUIBehaviors () {
    this.addStorageBehaviorToApiKeyInput();
    this.addToggleVisibilityButton();
    this.initializePromptInputs();
    this.updateApiNoticeVisibility();
  }
  
  updateApiNoticeVisibility () {
    if (this.hasApiKey) {
      Interface.hideElementById('api-key-notice');
    } else {
      Interface.showElementById('api-key-notice');
    }
  }
  
  addStorageBehaviorToApiKeyInput () {
    const _this = this;
    const apiKeyInput = document.getElementById('openai-api-key');
    apiKeyInput.addEventListener('change', event => {
      const key = event.target.value;
      _this.apiKey = key;
      _this.updateApiNoticeVisibility();
    });
    
    if (this.hasApiKey) {
      apiKeyInput.value = this.apiKey;
    }
  }
  
  addToggleVisibilityButton () {
    const togglePasswordVisibility = () => {
      const apiKeyInput = document.getElementById('openai-api-key');
      if (apiKeyInput.type === 'text') {
        apiKeyInput.type = 'password';
      } else {
        apiKeyInput.type = 'text';
      }
    };
    
    const toggleButton = document.getElementById('toggle-openai-key-visibility');
    toggleButton.addEventListener('click', togglePasswordVisibility);
  }
  
  initializePromptInputs () {
    const promptInput = document.getElementById('prompt-input');
    
    if (promptInput) {
      promptInput.addEventListener('keydown', async event => {
        if (event.key === "Enter") {
          event.preventDefault();
          promptInput.disabled = true;
    
          // Get the text from the text input element.
          const prompt = promptInput.value;
          
          // Call the OpenAI API to get a completion from the prompt.
          const completion = await this.chat(prompt);
    
          promptInput.value = '';
          promptInput.disabled = false;
        } // end check for Enter
      }); // end addEventListener click
    } // end check for promptInput existence
    
    Interface.initializeButton("#send-prompt", async event => {
      // Get the text from the text input element.
      const prompt = promptInput.value;
      promptInput.disabled = true;
      
      // Call the OpenAI API to get a completion from the prompt.
      const completion = await this.chat(prompt);
      
      promptInput.value = '';
      promptInput.disabled = false;
    });
  }
  
  // =============================================================================
  // API Key Management
  
  set apiKey (newKey) {
    localStorage.setItem(API_STORAGE_KEY, newKey);
  }
  
  get apiKey () {
    return localStorage.getItem(API_STORAGE_KEY);
  }
  
  get hasApiKey () {
    const key = this.apiKey;
    return key && (typeof key === 'string') && key.length > 40;
  }
  
  instantiate () {
    this.updateApiNoticeVisibility();

    if (!this.hasApiKey) {
      alert("Remember to enter your OpenAI API key.");
      return false;
    }

    this._openai = new OpenAI({
      apiKey: this.apiKey,
    
      // This is ONLY for prototyping locally on your personal machine!
      dangerouslyAllowBrowser: true
    });

    return true;
  }
  
  // =============================================================================
  // Chat

  // Sends a single prompt to the OpenAI completions API.
  // Accepts a few arguments:
  // - prompt: a string, user-provided prompt
  // TODO: there's probably a better way to handle UI updates, but some responses
  // we want to show but aren't actually messages of the chat itself.
  async chat (prompt) {
    try {
      console.log(`Attempting to chat via OpenAI API with prompt:`, prompt);
      if (!this._openai) {
        this.instantiate();
      }

      // Add the user's prompt to the list regardless of whether an error is thrown.
      const newMessage = {
        "role": "user",
        "content": prompt
      };
      this.addMessageToList(prompt);
      
      if (!this._openai) {
        throw new Error("Tried to chat with OpenAI but the OpenAI instance wasn't ready. Perhaps a missing API key?");
      }
      
      const chat = this.state.currentChat;
      
      // Now that the OpenAI instance has been instantiated, add the prompt
      // to the list of messages. This ensures the chat's continuity.
      chat.addMessage(newMessage);
      
      const completion = await this._openai.chat.completions.create({
        model: chat.model,
        messages: chat.messages,
        tools: this.state.toolSchemas,
      });
      
      // I think regardless, we want to store the first response.
      const responseMessage = completion.choices[0].message;
      chat.addMessage(responseMessage);
      const responseContent = responseMessage.content;

      if (responseMessage.tool_calls) {
        const tool_names = responseMessage.tool_calls.map(t => t.function.name).join(', ');

        this.addMessageToList('→ ' + (responseContent || `Need to call a function: ${tool_names}`));
        
        // In this case, the response has asked to call one or more tools to get enough information
        // to complete the chat.

        for (const tool_call of responseMessage.tool_calls) {
          const function_name = tool_call.function.name;
  
          this.addMessageToList(`··· Asking to call function: ${function_name}`);
          
          const function_to_call = this.state.availableFunctions[function_name];
          const function_args = JSON.parse(tool_call.function.arguments);
  
          console.log('Asking to call function:', function_name, ', with the arguments:', function_args);
  
          const function_response = function_to_call(function_args);
          
          console.log('→ function response:', function_response);
          
          // Extend conversation with function's response.
          const functionResponseMessage = {
            "tool_call_id": tool_call.id,
            "role": "tool",
            "name": function_name,
            "content": function_response,
          };
          chat.addMessage(functionResponseMessage);
        } // end loop of function calls
        
        // Once all the tools have been called and the results compiled, then get back
        // to OpenAI with the results.
        const function_completion = await this._openai.chat.completions.create({
          model: chat.model,
          messages: chat.messages,
          // Do we omit 'tools' on purpose here?
        });
        
        const secondResponseMessage = function_completion.choices[0].message;
        chat.addMessage(secondResponseMessage);
  
        const secondResponseContent = secondResponseMessage.content;
        this.addMessageToList('→ ' + secondResponseContent);
        return secondResponseContent;
      } else {
        // Normal path with no tool calls.
        const responseContent = completion.choices[0].message.content;
        
        this.addMessageToList('→ ' + responseContent);
        return responseContent;
      }
    } catch (err) {
      console.error("An error occurred in the chat function:", err);
      // Note that this ends up being the completion returned by chat().
      return `An error occurred. ${err.name} | ${err.message}`;
    }
  } // end chat
} // end OpenAI
