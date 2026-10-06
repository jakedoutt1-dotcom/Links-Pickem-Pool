// Supplied LINKS losing sting. Never queue a late effect after a download.
export function createLossSound(){
 let buffer,loading,source;
 return {
  load(context){if(buffer||loading)return;loading=fetch(new URL('./audio/whamp-whamp.mp3',import.meta.url)).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)).then(b=>{buffer=b}).catch(()=>{}).finally(()=>{loading=null})},
  play(context){if(!buffer||context.state!=='running'||document.hidden)return false;try{source?.stop()}catch{}source=context.createBufferSource();source.buffer=buffer;source.loop=false;source.connect(context.destination);const playing=source;source.onended=()=>{playing.disconnect();if(source===playing)source=null};source.start();return true},
  stop(){try{source?.stop()}catch{}source=null}
 };
}
