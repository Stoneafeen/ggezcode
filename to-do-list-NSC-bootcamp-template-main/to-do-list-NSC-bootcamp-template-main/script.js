document.addEventListener("DOMContentLoaded", () => {
  let tasks = [];
  let showCompleted = false;
  let editingTaskId = null;

  const taskList = document.getElementById("task-list");
  const addButton = document.getElementById("add-task-button");
  const popup = document.getElementById("task-popup");
  const popupContent = popup.querySelector(".popup-content");
  const cancelBtn = document.getElementById("cancel-button");
  const applyBtn = document.getElementById("apply-button");
  const titleInput = document.getElementById("task-title");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const filterSelect = document.getElementById("filter-date");
  const activeBtn = document.getElementById("show-active");
  const completedBtn = document.getElementById("show-completed");
  const themeToggle = document.getElementById("theme-toggle");
  const searchInput = document.getElementById("search-input");
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  document.body.appendChild(toastContainer);

  cancelBtn.addEventListener("click", () => {
    popupContent.classList.add("popup-hide");
    setTimeout(() => {
      popup.classList.remove("popup-visible");
      popupContent.classList.remove("popup-hide");
      const heading = popup.querySelector("h2");
      if (heading) heading.textContent = "New Task";
      titleInput.value = "";
      dateInput.value = "";
      timeInput.value = "";
      editingTaskId = null;
    }, 300);
  });

  addButton.addEventListener("click", () => {
    editingTaskId = null;
    popup.classList.add("popup-visible");
    const heading = popup.querySelector("h2");
    if (heading) heading.textContent = "New Task";
  });

  applyBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    if (!title || !date || !time) return;

    if (editingTaskId) {
      const updatedData = { title, date, time };
      updateTaskInFirestore(editingTaskId, updatedData);
      showToast("Task updated!");
    } else {
      const task = {
        title,
        date,
        time,
        completed: false,
      };
      saveToFirestore(task);
      showToast("Task added!");
    }
    clearPopup();
  });

  activeBtn.addEventListener("click", () => {
    showCompleted = false;
    renderTasks();
  });

  completedBtn.addEventListener("click", () => {
    showCompleted = true;
    renderTasks();
  });

  filterSelect.addEventListener("change", renderTasks);

  function clearPopup() {
    popup.classList.remove("popup-visible");
    titleInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    editingTaskId = null;
  }

  function renderTasks() {
    const keyword = searchInput.value.toLowerCase();
    const activeCount = tasks.filter((t) => !t.completed).length;
    const completedCount = tasks.filter((t) => t.completed).length;
    activeBtn.innerHTML = `<i class='bi bi-list-task'></i> Active Tasks <span class='task-count'>${activeCount}</span>`;
    completedBtn.innerHTML = `<i class='bi bi-check2-circle'></i> Finished Tasks <span class='task-count'>${completedCount}</span>`;
    taskList.innerHTML = "";
    const filtered = tasks
      .filter(
        (t) =>
          t.completed === showCompleted &&
          t.title.toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.time}`);
        const bTime = new Date(`${b.date}T${b.time}`);
        return filterSelect.value === "asc" ? aTime - bTime : bTime - aTime;
      });

    if (filtered.length === 0) {
      taskList.innerHTML =
        '<p style="text-align:center;opacity:0.6;">No tasks found.</p>';
      return;
    }

    filtered.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card fade-in";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => {
        const isCompleted = checkbox.checked;

        updateTaskInFirestore(task.firestoreId, {
          completed: isCompleted,
        });

        showToast(
          isCompleted ? "Task marked as completed!" : "Task marked as undone!"
        );

        card.classList.add("slide-out");
        card.addEventListener(
          "animationend",
          () => {
            card.remove();
          },
          { once: true }
        );
      });

      const info = document.createElement("div");
      info.className = "task-info";
      info.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">${task.date} ${task.time}</div>
      `;

      const actions = document.createElement("div");
      actions.className = "task-actions";
      actions.innerHTML = `
        <button title="Edit" onclick="editTask('${task.firestoreId}')"><i class="bi bi-pencil-square"></i></button>
        <button title="Delete" onclick="deleteTask('${task.firestoreId}')"><i class="bi bi-trash"></i></button>
      `;

      card.appendChild(checkbox);
      card.appendChild(info);
      card.appendChild(actions);
      taskList.appendChild(card);
    });
  }

  window.editTask = function (id) {
    const task = tasks.find((t) => t.firestoreId === id);
    if (!task) return;
    editingTaskId = id;
    titleInput.value = task.title;
    dateInput.value = task.date;
    timeInput.value = task.time;
    const heading = popup.querySelector("h2");
    if (heading) heading.textContent = "Edit Task";
    popup.classList.add("popup-visible");
  };

  window.deleteTask = function (id) {
    const element = [...document.querySelectorAll(".task-card")].find((el) =>
      el.innerHTML.includes(id)
    );
    if (element) {
      element.classList.add("slide-out");
      element.addEventListener(
        "animationend",
        () => {
          element.remove();
          deleteTaskFromFirestore(id);
          showToast("Task deleted!");
        },
        { once: true }
      );
    } else {
      deleteTaskFromFirestore(id);
    }
  };

  loadTasksFromFirestore((data) => {
    tasks = data;
    renderTasks();
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    themeToggle.innerHTML = document.body.classList.contains("light-mode")
      ? '<i class="bi bi-moon"></i>'
      : '<i class="bi bi-sun"></i>';
  });

  searchInput.addEventListener("input", renderTasks);

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
