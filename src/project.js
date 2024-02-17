/**
 * @module Spatiality.Project
 * @description Project abstraction that contains Chat and Simulation state.
 * @author William Martin
 * @version 0.1.0
 */

import { v4 as uuidv4 } from 'uuid';

export class Project {
  constructor (chat, simulation) {
    this.name = "New Project";
    
    this.id = uuidv4();
    
    this.chat = chat;
    this.simulation = simulation;
  }
  
  initialize (interfaceState) {
    this.simulation.initialize(interfaceState);
    this.chat.initialize(this.simulation.defaultContext);
  }
  
  restore () {
    this.chat.restore();
    this.simulation.restore();
  }
  
  reset () {
    
  }
}
