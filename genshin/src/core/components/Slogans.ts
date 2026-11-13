import { Component, Vector3 } from "../../libs/xviewer";
import { gameManager } from "../GameManager";
import "./Slogans.less";

// 道路两侧漂浮的标语：「找工作」「找实习」「上 offerbiu」
// 文字是 DOM（清晰、可用中文衬线字体），位置锚定在 3D 场景里，每帧用相机投影到屏幕，
// 所以会随镜头前进由远及近、带透视缩放，并轻轻上下浮动。pointer-events: none，不挡任何点击。

type Kind = "left" | "right" | "banner";
interface Label {
    el: HTMLDivElement;
    pos: Vector3;
    kind: Kind;
    phase: number;
    alpha: number;     // 当前不透明度
    target: number;    // 目标不透明度
    size: number;      // 世界尺寸系数
    recycle: boolean;  // 行进时是否循环到前方
}

const ROAD_Y = -34;            // 路面高度（Road 的偏移）
const GAP = 210;               // 行进时每组标语的间距
const GROUPS = 3;
const ROAD_LEN = 424.8054;     // Road.zLength * (1 + extendNum)
const __v = new Vector3();

function makeEl(kind: Kind, text: string) {
    const el = document.createElement("div");
    el.className = `slogan slogan-${kind}`;
    if (kind === "banner") {
        el.innerHTML = `<div class="plaque"><span class="b-shang">上</span><span class="b-brand">offerbiu</span></div>`;
    } else {
        el.innerHTML = `<div class="plaque"><span class="txt">${text}</span></div>`;
    }
    return el;
}

export class Slogans extends Component {
    private layer!: HTMLDivElement;
    private labels: Label[] = [];
    private t = 0;
    private show = 0;          // 整体显隐（0..1）
    private showTarget = 0;
    private walking = true;
    private offs: Function[] = [];

    onLoad(): void {
        const host = document.querySelector(".webgl-wrapper") || document.getElementById("root")!;
        this.layer = document.createElement("div");
        this.layer.className = "slogan-layer";
        this.layer.setAttribute("aria-hidden", "true");
        host.appendChild(this.layer);

        // 行进段：道路两侧成对漂浮，左「找工作」、右「找实习」，随镜头前进循环出现
        for (let k = 0; k < GROUPS; k++) {
            const z = -240 - k * GAP;
            this.add("left", "找工作", new Vector3(-66, ROAD_Y + 44, z), 1, true);
            this.add("right", "找实习", new Vector3(66, ROAD_Y + 44, z), 1, true);
        }

        const on = (name: string, fn: (...a: any[]) => void) => { gameManager.on(name, fn, this); this.offs.push(() => gameManager.off(name, fn, this)); };
        on("preloaded", () => setTimeout(() => { this.showTarget = 1; }, 900));
        setTimeout(() => { this.showTarget = 1; }, 6000); // 兜底：万一错过 preloaded 事件
        on("showDoor", (zOffset: number) => this.toDoor(zOffset));
        on("doorCreate", () => this.labels.forEach((l) => { if (!l.recycle) l.target = 1; }));
        on("openDoor", () => { this.showTarget = 0; this.layer.classList.add("leaving"); });
        this.labels.forEach((l) => (l.target = 1));
    }

    private add(kind: Kind, text: string, pos: Vector3, size: number, recycle: boolean) {
        const el = makeEl(kind, text);
        this.layer.appendChild(el);
        const l: Label = { el, pos, kind, phase: Math.random() * Math.PI * 2, alpha: 0, target: 0, size, recycle };
        this.labels.push(l);
        return l;
    }

    // 镜头停在门前：行进标语淡出，换成门两侧的「对联」+ 门上方的「横批」
    private toDoor(zOffset: number) {
        this.walking = false;
        this.labels.forEach((l) => (l.target = 0));
        const doorZ = zOffset - ROAD_LEN - 14;
        this.add("left", "找工作", new Vector3(-62, ROAD_Y + 52, doorZ + 40), 1.2, false);
        this.add("right", "找实习", new Vector3(62, ROAD_Y + 52, doorZ + 40), 1.2, false);
        this.add("banner", "", new Vector3(0, ROAD_Y + 116, doorZ + 10), 1.15, false);
    }

    update(dt: number): void {
        if (!this.layer) return;
        dt = Math.min(dt, 0.1);
        this.t += dt;
        this.show += (this.showTarget - this.show) * Math.min(1, dt * (this.showTarget ? 1.6 : 6));
        const cam = this.viewer.camera;
        cam.updateMatrixWorld();
        const W = this.layer.clientWidth, H = this.layer.clientHeight;
        if (!W || !H) return;
        this.layer.style.fontSize = `${H / 100}px`;
        const halfTan = Math.tan(((cam as any).fov * Math.PI) / 360);

        for (const l of this.labels) {
            if (this.walking && l.recycle && l.pos.z > cam.position.z - 30) l.pos.z -= GROUPS * GAP;
            l.alpha += (l.target - l.alpha) * Math.min(1, dt * 2.2);
            __v.copy(l.pos);
            __v.y += Math.sin(this.t * 0.9 + l.phase) * 2.2;
            __v.x += Math.sin(this.t * 0.55 + l.phase * 1.7) * 0.8;
            const d = __v.distanceTo(cam.position);
            __v.project(cam);
            // 距离淡入淡出：远处慢慢出现，太近时淡掉，避免糊脸
            const far = 1 - Math.min(1, Math.max(0, (d - 520) / 160));
            const near = Math.min(1, Math.max(0, (d - 60) / 70));
            const a = l.alpha * this.show * far * near;
            if (__v.z > 1 || a < 0.01) { l.el.style.opacity = "0"; l.el.style.visibility = "hidden"; continue; }
            const sx = (__v.x * 0.5 + 0.5) * W, sy = (-__v.y * 0.5 + 0.5) * H;
            // 透视缩放：世界高度 → 屏幕占比（按 CSS 基准尺寸换算）
            const worldH = l.kind === "banner" ? 17 : 46;
            const screenFrac = (worldH * l.size) / (2 * d * halfTan);
            const baseFrac = l.kind === "banner" ? 0.1 : 0.3; // CSS 基准尺寸占屏高的比例（banner≈10em，对联≈30em）
            const s = Math.min(1.7, screenFrac / baseFrac);
            l.el.style.visibility = "visible";
            l.el.style.opacity = a.toFixed(3);
            l.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
            l.el.style.zIndex = String(Math.round(10000 - d));
        }
    }

    onDestroy(): void {
        this.offs.forEach((f) => f());
        this.layer?.remove();
    }
}
