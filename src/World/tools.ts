
/**
 * 根据顶点噪声调整颜色
 * @param color 颜色值0-255
 * @param peak 顶点噪声
 * @param factor 颜色缩小因子,控制噪声对颜色值的影响
 * @returns 
 */
export function adjustColor(color:number, peak:number ,factor:number) {
    let adjustedRed = color * (1 + factor * peak / 255);
    return Math.max(0, Math.min(255, adjustedRed));
}
