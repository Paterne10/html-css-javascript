/* ==============================================================
   FLOW — EXPENSE TRACKER LOGIC
   ------------------------------------------------------------
   This file is loaded at the end of <body>, so all the HTML
   elements it looks up with document.getElementById() already
   exist by the time this code runs.

   Sections in this file:
     1. App state (the variables that hold all the data)
     2. Formatting helpers (money, dates)
     3. Rendering (turns the state into what's on screen)
     4. Custom calendar (the date picker in the modal)
     5. Filters / modal open-close / form handling
     6. First-transaction celebration (confetti + sound)
     7. Global event listeners + first render on page load

   Note on data storage: this demo keeps transactions in a plain
   JavaScript array in memory, so the list resets on page refresh.
   For a real app you'd either save it to localStorage or send it
   to a backend/API — see the comment above `transactions` below.
   ============================================================== */

'use strict'; // catches common mistakes (e.g. typos creating global variables)


/* ---------------------------------------------------------------
   1. APP STATE
   Everything the app needs to remember lives in these variables.
--------------------------------------------------------------- */

// The list of all transactions. Each one looks like:
// { id: 1, type: 'income' | 'expense', amount: 12500, category: 'Food', date: '2026-07-20' }
// TODO (next step): replace this in-memory array with localStorage
// or a fetch() call to your own backend API once you're ready.
let transactions = [];

let nextId = 1;               // simple auto-incrementing id for new transactions
let currentFilter = 'all';    // 'all' | 'income' | 'expense' — which cards are shown
let editingId = null;         // id of the transaction being edited, or null when adding a new one
let currentType = 'expense';  // which toggle is selected in the modal: 'expense' | 'income'
let selectedDate = new Date().toISOString().slice(0, 10); // date chosen in the custom calendar (YYYY-MM-DD)
let calViewYear, calViewMonth;               // which month the calendar popover is currently showing
let hasCelebratedFirstIncome = false;   // makes sure the congrats popup only ever fires once

// Used to animate the balance/income/expense numbers smoothly
// instead of having them jump instantly to the new value.
let lastBalance = 0, lastIncome = 0, lastExpense = 0;


/* ---------------------------------------------------------------
   2. FORMATTING HELPERS
--------------------------------------------------------------- */

// Formats a number as FCFA, e.g. 12500 -> "12 500 FCFA"
function formatCurrency(amount) {
  const sign = amount < 0 ? '-' : '';
  const rounded = Math.round(Math.abs(amount));
  return sign + rounded.toLocaleString('fr-FR') + ' FCFA';
}

// Formats an ISO date string ("2026-07-20") as "Jul 20" for the transaction cards
function formatShortDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Animates a number counting up (or down) smoothly instead of jumping instantly.
function animateNumber(element, from, to, durationMs) {
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / durationMs, 1); // 0 -> 1
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out curve, feels more natural than linear
    const currentValue = from + (to - from) * eased;
    element.textContent = formatCurrency(currentValue);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = formatCurrency(to); // snap to the exact final value
    }
  }
  requestAnimationFrame(step);
}


/* ---------------------------------------------------------------
   3. RENDERING
   render() is the single function that redraws everything based
   on the current `transactions` array. We call it after every
   add, edit, delete, or filter change.
--------------------------------------------------------------- */

