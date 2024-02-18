/**
 * @module Spatiality.PhysicsSimulation
 * @description Rigid-body physics simulation.
 * @author William Martin
 * @version 0.1.0
 */

import * as AddObjectsFunction from './function_add_objects.js';
import * as RemoveObjectsFunction from './function_remove_objects.js';
import * as GetSpatialLayoutFunction from './function_get_spatial_layout.js';

import { Simulation } from '../simulation.js';

import * as Helpers from '../helpers.js';
import * as Lidar from '../lidar/lidar.js';
import * as Interface from '../interface.js'
import * as OpenAI from '../openai.js';

// Setup for the rigid-body physics engine, Rapier.
// Found at https://rapier.rs/
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import _ from 'lodash';


export class PhysicsSimulation extends Simulation {
  constructor () {
    super();
    this.worldState = null;
    this.lidar = null;
  }
  
  get defaultContext () {
    return `You are an assistant helping to manage a space populated with geometric objects and shapes.`
  }
  
  get toolSchemas () {
    return [
      GetSpatialLayoutFunction.schema,
      AddObjectsFunction.schema,
      RemoveObjectsFunction.schema,
    ];
  }
  
  get availableFunctions () {
    return {
      "get_spatial_layout": args => {
        return GetSpatialLayoutFunction.get_spatial_layout(this.worldState, args);
      },
      "add_objects": args => {
        return AddObjectsFunction.add_objects(this.worldState, args);
      },
      "remove_objects": args => {
        return RemoveObjectsFunction.remove_objects(this.worldState, args);
      },
    };
  }
  
  async initialize (interfaceState) {
    await RAPIER.init();

    this.worldState = new WorldState(RAPIER);
    this.worldState.addGroundPlane();

    this.lidar = new Lidar.LidarAgent(this.worldState);
    await this.lidar.initialize();
    
    Interface.initializeButton('#reset-physics', () => {
      this.reset();
    });
    
    Interface.initializeButton('#toggle-physics', () => {
      interfaceState.animatePhysics = !interfaceState.animatePhysics;
    });
    
    Interface.initializeButton('#objects-add-cube', () => {
      console.log('add cube');
      
      const x = 0 + Math.random() * 4 - 2;
      const y = 10.0 + Math.random() * 4 - 2; // vertical axis
      const z = 0 + Math.random() * 4 - 2;
      const cubeParams = {
        objectType: 'cube',
        position: { x, y, z },
        rotation: { x: 0, y: 0, z: 0, w: 0 },
        dimensions: { length: 1, width: 1, height: 1}
      };

      this.availableFunctions.add_objects({ objects: [cubeParams] });
    });
    
    Interface.initializeButton('#objects-add-sphere', () => {
      console.log('add sphere');
      
      const x = 0 + Math.random() * 4 - 2;
      const y = 10.0 + Math.random() * 4 - 2; // vertical axis
      const z = 0 + Math.random() * 4 - 2;
      const cubeParams = {
        objectType: 'sphere',
        position: { x, y, z },
        rotation: { x: 0, y: 0, z: 0, w: 0 },
        dimensions: { length: 1, width: 1, height: 1}
      };

      this.availableFunctions.add_objects({ objects: [cubeParams] });
    });
    
    Interface.initializeButton('#remove-selected', () => {
      this.worldState.removeSelected();
    });
  }
  
  reset () {
    this.worldState.reset();
    this.lidar.reset();
  }
  
  draw (p, interfaceState) {
    if (interfaceState.animatePhysics) {
      this.worldState.world.step();
    }
    
    for (const obj of this.worldState.objects) {
      obj.draw(p, interfaceState);
    }
    
    this.lidar.draw(p, interfaceState);
  }
  
  mouseClicked (event, p, interfaceState, cameraPosition, dir) {
    const instance = this.getObjectsIntersectingRay(cameraPosition, dir);
    if (instance) {
      if (p.keyCode === p.SHIFT) {
        this.worldState.addToSelection(instance);
      } else {
        this.worldState.selectObject(instance);
      }
    } else {
      this.worldState.deselectAll();
    }
  }
  
  getObjectsIntersectingRay (origin, direction) {
    const ray = new this.worldState.RAPIER.Ray(origin, direction);
    const maxToi = 100.0;
    const solid = true;
    
    let instance
    this.worldState.world.intersectionsWithRay(ray, maxToi, solid, (hit) => {
      // Callback called on each collider hit by the ray.

      // let hitPoint = ray.pointAt(hit.toi);
      // console.debug("Collider", hit, "hit at point", hitPoint, "with normal", hit.normal);
      // console.debug("simulation object:", hit.collider.parent().userData.parent);

      try {
        const parent = hit.collider.parent()
        if (parent) {
          instance = parent.userData.parent;
          return false;
        }
      } catch (err) {
        console.error(err);
      }

      return true; // false = stop searching for more hits
    });
    
    if (!instance) {
      return null;
    } else {
      return instance;
    }
  }
}

class WorldState {
  constructor (r) {
    // Hold a reference for convenience.
    this.RAPIER = r;

    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);
    
    this.objects = [];
    
    this.selected = [];
  }
  
  selectObject (instance) {
    this.selected = [instance];
  }
  
  addToSelection (instance) {
    this.selected.push(instance);
  }
  
  deselect (instance) {
    _.remove(this.selected, obj => obj === instance);
  }
  
  deselectAll () {
    this.selected = [];
  }
  
  isSelected (instance) {
    return this.selected.includes(instance);
  }
  
  removeSelected () {
    // Clone the array of selected objects since we're mutating it.
    const _selected = _.clone(this.selected);
    _.forEach(_selected, obj => {
      this.removeObject(obj);
    });
  }
  
  addObject (instance) {
    this.objects.push(instance);
  }
  
  addGroundPlane () {
    // Create the ground
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0).setTranslation(0, -0.1, 0);
    this.world.createCollider(groundColliderDesc);
  }
  
  removeObjectById (id) {
    const objectToRemove = _.find(this.objects, obj => obj.id === id);
    if (objectToRemove) {
      this.removeObject(objectToRemove);
      return true;
    } else {
      return false;
    }
  }
  
  removeObject (objectToRemove) {
    console.debug("Removing object:", objectToRemove);
    
    if (this.isSelected(objectToRemove)) {
      this.deselect(objectToRemove);
    }
    
    this.world.removeCollider(objectToRemove.collider);
    this.world.removeRigidBody(objectToRemove.rigidBody);
    
    _.remove(this.objects, obj => obj === objectToRemove);
  }
  
  reset () {
    this.objects = [];

    this.world.forEachRigidBody(body => {
      this.world.removeRigidBody(body);
    });
    this.world.forEachCollider(collider => {
      this.world.removeCollider(collider);
    });
    
    this.world.free();
    
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);
    
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
    this.world.createCollider(groundColliderDesc);
  }
}
