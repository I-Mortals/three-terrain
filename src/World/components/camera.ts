import { PerspectiveCamera } from "three";

export function createCamera() {
  // Create a camera
  const fov = 35; // 相机截锥体垂直视野。
  const aspect = window.innerWidth / window.innerHeight; // 相机截锥宽高比
  const near = 0.1; // 近裁剪平面
  const far = 90000; // 远裁剪平面
  
  return new PerspectiveCamera(fov, aspect, near, far);
}
