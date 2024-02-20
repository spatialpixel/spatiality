/**
 * @module Spatiality.MessagesList
 * @description Helper functions for managing the list of chat messages.
 * @author William Martin
 * @version 0.1.0
 */

import _ from 'lodash';

// TODO Find an event-driven way of updating the list when messages
// are added to the Chat instance.
export function addMessageToList (text) {
  const child = document.createElement('div');
  child.classList.add('message');
  child.innerText = text;
  
  const messagesList = document.querySelector('#messages');
  messagesList.prepend(child);
}

export function restoreList (messages) {
  for (const message of messages) {
    if (!message.content && message.tool_calls && Array.isArray(message.tool_calls)) {
      const text = _.chain(message.tool_calls).map(tool => tool.function.name).join(', ').value();
      addMessageToList(`··· Response requires calling function(s): ${text}`);
    } else {
      let content = message.content;

      let prefix
      if (message.role === 'system') {
        prefix = '▶︎ ';
      } else if (message.role === 'user') {
        prefix = '';
      } else if (message.role === 'assistant') {
        prefix = '→ ';
      } else if (message.role === 'tool') {
        prefix = `··· Calling function ${message.name}: `;
      } else {
        prefix = '';
      }

      addMessageToList(`${prefix}${content}`);
    }
  }
}

export function clearList () {
  const messages = document.querySelectorAll('.message');
  for (const message of messages) {
    message.remove();
  }
}
