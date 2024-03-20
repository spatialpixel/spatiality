export const function_name = "cluster_objects";

export const schema = {
  "type": "function",
  "function": {
    "name": "cluster_objects",
    "description": "Use the position of all objects in the scene, by object type, to calculate k-means clusters, suggest new positions for each object at the centerpoint of each respective cluster."
  }
};

export function cluster_objects (worldState, params) {
  const stuff = {
    "objects": worldState.objects.map(obj => obj.json)
  };
  return JSON.stringify(stuff);
}
