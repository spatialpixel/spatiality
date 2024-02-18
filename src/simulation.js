/**
 * @module Spatiality.Simulation
 * @description Base class for Simulations.
 * @author William Martin
 * @version 0.1.0
 *
 * Each Simulation type should also implement a set of functions to be
 * defined for and called by the LLM.
 */

export class Simulation {
  constructor () {
    
  }
  
  get defaultContext () {
    return `You are a helpful assistant..`
  }
  
  get toolSchemas () {
    // Should return functions chemas.
    return [];
  }
  
  get availableFunctions () {
    // Should return a dictionary of function names to function implementations.
    return {}
  }
  
  initialize () {
    
  }
  
  reset () {
    
  }
  
  draw (p, interfaceState) {
    
  }
  
  mouseClicked (p, interfaceState, cameraPosition, dir) {
    
  }
}
