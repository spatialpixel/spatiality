/**
 * @module Spatiality.Chat
 * @description Chat abstraction containing messages from interactions with an LLM.
 * @author William Martin
 * @version 0.1.0
 */

import { v4 as uuidv4 } from 'uuid';

export class Chat {
  constructor (id, model, messages) {
    this.id = id || uuidv4();
    this.model = model || "gpt-4-1106-preview";
    this.messages = messages || null;
  }
  
  addMessage (message) {
    this.messages.push(message);
  }
  
  initialize (defaultContext) {
    if (!this.messages) {
      this.messages = [
        {
          "role": "system",
          "content": defaultContext
        },
      ];
    }
  }
  
  reset () {
    // Intentionally empty for now.
  }
  
  get json () {
    return {
      type: 'Chat',
      id: this.id,
      model: this.model,
      messages: this.messages,
    }
  }
}

export function restoreChat (json) {
  return new Chat(json.id, json.model, json.messages);
}
