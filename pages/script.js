// ============================================================================
// SIMPLE TASK MANAGER - EASY TO EXPLAIN IN VIVA
// ============================================================================

// Global variables - easy to understand
let currentUser = "";
let allBoards = [];
let currentTaskId = 0;

// ============================================================================
// 1. LOGIN FUNCTIONALITY - SIMPLE
// ============================================================================

// Check if we're on login page
if (document.getElementById("loginBtn")) {
  document.getElementById("loginBtn").addEventListener("click", handleLogin);
}

function handleLogin() {
  const username = document.getElementById("username").value;

  if (!username) {
    showNotification("Please select a username!", "danger");
    return;
  }

  // Show loading
  document.getElementById("loginBtn").innerHTML =
    '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';

  // Save user and go to dashboard
  sessionStorage.setItem("currentUser", username);

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);
}

// ============================================================================
// 2. DASHBOARD INITIALIZATION - SIMPLE
// ============================================================================

// Check if we're on dashboard page
if (document.getElementById("boardsContainer")) {
  initializeDashboard();
}

function initializeDashboard() {
  // Get current user
  currentUser = sessionStorage.getItem("currentUser") || "User";
  // Load saved data
  loadData();

  // Show user name
  showUserName();

  // Update stats
  updateStats();

  // Show boards
  displayBoards();

  // Setup search
  setupSearch();

  // Start real-time countdown timer
  startCountdownTimer();
}

// ============================================================================
// 3. DATA STORAGE - SIMPLE
// ============================================================================

// Real-time countdown timer
function startCountdownTimer() {
  // Update countdown every second
  setInterval(() => {
    // Only update if we're on the dashboard page
    if (document.getElementById("boardsContainer")) {
      // Check if there's an active search
      const searchInput = document.getElementById("searchInput");
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      
      if (searchTerm) {
        // If there's a search term, re-run the search to update countdowns
        performSearch();
      } else {
        // If no search, show all boards
        displayBoards();
      }
    }
  }, 1000); // Update every 1000ms (1 second)
}

