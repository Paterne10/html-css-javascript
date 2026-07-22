# Flow — Expense Tracker

A simple web app for tracking your personal income and expenses, with a live balance,
a visual income/expense gauge, and a transaction timeline. Built with plain HTML, CSS,
and JavaScript — no frameworks, no build step, no installation required.

---

## 1. What is this app?

An expense tracker helps you answer one question: **where does my money go (and come
from)?** You log every time money enters your pocket (income) or leaves it (an
expense), and the app keeps a running total for you.

This app does three things:

1. **Lets you record transactions** — income or expenses, each with an amount,
   category, and date.
2. **Calculates your balance automatically** — balance = total income − total
   expenses, always kept up to date.
3. **Shows you the shape of your finances at a glance** — a circular gauge compares
   how much of your activity is income vs. expenses, and a scrollable list shows
   every transaction as its own card.

---

## 2. How it works, step by step

### The data
Every transaction is stored as a simple object:

```js
{ id: 1, type: 'income', amount: 12500, category: 'Food', date: '2026-07-20' }
```

All transactions live together in one JavaScript array called `transactions`. This
array is the **single source of truth** — everything you see on screen is calculated
from it.

> **Note:** in this version, `transactions` lives only in memory. Refreshing the page
> clears it. See [section 5](#5-limitations--next-steps) for how to make it permanent.


### Adding a transaction
1. Click **+ Add transaction**.
2. Choose **Expense** or **Income**.
3. Enter an amount (must be greater than 0) and pick a category and date.
4. Click **Add expense / Add income**.

The form is validated before saving — if the amount is missing or zero, the field
shakes and an error message appears instead of saving bad data.

### Editing or deleting
Hover over any transaction card to reveal a **pencil** (edit) and **✕** (delete)
icon. Editing reopens the same form pre-filled with that transaction's data; deleting
removes it after a short fade-out animation.

### The first-income celebration
The very first time you log an **income** transaction, a popup congratulates you
with a confetti burst and a short chime (generated in the browser — no sound file
involved). It only fires once per visit, and only for income — adding expenses first
won't trigger it.

---

## 3. Project structure

```
expense-tracker/
├── index.html    → page structure (the elements you see and click)
├── style.css     → all visual styling (colors, layout, animations)
├── script.js     → all behavior (state, calculations, rendering)
└── README.md     → this file
```

Each file has one job, which makes it easier to find what you're looking for:

- Need to change how something **looks**? → `style.css`
- Need to change how something **behaves**? → `script.js`
- Need to add or rearrange an element on the page? → `index.html`

Inside `script.js`, code is grouped into numbered sections (state, formatting
helpers, rendering, calendar, modal/form handling, celebration, event listeners) —
each section has a comment header explaining what it's for.

---

## 4. How to run it

No installation, no server, no build tools needed.

1. Download the three files (`index.html`, `style.css`, `script.js`) into the same
   folder.
2. Double-click `index.html`, or open it from your browser with **File → Open**.

That's it — the app runs entirely in your browser.

---

## 5. Limitations & next steps

This is a front-end prototype, so a few things are intentionally left simple:

- **Data isn't saved.** Refreshing the page resets everything, since transactions
  are only kept in a JavaScript array in memory. The natural next step is either:
  - **`localStorage`** — quick to add, keeps data on your device only, no backend
    needed.
  - **A backend API** — lets you access your data from multiple devices, and is
    the right choice if this ever needs user accounts.
- **No description field.** Each transaction is identified by its category only
  (e.g. "Food", "Rent"), so two expenses in the same category will look identical
  aside from date and amount.
- **Single currency (FCFA).** Amounts are formatted as FCFA throughout; there's no
  currency switcher.
- **Client-side validation only.** The form checks catch obvious mistakes for a
  smooth experience, but if a backend is added later, it must re-validate all data
  itself — never trust data just because the browser already checked it.
