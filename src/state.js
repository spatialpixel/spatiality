/**
 * @module Spaciality.State
 * @description Global state object.
 * @author William Martin
 * @version 0.1.0
 */
 
import { restoreProject } from './project-restore.js';
import _ from 'lodash';

export class State {
  constructor () {
    this.openai = null;
    this.currentProject = null;

    this.projects = [];

    for (let i = 0; i < localStorage.length; i ++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      try {
        const json = JSON.parse(value);
        if (json.type === 'Project') {
          this.projects.push(json);
        }
      } catch (err) {
        // We may have values that don't parse.
        // Just ignore them for now.
      }
    }
  }
  
  get numProjects () {
    return this.projects.length;
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
  
  getProjectById (id) {
    return _.find(this.projects, proj => proj.id === id);
  }
  
  openProject (id, callback) {
    if (this.currentProject.hasChanged) {
      this.saveCurrentProject();
      this.currentProject.reset();
    } else {
      this.currentProject.reset();
      // TODO Find an event-driven way to sync this.projects with the projects-list element.

      // Remove the list item.
      const projectsList = document.querySelector('projects-list');
      projectsList.removeProject(this.currentProject.id);
      
      // Remove the project from the projects list.
      const currentId = this.currentProject.id;
      _.remove(this.projects, project => project.id === currentId);
    }
    
    const projectJson = this.getProjectById(id);
    if (projectJson) {
      // For now, hold onto the current simulation.
      // TODO Ensure simulations have a clean initialization and deallocation.
      const projectObj = restoreProject(projectJson, this.currentSimulation);
      this.currentProject = projectObj;
      if (callback) {
        callback(projectObj);
      }
    } else {
      console.warn(`Tried to open project with id ${id} but couldn't find it.`)
    }
  }
  
  saveCurrentProject () {
    const id = this.currentProject.id;
    const json = this.currentProject.json;
    const str = JSON.stringify(json);
    
    // TODO Store Project instances instead of the data.
    const index = _.findIndex(this.projects, proj => proj.id === id)
    this.projects[index] = json;
    
    localStorage.setItem(id, str);
  }
}
