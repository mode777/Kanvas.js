export type EaseFunc = (c: number, t: number, d: number, b: number) => number;

export module EaseFuncs {
  export const linear: EaseFunc = (c,t,d,b) => c * t / d + b;
  export const easeInQuad: EaseFunc = (c,t,d,b) => c * (t /= d) * t + b;
  export const easeOutQuad: EaseFunc = (c,t,d,b) => -c * (t /= d) * (t - 2) + b;
  export const easeInOutQuad: EaseFunc = (c,t,d,b) => ((t /= d / 2) < 1) 
  ? c / 2 * t * t + b 
  : -c / 2 * ((--t) * (t - 2) - 1) + b;
  export const easeInCubic: EaseFunc = (c,t,d,b) => c * (t /= d) * t * t + b;
  export const easeOutCubic: EaseFunc = (c,t,d,b) => c * ((t = t / d - 1) * t * t + 1) + b;
  export const easeInOutCubic: EaseFunc = (c,t,d,b) => ((t /= d / 2) < 1) 
    ? c / 2 * t * t * t + b 
    : c / 2 * ((t -= 2) * t * t + 2) + b;
}

export function tweenValue(from: number, to: number, duration: number, func: EaseFunc, setter: (x) => void){
  const delta = to - from;
  let time = 0;
  let startTime = -1;
  let resolve: any;
  const loop = t => {
    if(startTime === -1) startTime = t;
    time = (t-startTime);
    const val = func(delta, time, duration, from);
    if(time >= duration){
      setter(to);
      resolve();
    }
    else {
      setter(val);
      requestAnimationFrame(loop);
    }
  }
  return new Promise<void>((res,rej) => {
    resolve = res;
    requestAnimationFrame(loop);
  })
}