function render() {
  // --- Totals ---
  const balance = transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0
  );
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  animateNumber(document.getElementById('balanceDisplay'), lastBalance, balance, 500);
  animateNumber(document.getElementById('incomeTotal'), lastIncome, totalIncome, 500);
  animateNumber(document.getElementById('expenseTotal'), lastExpense, totalExpense, 500);
  lastBalance = balance;
  lastIncome = totalIncome;
  lastExpense = totalExpense;

  // --- Balance gauge (the circular ring) ---
  // We draw it as two overlapping SVG arcs sized proportionally to
  // income and expense, using stroke-dasharray as a "percentage of
  // the circle's circumference" trick.
  const total = totalIncome + totalExpense;
  const circumference = 2 * Math.PI * 82; // 82 = radius of the circle in the SVG
  const incomeArcLength = total > 0 ? (totalIncome / total) * circumference * 0.94 : 0;
  const expenseArcLength = total > 0 ? (totalExpense / total) * circumference * 0.94 : 0;

  const incomeArc = document.getElementById('gaugeIncome');
  const expenseArc = document.getElementById('gaugeExpense');
  incomeArc.setAttribute('stroke-dasharray', `${incomeArcLength} ${circumference}`);
  expenseArc.setAttribute('stroke-dasharray', `${expenseArcLength} ${circumference}`);
  // Rotate the expense arc so it starts right after the income arc ends
  expenseArc.style.transform = `rotate(${(incomeArcLength / circumference) * 360 + (total > 0 ? 4 : 0)}deg)`;
  expenseArc.style.transformOrigin = '95px 95px';

  // --- Transaction list ---
  const visibleTransactions = transactions
    .filter(t => currentFilter === 'all' || t.type === currentFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

  const listContainer = document.getElementById('timelineBody');

  if (visibleTransactions.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="big">No transactions yet</div>
        Add your first income or expense to start the timeline.
      </div>`;
    return;
  }

  // Build one card per transaction. Every value shown here (category, date)
  // comes from a fixed <select> or the calendar picker, never free-typed
  // text, so there's no need to sanitize anything before inserting it.
  listContainer.innerHTML = visibleTransactions.map((t, index) => `
    <div class="tx-card" data-id="${t.id}" style="animation-delay:${Math.min(index, 8) * 35}ms">
      <div class="tx-icon ${t.type}">${t.category.charAt(0)}</div>
      <div class="tx-main">
        <span class="tx-category">${t.category}</span>
        <span class="tx-meta">
          <span>${formatShortDate(t.date)}</span>
        </span>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '−'}${formatCurrency(t.amount)}</span>
        <span class="tx-actions">
          <button class="icon-btn" title="Edit" onclick="editTransaction(${t.id})">✎</button>
          <button class="icon-btn danger" title="Delete" onclick="deleteTransaction(${t.id})">✕</button>
        </span>
      </div>
    </div>
  `).join('');
}


/* ---------------------------------------------------------------
   4. CUSTOM CALENDAR (date picker inside the modal)
--------------------------------------------------------------- */

function updateDateLabel() {
  const date = new Date(selectedDate + 'T00:00:00');
  document.getElementById('dateTriggerLabel').textContent =
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleCalendar() {
  const popover = document.getElementById('calendarPopover');
  const trigger = document.getElementById('dateTrigger');

  if (popover.classList.contains('open')) {
    popover.classList.remove('open');
    trigger.classList.remove('cal-open');
    return;
  }

  // Open the calendar on the month of the currently selected date
  const date = new Date(selectedDate + 'T00:00:00');
  calViewYear = date.getFullYear();
  calViewMonth = date.getMonth();
  renderCalendar();
  popover.classList.add('open');
  trigger.classList.add('cal-open');
}

function changeMonth(delta) {
  calViewMonth += delta;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  renderCalendar();
}

// Draws the day grid for the month currently being viewed in the popover.
function renderCalendar() {
  const title = new Date(calViewYear, calViewMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('calTitle').textContent = title;

  const firstDayOfMonth = new Date(calViewYear, calViewMonth, 1);
  // getDay() returns 0 for Sunday; we want Monday first, hence the +6 % 7 shift
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calViewYear, calViewMonth, 0).getDate();
  const todayISO = new Date().toISOString().slice(0, 10);

  // Build a flat list of day cells: grayed-out days from the previous
  // month to fill the first row, then the real days of this month.
  const cells = [];
  for (let i = startOffset; i > 0; i--) {
    cells.push({ day: daysInPrevMonth - i + 1, isCurrentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, isCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, isCurrentMonth: false }); // padding to finish the last row
  }

  document.getElementById('calDays').innerHTML = cells.map(cell => {
    if (!cell.isCurrentMonth) {
      return `<span class="cal-day muted">${cell.day}</span>`;
    }
    const iso = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    const isSelected = iso === selectedDate;
    const isToday = iso === todayISO;
    const classes = 'cal-day' + (isSelected ? ' selected' : '') + (isToday ? ' today' : '');
    return `<button type="button" class="${classes}" onclick="pickDate('${iso}')">${cell.day}</button>`;
  }).join('');
}

function pickDate(iso) {
  selectedDate = iso;
  updateDateLabel();
  document.getElementById('calendarPopover').classList.remove('open');
  document.getElementById('dateTrigger').classList.remove('cal-open');
}

function selectToday() {
  pickDate(new Date().toISOString().slice(0, 10));
}


/* ---------------------------------------------------------------
   5. FILTERS, MODAL, AND FORM HANDLING
--------------------------------------------------------------- */

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  render();
}

function setType(type) {
  currentType = type;
  document.getElementById('typeExpenseBtn').classList.toggle('active', type === 'expense');
  document.getElementById('typeIncomeBtn').classList.toggle('active', type === 'income');

  const saveButton = document.getElementById('saveBtn');
  saveButton.className = 'btn-primary ' + type;
  saveButton.textContent = (editingId ? 'Save ' : 'Add ') + type;
}

// Resets and opens the modal in "add new transaction" mode
function openModal() {
  editingId = null;
  currentType = 'expense';

  document.getElementById('modalTitle').textContent = 'Add transaction';
  document.getElementById('amountInput').value = '';
  document.getElementById('categoryInput').value = 'Food';
  selectedDate = new Date().toISOString().slice(0, 10);
  updateDateLabel();
  document.getElementById('amountError').style.display = 'none';

  setType('expense');
  document.getElementById('overlay').classList.add('open');
}

// Opens the modal pre-filled with an existing transaction's data
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return; // safety check in case the id no longer exists

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit transaction';
  document.getElementById('amountInput').value = transaction.amount;
  document.getElementById('categoryInput').value = transaction.category;
  selectedDate = transaction.date;
  updateDateLabel();
  document.getElementById('amountError').style.display = 'none';

  setType(transaction.type);
  document.getElementById('overlay').classList.add('open');
}

// Removes a transaction, playing a small "collapse" animation first
function deleteTransaction(id) {
  const card = document.querySelector(`.tx-card[data-id="${id}"]`);

  if (card) {
    card.classList.add('removing'); // triggers the CSS shrink/fade transition
    setTimeout(() => {
      transactions = transactions.filter(t => t.id !== id);
      render();
    }, 220); // matches the CSS transition duration in style.css
  } else {
    // Fallback in case the card isn't in the DOM for some reason
    transactions = transactions.filter(t => t.id !== id);
    render();
  }
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('calendarPopover').classList.remove('open');
  document.getElementById('dateTrigger').classList.remove('cal-open');
}

// Validates the form, then creates or updates a transaction
function saveTransaction() {
  const amountInput = document.getElementById('amountInput');

  const amount = parseFloat(amountInput.value);
  const category = document.getElementById('categoryInput').value;
  const date = selectedDate || new Date().toISOString().slice(0, 10);

  // --- Validation ---
  // We check on the client for a smooth experience, but remember:
  // if this app ever talks to a real backend, the SERVER must also
  // validate this data — never trust input that came from a browser.
  let isValid = true;
  const amountField = amountInput.closest('.field');

  if (!amount || amount <= 0) {
    document.getElementById('amountError').style.display = 'block';
    shakeField(amountField);
    isValid = false;
  } else {
    document.getElementById('amountError').style.display = 'none';
  }

  if (!isValid) return; // stop here — don't save an invalid transaction

  // The celebration is about the first INCOME specifically (not any
  // transaction), so we check: this is a brand new entry, it's an
  // income, and no income transaction exists yet.
  const isFirstIncomeEver = !editingId
    && currentType === 'income'
    && !transactions.some(t => t.type === 'income');

  if (editingId) {
    const transaction = transactions.find(t => t.id === editingId);
    transaction.amount = amount;
    transaction.category = category;
    transaction.date = date;
    transaction.type = currentType;
  } else {
    transactions.push({ id: nextId++, type: currentType, amount, category, date });
  }

  closeModal();
  render();

  if (isFirstIncomeEver && !hasCelebratedFirstIncome) {
    hasCelebratedFirstIncome = true;
    showCongrats();
  }
}

// Small shake animation on a field that failed validation, giving
// the user a quick visual nudge toward the problem.
function shakeField(fieldElement) {
  fieldElement.classList.remove('shake');
  void fieldElement.offsetWidth; // forces the browser to "restart" the animation
  fieldElement.classList.add('shake');
}


/* ---------------------------------------------------------------
   6. FIRST-TRANSACTION CELEBRATION (confetti + popup + sound)
--------------------------------------------------------------- */

function showCongrats() {
  spawnConfetti();
  playChime();
  document.getElementById('congratsOverlay').classList.add('open');
}

function closeCongrats() {
  document.getElementById('congratsOverlay').classList.remove('open');
  document.getElementById('confettiField').innerHTML = ''; // clean up the confetti pieces
}

// Creates a handful of small colored rectangles that fall and fade
// using the .confetti-piece CSS animation defined in style.css.
function spawnConfetti() {
  const field = document.getElementById('confettiField');
  const colors = ['#5B4FE0', '#0E9C8C', '#E85D42', '#D9A441'];
  field.innerHTML = '';

  for (let i = 0; i < 26; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    field.appendChild(piece);
  }
}

// Plays a short, pleasant three-note chime using the Web Audio API.
// This generates the sound directly in the browser, so there's no
// external audio file to download, host, or worry about licensing.
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — a bright major chord arpeggio
    const now = audioContext.currentTime;

    notes.forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      const startTime = now + i * 0.12; // stagger the notes slightly
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.16, startTime + 0.02);   // quick fade in
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5); // smooth fade out

      oscillator.connect(gainNode).connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  } catch (err) {
    // Some browsers block audio until the user has interacted with the
    // page at least once. That's fine — the popup still shows either way.
    console.warn('Notification sound could not play:', err);
  }
}


/* ---------------------------------------------------------------
   7. GLOBAL EVENT LISTENERS + FIRST RENDER
--------------------------------------------------------------- */

// Close the calendar popover when clicking anywhere outside of it
document.addEventListener('click', (event) => {
  const dateFieldWrap = document.querySelector('.date-field-wrap');
  if (dateFieldWrap && !dateFieldWrap.contains(event.target)) {
    document.getElementById('calendarPopover').classList.remove('open');
    document.getElementById('dateTrigger').classList.remove('cal-open');
  }
});

// Close the add/edit modal when clicking on the dark backdrop (not the modal itself)
document.getElementById('overlay').addEventListener('click', (event) => {
  if (event.target.id === 'overlay') closeModal();
});

// Close the congrats popup the same way
document.getElementById('congratsOverlay').addEventListener('click', (event) => {
  if (event.target.id === 'congratsOverlay') closeCongrats();
});

// Let the Escape key close whichever popup is open
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeCongrats();
  }
});

// Draw the initial (empty) state as soon as the page loads
render();
