import {api} from './runtime.js';

// Render weekly missions with animated progress bars.
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('missions');
  if (!container) return;
  const username = localStorage.getItem('mq.user') || 'admin';
  const res = await api('/missions/weekly?username=' + encodeURIComponent(username));
  // Build mission cards
  let completed = false;
  container.innerHTML = res.missions.map(m => {
    const pct = Math.min(100, Math.round(100 * m.progress / m.goal));
    if(m.progress >= m.goal) completed = true;
    return `
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <strong>${m.title}</strong>
          <span class="badge">${m.track}</span>
        </div>
        <div class="mission-bar"><span style="width:${pct}%"></span></div>
        <p class="small">${m.progress}/${m.goal} • Reward: ${m.reward}</p>
      </div>
    `;
  }).join('');
  // Animate progress bars on next frame
  requestAnimationFrame(() => {
    container.querySelectorAll('.mission-bar span').forEach(span => {
      const targetWidth = span.style.width;
      span.style.width = '0%';
      // Force reflow
      void span.offsetWidth;
      span.style.width = targetWidth;
    });
  });
  // If any mission is completed, trigger confetti
  if(completed) {
    import('./runtime.js').then(mod => {
      mod.confetti(2000);
    });
  }
});