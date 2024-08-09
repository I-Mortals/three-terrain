import { WebGLRenderer } from "three";


export function createRenderer(width: number, height: number) {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // 像素比率
    return renderer
}
