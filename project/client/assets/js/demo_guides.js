const TEACHER=[
 {id:'t1',sel:'#feature-privacy',title:'Privacy-first onboarding',tip:'COPPA/GDPR aligned defaults.'},
 {id:'t2',sel:'#feature-pseudonyms',title:'Pseudonymized students',tip:'No real names by default.'},
 {id:'t3',sel:'#feature-leaderboard',title:'Private leaderboards',tip:'Class-only visibility.'},
 {id:'t4',sel:'#feature-events',title:'Events & missions',tip:'Weekly themes.'},
 {id:'t5',sel:'#feature-gems',title:'Gems & rewards',tip:'Cosmetic-only.'},
 {id:'t6',sel:'#feature-coach',title:'AI Math Coach',tip:'Kid-safe hints.'},
 {id:'t7',sel:'#feature-assign',title:'Assign a mission',tip:'One click.'},
 {id:'t8',sel:'#feature-consent',title:'Parent consent tracking',tip:'Scopes per feature.'},
 {id:'t9',sel:'#feature-qr',title:'QR login cards',tip:'Fast rollout.'},
 {id:'t10',sel:'#feature-export',title:'Progress export',tip:'CSV.'}
];
const PARENT=[
 {id:'p1',sel:'#feature-privacy',title:'Privacy first',tip:'Real names hidden.'},
 {id:'p2',sel:'#feature-consent',title:'Consent controls',tip:'Toggle features.'},
 {id:'p3',sel:'#feature-progress',title:'Progress tracking',tip:'See growth.'},
 {id:'p4',sel:'#feature-gems',title:'Safe rewards',tip:'No loot boxes.'},
 {id:'p5',sel:'#feature-contact',title:'Message teacher',tip:'Stay connected.'}
];
let mode='teacher', idx=0;
function steps(){return mode==='teacher'?TEACHER:PARENT}
function tip(){let t=document.getElementById('demo-tip');if(!t){t=document.createElement('div');t.id='demo-tip';t.className='tooltip';document.body.appendChild(t);}const s=steps()[idx];if(!s){t.style.display='none';return;}const target=document.querySelector(s.sel);if(!target){t.style.display='none';return;}const r=target.getBoundingClientRect();t.style.display='block';t.style.left=(r.right+12)+'px';t.style.top=(r.top)+'px';t.innerHTML=`<strong>${s.title}</strong><div class=small>Presenter tip: ${s.tip}</div><div class=actions><button id=prev class="btn g">Prev</button><button id=switch class=btn>Switch to ${mode==='teacher'?'Parent':'Teacher'}</button><button id=next class="btn a">Next</button></div>`;document.getElementById('prev').onclick=()=>{idx=Math.max(0,idx-1);tip()};document.getElementById('next').onclick=()=>{idx=Math.min(steps().length-1,idx+1);tip()};document.getElementById('switch').onclick=()=>{mode=mode==='teacher'?'parent':'teacher';idx=0;tip()};target.classList.add('highlight');setTimeout(()=>target.classList.remove('highlight'),400)}
export function startDemo(m='teacher'){mode=m;idx=0;tip()}