/**
 * @module Spaciality.Objects
 * @description Classes that represent rigid objects implemented with Rapier.js.
 * @author William Martin
 * @version 0.1.0
 */

import * as Helpers from '../helpers.js';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const defaultDimensions = {
  length: 1,
  width: 1,
  height: 1,
};

const defaultRotation = {
  x: 0.0,
  y: 0.0,
  z: 0.0,
  w: 1.0
};

class RigidObject {
  constructor (worldState, startPosition, dimensions, startRotation) {
    this.id = uuidv4();

    // TODO: Fix up this referential weirdness.
    this.worldState = worldState;
    this.RAPIER = worldState.RAPIER;
    this.world = worldState.world;
    
    this.alive = true;
    this.startPosition = startPosition;
    this.startRotation = startRotation || _.clone(defaultRotation); 

    this.dimensions = dimensions || _.clone(defaultDimensions);

    let rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
                          .setTranslation(startPosition.x, startPosition.y, startPosition.z)
                          .setRotation(this.startRotation);
    this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    this.collider = null;

    this.objectTypeName = 'Generic';
    
    this.rigidBody.userData = {
      parent: this
    };
  }
  
  get length () {
    return this.dimensions.length;
  }
  
  set length (x) {
    this.dimensions.length = x;
  }
  
  get width () {
    return this.dimensions.width
  }
  
  set width (x) {
    this.dimensions.width = x;
  }
  
  get height () {
    return this.dimensions.height;
  }
  
  set height (x) {
    this.dimensions.height = x;
  }
  
  draw (p, interfaceState) {
    if (!this.alive) { return; }
    
    if (this.worldState.isSelected(this)) {
      p.fill(p.color('gold'));
    } else {
      p.fill(p.color(interfaceState.colorScheme.objectFillColor));
    }

    p.push();
    
    const position = this.rigidBody.translation();
    p.translate(position.x, position.y, position.z);
    
    if (position.y < -2) { this.destroy(); }
    
    if (this.alive) {
      const quat = this.rigidBody.rotation();
      const rotation = Helpers.quaternionToEuler(quat);
  
      p.rotateZ(rotation.z);
      p.rotateY(rotation.y);
      p.rotateX(rotation.x);
  
      this.drawShape(p, interfaceState);
    }
    
    p.pop();
  }
  
  drawShape (p, interfaceState) {
    // To be overridden.
  }
  
  destroy () {
    this.alive = false;
    this.world = null;
    this.RAPIER = null;
    
    this.worldState.removeObject(this);
  }
  
  get json () {
    return {
      id: this.id,
      type: this.objectTypeName,
      position: this.rigidBody.translation(),
      rotation: this.rigidBody.rotation(),
      dimensions: this.dimensions,
    }
  }
}

export class Box extends RigidObject {
  constructor (worldState, startPosition, dimensions, startRotation) {
    super(worldState, startPosition, dimensions, startRotation);
    
    this.objectTypeName = "Box";

    let colliderDesc = this.RAPIER.ColliderDesc.cuboid(this.dimensions.length / 2.0, this.dimensions.height / 2.0, this.dimensions.width / 2.0);
    this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
  }
  
  drawShape (p) {
    p.box(this.length, this.height, this.width);
  }
}

export class Sphere extends RigidObject{
  constructor (worldState, startPosition, dimensions, startRotation) {
    super(worldState, startPosition, dimensions, startRotation);
    
    this.objectTypeName = "Sphere";
    
    const radius = (this.dimensions.diameter / 2.0) || this.dimensions.radius || (this.dimensions.length / 2.0) || (this.dimensions.width / 2.0) || (this.dimensions.height / 2.0);
  
    let colliderDesc = this.RAPIER.ColliderDesc.ball(radius);
    this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
  }
  
  drawShape (p) {
    p.strokeWeight(0.2);
    p.sphere(this.length / 2.0, 12, 12);
  }
}
