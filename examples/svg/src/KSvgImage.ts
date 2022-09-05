import { DOMParser } from 'xmldom';

interface KSvgElement {
  type: string
  render: (ctx: CanvasRenderingContext2D, el: KSvgElement) => void;
}

interface KSvgContainer extends KSvgElement {
  children: KSvgElement[]
}

interface KSvgGElement extends KSvgContainer {
  fill: string,
  stroke: string,
  lineWidth: number
}

interface KSvgPath extends KSvgElement {
  d: Path2D
  fill: string,
  stroke: string,
  lineWidth: number
}

export class KSvgImage {

  private fill: string = null;
  private stroke: string = null;
  private lineWidth: number = null;
  private svg: KSvgContainer = null;

  async load(path: string) {
    const res = await fetch(path);
    const text = await res.text();
    const parser = new DOMParser();
    const dom = parser.parseFromString(text);
    this.svg = this.parseSvg((<unknown>dom.documentElement) as SVGElement);
    return this;
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.renderSvg(ctx, this.svg);
  }

  private renderSvg(ctx: CanvasRenderingContext2D, el: KSvgContainer) {
    for (const c of el.children) {
      c.render.apply(this, [ctx, c]);
    }
  }

  private parseSvg(element: SVGElement): KSvgContainer {
    return {
      type: element.nodeName,
      children: this.parseChildren(element),
      render: this.renderSvg
    };
  }

  private renderG(ctx: CanvasRenderingContext2D, el: KSvgGElement) {
    const ofill = this.fill;
    const ostroke = this.stroke;
    const oline = this.lineWidth;
    this.fill = el.fill;
    this.stroke = el.stroke;
    this.lineWidth = el.lineWidth;
    for (const c of el.children) {
      c.render.apply(this, [ctx, c]);
    }
    this.fill = ofill;
    this.stroke = ostroke;
    this.lineWidth = oline;
  }

  private parseG(element: SVGGElement): KSvgGElement {
    const stroke = element.getAttribute("stroke");
    const fill = element.getAttribute("fill");
    const lineWidth = parseFloat(element.getAttribute("stroke-width"));

    return {
      type: element.nodeName,
      lineWidth: !isNaN(lineWidth) ? lineWidth : null,
      stroke: (stroke != "" && stroke !== 'none') ? stroke : null,
      fill: fill != "" ? fill : null,
      children: this.parseChildren(element),
      render: this.renderG
    };
  }

  private renderPath(ctx: CanvasRenderingContext2D, el: KSvgPath) {
    //ctx.fillStyle = "#000"
    //ctx.fill(el.d)
    const fill = el.fill ?? this.fill;
    const stroke = el.stroke ?? this.stroke;
    const lineWidth = el.lineWidth ?? this.lineWidth ?? 1;

    //console.log(fill, stroke)

    if (fill && stroke) {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.fill(el.d);
      ctx.stroke(el.d);
    } else if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(el.d);
    } else if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke(el.d);
    }
  }

  private parseStyle(style: string){
    if(!style || style === '') return {}
    return style.split(';').reduce((p,c,i) => {
      const kv = c.split(':')
      if(kv[1] !== 'none') p[kv[0]] = kv[1]
      return p;
    }, {})
  }

  private parsePath(element: SVGPathElement) {
    const style = this.parseStyle(element.getAttribute("style"))
    const lineWidth = parseFloat(style["stroke-width"]);
    
    const p = new Path2D(element.getAttribute("d"));
    return {
      lineWidth: !isNaN(lineWidth) ? lineWidth : null,
      stroke: style["stroke"],
      fill: style["fill"],
      type: element.nodeName,
      d: p,
      render: this.renderPath
    };
  }

  private parseElement(element: ChildNode): KSvgElement {
    switch (element.nodeName) {
      case 'g':
        return this.parseG(element as SVGAElement);
      case 'path':
        return this.parsePath(element as SVGPathElement);
    }
  }

  private parseChildren(element: ChildNode) {
    const cn = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const el = element.childNodes[i];
      var c = this.parseElement(el);
      if (c)
        cn.push(c);
    }
    return cn;
  }
}