function saveData() {
  const data = {
    user: currentUser,
    boards: allBoards,
  };
  localStorage.setItem("taskManager_" + currentUser, JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("taskManager_" + currentUser);
  if (saved) {
    const data = JSON.parse(saved);
    allBoards = data.boards || [];
  }
}

function clearUserData() {
  if (confirm("Are you sure you want to clear all data?")) {
    localStorage.removeItem("taskManager_" + currentUser);
    allBoards = [];
    displayBoards();
    updateStats();
    showNotification("All data cleared!", "success");
  }
}

// ============================================================================
// 4. BOARD FUNCTIONS - SIMPLE
// ============================================================================

function createBoard() {
  const name = document.getElementById("boardName").value;
  const description = document.getElementById("boardDescription").value;
  const color = document.getElementById("boardColor").value;

  if (!name) {
    showNotification("Please enter board name!", "danger");
    return;
    }



 
  // Check for duplicate board names BEFORE adding the new board
  if (allBoards.find(b=>b.name==name))
  {
    showNotification("You cannot enter 2 board with same name","danger");
    return;
  }

  const newBoard = {
    id: Date.now(),
    name: name,
    description: description,
    color: color,
    folders: [],
  };

  allBoards.push(newBoard);

  if(allBoards.length > 3)
  // {
  //   showNotification("You cannot create more than 3 boards!","danger");
  //   return;
  // }

  saveData();
  displayBoards();
  updateStats();

  // Close modal and clear form
  bootstrap.Modal.getInstance(document.getElementById("addBoardModal")).hide(); // a bootstrap model is a pop up dialog box that appears on the top of page

  document.getElementById("boardDescription").value = ""; //.value is used to get the value of the input field

  showNotification("Board created successfully!", "success");
}

function deleteBoard(boardId) {
  if (confirm("Are you sure you want to delete this board?")) {
    allBoards = allBoards.filter((board) => board.id !== boardId); //board is the object in the allBoards array   "Keep all boards except the one with this boardId."
    saveData();
    displayBoards();
    updateStats();
    showNotification("Board deleted!", "danger");
  }
}

// ============================================================================
// 5. FOLDER FUNCTIONS - SIMPLE
// ============================================================================

function createFolder() {
  const boardId = parseInt(document.getElementById("folderBoard").value); // parseINt is a js function that converts a string to an integer
  const name = document.getElementById("folderName").value;
  const description = document.getElementById("folderDescription").value;

  if (!boardId || !name) {
    showNotification("Please select board and enter folder name!", "danger");
    return;
  }

  // Find the board first
  const board = allBoards.find((b) => b.id === boardId);

  // Check for duplicate folder names in this board BEFORE creating the new folder
  if (board.folders.find(f => f.name === name)) {
    showNotification("You cannot enter 2 folder with same name", "danger");
    return;
  }

  const newFolder = {
    id: Date.now(), // Date.now() is a js function that returns the current date and time in milliseconds
    name: name,
    description: description,
    tasks: [],
  };

  if (board) {
    board.folders.push(newFolder);
    // if(board.folders.length > 3)
    // {
    //     showNotification('You cannot create more than 3 folders in a board!', 'danger');
    //     return;
    // }
    saveData();
    displayBoards();
    updateStats();

    // Close modal and clear form
    bootstrap.Modal.getInstance(
      document.getElementById("addFolderModal")
    ).hide();
    document.getElementById("folderBoard").value = "";
    document.getElementById("folderName").value = "";
    document.getElementById("folderDescription").value = "";

    showNotification("Folder created successfully!", "success");
  }
}

function deleteFolder(boardId, folderId) {
  if (confirm("Are you sure you want to delete this folder?")) {
    const board = allBoards.find((b) => b.id === boardId);
    if (board) {
      board.folders = board.folders.filter((folder) => folder.id !== folderId);
      saveData();
      displayBoards();
      updateStats();
      showNotification("Folder deleted!", "danger");
    }
  }
}

// ============================================================================
// 6. TASK FUNCTIONS - SIMPLE
// ============================================================================

function createTask() {
  const boardId = parseInt(document.getElementById("taskBoard").value); //parseInt is a js function that converts a string to an integer
  const folderId = parseInt(document.getElementById("taskFolder").value);
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value; //
  const startDate = document.getElementById("taskStartDate").value;
  const dueDate = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const priority = document.getElementById("taskPriority").value;
  const status = document.getElementById("taskStatus").value;

  if (!boardId || !folderId || !title || !startDate || !dueDate || !time) {
    showNotification("Please fill all required fields!", "danger");
    return;
  }

  // Validate that start date is not after due date
  const startDateTime = new Date(startDate);
  const dueDateTime = new Date(dueDate + " " + time); //doubt

  if (startDateTime > dueDateTime) {
    showNotification(
      "Start date cannot be after due date! Please select a valid start date.",
      "danger"
    );
    return;
  }

  const newTask = {
    id: ++currentTaskId,
    title: title,
    description: description,
    startDate: startDate,
    dueDate: dueDate + " " + time,
    priority: priority,
    status: status,
    timesUpdated: 0,
    createdAt: new Date().toISOString(), // covert a date to a standaized text format doubt
  };

  const board = allBoards.find((b) => b.id === boardId);
  if (board) {
    const folder = board.folders.find((f) => f.id === folderId);
    if (folder) {
      folder.tasks.push(newTask);

      // if(folder.tasks.length > 3)
      // {
      //     showNotification('You cannot create more than 3 tasks in a folder!', 'danger');
      //     return;
      // }
      saveData();
      displayBoards();
      updateStats();

      // Close modal and clear form
      bootstrap.Modal.getInstance(
        document.getElementById("addTaskModal")
      ).hide();
      document.getElementById("taskBoard").value = "";
      document.getElementById("taskFolder").value = "";
      document.getElementById("taskTitle").value = "";
      document.getElementById("taskDescription").value = "";
      document.getElementById("taskStartDate").value = "";
      document.getElementById("taskDate").value = "";
      document.getElementById("taskTime").value = "";

      showNotification("Task created successfully!", "success");
    }
  }
}

function updateTask() {
  const taskId = parseInt(
    document.getElementById("editTaskModal").getAttribute("data-task-id")
  );
  const title = document.getElementById("editTaskTitle").value;
  const description = document.getElementById("editTaskDescription").value;
  const startDate = document.getElementById("editTaskStartDate").value;
  const dueDate = document.getElementById("editTaskDate").value;
  const time = document.getElementById("editTaskTime").value;
  const priority = document.getElementById("editTaskPriority").value;
  const status = document.getElementById("editTaskStatus").value;

  if (!title || !startDate || !dueDate || !time) {
    showNotification("Please fill all required fields!", "danger");
    return;
  }

  // Validate that start date is not after due date
  const startDateTime = new Date(startDate);
  const dueDateTime = new Date(dueDate + " " + time);

  if (startDateTime > dueDateTime) {
    showNotification(
      "Start date cannot be after due date! Please select a valid start date.",
      "danger"
    );
    return;
  }

  // Find and update task
  for (let board of allBoards) {
    for (let folder of board.folders) {
      const task = folder.tasks.find((t) => t.id === taskId);
      if (task) {
        if (task.timesUpdated >= 5) {
          showNotification(
            "You cannot update a task more than 5 times!",
            "danger"
          );
          return;
        }
        task.timesUpdated++;
        task.title = title;
        task.description = description;
        task.startDate = startDate;
        task.dueDate = dueDate + " " + time;
        task.priority = priority;
        task.status = status;

        // Debug: Log the status change
        console.log(`Task status updated to: ${status}`);

        saveData();

        // Force refresh the display to update styling
        setTimeout(() => {
          displayBoards();
          updateStats();
        }, 100);

        bootstrap.Modal.getInstance(
          document.getElementById("editTaskModal")
        ).hide();
        showNotification("Task updated successfully!", "success");
        return;
      }
    }
  }
}

function deleteTask(boardId, folderId, taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    const board = allBoards.find((b) => b.id === boardId);
    if (board) {
      const folder = board.folders.find((f) => f.id === folderId);
      if (folder) {
        folder.tasks = folder.tasks.filter((task) => task.id !== taskId);
        saveData();
        displayBoards();
        updateStats(); 
        showNotification("Task deleted!", "danger");
      }
    }
  }
}





