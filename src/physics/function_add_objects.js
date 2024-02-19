import * as Objects from './objects.js'
import _ from 'lodash';

export const function_name = "add_objects";

export const schema = {
  "type": "function",
  "function": {
    "name": "add_objects",
    "description": "Add objects to the space of a particular type and size.",
    "parameters": {
      "type": "object",
      "properties": {
        "objects": {
          "type": "array",
          "description": "A list of all the objects being added to the scene.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "A unique identifier for this object, always a UUID.",
              },

              "objectType": {
                "type": "string",
                "description": "A single world noting the type of object being added in lowercase.",
              },

              "position": {
                "type": "object",
                "description": "The position of the object in 3D space, along the x, y, and z axes, with the y-axis representing the vertical dimension.",
                "properties": {
                  "x": {
                    "type": "number",
                    "description": "The x coordinate of the center of the object."
                  },
                  "y": {
                    "type": "number",
                    "description": "The y coordinate of the center of the object."
                  },
                  "z": {
                    "type": "number",
                    "description": "The z coordinate of the center of the object."
                  }
                }
              }, // end position property

              "rotation": {
                "type": "object",
                "description": "The rotation of the object in 3D space, expressed as a quaternion.",
                "properties": {
                  "x": {
                    "type": "number",
                    "description": "The x quaternion rotation value. This should always be a number. The default value should be 0."
                  },
                  "y": {
                    "type": "number",
                    "description": "The y quaternion rotation value. This should always be a number. The default value should be 0."
                  },
                  "z": {
                    "type": "number",
                    "description": "The z quaternion rotation value. This should always be a number. The default value should be 0."
                  },
                  "w": {
                    "type": "number",
                    "description": "The w quaternion rotation value. This should always be a number. The default value should be 0."
                  }
                }
              }, // end rotation property
              
              "dimensions": {
                "type": "object",
                "description": "The dimensions or size of the object in 3D space.",
                "properties": {
                  "length": {
                    "type": "number",
                    "description": "The length of the object. This should always be a number. The default value should be 1."
                  },
                  "width": {
                    "type": "number",
                    "description": "The width of the object. This should always be a number. The default value should be 1."
                  },
                  "height": {
                    "type": "number",
                    "description": "The height of the object. This should always be a number. The default value should be 1."
                  }
                }
              } // end dimensions property
            } // end properties

          } // end items
        }
      } // end properties
    }, // end parameters
    "required": [""]
  }
};

export function add_objects (worldState, params) {
  const tr = [];

  for (const obj of params.objects) {
    let instance
    const objtype = _.lowerCase(obj.objectType);

    if (objtype === "box" || objtype === "cube") {
      instance = new Objects.Box(worldState, obj.position, obj.dimensions, obj.rotation, obj.id);
    } else if (objtype === "sphere" || objtype === 'ball') {
      instance = new Objects.Sphere(worldState, obj.position, obj.dimensions, obj.rotation, obj.id);
    } else {
      console.debug(`Encountered an object type I didn't recognize: ${objtype}`)
    }

    if (instance) {
      worldState.addObject(instance);
      tr.push(instance.json);
    }
  }

  return JSON.stringify(tr);
}
