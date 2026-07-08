/* ============================================
   FRAMEWORKS — SHOOTING STARS + INTERACTIONS
   ============================================ */

(function () {
  'use strict';

  // ─── CLEAN URL PARAMETERS FROM ADDRESS BAR ────────────
  if (window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    if (url.search) {
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  // ─── SHOOTING STARS CANVAS ────────────────────────────
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animFrame;
  let cw, ch;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.scale(dpr, dpr);
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      // Since stars fade in very softly over 5 seconds, we can safely spawn them 
      // anywhere on the screen rather than strictly on the edges.
      // This guarantees an perfectly even distribution of stars everywhere.
      this.x = Math.random() * cw;
      this.y = Math.random() * ch * 0.8; // Spawn anywhere in the top 80% of screen

      this.len = 400 + Math.random() * 500; // Much longer tails
      // Reduce speed so they move slower and more elegantly
      this.speed = 0.15 + Math.random() * 0.25;
      this.angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 degrees (down-right)

      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;

      this.opacity = 0;
      this.maxOpacity = 0.25 + Math.random() * 0.45;
      this.phase = 'in'; // 'in', 'full', 'out'
      this.life = 0;
      // Stars must live long enough to cross a 2000px screen at slow speed
      // If speed is ~0.2 px/frame, screen cross takes ~10000 frames
      this.maxLife = 6000 + Math.random() * 6000;
      this.thickness = 0.8 + Math.random() * 1.2;

      // Subtle warm tint
      const warmth = Math.random();
      if (warmth < 0.3) {
        this.color = [154, 140, 191]; // Lavender accent
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
      const fadeIn = 300; // ~5 seconds to fade in
      const fadeOut = 400; // ~6 seconds to fade out
      if (this.life < fadeIn) {
        this.phase = 'in';
        // Use ease-in out curve for opacity instead of linear for a smoother look
        const progress = this.life / fadeIn;
        this.opacity = (progress * progress) * this.maxOpacity;
      } else if (this.life > this.maxLife - fadeOut) {
        this.phase = 'out';
        const progress = (this.maxLife - this.life) / fadeOut;
        this.opacity = (progress * progress) * this.maxOpacity;
      } else {
        this.phase = 'full';
        this.opacity = this.maxOpacity;
      }

      // Off screen or life ended
      if (
        this.life >= this.maxLife ||
        this.x > cw + 200 ||
        this.y > ch + 200 ||
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
    const count = Math.floor((cw * ch) / 8000);
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        r: Math.random() * 1.2,
        opacity: 0.1 + Math.random() * 0.4,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function initStars() {
    stars = [];
    const count = 3; // Reduced for a minimalist, cinematic feel
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
    ctx.clearRect(0, 0, cw, ch);

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
    const scrubberIntervals = {};

    function formatTime(sec) {
      if (isNaN(sec) || sec === Infinity || sec < 0) return "0:00";
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // ── Shared UI helpers ──────────────────────────────
    function setPlayIcon(playBtn) {
      if (!playBtn) return;
      playBtn.dataset.playing = "false";
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
    }

    function setPauseIcon(playBtn) {
      if (!playBtn) return;
      playBtn.dataset.playing = "true";
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }

    function setMuteIcon(muteBtn) {
      if (!muteBtn) return;
      muteBtn.dataset.muted = "true";
      muteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    }

    function setUnmuteIcon(muteBtn) {
      if (!muteBtn) return;
      muteBtn.dataset.muted = "false";
      muteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    }

    iframes.forEach((iframe) => {
      const playerId = iframe.id;
      if (!playerId) return;

      players[playerId] = new YT.Player(playerId, {
        events: {
          'onReady': function(event) {
            const ytPlayer = players[playerId];
            event.target.setPlaybackQuality('highres');
            event.target.setPlaybackQuality('hd1080');

            const scrubber = document.querySelector(`.video-timeline[data-player="${playerId}"]`);
            const timeDisplay = document.querySelector(`.video-time[data-player="${playerId}"]`);
            const playBtn = document.querySelector(`.video-play-btn[data-player="${playerId}"]`);
            const muteBtn = document.querySelector(`.video-mute-btn[data-player="${playerId}"]`);
            const wrapper = iframe.closest('.video-wrapper');
            const shield = wrapper ? wrapper.querySelector('.video-shield') : null;
            const thumb = wrapper ? wrapper.querySelector('.video-thumbnail') : null;

            function startUpdateLoop() {
              if (scrubberIntervals[playerId]) return;
              scrubberIntervals[playerId] = setInterval(() => {
                if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && typeof ytPlayer.getDuration === 'function') {
                  const current = ytPlayer.getCurrentTime();
                  const duration = ytPlayer.getDuration();
                  if (duration > 0 && scrubber && timeDisplay) {
                    scrubber.value = (current / duration) * 100;
                    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
                  }
                }
              }, 250);
            }

            function stopUpdateLoop() {
              if (scrubberIntervals[playerId]) {
                clearInterval(scrubberIntervals[playerId]);
                delete scrubberIntervals[playerId];
              }
            }

            function hideThumbnail() {
              if (thumb && !thumb.classList.contains('hidden')) {
                thumb.classList.add('hidden');
              }
            }

            function unmuteAndPlay() {
              // Unmute before playing (browser policy: muted autoplay is allowed, unmuted needs gesture)
              if (ytPlayer && typeof ytPlayer.unMute === 'function') {
                ytPlayer.unMute();
                setUnmuteIcon(muteBtn);
              }
              ytPlayer.playVideo();
            }

            // Shield click: toggle play/pause
            if (shield) {
              shield.addEventListener('click', function() {
                hideThumbnail();
                const state = ytPlayer.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                  ytPlayer.pauseVideo();
                } else {
                  unmuteAndPlay();
                }
                // UI is updated by onStateChange — do NOT update here
              });
            }

            // Play button click: toggle play/pause
            if (playBtn) {
              playBtn.addEventListener('click', function() {
                const state = ytPlayer.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                  ytPlayer.pauseVideo();
                } else {
                  unmuteAndPlay();
                }
                // UI is updated by onStateChange — do NOT update here
              });
            }

            // Mute button click
            if (muteBtn) {
              muteBtn.addEventListener('click', function() {
                if (ytPlayer.isMuted()) {
                  ytPlayer.unMute();
                  setUnmuteIcon(muteBtn);
                } else {
                  ytPlayer.mute();
                  setMuteIcon(muteBtn);
                }
              });
            }

            // Scrubber drag
            if (scrubber) {
              scrubber.addEventListener('input', function() {
                stopUpdateLoop();
                const pct = parseFloat(scrubber.value);
                const duration = ytPlayer.getDuration();
                if (duration > 0) {
                  const targetSec = (pct / 100) * duration;
                  if (timeDisplay) timeDisplay.textContent = `${formatTime(targetSec)} / ${formatTime(duration)}`;
                  ytPlayer.seekTo(targetSec, false);
                }
              });

              scrubber.addEventListener('change', function() {
                const pct = parseFloat(scrubber.value);
                const duration = ytPlayer.getDuration();
                if (duration > 0) {
                  ytPlayer.seekTo((pct / 100) * duration, true);
                }
                // Only restart loop if video is playing
                if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                  startUpdateLoop();
                }
              });
            }
          },

          'onStateChange': function(event) {
            // onStateChange is the SINGLE SOURCE OF TRUTH for all UI updates
            const ytPlayer = event.target;
            const playBtn = document.querySelector(`.video-play-btn[data-player="${playerId}"]`);
            const scrubber = document.querySelector(`.video-timeline[data-player="${playerId}"]`);
            const timeDisplay = document.querySelector(`.video-time[data-player="${playerId}"]`);
            const iframeEl = document.getElementById(playerId);
            const wrapperEl = iframeEl ? iframeEl.closest('.video-wrapper') : null;
            const thumbEl = wrapperEl ? wrapperEl.querySelector('.video-thumbnail') : null;

            if (event.data === YT.PlayerState.ENDED) {
              // Keep showing pause icon during the loop restart (keep button as "playing")
              setPauseIcon(playBtn);
              ytPlayer.seekTo(0, true);
              ytPlayer.playVideo();
              return;
            }

            if (event.data === YT.PlayerState.PLAYING) {
              event.target.setPlaybackQuality('highres');
              event.target.setPlaybackQuality('hd1080');

              // Hide thumbnail
              if (thumbEl && !thumbEl.classList.contains('hidden')) {
                thumbEl.classList.add('hidden');
              }

              // Hide video info
              const infoEl = wrapperEl ? wrapperEl.querySelector('.video-info') : null;
              if (infoEl && !infoEl.classList.contains('hidden')) {
                infoEl.classList.add('hidden');
              }

              setPauseIcon(playBtn);

              // Start scrubber loop
              if (!scrubberIntervals[playerId]) {
                scrubberIntervals[playerId] = setInterval(() => {
                  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && typeof ytPlayer.getDuration === 'function') {
                    const current = ytPlayer.getCurrentTime();
                    const duration = ytPlayer.getDuration();
                    if (duration > 0 && scrubber && timeDisplay) {
                      scrubber.value = (current / duration) * 100;
                      timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
                    }
                  }
                }, 250);
              }

            } else if (event.data === YT.PlayerState.PAUSED) {
              setPlayIcon(playBtn);
              if (scrubberIntervals[playerId]) {
                clearInterval(scrubberIntervals[playerId]);
                delete scrubberIntervals[playerId];
              }

            } else if (event.data === YT.PlayerState.BUFFERING) {
              // Keep current icon during buffering — do not reset to play
            } else {
              // Unstarted (-1) or cued (5)
              setPlayIcon(playBtn);
              if (scrubberIntervals[playerId]) {
                clearInterval(scrubberIntervals[playerId]);
                delete scrubberIntervals[playerId];
              }
            }
          }
        }
      });
    });
  };

  // Load YouTube API script dynamically
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    document.body.appendChild(tag);
  }





  // ─── FAQ ACCORDION ────────────────────────────
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq__header');
    const body = item.querySelector('.faq__body');
    const icon = item.querySelector('.faq__icon');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('faq__item--active');

      // Collapse all active FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('faq__item--active')) {
          otherItem.classList.remove('faq__item--active');
          otherItem.querySelector('.faq__header').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq__body').style.maxHeight = '0';
          otherItem.querySelector('.faq__icon').textContent = '+';
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('faq__item--active');
        header.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = '0';
        icon.textContent = '+';
      } else {
        item.classList.add('faq__item--active');
        header.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
        icon.textContent = '–';
      }
    });
  });

  // ─── VIDEO ENLARGE/FULLSCREEN TOGGLE ─────────────────
  const enlargeBtns = document.querySelectorAll('.video-enlarge-btn');
  enlargeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering parent shield click events
      const wrapper = btn.closest('.video-wrapper');
      if (wrapper) {
        const isEnlarged = wrapper.classList.toggle('is-enlarged');
        
        // Toggle body class to handle scroll lock and parent CSS transforms bug
        if (isEnlarged) {
          document.body.classList.add('has-enlarged-video');
        } else {
          const otherEnlarged = document.querySelector('.video-wrapper.is-enlarged');
          if (!otherEnlarged) {
            document.body.classList.remove('has-enlarged-video');
          }
        }
        
        // Toggle the SVG icon between maximize and minimize
        if (isEnlarged) {
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="10" y1="14" x2="3" y2="21"></line>
            </svg>
          `;
          btn.setAttribute('aria-label', 'Exit full screen');
        } else {
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          `;
          btn.setAttribute('aria-label', 'Enlarge video');
        }
        
        // Force layout recalculation since dimensions changed
        if (typeof recalculateLayout === 'function') {
          setTimeout(recalculateLayout, 100);
        }
      }
    });
  });

  // ─── OPTIMIZED SCROLL-LINKED ANIMATIONS ─────────────────
  const scrollContainer = document.getElementById('scroll-container');
  const heroTrack = document.getElementById('hero-track');
  const heroFirst = document.querySelector('.hero__content--first');
  const heroSecond = document.querySelector('.hero__content--second');
  const footerLogo = document.getElementById('footer-logo');
  const packagesTrack = document.getElementById('packages-track');
  const builderContainer = document.querySelector('.builder__container');
  const footerLinks = document.getElementById('footer-links');
  const builderGlow = document.querySelector('.builder__glow');

  // Cache layout variables to prevent layout thrashing (getBoundingClientRect)
  let containerHeight = 0;
  let heroTrackHeight = 0;
  let heroTrackOffsetTop = 0;
  let packagesTrackHeight = 0;
  let packagesTrackOffsetTop = 0;

  function recalculateLayout() {
    if (scrollContainer) {
      containerHeight = scrollContainer.clientHeight;
    }
    if (heroTrack) {
      heroTrackHeight = heroTrack.offsetHeight;
      heroTrackOffsetTop = heroTrack.offsetTop;
    }
    if (packagesTrack) {
      packagesTrackHeight = packagesTrack.offsetHeight;
      packagesTrackOffsetTop = packagesTrack.offsetTop;
    }
  }

  // Recalculate on load and resize
  window.addEventListener('load', recalculateLayout);
  window.addEventListener('resize', recalculateLayout);
  recalculateLayout();

  let ticking = false;

  function updateAnimations() {
    if (!scrollContainer) return;
    const scrollTop = scrollContainer.scrollTop;

    // 1. Hero Scroll Text Scrub
    if (heroTrack && heroFirst && heroSecond) {
      const totalScrollableHero = heroTrackHeight - containerHeight;
      if (totalScrollableHero > 0) {
        const relativeScrollHero = scrollTop - heroTrackOffsetTop;
        let progress = relativeScrollHero / totalScrollableHero;
        progress = Math.max(0, Math.min(1, progress));

        // Text 1: Progress 0.0 -> 0.45 fade out
        if (progress <= 0.45) {
          const t1Progress = progress / 0.45; // 0 to 1
          heroFirst.style.opacity = (1 - t1Progress).toFixed(3);
          heroFirst.style.transform = `translate(-50%, -50%) translateY(-${t1Progress * 40}px) scale(${1 - t1Progress * 0.05})`;
          heroFirst.style.visibility = 'visible';
        } else {
          heroFirst.style.opacity = '0';
          heroFirst.style.visibility = 'hidden';
        }

        // Text 2: Progress 0.55 -> 1.0 fade in
        if (progress >= 0.55) {
          const t2Progress = (progress - 0.55) / 0.45; // 0 to 1
          heroSecond.style.opacity = t2Progress.toFixed(3);
          heroSecond.style.transform = `translate(-50%, -50%) translateY(${(1 - t2Progress) * 40}px) scale(${0.95 + t2Progress * 0.05})`;
          heroSecond.style.visibility = 'visible';
        } else {
          heroSecond.style.opacity = '0';
          heroSecond.style.visibility = 'hidden';
        }
      }
    }
  }

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateAnimations();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true }); // passive: true optimizes touch scroll performance
  }

})();
