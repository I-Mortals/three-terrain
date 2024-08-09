
import './styles/App.css'
import { useEffect, useRef, useState } from 'react'
import { OrbitControls, ImprovedNoise } from "three/addons";

import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer, Vector3, BoxGeometry, MeshNormalMaterial, PlaneGeometry, Raycaster, Vector2, ConeGeometry, Camera, Clock, MathUtils,
} from 'three';
import { useFrame } from '@react-three/fiber';
import { Loop } from './World/systems/Loop';

function App() {

  const worldWidth = 256, worldDepth = 256
  const worldHalfWidth = worldWidth / 2
  const worldHalfDepth = worldDepth / 2;
  const width = window.innerWidth, height = window.innerHeight;

  // mesh
  const boxMesh = (size: Vector3) => {
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const material = new MeshNormalMaterial();
    return new Mesh(geometry, material);
  }

  const planeMesh = () => {
    const geometry = new PlaneGeometry(450, 450, worldWidth - 1, worldDepth - 1);
    const material = new MeshNormalMaterial();
    return new Mesh(geometry, material);
  }

  // 场景设置
  // Create a camera
  const fov = 35; // AKA Field of View
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1; // the near clipping plane
  const far = 100; // the far clipping plane

  const camera = new PerspectiveCamera(fov, aspect, near, far);

  // every object is initially created at ( 0, 0, 0 )
  // move the camera back so we can view the scene
  camera.position.set(0, 0, 10);
  // const camera = new PerspectiveCamera(35, width / height, 0.1, 100);
  const scene = new Scene();
  scene.background = new Color('skyblue');
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio); // 像素比率



  // 相机控制
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0;
  controls.maxDistance = 10000;
  controls.maxPolarAngle = Math.PI / 2;
  camera.position.y = controls.target.y + 10;
  // camera.position.x = 10;
  controls.update();

  const loop = new Loop(camera, scene, renderer);


  const terrain = planeMesh();
  const boxMashObj = boxMesh(new Vector3(2, 2, 2));

  scene.add(boxMashObj);
  boxMashObj.position.set(0, 0, 0);

  // 将度数转换为弧度
  const radiansPerSecond = MathUtils.degToRad(30);


  loop.updatables.push({
    mash: boxMashObj,
    tick: ((delta:number) => {
      boxMashObj.rotation.x += radiansPerSecond * delta;
    })
  });

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  let container: HTMLElement | null = null;

  // 射线
  const raycaster = new Raycaster();
  const pointer = new Vector2();


  function onPointerMove(event: PointerEvent) {

    pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    //看看从摄像机进入世界的光线是否击中了我们的一个网格
    const intersects = raycaster.intersectObject(boxMashObj);


  }

  // init
  useEffect(() => {
    container = document.getElementById('container');
    // 检查子节点数量并替换第一个子节点
    if (container!.childNodes.length <= 0) {
      container!.appendChild(renderer.domElement);
    } else {
      container!.replaceChild(renderer.domElement, container!.childNodes[0]);
    }
    loop.start();
    window.addEventListener('resize', onWindowResize);
    container!.addEventListener('pointermove', onPointerMove);

  })

  return (
    <>
      <div id="container"></div>
    </>
  )
}

export default App


function generateHeight(width: number, height: number) {

  const size = width * height, data = new Uint8Array(size),
    perlin = new ImprovedNoise(), z = Math.random() * 100;

  let quality = 1;

  for (let j = 0; j < 4; j++) {

    for (let i = 0; i < size; i++) {

      const x = i % width, y = ~ ~(i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);

    }

    quality *= 5;

  }

  return data;

}