function editTask(boardId, folderId, taskId) {
  const board = allBoards.find((b) => b.id === boardId);
  if (board) {
    const folder = board.folders.find((f) => f.id === folderId);
    if (folder) {
      const task = folder.tasks.find((t) => t.id === taskId);
      if (task) {
        // Fill edit form
        document.getElementById("editTaskTitle").value = task.title;
        document.getElementById("editTaskDescription").value = task.description;
        document.getElementById("editTaskStartDate").value =
          task.startDate || "";
        document.getElementById("editTaskDate").value =
          task.dueDate.split(" ")[0]; //split the due date into date and time and store the date in the editTaskDate input field
        document.getElementById("editTaskTime").value =
          task.dueDate.split(" ")[1]; //split the due date into date and time and store the time in the editTaskTime input field
        document.getElementById("editTaskPriority").value = task.priority;
        document.getElementById("editTaskStatus").value = task.status;

        // Store task ID for update
        document
          .getElementById("editTaskModal")
          .setAttribute("data-task-id", taskId); // setAttribute is a js method set or changes attribute on HTML element

        // Update modal title to show edit count
        const remainingEdits = 5 - task.timesUpdated;
        const modalTitle = document.getElementById("editTaskModalLabel");
        if (modalTitle) {
          modalTitle.innerHTML = `
            <i class="fas fa-edit me-2"></i>Edit Task
            <span class="badge ${
              remainingEdits === 0 
                ? "bg-danger" 
                : remainingEdits === 1 
                ? "bg-warning" 
                : "bg-info"
            } ms-2">${remainingEdits} edits left</span>
          `;
        }

        // Show modal
        new bootstrap.Modal(document.getElementById("editTaskModal")).show(); // show is a js method to show the modal
      }
    }
  }
}

// ============================================================================
// 7. DISPLAY FUNCTIONS - SIMPLE
// ============================================================================

function showUserName() {
  // qyery selector find all the elements that matches the selector
  const elements = document.querySelectorAll("#userDisplay, #welcomeUser");
  elements.forEach((el) => {
    if (el) el.textContent = currentUser;
  });
}

