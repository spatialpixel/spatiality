/**
 * @module Spaciality.Lidar
 * @description Implementing a simulation agent that mimics a LiDAR.
 * @author William Martin
 * @version 0.1.0
 */

import * as Interface from '../interface.js';
import { Agent } from '../agent.js';


export class LidarAgent extends Agent {
  constructor (worldState) {
    super();
    
    this.worldState = worldState;
    
    this.raycastPoints = [];
    this.lidarPosition = { x: 1.0, y: 1.5, z: 3.0 };
  }
  
  get json () {
    return {
      type: 'LidarAgent',
      lidarPosition: this.lidarPosition,
    }
  }
  
  async initialize () {
    Interface.initializeButton('#cast-rays', event => {
      this.castRays();
    });
    
    Interface.initializeButton('#save-points', event => {
      const precision = 5;
    
      const lines = this.raycastPoints.map(pt => {
        const x = pt.x.toFixed(precision);
        const y = pt.y.toFixed(precision);
        const z = pt.z.toFixed(precision);
        const nx = pt.nx.toFixed(precision);
        const ny = pt.ny.toFixed(precision);
        const nz = pt.nz.toFixed(precision);
        return `${x} ${y} ${z} ${nx} ${ny} ${nz}`;
      });
      
      lines.unshift(`${this.raycastPoints.length}`);
    
      p.save(lines, 'points.xyzn');
    });
    
    Interface.initializeButton('#clear-points', () => {
      this.clearRays();
    });
  }
  
  clearRays () {
    this.raycastPoints = [];
  }
  
  reset () {
    this.clearRays();
  }
  
  castRays () {
    const numRays = 10000;

    for (let i = 0; i < numRays; i ++) {
      // https://rapier.rs/docs/user_guides/javascript/scene_queries
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      const vector = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
      };
  
      const ray = new window.RAPIER.Ray(this.lidarPosition, vector);
      const maxToi = 10.0;
      const solid = true;
      
      // const hit = worldState.world.castRay(ray, maxToi, solid);
      // if (hit != null) {
      //   const hitPoint = ray.pointAt(hit.toi);
      //   raycastPoints.push(hitPoint);
      // }
      
      const hitWithNormal = this.worldState.world.castRayAndGetNormal(ray, maxToi, solid);
      if (hitWithNormal != null) {
        const hitPoint = ray.pointAt(hitWithNormal.toi);
        const normal = hitWithNormal.normal;
        const pt = { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z, nx: normal.x, ny: normal.y, nz: normal.z };
        this.raycastPoints.push(pt);
      }
    }
  }
  
  draw (p, interfaceState) {
    p.stroke(interfaceState.colorScheme.pointCloudColor);
    p.strokeWeight(2);

    p.beginShape(p.POINTS);
    for (const pt of this.raycastPoints) {
      p.vertex(pt.x, pt.y, pt.z);
    }
    p.endShape();

    // Move the LiDAR in a circle, just for fun.
    // TODO Make this movement programmable.
    this.lidarPosition.x = 3 * Math.cos(p.frameCount / 100);
    this.lidarPosition.z = 3 * Math.sin(p.frameCount / 100);

    const s = 0.5;
    p.push();
    p.strokeWeight(1);
    p.stroke(p.color('red'));
    p.translate(this.lidarPosition.x, this.lidarPosition.y, this.lidarPosition.z);
    p.line(-s, 0, 0, s, 0, 0);
    p.line(0, -s, 0, 0, s, 0);
    p.line(0, 0, -s, 0, 0, s);
    p.pop();
  }
}