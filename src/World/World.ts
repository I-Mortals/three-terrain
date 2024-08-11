import { AnimationMixer, BoxGeometry, Camera, CanvasTexture, ClampToEdgeWrapping, Color, DirectionalLight, DoubleSide, MathUtils, Mesh, MeshLambertMaterial, MeshNormalMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, SRGBColorSpace, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls, ImprovedNoise, FBXLoader, } from "three/addons";
import { Loop } from "./systems/Loop";
import { Resizer } from "./systems/Resize";
import { createStats } from "./components/stats";
import { adjustColor } from "./tools";


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

    directionalLight = new DirectionalLight(0xffffff, 1);


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

        const boxMashObj = this.boxMesh(new Vector3(2, 2, 2));
        this.scene.add(boxMashObj);
        boxMashObj.position.set(0, 0, 0);




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

        // 环境光
        this.directionalLight = new DirectionalLight(0xffffff, 8);
        this.directionalLight.position.set(10, 10, 10);
        this.scene.add(this.directionalLight);



        this.loop.start()
        this.controls()
        // 监听鼠标移动
        this.container.addEventListener('pointermove', this.onPointerMove);

        this.generateTerrain()

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
    // 地形生成
    generateTerrain() {
        // 地形
        const terrain = this.terrainMesh(7000, 7000);

        terrain.position.set(0, 0, 0);
        terrain.rotation.x = -Math.PI / 2;

        const generateData = this.generateHeight(this.worldWidth, this.worldDepth);
        const data = generateData
        // 顶点位置坐标数据
        const vertices = terrain.geometry.attributes.position.array;

        // 改变顶点高度值
        for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            // 缩放噪声的影响，使得高度值更适中，避免过高的突起或者过低的凹陷
            const scalingEffect = 10
            vertices[j + 2] = data[i] * scalingEffect;
        }
        terrain.geometry.computeVertexNormals();

        // 生成纹理
        const texture = new CanvasTexture(this.generateTexture(data, this.worldWidth, this.worldDepth));
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.colorSpace = SRGBColorSpace;
        terrain.material = new MeshLambertMaterial({ map: texture });

        this.scene.add(terrain);

    }

    // 生成高度
    generateHeight(width: number, height: number) {

        const size = width * height
        const data = new Uint8Array(size)
        const perlin = new ImprovedNoise()

        // 随机数
        const z = Math.random() * 100;

        // 控制地面显示效果
        let quality = 1;

        for (let j = 0; j < 4; j++) {

            for (let i = 0; i < size; i++) {

                const x = i % width
                const y = ~ ~(i / width); // 按位取反两次，取整
                // 调整生成的噪声图的振幅 1.75 -> 1.2
                const swing = 1.4
                // 去除边缘
                if (x != 0 && y != 0 && x != width - 1 && y != height - 1) {
                    data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * swing);
                }
            }

            // quality的倍数
            quality *= 5.5;

        }

        return data;

    }

    // 将生成的高度数据转换为纹理
    generateTexture(data: Uint8Array, width: number, height: number) {

        let image, imageData, shade;

        const vector3 = new Vector3(0, 0, 0);

        // 光照向量并归一化
        const sun = new Vector3(1, 1, 1);
        sun.copy(this.directionalLight.position)
        sun.normalize();

        // 创建画布
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.right = '0';
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;

        // 绘制矩形黑色
        let context = canvas.getContext('2d');
        context!.fillStyle = '#000';
        context!.fillRect(0, 0, width, height);

        image = context!.getImageData(0, 0, canvas.width, canvas.height);
        // 获取画布RGBA的1维数组，0~255
        imageData = image.data;

        for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
            // imageData [0,0,0,255, 0,0,0,255, ...]

            // 计算光照的梯度，前两个点和后两个点的颜色差
            vector3.x = data[j - 2] - data[j + 2];
            vector3.y = 2;
            vector3.z = data[j - width] - data[j + width];

            vector3.normalize();

            // 阴影浓度控制
            const shadowIntensity = 0.3
            // 阳光与背阴影,用计算得到的光照梯度与阳光的点积结果
            shade = sun.dot(vector3) < 0 ? shadowIntensity : sun.dot(vector3)


            // 平均高度
            const heightAvg = 0.5
            // 控制噪声对颜色值的影响
            const factor = 2

            if (data[j] < (height / 7.5) * heightAvg) {
                imageData[i] = adjustColor(220 * shade, data[j], factor)
                imageData[i + 1] = adjustColor(190 * shade, data[j], factor)
                imageData[i + 2] = adjustColor(140 * shade, data[j], factor)
            } else if (data[j] < (height / 3) * heightAvg) {
                imageData[i] = adjustColor(10 * shade, data[j], factor)
                imageData[i + 1] = adjustColor(200 * shade, data[j], factor)
                imageData[i + 2] = adjustColor(96 * shade, data[j], factor)
            } else if (data[j] < (height / 2) * heightAvg) {
                imageData[i] = adjustColor(215 * shade, data[j], factor)
                imageData[i + 1] = adjustColor(120 * shade, data[j], factor)
                imageData[i + 2] = adjustColor(80 * shade, data[j], factor)
            } else {
                imageData[i] = adjustColor(200 * shade, data[j], factor)
                imageData[i + 1] = adjustColor(200 * shade, data[j], factor)
                imageData[i + 2] = adjustColor(200 * shade, data[j], factor)
            }

        }
        // 将调整过的RGBA数据内容绘制到canvas
        context!.putImageData(image, 0, 0);

        // 放大4x

        const canvasScaled = document.createElement('canvas');
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;

        context = canvasScaled.getContext('2d');
        context!.scale(4, 4);
        // 将画布内容绘制到canvasScaled
        context!.drawImage(canvas, 0, 0);

        return canvasScaled;

    }


    // mesh
    boxMesh = (size: Vector3) => {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshNormalMaterial();
        return new Mesh(geometry, material);
    }

    terrainMesh = (width: number, hieght: number) => {
        const geometry = new PlaneGeometry(width, hieght, this.worldWidth - 1, this.worldDepth - 1);
        // const material = new MeshNormalMaterial();
        const material = new MeshLambertMaterial({
            color: 0xCAA066,
            side: DoubleSide,
        });


        return new Mesh(geometry, material);
    }
}



/**
左上角为原点，向右为x，向下为y
0,0
——————————————————————————y
|
|
|
|
|
|
|
|
x

 */