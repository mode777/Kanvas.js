export interface NodeProperties {
    enabled: boolean
}

interface Listener {
    target: Node,
    receiver: Function,
}

export class Node {
    public readonly children = []
    private readonly lookup: {[key: string]: Node } = {}
    private readonly listeners: {[key: string]: Listener[] } = {}
    public enabled: boolean
    protected root: Node;
    
    constructor(public readonly id: string, public parent: Node = null, properties: Partial<NodeProperties> = {}){
        Object.keys(properties).forEach(key => {
            this[key] = properties[key]
        });
        parent?.addChild(this);
    }

    connect(signal: string, target: Node, receiver: Function){
        let listeners = this.listeners[signal] 
        if(!listeners){
            listeners = this.listeners[signal] = []
        }
        listeners.push({ receiver, target })
    }

    emit(signal: string, ...args: any){
        const list = this.listeners[signal]
        if(list) {
            for (const l of list) {
                l.receiver.apply(l.target, args)
            }
        }
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

    getNode<T extends Node>(path: string): T{
        if(path[0] === '/') return <T>this.root.getNode(path.substring(1));
        else return <T>this.getNodeArr(path.split('/'));
    }

    iterate(fn: (node: Node) => void){
        fn(this)
        for (const child of this.children) {
            fn(child)
        }
    }
}
