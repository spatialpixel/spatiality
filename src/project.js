/**
 * @module Spatiality.Project
 * @description Project abstraction that contains Chat and Simulation state.
 * @author William Martin
 * @version 0.1.0
 */

import { v4 as uuidv4 } from 'uuid';

export class Project {
  constructor (chat, simulation, name, id) {
    this.name = name || "New Project";
    this.id = id || uuidv4();
    
    this.chat = chat;
    this.simulation = simulation;
    
    this.defaultContext = simulation.defaultContext;
    
    this.state = null;
  }
  
  async initialize (interfaceState) {
    await this.simulation.initialize(interfaceState);
    this.chat.initialize(interfaceState);
    
    this.originalJson = JSON.stringify(this.json);
  }
  
  get currentContext () {
    if (this.chat.isReady) {
      return this.chat.messages[0].content;
    } else {
      return this.defaultContext;
    }
  }
  
  reset () {
    this.chat.reset();
    this.simulation.reset();
  }
  
  get hasChanged () {
    const newJson = JSON.stringify(this.json);
    return newJson !== this.originalJson;
  }
  
  get json () {
    return {
      type: 'Project',
      id: this.id,
      name: this.name,
      chat: this.chat.json,
      simulation: this.simulation.json,
    }
  }
}
