import { FBXLoader } from "three/examples/jsm/Addons.js";
import { Loop } from "../systems/Loop";
import { AnimationMixer, Scene } from "three";

export class Player {

    constructor(loop: Loop, scene:Scene) {
        const loader = new FBXLoader();
        loader.load("models/FastRun.fbx", (fbx) => {
            const model = fbx
            model.scale.set(0.02, 0.02, 0.02);
            model.position.set(0, 0.01, 0);
            scene.add(model);

            // 创建动画混合器
            const mixer = new AnimationMixer(model);
            fbx.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            })

            loop.updatables.push({
                model: model,
                tick: ((delta: number) => {
                    if (mixer) {
                        mixer.update(delta); // 更新动画
                    }
                })
            })
        })
    }

    move(){

    }
}