# author: Wolfgang Ecke
# title: Der Bildband

@(KNÖDLER set img:women_02 name:'Frau Knödler' flipped:true)
@(SCHATZ set img:man_08 name:'Herr Schatz')

@(title show time:3000)
@(wait time:3000)
@(title hide time:4000) @(scene fade-in img:bg_lib time:4000)

VOICEOVER: Als Frau Knödler den Verlust bemerkte, war es wenige Minuten vor Ladenschluss. Überraschung und Verständnislosigkeit hielten sich zunächst die Waage.
VOICEOVER: Doch je länger sie über das Geschehnis nachdachte, umso mehr geriet sie in eine Stimmung, die man allgemein als ,gerechten Zorn‘ bezeichnet.
VOICEOVER: Und Amanda Knödler, Inhaberin der Bücherei am Kaisereck, rief Herrn Schatz an. Franz Schatz war nicht nur ihr Untermieter, sondern auch Detektiv in einer Versicherung.

@(KNÖDLER enter pos:left) 
@(SCHATZ enter pos:right) 

* [Beruhigen] SCHATZ: Nur immer der Reihe nach, Frau Knödler! Also, wie war das?

- KNÖDLER: Ich hatte den Bildband gerade ausgepackt und dort drüben ins Regal gestellt. 

* [Andere Kunden?] SCHATZ: Wer war außer ihnen noch im Laden?

- KNÖDLER: Im Laden waren nur zwei Kunden: Frau Stolze und Herr Langbein. Beide leihen seit Jahren aus. Sie sind sozusagen Stammkunden meiner Leihbuchabteilung … -> questions

= questions
* [Ausgeliehen?] SCHATZ: Haben die beiden auch heute ausgeliehen?
    KNÖDLER: Ja. Herr Langbein zwei Kriminalromane und Frau Stolze ein Buch über Astrologie. 
    KNÖDLER: Ich musste es ihr heraussuchen, weil sie ihre Brille vergessen hatte. Sie ist ja so kurzsichtig, dass sie nicht einmal ein Fünfmarkstück in ihrer Hand erkennen kann. 
    KNÖDLER: Gerade als ich ihr das Buch gab, klingelte das Telefon …
* [Verstecken?] SCHATZ: Hatten die beiden Herrschaften denn die Möglichkeit, den Bildband unterzubringen?
    KNÖDLER: Ja. Frau Stolze trug eine größere Einkaufstasche, und Herr Langbein …
    KNÖDLER: …ja, Herr Langbein hatte eine Aktenmappe bei sich.
* [Weitere Kunden?] SCHATZ: Kamen nach den beiden noch andere Kunden?
    KNÖDLER: Nein, sie waren die einizgen zu der Zeit
    ** [Bildband] SCHATZ: Und als die beiden gegangen waren fehlte auch der Bildband?
        KNÖDLER: So war es!
* [Verlassen?] SCHATZ: Wer verließ den Laden zuerst?
    KNÖDLER: Zuerst ging Herr Langbein …
* -> 
    SCHATZ: Na schön. Dann geben Sie mir mal jetzt die Adressen der beiden Stammkunden. Mal sehen, was sie zu sagen haben. 
    ->interog
- -> questions

=== interog

@(characters exit)
@(scene fade_out)
@(scene fade_in img:bg_map)

* [Herr Langbein @(pin x:0.3 y:0.3)] -> langbein
* [Frau Stolze @(pin x:0.6 y:0.6)] -> stolze
* { langbein && stolze} [Auflösen] SCHATZ: Meine Mission ist erfüllt. Ich sollte mich ja nur erkundigen … 
    -> solution

=== langbein

VOICEOVER: Herr Langbein blickte misstrauisch durch den Türschlitz

LANGBEIN: Was wollen sie?

* [Vorstellen] SCHATZ: Ich würde gern einmal eintreten, Herr Langbein. Frau Knödler von der Bücherei schickt mich

- LANGBEIN: Bitte, nehmen Sie Platz. Was hat Frau Knödler denn auf dem Herzen? -> questions

= questions
VAR knows = 0
* [Kunde] SCHATZ: Sie sind, wie mir Frau Knödler sagte, ein langjähriger Kunde …
    LANGBEIN: Bin ich …
+ [Aufgefallen?] SCHATZ: Ist Ihnen {|vielleicht doch noch} etwas aufgefallen?
    { not knows: LANGBEIN: { Nicht das ich wüsste. Worum geht es denn bitte? | Wie gesagt: Generell ist mir nichts besonderes aufgefallen. } }
    { knows: Verstehe. Sie wollen wissen, ob ich den Bildband gestohlen habe … Ich war es selbstverständlich nicht. Aber vielleicht sehen Sie sich einmal die Frau an, die mit mir im Laden war … Und jetzt darf ich Sie bitten zu gehen! -> interog }
* [Bildband] SCHATZ: Frau Knödler hat heute Nachmittag einen kostbaren Bildband, Wert hundertzwanzig Mark, ins Regal gestellt. Der ist verschwunden! 
    LANGBEIN: … doch nicht etwa der dicke Bildband mit den antiken Ausgrabungen …?“   
    SCHATZ: Genau der!
    ~ knows = 1
- -> questions

=== stolze


{langbein: Frau Stolze gab sich wesentlich freundlicher Sie bot Schatz sogar ein Glas Bier an. | Frau Stolze war sehr freundlich und bot Schatz ein Glas Bier an. } -> questions

= questions

* [Aufgefallen?] SCHATZ: Ist Ihnen heute in der Buchhandlung etwas aufgefallen?
    STOLZE: Ich habe was beobachtet 
    STOLZE: … Da war noch ein Mann im Laden … 
    STOLZE: ich stand einige Meter weg ... Er wusste nicht, dass ich ihn sehe 
    STOLZE: … und dieser Mann blätterte in einem dicken Buch, wo draufstand ,Antike Ausgrabungen‘.”
    ** [Gesehen] SCHATZ: Haben Sie auch gesehen, dass er es eingesteckt hat?
        STOLZE: Nein, das habe ich nicht gesehen
* [Bildband] SCHATZ: Frau Knödler hat heute Nachmittag einen kostbaren Bildband, Wert hundertzwanzig Mark, ins Regal gestellt. Der ist verschwunden! 
    STOLZE: Ich soll den Bildband mitgenommen haben? Nein, lieber Herr, da irren Sie sich.
* ->
    STOLZE: Haben sie mich jetzt nicht mehr im Verdacht?
    SCHATZ: Sicher werden Sie noch von der Sache hören, Frau Stolze. -> interog

- -> questions

=== solution
VOICEOVER: Eine halbe Stunde später stand Herr Schatz wieder seiner Wirtin gegenüber. Und Frau Knödler war ehrlich erfreut, dass der Ausflug ihres Untermieters von Erfolg gewesen war. Und sie nahm sich vor, mit der diebischen Person ein ernstes Wörtchen zu reden.
VOICEOVER: Wer stahl den Bildband nun wirklich?




--> END

