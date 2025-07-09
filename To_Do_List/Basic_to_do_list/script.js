const taskList = document.getElementById('taskList');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const priorityInput = document.getElementById('priority');

  if (taskInput.value.trim() === '') return;

  const task = {
    text: taskInput.value,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  dueDateInput.value = '';
}

function renderTasks(filter = '') {
  taskList.innerHTML = '';
  tasks.filter(t => t.text.toLowerCase().includes(filter.toLowerCase()))
       .forEach((task, index) => {
    const li = document.createElement('li');
    if (task.priority === 'high') li.classList.add('high');
    if (task.priority === 'medium') li.classList.add('medium');
    if (task.priority === 'normal') li.classList.add('normal');
    li.style.textAlign = 'left'; // Ensure text is left-aligned
    li.style.display = 'flex'; // Add flex display for better alignment
    li.style.alignItems = 'center'; // Center align items vertically
    li.style.gap = '10px'; // Add gap between elements
    li.innerHTML = `
      <input type="checkbox" onclick="toggleComplete(${index})" ${task.completed ? 'checked' : ''}>
      <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}; flex-grow: 1; text-align: left;">
      ${task.text} (${task.dueDate})
      </span>
      <button onclick="removeTask(${index})">❌</button>
    `;
    taskList.appendChild(li);
  });
}

function removeTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function searchTasks() {
  const query = document.getElementById('searchInput').value;
  renderTasks(query);
}

function checkDueTasks() {
  const now = new Date().toISOString().split('T')[0];
  tasks.forEach(task => {
    if (task.dueDate === now) {
      alert(`Reminder: Task "${task.text}" is due today!`);
    }
  });
}

setInterval(checkDueTasks, 60000); // Check every 60 seconds
renderTasks();

