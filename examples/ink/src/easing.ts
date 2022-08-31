export type EaseFunc = (c: number, t: number, d: number, b: number) => number;

export module EaseFuncs {
  export const linear: EaseFunc = (c,t,d,b) => c * t / d + b;
  export const easeOutCubic: EaseFunc = (c,t,d,b) => c * ((t = t / d - 1) * t * t + 1) + b;
  export const easeInQuad: EaseFunc = (c,t,d,b) => c * (t /= d) * t + b;
  export const easeOutQuad: EaseFunc = (c,t,d,b) => -c * (t /= d) * (t - 2) + b;
  export const easeInOutQuad: EaseFunc = (c,t,d,b) => ((t /= d / 2) < 1) 
    ? c / 2 * t * t + b 
    : -c / 2 * ((--t) * (t - 2) - 1) + b;
  export const easeInCubic: EaseFunc = (c,t,d,b) => c * (t /= d) * t * t + b;
  export const easeInOutCubic: EaseFunc = (c,t,d,b) => ((t /= d / 2) < 1) 
    ? c / 2 * t * t * t + b 
    : c / 2 * ((t -= 2) * t * t + 2) + b;
}
