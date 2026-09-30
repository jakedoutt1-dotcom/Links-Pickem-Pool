import {ownerSession,ownerAttempt,ownerPasswordOk} from './owner-auth.js';
import {ensureAccounts,emailKey,PLANS,allowance} from './commissioner-account.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function grantPackage(request,db,b){
 if(!await ownerSession(request,db))return json({error:'Owner sign-in required.'},401);
 const email=emailKey(b.email),plan=String(b.plan||''),days=Number(b.days),id=String(b.requestId||'');
 if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid email address.'},400);
 if(!['plus','nfl_package','all_access'].includes(plan)||![30,90,365].includes(days)||! /^[a-f0-9-]{36}$/i.test(id)||b.confirm!==true)return json({error:'Confirm a valid package and duration.'},400);
 if(!await ownerAttempt(request,db))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(!await ownerPasswordOk(db,b.password))return json({error:'Incorrect owner password.'},401);
 await ensureAccounts(db);
 const created=new Date().toISOString(),expires=new Date(Date.now()+days*864e5).toISOString();
 // A request ID makes retries safe; never create a payment or mark an email verified.
 await db.prepare('INSERT OR IGNORE INTO links_package_grants(id,email,plan,days,created_at,expires_at) VALUES(?,?,?,?,?,?)').bind(id,email,plan,days,created,expires).run();
 const grant=await db.prepare('SELECT * FROM links_package_grants WHERE id=?').bind(id).first();
 if(grant.email!==email||grant.plan!==plan||grant.days!==days)return json({error:'This request was already used. Refresh and try again.'},409);
 return json({ok:true,grant:{...grant,label:PLANS[plan].label},effective:await allowance(db,email)});
}
