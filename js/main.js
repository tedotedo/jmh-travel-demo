/* ==========================================================================
   JMH Travel Solutions Ltd — Client-Side Fleet & Quote Interactions
   Mobile Navigation, Return Toggle, Dynamic Vehicle Tier & Accessible Validation
   ========================================================================== */

(function () {
  'use strict';

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

  /* 2. Smart Instant Journey Quote Request Form (quote.html) */
  var quoteForm = document.getElementById('quote-form');
  if (!quoteForm) return;

  var returnWrap = document.getElementById('return-fields-wrap');
  var journeyBlock = document.getElementById('journey-details-fieldset');
  var returnDateInput = document.getElementById('return-date');
  var returnTimeInput = document.getElementById('return-time');
  var paxInput = document.getElementById('passengers');
  var tierBannerText = document.getElementById('recommended-tier-text');
  var feedbackBox = document.getElementById('form-feedback');

  /* Summary Sidebar Elements */
  var sumEnquiry = document.getElementById('sum-enquiry');
  var sumTrip = document.getElementById('sum-trip');
  var sumPax = document.getElementById('sum-pax');
  var sumVehicle = document.getElementById('sum-vehicle');
  var sumSpec = document.getElementById('sum-spec');
  var sumOutbound = document.getElementById('sum-outbound');

  function computeVehicleTier(pax) {
    var n = parseInt(pax, 10);
    if (isNaN(n) || n < 1) return 'Select 1–70 passengers';
    if (n <= 8) return '7–8 Seater MPV / Minibus';
    if (n <= 16) return '16-Seater Minibus';
    if (n <= 35) return '24–35 Seater Midi-Coach';
    if (n <= 70) return '49–70 Seater Full-Size Coach';
    return 'Multi-Coach Fleet Charter (70+ pax)';
  }

  function getCheckedValue(name, fallback) {
    var checked = quoteForm.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : fallback;
  }

  function syncFormState() {
    var enquiryType = getCheckedValue('enquiry_type', 'Minibus / Coach Hire Quote');
    var tripType = getCheckedValue('trip_type', 'Return Journey');
    var specType = getCheckedValue('fleet_spec', 'Executive');
    var paxVal = paxInput ? paxInput.value : '16';
    var recommendedTier = computeVehicleTier(paxVal);
    var outboundDate = document.getElementById('outbound-date');

    /* Toggle Return Date & Time visibility */
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

    /* Update Live Dispatch Summary */
    if (sumEnquiry) sumEnquiry.textContent = enquiryType;
    if (sumTrip) sumTrip.textContent = isTransportMgr ? 'Operator Compliance' : tripType;
    if (sumPax) sumPax.textContent = isTransportMgr ? 'N/A (Operator)' : (paxVal || '—') + ' passengers';
    if (sumVehicle) sumVehicle.textContent = isTransportMgr ? 'Fleet Compliance' : recommendedTier;
    if (sumSpec) sumSpec.textContent = isTransportMgr ? 'DVSA / O-Licence' : specType;
    if (sumOutbound && outboundDate) {
      sumOutbound.textContent = outboundDate.value ? outboundDate.value : 'Select date';
    }
  }

  /* Pre-populate from URL query parameters (?pax=16&spec=Executive&type=driver|tm|hire) */
  try {
    var params = new URLSearchParams(window.location.search);
    var paxParam = params.get('pax');
    var specParam = params.get('spec');
    var typeParam = params.get('type');

    if (paxParam && paxInput) {
      var parsedPax = parseInt(paxParam, 10);
      if (!isNaN(parsedPax) && parsedPax >= 1 && parsedPax <= 140) {
        paxInput.value = String(parsedPax);
      }
    }
    if (specParam) {
      var specRadio = quoteForm.querySelector('input[name="fleet_spec"][value="' + specParam + '"]');
      if (specRadio) specRadio.checked = true;
    }
    if (typeParam) {
      var typeMap = {
        hire: 'enq-hire',
        driver: 'enq-driver',
        tm: 'enq-tm'
      };
      var targetRadio = typeMap[typeParam] ? document.getElementById(typeMap[typeParam]) : null;
      if (targetRadio) targetRadio.checked = true;
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

    /* Contact details always required */
    if (input.id === 'contact-name' || input.id === 'contact-phone' || input.id === 'contact-email') {
      return true;
    }

    /* Journey fields required only when journey block is active */
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
