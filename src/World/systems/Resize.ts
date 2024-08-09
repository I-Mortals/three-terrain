import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";


export class Resizer {
    constructor(container: HTMLElement, camera: PerspectiveCamera, renderer: WebGLRenderer, callBack?: () => void) {
        // set initial size
        this.setSize(container, camera, renderer);

        window.addEventListener('resize', () => {
            // 如果发生大小调整，再次设置大小
            this.setSize(container, camera, renderer);
            callBack && callBack()
        });
    }
    setSize = (container: HTMLElement, camera: PerspectiveCamera, renderer: WebGLRenderer) => {

        camera.aspect = window.innerWidth / window.innerHeight; // 宽高比
        camera.updateProjectionMatrix(); // 更新摄像机投影矩阵
    
        renderer.setSize(window.innerWidth , window.innerHeight-1);
        renderer.setPixelRatio(window.devicePixelRatio);
    };
}

