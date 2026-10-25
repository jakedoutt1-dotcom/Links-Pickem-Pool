import {playmakerPublic} from './playmaker-public.js';
function handle(context){const url=new URL(context.request.url);url.pathname='/new-build/api/playmaker-public';url.search='?action=ai';return playmakerPublic({...context,request:new Request(url,context.request)})}
export const onRequestGet=handle;
export const onRequestPost=handle;
