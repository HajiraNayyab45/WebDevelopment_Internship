function parseDateToISO(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  let [month, day, year] = parts.map(p => p.trim());
  if (year.length === 2) year = "20" + year;
  const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
  if (isNaN(dateObj)) return "";
  return dateObj.toISOString().split("T")[0];
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let storedLists = JSON.parse(localStorage.getItem("lists"));
let lists = storedLists && storedLists.length > 0 ? storedLists : ["Personal", "Work", "Assignment"];
let currentSection = "today";

function saveAll() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("lists", JSON.stringify(lists));
}

function renderTasks() {
  const listContainer = document.getElementById("taskListContainer");
  const stickyWall = document.getElementById("stickyWall");
  const calendarView = document.getElementById("calendarView");
  const searchQuery = document.getElementById("searchInput").value.trim().toLowerCase();

  listContainer.innerHTML = "";
  stickyWall.innerHTML = "";
  calendarView.style.display = currentSection === "calendar" ? "block" : "none";

  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);

  let filtered = [];

  if (currentSection === "today") {
      filtered = tasks.filter(t => {
          if (!t.date) return false;
          const parts = t.date.split("/");
          if (parts.length !== 3) return false;
          const [month, day, year] = parts.map(p => parseInt(p));
          const taskDate = new Date(year, month - 1, day);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === todayDateObj.getTime();
      });
  } else if (currentSection === "upcoming") {
      filtered = tasks.filter(t => {
          if (!t.date) return false;
          const parts = t.date.split("/");
          if (parts.length !== 3) return false;
          const [month, day, year] = parts.map(p => parseInt(p));
          const taskDate = new Date(year, month - 1, day);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() > todayDateObj.getTime();
      });
  } else if (currentSection === "sticky") {
      filtered = [...tasks];
  }

  // Add search filter:
  if (searchQuery) {
      filtered = filtered.filter(t =>
          (t.text && t.text.toLowerCase().includes(searchQuery)) ||
          (t.desc && t.desc.toLowerCase().includes(searchQuery)) ||
          (t.list && t.list.toLowerCase().includes(searchQuery))
      );
  }

  // (rest of your render logic remains unchanged...)


  if (currentSection === "sticky") {
      filtered.forEach(task => {
          const note = document.createElement("div");
          note.className = "sticky-note";
          note.innerHTML = `
              <strong>${task.text}</strong><br>
              ${task.desc ? `<small>${task.desc}</small><br>` : ""}
              ${task.date ? `<small>${task.date}</small><br>` : ""}
              ${task.list ? `<small>List: ${task.list}</small>` : ""}
          `;
          stickyWall.appendChild(note);
      });
  } else {
      filtered.forEach((task, index) => {
          const li = document.createElement("li");
          li.className = "task-item";
          li.innerHTML = `
              <div>
                  <strong>${task.text}</strong><br>
                  ${task.desc ? `<small>${task.desc}</small><br>` : ""}
                  ${task.date ? `<small>${task.date}</small><br>` : ""}
                  ${task.list ? `<small>List: ${task.list}</small>` : ""}
              </div>
              <button onclick="deleteTask(${index})">❌</button>
          `;
          listContainer.appendChild(li);
      });
  }
}

function renderLists() {
  const listContainer = document.getElementById("listContainer");
  const taskListSelect = document.getElementById("taskList");

  listContainer.innerHTML = "";
  taskListSelect.innerHTML = "<option value=''>Select List</option>";

  lists.forEach((list, index) => {
      const li = document.createElement("li");
      li.className = "list-item";

      const label = document.createElement("span");
      label.className = "list-label";
      label.textContent = list;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-list-btn";
      deleteBtn.textContent = "❌";
      deleteBtn.onclick = () => deleteList(index);

      li.appendChild(label);
      li.appendChild(deleteBtn);
      listContainer.appendChild(li);

      const option = document.createElement("option");
      option.value = list;
      option.textContent = list;
      taskListSelect.appendChild(option);
  });
}

function addList() {
  const input = document.getElementById("newListInput");
  const value = input.value.trim();
  if (value && !lists.includes(value)) {
      lists.push(value);
      input.value = "";
      saveAll();
      renderLists();
  }
}

function deleteList(index) {
  const listName = lists[index];
  tasks = tasks.filter(t => t.list !== listName);
  lists.splice(index, 1);
  saveAll();
  renderTasks();
  renderLists();
}

function addTask() {
  const text = document.getElementById("taskText").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;
  const list = document.getElementById("taskList").value;
  if (!text) return;
  tasks.push({ text, desc, date, list });
  saveAll();
  document.getElementById("taskText").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDate").value = "";
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAll();
  renderTasks();
}

function switchSection(section) {
  currentSection = section;
  document.getElementById("sectionTitle").textContent = section.charAt(0).toUpperCase() + section.slice(1);
  renderTasks();
}

document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

flatpickr("#taskDate", { dateFormat: "m/d/Y" });

flatpickr("#calendarPicker", {
  dateFormat: "m/d/Y",
  onChange: ([date]) => {
      const iso = date.toISOString().split("T")[0];
      const list = document.getElementById("calendarTasks");
      list.innerHTML = "";
      const filtered = tasks.filter(t => parseDateToISO(t.date) === iso);
      if (filtered.length === 0) {
          list.innerHTML = "<li>No tasks for this day.</li>";
      } else {
          filtered.forEach(t => {
              const li = document.createElement("li");
              li.innerHTML = `
                  <strong>${t.text}</strong><br>
                  ${t.desc ? `<small>${t.desc}</small><br>` : ""}
                  ${t.date ? `<small>${t.date}</small><br>` : ""}
                  ${t.list ? `<small>List: ${t.list}</small>` : ""}
              `;
              list.appendChild(li);
          });
      }
  }
});

new Sortable(document.getElementById("taskListContainer"), {
  animation: 150,
  onEnd: (evt) => {
      const movedItem = tasks.splice(evt.oldIndex, 1)[0];
      tasks.splice(evt.newIndex, 0, movedItem);
      saveAll();
      renderTasks();
  }
});

function exportData() {
  const data = { tasks, lists };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todo_data.json";
  a.click();
}

renderTasks();
renderLists();
