console.log("hallo welt")
var contents = '{"inkVersion":20,"root":[["^Once upon a time...","\\n",["ev",{"^->":"0.2.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":"0.c-0","flg":18},{"s":["^There were two choices.",{"->":"$r","var":true},null]}],["ev",{"^->":"0.3.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":"0.c-1","flg":18},{"s":["^There were four lines of content.",{"->":"$r","var":true},null]}],{"c-0":["ev",{"^->":"0.c-0.$r2"},"/ev",{"temp=":"$r"},{"->":"0.2.s"},[{"#n":"$r2"}],"\\n",{"->":"0.g-0"},{"#f":5}],"c-1":["ev",{"^->":"0.c-1.$r2"},"/ev",{"temp=":"$r"},{"->":"0.3.s"},[{"#n":"$r2"}],"\\n",{"->":"0.g-0"},{"#f":5}],"g-0":["^They lived happily ever after.","\\n","end",["done",{"#f":5,"#n":"g-1"}],{"#f":5}]}],"done",{"#f":1}],"listDefs":{}}'
var story = new inkjs.Story(contents);
while(story.canContinue){
    while (story.canContinue) {
        console.log(story.Continue());
    }
    if( story.currentChoices.length > 0 )
    {
        for (var i = 0; i < story.currentChoices.length; i++) {
            var choice = story.currentChoices[i];
            console.log("Choice " + (i + 1) + ". " + choice.text);
        }
        story.ChooseChoiceIndex(0);
    }
}

var x = 100
var y = 100

requestAnimationFrame(function() {
    vg.beginPath();
    vg.rect(x++,y++, 120,30);
    vg.fillColor(255,192,0,255);
    vg.fill();
})