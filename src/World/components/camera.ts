import { PerspectiveCamera } from "three";

export function createCamera() {
  // Create a camera
  const fov = 35; // AKA Field of View
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1; // 近裁剪平面
  const far = 100; // 远裁剪平面
  
  return new PerspectiveCamera(fov, aspect, near, far);
}