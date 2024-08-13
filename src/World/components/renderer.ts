import { WebGLRenderer } from "three";


export function createRenderer(width: number, height: number) {
    const renderer = new WebGLRenderer({ 
        antialias: true, // 抗锯齿
        precision: "highp", // highp 精度, mediump 精度,lowp 精度
     });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // 像素比率
    return renderer
}
