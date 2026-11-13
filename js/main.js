/* ==========================================================================
   JMH Travel Solutions Ltd — Client-Side Dispatch Console & Quote Interactions
   Mobile Nav, Lightbox, Presets, Micro-Toast, 7–70 Matcher & Digital Receipt
   ========================================================================== */

(function () {
  'use strict';

  var CONSOLE_STORAGE_KEY = 'jmhCharterConsole';
  var toastTimer = null;

  var DISPATCH_PRESETS = {
    airport8: {
      label: '8-Seat Executive Airport Return',
      type: 'hire',
      pax: 8,
      spec: 'Executive',
      trip: 'Return Journey',
      luggage: 'Full airport suitcases + cabin bags',
      pickup: 'Eaglescliffe / Stockton-on-Tees',
      dropoff: 'Newcastle International Airport',
      outTime: '06:30',
      retTime: '19:00',
      notes: 'Door-to-terminal airport return with suitcase luggage space.'
    },
    group16: {
      label: '16-Seat Group Match/Race Day',
      type: 'hire',
      pax: 16,
      spec: 'Executive',
      trip: 'Return Journey',
      luggage: 'Hand luggage only',
      pickup: 'Yarm / Stockton-on-Tees',
      dropoff: 'York Racecourse',
      outTime: '10:30',
      retTime: '18:30',
      notes: 'Group hospitality return charter — morning outbound, evening return.'
    },
    coach53: {
      label: '53-Seat Corporate/School Coach',
      type: 'hire',
      pax: 53,
      spec: 'Executive',
      trip: 'Return Journey',
      luggage: 'Standard overnight bags',
      pickup: 'Stockton-on-Tees',
      dropoff: 'Durham Regional Venue',
      outTime: '08:30',
      retTime: '16:30',
      notes: 'Full-size 53-seat coach movement with scheduled group pickup.'
    },
    psvdriver: {
      label: 'Trade PSV Relief Driver Cover',
      type: 'driver',
      pax: 32,
      spec: 'Standard',
      trip: 'Return Journey',
      luggage: 'Hand luggage only',
      pickup: 'Teesside Operator Depot',
      dropoff: 'North East Contracted Route',
      outTime: '07:15',
      retTime: '16:15',
      notes: 'CPC & DBS-vetted PSV relief driver cover for O-licence operator route.'
    }
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    var toast = document.getElementById('micro-toast');
    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    window.requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
      window.setTimeout(function () {
        if (!toast.classList.contains('is-visible')) {
          toast.hidden = true;
        }
      }, 240);
    }, 2600);
  }

  function toIso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function copyTextToClipboard(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function () {
        fallbackCopy(text, onDone);
      });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* Ignore */
    }
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

  function computeVehicleTier(pax) {
    var n = parseInt(pax, 10);
    if (isNaN(n) || n < 1) return 'Select 7–70 passengers';
    if (n <= 8) return '7–8 Seater MPV / Minibus';
    if (n <= 16) return '16-Seater Minibus';
    if (n <= 35) return '24–35 Seater Midi-Coach';
    if (n <= 70) return '49–70 Seater Executive Coach';
    return 'Multi-Coach Fleet Charter (70+ pax)';
  }

  function computeTierKey(pax) {
    var n = parseInt(pax, 10);
    if (n <= 8) return 'mpv';
    if (n <= 16) return 'minibus';
    if (n <= 35) return 'midi';
    return 'coach';
  }

  function computeCabinBadgeText(pax, spec, mode) {
    if (mode === 'tm' || mode === 'External Transport Manager Enquiry') {
      return '🛡️ DVSA O-Licence Governance';
    }
    if (mode === 'driver' || mode === 'PSV Driver Hire Cover') {
      return '🪪 PSV Relief Cover · ' + computeVehicleTier(pax);
    }
    var n = parseInt(pax, 10) || 16;
    var icon = n <= 8 ? '✈️' : n <= 16 ? '🚐' : n <= 35 ? '🚍' : '🚌';
    return icon + ' ' + computeVehicleTier(n) + ' · ' + (spec || 'Executive');
  }

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('primary-nav');

  function closeMobileNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeMobileNav(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (
        siteNav.classList.contains('is-open') &&
        !siteNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMobileNav(false);
      }
    });
  }

  /* 2. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('photo-lightbox');
  if (lightbox) {
    var lbImg = document.getElementById('lightbox-img');
    var lbCap = document.getElementById('lightbox-caption');
    var lbCta = document.getElementById('lightbox-cta');
    var lbClose = document.getElementById('lightbox-close');
    var lastTrigger = null;

    function openLightbox(triggerEl) {
      var src = triggerEl.getAttribute('data-lightbox-src');
      if (!src) return;
      lastTrigger = triggerEl;
      var innerImg = triggerEl.querySelector('img');
      var caption = triggerEl.getAttribute('data-lightbox-caption') || (innerImg ? innerImg.alt : '');
      var ctaHref = triggerEl.getAttribute('data-lightbox-cta') || 'quote.html#quote-form';

      if (lbImg) {
        lbImg.src = src;
        lbImg.alt = innerImg ? innerImg.alt : caption;
      }
      if (lbCap) lbCap.textContent = caption;
      if (lbCta) lbCta.setAttribute('href', ctaHref);

      if (typeof lightbox.showModal === 'function') {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
    }

    function closeLightbox() {
      if (typeof lightbox.close === 'function' && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }

    document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        openLightbox(el);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(el);
        }
      });
    });

    if (lbClose) {
      lbClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    if (lbCta) {
      lbCta.addEventListener('click', function () {
        var href = lbCta.getAttribute('href') || '';
        if (href.charAt(0) === '#') {
          if (typeof lightbox.close === 'function' && lightbox.open) {
            lightbox.close();
          }
        }
      });
    }
  }

  /* 3. Smart Mobile Action Bar Auto-Clearance (Form & Footer Observer) */
  var mobileBar = document.querySelector('.mobile-action-bar');
  var dockWatchEls = [
    document.getElementById('quote-form'),
    document.querySelector('.site-footer')
  ].filter(Boolean);

  if (mobileBar && dockWatchEls.length && 'IntersectionObserver' in window) {
    var activeHiddenTargets = [];
    var dockObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = activeHiddenTargets.indexOf(entry.target);
        if (entry.isIntersecting && idx === -1) {
          activeHiddenTargets.push(entry.target);
        } else if (!entry.isIntersecting && idx !== -1) {
          activeHiddenTargets.splice(idx, 1);
        }
      });
      mobileBar.classList.toggle('is-dock-hidden', activeHiddenTargets.length > 0);
    }, { threshold: 0.08 });

    dockWatchEls.forEach(function (el) {
      dockObserver.observe(el);
    });
  }

  /* 4. Docked Horizontal Charter Search Console (index.html) */
  var matcherConsole = document.getElementById('charter-matcher-console');
  if (matcherConsole) {
    var paxSlider = document.getElementById('pax-slider');
    var paxReadout = document.getElementById('pax-readout');
    var matchedLabel = document.getElementById('matched-class-label');
    var modeStatus = document.getElementById('console-mode-status');
    var consoleCabinBadge = document.getElementById('console-cabin-badge');
    var consolePresetKey = document.getElementById('console-preset-key');
    var seatGrid = document.getElementById('console-seat-grid');
    var tierPills = matcherConsole.querySelectorAll('[data-tier-key]');
    var stepBtns = matcherConsole.querySelectorAll('[data-pax-step]');
    var consolePresetBtns = matcherConsole.querySelectorAll('[data-dispatch-preset]');
    var seatDots = [];

    if (seatGrid) {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < 70; i++) {
        var dot = document.createElement('span');
        dot.className = 'seat-dot';
        frag.appendChild(dot);
        seatDots.push(dot);
      }
      seatGrid.appendChild(frag);
    }

    function syncConsoleUI() {
      var paxVal = paxSlider ? parseInt(paxSlider.value, 10) : 16;
      if (isNaN(paxVal) || paxVal < 7) paxVal = 7;
      if (paxVal > 70) paxVal = 70;

      var checkedMode = matcherConsole.querySelector('input[name="type"]:checked');
      var checkedSpec = matcherConsole.querySelector('input[name="spec"]:checked');
      var modeVal = checkedMode ? checkedMode.value : 'hire';
      var specVal = checkedSpec ? checkedSpec.value : 'Executive';
      var activeKey = computeTierKey(paxVal);
      var tierLabel = computeVehicleTier(paxVal);

      if (paxReadout) paxReadout.textContent = paxVal + ' Seats';
      if (consoleCabinBadge) {
        consoleCabinBadge.textContent = computeCabinBadgeText(paxVal, specVal, modeVal);
      }

      tierPills.forEach(function (pill) {
        var isMatch = pill.getAttribute('data-tier-key') === activeKey;
        pill.classList.toggle('is-active', isMatch);
      });

      seatDots.forEach(function (dotEl, idx) {
        dotEl.classList.toggle('is-filled', idx < paxVal);
      });

      if (matchedLabel) {
        if (modeVal === 'driver') {
          matchedLabel.textContent = 'PSV Driver Cover · ' + tierLabel;
        } else if (modeVal === 'tm') {
          matchedLabel.textContent = 'DVSA Transport Manager · Up to ' + paxVal + '-Seat Fleet';
        } else {
          matchedLabel.textContent = 'Matched: ' + tierLabel;
        }
      }

      if (modeStatus) {
        if (modeVal === 'driver') {
          modeStatus.textContent = '● CPC / DBS PSV Driver Dispatch';
        } else if (modeVal === 'tm') {
          modeStatus.textContent = '● DVSA O-Licence Governance';
        } else {
          modeStatus.textContent = '● Live Vehicle Capacity Matcher';
        }
      }
    }

    consolePresetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-dispatch-preset');
        var p = DISPATCH_PRESETS[key];
        if (!p) return;

        if (paxSlider) paxSlider.value = String(p.pax);
        var modeR = matcherConsole.querySelector('input[name="type"][value="' + p.type + '"]');
        if (modeR) modeR.checked = true;
        var specR = matcherConsole.querySelector('input[name="spec"][value="' + p.spec + '"]');
        if (specR) specR.checked = true;
        if (consolePresetKey) consolePresetKey.value = key;

        consolePresetBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        syncConsoleUI();
        showToast('✓ Preset loaded: ' + p.label);
      });
    });

    if (paxSlider) {
      paxSlider.addEventListener('input', function () {
        if (consolePresetKey) consolePresetKey.value = '';
        consolePresetBtns.forEach(function (b) { b.classList.remove('is-active'); });
        syncConsoleUI();
      });
      paxSlider.addEventListener('change', syncConsoleUI);
    }

    stepBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!paxSlider) return;
        var delta = parseInt(btn.getAttribute('data-pax-step'), 10) || 0;
        var cur = parseInt(paxSlider.value, 10) || 16;
        var next = Math.min(70, Math.max(7, cur + delta));
        paxSlider.value = String(next);
        if (consolePresetKey) consolePresetKey.value = '';
        consolePresetBtns.forEach(function (b) { b.classList.remove('is-active'); });
        syncConsoleUI();
      });
    });

    tierPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        if (!paxSlider) return;
        var targetPax = parseInt(pill.getAttribute('data-tier-pax'), 10);
        if (!isNaN(targetPax)) {
          paxSlider.value = String(targetPax);
          if (consolePresetKey) consolePresetKey.value = '';
          consolePresetBtns.forEach(function (b) { b.classList.remove('is-active'); });
          syncConsoleUI();
        }
      });
    });

    matcherConsole.addEventListener('change', syncConsoleUI);
    syncConsoleUI();

    matcherConsole.addEventListener('submit', function (event) {
      event.preventDefault();
      var paxVal = paxSlider ? parseInt(paxSlider.value, 10) : 16;
      if (isNaN(paxVal) || paxVal < 7) paxVal = 16;
      var checkedMode = matcherConsole.querySelector('input[name="type"]:checked');
      var checkedSpec = matcherConsole.querySelector('input[name="spec"]:checked');
      var modeVal = checkedMode ? checkedMode.value : 'hire';
      var specVal = checkedSpec ? checkedSpec.value : 'Executive';
      var presetVal = consolePresetKey ? consolePresetKey.value : '';

      try {
        window.localStorage.setItem(
          CONSOLE_STORAGE_KEY,
          JSON.stringify({ pax: paxVal, spec: specVal, type: modeVal, preset: presetVal, ts: Date.now() })
        );
      } catch (e) {
        /* Ignore storage errors */
      }

      var dest =
        'quote.html?pax=' +
        encodeURIComponent(String(paxVal)) +
        '&spec=' +
        encodeURIComponent(specVal) +
        '&type=' +
        encodeURIComponent(modeVal) +
        (presetVal ? '&preset=' + encodeURIComponent(presetVal) : '') +
        '#quote-form';
      window.location.href = dest;
    });
  }

  /* 5. Smart Instant Journey Quote Request Form (quote.html) */
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    var returnWrap = document.getElementById('return-fields-wrap');
    var journeyBlock = document.getElementById('journey-details-fieldset');
    var outboundDateInput = document.getElementById('outbound-date');
    var outboundTimeInput = document.getElementById('outbound-time');
    var returnDateInput = document.getElementById('return-date');
    var returnTimeInput = document.getElementById('return-time');
    var paxInput = document.getElementById('passengers');
    var pickupInput = document.getElementById('pickup-location');
    var dropoffInput = document.getElementById('dropoff-location');
    var luggageSelect = document.getElementById('luggage-level');
    var flightRefInput = document.getElementById('flight-ref');
    var notesInput = document.getElementById('mobility-notes');
    var tierBannerText = document.getElementById('recommended-tier-text');
    var quoteCabinBadge = document.getElementById('quote-cabin-badge');
    var feedbackBox = document.getElementById('form-feedback');
    var carryoverBanner = document.getElementById('console-carryover-banner');

    var sumEnquiry = document.getElementById('sum-enquiry');
    var sumTrip = document.getElementById('sum-trip');
    var sumPax = document.getElementById('sum-pax');
    var sumVehicle = document.getElementById('sum-vehicle');
    var sumSpec = document.getElementById('sum-spec');
    var sumOutbound = document.getElementById('sum-outbound');

    function getCheckedValue(name, fallback) {
      var checked = quoteForm.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : fallback;
    }

    function setPresetField(el, val) {
      if (!el) return;
      if (!el.value || el.getAttribute('data-preset-filled') === 'true') {
        el.value = val;
        el.setAttribute('data-preset-filled', 'true');
        el.setAttribute('aria-invalid', 'false');
        var err = document.getElementById(el.id + '-error');
        if (err) err.textContent = '';
      }
    }

    [outboundDateInput, outboundTimeInput, returnDateInput, returnTimeInput, pickupInput, dropoffInput, notesInput].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        el.removeAttribute('data-preset-filled');
      });
    });

    function applyDispatchPresetToQuote(presetKey, silent) {
      var p = DISPATCH_PRESETS[presetKey];
      if (!p) return;

      var typeMap = { hire: 'enq-hire', driver: 'enq-driver', tm: 'enq-tm' };
      var targetRadio = typeMap[p.type] ? document.getElementById(typeMap[p.type]) : null;
      if (targetRadio) targetRadio.checked = true;

      if (paxInput) paxInput.value = String(p.pax);

      var specRadio = quoteForm.querySelector('input[name="fleet_spec"][value="' + p.spec + '"]');
      if (specRadio) specRadio.checked = true;

      var tripRadio = quoteForm.querySelector('input[name="trip_type"][value="' + p.trip + '"]');
      if (tripRadio) tripRadio.checked = true;

      if (luggageSelect && p.luggage) luggageSelect.value = p.luggage;

      var tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      var tmrwIso = toIso(tmrw);

      setPresetField(outboundDateInput, tmrwIso);
      setPresetField(outboundTimeInput, p.outTime);
      setPresetField(returnDateInput, tmrwIso);
      setPresetField(returnTimeInput, p.retTime);
      setPresetField(pickupInput, p.pickup);
      setPresetField(dropoffInput, p.dropoff);
      setPresetField(notesInput, p.notes);

      document.querySelectorAll('.form-panel [data-dispatch-preset]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-dispatch-preset') === presetKey);
      });

      syncFormState();
      if (!silent) {
        showToast('✓ Loaded: ' + p.label);
      }
    }

    document.querySelectorAll('.form-panel [data-dispatch-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyDispatchPresetToQuote(btn.getAttribute('data-dispatch-preset'), false);
      });
    });

    function applyConsoleParams(paxParam, specParam, typeParam, presetParam) {
      var applied = false;

      if (presetParam && DISPATCH_PRESETS[presetParam]) {
        applyDispatchPresetToQuote(presetParam, true);
        applied = true;
      } else {
        if (paxParam && paxInput) {
          var parsedPax = parseInt(paxParam, 10);
          if (!isNaN(parsedPax) && parsedPax >= 1 && parsedPax <= 140) {
            paxInput.value = String(parsedPax);
            applied = true;
          }
        }
        if (specParam) {
          var specRadio = quoteForm.querySelector('input[name="fleet_spec"][value="' + specParam + '"]');
          if (specRadio) {
            specRadio.checked = true;
            applied = true;
          }
        }
        if (typeParam) {
          var typeMap = { hire: 'enq-hire', driver: 'enq-driver', tm: 'enq-tm' };
          var targetRadio = typeMap[typeParam] ? document.getElementById(typeMap[typeParam]) : null;
          if (targetRadio) {
            targetRadio.checked = true;
            applied = true;
          }
        }
      }

      if (applied && carryoverBanner) {
        carryoverBanner.hidden = false;
      }
    }

    function syncFormState() {
      var enquiryType = getCheckedValue('enquiry_type', 'Minibus / Coach Hire Quote');
      var tripType = getCheckedValue('trip_type', 'Return Journey');
      var specType = getCheckedValue('fleet_spec', 'Executive');
      var paxVal = paxInput ? paxInput.value : '16';
      var recommendedTier = computeVehicleTier(paxVal);

      var isReturn = tripType === 'Return Journey';
      if (returnWrap) returnWrap.hidden = !isReturn;

      var isTransportMgr = enquiryType === 'External Transport Manager Enquiry';
      if (journeyBlock) journeyBlock.hidden = isTransportMgr;

      if (tierBannerText) {
        tierBannerText.textContent = recommendedTier + ' (' + specType + ')';
      }

      if (quoteCabinBadge) {
        quoteCabinBadge.textContent = computeCabinBadgeText(paxVal, specType, enquiryType);
      }

      if (sumEnquiry) sumEnquiry.textContent = enquiryType;
      if (sumTrip) sumTrip.textContent = isTransportMgr ? 'Operator Compliance' : tripType;
      if (sumPax) sumPax.textContent = isTransportMgr ? 'N/A (Operator)' : (paxVal || '—') + ' passengers';
      if (sumVehicle) sumVehicle.textContent = isTransportMgr ? 'Fleet Compliance' : recommendedTier;
      if (sumSpec) sumSpec.textContent = isTransportMgr ? 'DVSA / O-Licence' : specType;
      if (sumOutbound && outboundDateInput) {
        sumOutbound.textContent = outboundDateInput.value ? outboundDateInput.value : 'Select date';
      }
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var paxParam = params.get('pax');
      var specParam = params.get('spec');
      var typeParam = params.get('type');
      var presetParam = params.get('preset');

      if (paxParam || specParam || typeParam || presetParam) {
        applyConsoleParams(paxParam, specParam, typeParam, presetParam);
        try {
          window.localStorage.removeItem(CONSOLE_STORAGE_KEY);
        } catch (err) {
          /* Ignore */
        }
      } else {
        var rawStored = window.localStorage.getItem(CONSOLE_STORAGE_KEY);
        if (rawStored) {
          var parsedStored = JSON.parse(rawStored);
          if (parsedStored && parsedStored.ts && Date.now() - parsedStored.ts < 600000) {
            applyConsoleParams(parsedStored.pax, parsedStored.spec, parsedStored.type, parsedStored.preset);
          }
          window.localStorage.removeItem(CONSOLE_STORAGE_KEY);
        }
      }
    } catch (e) {
      /* Safe fallback */
    }

    quoteForm.addEventListener('change', syncFormState);
    quoteForm.addEventListener('input', syncFormState);
    syncFormState();

    function setFieldError(input, message) {
      if (!input) return;
      var errEl = document.getElementById(input.id + '-error');
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = message;
      } else {
        input.setAttribute('aria-invalid', 'false');
        if (errEl) errEl.textContent = '';
      }
    }

    function isFieldCurrentlyRequired(input) {
      var enquiryType = getCheckedValue('enquiry_type', 'Minibus / Coach Hire Quote');
      var tripType = getCheckedValue('trip_type', 'Return Journey');
      var isTransportMgr = enquiryType === 'External Transport Manager Enquiry';

      if (input.id === 'contact-name' || input.id === 'contact-phone' || input.id === 'contact-email') {
        return true;
      }
      if (isTransportMgr) return false;
      if (
        input.id === 'outbound-date' ||
        input.id === 'outbound-time' ||
        input.id === 'passengers' ||
        input.id === 'pickup-location' ||
        input.id === 'dropoff-location'
      ) {
        return true;
      }
      if (input.id === 'return-date' || input.id === 'return-time') {
        return tripType === 'Return Journey';
      }
      return false;
    }

    function validateField(input) {
      var val = (input.value || '').trim();
      var req = isFieldCurrentlyRequired(input);

      if (req && !val) {
        setFieldError(input, 'Please complete this required field.');
        return false;
      }

      if (input.id === 'passengers' && req) {
        var n = Number(val);
        if (!val || isNaN(n) || n < 1 || n > 140) {
          setFieldError(input, 'Please enter a passenger count between 1 and 140.');
          return false;
        }
      }

      if (input.type === 'email' && val) {
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (!emailOk) {
          setFieldError(input, 'Please enter a valid email address.');
          return false;
        }
      }

      if (input.type === 'tel' && val) {
        var digits = val.replace(/\D/g, '');
        if (digits.length < 7) {
          setFieldError(input, 'Please enter a valid telephone number.');
          return false;
        }
      }

      setFieldError(input, '');
      return true;
    }

    var candidateInputs = [
      outboundDateInput,
      outboundTimeInput,
      returnDateInput,
      returnTimeInput,
      paxInput,
      pickupInput,
      dropoffInput,
      document.getElementById('contact-name'),
      document.getElementById('contact-phone'),
      document.getElementById('contact-email')
    ].filter(Boolean);

    candidateInputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') {
          validateField(input);
        }
      });
    });

    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;

      candidateInputs.forEach(function (input) {
        var ok = validateField(input);
        if (!ok && !firstInvalid) {
          firstInvalid = input;
        }
      });

      if (firstInvalid) {
        if (feedbackBox) {
          feedbackBox.hidden = false;
          feedbackBox.className = 'form-feedback is-error';
          feedbackBox.textContent = 'Please check the highlighted journey or contact fields above before submitting.';
        }
        firstInvalid.focus();
        return;
      }

      var enquiryType = getCheckedValue('enquiry_type', 'Minibus / Coach Hire Quote');
      var isTM = enquiryType === 'External Transport Manager Enquiry';
      var tripType = getCheckedValue('trip_type', 'Return Journey');
      var specType = getCheckedValue('fleet_spec', 'Executive');
      var paxVal = paxInput ? paxInput.value : '16';
      var tierLabel = computeVehicleTier(paxVal);
      var cName = (document.getElementById('contact-name').value || '').trim();
      var cPhone = (document.getElementById('contact-phone').value || '').trim();
      var cEmail = (document.getElementById('contact-email').value || '').trim();

      var serviceSummary = isTM
        ? 'External Transport Manager (DVSA / O-Licence)'
        : enquiryType + ' · ' + paxVal + ' Seats (' + tierLabel + ', ' + specType + ')';

      var scheduleSummary = 'O-Licence & DVSA Compliance Scope';
      if (!isTM) {
        var outStr = (outboundDateInput ? outboundDateInput.value : '') + ' at ' + (outboundTimeInput ? outboundTimeInput.value : '');
        var retStr = tripType === 'Return Journey'
          ? ' | Return: ' + (returnDateInput ? returnDateInput.value : '') + ' at ' + (returnTimeInput ? returnTimeInput.value : '')
          : ' (One-Way)';
        var routeStr = (pickupInput ? pickupInput.value.trim() : '') + ' → ' + (dropoffInput ? dropoffInput.value.trim() : '');
        scheduleSummary = routeStr + ' · Outbound: ' + outStr + retStr;
      }

      var extraParts = [];
      if (!isTM && luggageSelect && luggageSelect.value) extraParts.push('Luggage: ' + luggageSelect.value);
      if (!isTM && flightRefInput && flightRefInput.value.trim()) extraParts.push('Flight: ' + flightRefInput.value.trim());
      if (notesInput && notesInput.value.trim()) extraParts.push(notesInput.value.trim());
      var notesSummary = extraParts.length ? extraParts.join(' · ') : 'None specified';

      var refCode = 'JMH-' + String(Math.floor(1000 + Math.random() * 9000));

      var plainTextSummary = [
        'JMH Travel Solutions Ltd — Enquiry Summary (' + refCode + ')',
        'Client / Operator: ' + cName,
        'Contact: ' + cPhone + ' | ' + cEmail,
        'Service & Tier: ' + serviceSummary,
        'Schedule & Route: ' + scheduleSummary,
        'Notes: ' + notesSummary
      ].join('\n');

      if (feedbackBox) {
        feedbackBox.hidden = false;
        feedbackBox.className = 'form-feedback is-success';
        feedbackBox.innerHTML =
          '<p class="demo-banner-verbatim">Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.</p>' +
          '<div class="owner-receipt-ticket">' +
            '<div class="receipt-head">' +
              '<span class="receipt-title">What JMH Travel Solutions Ltd Receives</span>' +
              '<span class="receipt-ref">Ref: ' + escapeHtml(refCode) + '</span>' +
            '</div>' +
            '<dl class="receipt-dl">' +
              '<div><dt>Client / Operator</dt><dd>' + escapeHtml(cName) + '</dd></div>' +
              '<div><dt>Phone &amp; Email</dt><dd>' + escapeHtml(cPhone + ' · ' + cEmail) + '</dd></div>' +
              '<div class="full-span"><dt>Service &amp; Seat Tier</dt><dd>' + escapeHtml(serviceSummary) + '</dd></div>' +
              '<div class="full-span"><dt>Outbound / Return Dates &amp; Route</dt><dd>' + escapeHtml(scheduleSummary) + '</dd></div>' +
              '<div class="full-span"><dt>Notes &amp; Requirements</dt><dd>' + escapeHtml(notesSummary) + '</dd></div>' +
            '</dl>' +
            '<div class="receipt-actions">' +
              '<button type="button" class="btn btn-emerald btn-sm" id="copy-receipt-btn">Copy Summary</button>' +
              '<button type="button" class="btn btn-outline-dark btn-sm" id="reset-demo-btn">Reset Demo</button>' +
            '</div>' +
          '</div>';

        var copyBtn = document.getElementById('copy-receipt-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            copyTextToClipboard(plainTextSummary, function () {
              copyBtn.textContent = '✓ Summary Copied';
              showToast('✓ Dispatch summary copied to clipboard');
            });
          });
        }

        var resetBtn = document.getElementById('reset-demo-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            quoteForm.reset();
            candidateInputs.forEach(function (inp) { setFieldError(inp, ''); });
            document.querySelectorAll('.form-panel [data-dispatch-preset]').forEach(function (b) {
              b.classList.remove('is-active');
            });
            document.querySelectorAll('.quick-date-chip').forEach(function (c) {
              c.classList.remove('is-selected');
            });
            feedbackBox.hidden = true;
            feedbackBox.innerHTML = '';
            if (carryoverBanner) carryoverBanner.hidden = true;
            syncFormState();
            showToast('Demo form reset');
          });
        }

        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast('✓ Demo enquiry ticket generated (' + refCode + ')');
      }
    });
  }
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Top Header Reading-Progress Hairline (2.5px)
    var hdr = document.querySelector('.site-header') || document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.insertBefore(rail, hdr.firstChild);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // 2. Choreographed Below-the-Fold Scroll Reveals (Never hides above-the-fold)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.blueprint-card, .editorial-photo-card, .compliance-panel');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.96) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Smart Date Defaults + 1-Tap Quick Date Chips
    function toIso(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    function nextWeekday(base, targetDow) {
      var diff = (targetDow - base.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
    }

    var today = new Date();
    var todayIso = toIso(today);
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) {
        input.min = todayIso;
      }
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          {
            label: 'Same Day',
            calc: function () {
              var o = document.getElementById('outbound-date');
              return (o && o.value) ? o.value : todayIso;
            }
          },
          {
            label: '+2 Days',
            calc: function () {
              var o = document.getElementById('outbound-date');
              var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
              return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
            }
          }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Today (Fri)' : 'This Friday'), iso: toIso(fri) },
          { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
        ];
      }

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          var val = p.calc ? p.calc() : p.iso;
          input.value = val;
          input.removeAttribute('data-preset-filled');
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });

    var outEl = document.getElementById('outbound-date');
    var retEl = document.getElementById('return-date');
    if (outEl && retEl) {
      outEl.addEventListener('change', function () {
        if (outEl.value) {
          retEl.min = outEl.value;
          if (retEl.value && retEl.value < outEl.value) {
            retEl.value = outEl.value;
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
