/* JMH Travel Solutions Ltd — Concept D: Where are you going? (demo only)
   Destinations are examples of real North of England places; no routes or prices are confirmed. */
(function () {
  'use strict';

  function ico(d) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var TRIPS = [
    { id: 'airport', name: 'Airport run', icon: ico('<path d="M4 20 L28 12 L24 8 L16 11 L8 6 L5 7 L11 13 L6 15 L3 13 Z"/><path d="M6 26 H26"/>'),
      title: 'Airports', list: ['Teesside International', 'Newcastle', 'Leeds Bradford', 'Manchester'], ph: '[Fixed price – owner to confirm]',
      note: 'Flight numbers and luggage go on the quote form, so pick-up times follow your flight.' },
    { id: 'wedding', name: 'Wedding', icon: ico('<circle cx="12" cy="19" r="7"/><circle cx="20" cy="19" r="7"/><path d="M12 8 L16 4 L20 8"/>'),
      title: 'Weddings', list: ['Guests to the ceremony', 'Ceremony to reception', 'Late return home'], ph: '[Venues served – owner to confirm]',
      note: 'One vehicle or a shuttle between venues.' },
    { id: 'school', name: 'School trip', icon: ico('<path d="M3 13 L16 6 L29 13 L16 20 Z"/><path d="M9 17 V24 Q16 28 23 24 V17"/>'),
      title: 'Schools & clubs', list: ['Day trips', 'Swimming & fixtures', 'Residentials'], ph: '[Contract terms – owner to confirm]',
      note: 'Regular contract runs or one-off trips.' },
    { id: 'races', name: 'Race day', icon: ico('<path d="M6 26 V6"/><path d="M6 7 H24 L20 12 L24 17 H6"/>'),
      title: 'Racecourses', list: ['York', 'Thirsk', 'Redcar', 'Catterick', 'Ripon'], ph: '[Fixed price – owner to confirm]',
      note: 'Door to gate and home again, so nobody is the driver.' },
    { id: 'night', name: 'Night out', icon: ico('<path d="M22 20 A10 10 0 1 1 12 6 A8 8 0 0 0 22 20 Z"/>'),
      title: 'Nights out', list: ['Newcastle', 'York', 'Leeds'], ph: '[Fixed price – owner to confirm]',
      note: 'Late returns available. [Latest return time – owner to confirm]' },
    { id: 'corporate', name: 'Corporate', icon: ico('<rect x="5" y="11" width="22" height="15" rx="2"/><path d="M12 11 V7 H20 V11"/>'),
      title: 'Corporate', list: ['Staff shuttles', 'Conferences & events', 'Site visits'], ph: '[Account terms – owner to confirm]',
      note: 'Standard or executive vehicles.' }
  ];
  var TIERS = [
    { max: 8, seats: 8, name: '7–8 seater' },
    { max: 16, seats: 16, name: '16 seater minibus' },
    { max: 35, seats: 35, name: '24–35 seater midi-coach' },
    { max: 70, seats: 70, name: '49–70 seater coach' }
  ];

  var trip = TRIPS[0], pax = 28;
  var tripsEl = document.querySelector('[data-trips]');

  TRIPS.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'trip'; b.setAttribute('aria-pressed', t === trip ? 'true' : 'false');
    b.innerHTML = t.icon + '<span></span>';
    b.querySelector('span').textContent = t.name;
    b.addEventListener('click', function () {
      trip = t;
      Array.prototype.forEach.call(tripsEl.children, function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      renderRoute(); renderSummary();
    });
    tripsEl.appendChild(b);
  });

  function renderRoute() {
    document.querySelector('[data-route-title]').textContent = trip.title;
    var ul = document.querySelector('[data-route-list]');
    ul.textContent = '';
    trip.list.forEach(function (name) {
      var li = document.createElement('li');
      li.innerHTML = '<span></span><span class="ph"></span>';
      li.firstChild.textContent = name;
      li.lastChild.textContent = trip.ph;
      ul.appendChild(li);
    });
    document.querySelector('[data-route-note]').textContent = trip.note;
  }

  function tierFor(n) { for (var i = 0; i < TIERS.length; i++) if (n <= TIERS[i].max) return TIERS[i]; return TIERS[3]; }

  function renderSize() {
    var t = tierFor(pax);
    document.querySelector('[data-pax-n]').textContent = pax;
    document.querySelector('[data-vehicle]').textContent = t.name;
    var seats = document.querySelector('[data-seats]');
    seats.textContent = '';
    /* Coach plan: 5 rows of 14, middle row is the aisle */
    var n = 0;
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 14; c++) {
        var i = document.createElement('i');
        if (r === 2) i.className = 'gap';
        else { if (n < pax) i.className = 'on'; n++; if (n > t.seats) i.className = 'gap'; }
        seats.appendChild(i);
      }
    }
    var spare = t.seats - pax;
    document.querySelector('[data-spare]').textContent = spare > 0 ? 'Room for ' + spare + ' more, or the luggage.' : 'A full vehicle.';
  }

  function renderSummary() {
    var s = document.querySelector('[data-summary]');
    s.textContent = '';
    [trip.name, pax + ' passengers', tierFor(pax).name].forEach(function (txt) {
      var span = document.createElement('span'); span.textContent = txt; s.appendChild(span);
    });
  }

  document.getElementById('pax').addEventListener('input', function (e) {
    pax = parseInt(e.target.value, 10); renderSize(); renderSummary();
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var now = new Date();
  document.getElementById('q-date').min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  var form = document.querySelector('[data-quote]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = document.querySelector('[data-quote-error]'), done = document.querySelector('[data-quote-done]');
    if (!f.date.value || !f.name.value.trim() || !f.phone.value.trim()) { err.hidden = false; done.hidden = true; return; }
    err.hidden = true; done.hidden = false;
    var d = new Date(f.date.value + 'T12:00:00');
    done.textContent = trip.name + ' for ' + pax + ' on ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
      (f.ret.checked ? ', return' : ', one way') + ' · ' + tierFor(pax).name + '. Demo only, nothing has been sent.';
  });

  renderRoute(); renderSize(); renderSummary();
})();
