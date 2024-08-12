import { DirectionalLight, MathUtils, PMREMGenerator, PlaneGeometry, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderTarget, WebGLRenderer } from "three";
import { Sky, Water } from "three/examples/jsm/Addons.js";

export class WaterSystem {
    water: Water;
    parameters = {
        elevation: 2,
        azimuth: 180
    };
pmremGenerator:PMREMGenerator;
renderTarget:WebGLRenderTarget<Texture>|undefined = undefined;

    constructor(directionalLight: DirectionalLight, renderer: WebGLRenderer) {
        const waterGeometry = new PlaneGeometry(10000, 10000, )
        this.water  = new Water(waterGeometry, {
            textureWidth:512,
            textureHeight:512,
            waterNormals: new TextureLoader().load('textures/waternormals.jpg', (texture) => {
                texture.wrapS = texture.wrapT = RepeatWrapping
            }),
            sunDirection: directionalLight.position, // 阳光方向
            sunColor: directionalLight.color, // 阳光颜色
            waterColor: 0x001e0f, // 水面颜色
            distortionScale: 3.7, // 扭曲程度
            fog: false // 是否开启雾化
        })
        this.pmremGenerator =  new PMREMGenerator( renderer )
    }
    getWater() {
        return this.water
    }
    /*
创建了一个预计算辐射度环境贴图（pre-computed radiance environment map，PMREM）生成器。
PMREMGenerator 是 Three.js 物体材质中用于实现基于物理的渲染（PBR）的重要组件之一。

在 Three.js 中，PBR 材质需要使用辐射度环境贴图来提供场景的照明信息，
而预计算辐射度环境贴图是一种预先计算和缓存辐射度环境贴图的技术，可以提高实时渲染的效率和质量。

通过传递渲染器对象作为参数，PMREMGenerator 可以根据当前场景和光照计算出辐射度环境贴图，
并将其缓存在内存中，方便后续使用。在使用 PBR 材质时，
我们可以通过调用 PMREMGenerator 的相关方法来获取需要的辐射度环境贴图。

*/ 
    updateSun(sun: Vector3, scene: Scene,  sky:Sky) {
        //将 phi 和 theta 转换为弧度制
          const phi = MathUtils.degToRad( 90 - this.parameters.elevation );
          const theta = MathUtils.degToRad( this.parameters.azimuth );
        // 计算太阳位置
          sun.setFromSphericalCoords( 1, phi, theta );
        // 将太阳位置应用到天空和水面
          sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
          this.water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
        // 释放之前的渲染
          if ( this.renderTarget !== undefined ) this.renderTarget.dispose();
        //使用 fromScene 方法从 sky 中生成一个新的渲染目标对象。
        //这个渲染目标对象是通过预计算辐射度环境贴图生成器 pmremGenerator 计算出来的
          this.renderTarget = this.pmremGenerator.fromScene( scene );
        //将渲染目标的材质设置为场景的环境贴图。
          scene.environment = this.renderTarget.texture;
      }
}