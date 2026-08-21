/* ==========================================================================
   CONFIG
   ⚠️ EDIT THIS — replace with your name. It populates the hero heading
   automatically, so this is the only place you need to change it.
   ========================================================================== */
const FULL_NAME = "Patel Harikrushna";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   HERO NAME INJECTION
   ========================================================================== */
const heroNameEl = document.querySelector('#heroName .scramble');
if (heroNameEl) {
  heroNameEl.textContent = FULL_NAME;
  heroNameEl.setAttribute('data-text', FULL_NAME);
}

/* ==========================================================================
   SCRAMBLE / DECRYPT TEXT EFFECT
   ========================================================================== */
function scrambleText(el, finalText, duration) {
  if (!el) return;
  if (prefersReducedMotion) { el.textContent = finalText; return; }

  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01<>-_/[]{}=+*#";
  const totalFrames = Math.max(10, Math.round((duration || 900) / 30));
  let frame = 0;

  function step() {
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      if (finalText[i] === " ") { out += " "; continue; }
      const revealAt = (i / finalText.length) * totalFrames;
      out += frame > revealAt ? finalText[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
    }
    el.textContent = out;
    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(step);
    } else {
      el.textContent = finalText;
    }
  }
  step();
}

/* ==========================================================================
   CUSTOM CURSOR (pointer:fine devices only)
   ========================================================================== */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');
  dot.style.opacity = '1';
  ring.style.opacity = '1';

  let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
  let targetX = ringX, targetY = ringY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .chip, .edu-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });

  function loop() {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ==========================================================================
   NAVBAR — scroll state + mobile toggle
   ========================================================================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

/* ==========================================================================
   BACK TO TOP
   ========================================================================== */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
  }, { passive: true });
})();

/* ==========================================================================
   THREE.JS — ambient particles + hero centerpiece
   ========================================================================== */
let scene, camera, renderer, particles, heroGroup, icoWire, core, nodes, ring1, ring2;
let mouseNormX = 0, mouseNormY = 0, tiltY = 0, tiltX = 0;
const clock = (window.THREE) ? new THREE.Clock() : null;

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function updateHeroPosition() {
  if (!heroGroup) return;
  const isNarrow = window.innerWidth < 860;
  heroGroup.position.x = isNarrow ? 0 : 2.4;
  const s = isNarrow ? 0.7 : 1;
  heroGroup.userData.baseScale = s;
  heroGroup.scale.setScalar(s);
}

function onThreeResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateHeroPosition();
}

function onMouseMoveThree(e) {
  mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;
}

function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!window.THREE || !canvas || !supportsWebGL()) {
    canvas && (canvas.style.display = 'none');
    return false;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  /* ---- ambient particle field ---- */
  const particleCount = window.innerWidth < 768 ? 450 : 900;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 42;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 42;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00e5ff,
    size: 0.045,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  particles = new THREE.Points(particleGeo, particleMat);
  particles.userData.baseOpacity = 0.5;
  scene.add(particles);

  /* ---- hero centerpiece: wireframe icosahedron + core + nodes + rings ---- */
  heroGroup = new THREE.Group();

  const icoGeo = new THREE.IcosahedronGeometry(2.1, 1);

  const icoEdges = new THREE.EdgesGeometry(icoGeo);
  const icoLineMat = new THREE.LineBasicMaterial({ color: 0x35e8ff, transparent: true, opacity: 0.55 });
  icoWire = new THREE.LineSegments(icoEdges, icoLineMat);
  icoWire.userData.baseOpacity = 0.55;
  heroGroup.add(icoWire);

  const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
  core = new THREE.Mesh(coreGeo, coreMat);
  core.userData.baseOpacity = 0.08;
  heroGroup.add(core);

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', icoGeo.attributes.position.clone());
  const nodeMat = new THREE.PointsMaterial({
    color: 0x9ff3ff, size: 0.09, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  nodes = new THREE.Points(nodeGeo, nodeMat);
  nodes.userData.baseOpacity = 0.9;
  heroGroup.add(nodes);

  const ringGeo = new THREE.TorusGeometry(3.15, 0.008, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f7dfd, transparent: true, opacity: 0.35 });
  ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2.3;
  ring1.userData.baseOpacity = 0.35;
  heroGroup.add(ring1);

  ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
  ring2.rotation.x = Math.PI / 3.1;
  ring2.rotation.y = Math.PI / 4;
  ring2.userData.baseOpacity = 0.35;
  heroGroup.add(ring2);

  scene.add(heroGroup);
  updateHeroPosition();

  window.addEventListener('resize', onThreeResize);
  window.addEventListener('mousemove', onMouseMoveThree);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clock.getDelta();
  });

  animateThree();
  return true;
}

function animateThree() {
  if (document.hidden) {
    requestAnimationFrame(animateThree);
    return;
  }
  requestAnimationFrame(animateThree);
  const t = clock.getElapsedTime();

  if (particles) {
    particles.rotation.y = t * 0.015;
    particles.rotation.x = t * 0.008;
  }

  if (heroGroup) {
    const targetTiltY = mouseNormX * 0.55;
    const targetTiltX = mouseNormY * 0.35;
    tiltY += (targetTiltY - tiltY) * 0.04;
    tiltX += (targetTiltX - tiltX) * 0.04;

    heroGroup.rotation.y = t * (prefersReducedMotion ? 0.03 : 0.12) + tiltY;
    heroGroup.rotation.x = tiltX;
    heroGroup.position.y = prefersReducedMotion ? 0 : Math.sin(t * 0.6) * 0.18;

    ring1.rotation.z = t * 0.25;
    ring2.rotation.z = -t * 0.18;
  }

  renderer.render(scene, camera);
}

