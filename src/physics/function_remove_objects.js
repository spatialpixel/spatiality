import * as Objects from './objects.js'
import _ from 'lodash';

export const function_name = "remove_objects";

export const schema = {
  "type": "function",
  "function": {
    "name": function_name,
    "description": "Remove objects from the space.",
    "parameters": {
      "type": "object",
      "properties": {
        "objects": { // OBJECTS key
          "type": "array",
          "description": "A list of all the objects being removed from the scene.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "A unique identifier for this object, typically a UUID.",
              },
            } // end properties

          } // end items
        }
      } // end properties
    } // parameters
  }
};

export function remove_objects (worldState, params) {
  const tr = [];

  for (const obj of params.objects) {
    const success = worldState.removeObjectById(obj.id);
    if (success) {
      tr.push(obj.id);
    }
  }

  return JSON.stringify(tr);
}
