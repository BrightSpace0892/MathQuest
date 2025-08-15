import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import Filter from 'bad-words';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8788;
const ALLOWED = (process.env.ALLOWED_ORIGINS||'http://localhost:8000').split(',');

app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:(origin,cb)=>{ if(!origin || ALLOWED.includes(origin)) return cb(null,true); cb(new Error('Not allowed by CORS')); }}));
app.use(express.json({limit:'2mb'}));

const filter = new Filter();
const year = new Date().getFullYear();
const today = ()=> new Date().toISOString().slice(0,10);
function calcAge(by?:number|null){ if(!by) return null; return Math.max(0, year - by); }
function safeDisplay(base:string){ const animals=['Otter','Fox','Panda','Hawk','Koala','Lynx','Moose','Dolphin','Finch','Seal']; const adj=['Brave','Clever','Swift','Bright','Mighty','Happy','Kind','Nimble','Calm','Lucky']; return `${adj[Math.floor(Math.random()*adj.length)]}${animals[Math.floor(Math.random()*animals.length)]}${Math.floor(Math.random()*9000)+1000}`; }
function cleanName(name:string){ const s=(name||'').trim().slice(0,20); if(!s || filter.isProfane(s) || !/^[a-z0-9_\-]+$/i.test(s)) return safeDisplay(''); return s; }

// ---- Seed events if empty ----
async function seedEvents(){ const c=await prisma.event.count(); if(c>0) return; const banners=['banner_winter.png','banner_treasure.png','banner_fractions.png','banner_gems.png','banner_geometry.png','banner_decimal.png','banner_algebra.png','banner_prime.png','banner_pirate.png','banner_measure.png','banner_multi.png','banner_division.png']; const titles=['Winter Math Fest','Treasure Tally Week','Fractions Fortress Siege','Gem Hunt Gala','Geometry Grove Expedition','Decimal Desert Dash','Algebra Arena Battle','Prime Number Peak','Probability Pirate Raid','Measurement Mountain Climb','Multiplication Marshland','Division Deep-Sea Dive']; const start=new Date(); for(let i=0;i<titles.length;i++){ const s=new Date(start.getTime()+i*7*86400000); const e=new Date(s.getTime()+6*86400000); await prisma.event.create({data:{title:titles[i],banner:banners[i],start:s.toISOString().slice(0,10),end:e.toISOString().slice(0,10)}}); } }
seedEvents().catch(()=>{});

// ---- Users basics ----
app.get('/users/tier', async (req,res)=>{ const u=await prisma.user.findUnique({where:{username:String(req.query.username||'')}}); res.json({tier:u?.tier||'Free'}); });
app.get('/users/gems', async (req,res)=>{ const u=await prisma.user.findUnique({where:{username:String(req.query.username||'')}}); res.json({gems:u?.gems||0}); });

