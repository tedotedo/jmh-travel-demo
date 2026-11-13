/* ==========================================================================
   JMH Travel Solutions Ltd — Concept C: Swiss Charter Calculator & 3-Step App
   Sticky Tab Spy, − / + Seat Calculator, Synced Date Chips & 3-Step Stepper
   ========================================================================== */

(function () {
  'use strict';

  function matchTier(pax) {
    var n = parseInt(pax, 10) || 16;
    if (n <= 8) {
      return {
        title: '7–8 Seater MPV / Minibus',
        desc: 'Door-to-terminal UK airport runs, rail connections, executive hospitality and compact group travel.'
      };
    }
    if (n <= 16) {
      return {
        title: '9–16 Seater Minibus',
        desc: 'Nimble access and versatile seating for corporate site visits, race days, weddings, golf trips and school fixtures.'
      };
    }
    if (n <= 35) {
      return {
        title: '24–35 Seater Midi-Coach',
        desc: 'Balanced touring capacity with dedicated luggage bays for sports clubs, conferences and regional charters.'
      };
    }
    if (n <= 70) {
      return {
        title: '49–70 Seater Full Coach',
        desc: 'High-capacity school contract movement up to 70 seats and long-distance UK Executive touring charters.'
      };
    }
    return {
      title: 'Multi-Coach Fleet Charter (70+ Seats)',
      desc: 'Coordinated multi-vehicle passenger movement tailored to large conferences, schools and events.'
    };
  }

  /* 1. Sticky Pill-Tab Active Highlight */
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

  /* 2. Interactive − / + Seat Counter Calculator */
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

  /* 3. Mobbin 3-Step Charter & PSV Stepper */
  var form = document.getElementById('c-quote-stepper');
  if (!form) return;

  var panes = form.querySelectorAll('[data-s-pane]');
  var stepInds = document.querySelectorAll('[data-s-ind]');
  var paxInput = document.getElementById('c-pax');
  var specSelect = document.getElementById('c-spec');
  var liveMatch = document.getElementById('c-live-match');
  var routeScheduleWrap = document.getElementById('c-route-schedule-wrap');
  var tripKind = document.getElementById('c-trip-kind');
  var returnBox = document.getElementById('c-return-box');
  var outDate = document.getElementById('c-outbound-date');
  var retDate = document.getElementById('c-return-date');
  var pickupInput = document.getElementById('c-pickup');
  var dropoffInput = document.getElementById('c-dropoff');
  var sumService = document.getElementById('c-sum-service');
  var sumRoute = document.getElementById('c-sum-route');
  var feedback = document.getElementById('c-quote-feedback');
  var activeStep = 1;

  function getServiceMode() {
    var r = form.querySelector('input[name="service_mode"]:checked');
    return r ? r.value : 'Minibus / Coach Charter';
  }

  function syncStepperState() {
    var mode = getServiceMode();
    var pax = paxInput ? parseInt(paxInput.value, 10) || 16 : 16;
    var spec = specSelect ? specSelect.value : 'Executive';
    var tier = matchTier(pax).title;

    var isTM = mode === 'External Transport Manager';
    if (routeScheduleWrap) routeScheduleWrap.hidden = isTM;

    var isRet = !tripKind || tripKind.value === 'Return Journey';
    if (returnBox) returnBox.hidden = !isRet;

    if (liveMatch) {
      if (isTM) {
        liveMatch.innerHTML = 'Selected Division: <strong>DVSA External Transport Manager (O-Licence Compliance)</strong>';
      } else if (mode === 'PSV Driver Cover (B2B)') {
        liveMatch.innerHTML = 'Selected Division: <strong>PSV Driver Cover · ' + tier + '</strong>';
      } else {
        liveMatch.innerHTML = 'Auto-Matched Class: <strong>' + tier + ' (' + spec + ')</strong>';
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

  /* Connect Top Calculator & Fleet/B2B Quick Buttons into Stepper */
  var sendBtn = document.getElementById('calc-send-stepper');
  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      if (paxInput && calcInput) paxInput.value = calcInput.value;
      if (specSelect) specSelect.value = calcTrim;
      var hireR = document.getElementById('c-svc-hire');
      if (hireR) hireR.checked = true;
      goToStep(1);
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
      var sec = document.getElementById('instant-quote');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 4. Synced 1-Tap Outbound & Return Date Chips */
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

  if (outDate) {
    outDate.min = todayIso;
    var outChips = document.getElementById('c-out-chips');
    if (outChips) {
      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextDow(today, 5);
      var sat = today.getDay() === 6 ? today : nextDow(today, 6);
      [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
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

  /* 5. Step 3 Contact Validation & Exact Demo Submission Message */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(1)) { goToStep(1); return; }
    if (!validateStep(2)) { goToStep(2); return; }

    var contactEls = [
      document.getElementById('c-contact-name'),
      document.getElementById('c-contact-phone'),
      document.getElementById('c-contact-email')
    ];
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

    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'form-feedback is-success';
      feedback.textContent = 'Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();

