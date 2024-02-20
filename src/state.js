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
  
  createDefaultProject () {
    // Create the simulation.
    // TODO Rapier is stateful, so we can't replace the simulation instance, only reset it.
    // This is the cause of a lot of needless complexity.
    const newSim = this.currentProject?.simulation || new Physics.PhysicsSimulation();
    
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
  
  // TODO Find an event-driven way to sync this.projects with the projects-list element.
  addProject (projectJson) {
    // Add to the component list.
    document.querySelector('projects-list').addProject(projectJson);
    
    // Add to projects list.
    this.projects.push(projectJson);
    
    // Save to local storage.
    // localStorage.setItem(projectJson.id, projectJson);
  }
  
  removeProject (projectId) {
    // Remove from the component list.
    document.querySelector('projects-list').removeProject(projectId);
    
    // Remove the project from the projects list.
    _.remove(this.projects, project => project.id === projectId);
    
    // Also remove from localStorage.
    localStorage.removeItem(projectId);
  }
  
  getProjectById (id) {
    return _.find(this.projects, proj => proj.id === id);
  }
  
  createProject (callback) {
    console.log('Creating a new project');
    this.openProject(null, callback);
  }
  
  openProject (id, callback) {
    if (id) {
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
    } else {
      // Create a new project.
      const projectObj = this.createDefaultProject();
      this.addProject(projectObj.json);
      this.currentProject = projectObj;
      
      this.openai.populateContextWindow(this.currentProject.currentContext);
      this.openai.enableContextWindow();

      if (callback) {
        callback(projectObj);
      }
    }
  }
  
  saveCurrentProject () {
    console.log(`Saving the current project: ${this.currentProject.name}`);

    const id = this.currentProject.id;
    const json = this.currentProject.json;
    const str = JSON.stringify(json);
    
    // TODO Store Project instances instead of the data.
    const index = _.findIndex(this.projects, proj => proj.id === id)
    this.projects[index] = json;
    
    localStorage.setItem(id, str);
  }
  
  deleteCurrentProject () {
    const name = this.currentProject.name;
    
    if (confirm(`Are you sure you want to delete the project ${name}?`)) {
      console.log(`Okay, deleteing project ${name}.`);
      
      this.currentProject.reset();
      this.removeProject(this.currentProject.id);
      
      if (this.numProjects === 0) {
        this.createProject(document.querySelector('projects-list').updateCurrentProjectInput);
      } else {
        this.openProject(this.projects[0].id, document.querySelector('projects-list').updateCurrentProjectInput);
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
}
