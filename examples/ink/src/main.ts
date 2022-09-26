import compiledStory from './../ink/test2.ink';

import * as ink from 'inkjs/dist/ink'
import { Drawable } from './interfaces';
import { InputUtils, TimeUtils } from './utils';
import { Background } from './Background';
import { Costume } from './Costume';
import { Title } from './Title';
import { Voiceover } from './Voiceover';
import { InkLine } from './InkLine';
import { Directive } from './Directive';
import { Actor } from './Actor';
import { Choices } from './Choices';
import { InkChoice } from './InkChoice';
import { StatePatch } from 'inkjs/engine/StatePatch';

export const canvas = window['kanvas'] ?? <HTMLCanvasElement>document.getElementById('canvas')

type Tags = { [key: string]: any }

class Story {
  story: any;
  globalTags: Tags

  constructor(inkData: any) {
    this.story = new ink.Story(inkData)

    this.globalTags = this.decodeTags(this.story.globalTags)
  }

  getTags() {
    return this.decodeTags(this.story.currentTags)
  }

  private decodeTags(raw: string[]): Tags {
    const tags: Tags = {}
    for (const t of raw) {
      const spl = t.split(':')
      if (spl.length > 1) {
        tags[spl[0].trim()] = spl[1].trim()
      } else {
        tags[spl[0].trim()] = true
      }
    }
    return tags
  }
}

abstract class Command {

  constructor(protected directive: Directive) {
  }

  private combineParameters() {
    const defaults = this.getDefaults()
    const params = this.loadParameters()
    return { ...defaults, ...params }
  }

  executeOperations(sync: boolean) {
    const combined = this.combineParameters()
    if (this.directive.operations.length === 0) {
      return this.executeOperation('default', combined, sync)
    }
    return Promise.all(this.directive.operations.map(x => this.executeOperation(x, combined, sync)))
  }

  protected tryConvertParameter(param: string, fn: (any) => any) {
    if (this.directive.parameters[param]) this.directive.parameters[param] = fn(this.directive.parameters[param])
  }

  protected abstract loadParameters(): any
  protected abstract getDefaults(): any
  protected abstract executeOperation(name: string, parameters: any, sync: boolean): Promise<void>;
}

class TitleCommand extends Command {
  private defaults: any
  constructor(directive: Directive, private renderer: Title, title: string, subtitle: string) {
    super(directive)
    this.defaults = { title, subtitle, time: 1000 }
  }
  protected loadParameters() {
    this.tryConvertParameter('time', str => parseInt(str))
    return this.directive.parameters
  }
  protected getDefaults() {
    return this.defaults
  }
  protected executeOperation(name: string, parameters: any, sync: boolean): Promise<void> {
    switch (name) {
      case 'show':
        return this.renderer.show(parameters.title, parameters.subtitle, sync ? 0 : parameters.time)
      case 'hide':
        return this.renderer.hide(sync ? 0 : parameters.time)
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }
}

class ActorCommand extends Command {

  constructor(directive: Directive, private actor: Actor, private costumeLeft: Costume, private costumeRight: Costume) {
    super(directive)
  }

  protected loadParameters() {
    this.tryConvertParameter('flipped', v => v === 'true')
    return this.directive.parameters
  }
  protected getDefaults() {
    return this.actor
  }
  protected async executeOperation(name: string, parameters: any, sync: boolean): Promise<void> {
    let cost: Costume;
    switch (name) {
      case 'set':
        Object.assign(this.actor, parameters)
        return Promise.resolve()
      case 'enter':
        cost = parameters.pos === 'right' ? this.costumeRight : this.costumeLeft
        if (cost.visible) {
          if (sync) {
            cost.exit(0)
          } else {
            await cost.exit(parameters.time * 0.5)
          }
          parameters.time *= 0.5
        }
        if (sync) {
          cost.enter(parameters, 0)
        } else {
          await cost.enter(parameters, parameters.time)
        }
        return
      case 'exit':
        cost = parameters.pos === 'right' ? this.costumeRight : this.costumeLeft
        return cost.exit(sync ? 0 : parameters.time)
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }

}

class WaitCommand extends Command {

