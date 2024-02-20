/**
 * @module Spaciality.State
 * @description Global state object.
 * @author William Martin
 * @version 0.1.0
 */
 
import * as Project from './project.js';
// The only simulation we currently have.
import * as Physics from './physics/physics.js';
import { Chat } from './chat.js';

import * as Interface from './interface.js';

import { restoreProject } from './project-restore.js';
import _ from 'lodash';

export class State {
  constructor (openai, project=null) {
    this.openai = openai;
    this.currentProject = project;
  }
  
  async initialize (interfaceState) {
    this.loadAllProjects();
    this.populateProjectsList();
    
    if (!this.currentProject) {
      this.currentProject = this.createDefaultProject();
    }
    
    this.initializeUI(); // Depends on this.currentProject.

    await this.openai.initialize(this, interfaceState);
    await this.currentProject.initialize(interfaceState);
    
    this.addProject(this.currentProject.json);
  }

  loadAllProjects () {
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
  
  populateProjectsList () {
    const projectsList = document.querySelector('projects-list');
    if (projectsList) {
      projectsList.populate(this);
    } else {
      console.error('Could not find the projects-list element.');
    }
  }
  
  addProject (projectJson) {
    const projectsList = document.querySelector('projects-list');
    if (projectsList) {
      projectsList.addProject(projectJson);
      this.projects.push(projectJson);
    }
  }
  
  createDefaultProject () {
    // Create the simulation first.
    const newSim = new Physics.PhysicsSimulation();
    
    // Instantiate an empty Chat object.
    const newChat = new Chat();
    
    // Create a project from the chat and simulation.
    const defaultProjectName = `New Project ${this.numProjects + 1}`;
    const newProject = new Project.Project(newChat, newSim, defaultProjectName);
    return newProject;
  }
  
  initializeUI () {
    Interface.initializeTextInput('#project-name-input', (value, event) => {
        const oldName = this.currentProject.name;
        this.currentProject.name = value;
    
        // TODO Create CustomEvents for things like this in the future that affect
        // potentially multiple components.
        const projectsList = document.querySelector('projects-list');
        projectsList.updateProjectName(this.currentProject.id, this.currentProject.name);
        
        this.saveCurrentProject();
      },
      () => this.currentProject.name
    );
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
      console.log("No change detected. Skipping save.");
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
      
      // Projects will have a context already determined.
      this.openai.populateContextWindow(this.currentProject.currentContext);
      this.openai.disableContextWindow();
      
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
  
  get numProjects () {
    return this.projects.length;
  }
  
  get currentChat () {
    return this.currentProject.chat;
  }
  
  get currentSimulation () {
    return this.currentProject.simulation;
  }
}
