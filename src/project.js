/**
 * @module Spatiality.Project
 * @description Project abstraction that contains Chat and Simulation state.
 * @author William Martin
 * @version 0.1.0
 */

import { v4 as uuidv4 } from 'uuid';

export class Project {
  constructor (chat, simulation, id, name) {
    this.id = id || uuidv4();
    this.name = name || "New Project";
    
    this.chat = chat;
    this.simulation = simulation;
  }
  
  async initialize (interfaceState) {
    await this.simulation.initialize(interfaceState);
    await this.chat.initialize(this.simulation.defaultContext);
  }
  
  reset () {
    
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