  protected loadParameters() {
    this.tryConvertParameter('seconds', v => parseFloat(v))
    this.tryConvertParameter('time', v => parseInt(v))
    return { time: this.directive.parameters.time ?? this.directive.parameters.seconds * 1000 }
  }
  protected getDefaults() {
    return { time: 1000 }
  }
  protected executeOperation(name: string, parameters: any, sync: boolean): Promise<void> {
    if (sync) return;
    return TimeUtils.wait(parameters.time)
  }
}

class SceneCommand extends Command {
  constructor(d: Directive, private stage: Stage) {
    super(d)
  }

  protected loadParameters() {
    return this.directive.parameters
  }
  protected getDefaults() {
    return { time: 1000 }
  }
  protected async executeOperation(name: string, parameters: any, sync: boolean): Promise<void> {
    switch (name) {
      case 'fade-in':
        return this.stage.background.fadeIn(parameters.img, sync ? 0 : parameters.time)
      case 'fade-out':
        return this.stage.background.fadeOut(sync ? 0 : parameters.time)
      case 'change':
        if (sync) {
          this.stage.charLeft.exit(0)
          this.stage.charRight.exit(0)
          this.stage.background.fadeOut(0)
          this.stage.background.fadeIn(parameters.img, 0)
        } else {
          this.stage.charLeft.exit(parameters.time)
          await this.stage.charRight.exit(parameters.time)
          await this.stage.background.fadeOut(parameters.time)
          await this.stage.background.fadeIn(parameters.img, parameters.time)
        }
        break;
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }
}

class CharactersCommand extends Command {

  constructor(directive: Directive, private charA: Costume, private charB: Costume) {
    super(directive);
  }

  protected loadParameters() {
    return this.directive.parameters
  }
  protected getDefaults() {
    return { time: 1000 }
  }
  protected async executeOperation(name: string, parameters: any, sync: boolean): Promise<void> {
    switch (name) {
      case 'exit':
        this.charA.exit(parameters.time)
        await this.charB.exit(parameters.time)
        break;
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }

}


class Stage {

  background = new Background();
  charLeft = new Costume();
  charRight = new Costume();
  title = new Title();
  voiceover = new Voiceover();
  choices: Choices
  lastText: Drawable
  fastForward = false
  pastChoices = []
  currentChoices = []

  actors: { [key: string]: Actor } = {}
  ctx: CanvasRenderingContext2D

  ink: Story;

  reset(){
    this.background = new Background();
    this.charLeft = new Costume();
    this.charRight = new Costume();
    this.title = new Title();
    this.voiceover = new Voiceover();
    this.choices = new Choices(this.canvas);
    this.actors = {}
    this.currentChoices = []
  }

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    this.choices = new Choices(canvas);
  }

  draw() {
    this.background.draw(this.ctx)
    this.charLeft.draw(this.ctx)
    this.charRight.draw(this.ctx)
    this.voiceover.draw(this.ctx)
    this.choices.draw(this.ctx)
    this.title.draw(this.ctx)
  }

  private clickOrKey() {
    return Promise.race([InputUtils.waitClick(this.canvas), InputUtils.waitKey()])
  }

  private async display(text: string, speaker: string) {
    if (speaker === '') {
      await this.voiceover.show(text, 500);
      this.lastText = this.voiceover
      await this.clickOrKey()
      await this.voiceover.hide(500)
    } else {
      let costume = speaker === this.charLeft.actorId
        ? this.charLeft
        : (speaker === this.charRight.actorId
          ? this.charRight
          : null)

      if (costume === null) {
        const actor = this.actors[speaker]
        if (!actor) throw new Error('Unknown character: ' + speaker)
        costume = actor.pos === 'left' ? this.charLeft : this.charRight
        if (costume.actorId) await costume.exit(1000)
        await costume.enter(actor, 1000)
      }

      await costume.showBubble(text, 500)
      await this.clickOrKey()
      await costume.hideBubble(500)
    }
  }

