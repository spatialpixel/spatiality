/**
 * @module Spaciality.State
 * @description Global state object.
 * @author William Martin
 * @version 0.1.0
 */

export class State {
  constructor () {
    this.openai = null;
    this.currentProject = null;

    this.projects = [];
  }

  get currentChat () {
    return this.currentProject.chat;
  }
  
  get currentSimulation () {
    return this.currentProject.simulation;
  }
  
  get availableFunctions () {
    return this.currentSimulation.availableFunctions;
  }
  
  get toolSchemas () {
    return this.currentSimulation.toolSchemas;
  }
  
  async initialize (interfaceState) {
    await this.openai.initialize();
    await this.currentProject.initialize(interfaceState);
  }
  
  reset () {
    this.currentProject.reset();
  }
}
