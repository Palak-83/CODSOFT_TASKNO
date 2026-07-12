const STORAGE_KEY = 'taskflow-tasks';
const themeToggle = document.getElementById('theme-toggle');
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const categoryInput = document.getElementById('task-category');
const priorityInput = document.getElementById('task-priority');
const dueDateInput = document.getElementById('task-due');
const statusInput = document.getElementById('task-status');
const notesInput = document.getElementById('task-notes');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const taskList = document.getElementById('task-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const toastContainer = document.getElementById('toast-container');
const welcomeOverlay = document.getElementById('welcome-overlay');
const welcomeForm = document.getElementById('welcome-form');
const userNameInput = document.getElementById('user-name');
const greetingPill = document.getElementById('greeting-pill');
const changeNameBtn = document.getElementById('change-name-btn');
const quotePopup = document.getElementById('quote-popup');

let tasks = loadTasks();
let editingId = null;

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Could not load tasks:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

function showMotivationQuote(taskTitle) {
  const quotes = [
    'Nice work! One more step closer to your goal.',
    'You did it — momentum is building.',
    'Small wins create big progress.',
    'Every completed task is a victory worth celebrating.',
    'Keep going — you are making real progress.'
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quotePopup.hidden = false;
  quotePopup.textContent = `“${quote}” • ${taskTitle}`;

  clearTimeout(showMotivationQuote.timeout);
  showMotivationQuote.timeout = setTimeout(() => {
    quotePopup.hidden = true;
  }, 2600);
}

function sortTasks() {
  tasks = [...tasks].sort((a, b) => {
    const statusOrder = a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1;
    if (statusOrder !== 0) return statusOrder;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const priority = priorityFilter.value;

  sortTasks();

  const filteredTasks = tasks.filter((task) => {
    const matchesQuery =
      task.title.toLowerCase().includes(query) ||
      task.notes.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || task.status === status;
    const matchesPriority = priority === 'all' || task.priority === priority;
    return matchesQuery && matchesStatus && matchesPriority;
  });

  renderStats();

  if (!filteredTasks.length) {
    taskList.innerHTML = '<li class="empty-state">No tasks match your current filters.</li>';
    return;
  }

  taskList.innerHTML = filteredTasks
    .map((task) => {
      const dueText = task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString() : 'No date';
      const categoryMarkup = task.category
        ? `<span class="meta-pill">${escapeHtml(task.category)}</span>`
        : '';
      const notesMarkup = task.notes
        ? `<p class="task-notes">${escapeHtml(task.notes)}</p>`
        : '';

      return `
        <li class="task-item ${task.status === 'completed' ? 'completed' : ''}">
          <div class="task-main">
            <input class="task-input" type="checkbox" ${task.status === 'completed' ? 'checked' : ''} data-action="toggle" data-id="${task.id}" aria-label="Toggle task status" />
            <div class="task-copy">
              <div class="task-title-row">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
              </div>
              <div class="meta-row">
                ${categoryMarkup}
                <span class="meta-pill">${escapeHtml(task.status)}</span>
                <span class="meta-pill">Due ${escapeHtml(dueText)}</span>
              </div>
              ${notesMarkup}
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-btn edit-btn" data-action="edit" data-id="${task.id}" title="Edit task">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete task">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
          <span class="priority-chip priority-${task.priority}" aria-label="${escapeHtml(task.priority)} priority" title="${escapeHtml(task.priority)} priority">
            <span class="priority-dot"></span>
            <span class="priority-label">${escapeHtml(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}</span>
          </span>
        </li>
      `;
    })
    .join('');
}

function renderStats() {
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.length - completed;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resetForm() {
  taskForm.reset();
  priorityInput.value = 'medium';
  statusInput.value = 'pending';
  editingId = null;
  submitBtn.textContent = 'Add task';
  formTitle.textContent = 'Add a new task';
  cancelEditBtn.hidden = true;
}

function populateEditForm(task) {
  titleInput.value = task.title;
  categoryInput.value = task.category;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate;
  statusInput.value = task.status;
  notesInput.value = task.notes;
  editingId = task.id;
  submitBtn.textContent = 'Save changes';
  formTitle.textContent = 'Edit task';
  cancelEditBtn.hidden = false;
  titleInput.focus();
}

function addTask(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  if (editingId) {
    tasks = tasks.map((task) =>
      task.id === editingId
        ? {
            ...task,
            title,
            category: categoryInput.value.trim(),
            priority: priorityInput.value,
            dueDate: dueDateInput.value,
            status: statusInput.value,
            notes: notesInput.value.trim(),
          }
        : task
    );
  } else {
    tasks.unshift({
      id: crypto.randomUUID(),
      title,
      category: categoryInput.value.trim(),
      priority: priorityInput.value,
      dueDate: dueDateInput.value,
      status: statusInput.value,
      notes: notesInput.value.trim(),
    });
  }

  saveTasks();
  render();
  resetForm();
  showToast(editingId ? 'Task updated successfully.' : 'Task added successfully.', 'success');
}

function handleTaskActions(event) {
  const button = event.target.closest('button[data-action]');
  const checkbox = event.target.closest('input[data-action="toggle"]');

  if (button) {
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'delete') {
      tasks = tasks.filter((task) => task.id !== id);
      if (editingId === id) {
        resetForm();
      }
      saveTasks();
      render();
      showToast('Task deleted.', 'error');
    }

    if (action === 'edit') {
      const task = tasks.find((item) => item.id === id);
      if (task) {
        populateEditForm(task);
      }
    }
  }

  if (checkbox) {
    const id = checkbox.dataset.id;
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const wasCompleted = task.status === 'completed';
    tasks = tasks.map((item) =>
      item.id === id ? { ...item, status: wasCompleted ? 'pending' : 'completed' } : item
    );

    saveTasks();
    render();

    if (!wasCompleted) {
      showMotivationQuote(task.title);
    }

    showToast('Task status updated.', 'success');
  }
}

function getUserName() {
  return localStorage.getItem('taskflow-user-name') || '';
}

function updateGreeting() {
  const name = getUserName();
  if (name) {
    greetingPill.textContent = `Hi, ${name}!`;
    changeNameBtn.hidden = false;
    welcomeOverlay.classList.add('hidden');
  } else {
    greetingPill.textContent = 'Hi, friend';
    changeNameBtn.hidden = true;
    welcomeOverlay.classList.remove('hidden');
  }
}

function saveUserProfile(name) {
  if (name) {
    localStorage.setItem('taskflow-user-name', name.trim());
  } else {
    localStorage.removeItem('taskflow-user-name');
  }
  updateGreeting();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();

  const name = userNameInput.value.trim();
  if (!name) {
    userNameInput.focus();
    showToast('Please enter your name.', 'error');
    return;
  }

  saveUserProfile(name);
  showToast(`Welcome, ${name}!`, 'success');
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('taskflow-theme');
  const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', preferredTheme);
  updateThemeIcon(preferredTheme);
}

function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('taskflow-theme', current);
  updateThemeIcon(current);
}

themeToggle.addEventListener('click', toggleTheme);
taskForm.addEventListener('submit', addTask);
cancelEditBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', render);
statusFilter.addEventListener('change', render);
priorityFilter.addEventListener('change', render);
taskList.addEventListener('click', handleTaskActions);
taskList.addEventListener('change', handleTaskActions);
welcomeForm.addEventListener('submit', handleWelcomeSubmit);
changeNameBtn.addEventListener('click', () => {
  localStorage.removeItem('taskflow-user-name');
  userNameInput.value = '';
  updateGreeting();
  userNameInput.focus();
});

initializeTheme();
updateGreeting();
resetForm();
render();
