import {api, CURRENT_USER, once} from './runtime.js';
const FEATURES=[
 {id:'privacy_upgrades',title:'Privacy & Safety Upgrades',desc:'More control for parents and safer defaults for kids.'},
 {id:'demo_modes',title:'Demo & Presentation Modes',desc:'Built-in guided tours for teachers and parents.'},
 {id:'teacher_wizard',title:'Teacher Wizard & Demo Class',desc:'Onboard classes in minutes with pseudonymous students.'}
];
export function mountWhatsNew(force=false){
 const modal=document.getElementById('whatsnew'); if(!modal) return;
 if(!force && !once('v4_2_whatsnew')) return;
 const sheet=modal.querySelector('.sheet');
 sheet.innerHTML=`<div class="hero"><h2 class="h2">What’s New in v4.2</h2><div class="small">Updated ${new Date().toLocaleDateString()}</div></div>`+
  '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'+
  FEATURES.map(f=>`<div class="card"><h3 class="h3">${f.title}</h3><p class="small">${f.desc}</p><button class="btn a" data-f="${f.id}">Explore</button></div>`).join('')+
  '</div><div style="margin-top:10px" class="row"><label class="small"><input type="checkbox" id="wn-dont"> Don’t show again</label><button class="btn" id="wn-close">Close</button></div>';
 modal.style.display='grid';
 sheet.querySelectorAll('[data-f]').forEach(b=> b.onclick= async()=>{
    await api('/analytics/whatsnew_click',{method:'POST',body:JSON.stringify({username:CURRENT_USER,featureId:b.dataset.f,role:localStorage.getItem('mq.role')||'teacher'})});
    alert('Opening: '+b.dataset.f+' (demo link)');
 });
 document.getElementById('wn-close').onclick=()=>{ if(document.getElementById('wn-dont').checked){ localStorage.setItem('mq.once.v4_2_whatsnew','1'); } modal.style.display='none'; };
}
document.addEventListener('DOMContentLoaded', ()=> mountWhatsNew(false));