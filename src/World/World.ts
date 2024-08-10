import { AnimationMixer, BoxGeometry, Camera, Color, DirectionalLight, MathUtils, Mesh, MeshNormalMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls, ImprovedNoise, FBXLoader, } from "three/addons";
import { Loop } from "./systems/Loop";
import { Resizer } from "./systems/Resize";
import { createStats } from "./components/stats";


export class World {

    camera: PerspectiveCamera;
    scene: Scene;
    renderer: WebGLRenderer;
    container: HTMLElement;
    loop: Loop;


    // 射线
    raycaster = new Raycaster();
    pointer = new Vector2();


    // 世界大小
    worldWidth = 256
    worldDepth = 256

    // 世界半径
    worldHalfWidth = this.worldWidth / 2
    worldHalfDepth = this.worldDepth / 2;

    stats = createStats();
    

    constructor(container: HTMLElement, camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer) {

        this.container = container
        this.camera = camera
        this.scene = scene
        this.renderer = renderer

        this.loop = new Loop(this.camera, this.scene, this.renderer);

        // 检查子节点数量并替换第一个子节点
        if (container.childNodes.length <= 0) {
            container.appendChild(renderer.domElement);
        } else {
            container.replaceChild(renderer.domElement, container!.childNodes[0]);
        }

        this.init()
        const resizer = new Resizer(container, camera, renderer, () => {

        });
    }


    // 初始化
    init() {

        console.log("init");

        // 每个对象最初都是在(0,0,0)处创建的,让摄像机向后移动来查看场景
        this.camera.position.set(0, 0, 50);

        const terrain = this.planeMesh();
        const boxMashObj = this.boxMesh(new Vector3(2, 2, 2));

        this.scene.add(boxMashObj);
        boxMashObj.position.set(0, 0, 0);

        terrain.position.set(0, 0, 0);
        terrain.rotation.x = -Math.PI / 2;
        this.scene.add(terrain);

        // 将度数转换为弧度
        const radiansPerSecond = MathUtils.degToRad(30);

        this.loop.updatables.push({
            tick: ((delta: number) => {
                this.stats.update()
            })
        })

        this.loop.updatables.push({
            mash: boxMashObj,
            tick: ((delta: number) => {
                boxMashObj.rotation.x += radiansPerSecond * delta;
            })
        });

        const directionalLight = new DirectionalLight(0xffffff, 8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);



        this.loop.start()
        this.controls()
        // 监听鼠标移动
        this.container.addEventListener('pointermove', this.onPointerMove);

        
        
    }

    // 相机控制
    controls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 0;
        controls.maxDistance = 10000;
        controls.maxPolarAngle = Math.PI / 2;
        this.camera.position.y = controls.target.y + 10;
        // this.camera.position.x = 10;
        controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onPointerMove = (event: PointerEvent) => {

        this.pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        // this.raycaster.setFromCamera(this.pointer, this.camera);

        //看看从摄像机进入世界的光线是否击中了我们的一个网格
        // const intersects = raycaster.intersectObject(boxMashObj);
    }

    // 生成高度
    generateHeight(width: number, height: number) {

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


    // mesh
    boxMesh = (size: Vector3) => {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshNormalMaterial();
        return new Mesh(geometry, material);
    }

    planeMesh = () => {
        const geometry = new PlaneGeometry(50, 50, this.worldWidth - 1, this.worldDepth - 1);
        const material = new MeshNormalMaterial();
        return new Mesh(geometry, material);
    }
}