// ---- Progress ----
app.post('/progress/result', async (req,res)=>{
  const S=z.object({username:z.string(),gameId:z.string(),score:z.number().int().nonnegative()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid');
  const {username,gameId,score}=b.data; const u=await prisma.user.upsert({where:{username},update:{},create:{username,displayName:safeDisplay(username)}});
  const xp=Math.max(1,Math.round(score/10)); await prisma.result.create({data:{userId:u.id,gameId,score,xpGain:xp}});
  const sum=await prisma.result.aggregate({_sum:{xpGain:true},where:{userId:u.id}});
  res.json({ok:true,xp:sum._sum.xpGain||0,gain:xp});
});

// ---- Events ----
app.get('/events/active', async (_req,res)=>{ const d=today(); const e=await prisma.event.findFirst({where:{start:{lte:d},end:{gte:d}},orderBy:{start:'asc'}}); if(!e) return res.json({event:null}); const endsIn=Math.max(0,Math.ceil((new Date(e.end).getTime()-Date.now())/86400000)); res.json({event:{title:e.title,banner:e.banner,endsIn:endsIn+' days'}}); });

// ---- Leaderboard (anonymize unless >=13 and consent) ----
app.get('/leaderboard/top', async (_q,res)=>{ const users=await prisma.user.findMany({include:{results:true}}); const list=users.map(u=>{ const age=calcAge(u.birthYear); const xp=u.results.reduce((a,r)=>a+r.xpGain,0); const name=(u.hasConsent && age!==null && age>=13)? (u.displayName||u.username) : (u.displayName||safeDisplay(u.username)); return {displayName:name,xp}; }).sort((a,b)=>b.xp-a.xp).slice(0,50); res.json({list}); });

// ---- Groups ----
app.get('/groups/ensure-code', async (req,res)=>{ const username=String(req.query.username||''); const u=await prisma.user.upsert({where:{username},update:{},create:{username}}); const code='G-'+Buffer.from(username).toString('base64').slice(0,6).toUpperCase(); let g=await prisma.group.findFirst({where:{code}}); if(!g) g=await prisma.group.create({data:{name:`${cleanName(username)}-group`,code}}); res.json({code}); });
app.post('/groups/create', async (req,res)=>{ const S=z.object({username:z.string(),name:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const code='G-'+Math.random().toString(36).slice(2,8).toUpperCase(); const g=await prisma.group.create({data:{name:cleanName(b.data.name),code}}); const u=await prisma.user.upsert({where:{username:b.data.username},update:{},create:{username:b.data.username}}); await prisma.groupMember.create({data:{userId:u.id,groupId:g.id}}); res.json({groupId:g.id,code}); });
app.post('/groups/join', async (req,res)=>{ const S=z.object({username:z.string(),code:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const g=await prisma.group.findFirst({where:{code:b.data.code}}); if(!g) return res.status(404).send('not found'); const u=await prisma.user.upsert({where:{username:b.data.username},update:{},create:{username:b.data.username}}); await prisma.groupMember.upsert({where:{userId_groupId:{userId:u.id,groupId:g.id}},update:{},create:{userId:u.id,groupId:g.id}}); res.json({ok:true}); });
app.get('/groups/leaderboard', async (req,res)=>{ const id=String(req.query.groupId||''); const gm=await prisma.groupMember.findMany({where:{groupId:id},include:{user:true}}); const list=[] as any[]; for(const m of gm){ const s=await prisma.result.aggregate({_sum:{xpGain:true},where:{userId:m.userId}}); const age=calcAge(m.user.birthYear); const name=(m.user.hasConsent && age!==null && age>=13)? (m.user.displayName||m.user.username) : (m.user.displayName||safeDisplay(m.user.username)); list.push({displayName:name,xp:s._sum.xpGain||0}); } list.sort((a,b)=>b.xp-a.xp); res.json({list}); });

// ---- Ads reward (3/day, blocked if no consent) ----
app.post('/ads/reward', async (req,res)=>{ const S=z.object({username:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username}=b.data; const u=await prisma.user.findUnique({where:{username}}); if(!u || !u.hasConsent) return res.status(403).send('ads disabled for minors/no-consent'); const d=today(); let a=await prisma.adReward.findUnique({where:{userId_date:{userId:u.id,date:d}}}).catch(()=>null); if(!a) a=await prisma.adReward.create({data:{userId:u.id,date:d,count:0}}); const LIMIT=3; if(a.count>=LIMIT) return res.status(429).send('limit'); await prisma.adReward.update({where:{id:a.id},data:{count:{increment:1}}}); const up=await prisma.user.update({where:{id:u.id},data:{gems:{increment:5}}}); res.json({gems:up.gems,today:a.count+1,limit:LIMIT}); });

// ---- Inventory & cosmetics ----
app.get('/inventory/list', async (req,res)=>{ const u=await prisma.user.upsert({where:{username:String(req.query.username||'')},update:{},create:{username:String(req.query.username||'')}}); const items=await prisma.inventory.findMany({where:{userId:u.id},include:{cosmetic:true}}); res.json({items:items.map(i=>({id:i.cosmeticId,title:i.cosmetic.title,type:i.cosmetic.type}))}); });
app.post('/inventory/equip', async (req,res)=>{ const S=z.object({username:z.string(),cosmeticId:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username,cosmeticId}=b.data; const u=await prisma.user.upsert({where:{username},update:{},create:{username}}); const c=await prisma.cosmetic.findUnique({where:{id:cosmeticId}}); if(!c) return res.status(404).send('cosmetic'); if(c.type==='skin'){ await prisma.user.update({where:{id:u.id},data:{skin:c.title,displayName:c.title}}); } res.json({ok:true}); });
app.post('/dev/seed-cosmetics', async (_q,res)=>{ const n=await prisma.cosmetic.count(); if(n===0){ await prisma.cosmetic.createMany({data:[{title:'Knight of Fractions',type:'skin'},{title:'Pirate Mage',type:'skin'},{title:'Ranger Gempack',type:'gear'}]}); } res.json({ok:true}); });

// ---- Missions ----
app.get('/missions/weekly', async (req,res)=>{ const username=String(req.query.username||''); const base=[{id:'m1',title:'Play 3 Quickfire rounds',goal:3,track:'Free',reward:'+10 Gems'},{id:'m2',title:'Score 150 points total',goal:150,track:'Free',reward:'+50 XP'},{id:'m3',title:'Complete 1 Daily Challenge',goal:1,track:'Premium',reward:'Exclusive Skin Shard'}]; const out=[] as any[]; for(const m of base){ let mp=await prisma.missionProgress.findFirst({where:{username,missionId:m.id}}); if(!mp) mp=await prisma.missionProgress.create({data:{username,missionId:m.id,progress:0,goal:m.goal,track:m.track}}); out.push({id:m.id,title:m.title,progress:mp.progress,goal:m.goal,track:m.track,reward:m.reward}); } res.json({missions:out}); });
app.post('/missions/increment', async (req,res)=>{ const S=z.object({username:z.string(),missionId:z.string(),amount:z.number().int().positive()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username,missionId,amount}=b.data; const mp=await prisma.missionProgress.findFirst({where:{username,missionId}}); if(!mp) return res.status(404).send('mission'); const up=await prisma.missionProgress.update({where:{id:mp.id},data:{progress:Math.min(mp.goal,mp.progress+amount)}}); res.json({ok:true,progress:up.progress,goal:up.goal}); });

// ---- Class import ----
app.post('/class/import', async (req,res)=>{ const S=z.object({owner:z.string(),csv:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {owner,csv}=b.data; const code='CLS-'+Math.random().toString(36).slice(2,8).toUpperCase(); const g=await prisma.group.create({data:{name:`${cleanName(owner)}-class`,code}}); const o=await prisma.user.upsert({where:{username:owner},update:{},create:{username:owner}}); await prisma.groupMember.create({data:{userId:o.id,groupId:g.id}}); let count=0; for(const line of csv.split(/\r?\n/)){ const [name,username]=(line||'').split(',').map(x=>(x||'').trim()); if(!username) continue; const su=await prisma.user.upsert({where:{username},update:{},create:{username,displayName:safeDisplay(username)}}); try{ await prisma.groupMember.create({data:{userId:su.id,groupId:g.id}}); count++; }catch{} } res.json({groupId:g.id,code,count}); });

// ---- AI Coach (server-mode rule-based) ----
app.post('/coach/hint', async (req,res)=>{ const S=z.object({kind:z.string(),a:z.number().optional(),b:z.number().optional()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const k=b.data.kind; const map:any={add:'Add ones then tens. Estimate first.',sub:'Subtract smaller from larger; add back to check.',mul:'Use arrays or skip-counting.',div:'Think equal groups; multiply to check.'}; res.json({hint:map[k]||'Estimate first; adjust.'}); });

// ---- Consent & Privacy ----
app.get('/consent/status', async (req,res)=>{ const username=String(req.query.username||''); const u=await prisma.user.findUnique({where:{username}}); res.json({hasConsent:!!u?.hasConsent, age: (u?.birthYear? (new Date().getFullYear()-u.birthYear): null)}); });
app.post('/consent/age', async (req,res)=>{ const S=z.object({username:z.string(),birthYear:z.number().int().min(1900).max(year)}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username,birthYear}=b.data; await prisma.user.upsert({where:{username},update:{birthYear,displayName:safeDisplay(username)},create:{username,birthYear,displayName:safeDisplay(username)}}); res.json({ok:true}); });
app.post('/consent/request', async (req,res)=>{ const S=z.object({username:z.string(),parentEmail:z.string().email()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username,parentEmail}=b.data; const token=Math.random().toString(36).slice(2,8).toUpperCase(); await prisma.user.upsert({where:{username},update:{parentEmail},create:{username,parentEmail}}); await prisma.consentToken.create({data:{username,token}}); await prisma.consentLog.create({data:{username,action:'requested',meta:parentEmail}}); res.json({ok:true,token}); });
app.post('/consent/verify', async (req,res)=>{ const S=z.object({username:z.string(),token:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username,token}=b.data; const t=await prisma.consentToken.findFirst({where:{username,token,used:false}}); if(!t) return res.status(400).send('invalid token'); await prisma.user.upsert({where:{username},update:{hasConsent:true},create:{username,hasConsent:true}}); await prisma.consentToken.update({where:{id:t.id},data:{used:true}}); await prisma.consentLog.create({data:{username,action:'verified',meta:token}}); res.json({ok:true}); });
app.get('/privacy/export', async (req,res)=>{ const username=String(req.query.username||''); const u=await prisma.user.findUnique({where:{username},include:{results:true}}); if(!u) return res.status(404).send('not found'); res.json({profile:{username:u.username,birthYear:u.birthYear,hasConsent:u.hasConsent,displayName:u.displayName,gems:u.gems,tier:u.tier},results:u.results}); });
app.post('/privacy/delete', async (req,res)=>{ const S=z.object({username:z.string()}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const {username}=b.data; const u=await prisma.user.findUnique({where:{username}}); if(u){ await prisma.result.deleteMany({where:{userId:u.id}}); await prisma.user.delete({where:{id:u.id}}); await prisma.dataRequest.create({data:{username,type:'deletion',status:'closed'}}); } res.json({ok:true}); });

// ---- Analytics ----
app.post('/analytics/whatsnew_click', async (req,res)=>{ const S=z.object({username:z.string().default('anonymous'),featureId:z.string(),role:z.string().default('teacher')}); const b=S.safeParse(req.body); if(!b.success) return res.status(400).send('invalid'); const ev=await prisma.analyticsEvent.create({data:{username:b.data.username,featureId:b.data.featureId,role:b.data.role}}); res.json({ok:true,id:ev.id}); });
app.get('/analytics/summary', async (_q,res)=>{ const events=await prisma.analyticsEvent.findMany({orderBy:{createdAt:'asc'}}); const byFeature:Record<string,number>={}, byRole:Record<string,number>={}; for(const e of events){ byFeature[e.featureId]=(byFeature[e.featureId]||0)+1; byRole[e.role]=(byRole[e.role]||0)+1; } res.json({events,byFeature,byRole}); });

app.get('/health', (_q,res)=> res.json({ok:true,v:'v4.2-full'}));
app.listen(PORT, ()=> console.log('v4.2 full server on :'+PORT));