function displayBoards() {
  const container = document.getElementById("boardsContainer");

  if (!container) return;

  if (allBoards.length === 0) {
    container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No boards yet</h4>
                <p class="text-muted">Create your first board to get started!</p>
                </div>
            `;
    return;
  }

  let html = "";
  allBoards.forEach((board) => {
    html += createBoardHTML(board);
  });
  container.innerHTML = html; //
}

function createBoardHTML(board) {
  let foldersHTML = "";
  board.folders.forEach((folder) => {
    foldersHTML += createFolderHTML(board.id, folder);
  });

  // Check if board is empty
  const isEmpty = board.folders.length === 0;

  return `
        <div class="board-card mb-4">
            <div class="board-header d-flex justify-content-between align-items-center mb-3" style="background: ${
              board.color
            }; color: white;">
                <div>
                    <h4 class="mb-1">${board.name}</h4>
                    <p class="text-white-50 mb-0">${
                      board.description || "No description"
                    }</p>
                </div>
                <div class="board-actions">
                    <button class="btn btn-sm btn-light me-2" onclick="showAddFolderModal(${
                      board.id
                    })">
                        <i class="fas fa-folder-plus"></i> Add Folder
                    </button>
                    <button class="btn btn-sm btn-outline-light" onclick="deleteBoard(${
                      board.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="folders-container">
                ${foldersHTML}
                ${
                  isEmpty
                    ? `
                    <div class="text-center py-4">
                        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No folders yet</h5>
                        <p class="text-muted">Create your first folder to get started!</p>
                    </div>
                `
                    : ""
                }
            </div>
            </div>
        `;
}

function createFolderHTML(boardId, folder) {
  let tasksHTML = "";

  // Sort tasks by priority: high -> medium -> low
  const sortedTasks = [...folder.tasks].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  sortedTasks.forEach((task) => {
    tasksHTML += createTaskHTML(boardId, folder.id, task);
  });

  // Check if folder is empty
  const isEmpty = folder.tasks.length === 0;

  return `
        <div class="folder-card mb-3">
            <div class="folder-header d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${folder.name}</h5>
                <div class="folder-actions">
                    <button class="btn btn-sm btn-dark me-2" onclick="showAddTaskModal(${boardId}, ${
    folder.id
  })">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFolder(${boardId}, ${
    folder.id
  })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-muted small mb-2">${
              folder.description || "No description"
            }</p>
            <div class="tasks-container">
                ${tasksHTML}
                ${
                  isEmpty
                    ? `
                    <div class="text-center py-3">
                        <i class="fas fa-tasks fa-2x text-muted mb-2"></i>
                        <h6 class="text-muted">No tasks yet</h6>
                        <p class="text-muted small">Add your first task to get started!</p>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
}

function createTaskHTML(boardId, folderId, task) {
  const countdown = calculateCountdown(task.dueDate);
  const priorityClass = getPriorityClass(task.priority);
  const statusClass = getStatusClass(task.status);
  const isOverdue = countdown.expired && task.status !== "completed";
  // Debug: Log the overdue status
  console.log(
    `Task: ${task.title}, Status: ${task.status}, Expired: ${countdown.expired}, IsOverdue: ${isOverdue}`
  );
  const isCompleted = task.status === "completed";
  const isPending = task.status === "pending";
  const isActive = task.status === "active";

  // Choose icon based on status and overdue
  let timeIcon = "fas fa-clock";
  let timeClass = "text-muted";
  if (isOverdue) {
    timeIcon = "fas fa-exclamation-triangle";
    timeClass = "text-danger";
  } else if (isCompleted) {
    timeIcon = "fas fa-check-circle";
    timeClass = "text-success";
  } else if (isActive) {
    timeIcon = "fas fa-play-circle";
    timeClass = "text-primary";
  } else if (isPending) {
    timeIcon = "fas fa-clock";
    timeClass = "text-warning";
  } else if (
    countdown.text.includes("h left") &&     //if time is less then 24 hours then convert string into int and dispaly
    parseInt(countdown.text) < 24    
  ) {
    timeIcon = "fas fa-hourglass-half";
    timeClass = "text-warning";
  }

  // Determine CSS classes for the task card
  let cardClasses = "task-card mb-2";
  if (isOverdue) {
    cardClasses += " overdue";
  } else if (isCompleted) {
    cardClasses += " completed";
  } else if (isActive) {
    cardClasses += " active";
  } else if (isPending) {
    cardClasses += " pending";
  }

  return `
        <div class="${cardClasses}">
            <div class="task-header d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">
                        ${
                          isOverdue
                            ? '<i class="fas fa-exclamation-triangle text-danger me-2"></i>'
                            : isCompleted
                            ? '<i class="fas fa-check-circle text-success me-2"></i>'
                            : isActive
                            ? '<i class="fas fa-play-circle text-primary me-2"></i>'
                            : isPending
                            ? '<i class="fas fa-clock text-warning me-2"></i>'
                            : ""
                        }
                        ${task.title}
                    </h6>
                    <p class="text-muted small mb-1">${
                      task.description || "No description"
                    }</p>
                    <div class="task-meta">
                        <span class="badge ${priorityClass} me-2">${getPriorityName(
    task.priority
  )}</span>
                        <span class="badge ${
                          isOverdue
                            ? "bg-danger"
                            : isCompleted
                            ? "bg-success"
                            : isActive
                            ? "bg-primary"
                            : isPending
                            ? "bg-warning"
                            : statusClass
                        } me-2">${
    isOverdue ? "Overdue" : getStatusName(task.status)
  }</span>
                        <span class="badge ${
                          task.timesUpdated >= 5
                            ? "bg-danger" 
                            : task.timesUpdated >= 4
                            ? "bg-warning" 
                            : "bg-info"
                        } me-2" title="Edit count">
                            <i class="fas fa-edit me-1"></i>${5 - task.timesUpdated} edits left
                        </span>
                        <span class="text-muted small me-2">
                            <i class="fas fa-calendar-plus me-1"></i>Start: ${
                              task.startDate || "Not set"
                            }
                        </span>
                        <span class="${timeClass} small">
                            <i class="${timeIcon} me-1"></i>${
    isCompleted ? "Completed" : countdown.text
  }
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm ${
                      task.timesUpdated >= 5 
                        ? "btn-secondary disabled" 
                        : "btn-outline-primary"
                    } me-1" onclick="${
                      task.timesUpdated >= 5 
                        ? "showNotification('This task has reached the maximum edit limit of 5 times!', 'danger')" 
                        : `editTask(${boardId}, ${folderId}, ${task.id})`
                    }" title="${
                      task.timesUpdated >= 5
                        ? "Maximum edits reached" 
                        : "Edit task"
                    }">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${boardId}, ${folderId}, ${
    task.id
  })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// 8. UTILITY FUNCTIONS - SIMPLE