const threeReady = initThree();

/* ---- fade the hero centerpiece out as the user scrolls past it ---- */
function initHeroScrollFade() {
  if (!threeReady || !window.gsap || !window.ScrollTrigger || !heroGroup) return;
  ScrollTrigger.create({
    trigger: '#home',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const fade = 1 - self.progress;
      [icoWire, core, nodes, ring1, ring2].forEach(obj => {
        obj.material.opacity = obj.userData.baseOpacity * fade;
      });
      const baseScale = heroGroup.userData.baseScale || 1;
      heroGroup.scale.setScalar(baseScale * (0.85 + fade * 0.15));
      if (particles) particles.material.opacity = particles.userData.baseOpacity * (0.4 + fade * 0.6);
    }
  });
}

/* ==========================================================================
   PRELOADER — boot sequence, then hands off to hero intro
   ========================================================================== */
function hidePreloaderAndStart() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('is-hidden');
  }
  playHeroIntro();
  initScrollReveals();
  initHeroScrollFade();
}

(function runPreloader() {
  const bar = document.getElementById('preloaderBar');
  const status = document.getElementById('preloaderStatus');
  const percent = document.getElementById('preloaderPercent');
  const messages = ['INITIALIZING_SYSTEM', 'LOADING_MODULES', 'COMPILING_ARCHITECTURE', 'READY'];
  let msgIndex = 0;
  let done = false;

  function setProgress(p) {
    if (bar) bar.style.width = p + '%';
    if (percent) percent.textContent = Math.round(p) + '%';
  }

  const msgInterval = setInterval(() => {
    if (done) { clearInterval(msgInterval); return; }
    msgIndex = (msgIndex + 1) % messages.length;
    if (status) status.textContent = messages[msgIndex];
  }, 420);

  let fakeProgress = 0;
  const progressInterval = setInterval(() => {
    if (done) { clearInterval(progressInterval); return; }
    fakeProgress += (90 - fakeProgress) * 0.14;
    setProgress(fakeProgress);
  }, 90);

  function finish() {
    if (done) return;
    done = true;
    clearInterval(msgInterval);
    clearInterval(progressInterval);
    if (status) status.textContent = 'READY';
    setProgress(100);
    setTimeout(hidePreloaderAndStart, 320);
  }

  const minTime = new Promise(resolve => setTimeout(resolve, 900));
  const loaded = new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  Promise.all([minTime, loaded]).then(finish);

  // Safety net: never let the preloader get stuck.
  setTimeout(finish, 4000);
})();

/* ==========================================================================
   HERO ENTRANCE TIMELINE
   ========================================================================== */
function playHeroIntro() {
  const heroEls = {
    badge: document.querySelector('.status-badge'),
    name: document.getElementById('heroName'),
    title: document.querySelector('.hero-title'),
    subtitle: document.querySelector('.hero-subtitle'),
    actions: document.querySelector('.hero-actions'),
    scroll: document.getElementById('scrollIndicator')
  };

  if (!window.gsap) {
    Object.values(heroEls).forEach(el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
    scrambleText(document.querySelector('#heroName .scramble'), FULL_NAME, 700);
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (heroEls.badge) tl.to(heroEls.badge, { opacity: 1, y: 0, duration: 0.6 });
  if (heroEls.name) tl.to(heroEls.name, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
  tl.add(() => scrambleText(document.querySelector('#heroName .scramble'), FULL_NAME, 800), '-=0.5');
  if (heroEls.title) tl.to(heroEls.title, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35');
  if (heroEls.subtitle) tl.to(heroEls.subtitle, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
  if (heroEls.actions) tl.to(heroEls.actions, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
  if (heroEls.scroll) tl.to(heroEls.scroll, { opacity: 1, duration: 0.6 }, '-=0.2');
}

/* ==========================================================================
   SCROLL REVEALS (About / Skills / Experience / Contact)
   ========================================================================== */
function animateEduRings(section) {
  const circumference = 326.73;
  section.querySelectorAll('.edu-ring').forEach(ring => {
    const percentVal = parseFloat(ring.dataset.percent);
    const circle = ring.querySelector('.edu-ring-fill');
    if (!circle || isNaN(percentVal)) return;
    const targetOffset = circumference - (circumference * percentVal / 100);
    gsap.to(circle, {
      strokeDashoffset: targetOffset,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none reverse' }
    });
  });
}

function initScrollReveals() {
  const fallbackShow = () => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  };

  if (!window.gsap || !window.ScrollTrigger) {
    fallbackShow();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('section.section').forEach(section => {
      const up = section.querySelectorAll('.reveal');
      if (up.length) {
        gsap.to(up, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none reverse' }
        });
      }

      const scaleUp = section.querySelectorAll('.reveal-scale');
      if (scaleUp.length) {
        gsap.to(scaleUp, {
          opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none reverse' }
        });
      }

      const left = section.querySelectorAll('.reveal-left');
      if (left.length) {
        gsap.to(left, {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
      }

      const right = section.querySelectorAll('.reveal-right');
      if (right.length) {
        gsap.to(right, {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
      }

      if (section.id === 'about') animateEduRings(section);
    });
  } catch (e) {
    fallbackShow();
  }
}