// ---- Theme handling ----
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

const sunPath = `<circle cx="12" cy="12" r="4"></circle>
  <line x1="12" y1="2" x2="12" y2="4"></line>
  <line x1="12" y1="20" x2="12" y2="22"></line>
  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
  <line x1="2" y1="12" x2="4" y2="12"></line>
  <line x1="20" y1="12" x2="22" y2="12"></line>
  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>`;

const moonPath = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

let applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  themeIcon.innerHTML = theme === "dark" ? sunPath : moonPath;
  localStorage.setItem("todo-theme", theme);
}

let initTheme = () => {
  const saved = localStorage.getItem("todo-theme");
  if (saved) {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

initTheme();

// ---- Task handling ----
const STORAGE_KEY = "todo-tasks";


let filter = "all";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const progressText = document.getElementById("progress-text");
const filterButtons = document.querySelectorAll(".filter-btn");

let loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let tasks = loadTasks();

let saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let addTask = (text) => {
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  render();
}

let toggleTask = (id) => {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveTasks();
  render();
}

let deleteTask = (id) => {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

let getFilteredTasks = () => {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

let render = () => {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";
  emptyState.style.display = filtered.length === 0 ? "block" : "none";

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn" + (task.done ? " done" : "");
    checkBtn.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
    checkBtn.innerHTML = task.done
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : "";
    checkBtn.addEventListener("click", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text" + (task.done ? " done" : "");
    span.textContent = task.text;

    const delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.setAttribute("aria-label", "Delete task");
    delBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path><path d="M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>`;
    delBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkBtn, span, delBtn);
    taskList.appendChild(li);
  });

  const doneCount = tasks.filter((t) => t.done).length;
  progressText.textContent = `${doneCount} of ${tasks.length} done`;

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  addTask(value);
  taskInput.value = "";
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    render();
  });
});

render();
