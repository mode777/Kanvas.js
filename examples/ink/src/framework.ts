export class EventHandler<T> {
    handlers: ((e: T)=>void)[] = []
    subscribe(cb: (ctx: T) => void) {
        this.handlers.push(cb)
    }
    dispatch(e :T){
        for (const cb of this.handlers) {
            cb(e)
        }
    }
}


export interface NodeLike {
    attached?()
    update?()
    ready?()
    input?()
    unhandledInput?()

}


export interface NodeProperties {
    enabled: boolean
}

export class Node {
    public readonly children = []
    private readonly lookup: {[key: string]: Node } = {}
    private enabled: boolean
    private root: Node;
    
    constructor(public readonly id: string, public parent: Node = null, properties: Partial<NodeProperties> = {}){
        Object.getPrototypeOf(this).properties.forEach(key => {
            this[key] = properties[key]
        });
        parent?.addChild(this);
    }

    private getRoot(){
        return this.parent?.getRoot() ?? this
    }

    private addChild(c: Node){
        this.children.push(c)
        this.lookup[c.id] = c
        c.root = this.getRoot();
    }

    getNodeArr(pathFrags: string[]) : Node {
        if(pathFrags.length === 0) return this;
        const id = pathFrags.shift()
        if(id === '..') return this.parent?.getNodeArr(pathFrags)
        else if(id === '.') return this.getNodeArr(pathFrags)
        else  return this.lookup[id]?.getNodeArr(pathFrags)
    }

    getNode<T extends Node>(path: string){
        if(path[0] === '/') return <T>this.root.getNode(path.substring(1));
        else return <T>this.getNodeArr(path.split('/'));
    }
}

export class Framework {

    public readonly context: CanvasRenderingContext2D;
    public readonly renderer: Renderer
    public readonly mouse: Mouse
    public time: number
    public width: number
    public height: number

    constructor(private canvas: HTMLCanvasElement){
        this.context = canvas.getContext('2d');
        this.renderer = new Renderer(this);
        this.mouse = new Mouse(canvas);
        const af = (time) => {
            this.time = time
            this.loop();
            requestAnimationFrame(af)
        }
        requestAnimationFrame(af);
    }

    async waitKey(keys?: string[]) {
        var ev = await this.waitForEvent<KeyboardEvent>("keydown", window, ev => !keys || keys.findIndex(x => x === ev.key) != -1)
        return ev.key;
    }

    waitForEvent<T extends Event>(name: string, target: EventTarget = window, predicate?: (ev: T) => boolean) {
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

    private loop(){
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.renderer.render();
    }
}

class Mouse {
    constructor(canvas: HTMLCanvasElement) {
      canvas.addEventListener("mousemove", (ev) => { this.x = ev.offsetX; this.y = ev.offsetY });
      canvas.addEventListener("mouseup", (ev) => this.buttons[ev.button] = false);
      canvas.addEventListener("mousedown", (ev) => this.buttons[ev.button] = true);
    }
    public x = 0;
    public y = 0;
    public buttons = [false, false, false]
  }

class Renderer {

    public onRender = new EventHandler<CanvasRenderingContext2D>();
    

    constructor(private fw: Framework){
        
    }

    public render(){
        this.fw.context.clearRect(0,0,this.fw.width,this.fw.height)
        this.onRender.dispatch(this.fw.context)
        this.fw.context.resetTransform()
    }
}