export const function_name = "get_spatial_layout";

export const schema = {
  "type": "function",
  "function": {
    "name": "get_spatial_layout",
    "description": "Get the layout of all objects in the space."
  }
};

export function get_spatial_layout (worldState, params) {
  const stuff = {
    "objects": worldState.objects.map(obj => obj.json)
  };
  return JSON.stringify(stuff);
}
