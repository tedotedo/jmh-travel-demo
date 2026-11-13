/* ==========================================================================
   JMH Travel Solutions Ltd — Concept B: Night-Ops Telemetry Interactions
   Snap Fleet Rail, 7–70 Seat Thumb Matcher, Synced Date Chips & Quote Validation
   ========================================================================== */

(function () {
  'use strict';

  function getTierKey(pax) {
    var n = parseInt(pax, 10) || 16;
    if (n <= 8) return 'mpv';
    if (n <= 16) return 'minibus';
    if (n <= 35) return 'midi';
    return 'coach';
  }

  function getTierLabel(pax) {
    var n = parseInt(pax, 10) || 16;
    if (n <= 8) return '7–8 Seater MPV';
    if (n <= 16) return '9–16 Seater Minibus';
    if (n <= 35) return '24–35 Seater Midi-Coach';
    if (n <= 70) return '49–70 Seater Exec Coach';
    return 'Multi-Vehicle Charter (70+ Seats)';
  }

  /* 1. Horizontal Touch-Snap Fleet Rail Arrows */
  var snapRail = document.getElementById('fleet-snap-rail');
  document.querySelectorAll('[data-rail-dir]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!snapRail) return;
      var dir = parseInt(btn.getAttribute('data-rail-dir'), 10) || 1;
      var card = snapRail.querySelector('.tier-snap-card');
      var step = card ? card.getBoundingClientRect().width + 16 : 300;
      snapRail.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
  });

  /* 2. Interactive 7–70 Seat Thumb-Slider Matcher */
  var slider = document.getElementById('b-pax-slider');
  var paxOutput = document.getElementById('b-pax-output');
  var matchedSummary = document.getElementById('b-matched-summary');
  var tierBadges = document.querySelectorAll('[data-badge-tier]');
  var cabinBtns = document.querySelectorAll('[data-cabin-spec]');
  var paxFormInput = document.getElementById('b-pax-input');
  var cabinSelect = document.getElementById('b-cabin-select');
  var quoteLiveChip = document.getElementById('quote-live-chip');
  var activeSpec = 'Executive';

  function updateMatcherUI() {
    var pax = slider ? parseInt(slider.value, 10) : 16;
    if (isNaN(pax) || pax < 7) pax = 7;
    if (pax > 70) pax = 70;

    var key = getTierKey(pax);
    var label = getTierLabel(pax);

    if (paxOutput) paxOutput.textContent = pax + ' Seats';
    if (matchedSummary) matchedSummary.textContent = label + ' · ' + activeSpec + ' Trim';

    tierBadges.forEach(function (b) {
      b.classList.toggle('is-lit', b.getAttribute('data-badge-tier') === key);
    });
  }

  function updateQuoteChip() {
    var formPax = paxFormInput ? parseInt(paxFormInput.value, 10) || 16 : 16;
    var spec = cabinSelect ? cabinSelect.value : 'Executive';
    var checkedSvc = document.querySelector('input[name="service_type"]:checked');
    var svc = checkedSvc ? checkedSvc.value : 'Minibus / Coach Charter';

    if (!quoteLiveChip) return;
    if (svc === 'External Transport Manager') {
      quoteLiveChip.textContent = 'DVSA External Transport Manager';
    } else if (svc === 'PSV Driver Cover (B2B)') {
      quoteLiveChip.textContent = 'PSV Driver Cover · ' + getTierLabel(formPax);
    } else {
      quoteLiveChip.textContent = 'Matched: ' + formPax + ' Seats · ' + spec;
    }
  }

  if (slider) {
    slider.addEventListener('input', updateMatcherUI);
    slider.addEventListener('change', updateMatcherUI);
  }

  document.querySelectorAll('[data-slider-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!slider) return;
      var d = parseInt(btn.getAttribute('data-slider-step'), 10) || 0;
      var cur = parseInt(slider.value, 10) || 16;
      slider.value = String(Math.min(70, Math.max(7, cur + d)));
      updateMatcherUI();
    });
  });

  tierBadges.forEach(function (b) {
    b.addEventListener('click', function () {
      if (!slider) return;
      slider.value = b.getAttribute('data-set-pax') || '16';
      updateMatcherUI();
    });
  });

  cabinBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeSpec = btn.getAttribute('data-cabin-spec') || 'Executive';
      cabinBtns.forEach(function (other) {
        var sel = other === btn;
        other.classList.toggle('is-selected', sel);
        other.setAttribute('aria-pressed', String(sel));
      });
      updateMatcherUI();
    });
  });

  var applyBtn = document.getElementById('b-apply-to-quote');
  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      if (paxFormInput && slider) paxFormInput.value = slider.value;
      if (cabinSelect) cabinSelect.value = activeSpec;
      var hireRadio = document.getElementById('b-svc-hire');
      if (hireRadio) hireRadio.checked = true;
      syncFormVisibility();
      updateQuoteChip();
      var quoteSec = document.getElementById('telemetry-quote');
      if (quoteSec) quoteSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Quick Load Buttons on Fleet Snap Cards */
  document.querySelectorAll('[data-load-quote]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-load-quote');
      var pax = btn.getAttribute('data-pax') || '16';
      if (slider) {
        slider.value = pax;
        updateMatcherUI();
      }
      if (paxFormInput) paxFormInput.value = pax;
      var radioId = mode === 'driver' ? 'b-svc-driver' : mode === 'tm' ? 'b-svc-tm' : 'b-svc-hire';
      var r = document.getElementById(radioId);
      if (r) r.checked = true;
      syncFormVisibility();
      updateQuoteChip();
      var quoteSec = document.getElementById('telemetry-quote');
      if (quoteSec) quoteSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 3. Dynamic Journey / Return Visibility & Synced 1-Tap Date Chips */
  var journeyBlock = document.getElementById('b-journey-fields');
  var tripSelect = document.getElementById('b-trip-type');
  var returnWrap = document.getElementById('b-return-wrap');
  var outDate = document.getElementById('b-outbound-date');
  var retDate = document.getElementById('b-return-date');

  function syncFormVisibility() {
    var checkedSvc = document.querySelector('input[name="service_type"]:checked');
    var isTM = checkedSvc && checkedSvc.value === 'External Transport Manager';
    if (journeyBlock) journeyBlock.hidden = isTM;

    var isReturn = !tripSelect || tripSelect.value === 'Return Journey';
    if (returnWrap) returnWrap.hidden = !isReturn;
  }

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
    var outChips = document.getElementById('b-outbound-chips');
    if (outChips) {
      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextDow(today, 5);
      var sat = today.getDay() === 6 ? today : nextDow(today, 6);
      [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
      ].forEach(function (p) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 't-chip';
        c.textContent = p.label;
        c.addEventListener('click', function () {
          outDate.value = p.iso;
          outChips.querySelectorAll('.t-chip').forEach(function (x) { x.classList.remove('is-selected'); });
          c.classList.add('is-selected');
          outDate.dispatchEvent(new Event('change', { bubbles: true }));
        });
        outChips.appendChild(c);
      });
    }
  }

  if (retDate) {
    retDate.min = todayIso;
    var retChips = document.getElementById('b-return-chips');
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
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 't-chip';
        c.textContent = p.label;
        c.addEventListener('click', function () {
          retDate.value = p.calc();
          retChips.querySelectorAll('.t-chip').forEach(function (x) { x.classList.remove('is-selected'); });
          c.classList.add('is-selected');
          retDate.dispatchEvent(new Event('input', { bubbles: true }));
        });
        retChips.appendChild(c);
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

  updateMatcherUI();
  syncFormVisibility();
  updateQuoteChip();

  /* 4. Form Validation & Exact Demo Submission Message */
  var form = document.getElementById('b-quote-form');
  var feedback = document.getElementById('b-quote-feedback');

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

  function validateField(el) {
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
        setError(el, 'Enter passenger count (1–140).');
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

  if (form) {
    form.addEventListener('change', function () {
      syncFormVisibility();
      updateQuoteChip();
    });
    form.addEventListener('input', updateQuoteChip);

    var reqFields = form.querySelectorAll('[required]');
    reqFields.forEach(function (el) {
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      reqFields.forEach(function (el) {
        if (!validateField(el) && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        if (feedback) {
          feedback.hidden = false;
          feedback.className = 'form-feedback is-error';
          feedback.textContent = 'Please check the highlighted journey or contact fields above.';
        }
        firstInvalid.focus();
        return;
      }

      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'form-feedback is-success';
        feedback.textContent = 'Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
})();

