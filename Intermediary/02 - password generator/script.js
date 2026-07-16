const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}";

const display = document.getElementById("pw-display");
const slider = document.getElementById("length-slider");
const lengthValue = document.getElementById("length-value");
const strengthBar = document.getElementById("strength-bar");
const strengthLabel = document.getElementById("strength-label");
const copyBtn = document.getElementById("copy-btn");
const copyIcon = document.getElementById("copy-icon");
const generateBtn = document.getElementById("generate-btn");
const refreshBtn = document.getElementById("refresh-btn");
const optionChecks = document.querySelectorAll(".opt-check");

function getOptions() {
  return {
    upper: document.getElementById("opt-upper").checked,
    lower: document.getElementById("opt-lower").checked,
    numbers: document.getElementById("opt-numbers").checked,
    symbols: document.getElementById("opt-symbols").checked,
  };
}

// Uses the Web Crypto API for cryptographically secure randomness
// instead of Math.random(), which is not safe for generating secrets.
function secureRandomIndex(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function buildCharset(options) {
  let charset = "";
  if (options.upper) charset += UPPER;
  if (options.lower) charset += LOWER;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  return charset || LOWER;
}

function generatePassword() {
  const length = parseInt(slider.value, 10);
  const options = getOptions();
  const charset = buildCharset(options);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[secureRandomIndex(charset.length)];
  }

  display.textContent = password;
  updateStrength(password, options);
  return password;
}

function updateStrength(password, options) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  const varietyCount = [options.upper, options.lower, options.numbers, options.symbols].filter(
    Boolean
  ).length;
  if (varietyCount >= 3) score++;
  if (varietyCount === 4) score++;

  let percent, colorVar, label;

  if (score <= 1) {
    percent = 25;
    colorVar = "var(--danger)";
    label = "Weak";
  } else if (score <= 3) {
    percent = 55;
    colorVar = "var(--warning)";
    label = "Medium";
  } else if (score <= 4) {
    percent = 80;
    colorVar = "var(--success)";
    label = "Strong";
  } else {
    percent = 100;
    colorVar = "var(--success)";
    label = "Very strong";
  }

  strengthBar.style.width = percent + "%";
  strengthBar.style.background = colorVar;
  strengthLabel.textContent = label;
  strengthLabel.style.color = colorVar;
}

function copyPassword() {
  const password = display.textContent;
  navigator.clipboard
    .writeText(password)
    .then(() => {
      copyIcon.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyIcon.innerHTML = `<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>`;
        copyBtn.classList.remove("copied");
      }, 1200);
    })
    .catch(() => {
      // Clipboard API unavailable or blocked; fail silently.
    });
}

slider.addEventListener("input", () => {
  lengthValue.textContent = slider.value;
  generatePassword();
});

optionChecks.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const anyChecked = Array.from(optionChecks).some((c) => c.checked);
    if (!anyChecked) checkbox.checked = true; // prevent an empty charset
    generatePassword();
  });
});

generateBtn.addEventListener("click", generatePassword);
refreshBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

generatePassword();