// ============================================================================

function getPriorityName(priority) {
  const priorityNames = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
  };
  return priorityNames[priority] || priority;
}







function getStatusName(status) {
  const statusNames = {
    pending: "Pending",
    active: "Active",
    completed: "Completed",
  };
  return statusNames[status] || status;
}

function calculateCountdown(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;

  if (diff < 0) {
    // Task is overdue - calculate how many days/hours overdue
    const overdueDiff = Math.abs(diff); //convert negative to positive
    const overdueDays = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor(
      (overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60) 
    );
          const overdueMinutes = Math.floor(
        (overdueDiff % (1000 * 60 * 60)) / (1000 * 60)
      );
    const overdueSeconds = Math.floor(
      (overdueDiff % (1000 * 60)) / 1000
    );

    if (overdueDays > 0) {
      return {
        expired: true,
        text: `Overdue by ${overdueDays}d ${overdueHours}h ${overdueMinutes}m ${overdueSeconds}s`,
      };
    } else if (overdueHours > 0) {
      return {
        expired: true,
        text: `Overdue by ${overdueHours}h ${overdueMinutes}m ${overdueSeconds}s`,
      };
    } else if (overdueMinutes > 0) {
      return { expired: true, text: `Overdue by ${overdueMinutes}m ${overdueSeconds}s` };
    } else if (overdueSeconds > 0) {
      return { expired: true, text: `Overdue by ${overdueSeconds}s` };
    } else {
      return { expired: true, text: "Overdue by less than 1s" };
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
 
  if (days > 0) {
    return { expired: false, text: `${days}d ${hours}h  ${minutes}m ${seconds}s left` };  
  } else if (hours > 0) {
    return { expired: false, text: `${hours}h ${minutes}m  ${seconds}s left` };
  } else if (minutes > 0) {
    return { expired: false, text: `${minutes}m ${seconds}s left ` };
  } else if (seconds > 0) {
    return { expired: false, text: `${seconds}s left ` };
  } else {
    return { expired: false, text: "Due now" };
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "high":
      return "bg-danger";
    case "medium":
      return "bg-warning";
    case "low":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "completed":
      return "bg-success";
    case "active":
      return "bg-info";
    case "pending":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
}

function updateStats() {
  let pending = 0,
    active = 0,
    completed = 0,
    overdue = 0;

  allBoards.forEach((board) => {
    board.folders.forEach((folder) => {
      folder.tasks.forEach((task) => {
        const countdown = calculateCountdown(task.dueDate);

        if (task.status === "pending") pending++;
        else if (task.status === "active") active++;
        else if (task.status === "completed") completed++;

        if (countdown.expired && task.status !== "completed") overdue++;
      });
    });
  });

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("activeCount").textContent = active;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("overdueCount").textContent = overdue;
}





// ============================================================================
// 9. SEARCH FUNCTIONALITY - SIMPLE
// ============================================================================

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", performSearch);
  }
}

function performSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  // If no search term, show all boards
  if (!searchTerm) {
    displayBoards();
    return;
  }

  // Create a copy of boards for filtering
  const filteredBoards = [];

  // Go through each board
  allBoards.forEach((board) => {
    const boardCopy = { ...board, folders: [] };
    let boardMatches = false;

    // Check if board name/description matches
    if (
      board.name.toLowerCase().includes(searchTerm) ||
      (board.description &&
        board.description.toLowerCase().includes(searchTerm))
    ) {
      boardMatches = true;
    }

    // Go through each folder in the board
    board.folders.forEach((folder) => {
      const folderCopy = { ...folder, tasks: [] };
      let folderMatches = false;

      // Check if folder name/description matches
      if (
        folder.name.toLowerCase().includes(searchTerm) ||
        (folder.description &&
          folder.description.toLowerCase().includes(searchTerm))
      ) {
        folderMatches = true;
      }

      // Go through each task in the folder
      folder.tasks.forEach((task) => {
        // Check if task title/description matches
        if (
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm))
        ) {
          folderCopy.tasks.push(task);
        }
      });

      // If board matches, show ALL folders and tasks
      if (boardMatches) {
        // Add the complete folder with all tasks
        const completeFolder = { ...folder };
        boardCopy.folders.push(completeFolder);
      } else if (folderMatches || folderCopy.tasks.length > 0) {
        // Add folder if it matches or has matching tasks
        boardCopy.folders.push(folderCopy);
      }
    });

    // Add board if it matches or has matching folders
    if (boardMatches || boardCopy.folders.length > 0) {
      filteredBoards.push(boardCopy);
    }
  });

  // Show filtered results
  showSearchResults(filteredBoards);
}

