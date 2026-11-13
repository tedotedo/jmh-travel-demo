/* ==========================================================================
   JMH Travel Solutions Ltd — Client-Side Dispatch Console & Quote Interactions
   Mobile Nav, Live 7–70 Seat Visual Matcher & Accessible Quote Validation
   ========================================================================== */

(function () {
  'use strict';

  var CONSOLE_STORAGE_KEY = 'jmhCharterConsole';

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('primary-nav');

  function closeMobileNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) {
      navToggle.focus();
    }
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

  /* 2. Docked Horizontal Charter Search Console (index.html) */
  var matcherConsole = document.getElementById('charter-matcher-console');
  if (matcherConsole) {
    var paxSlider = document.getElementById('pax-slider');
    var paxReadout = document.getElementById('pax-readout');
    var matchedLabel = document.getElementById('matched-class-label');
    var modeStatus = document.getElementById('console-mode-status');
    var seatGrid = document.getElementById('console-seat-grid');
    var tierPills = matcherConsole.querySelectorAll('[data-tier-key]');
    var stepBtns = matcherConsole.querySelectorAll('[data-pax-step]');
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
      var modeVal = checkedMode ? checkedMode.value : 'hire';
      var activeKey = computeTierKey(paxVal);
      var tierLabel = computeVehicleTier(paxVal);

      if (paxReadout) {
        paxReadout.textContent = paxVal + ' Seats';
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

    if (paxSlider) {
      paxSlider.addEventListener('input', syncConsoleUI);
      paxSlider.addEventListener('change', syncConsoleUI);
    }

    stepBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!paxSlider) return;
        var delta = parseInt(btn.getAttribute('data-pax-step'), 10) || 0;
        var cur = parseInt(paxSlider.value, 10) || 16;
        var next = Math.min(70, Math.max(7, cur + delta));
        paxSlider.value = String(next);
        syncConsoleUI();
      });
    });

    tierPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        if (!paxSlider) return;
        var targetPax = parseInt(pill.getAttribute('data-tier-pax'), 10);
        if (!isNaN(targetPax)) {
          paxSlider.value = String(targetPax);
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

      try {
        window.localStorage.setItem(
          CONSOLE_STORAGE_KEY,
          JSON.stringify({ pax: paxVal, spec: specVal, type: modeVal, ts: Date.now() })
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
        '#quote-form';
      window.location.href = dest;
    });
  }

  /* 3. Smart Instant Journey Quote Request Form (quote.html) */
  var quoteForm = document.getElementById('quote-form');
  if (!quoteForm) return;

  var returnWrap = document.getElementById('return-fields-wrap');
  var journeyBlock = document.getElementById('journey-details-fieldset');
  var returnDateInput = document.getElementById('return-date');
  var returnTimeInput = document.getElementById('return-time');
  var paxInput = document.getElementById('passengers');
  var tierBannerText = document.getElementById('recommended-tier-text');
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

  function applyConsoleParams(paxParam, specParam, typeParam) {
    var applied = false;

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
      var typeMap = {
        hire: 'enq-hire',
        driver: 'enq-driver',
        tm: 'enq-tm'
      };
      var targetRadio = typeMap[typeParam] ? document.getElementById(typeMap[typeParam]) : null;
      if (targetRadio) {
        targetRadio.checked = true;
        applied = true;
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
    var outboundDate = document.getElementById('outbound-date');

    var isReturn = tripType === 'Return Journey';
    if (returnWrap) {
      returnWrap.hidden = !isReturn;
    }

    var isTransportMgr = enquiryType === 'External Transport Manager Enquiry';
    if (journeyBlock) {
      journeyBlock.hidden = isTransportMgr;
    }

    if (tierBannerText) {
      tierBannerText.textContent = recommendedTier + ' (' + specType + ')';
    }

    if (sumEnquiry) sumEnquiry.textContent = enquiryType;
    if (sumTrip) sumTrip.textContent = isTransportMgr ? 'Operator Compliance' : tripType;
    if (sumPax) sumPax.textContent = isTransportMgr ? 'N/A (Operator)' : (paxVal || '—') + ' passengers';
    if (sumVehicle) sumVehicle.textContent = isTransportMgr ? 'Fleet Compliance' : recommendedTier;
    if (sumSpec) sumSpec.textContent = isTransportMgr ? 'DVSA / O-Licence' : specType;
    if (sumOutbound && outboundDate) {
      sumOutbound.textContent = outboundDate.value ? outboundDate.value : 'Select date';
    }
  }

  /* Pre-populate from URL query parameters (?pax=16&spec=Executive&type=driver|tm|hire) or localStorage */
  try {
    var params = new URLSearchParams(window.location.search);
    var paxParam = params.get('pax');
    var specParam = params.get('spec');
    var typeParam = params.get('type');

    if (paxParam || specParam || typeParam) {
      applyConsoleParams(paxParam, specParam, typeParam);
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
          applyConsoleParams(parsedStored.pax, parsedStored.spec, parsedStored.type);
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

    if (isTransportMgr) {
      return false;
    }

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
    document.getElementById('outbound-date'),
    document.getElementById('outbound-time'),
    returnDateInput,
    returnTimeInput,
    paxInput,
    document.getElementById('pickup-location'),
    document.getElementById('dropoff-location'),
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

    if (feedbackBox) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'form-feedback is-success';
      feedbackBox.textContent = 'Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.';
      feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle Top Header Reading-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.appendChild(rail);
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

    // 2. Choreographed Below-the-Fold Scroll Reveals (Godly / SiteInspire)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.fleet-class-card, .service-pillar-card, .compliance-card, .corridor-card, .console-panel');
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
        if (rect.top > vh * 0.94) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      // Safety fallback on hash jump so targeted sections reveal immediately
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
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          { label: 'Same Day', calc: function () { var o = document.getElementById('outbound-date'); return (o && o.value) ? o.value : todayIso; } },
          { label: '+2 Days', calc: function () {
            var o = document.getElementById('outbound-date');
            var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          } }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
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
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });

  // Sync return-date min >= outbound-date on charter quote form
  (function () {
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
  })();

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
