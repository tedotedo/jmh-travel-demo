/* ==========================================================================
   JMH Travel Solutions Ltd — Concept B: Night-Ops Telemetry Interactions
   Scroll Hairline, 01/06 Snap Rail + Dots, Lightbox, Presets, Dock & Receipt
   ========================================================================== */

(function () {
  'use strict';

  var toastTimer = null;

  var DISPATCH_PRESETS = {
    airport8: {
      label: '8-Seat Executive Airport Return',
      service: 'Minibus / Coach Charter',
      radioId: 'b-svc-hire',
      pax: 8,
      spec: 'Executive',
      trip: 'Return Journey',
      pickup: 'Eaglescliffe / Stockton-on-Tees',
      dropoff: 'Newcastle International Airport',
      notes: 'Door-to-terminal airport return with suitcase luggage space (06:30 outbound).'
    },
    group16: {
      label: '16-Seat Group Match/Race Day',
      service: 'Minibus / Coach Charter',
      radioId: 'b-svc-hire',
      pax: 16,
      spec: 'Executive',
      trip: 'Return Journey',
      pickup: 'Yarm / Stockton-on-Tees',
      dropoff: 'York Racecourse',
      notes: 'Group hospitality return charter — morning outbound, evening return.'
    },
    coach53: {
      label: '53-Seat Corporate/School Coach',
      service: 'Minibus / Coach Charter',
      radioId: 'b-svc-hire',
      pax: 53,
      spec: 'Executive',
      trip: 'Return Journey',
      pickup: 'Stockton-on-Tees',
      dropoff: 'Durham Regional Venue',
      notes: 'Full-size 53-seat coach movement with scheduled group pickup.'
    },
    psvdriver: {
      label: 'Trade PSV Relief Driver Cover',
      service: 'PSV Driver Cover (B2B)',
      radioId: 'b-svc-driver',
      pax: 32,
      spec: 'Standard',
      trip: 'Return Journey',
      pickup: 'Teesside Operator Depot',
      dropoff: 'North East Contracted Route',
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
    var toast = document.getElementById('b-micro-toast');
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

  function getTierIcon(pax) {
    var n = parseInt(pax, 10) || 16;
    if (n <= 8) return '✈️';
    if (n <= 16) return '🚐';
    if (n <= 35) return '🚍';
    return '🚌';
  }

  /* 0. Top Header 2.5px Scroll-Progress Hairline */
  var progressRail = document.getElementById('b-scroll-progress');
  if (progressRail) {
    var ticking = false;
    var syncScrollProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      progressRail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(syncScrollProgress);
      }
    }, { passive: true });
    syncScrollProgress();
  }

  /* 1. Horizontal Touch-Snap Fleet Rail: 01 / 06 Counter + Arrows + Synced Dots */
  var snapRail = document.getElementById('fleet-snap-rail');
  var railCounter = document.getElementById('b-rail-counter');
  var railDotsWrap = document.getElementById('b-rail-dots');

  if (snapRail) {
    var snapCards = Array.prototype.slice.call(snapRail.querySelectorAll('.tier-snap-card'));
    var totalCards = snapCards.length;
    var dotButtons = [];

    function padTwo(num) {
      return String(num).padStart(2, '0');
    }

    if (railDotsWrap && totalCards > 0) {
      snapCards.forEach(function (_, idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'rail-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Scroll to fleet card ' + (idx + 1) + ' of ' + totalCards);
        dot.addEventListener('click', function () {
          var targetCard = snapCards[idx];
          if (targetCard) {
            snapRail.scrollTo({
              left: targetCard.offsetLeft - snapRail.offsetLeft,
              behavior: 'smooth'
            });
          }
        });
        railDotsWrap.appendChild(dot);
        dotButtons.push(dot);
      });
    }

    function updateSnapIndicators() {
      if (!totalCards) return;
      var railRect = snapRail.getBoundingClientRect();
      var bestIdx = 0;
      var bestDist = Infinity;

      var maxScroll = snapRail.scrollWidth - snapRail.clientWidth;
      if (maxScroll > 10 && snapRail.scrollLeft >= maxScroll - 8) {
        bestIdx = totalCards - 1;
      } else {
        snapCards.forEach(function (card, idx) {
          var dist = Math.abs(card.getBoundingClientRect().left - railRect.left);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });
      }

      if (railCounter) {
        railCounter.textContent = padTwo(bestIdx + 1) + ' / ' + padTwo(totalCards);
      }
      dotButtons.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === bestIdx);
      });
    }

    var railTicking = false;
    snapRail.addEventListener('scroll', function () {
      if (!railTicking) {
        railTicking = true;
        window.requestAnimationFrame(function () {
          updateSnapIndicators();
          railTicking = false;
        });
      }
    }, { passive: true });

    document.querySelectorAll('[data-rail-dir]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-rail-dir'), 10) || 1;
        var card = snapCards[0];
        var step = card ? card.getBoundingClientRect().width + 16 : 300;
        snapRail.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });

    updateSnapIndicators();
  }

  /* 1B. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('b-photo-lightbox');
  if (lightbox) {
    var lbImg = document.getElementById('b-lightbox-img');
    var lbCap = document.getElementById('b-lightbox-caption');
    var lbClose = document.getElementById('b-lightbox-close');
    var lbCta = document.getElementById('b-lightbox-cta');
    var lastTrigger = null;

    function openLightbox(triggerEl) {
      var src = triggerEl.getAttribute('data-lightbox-src');
      if (!src) return;
      lastTrigger = triggerEl;
      var innerImg = triggerEl.querySelector('img');
      var cap = triggerEl.getAttribute('data-lightbox-caption') || (innerImg ? innerImg.alt : '');

      if (lbImg) {
        lbImg.src = src;
        lbImg.alt = innerImg ? innerImg.alt : cap;
      }
      if (lbCap) lbCap.textContent = cap;

      if (typeof lightbox.showModal === 'function') {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
    }

    function closeLightbox(restoreFocus) {
      if (typeof lightbox.close === 'function' && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
      if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') {
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
      lbClose.addEventListener('click', function () { closeLightbox(true); });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox(true);
    });

    if (lbCta) {
      lbCta.addEventListener('click', function () {
        closeLightbox(false);
      });
    }
  }

  /* 1C. Frosted Floating Dock Smart Form/Footer Auto-Clearance */
  var floatingDock = document.querySelector('.floating-dock');
  var dockWatchTargets = [
    document.getElementById('b-quote-form'),
    document.querySelector('.telemetry-footer')
  ].filter(Boolean);

  if (floatingDock && dockWatchTargets.length && 'IntersectionObserver' in window) {
    var intersectingList = [];
    var dockObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = intersectingList.indexOf(entry.target);
        if (entry.isIntersecting && idx === -1) {
          intersectingList.push(entry.target);
        } else if (!entry.isIntersecting && idx !== -1) {
          intersectingList.splice(idx, 1);
        }
      });
      floatingDock.classList.toggle('is-dock-hidden', intersectingList.length > 0);
    }, { threshold: 0.01 });

    dockWatchTargets.forEach(function (el) { dockObs.observe(el); });
  }

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
      quoteLiveChip.textContent = '🛡️ DVSA External Transport Manager';
    } else if (svc === 'PSV Driver Cover (B2B)') {
      quoteLiveChip.textContent = '🪪 PSV Driver Cover · ' + getTierLabel(formPax);
    } else {
      quoteLiveChip.textContent = getTierIcon(formPax) + ' ' + getTierLabel(formPax) + ' · ' + spec;
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

  /* 3. Dynamic Journey / Return Visibility, Synced Date Chips & 1-Tap Dispatch Presets */
  var journeyBlock = document.getElementById('b-journey-fields');
  var tripSelect = document.getElementById('b-trip-type');
  var returnWrap = document.getElementById('b-return-wrap');
  var outDate = document.getElementById('b-outbound-date');
  var retDate = document.getElementById('b-return-date');
  var pickupInput = document.getElementById('b-pickup');
  var dropoffInput = document.getElementById('b-dropoff');
  var notesInput = document.getElementById('b-notes');

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
  var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var tmrwIso = toIso(tmrw);

  [outDate, retDate, pickupInput, dropoffInput, notesInput].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      el.removeAttribute('data-preset-filled');
    });
  });

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

  document.querySelectorAll('[data-b-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-b-preset');
      var p = DISPATCH_PRESETS[key];
      if (!p) return;

      var r = document.getElementById(p.radioId);
      if (r) r.checked = true;
      if (paxFormInput) paxFormInput.value = String(p.pax);
      if (cabinSelect) cabinSelect.value = p.spec;
      if (tripSelect) tripSelect.value = p.trip;
      if (slider) {
        slider.value = String(p.pax);
        activeSpec = p.spec;
        cabinBtns.forEach(function (cb) {
          var sel = cb.getAttribute('data-cabin-spec') === p.spec;
          cb.classList.toggle('is-selected', sel);
          cb.setAttribute('aria-pressed', String(sel));
        });
        updateMatcherUI();
      }

      setPresetField(outDate, tmrwIso);
      setPresetField(retDate, tmrwIso);
      setPresetField(pickupInput, p.pickup);
      setPresetField(dropoffInput, p.dropoff);
      setPresetField(notesInput, p.notes);

      document.querySelectorAll('[data-b-preset]').forEach(function (other) {
        other.classList.toggle('is-active', other === btn);
      });

      syncFormVisibility();
      updateQuoteChip();
      showToast('✓ Loaded: ' + p.label);
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
      showToast('✓ Matched ' + (slider ? slider.value : '16') + ' seats (' + activeSpec + ') loaded');
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
      showToast('✓ Selected division loaded into quote console');
      var quoteSec = document.getElementById('telemetry-quote');
      if (quoteSec) quoteSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (outDate) {
    outDate.min = todayIso;
    var outChips = document.getElementById('b-outbound-chips');
    if (outChips) {
      var fri = today.getDay() === 5 ? today : nextDow(today, 5);
      var sat = today.getDay() === 6 ? today : nextDow(today, 6);
      [
        { label: 'Tomorrow', iso: tmrwIso },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
      ].forEach(function (p) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 't-chip';
        c.textContent = p.label;
        c.addEventListener('click', function () {
          outDate.value = p.iso;
          outDate.removeAttribute('data-preset-filled');
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
          retDate.removeAttribute('data-preset-filled');
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

  /* 4. Form Validation & Live Owner-Receipt Digital Enquiry Ticket */
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

      var checkedSvc = form.querySelector('input[name="service_type"]:checked');
      var svc = checkedSvc ? checkedSvc.value : 'Minibus / Coach Charter';
      var isTM = svc === 'External Transport Manager';
      var paxVal = paxFormInput ? paxFormInput.value : '16';
      var specVal = cabinSelect ? cabinSelect.value : 'Executive';
      var tripVal = tripSelect ? tripSelect.value : 'Return Journey';
      var tierStr = getTierLabel(paxVal);
      var cName = (document.getElementById('b-contact-name').value || '').trim();
      var cPhone = (document.getElementById('b-contact-phone').value || '').trim();
      var cEmail = (document.getElementById('b-contact-email').value || '').trim();

      var svcSummary = isTM
        ? 'External Transport Manager (DVSA / O-Licence)'
        : svc + ' · ' + paxVal + ' Seats (' + tierStr + ', ' + specVal + ')';

      var routeSummary = 'O-Licence & DVSA Compliance Scope';
      if (!isTM) {
        var oStr = outDate ? outDate.value : '';
        var rStr = tripVal === 'Return Journey' ? ' | Return: ' + (retDate ? retDate.value : '') : ' (One-Way)';
        var pStr = pickupInput ? pickupInput.value.trim() : '';
        var dStr = dropoffInput ? dropoffInput.value.trim() : '';
        routeSummary = pStr + ' → ' + dStr + ' · Outbound: ' + oStr + rStr;
      }

      var notesVal = notesInput && notesInput.value.trim() ? notesInput.value.trim() : 'None specified';
      var refCode = 'JMH-' + String(Math.floor(1000 + Math.random() * 9000));

      var plainSummary = [
        'JMH Travel Solutions Ltd — Telemetry Enquiry (' + refCode + ')',
        'Client / Operator: ' + cName,
        'Contact: ' + cPhone + ' | ' + cEmail,
        'Service & Tier: ' + svcSummary,
        'Dates & Route: ' + routeSummary,
        'Notes: ' + notesVal
      ].join('\n');

      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'form-feedback is-success';
        feedback.innerHTML =
          '<p class="b-demo-verbatim">Demo only – in the live site this would go straight to JMH Travel Solutions Ltd.</p>' +
          '<div class="b-receipt-ticket">' +
            '<div class="b-receipt-head">' +
              '<span class="b-receipt-title">What JMH Travel Solutions Ltd Receives</span>' +
              '<span class="b-receipt-ref">Ref: ' + escapeHtml(refCode) + '</span>' +
            '</div>' +
            '<dl class="b-receipt-dl">' +
              '<div><dt>Client / Operator</dt><dd>' + escapeHtml(cName) + '</dd></div>' +
              '<div><dt>Phone &amp; Email</dt><dd>' + escapeHtml(cPhone + ' · ' + cEmail) + '</dd></div>' +
              '<div class="full-span"><dt>Service &amp; Seat Tier</dt><dd>' + escapeHtml(svcSummary) + '</dd></div>' +
              '<div class="full-span"><dt>Outbound / Return Dates &amp; Route</dt><dd>' + escapeHtml(routeSummary) + '</dd></div>' +
              '<div class="full-span"><dt>Notes</dt><dd>' + escapeHtml(notesVal) + '</dd></div>' +
            '</dl>' +
            '<div class="b-receipt-actions">' +
              '<button type="button" class="btn btn-emerald-solid btn-sm" id="b-copy-receipt">Copy Summary</button>' +
              '<button type="button" class="btn btn-ghost-light btn-sm" id="b-reset-demo">Reset Demo</button>' +
            '</div>' +
          '</div>';

        var copyBtn = document.getElementById('b-copy-receipt');
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            copyTextToClipboard(plainSummary, function () {
              copyBtn.textContent = '✓ Summary Copied';
              showToast('✓ Dispatch summary copied to clipboard');
            });
          });
        }

        var resetBtn = document.getElementById('b-reset-demo');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            form.reset();
            reqFields.forEach(function (el) { setError(el, ''); });
            document.querySelectorAll('[data-b-preset]').forEach(function (b) { b.classList.remove('is-active'); });
            document.querySelectorAll('.t-chip').forEach(function (c) { c.classList.remove('is-selected'); });
            feedback.hidden = true;
            feedback.innerHTML = '';
            syncFormVisibility();
            updateQuoteChip();
            showToast('Demo form reset');
          });
        }

        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast('✓ Demo enquiry ticket generated (' + refCode + ')');
      }
    });
  }
})();
