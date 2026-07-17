// TOPICS is defined in questions.js, loaded before this file.
let currentTopicKey = null;
let currentIndex = 0;
let score = 0;
let locked = false;

const card = document.getElementById("quiz-card");
const letters = ["A", "B", "C", "D"];

function renderTopicPicker() {
  card.innerHTML = `
    <p class="topic-title">Choose a topic</p>
    <p class="topic-sub">Five questions, straight to the point.</p>
    <div class="topic-grid" id="topic-grid">
      ${Object.entries(TOPICS)
        .map(
          ([key, topic]) => `
        <button class="topic-card" data-key="${key}" type="button">
          <span class="topic-emoji">${topic.emoji}</span>
          <span>
            <p class="topic-name">${topic.label}</p>
            <p class="topic-desc">${topic.desc}</p>
          </span>
        </button>
      `
        )
        .join("")}
    </div>
  `;

  document.querySelectorAll(".topic-card").forEach((btn) => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.key));
  });
}

function startQuiz(topicKey) {
  currentTopicKey = topicKey;
  currentIndex = 0;
  score = 0;
  renderQuestion();
}

function renderQuestion() {
  locked = false;
  const topic = TOPICS[currentTopicKey];
  const item = topic.questions[currentIndex];
  const startPct = (currentIndex / topic.questions.length) * 100;

  card.innerHTML = `
    <div class="quiz-top">
      <span class="quiz-step">${topic.label} · Question ${currentIndex + 1} of ${topic.questions.length}</span>
      <span class="quiz-score" id="quiz-score">Score: ${score}</span>
    </div>
    <div class="quiz-progress-track">
      <div class="quiz-progress-fill" id="progress-fill" style="width: ${startPct}%;"></div>
    </div>
    <p class="quiz-question">${item.q}</p>
    <div class="quiz-options" id="quiz-options">
      ${item.options
        .map(
          (opt, i) => `
        <button class="quiz-opt" data-index="${i}" type="button">
          <span class="quiz-opt-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>
      `
        )
        .join("")}
    </div>
    <button class="quiz-next-btn" id="next-btn" type="button">
      ${currentIndex === topic.questions.length - 1 ? "See results" : "Next question"}
    </button>
  `;

  // Animate the bar forward to reflect progress through the current question.
  requestAnimationFrame(() => {
    const fill = document.getElementById("progress-fill");
    if (fill) {
      fill.style.width = ((currentIndex + 1) / topic.questions.length) * 100 + "%";
    }
  });

  document.querySelectorAll(".quiz-opt").forEach((btn) => {
    btn.addEventListener("click", () => selectAnswer(parseInt(btn.dataset.index, 10)));
  });
  document.getElementById("next-btn").addEventListener("click", goNext);
}

function selectAnswer(index) {
  if (locked) return;
  locked = true;

  const topic = TOPICS[currentTopicKey];
  const item = topic.questions[currentIndex];
  const options = document.querySelectorAll(".quiz-opt");

  options.forEach((btn, i) => {
    btn.classList.add("locked");
    if (i === item.correct) btn.classList.add("correct");
    else if (i === index) btn.classList.add("wrong");
  });

  if (index === item.correct) {
    score++;
    document.getElementById("quiz-score").textContent = "Score: " + score;
  }

  document.getElementById("next-btn").classList.add("show");
}

function goNext() {
  const topic = TOPICS[currentTopicKey];
  if (currentIndex < topic.questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    renderResult();
  }
}

function renderResult() {
  const topic = TOPICS[currentTopicKey];
  const total = topic.questions.length;
  const pct = Math.round((score / total) * 100);

  let emoji = "🌱";
  let title = "Keep practicing";
  let sub = "A solid start — review and try again.";

  if (pct === 100) {
    emoji = "🏆";
    title = "Perfect score!";
    sub = "You nailed every question.";
  } else if (pct >= 60) {
    emoji = "⚡";
    title = "Nice work!";
    sub = "You know your stuff.";
  }

  card.innerHTML = `
    <div class="quiz-result">
      <div class="quiz-result-emoji">${emoji}</div>
      <p class="quiz-result-title">${title}</p>
      <p class="quiz-result-sub">${topic.label} — you scored ${score} out of ${total} (${pct}%)</p>
      <div class="quiz-result-actions">
        <button class="btn-secondary" id="change-topic-btn" type="button">Change topic</button>
        <button class="btn-primary" id="retry-btn" type="button">Try again</button>
      </div>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", () => startQuiz(currentTopicKey));
  document.getElementById("change-topic-btn").addEventListener("click", renderTopicPicker);
}

renderTopicPicker();
