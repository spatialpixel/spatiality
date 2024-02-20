import { Project } from './project.js';
import { restoreChat } from './chat.js';
import { restoreSimulation } from './physics/physics.js';

export function restoreProject (json, simulation) {
  const chat = restoreChat(json.chat);
  
  // This is a temporary measure to keep the same simulation
  // instance active but giving it new data.
  simulation.restore(json.simulation);

  //const simulation = restoreSimulation(json.simulation);
  return new Project(chat, simulation, json.name, json.id);
}
