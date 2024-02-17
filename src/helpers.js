// https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
export function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

// From ChatGPT.
export function quaternionToEuler (quat) {
  let x = quat.x;
  let y = quat.y;
  let z = quat.z;
  let w = quat.w;

  let t0 = 2.0 * (w * x + y * z);
  let t1 = 1.0 - 2.0 * (x * x + y * y);
  let roll = Math.atan2(t0, t1);

  let t2 = 2.0 * (w * y - z * x);
  t2 = t2 > 1.0 ? 1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;
  let pitch = Math.asin(t2);

  let t3 = 2.0 * (w * z + x * y);
  let t4 = 1.0 - 2.0 * (y * y + z * z);
  let yaw = Math.atan2(t3, t4);

  return { x: roll, y: pitch, z: yaw };
}