  private displaySync(text: string, speaker: string) {
    if (speaker === 'VOICEOVER') {
      this.voiceover.show(text, 0);
      this.lastText = this.voiceover
      this.voiceover.hide(0)
    } else {
      let costume = speaker === this.charLeft.actorId
        ? this.charLeft
        : (speaker === this.charRight.actorId
          ? this.charRight
          : null)

      if (costume === null) {
        const actor = this.actors[speaker]
        if (!actor) throw new Error('Unknown character: ' + speaker)
        costume = actor.pos === 'left' ? this.charLeft : this.charRight
        if (costume.actorId) costume.exit(0)
        costume.enter(actor, 0)
      }
      costume.showBubble(text, 0)
      costume.hideBubble(0)
    }
  }

  private async executeDirective(directive: Directive, sync: boolean): Promise<void[] | void> {
    if (directive.command.toUpperCase() === directive.command) {
      let actor = this.actors[directive.command]
      if (!actor) actor = this.actors[directive.command] = new Actor(directive.command);
      return new ActorCommand(directive, actor, this.charLeft, this.charRight).executeOperations(sync)
    }
    switch (directive.command) {
      case 'title':
        return new TitleCommand(directive, this.title, this.ink.globalTags.title, this.ink.globalTags.author).executeOperations(sync)
      case 'wait':
        return new WaitCommand(directive).executeOperations(sync)
      case 'scene':
        return new SceneCommand(directive, this).executeOperations(sync)
      case 'characters':
        return new CharactersCommand(directive, this.charLeft, this.charRight).executeOperations(sync)
      default:
        throw new Error('Unknown directive: ' + directive.command)
    }
  }

  private async processLine(line: InkLine) {
    await Promise.all(line.directives.map(x => this.executeDirective(x, false)))
    if (line.hasText) {
      await this.display(line.text, line.speaker)
    }
  }

  private processLineSync(line: InkLine) {
    line.directives.forEach(x => this.executeDirective(x, true))
    if (line.hasText) {
      this.displaySync(line.text, line.speaker)
    }
  }

  async continueStory(sync: boolean = false) {
    const raw = this.ink.story.Continue()
    console.log(raw)
    const line = new InkLine(raw)
    if (sync) {
      this.processLineSync(line)
    } else {
      await this.processLine(line)
    }
  }

  persist() {
    localStorage.setItem('ink_progress', JSON.stringify(this.currentChoices))
  }

  async run(inkData: any, choices: number[]) {
    this.reset()
    if (choices) {
      this.fastForward = true
      this.pastChoices = choices
    }
    this.ink = new Story(inkData);
    this.background.fadeOut(0)
    while (this.ink.story.canContinue) {
      while (this.ink.story.canContinue) {
        if (this.fastForward) {
          this.continueStory(true)
        } else {
          await this.continueStory()
        }
      }
      if(!this.fastForward) this.persist()
      if (this.ink.story.currentChoices.length > 0) {
        const choices = this.ink.story.currentChoices.map(x => new InkChoice(x))
        let choice: number
        if (this.fastForward && this.pastChoices.length > 0) {
          choice = this.pastChoices.shift()
        } else {
          this.fastForward = false
          this.persist()
          choice = await this.choices.waitForChoice(choices, 500)
          if(choice < 0) return choice
        }
        this.currentChoices.push(choice)
        this.ink.story.ChooseChoiceIndex(choice)
      } else {
        return 0
      }
    }
  }
}

const stage = new Stage(canvas)

function draw(t) {
  stage.draw()
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)

async function main(){
  const item = localStorage.getItem('ink_progress')
  const choices = item !== undefined ? JSON.parse(item) : undefined
  let code = 1
  while(code !== 0){
    if(code === -1){
      if(stage.currentChoices.length > 0) stage.currentChoices.pop()
      else stage.currentChoices = undefined
      code = await stage.run(compiledStory, stage.currentChoices);
    } else if(code === -2){
      code = await stage.run(compiledStory, undefined);
    } else {
      code = await stage.run(compiledStory, choices);
    }

  }
}

main().catch(err => console.log(err.stack));

