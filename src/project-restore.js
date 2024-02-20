/**
 * @module Spatiality.ProjectRestore
 * @description Module to help restore (load) a Project from saved data.
 * @author William Martin
 * @version 0.1.0
 */

import { Project } from './project.js';
import { restoreChat } from './chat.js';
import { restoreSimulation } from './physics/physics.js';

import * as Messages from './messages-list.js';

export function restoreProject (json, simulation) {
  Messages.clearList();

  const chat = restoreChat(json.chat);
  
  Messages.restoreList(chat.messages);
  
  // This is a temporary measure to keep the same simulation
  // instance active but giving it new data.
  simulation.restore(json.simulation);

  //const simulation = restoreSimulation(json.simulation);
  return new Project(chat, simulation, json.name, json.id);
}