function showSearchResults(filteredBoards) {
  const container = document.getElementById("boardsContainer");

  // If no results found
  if (filteredBoards.length === 0) {
    container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No results found</h4>
                <p class="text-muted">Try different search terms</p>
            </div>
        `;
    return;
  }

  // Show filtered boards
  let html = "";
  filteredBoards.forEach((board) => {
    html += createBoardHTML(board);
  });
  container.innerHTML = html;
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("searchFilter").value = "all";
  displayBoards();
}

// ============================================================================
// 10. MODAL HELPERS - SIMPLE
// ============================================================================

function setDefaultTaskDates() {
  // Set default dates - today for start, tomorrow for end
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Format dates as YYYY-MM-DD for input fields
  const todayFormatted = today.toISOString().split("T")[0];
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

  document.getElementById("taskStartDate").value = todayFormatted;
  document.getElementById("taskDate").value = tomorrowFormatted;
}




function showAddFolderModal(boardId) {
  // Find the board to get its name
  const board = allBoards.find(b => b.id === boardId);
  if (board) {
    // Set the hidden input value
    document.getElementById("folderBoard").value = boardId;
    // Display the board name
    document.getElementById("folderBoardDisplay").textContent = board.name;
    new bootstrap.Modal(document.getElementById("addFolderModal")).show();
  }
}

function showAddTaskModal(boardId, folderId) {
  // Find the board and folder to get their names
  const board = allBoards.find(b => b.id === boardId);
  if (board) {
    const folder = board.folders.find(f => f.id === folderId);
    if (folder) {
      // Set the hidden input values
      document.getElementById("taskBoard").value = boardId;
      document.getElementById("taskFolder").value = folderId;
      
      // Display the board and folder names
      document.getElementById("taskBoardDisplay").textContent = board.name;
      document.getElementById("taskFolderDisplay").textContent = folder.name;

      // Set default dates
      setDefaultTaskDates();

      new bootstrap.Modal(document.getElementById("addTaskModal")).show();
    }
  }
}

// ============================================================================
// 11. NOTIFICATION - SIMPLE
// ============================================================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${
    type === "error" ? "danger" : type
  } alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);
  

  setTimeout(() => {
    if (notification.parentNode) {  // parentNode is js property that gives access to the parent element of the notification
      notification.remove();
    }
  }, 2000);
}

// ============================================================================
// 12. LOGOUT - SIMPLE
// ============================================================================

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
}

// ============================================================================
// 13. EVENT LISTENERS - SIMPLE
// ============================================================================


