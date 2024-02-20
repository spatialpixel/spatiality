/**
 * @module Spatiality.MessagesList
 * @description Helper functions for managing the list of chat messages.
 * @author William Martin
 * @version 0.1.0
 */

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
    addMessageToList(message.content);
  }
}

export function clearList () {
  const messages = document.querySelectorAll('.message');
  for (const message of messages) {
    message.remove();
  }
}
