// console.log("hallo welt")
// var contents = '{"inkVersion":20,"root":[["^Once upon a time...","\\n",["ev",{"^->":"0.2.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":"0.c-0","flg":18},{"s":["^There were two choices.",{"->":"$r","var":true},null]}],["ev",{"^->":"0.3.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":"0.c-1","flg":18},{"s":["^There were four lines of content.",{"->":"$r","var":true},null]}],{"c-0":["ev",{"^->":"0.c-0.$r2"},"/ev",{"temp=":"$r"},{"->":"0.2.s"},[{"#n":"$r2"}],"\\n",{"->":"0.g-0"},{"#f":5}],"c-1":["ev",{"^->":"0.c-1.$r2"},"/ev",{"temp=":"$r"},{"->":"0.3.s"},[{"#n":"$r2"}],"\\n",{"->":"0.g-0"},{"#f":5}],"g-0":["^They lived happily ever after.","\\n","end",["done",{"#f":5,"#n":"g-1"}],{"#f":5}]}],"done",{"#f":1}],"listDefs":{}}'
// var story = new inkjs.Story(contents);
// while(story.canContinue){
//     while (story.canContinue) {
//         console.log(story.Continue());
//     }
//     if( story.currentChoices.length > 0 )
//     {
//         for (var i = 0; i < story.currentChoices.length; i++) {
//             var choice = story.currentChoices[i];
//             console.log("Choice " + (i + 1) + ". " + choice.text);
//         }
//         story.ChooseChoiceIndex(0);
//     }
// }

vg.createFont("sans", "assets/fonts/Roboto/Roboto-Regular.ttf");
vg.createFont("sans-bold", "assets/fonts/Roboto/Roboto-Bold.ttf");



function drawTriangle(x1,y1,x2,y2,x3,y3,color){
    vg.beginPath()
    vg.moveTo(x1,y1)
    vg.lineTo(x2,y2)
    vg.lineTo(x3,y3)
    vg.closePath()
    vg.fillColor(color)
    vg.fill()
}

function sinval(t,s,a){
    return Math.sin(t*s) * a
}

requestAnimationFrame(function(time) {
    vg.beginPath()
    vg.rect(0,0, 640,480)
    vg.fillColor("#FFF1E8")
    vg.fill()

    vg.translate(80, 175 + sinval(time,2,20))
    
    drawTriangle(0,0,100,0,50,50,"#FF004D")
    drawTriangle(0,0,50,50,0,100,"#00E436")
    drawTriangle(50,50,100,100,0,100,"#29ADFF")

    vg.fontFace("sans-bold")
    vg.fontSize(100)
    //vg.fontAlign(vg.TOP | vg.CENTER)
    
    vg.fillColor("#00000066")
    vg.fontBlur(15)
    vg.text(120,85,"Kanvas")
    vg.fillColor("#000")
    vg.fontBlur(0)
    vg.text(120,85,"Kanvas")

})