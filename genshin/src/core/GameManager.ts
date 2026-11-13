import { EventEmitter, MathUtils } from "../libs/xviewer";

class TaskManager {
    private _taskCount: number = 0;
    private _taskFinished: number = 0;
    private _resolve: Promise<void> = Promise.resolve();
    private _progress: number = 0;

    public get progress() {
        return this._progress;
    }

    public task(handle: Function | Promise<any>, { name = "", weight = 1 } = {}) {
        this._regist(weight);
        return this._resolve
            .then(() => typeof handle === "function" ? handle() : handle)
            .then(() => this._finish(weight, name))
            .catch(err => {
                this._finish(weight, name);
                console.error(err);
            });
    }

    public reset() {
        this._taskCount = 0;
        this._taskFinished = 0;
        this._progress = 0;
    }

    private _finish(w: number, name: string) {
        this._taskFinished += w;
        this._progress = MathUtils.clamp01(Math.max(this._progress, this._taskFinished / this._taskCount))
    }

    private _regist(w: number) {
        this._taskCount = Math.max(1, this._taskCount + w);
    }
}

class GameManager extends EventEmitter {
    public taskManger: TaskManager = new TaskManager();
    public restartCount: number = 0;

    public reset() {
        this.clear();
        this.taskManger.reset();
        this.taskManger = new TaskManager();
    }

    public get progress() {
        return this.taskManger.progress;
    }

    public restart() {
        // 交互终点：点击进入 → 穿门白光结束后，跳转到第二个项目「Offerbiu 开发历程」
        goToHistory();
    }
    public task(handle: Function | Promise<any>, props = {}) {
        return this.taskManger.task(handle, props);
    }
}

export const gameManager = new GameManager();

// ---------------- 跳转到 Offerbiu 开发历程（/history/） ----------------
// history 由根目录 `npm start` 预先构建到 genshin/public/history，和本页同一个服务器、同一个地址。
export const HISTORY_URL = import.meta.env.BASE_URL + "history/";

/** 提前预取 history 页面，穿门时切换更快 */
export function prefetchHistory() {
    if (document.querySelector('link[data-history-prefetch]')) return;
    const link = document.createElement("link");
    link.rel = "prefetch"; link.href = HISTORY_URL; link.dataset.historyPrefetch = "1";
    document.head.appendChild(link);
}

let leaving = false;
/** 白屏（接住穿门白光）→ 跳转；history 页检测到标记后从白色淡入 */
export function goToHistory() {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem("offerbiu-gate", String(Date.now())); } catch { /* 隐私模式忽略 */ }
    const veil = document.createElement("div");
    veil.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;opacity:0;transition:opacity .45s ease;pointer-events:none";
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.style.opacity = "1"; }));
    // 背景音乐渐弱
    document.querySelectorAll("audio").forEach((a) => { const v0 = a.volume; let k = 1; const id = setInterval(() => { k -= 0.1; a.volume = Math.max(0, v0 * k); if (k <= 0) clearInterval(id); }, 40); });
    setTimeout(() => window.location.assign(HISTORY_URL), 500);
}