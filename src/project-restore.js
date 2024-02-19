import { Project } from './project.js';
import { restoreChat } from './chat.js';
import { restoreSimulation } from './physics/physics.js';

export function restoreProject (json) {
  const chat = restoreChat(json.chat);
  const simulation = restoreSimulation(json.simulation);
  return new Project(chat, simulation, json.id, json.name);
}
