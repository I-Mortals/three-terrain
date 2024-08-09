
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
import { createScene } from './World/components/scene';
import { createRenderer } from './World/components/renderer';
import { createCamera } from './World/components/camera';
import { World } from './World/World';

function App() {


  const width = window.innerWidth, height = window.innerHeight;

  const scene = createScene()
  const camera = createCamera()
  const renderer = createRenderer(width, height)


  let container: HTMLElement | null = null;
  let world = null

  
  // init
  useEffect(() => {
    container = document.getElementById('container');
    if(container){
      world = new World(container, camera, scene, renderer)
      world.render();
    }
  })

  return (
    <>
      <div id="container"></div>
    </>
  )
}

export default App




