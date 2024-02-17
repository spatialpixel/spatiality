/**
 * @module Spatiality.Main
 * @description Entry point for the Spatiality app.
 * @author William Martin
 * @version 0.1.0
 */

import './style.css';

import * as Interface from './src/interface.js';
import * as Helpers from './src/helpers.js';

// The global state object. Instantiated as a singleton.
import { State } from './src/state.js';
import * as Project from './src/project.js';

// The simulation we currently have.
import * as Physics from './src/physics/physics.js';

// The hosted LLM AI we want to use.
import * as OpenAI from './src/openai.js';

// The global State singleton.
let state

function addMessageToList (text) {
  const messagesElt = document.querySelector('#messages');
  const child = document.createElement('div');
  child.classList.add('message');
  child.innerText = text;
  messagesElt.prepend(child);
}

// TODO Consider making p5.js part of the Simulation.
const sketch = p => {
  // Put any sketch-specific state here.
  const darkModeColors = {
    backgroundColor: p.color('black'),
    objectFillColor: p.color('black'),
    objectStrokeColor: p.color('gray'),
    pointCloudColor: p.color(255, 255, 255, 128),
  };
  const lightModeColors = {
    backgroundColor: p.color('white'),
    objectFillColor: p.color('white'),
    objectStrokeColor: p.color('gray'),
    pointCloudColor: p.color(0, 0, 0, 128),
  };

  const interfaceState = {
    animatePhysics: true,
    renderObjects: true,
    renderOutlines: true,
    darkMode: false,
    drawAxes: true,
    colorScheme: lightModeColors,
    cam: null,
  };

  p.setup = function () {
    state = new State();

    // Create the simulation frist.
    const newSim = new Physics.PhysicsSimulation();
    
    // Instantiate a Chat object, but pass in the default context.
    const newChat = new OpenAI.Chat();

    // Create a project from the chat and simulation.
    state.currentProject = new Project.Project(newChat, newSim);
    
    // Create the LLM context.
    state.openai = new OpenAI.OpenAIInterface(state, addMessageToList);

    // Initialize everything.
    state.initialize(interfaceState);

    const canvasSize = getCanvasSize();
    p.createCanvas(canvasSize.width, canvasSize.height, p.WEBGL);
    
    interfaceState.cam = p.createEasyCam({ rotation: [ 0, 0, 0.4794255, 0.8775826 ] });

    // Disable right click for the benefit of EasyCam.
    const sim = document.querySelector('#simulation');
    sim.oncontextmenu = function() { return false; };
  } // end setup
  
  p.draw = function () {
    p.background(interfaceState.colorScheme.backgroundColor);
    p.scale(20);

    p.strokeWeight(0.5);
    
    if (interfaceState.renderObjects) {
      p.fill(interfaceState.colorScheme.objectFillColor);
    } else {
      p.noFill();
    }
    if (interfaceState.renderOutlines) {
      p.stroke(interfaceState.colorScheme.objectStrokeColor);
    } else {
      p.noStroke();
    }
    
    // Render the ground plane.
    p.push();
    p.translate(0, -0.1, 0);
    p.box(20.0, 0.2, 20.0);
    p.pop();
    
    state.currentSimulation.draw(p, interfaceState);
    
    if (interfaceState.drawAxes) {
      Interface.drawAxes(p);
    }
  } // end draw
  
  Interface.initializeCheckbox('#toggle-axes', (value, event) => {
    interfaceState.drawAxes = value;
  });
  
  Interface.initializeCheckbox('#toggle-objects', (value, event) => {
    interfaceState.renderObjects = value;
  });
  
  Interface.initializeCheckbox('#toggle-outlines', (value, event) => {
    interfaceState.renderOutlines = value;
  });
  
  Interface.initializeCheckbox('#toggle-darkmode', (value, event) => {
    interfaceState.darkMode = value;
    if (interfaceState.darkMode) {
      interfaceState.colorScheme = darkModeColors;
    } else {
      interfaceState.colorScheme = lightModeColors;
    }
  });
  
  // Resize the sketch if the window changes size.
  p.windowResized = () => {
    const eltSize = getCanvasSize();
    p.resizeCanvas(eltSize.width, eltSize.height);
    interfaceState.cam.update();
  }
} // end sketch function

function getHostElement () {
  return document.querySelector('#sketch');
}

function getCanvasSize () {
  const host = getHostElement();
  if (!host) {
    return { width: 800, height: 400 };
  };
  const rect = host.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

async function onReady () {
  const sketchElt = getHostElement();
  // Note: P5.js is loaded in a <link> tag in the HTML because it's weird.
  new p5(sketch, sketchElt);
} // end onReady

if (document.readyState === 'complete') {
  onReady();
} else {
  document.addEventListener("DOMContentLoaded", onReady);
}
