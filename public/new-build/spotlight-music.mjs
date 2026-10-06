// User-supplied Million Point waiting-room soundtrack.
export function createSpotlightMusic(){
 let buffer,loading,source,failed=false,context,wanted=false;
 function stop(){if(source){try{source.stop()}catch{}source.disconnect();source=null}}
 function sync(){
  if(!wanted||document.hidden||context?.state!=='running'){stop();return}
  if(source||loading||failed)return;
  if(!buffer){loading=fetch(new URL('./audio/enter-the-spotlight.mp3',import.meta.url)).then(r=>{if(!r.ok)throw Error('Music unavailable');return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)).then(b=>{buffer=b}).catch(()=>{failed=true}).finally(()=>{loading=null;sync()});return}
  source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(context.destination);source.start();
 }
 return {update(ctx,active){context=ctx;wanted=active;sync()},stop(){wanted=false;stop()},retry(){failed=false}};
}
