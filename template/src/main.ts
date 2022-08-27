import 'core-js/actual';

(async function main(){

  function loop(time: number){
    console.log(time)
  }

  requestAnimationFrame(loop);
})();
