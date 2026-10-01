import {reviewCorrection,correctionReply} from '../../lib/pick-corrections.js';
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return correctionReply({error:'Method not allowed.'},405);
 try{return await reviewCorrection(request,env.DB,request.method==='POST'?await request.json():null)}catch(error){console.error('Correction review failed',error);return correctionReply({error:'Correction review is unavailable. Please retry.'},503)}
}
