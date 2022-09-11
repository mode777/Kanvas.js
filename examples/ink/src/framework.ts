export class EventHandler<T> {
    handlers: ((e: T) => void)[] = []
    subscribe(cb: (ctx: T) => void) {
        this.handlers.push(cb)
    }
    dispatch(e: T) {
        for (const cb of this.handlers) {
            cb(e)
        }
    }
}

export class KvsFramework {
    public onRender = new EventHandler<CanvasRenderingContext2D>();
    public onUpdate = new EventHandler<void>();
    public onResize = new EventHandler<[number,number]>();
    public readonly context: CanvasRenderingContext2D;
    public readonly mouse: KvsMouse
    public readonly screen: KvsScreen
    public readonly time: KvsTime

    constructor(private canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d');
        this.screen = new KvsScreen(canvas.width,canvas.height);
        this.mouse = new KvsMouse(canvas);
        this.time = new KvsTime(0);
        const af = (time) => {
            this.time.update(time)
            this.loop();
            requestAnimationFrame(af)
        }
        requestAnimationFrame(af);
    }

    private loop() {
        if(this.canvas.width !== this.screen.width || this.canvas.height !== this.screen.height){
            this.screen.width = this.canvas.width
            this.screen.height = this.canvas.height
            this.onResize.dispatch([this.canvas.width,this.canvas.height])
        }
        this.onUpdate.dispatch()
        this.context.clearRect(0, 0, this.screen.width, this.screen.height)
        this.onRender.dispatch(this.context)
        this.context.resetTransform()
    }
}

interface Timer {
    targetTime?: number,
    targetCondition?: () => boolean
    callback: Function
} 

class KvsTime {
    private timers: Timer[] = []
    
    constructor(public elapsed: number){}

    async wait(t: number){
        return new Promise<void>((res) => {
            this.timers.push({ targetTime: this.elapsed+t, callback: res})
        })
    }

    async waitFor(predicate: () => boolean){
        return new Promise<void>((res) => {
            this.timers.push({ targetCondition: predicate, callback: res})
        })
    }

    update(t){
        this.elapsed = t
        for (let i = this.timers.length-1; i >= 0; i--) {
            const t = this.timers[i];            
            if((t.targetTime && t.targetTime <= this.elapsed) || 
                t.targetCondition && t.targetCondition()){
                t.callback()
                this.timers.splice(i,1);
            }
        }
    }
}

class KvsMouse {
    constructor(private canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousemove", (ev) => { this.x = ev.offsetX; this.y = ev.offsetY });
        canvas.addEventListener("mouseup", (ev) => this.buttons[ev.button] = false);
        canvas.addEventListener("mousedown", (ev) => this.buttons[ev.button] = true);
    }
    public x = 0;
    public y = 0;
    public buttons = [false, false, false]

    waitClick(){
        return waitForEvent('click', this.canvas)
    }
}

class KvsScreen {
    constructor(public width: number, public height: number){}
}

let framework: KvsFramework

export let Mouse: KvsMouse
export let Screen: KvsScreen
export let Time: KvsTime

export function KvsInit(canvas: HTMLCanvasElement) {
    framework = new KvsFramework(canvas);
    Mouse = framework.mouse
    Time = framework.time
    Screen = framework.screen
}

export function onRender(fn: (ctx: CanvasRenderingContext2D) => void){
    framework.onRender.subscribe(fn);
}

export function onResize(fn: (size: [number,number]) => void){
    framework.onResize.subscribe(fn);
}

export function waitForEvent<T extends Event>(name: string, target: EventTarget = window, predicate?: (ev: T) => boolean) {
    return new Promise<T>((res, rej) => {
        const handler = (ev) => {
            if (!predicate || predicate(ev)) {
                res(ev);
                removeEventListener(name, handler)
            }
        }
        addEventListener(name, handler);
    })
}

export async function waitKey(keys?: string[]) {
    var ev = await waitForEvent<KeyboardEvent>("keydown", window, ev => !keys || keys.findIndex(x => x === ev.key) != -1)
    return ev.key;
}

