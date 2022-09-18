export let SPEEDUP = false

addEventListener('keydown', (ev) => {
    if(ev.key === 'q'){
        SPEEDUP = true
    }
});

addEventListener('keyup', (ev) => {
    if(ev.key === 'q'){
        SPEEDUP = false
    }
});