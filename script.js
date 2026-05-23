/* ============================================
   FRAMEWORKS — SHOOTING STARS + INTERACTIONS
   ============================================ */

(function () {
  'use strict';

  // ─── SHOOTING STARS CANVAS ────────────────────────────
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      // Random start position along top or right edge
      const edge = Math.random();
      if (edge < 0.6) {
        // From top
        this.x = Math.random() * canvas.width * 1.2;
        this.y = -10;
      } else {
        // From right
        this.x = canvas.width + 10;
        this.y = Math.random() * canvas.height * 0.5;
      }

      this.len = 160 + Math.random() * 200;
      this.speed = 0.3 + Math.random() * 0.5;
      this.angle = (Math.PI / 4) + (Math.random() * 0.4 - 0.2); // ~45 degrees with variation

      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;

      this.opacity = 0;
      this.maxOpacity = 0.25 + Math.random() * 0.45;
      this.phase = 'in'; // 'in', 'full', 'out'
      this.life = 0;
      this.maxLife = 400 + Math.random() * 400;
      this.thickness = 0.8 + Math.random() * 1.2;

      // Subtle warm tint
      const warmth = Math.random();
      if (warmth < 0.3) {
        this.color = [232, 146, 58]; // Orange accent
      } else if (warmth < 0.5) {
        this.color = [180, 160, 220]; // Soft violet
      } else {
        this.color = [255, 255, 255]; // White
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      // Fade phases
      const fadeIn = 60;
      const fadeOut = 80;
      if (this.life < fadeIn) {
        this.phase = 'in';
        this.opacity = (this.life / fadeIn) * this.maxOpacity;
      } else if (this.life > this.maxLife - fadeOut) {
        this.phase = 'out';
        this.opacity = ((this.maxLife - this.life) / fadeOut) * this.maxOpacity;
      } else {
        this.phase = 'full';
        this.opacity = this.maxOpacity;
      }

      // Off screen or life ended
      if (
        this.life >= this.maxLife ||
        this.x > canvas.width + 200 ||
        this.y > canvas.height + 200 ||
        this.x < -200
      ) {
        this.reset();
      }
    }

    draw() {
      if (this.opacity <= 0) return;

      const tailX = this.x - (this.vx / this.speed) * this.len;
      const tailY = this.y - (this.vy / this.speed) * this.len;

      const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      const [r, g, b] = this.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright head glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness + 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.6})`;
      ctx.fill();
    }
  }

  // Static background stars
  let bgStars = [];

  function createBgStars() {
    bgStars = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2,
        opacity: 0.1 + Math.random() * 0.4,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function initStars() {
    stars = [];
    const count = 8; // Active shooting stars
    for (let i = 0; i < count; i++) {
      const s = new ShootingStar();
      s.life = Math.floor(Math.random() * s.maxLife); // Stagger
      stars.push(s);
    }
  }

  function drawBgStars(time) {
    bgStars.forEach((s) => {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * twinkle})`;
      ctx.fill();
    });
  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBgStars(time);

    stars.forEach((s) => {
      s.update();
      s.draw();
    });

    animFrame = requestAnimationFrame(animate);
  }

  resizeCanvas();
  createBgStars();
  initStars();
  animate(0);

  window.addEventListener('resize', () => {
    resizeCanvas();
    createBgStars();
  });


  // ─── INTERSECTION OBSERVER — REVEAL ANIMATION ────────
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      root: document.getElementById('scroll-container'),
      threshold: 0.15,
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));


  // ─── PACKAGE CTA → SCROLL TO CONTACT ─────────────────
  document.querySelectorAll('.package-card__cta').forEach((btn) => {
    btn.addEventListener('click', () => {
      const packageName = btn.getAttribute('data-package');
      const select = document.getElementById('service');
      const contactSection = document.getElementById('contact');

      // Pre-fill the dropdown if matching option exists
      if (select && packageName) {
        for (let option of select.options) {
          if (option.value === packageName) {
            select.value = packageName;
            break;
          }
        }
      }

      // Scroll to contact
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ─── CONTACT FORM ─────────────────────────────────────
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('submit-btn');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sent ✓';
      submitBtn.style.background = '#2ecc71';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  // ─── YOUTUBE API ──────────────────────────────────────
  window.onYouTubeIframeAPIReady = function() {
    const players = {};
    const iframes = document.querySelectorAll('.video-bg--yt');
    
    iframes.forEach((iframe) => {
      const playerId = iframe.id;
      if (playerId) {
        players[playerId] = new YT.Player(playerId, {
          events: {
            'onReady': function(event) {
              const ytPlayer = players[playerId];
              
              // Mute Toggle Logic
              const muteBtn = document.querySelector(`.video-mute-btn[data-player="${playerId}"]`);
              if (muteBtn) {
                muteBtn.addEventListener('click', function() {
                  if (ytPlayer.isMuted()) {
                    ytPlayer.unMute();
                    muteBtn.dataset.muted = "false";
                    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
                  } else {
                    ytPlayer.mute();
                    muteBtn.dataset.muted = "true";
                    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
                  }
                });
              }

              // Play/Pause Toggle Logic
              const playBtn = document.querySelector(`.video-play-btn[data-player="${playerId}"]`);
              if (playBtn) {
                playBtn.addEventListener('click', function() {
                  const state = ytPlayer.getPlayerState();
                  // state 1 is PLAYING
                  if (state === 1) {
                    ytPlayer.pauseVideo();
                    playBtn.dataset.playing = "false";
                    playBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
                  } else {
                    ytPlayer.playVideo();
                    playBtn.dataset.playing = "true";
                    playBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                  }
                });
              }
            }
          }
        });
      }
    });
  };

  // Load YouTube API script dynamically
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  if(firstScriptTag) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
      document.body.appendChild(tag);
  }

  // ─── PACKAGE BUILDER LOGIC ──────────────────────────────
  const builderState = {
    step: 1,
    service: null,
    packageTier: null,
    reelsCount: null,
    reelTypes: []
  };

  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2a'),
    document.getElementById('step-2b'),
    document.getElementById('step-3')
  ];

  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back-arrow');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  function updateNav() {
    // Show/hide back button
    if (builderState.step === 1) {
      if (btnBack) btnBack.classList.add('hidden');
    } else {
      if (btnBack) btnBack.classList.remove('hidden');
    }

    // Hide navigation entirely if form submitted
    if (document.getElementById('builder-form').classList.contains('hidden')) {
      if (btnNext) btnNext.classList.add('hidden');
      if (btnBack) btnBack.classList.add('hidden');
      return;
    } else {
      if (btnNext) btnNext.classList.remove('hidden');
    }

    // Change Next text on final step
    if (builderState.step === 3) {
      if (btnNext) btnNext.classList.add('hidden'); // We use the form submit button instead
    } else {
      if (btnNext) btnNext.classList.remove('hidden');
      if (btnNext) btnNext.textContent = 'Next';
    }

    validateStep();
  }

  function validateStep() {
    let isValid = false;
    
    if (builderState.step === 1) {
      isValid = builderState.service !== null;
    } else if (builderState.step === 2) {
      if (builderState.service === 'Organic Reel Content') {
        const hasCount = builderState.reelsCount !== null && builderState.reelsCount !== '';
        const hasTypes = builderState.reelTypes.length > 0;
        isValid = hasCount && hasTypes;
      } else {
        isValid = builderState.packageTier !== null;
      }
    } else if (builderState.step === 3) {
      isValid = true;
    }

    // Update Step 2B inline Continue button if present
    const btnContinue = document.getElementById('btn-continue-reels');
    if (btnContinue) {
      if (isValid) {
        btnContinue.classList.remove('disabled');
        btnContinue.removeAttribute('disabled');
      } else {
        btnContinue.classList.add('disabled');
        btnContinue.setAttribute('disabled', 'true');
      }
    }

    if (btnNext) {
      if (isValid) {
        btnNext.classList.remove('disabled');
        btnNext.removeAttribute('disabled');
      } else {
        btnNext.classList.add('disabled');
        btnNext.setAttribute('disabled', 'true');
      }
    }
  }

  function renderStep() {
    // Hide all steps
    steps.forEach(s => {
      if (s) s.classList.remove('builder__step--active');
    });

    let currentStepEl;
    let visualStep = builderState.step;

    if (builderState.step === 1) {
      currentStepEl = steps[0];
    } else if (builderState.step === 2) {
      if (builderState.service === 'Organic Reel Content') {
        currentStepEl = steps[2]; // 2b
      } else {
        currentStepEl = steps[1]; // 2a
      }
    } else if (builderState.step === 3) {
      currentStepEl = steps[3];
      generateSummary();
    }

    if (currentStepEl) {
      currentStepEl.classList.add('builder__step--active');
    }

    // Update Progress
    const pct = ((visualStep - 1) / 2) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `Step ${visualStep} of 3`;

    updateNav();
  }

  function generateSummary() {
    const summaryContainer = document.getElementById('builder-summary');
    if (!summaryContainer) return;

    let html = '';
    
    html += `<div class="summary-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Service: ${builderState.service}</div>`;

    if (builderState.service === 'Organic Reel Content') {
      html += `<div class="summary-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Quantity: ${builderState.reelsCount} reels/month</div>`;
      html += `<div class="summary-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Content Style: ${builderState.reelTypes.join(', ')}</div>`;
    } else {
      html += `<div class="summary-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Package Tier: ${builderState.packageTier}</div>`;
    }

    summaryContainer.innerHTML = html;
  }

  // --- Event Listeners ---

  // Next/Back
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (builderState.step < 3) {
        builderState.step++;
        renderStep();
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (builderState.step > 1) {
        builderState.step--;
        renderStep();
      }
    });
  }

  // Step 2B Continue Button
  const btnContinue = document.getElementById('btn-continue-reels');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      builderState.step = 3;
      renderStep();
    });
  }

  // Single Select Cards (Step 1 & 2A)
  document.querySelectorAll('.builder-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const stepEl = card.closest('.builder__cards');
      
      // Remove selected from siblings
      stepEl.querySelectorAll('.builder-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const stepNum = card.dataset.step;
      const value = card.dataset.value;

      if (stepNum === '1') {
        builderState.service = value;
        // Reset step 2 states if service changes
        builderState.packageTier = null;
        builderState.reelsCount = null;
        builderState.reelTypes = [];
        document.querySelectorAll('#step-2a .builder-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('#step-2b .builder-pill').forEach(c => c.classList.remove('selected'));
        const customWrapper = document.getElementById('custom-count-wrapper');
        const customInput = document.getElementById('custom-count');
        if (customWrapper) customWrapper.classList.add('hidden');
        if (customInput) customInput.value = '';
        
        // Auto-forward on card selection after visual click feedback delay
        setTimeout(() => {
          builderState.step = 2;
          renderStep();
        }, 220);
      } else if (stepNum === '2a') {
        builderState.packageTier = value;
        
        // Auto-forward on card selection after visual click feedback delay
        setTimeout(() => {
          builderState.step = 3;
          renderStep();
        }, 220);
      }

      validateStep();
    });
  });

  // Pills (Step 2B)
  document.querySelectorAll('.builder-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const group = pill.dataset.group;
      const value = pill.dataset.value;
      const isMulti = pill.classList.contains('builder-pill--multi');

      if (!isMulti) {
        // Single select group
        const container = pill.closest('.builder__pills');
        container.querySelectorAll('.builder-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');

        if (group === 'reelsCount') {
          const customWrapper = document.getElementById('custom-count-wrapper');
          if (value === 'Custom') {
            builderState.reelsCount = document.getElementById('custom-count').value || null;
            if (customWrapper) customWrapper.classList.remove('hidden');
          } else {
            builderState.reelsCount = value;
            if (customWrapper) customWrapper.classList.add('hidden');
          }
        }
      } else {
        // Multi select group
        pill.classList.toggle('selected');
        if (group === 'reelTypes') {
          if (pill.classList.contains('selected')) {
            if (!builderState.reelTypes.includes(value)) {
              builderState.reelTypes.push(value);
            }
          } else {
            builderState.reelTypes = builderState.reelTypes.filter(t => t !== value);
          }
        }
      }

      validateStep();
    });
  });

  // Custom Count Input
  const customCountInput = document.getElementById('custom-count');
  if (customCountInput) {
    customCountInput.addEventListener('input', (e) => {
      builderState.reelsCount = e.target.value;
      validateStep();
    });
  }

  // Form Submit
  const builderForm = document.getElementById('builder-form');
  if (builderForm) {
    builderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = builderForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Sending...";
      submitBtn.classList.add('disabled');
      submitBtn.disabled = true;

      const referenceEl = document.getElementById('b-reference');
      
      // Prepare data to send
      const formData = {
        access_key: "6cda8b8d-f38a-4e60-ba33-a73cd759690a",
        subject: "New Custom Quote Request",
        from_name: "Antigravity Package Builder",
        name: document.getElementById('b-name').value,
        email: document.getElementById('b-email').value,
        company: document.getElementById('b-company').value,
        reference_links: referenceEl ? referenceEl.value : "None provided",
        message: document.getElementById('b-message').value,
        selected_service: builderState.service || "None",
        selected_package: builderState.packageTier || "None",
        reel_count: builderState.reelsCount || "None",
        reel_types: builderState.reelTypes && builderState.reelTypes.length > 0 ? builderState.reelTypes.join(", ") : "None"
      };

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          builderForm.classList.add('hidden');
          document.getElementById('builder-success').classList.remove('hidden');
          updateNav(); // Hide nav buttons
        } else {
          alert("Something went wrong. Please try again.");
          submitBtn.innerText = originalText;
          submitBtn.classList.remove('disabled');
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error(error);
        alert("Network error. Please check your connection and try again.");
        submitBtn.innerText = originalText;
        submitBtn.classList.remove('disabled');
        submitBtn.disabled = false;
      }
    });
  }

  // Init
  if (steps[0]) {
    renderStep();
  }

})();
