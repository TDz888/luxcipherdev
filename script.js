/* Profile Rebuild Script - smooth and lightweight */

const T_DEFAULT = '🐱 Trần Thiên Ân | Profile';
const T_AWAY = '👋 Quay lại đây, SuperDzAn!';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? T_AWAY : T_DEFAULT;
});

// Activity status by schedule (Asia/Ho_Chi_Minh):
// Online: 21:00 -> 05:00, Offline: 05:01 -> 20:59
(function activityStatusByTime() {
  const navText = document.getElementById('nav-status-text');
  const navDot = document.getElementById('nav-status-dot');
  const avatarText = document.getElementById('avatar-status-text');
  const avatarDot = document.getElementById('avatar-status-dot');

  function nowInHCM() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
    return { hour, minute, totalMin: hour * 60 + minute };
  }

  function applyStatus() {
    const { totalMin } = nowInHCM();
    const startOnline = 21 * 60; // 21:00
    const endOnline = 5 * 60; // 05:00
    const isOnline = totalMin >= startOnline || totalMin <= endOnline;

    if (navText) navText.textContent = isOnline ? 'Online' : 'Offline';
    if (avatarText) avatarText.textContent = isOnline ? 'Đang online' : 'Đang offline';
    if (navDot) navDot.classList.toggle('is-offline', !isOnline);
    if (avatarDot) avatarDot.classList.toggle('is-offline', !isOnline);
  }

  applyStatus();
  setInterval(applyStatus, 30 * 1000);
})();

// Remove legacy music module from DOM
const legacyPlayer = document.getElementById('tia-player');
if (legacyPlayer) legacyPlayer.remove();

// First visit identity gate
(function identityGate() {
  const gate = document.getElementById('identity-gate');
  if (!gate) return;

  const STORAGE_KEY = 'profile_identity_role';
  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_) {
        // Storage can fail in strict privacy modes; allow continue anyway.
      }
    }
  };

  const saved = safeStorage.get(STORAGE_KEY);
  if (saved) return;

  gate.hidden = false;
  document.body.style.overflow = 'hidden';

  const finishGate = role => {
    safeStorage.set(STORAGE_KEY, role || 'random');
    gate.hidden = true;
    document.body.style.overflow = '';
  };

  gate.querySelectorAll('.identity-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role') || 'random';
      finishGate(role);
    });
  });

  // Extra fallback: click on card continue area or press Enter.
  const card = gate.querySelector('.identity-card');
  if (card) {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') finishGate('random');
    });
  }
})();

// Cursor glow
(function cursorFX() {
  const cursorGlow = document.getElementById('cursor-glow');
  const cursorDot = document.getElementById('cursor-dot');
  if (!cursorGlow || !cursorDot || prefersReducedMotion) return;

  let mx = -999;
  let my = -999;
  let gx = -999;
  let gy = -999;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    cursorDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%) scale(0.62)`;
  });
  document.addEventListener('mouseup', () => {
    cursorDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  function loop() {
    if (!document.hidden) {
      gx += (mx - gx) * 0.1;
      gy += (my - gy) * 0.1;
      cursorGlow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      cursorDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// Navigation state on scroll
(function navScrollState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// Background video parallax (throttled)
(function bgParallax() {
  const bgVid = document.querySelector('.bg-video');
  if (!bgVid || prefersReducedMotion) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (document.hidden || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      bgVid.style.transform = `scale(1.08) translateY(${window.scrollY * 0.08}px)`;
      ticking = false;
    });
  }, { passive: true });
})();

// Reveal on scroll
(function revealOnScroll() {
  const revEls = document.querySelectorAll('.reveal-up,.reveal-left');
  if (!revEls.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  revEls.forEach(el => obs.observe(el));
})();

// Skill bars
(function skillBars() {
  const fills = document.querySelectorAll('.sfill');
  if (!fills.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = Array.from(fills).indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.width = `${entry.target.dataset.w || 0}%`;
      }, idx * 90);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  fills.forEach(el => obs.observe(el));
})();

// Ripple buttons
(function rippleButtons() {
  document.querySelectorAll('.ripple').forEach(el => {
    el.addEventListener('click', e => {
      const rect = el.getBoundingClientRect();
      const circle = document.createElement('span');
      circle.className = 'ripple-circle';
      const size = Math.max(rect.width, rect.height);
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    });
  });
})();

// Particle field (adaptive count)
(function particles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let list = [];
  const memory = navigator.deviceMemory || 8;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const total = isMobile ? 40 : (memory <= 4 ? 55 : 80);

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = -0.04 - Math.random() * 0.06;
      this.r = Math.random() * 1.6 + 0.3;
      this.life = 120 + Math.random() * 220;
      this.age = Math.random() * this.life;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.age += 1;
      if (this.age > this.life || this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
    }
    draw() {
      const a = Math.sin((this.age / this.life) * Math.PI) * 0.5;
      if (a <= 0.02) return;
      ctx.fillStyle = `rgba(244,132,95,${a})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < total; i += 1) list.push(new P());

  function loop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      list.forEach(p => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// Quick tools: clock + Gmail pop
(function quickTools() {
  const timeEl = document.getElementById('mini-clock-time');
  const gmailBtn = document.getElementById('gmail-toggle');
  const gmailPanel = document.getElementById('gmail-panel');
  if (!timeEl || !gmailBtn || !gmailPanel) return;

  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('vi-VN', {
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  }
  tick();
  setInterval(tick, 1000);

  gmailBtn.addEventListener('click', () => {
    const expanded = gmailBtn.getAttribute('aria-expanded') === 'true';
    gmailBtn.setAttribute('aria-expanded', String(!expanded));
    gmailPanel.hidden = expanded;
  });

  document.addEventListener('click', e => {
    if (!gmailPanel.hidden && !e.target.closest('#quick-tools')) {
      gmailBtn.setAttribute('aria-expanded', 'false');
      gmailPanel.hidden = true;
    }
  });
})();

// Footer terminal typing
(function terminalTyping() {
  const terminalTextEl = document.getElementById('terminal-typing');
  if (!terminalTextEl) return;
  const text = 'Are....you.....be.....my......night-friend?';
  let i = 0;

  function typeStep() {
    if (document.hidden) {
      setTimeout(typeStep, 220);
      return;
    }
    if (i <= text.length) {
      terminalTextEl.textContent = text.slice(0, i);
      i += 1;
      setTimeout(typeStep, 110);
      return;
    }
    setTimeout(() => {
      i = 0;
      terminalTextEl.textContent = '';
      typeStep();
    }, 2600);
  }
  typeStep();
})();
