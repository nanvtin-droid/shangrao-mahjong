/** Real performance: Liu Shui, Charlie Huang (2006), CC BY 2.5. See MUSIC-CREDITS.md. */
export class TeahouseAudio {
 element:HTMLAudioElement|null=null;
 onState?:(playing:boolean)=>void;
 get playing(){return !!this.element&&!this.element.paused;}
 async start(volume=.35){
  if(!this.element){this.element=new Audio('/audio/liu-shui.mp3');this.element.loop=true;this.element.preload='metadata';this.element.addEventListener('play',()=>this.onState?.(true));this.element.addEventListener('pause',()=>this.onState?.(false));this.element.addEventListener('error',()=>this.onState?.(false));}
  this.element.volume=Math.max(0,Math.min(1,volume));await this.element.play();
 }
 volume(v:number){if(this.element)this.element.volume=Math.max(0,Math.min(1,v));}
 stop(){this.element?.pause();}
}
export type NarrationState='idle'|'playing'|'paused';
/** Sentence queue keeps pauses/resumes useful on mobile engines that cannot resume native pause(). */
export class NarrationPlayer {
 state:NarrationState='idle'; chunks:string[]=[];index=0;offset=0;utterance:SpeechSynthesisUtterance|null=null;generation=0;
 onState?:(state:NarrationState)=>void;onUnavailable?:()=>void;
 private update(state:NarrationState){this.state=state;this.onState?.(state);}
 speak(text:string){
  if(!('speechSynthesis'in window)){this.onUnavailable?.();return;}
  this.stop();this.chunks=(text.match(/[^。！？；\n]+[。！？；\n]?/g)||[text]).flatMap(s=>s.match(/.{1,100}/g)||[]);this.index=0;this.offset=0;this.update('playing');this.playChunk();
 }
 private playChunk(){
  if(this.state!=='playing')return;
  if(this.index>=this.chunks.length){this.update('idle');return;}
  const stamp=++this.generation;const start=this.offset;const u=new SpeechSynthesisUtterance(this.chunks[this.index].slice(start));this.utterance=u;u.lang='zh-CN';u.rate=.92;u.pitch=1;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('zh'));if(voice)u.voice=voice;
  u.onboundary=e=>{if(stamp===this.generation)this.offset=start+e.charIndex;};
  u.onend=()=>{if(stamp!==this.generation||this.state!=='playing')return;this.index++;this.offset=0;this.playChunk();};
  u.onerror=e=>{if(stamp!==this.generation||e.error==='canceled'||e.error==='interrupted')return;this.update('idle');this.onUnavailable?.();};
  speechSynthesis.speak(u);
 }
 pause(){if(this.state!=='playing')return;this.generation++;this.update('paused');window.speechSynthesis?.cancel();}
 resume(){if(this.state!=='paused')return;this.update('playing');this.playChunk();}
 stop(){this.generation++;window.speechSynthesis?.cancel();this.update('idle');this.index=0;this.offset=0;}
}
