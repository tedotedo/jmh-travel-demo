/* ==========================================================================
   JMH Travel Solutions Ltd — Concept C: Swiss Charter Calculator & 3-Step App
   Scroll Hairline, Lightbox, Smart Dock Clearance, 1-Tap Presets & Receipt Ticket
   ========================================================================== */

(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function matchTier(pax) {
    var n = parseInt(pax, 10) || 16;
    if (n <= 8) {
      return {
        shortLabel: '7–8 MPV / Minibus',
        title: '7–8 Seater MPV / Minibus',
        desc: 'Door-to-terminal UK airport runs, rail connections, executive hospitality and compact group travel.'
      };
    }
    if (n <= 16) {
      return {
        shortLabel: '9–16 Minibus',
        title: '9–16 Seater Minibus',
        desc: 'Nimble access and versatile seating for corporate site visits, race days, weddings, golf trips and school fixtures.'
      };
    }
    if (n <= 35) {
      return {
        shortLabel: '24–35 Midi-Coach',
        title: '24–35 Seater Midi-Coach',
        desc: 'Balanced touring capacity with dedicated luggage bays for sports clubs, conferences and regional charters.'
      };
    }
    if (n <= 70) {
      return {
        shortLabel: '49–70 Full Coach',
        title: '49–70 Seater Full Coach',
        desc: 'High-capacity school contract movement up to 70 seats and long-distance UK Executive touring charters.'
      };
    }
    return {
      shortLabel: '70+ Multi-Coach Fleet',
      title: 'Multi-Coach Fleet Charter (70+ Seats)',
      desc: 'Coordinated multi-vehicle passenger movement tailored to large conferences, schools and events.'
    };
  }

  /* 0. Non-Blocking Micro-Toast Helper */
  var toastEl = document.getElementById('c-micro-toast');
  var toastTimer = null;

  function showMicroToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  /* 1. Sticky Header 2.5px Scroll-Progress Hairline */
  var progressRail = document.getElementById('c-scroll-progress');
  var progressTicking = false;

  function updateScrollProgress() {
    progressTicking = false;
    if (!progressRail) return;
    var doc = document.documentElement;
    var maxScroll = doc.scrollHeight - window.innerHeight;
    var ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    progressRail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  if (progressRail) {
    window.addEventListener('scroll', function () {
      if (!progressTicking) {
        progressTicking = true;
        window.requestAnimationFrame(updateScrollProgress);
      }
    }, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  /* 2. Accessible Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('c-photo-lightbox');
  var lightboxImg = document.getElementById('c-lightbox-img');
  var lightboxCaption = document.getElementById('c-lightbox-caption');
  var lightboxClose = document.getElementById('c-lightbox-close');
  var lightboxCta = document.getElementById('c-lightbox-cta');
  var lastLightboxTrigger = null;

  function openLightbox(triggerEl) {
    if (!lightbox || !lightboxImg) return;
    var src = triggerEl.getAttribute('data-lightbox-src');
    var caption = triggerEl.getAttribute('data-lightbox-caption') || '';
    var innerImg = triggerEl.querySelector('img');
    if (!src) return;
    lastLightboxTrigger = triggerEl;
    lightboxImg.src = src;
    lightboxImg.alt = innerImg ? innerImg.alt : caption;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (typeof lightbox.showModal === 'function') {
      if (!lightbox.open) lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function' && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
    if (lastLightboxTrigger && typeof lastLightboxTrigger.focus === 'function') {
      lastLightboxTrigger.focus();
    }
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target && e.target.closest('button, a')) return;
      openLightbox(el);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  if (lightboxCta) {
    lightboxCta.addEventListener('click', function () {
      if (lightbox && lightbox.open) lightbox.close();
    });
  }

  /* 3. Frosted Floating Dock Auto-Clearance Over Form & Footer */
  var floatingDock = document.getElementById('c-floating-dock') || document.querySelector('.swiss-mobile-bar');
  var formTarget = document.getElementById('c-quote-stepper');
  var footerTarget = document.querySelector('.swiss-footer');

  if (floatingDock && 'IntersectionObserver' in window) {
    var visibleTargets = new Set();
    var dockObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visibleTargets.add(entry.target);
        } else {
          visibleTargets.delete(entry.target);
        }
      });
      floatingDock.classList.toggle('is-dock-hidden', visibleTargets.size > 0);
    }, { threshold: 0.01 });

    if (formTarget) dockObserver.observe(formTarget);
    if (footerTarget) dockObserver.observe(footerTarget);
  }

  /* 4. Sticky Pill-Tab Active Highlight */
  var spyTabs = document.querySelectorAll('[data-spy]');
  spyTabs.forEach(function (t) {
    t.addEventListener('click', function () {
      spyTabs.forEach(function (o) { o.classList.toggle('is-current', o === t); });
    });
  });

  if ('IntersectionObserver' in window && spyTabs.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          spyTabs.forEach(function (t) {
            t.classList.toggle('is-current', t.getAttribute('data-spy') === id);
          });
        }
      });
    }, { rootMargin: '-28% 0px -55% 0px' });

    ['calculator', 'fleet', 'b2b-psv', 'instant-quote'].forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }

  /* 5. Interactive − / + Seat Counter Calculator */
  var calcInput = document.getElementById('calc-pax-input');
  var calcTitle = document.getElementById('calc-tier-title');
  var calcDesc = document.getElementById('calc-tier-desc');
  var calcPaxPill = document.getElementById('calc-pax-pill');
  var calcTrimPill = document.getElementById('calc-trim-pill');
  var presetChips = document.querySelectorAll('[data-calc-preset]');
  var trimBtns = document.querySelectorAll('[data-calc-trim]');
  var calcTrim = 'Executive';

  function syncCalculator() {
    var pax = calcInput ? parseInt(calcInput.value, 10) : 16;
    if (isNaN(pax) || pax < 7) pax = 7;
    if (pax > 70) pax = 70;
    if (calcInput) calcInput.value = String(pax);

    var info = matchTier(pax);
    if (calcTitle) calcTitle.textContent = info.title;
    if (calcDesc) calcDesc.textContent = info.desc;
    if (calcPaxPill) calcPaxPill.textContent = pax + ' Passengers';
    if (calcTrimPill) calcTrimPill.textContent = calcTrim + ' Specification';

    presetChips.forEach(function (c) {
      c.classList.toggle('is-active', parseInt(c.getAttribute('data-calc-preset'), 10) === pax);
    });
  }

  document.querySelectorAll('[data-calc-delta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!calcInput) return;
      var d = parseInt(btn.getAttribute('data-calc-delta'), 10) || 0;
      var cur = parseInt(calcInput.value, 10) || 16;
      calcInput.value = String(Math.min(70, Math.max(7, cur + d)));
      syncCalculator();
    });
  });

  if (calcInput) {
    calcInput.addEventListener('change', syncCalculator);
  }

  presetChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!calcInput) return;
      calcInput.value = chip.getAttribute('data-calc-preset') || '16';
      syncCalculator();
    });
  });

  trimBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      calcTrim = btn.getAttribute('data-calc-trim') || 'Executive';
      trimBtns.forEach(function (o) {
        var active = o === btn;
        o.classList.toggle('is-selected', active);
        o.setAttribute('aria-pressed', String(active));
      });
      syncCalculator();
    });
  });

  syncCalculator();

  /* 6. Mobbin 3-Step Charter & PSV Stepper */
  var form = document.getElementById('c-quote-stepper');
  if (!form) return;

  var panes = form.querySelectorAll('[data-s-pane]');
  var stepInds = document.querySelectorAll('[data-s-ind]');
  var paxInput = document.getElementById('c-pax');
  var specSelect = document.getElementById('c-spec');
  var liveMatch = document.getElementById('c-live-match');
  var cabinVisualBadge = document.getElementById('c-cabin-visual-badge');
  var routeScheduleWrap = document.getElementById('c-route-schedule-wrap');
  var tripKind = document.getElementById('c-trip-kind');
  var returnBox = document.getElementById('c-return-box');
  var outDate = document.getElementById('c-outbound-date');
  var retDate = document.getElementById('c-return-date');
  var pickupInput = document.getElementById('c-pickup');
  var dropoffInput = document.getElementById('c-dropoff');
  var routeNotes = document.getElementById('c-route-notes');
  var sumService = document.getElementById('c-sum-service');
  var sumRoute = document.getElementById('c-sum-route');
  var feedback = document.getElementById('c-quote-feedback');
  var dispatchPresetBtns = document.querySelectorAll('[data-c-preset]');
  var activeStep = 1;

  function toIso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nextDow(base, dow) {
    var diff = (dow - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  }

  var today = new Date();
  var todayIso = toIso(today);
  var tmrwDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var friDate = today.getDay() === 5 ? today : nextDow(today, 5);
  var satDate = today.getDay() === 6 ? today : nextDow(today, 6);

  function getServiceMode() {
    var r = form.querySelector('input[name="service_mode"]:checked');
    return r ? r.value : 'Minibus / Coach Charter';
  }

  function syncStepperState() {
    var mode = getServiceMode();
    var pax = paxInput ? parseInt(paxInput.value, 10) || 16 : 16;
    var spec = specSelect ? specSelect.value : 'Executive';
    var tierInfo = matchTier(pax);
    var tier = tierInfo.title;

    var isTM = mode === 'External Transport Manager';
    var isDriver = mode === 'PSV Driver Cover (B2B)';
    if (routeScheduleWrap) routeScheduleWrap.hidden = isTM;

    var isRet = !tripKind || tripKind.value === 'Return Journey';
    if (returnBox) returnBox.hidden = !isRet;

    if (liveMatch) {
      if (isTM) {
        liveMatch.innerHTML = 'Selected Division: <strong>DVSA External Transport Manager (O-Licence Compliance)</strong>';
      } else if (isDriver) {
        liveMatch.innerHTML = 'Selected Division: <strong>PSV Driver Cover · ' + escapeHtml(tier) + '</strong>';
      } else {
        liveMatch.innerHTML = 'Auto-Matched Class: <strong>' + escapeHtml(tier) + ' (' + escapeHtml(spec) + ')</strong>';
      }
    }

    if (cabinVisualBadge) {
      cabinVisualBadge.classList.remove('is-standard', 'is-b2b');
      if (isTM) {
        cabinVisualBadge.classList.add('is-b2b');
        cabinVisualBadge.innerHTML = '<span class="c-cabin-dot" aria-hidden="true"></span><span>DVSA Transport Manager · O-Licence</span>';
      } else if (isDriver) {
        cabinVisualBadge.classList.add('is-b2b');
        cabinVisualBadge.innerHTML = '<span class="c-cabin-dot" aria-hidden="true"></span><span>Trade PSV CPC/DBS Relief Cover</span>';
      } else {
        if (spec === 'Standard') cabinVisualBadge.classList.add('is-standard');
        cabinVisualBadge.innerHTML = '<span class="c-cabin-dot" aria-hidden="true"></span><span>' + escapeHtml(tierInfo.shortLabel) + ' · ' + escapeHtml(spec) + ' Cabin</span>';
      }
    }

    if (sumService) {
      sumService.textContent = isTM
        ? 'External Transport Manager (DVSA)'
        : mode + ' · ' + pax + ' Seats (' + spec + ')';
    }

    if (sumRoute) {
      if (isTM) {
        sumRoute.textContent = 'O-Licence & DVSA Compliance Enquiry';
      } else {
        var dStr = outDate && outDate.value ? outDate.value : 'Date to confirm';
        var pStr = pickupInput && pickupInput.value ? pickupInput.value : 'North East';
        var destStr = dropoffInput && dropoffInput.value ? dropoffInput.value : 'Destination';
        sumRoute.textContent = dStr + ' · ' + pStr + ' → ' + destStr;
      }
    }
  }

  function setError(el, msg) {
    if (!el) return;
    var err = document.getElementById(el.id + '-error');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = msg;
    } else {
      el.setAttribute('aria-invalid', 'false');
      if (err) err.textContent = '';
    }
  }

  function validateEl(el) {
    if (!el || el.closest('[hidden]')) {
      setError(el, '');
      return true;
    }
    var val = (el.value || '').trim();
    if (el.hasAttribute('required') && !val) {
      setError(el, 'Please complete this required field.');
      return false;
    }
    if (el.type === 'number') {
      var n = parseInt(val, 10);
      if (isNaN(n) || n < 1 || n > 140) {
        setError(el, 'Enter seats from 1 to 140.');
        return false;
      }
    }
    if (el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError(el, 'Enter a valid email address.');
      return false;
    }
    if (el.type === 'tel' && val && val.replace(/\D/g, '').length < 7) {
      setError(el, 'Enter a valid telephone number.');
      return false;
    }
    setError(el, '');
    return true;
  }

  function validateStep(stepNum) {
    if (stepNum === 1) {
      return validateEl(paxInput);
    }
    if (stepNum === 2) {
      var ok1 = validateEl(outDate);
      var ok2 = validateEl(retDate);
      var ok3 = validateEl(pickupInput);
      var ok4 = validateEl(dropoffInput);
      return ok1 && ok2 && ok3 && ok4;
    }
    return true;
  }

  function goToStep(stepNum) {
    activeStep = stepNum;
    panes.forEach(function (p) {
      p.hidden = parseInt(p.getAttribute('data-s-pane'), 10) !== stepNum;
    });
    stepInds.forEach(function (li) {
      var n = parseInt(li.getAttribute('data-s-ind'), 10);
      li.classList.toggle('is-active', n === stepNum);
      li.classList.toggle('is-done', n < stepNum);
      var b = li.querySelector('.s-step-btn');
      if (b) {
        if (n === stepNum) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      }
    });
    syncStepperState();
  }

  document.querySelectorAll('[data-s-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nxt = parseInt(btn.getAttribute('data-s-next'), 10);
      if (validateStep(activeStep)) goToStep(nxt);
    });
  });

  document.querySelectorAll('[data-s-prev]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(parseInt(btn.getAttribute('data-s-prev'), 10));
    });
  });

  document.querySelectorAll('[data-s-jump]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = parseInt(btn.getAttribute('data-s-jump'), 10);
      if (target <= activeStep || validateStep(activeStep)) {
        if (target === 3 && activeStep === 1 && !validateStep(2)) {
          goToStep(2);
          return;
        }
        goToStep(target);
      }
    });
  });

  document.querySelectorAll('[data-step-pax]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!paxInput) return;
      var d = parseInt(btn.getAttribute('data-step-pax'), 10) || 0;
      var cur = parseInt(paxInput.value, 10) || 16;
      paxInput.value = String(Math.min(140, Math.max(1, cur + d)));
      validateEl(paxInput);
      syncStepperState();
    });
  });

  /* 7. 1-Tap Dispatch Presets */
  var PRESET_MAP = {
    airport8: {
      radioId: 'c-svc-hire',
      pax: 8,
      spec: 'Executive',
      tripKind: 'Return Journey',
      outIso: toIso(tmrwDate),
      retIso: toIso(new Date(tmrwDate.getFullYear(), tmrwDate.getMonth(), tmrwDate.getDate() + 2)),
      pickup: 'Eaglescliffe, Stockton-on-Tees',
      dropoff: 'Newcastle International Airport',
      notes: '8-seat Executive airport return — hold suitcases & flight arrival monitoring.',
      toast: 'Preset loaded: 8-Seat Executive Airport Return'
    },
    group16: {
      radioId: 'c-svc-hire',
      pax: 16,
      spec: 'Executive',
      tripKind: 'Return Journey',
      outIso: toIso(satDate),
      retIso: toIso(satDate),
      pickup: 'Stockton-on-Tees / Yarm',
      dropoff: 'York Racecourse',
      notes: '16-seat Executive group race/match day return — midday outbound & evening return.',
      toast: 'Preset loaded: 16-Seat Group Match/Race Day'
    },
    coach53: {
      radioId: 'c-svc-hire',
      pax: 53,
      spec: 'Standard',
      tripKind: 'Return Journey',
      outIso: toIso(friDate),
      retIso: toIso(friDate),
      pickup: 'Eaglescliffe, Stockton-on-Tees',
      dropoff: 'Durham / North East Venue',
      notes: '53-seat full coach corporate/school charter — scheduled morning departure & afternoon return.',
      toast: 'Preset loaded: 53-Seat Corporate/School Coach'
    },
    psvdriver: {
      radioId: 'c-svc-driver',
      pax: 32,
      spec: 'Standard',
      tripKind: 'Return Journey',
      outIso: toIso(tmrwDate),
      retIso: toIso(tmrwDate),
      pickup: 'Stockton-on-Tees Operator Depot',
      dropoff: 'North East Route Corridor',
      notes: 'Trade PSV CPC & DBS relief driver cover — digital tachograph card ready.',
      toast: 'Preset loaded: Trade PSV Relief Driver Cover'
    }
  };

  function applyDispatchPreset(key, silentScroll) {
    var cfg = PRESET_MAP[key];
    if (!cfg) return;

    dispatchPresetBtns.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-c-preset') === key);
    });

    var r = document.getElementById(cfg.radioId);
    if (r) r.checked = true;
    if (paxInput) paxInput.value = String(cfg.pax);
    if (specSelect) specSelect.value = cfg.spec;
    if (tripKind) tripKind.value = cfg.tripKind;
    if (outDate) {
      outDate.value = cfg.outIso;
      if (retDate) retDate.min = cfg.outIso;
    }
    if (retDate) retDate.value = cfg.retIso;
    if (pickupInput) pickupInput.value = cfg.pickup;
    if (dropoffInput) dropoffInput.value = cfg.dropoff;
    if (routeNotes) routeNotes.value = cfg.notes;

    /* Sync top calculator too */
    if (calcInput) {
      calcInput.value = String(Math.min(70, Math.max(7, cfg.pax)));
      calcTrim = cfg.spec;
      trimBtns.forEach(function (tb) {
        var active = tb.getAttribute('data-calc-trim') === calcTrim;
        tb.classList.toggle('is-selected', active);
        tb.setAttribute('aria-pressed', String(active));
      });
      syncCalculator();
    }

    [paxInput, outDate, retDate, pickupInput, dropoffInput].forEach(function (el) {
      setError(el, '');
    });

    goToStep(2);
    showMicroToast(cfg.toast);

    if (!silentScroll) {
      var sec = document.getElementById('instant-quote');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  dispatchPresetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyDispatchPreset(btn.getAttribute('data-c-preset'), true);
    });
  });

  /* Check ?preset= URL parameter carryover */
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var urlPreset = urlParams.get('preset');
    if (urlPreset && PRESET_MAP[urlPreset]) {
      applyDispatchPreset(urlPreset, true);
    }
  } catch (err) {
    /* Ignore URLSearchParams issues on older engines */
  }

  /* Connect Top Calculator & Fleet/B2B Quick Buttons into Stepper */
  var sendBtn = document.getElementById('calc-send-stepper');
  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      if (paxInput && calcInput) paxInput.value = calcInput.value;
      if (specSelect) specSelect.value = calcTrim;
      var hireR = document.getElementById('c-svc-hire');
      if (hireR) hireR.checked = true;
      goToStep(1);
      showMicroToast('Loaded ' + (calcInput ? calcInput.value : '16') + ' seats (' + calcTrim + ') into Step 1');
      var sec = document.getElementById('instant-quote');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.querySelectorAll('[data-quick-stepper]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-quick-stepper');
      var pax = btn.getAttribute('data-q-pax') || '16';
      if (paxInput) paxInput.value = pax;
      var rId = kind === 'driver' ? 'c-svc-driver' : kind === 'tm' ? 'c-svc-tm' : 'c-svc-hire';
      var r = document.getElementById(rId);
      if (r) r.checked = true;
      goToStep(1);
      showMicroToast('Selected configuration loaded into 3-Step Quote');
      var sec = document.getElementById('instant-quote');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 8. Synced 1-Tap Outbound & Return Date Chips */
  if (outDate) {
    outDate.min = todayIso;
    var outChips = document.getElementById('c-out-chips');
    if (outChips) {
      [
        { label: 'Tomorrow', iso: toIso(tmrwDate) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(friDate) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(satDate) }
      ].forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 's-date-chip';
        b.textContent = p.label;
        b.addEventListener('click', function () {
          outDate.value = p.iso;
          outChips.querySelectorAll('.s-date-chip').forEach(function (x) { x.classList.remove('is-selected'); });
          b.classList.add('is-selected');
          outDate.dispatchEvent(new Event('change', { bubbles: true }));
          validateEl(outDate);
          syncStepperState();
        });
        outChips.appendChild(b);
      });
    }
  }

  if (retDate) {
    retDate.min = todayIso;
    var retChips = document.getElementById('c-ret-chips');
    if (retChips) {
      [
        {
          label: 'Same Day',
          calc: function () { return outDate && outDate.value ? outDate.value : todayIso; }
        },
        {
          label: '+2 Days',
          calc: function () {
            var base = outDate && outDate.value ? new Date(outDate.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          }
        }
      ].forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 's-date-chip';
        b.textContent = p.label;
        b.addEventListener('click', function () {
          retDate.value = p.calc();
          retChips.querySelectorAll('.s-date-chip').forEach(function (x) { x.classList.remove('is-selected'); });
          b.classList.add('is-selected');
          validateEl(retDate);
          syncStepperState();
        });
        retChips.appendChild(b);
      });
    }
  }

  if (outDate && retDate) {
    outDate.addEventListener('change', function () {
      if (outDate.value) {
        retDate.min = outDate.value;
        if (retDate.value && retDate.value < outDate.value) {
          retDate.value = outDate.value;
        }
      }
    });
  }

  form.addEventListener('change', syncStepperState);
  form.addEventListener('input', syncStepperState);
  syncStepperState();

  /* 9. Step 3 Contact Validation + Exact Verbatim Demo Notice + Live Owner-Receipt Ticket */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(1)) { goToStep(1); return; }
    if (!validateStep(2)) { goToStep(2); return; }

    var nameEl = document.getElementById('c-contact-name');
    var phoneEl = document.getElementById('c-contact-phone');
    var emailEl = document.getElementById('c-contact-email');
    var contactEls = [nameEl, phoneEl, emailEl];
    var firstBad = null;
    contactEls.forEach(function (el) {
      if (el && !validateEl(el) && !firstBad) firstBad = el;
    });

    if (firstBad) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'form-feedback is-error';
        feedback.textContent = 'Please complete your contact details above before submitting.';
      }
      firstBad.focus();
      return;
    }

    var mode = getServiceMode();
    var isTM = mode === 'External Transport Manager';
    var pax = paxInput ? (parseInt(paxInput.value, 10) || 16) : 16;
    var spec = specSelect ? specSelect.value : 'Executive';
    var tierTitle = matchTier(pax).title;
    var serviceSummary = isTM
      ? 'External Transport Manager (DVSA O-Licence Compliance)'
      : mode + ' · ' + pax + ' Seats · ' + tierTitle + ' (' + spec + ')';

    var isRet = !tripKind || tripKind.value === 'Return Journey';
    var scheduleSummary = isTM
      ? 'Ongoing / Scheduled O-Licence & DVSA Audit Support · Eaglescliffe, Stockton-on-Tees & North East'
      : (outDate && outDate.value ? outDate.value : 'TBC') +
        (isRet && retDate && retDate.value ? ' → Return ' + retDate.value : ' (One-Way)') +
        ' · ' + (pickupInput && pickupInput.value ? pickupInput.value.trim() : 'North East') +
        ' → ' + (dropoffInput && dropoffInput.value ? dropoffInput.value.trim() : 'Destination');

    var notesText = routeNotes && routeNotes.value.trim()
      ? routeNotes.value.trim()
      : 'Standard dispatch confirmation requested.';

    var clientName = nameEl ? nameEl.value.trim() : '';
    var clientPhone = phoneEl ? phoneEl.value.trim() : '';
    var clientEmail = emailEl ? emailEl.value.trim() : '';
    var refCode = 'JMH-' + String(Math.floor(1000 + Math.random() * 9000));

    var plainSummary = [
      'JMH Travel Solutions Ltd — Dispatch Enquiry Summary (' + refCode + ')',
      'Client / Operator: ' + clientName,
      'Phone / Email: ' + clientPhone + ' | ' + clientEmail,
      'Service & Seat Tier: ' + serviceSummary,
      'Dates & Route: ' + scheduleSummary,
      'Notes: ' + notesText
    ].join('\n');

    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'form-feedback is-success';
      feedback.innerHTML =
        '<p class="c-demo-notice-banner">Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.</p>' +
        '<div class="c-receipt-ticket">' +
          '<div class="c-receipt-head">' +
            '<strong>What JMH Travel Solutions Ltd Receives</strong>' +
            '<span class="c-receipt-ref">REF ' + escapeHtml(refCode) + '</span>' +
          '</div>' +
          '<dl class="c-receipt-dl">' +
            '<div class="c-receipt-row">' +
              '<dt>Client / Operator Name</dt>' +
              '<dd>' + escapeHtml(clientName) + '</dd>' +
            '</div>' +
            '<div class="c-receipt-row">' +
              '<dt>Phone &amp; Email</dt>' +
              '<dd>' + escapeHtml(clientPhone) + ' · ' + escapeHtml(clientEmail) + '</dd>' +
            '</div>' +
            '<div class="c-receipt-row">' +
              '<dt>Service &amp; Seat Tier</dt>' +
              '<dd>' + escapeHtml(serviceSummary) + '</dd>' +
            '</div>' +
            '<div class="c-receipt-row">' +
              '<dt>Outbound / Return &amp; Route</dt>' +
              '<dd>' + escapeHtml(scheduleSummary) + '</dd>' +
            '</div>' +
            '<div class="c-receipt-row is-wide">' +
              '<dt>Dispatch / Compliance Notes</dt>' +
              '<dd>' + escapeHtml(notesText) + '</dd>' +
            '</div>' +
          '</dl>' +
          '<div class="c-receipt-actions">' +
            '<button type="button" class="btn btn-emerald btn-sm" id="c-copy-summary-btn">Copy Summary</button>' +
            '<button type="button" class="btn btn-outline-slate btn-sm" id="c-reset-demo-btn">Reset Demo</button>' +
          '</div>' +
        '</div>';

      var copyBtn = document.getElementById('c-copy-summary-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(plainSummary).then(function () {
              copyBtn.textContent = 'Copied ✓';
              showMicroToast('Dispatch summary copied to clipboard');
              setTimeout(function () { copyBtn.textContent = 'Copy Summary'; }, 2200);
            }).catch(function () {
              showMicroToast('Summary ready: ' + refCode);
            });
          } else {
            showMicroToast('Summary ready: ' + refCode);
          }
        });
      }

      var resetBtn = document.getElementById('c-reset-demo-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          form.reset();
          dispatchPresetBtns.forEach(function (b) { b.classList.remove('is-active'); });
          document.querySelectorAll('.s-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          form.querySelectorAll('[aria-invalid]').forEach(function (el) { setError(el, ''); });
          feedback.hidden = true;
          feedback.innerHTML = '';
          goToStep(1);
          showMicroToast('Demo form reset — ready for a new enquiry');
        });
      }

      showMicroToast('Enquiry ticket generated (' + refCode + ')');
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();
