import { Camera, Clock, Scene, WebGLRenderer } from "three";

export class Loop {
    camera: Camera;
    scene: Scene;
    renderer: WebGLRenderer;
    updatables: any[] = [];
    clock = new Clock();


    constructor(camera: Camera, scene: Scene, renderer: WebGLRenderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.tick();
            this.renderer.render(this.scene, this.camera)
        })
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }
    tick() {
        // 每帧只调用一次getDelta函数
        const delta = this.clock.getDelta();
        // todo 计算每个对象的tick
        
        if (this.updatables.length < 1) return
        for (const object of this.updatables) {
            object.tick(delta);
        }
    }
}

