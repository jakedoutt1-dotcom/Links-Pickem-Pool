const characters=['Fox','Wolf','Cat','Golden retriever','Owl','Raven','Panda','Lion','Tiger','Bear','Raccoon','Rabbit','Dragon','Robot','Astronaut','Knight'];
export const avatarGroups=[
 {id:'classic',label:'Classic',count:9,columns:3,file:'poker-character-portraits-v1.png'},
 {id:'people',label:'Portraits',count:16,columns:4,file:'poker-avatar-people-v1.png'},
 {id:'fun',label:'Fun characters',count:16,columns:4,file:'poker-avatar-characters-v1.png'}
];
export function presetAvatar(value){
 const match=/^preset:(classic|people|fun)-(0|[1-9]\d?)$/.exec(value||'');if(!match)return null;
 const group=avatarGroups.find(g=>g.id===match[1]),index=Number(match[2]);if(index>=group.count)return null;
 return {id:value,group:group.id,label:group.id==='fun'?characters[index]:group.label+' '+(index+1),image:new URL('./assets/'+group.file,import.meta.url).href,size:group.columns*100+'%',x:(index%group.columns)*100/(group.columns-1)+'%',y:Math.floor(index/group.columns)*100/(group.columns-1)+'%'};
}
export const presetStyle=p=>`background-image:url('${p.image}');background-size:${p.size} ${p.size};background-position:${p.x} ${p.y}`;
