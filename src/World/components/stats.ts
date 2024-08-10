import Stats from "three/examples/jsm/libs/stats.module.js";

export function createStats() {
    const stats = new Stats();
    stats.showPanel(0);
    if (!document.getElementById("stats")) {
        const statsDom = document.createElement("div");
        statsDom.id="stats";
        statsDom.appendChild(stats.dom);
        document.body.appendChild(statsDom);
    }
    return stats
}