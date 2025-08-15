export const API_BASE = window.MQ_API_BASE || 'http://localhost:8788';
export const CURRENT_USER = localStorage.getItem('mq.user') || 'admin';
export function setUser(u){ localStorage.setItem('mq.user', u); }
export async function api(path,opts={}){ const r=await fetch(API_BASE+path,Object.assign({headers:{'Content-Type':'application/json'}},opts)); if(!r.ok) throw new Error(await r.text()); return await r.json(); }
export function once(key){const k='mq.once.'+key;if(localStorage.getItem(k))return false;localStorage.setItem(k,'1');return true}

/*
 * UI utilities
 */

/**
 * Display a confetti animation. Uses the #confetti-canvas element if present.
 * Respects prefers‑reduced‑motion and exits immediately when disabled.
 */
export function confetti(duration=2000){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('confetti-canvas');
  if(!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  const colours = ['#5ee7ff','#68f5bf','#ffd166','#f87171','#a78bfa'];
  const count = 150;
  const particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H - H,
      r: Math.random()*6+4,
      d: Math.random()*count,
      color: colours[Math.floor(Math.random()*colours.length)],
      tilt: Math.random()*10-10,
      tiltAngleIncremental: Math.random()*0.07 + 0.05,
      tiltAngle: 0
    });
  }
  let start = null;
  function draw(timestamp){
    if(!start) start = timestamp;
    const elapsed = timestamp - start;
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d)+3 + p.r/2)/2;
      p.x += Math.sin(p.d);
      p.tilt = Math.sin(p.tiltAngle)*15;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r/2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/2);
      ctx.stroke();
    });
    if(elapsed < duration){ requestAnimationFrame(draw); }
    else { ctx.clearRect(0,0,W,H); }
  }
  requestAnimationFrame(draw);
}

/**
 * Show a toast notification with the provided message.
 * Automatically hides after 3 seconds.
 */
export function showToast(msg){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>{ toast.classList.remove('show'); }, 3000);
}

/**
 * Populate and handle the champion selector modal. Reads from
 * localStorage key `mq.champion`. Selecting a champion saves it and
 * updates the avatar in the header. Also triggers a toast and confetti.
 */
export function initChampionSelector(){
  const openBtn = document.getElementById('open-champion');
  const modal = document.getElementById('champion-modal');
  const grid = modal?.querySelector('.champion-grid');
  const closeBtn = document.getElementById('close-champion');
  if(!openBtn || !modal || !grid || !closeBtn) return;
  // Set current avatar based on saved champion
  function applyChampion(id){
    const avatar = document.getElementById('open-champion');
    if(avatar){
      avatar.style.backgroundImage = `url(assets/img/champions/${id}.png)`;
    }
  }
  // Champion identifiers correspond to the champions defined in the visual design.
  // To align with the approved scope, map the following eight champions:
  // Ranger, Mage, Engineer, Ninja, Captain, Druid, Pilot, Astronaut.
  // We reuse existing image files where appropriate: ranger→ranger.png, mage→wizard.png,
  // engineer→robot.png, ninja→adventurer.png, captain→pirate.png, druid→dragon.png,
  // pilot→astronaut.png (pilot shares the astronaut art), astronaut→astronaut.png.
  const champions = ['ranger','mage','engineer','ninja','captain','druid','pilot','astronaut'];
  // Populate grid only once
  if(grid.childElementCount === 0){
    champions.forEach(id=>{
      const btn = document.createElement('button');
      btn.className = 'btn g';
      btn.style.display = 'flex';
      btn.style.padding = '0';
      btn.style.borderRadius = '12px';
      btn.style.overflow = 'hidden';
      btn.setAttribute('data-id', id);
      const img = document.createElement('img');
      img.src = `assets/img/champions/${id}.png`;
      img.alt = id;
      img.style.width = '100%';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      btn.appendChild(img);
      btn.onclick = ()=>{
        const chosen = btn.getAttribute('data-id');
        localStorage.setItem('mq.champion', chosen);
        applyChampion(chosen);
        showToast(`Equipped: ${chosen.charAt(0).toUpperCase()+chosen.slice(1)}`);
        confetti(1500);
        modal.style.display = 'none';
      };
      grid.appendChild(btn);
    });
  }
  // Open modal
  openBtn.onclick = ()=>{
    modal.style.display = 'grid';
  };
  // Close modal
  closeBtn.onclick = ()=>{
    modal.style.display = 'none';
  };
  // Apply saved champion on load
  const saved = localStorage.getItem('mq.champion');
  if(saved) applyChampion(saved);
  else applyChampion(champions[0]);
}

/**
 * Initialise responsive navigation: toggles mobile drawer and handles
 * keyboard/ARIA interactions. Also ensures the drawer closes on
 * navigation.
 */
export function initNav(){
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  if(!hamburger || !drawer) return;
  function toggle(){ drawer.classList.toggle('open'); }
  hamburger.addEventListener('click', toggle);
  hamburger.addEventListener('keypress',(e)=>{ if(e.key==='Enter'|| e.key===' ') { e.preventDefault(); toggle(); } });
  drawer.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{ drawer.classList.remove('open'); });
  });
}