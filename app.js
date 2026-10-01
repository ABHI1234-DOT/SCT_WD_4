/**
 * TASKCRAFT - Application logic and state management
 * Strictly vanilla ES6+ JS. No third-party AI or library wrappers.
 */

// --- Audio Synthesizer Engine (Web Audio API) ---
const SoundEngine = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playClick() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
    },

    playSuccess() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Ascending major chord (C5 -> E5 -> G5 -> C6)
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); 
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); 
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    },

    playAdd() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.setValueAtTime(520, ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    },

    playDelete() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.22);
        
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
    }
};

// --- Application State ---
let state = {
    lists: [],
    tasks: [],
    activeListId: 'all',
    activeFilter: 'all',
    activeSort: 'dueDateAsc',
    streakCount: 0,
    lastCompletionDate: null,
    tempSubtasks: [] // Holds subtasks currently being created/edited in modal
};

// --- Initial Mock Data Generator ---
function createMockData() {
    const defaultLists = [
        { id: 'list-personal', name: 'Personal', color: '#E2E0D8', isCustom: true },
        { id: 'list-work', name: 'Work Project', color: '#F2AB27', isCustom: true },
        { id: 'list-fitness', name: 'Fitness & Health', color: '#A63242', isCustom: true }
    ];

    const todayStr = getTodayDateString();
    
    // Create yesterday date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Create tomorrow date string
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const defaultTasks = [
        {
            id: 'task-1',
            title: 'Welcome to TaskCraft 🌟',
            description: 'Explore the app layout! Create some custom lists, toggle task priorities, or test the sound effects in the lower-left settings panel.',
            dueDate: todayStr,
            dueTime: '23:59',
            priority: 'medium',
            listId: 'all',
            completed: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            subtasks: [
                { id: 'sub-1', title: 'Add a new list category', completed: false },
                { id: 'sub-2', title: 'Complete a checklist subtask', completed: false },
                { id: 'sub-3', title: 'Try out keyboard shortcuts', completed: false }
            ]
        },
        {
            id: 'task-2',
            title: 'Review design layout options',
            description: 'Determine which surface colors work best with the beige and gold highlighting.',
            dueDate: todayStr,
            dueTime: '12:00',
            priority: 'low',
            listId: 'list-personal',
            completed: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            subtasks: []
        },
        {
            id: 'task-3',
            title: 'Finalize quarterly project review slides',
            description: 'Insert target metrics, team velocity details, and upcoming sprint milestones.',
            dueDate: tomorrowStr,
            dueTime: '09:00',
            priority: 'high',
            listId: 'list-work',
            completed: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            subtasks: [
                { id: 'sub-4', title: 'Collect developer velocity data', completed: true },
                { id: 'sub-5', title: 'Compile feedback from design audits', completed: false }
            ]
        },
        {
            id: 'task-4',
            title: 'Overdue project retrospective report',
            description: 'This task was scheduled to be completed yesterday but has not been ticked off. Notice it renders in red as Overdue.',
            dueDate: yesterdayStr,
            dueTime: '17:00',
            priority: 'high',
            listId: 'list-work',
            completed: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
            subtasks: []
        },
        {
            id: 'task-5',
            title: 'Cardio workout / Gym routine',
            description: 'Run 5 kilometers on the treadmill and perform upper body conditioning exercises.',
            dueDate: tomorrowStr,
            dueTime: '07:00',
            priority: 'medium',
            listId: 'list-fitness',
            completed: false,
            createdAt: new Date().toISOString(),
            subtasks: []
        }
    ];

    return { lists: defaultLists, tasks: defaultTasks };
}

// --- Date Helper Functions ---
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function isOverdue(task) {
    if (task.completed || !task.dueDate) return false;
    
    const today = getTodayDateString();
    if (task.dueDate < today) {
        return true;
    } else if (task.dueDate === today) {
        if (!task.dueTime) return false;
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        return task.dueTime < currentTime;
    }
    return false;
}

function isDueToday(task) {
    if (task.completed || !task.dueDate) return false;
    return task.dueDate === getTodayDateString();
}

function isUpcoming(task) {
    if (task.completed || !task.dueDate) return false;
    return task.dueDate > getTodayDateString();
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
        return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
        return 'Tomorrow';
    }
    
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length !== 2) return timeStr;
    
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
}

// --- State Storage Operations ---
function loadState() {
    try {
        const stored = localStorage.getItem('taskcraft_state');
        if (stored) {
            state = JSON.parse(stored);
            // Ensure lists color codes are backwards compatible
            if (!state.lists) state.lists = [];
            if (!state.tasks) state.tasks = [];
            if (!state.activeListId) state.activeListId = 'all';
            if (!state.activeFilter) state.activeFilter = 'all';
            if (!state.activeSort) state.activeSort = 'dueDateAsc';
            if (state.soundEnabled === undefined) state.soundEnabled = true;
            if (state.streakCount === undefined) state.streakCount = 0;
            state.tempSubtasks = [];
            SoundEngine.enabled = state.soundEnabled;
        } else {
            const defaults = createMockData();
            state.lists = defaults.lists;
            state.tasks = defaults.tasks;
            state.activeListId = 'all';
            state.activeFilter = 'all';
            state.activeSort = 'dueDateAsc';
            state.soundEnabled = true;
            state.streakCount = 0;
            state.lastCompletionDate = null;
            state.tempSubtasks = [];
            saveState();
        }
    } catch (e) {
        console.error("Local Storage loading failure", e);
        const defaults = createMockData();
        state.lists = defaults.lists;
        state.tasks = defaults.tasks;
    }
}

function saveState() {
    try {
        localStorage.setItem('taskcraft_state', JSON.stringify(state));
    } catch (e) {
        console.error("Local Storage save failure", e);
    }
}

// --- Dynamic Rendering Logics ---
function updateDateDisplay() {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('currentDateText').innerText = new Date().toLocaleDateString('en-US', options);
}

function renderCustomLists() {
    const container = document.getElementById('customListsContainer');
    container.innerHTML = '';

    state.lists.forEach(list => {
        // Calculate task count for custom list
        const activeCount = state.tasks.filter(t => t.listId === list.id && !t.completed).length;

        const li = document.createElement('li');
        li.className = `list-item ${state.activeListId === list.id ? 'active' : ''}`;
        li.setAttribute('data-list-id', list.id);
        
        li.innerHTML = `
            <span class="list-color-dot" style="background-color: ${list.color || '#E2E0D8'};"></span>
            <span class="list-name">${escapeHTML(list.name)}</span>
            <span class="list-badge">${activeCount}</span>
            <div class="list-item-actions">
                <button class="btn-icon-sm btn-edit-list" data-list-id="${list.id}" title="Rename List">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="btn-icon-sm btn-delete-list text-danger" data-list-id="${list.id}" title="Delete List">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        
        // Add select list handler
        li.addEventListener('click', (e) => {
            // If click was on edit/delete actions, ignore select handler
            if (e.target.closest('.list-item-actions')) return;
            selectList(list.id);
        });

        // Add edit action handler
        li.querySelector('.btn-edit-list').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditListModal(list.id);
        });

        // Add delete action handler
        li.querySelector('.btn-delete-list').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteList(list.id);
        });

        container.appendChild(li);
    });
}

function updateSidebarBadges() {
    const totalActive = state.tasks.filter(t => !t.completed).length;
    const todayCount = state.tasks.filter(t => isDueToday(t)).length;
    const upcomingCount = state.tasks.filter(t => isUpcoming(t)).length;
    const overdueCount = state.tasks.filter(t => isOverdue(t)).length;

    document.getElementById('badge-all').innerText = totalActive;
    document.getElementById('badge-today').innerText = todayCount;
    document.getElementById('badge-upcoming').innerText = upcomingCount;
    
    const overdueBadge = document.getElementById('badge-overdue');
    overdueBadge.innerText = overdueCount;
    if (overdueCount > 0) {
        overdueBadge.classList.add('bg-danger');
        overdueBadge.style.display = 'inline-block';
    } else {
        overdueBadge.classList.remove('bg-danger');
        overdueBadge.style.display = 'none';
    }
}

function renderTasks() {
    const activeTasksList = document.getElementById('activeTasksList');
    const completedTasksList = document.getElementById('completedTasksList');
    const completedSection = document.getElementById('completedTasksSection');
    const emptyStateContainer = document.getElementById('emptyStateContainer');
    const searchVal = document.getElementById('taskSearchInput').value.toLowerCase().trim();

    activeTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    // Step 1: Filter tasks by current selected list category
    let filteredTasks = [];
    if (state.activeListId === 'all') {
        filteredTasks = state.tasks;
    } else if (state.activeListId === 'today') {
        filteredTasks = state.tasks.filter(t => isDueToday(t));
    } else if (state.activeListId === 'upcoming') {
        filteredTasks = state.tasks.filter(t => isUpcoming(t));
    } else if (state.activeListId === 'overdue') {
        filteredTasks = state.tasks.filter(t => isOverdue(t));
    } else {
        filteredTasks = state.tasks.filter(t => t.listId === state.activeListId);
    }

    // Step 2: Filter tasks by text search queries
    if (searchVal) {
        filteredTasks = filteredTasks.filter(t => 
            t.title.toLowerCase().includes(searchVal) || 
            (t.description && t.description.toLowerCase().includes(searchVal)) ||
            (t.priority && t.priority.toLowerCase().includes(searchVal))
        );
        document.getElementById('btnClearSearch').style.display = 'block';
    } else {
        document.getElementById('btnClearSearch').style.display = 'none';
    }

    // Step 3: Sort tasks
    sortTasksList(filteredTasks);

    // Track active and completed divisions
    const activeTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    // Apply main view filter (All, Active, Completed tabs)
    let displayActive = [];
    let displayCompleted = [];

    if (state.activeFilter === 'all') {
        displayActive = activeTasks;
        displayCompleted = completedTasks;
    } else if (state.activeFilter === 'active') {
        displayActive = activeTasks;
        displayCompleted = [];
    } else if (state.activeFilter === 'completed') {
        displayActive = [];
        displayCompleted = completedTasks;
    }

    // Update List progress bar
    updateProgressBar(filteredTasks);

    // Render active tasks
    displayActive.forEach(task => {
        activeTasksList.appendChild(createTaskCardDOM(task));
    });

    // Render completed tasks
    displayCompleted.forEach(task => {
        completedTasksList.appendChild(createTaskCardDOM(task));
    });

    // Toggle completed section display
    if (completedTasks.length > 0 && state.activeFilter !== 'active') {
        completedSection.style.display = 'block';
        document.getElementById('completedSectionTitle').innerText = `Completed Tasks (${completedTasks.length})`;
    } else {
        completedSection.style.display = 'none';
    }

    // Toggle empty states
    const totalDisplayed = displayActive.length + displayCompleted.length;
    if (totalDisplayed === 0) {
        emptyStateContainer.style.display = 'flex';
    } else {
        emptyStateContainer.style.display = 'none';
    }

    // Refresh count badges on lists
    updateSidebarBadges();
    updateGlobalStats();
}

function createTaskCardDOM(task) {
    const li = document.createElement('li');
    li.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-task-id', task.id);

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const subtaskDoneCount = hasSubtasks ? task.subtasks.filter(s => s.completed).length : 0;
    const subtaskTotal = hasSubtasks ? task.subtasks.length : 0;
    
    // Check if task is overdue (if active)
    const taskOverdue = isOverdue(task);
    const taskDueToday = isDueToday(task);
    
    // Find list details
    const listObj = state.lists.find(l => l.id === task.listId);
    const listName = listObj ? listObj.name : 'Inbox';
    const listColor = listObj ? listObj.color : '#E2E0D8';

    // Build subtasks HTML if present
    let subtasksHTML = '';
    if (hasSubtasks) {
        subtasksHTML = `
            <div class="task-card-subtasks-container" style="margin-top: 0.75rem; border-top: 1px dashed var(--color-border); padding-top: 0.5rem; width:100%;">
                <ul style="list-style:none; display:flex; flex-direction:column; gap:0.35rem;">
                    ${task.subtasks.map(sub => `
                        <li style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; opacity:${sub.completed ? 0.6 : 0.9};">
                            <label class="checkbox-container" style="width:16px; height:16px;">
                                <input type="checkbox" class="cb-subtask-toggle" data-task-id="${task.id}" data-sub-id="${sub.id}" ${sub.completed ? 'checked' : ''}>
                                <span class="checkbox-custom" style="width:16px; height:16px; border-radius:4px;"></span>
                            </label>
                            <span style="text-decoration:${sub.completed ? 'line-through' : 'none'};">${escapeHTML(sub.title)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    li.innerHTML = `
        <div class="task-checkbox-area">
            <label class="checkbox-container">
                <input type="checkbox" class="cb-task-toggle" ${task.completed ? 'checked' : ''}>
                <span class="checkbox-custom"></span>
            </label>
        </div>
        <div class="task-info-area">
            <span class="task-card-title">${escapeHTML(task.title)}</span>
            ${task.description ? `<p class="task-card-desc">${escapeHTML(task.description)}</p>` : ''}
            <div class="task-metadata">
                <span class="meta-badge badge-list">
                    <span class="list-color-dot" style="background-color: ${listColor}; margin-right: 0.35rem; width:6px; height:6px;"></span>
                    ${escapeHTML(listName)}
                </span>
                ${task.dueDate ? `
                    <span class="meta-badge ${taskOverdue ? 'badge-date-overdue' : (taskDueToday ? 'badge-date-today' : '')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>${formatDateDisplay(task.dueDate)} ${task.dueTime ? 'at ' + formatTimeDisplay(task.dueTime) : ''}</span>
                    </span>
                ` : ''}
                <span class="meta-badge" style="text-transform: capitalize;">
                    Priority: ${task.priority}
                </span>
                ${hasSubtasks ? `
                    <span class="task-subtasks-overview">
                        Checklist: ${subtaskDoneCount}/${subtaskTotal}
                    </span>
                ` : ''}
            </div>
            ${subtasksHTML}
        </div>
        <div class="task-actions-area">
            <button class="btn-card-action btn-edit-task" title="Edit Task details">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="btn-card-action btn-delete-task btn-delete" title="Delete Task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `;

    // Event handler: task toggle status
    li.querySelector('.cb-task-toggle').addEventListener('change', (e) => {
        toggleTaskComplete(task.id);
    });

    // Event handlers: subtasks toggle inside card
    if (hasSubtasks) {
        li.querySelectorAll('.cb-subtask-toggle').forEach(el => {
            el.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                const subId = e.target.getAttribute('data-sub-id');
                toggleSubtaskComplete(taskId, subId);
            });
        });
    }

    // Event handler: edit task
    li.querySelector('.btn-edit-task').addEventListener('click', (e) => {
        openEditTaskModal(task.id);
    });

    // Event handler: delete task
    li.querySelector('.btn-delete-task').addEventListener('click', (e) => {
        deleteTask(task.id);
    });

    return li;
}

function updateProgressBar(filteredTasks) {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const progressFill = document.getElementById('listProgressBarFill');
    const progressText = document.getElementById('listProgressText');
    const wrapper = document.getElementById('listProgressWrapper');

    if (total === 0) {
        wrapper.style.display = 'none';
        return;
    }

    wrapper.style.display = 'flex';
    const percent = Math.round((completed / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressText.innerText = `${percent}% tasks completed`;
}

function updateGlobalStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const rateText = document.getElementById('completionRateText');
    const ringFill = document.getElementById('completionRing');
    const streakText = document.getElementById('streakText');
    const doneTodayText = document.getElementById('doneCountText');

    // 1. Completion Rate percentage and SVG Ring
    let percent = 0;
    if (total > 0) {
        percent = Math.round((completed / total) * 100);
    }
    rateText.innerText = `${percent}%`;

    // SVG dash offset calculation (R=40, circumference = 2 * PI * R ≈ 251.2)
    const circ = 251.2;
    const offset = circ - (percent / 100) * circ;
    ringFill.style.strokeDashoffset = offset;

    // 2. Count of tasks done today
    const today = getTodayDateString();
    // In our task schema, we should tag completion timestamps if we want to be exact.
    // For now we calculate tasks marked completed today. (Completed tasks matching due date today or just completed tasks in state)
    // Let's count all completed tasks that have due date as today, or are just marked completed (we can approximate it by counting tasks completed today).
    // Let's filter tasks completed today:
    const doneToday = state.tasks.filter(t => t.completed && t.dueDate === today).length;
    doneTodayText.innerText = doneToday;

    // 3. Streak Count
    streakText.innerText = `${state.streakCount} day${state.streakCount !== 1 ? 's' : ''} 🔥`;
}

function checkStreakIntegrity() {
    const today = getTodayDateString();
    
    // If last completion was before yesterday, and no completions have happened today, reset streak to 0
    if (state.lastCompletionDate) {
        const last = new Date(state.lastCompletionDate);
        const curr = new Date(today);
        const diffTime = Math.abs(curr - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            state.streakCount = 0;
            saveState();
        }
    }
}

// --- Task Filter, Sort, Selection Logics ---
function selectList(listId) {
    state.activeListId = listId;
    
    // Update active list elements in sidebar
    document.querySelectorAll('.app-sidebar .list-item').forEach(el => {
        el.classList.remove('active');
    });

    const activeEl = document.querySelector(`.app-sidebar [data-list-id="${listId}"]`);
    if (activeEl) activeEl.classList.add('active');

    // Update main section header titles
    const titleEl = document.getElementById('activeListTitle');
    const subtitleEl = document.getElementById('activeListSubtitle');

    if (listId === 'all') {
        titleEl.innerText = 'All Tasks';
        subtitleEl.innerText = 'Organize and execute your agenda.';
    } else if (listId === 'today') {
        titleEl.innerText = 'Today\'s Agenda';
        subtitleEl.innerText = 'Critical focus items scheduled for today.';
    } else if (listId === 'upcoming') {
        titleEl.innerText = 'Upcoming Tasks';
        subtitleEl.innerText = 'Future plans, events, and milestones.';
    } else if (listId === 'overdue') {
        titleEl.innerText = 'Overdue Items';
        subtitleEl.innerText = 'Actionable items requiring immediate closure.';
    } else {
        const listObj = state.lists.find(l => l.id === listId);
        if (listObj) {
            titleEl.innerText = listObj.name;
            subtitleEl.innerText = `Custom list folder details.`;
        }
    }

    renderTasks();
}

function sortTasksList(taskList) {
    taskList.sort((a, b) => {
        if (state.activeSort === 'dueDateAsc') {
            // Put items with no due date last
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            if (a.dueDate !== b.dueDate) {
                return a.dueDate.localeCompare(b.dueDate);
            }
            return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
        } else if (state.activeSort === 'dueDateDesc') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            if (a.dueDate !== b.dueDate) {
                return b.dueDate.localeCompare(a.dueDate);
            }
            return (b.dueTime || '00:00').localeCompare(a.dueTime || '00:00');
        } else if (state.activeSort === 'priorityDesc') {
            const pVal = { high: 3, medium: 2, low: 1 };
            return pVal[b.priority] - pVal[a.priority];
        } else if (state.activeSort === 'priorityAsc') {
            const pVal = { high: 3, medium: 2, low: 1 };
            return pVal[a.priority] - pVal[b.priority];
        } else if (state.activeSort === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else if (state.activeSort === 'createdDesc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });
}

// --- Dialog / Modal Popups controllers ---
function showModal(modalId) {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function hideAllModals() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelectorAll('.modal-container').forEach(el => {
        el.classList.remove('active');
    });
}

function openNewTaskModal() {
    document.getElementById('taskModalTitle').innerText = 'Create New Task';
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskForm').reset();
    
    // Clear subtasks
    state.tempSubtasks = [];
    renderSubtaskCreationList();

    // Populate category dropdown
    populateCategoryDropdown('taskCategorySelect');
    
    // Set default category to active list if it's custom, otherwise default to first custom or 'all'
    const selectEl = document.getElementById('taskCategorySelect');
    if (state.activeListId !== 'all' && state.activeListId !== 'today' && state.activeListId !== 'upcoming' && state.activeListId !== 'overdue') {
        selectEl.value = state.activeListId;
    } else {
        selectEl.value = 'all';
    }

    showModal('taskModal');
}

function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('taskModalTitle').innerText = 'Edit Task Details';
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description || '';
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskDueTime').value = task.dueTime || '';

    // Priority radio select
    document.querySelectorAll('input[name="taskPriority"]').forEach(radio => {
        if (radio.value === task.priority) radio.checked = true;
    });

    // Populate category dropdown
    populateCategoryDropdown('taskCategorySelect');
    document.getElementById('taskCategorySelect').value = task.listId;

    // Load subtasks
    state.tempSubtasks = task.subtasks ? [...task.subtasks] : [];
    renderSubtaskCreationList();

    showModal('taskModal');
}

function openNewListModal() {
    document.getElementById('listModalTitle').innerText = 'Create Custom List';
    document.getElementById('editListId').value = '';
    document.getElementById('listForm').reset();
    document.getElementById('btnSaveList').innerText = 'Create List';
    showModal('listModal');
}

function openEditListModal(listId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;

    document.getElementById('listModalTitle').innerText = 'Rename List';
    document.getElementById('editListId').value = list.id;
    document.getElementById('listName').value = list.name;
    document.getElementById('btnSaveList').innerText = 'Rename';

    // Color pick selection
    document.querySelectorAll('input[name="listColor"]').forEach(radio => {
        if (radio.value === list.color) radio.checked = true;
    });

    showModal('listModal');
}

function populateCategoryDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="all">Inbox (No List)</option>';
    
    state.lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.innerText = list.name;
        select.appendChild(option);
    });
}

// --- CRUD Task Operations ---
function saveTaskData(e) {
    e.preventDefault();

    const editId = document.getElementById('editTaskId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const dueTime = document.getElementById('taskDueTime').value;
    const listId = document.getElementById('taskCategorySelect').value;
    const priority = document.querySelector('input[name="taskPriority"]:checked').value;

    if (!title) return;

    if (editId) {
        // Edit Mode
        const taskIdx = state.tasks.findIndex(t => t.id === editId);
        if (taskIdx !== -1) {
            state.tasks[taskIdx].title = title;
            state.tasks[taskIdx].description = description;
            state.tasks[taskIdx].dueDate = dueDate;
            state.tasks[taskIdx].dueTime = dueTime;
            state.tasks[taskIdx].listId = listId;
            state.tasks[taskIdx].priority = priority;
            state.tasks[taskIdx].subtasks = [...state.tempSubtasks];
            
            // If task was overdue or completed, re-eval occurs on render
            SoundEngine.playAdd();
        }
    } else {
        // Add Mode
        const newTask = {
            id: 'task-' + Date.now(),
            title,
            description,
            dueDate,
            dueTime,
            priority,
            listId,
            completed: false,
            createdAt: new Date().toISOString(),
            subtasks: [...state.tempSubtasks]
        };

        state.tasks.push(newTask);
        SoundEngine.playAdd();
    }

    saveState();
    hideAllModals();
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        SoundEngine.playSuccess();
        
        // Track productivity streak count
        const today = getTodayDateString();
        if (state.lastCompletionDate === null) {
            state.streakCount = 1;
            state.lastCompletionDate = today;
        } else if (state.lastCompletionDate === today) {
            // Already did something today, streak remains same
        } else {
            // Check if last completion was yesterday to increment streak
            const last = new Date(state.lastCompletionDate);
            const curr = new Date(today);
            const diffTime = Math.abs(curr - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                state.streakCount += 1;
            } else {
                state.streakCount = 1; // streak reset/re-init
            }
            state.lastCompletionDate = today;
        }
    } else {
        SoundEngine.playClick();
    }

    saveState();
    renderTasks();
}

function toggleSubtaskComplete(taskId, subId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const sub = task.subtasks.find(s => s.id === subId);
    if (sub) {
        sub.completed = !sub.completed;
        SoundEngine.playClick();
        saveState();
        renderTasks();
    }
}

function deleteTask(taskId) {
    // Soft confirmation using matching theme modals can be built.
    // Standard alert/confirm checks or direct deletes are supported.
    // Let's do a direct delete with sound for seamless flow.
    const taskIdx = state.tasks.findIndex(t => t.id === taskId);
    if (taskIdx !== -1) {
        state.tasks.splice(taskIdx, 1);
        SoundEngine.playDelete();
        saveState();
        renderTasks();
    }
}

// --- Subtask Dialog Editor Logics ---
function addTempSubtask() {
    const input = document.getElementById('newSubtaskInput');
    const title = input.value.trim();
    if (!title) return;

    state.tempSubtasks.push({
        id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title,
        completed: false
    });

    input.value = '';
    renderSubtaskCreationList();
    SoundEngine.playClick();
}

function removeTempSubtask(subId) {
    state.tempSubtasks = state.tempSubtasks.filter(s => s.id !== subId);
    renderSubtaskCreationList();
    SoundEngine.playClick();
}

function renderSubtaskCreationList() {
    const list = document.getElementById('subtaskCreationList');
    list.innerHTML = '';

    state.tempSubtasks.forEach(sub => {
        const li = document.createElement('li');
        li.className = 'subtask-creation-item';
        li.innerHTML = `
            <span class="subtask-label-text">${escapeHTML(sub.title)}</span>
            <button type="button" class="btn-icon-sm text-danger btn-remove-sub" data-sub-id="${sub.id}" title="Remove checklist item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        li.querySelector('.btn-remove-sub').addEventListener('click', (e) => {
            removeTempSubtask(sub.id);
        });

        list.appendChild(li);
    });
}

// --- CRUD Custom List Operations ---
function saveListData(e) {
    e.preventDefault();

    const editId = document.getElementById('editListId').value;
    const name = document.getElementById('listName').value.trim();
    const color = document.querySelector('input[name="listColor"]:checked').value;

    if (!name) return;

    if (editId) {
        // Edit Mode
        const list = state.lists.find(l => l.id === editId);
        if (list) {
            list.name = name;
            list.color = color;
            SoundEngine.playAdd();
        }
    } else {
        // Create Mode
        const newList = {
            id: 'list-' + Date.now(),
            name,
            color,
            isCustom: true
        };
        state.lists.push(newList);
        SoundEngine.playAdd();
    }

    saveState();
    hideAllModals();
    renderCustomLists();
    renderTasks();
}

function deleteList(listId) {
    if (confirm("Are you sure you want to delete this list? All tasks nested inside this list category will be permanently deleted.")) {
        state.lists = state.lists.filter(l => l.id !== listId);
        state.tasks = state.tasks.filter(t => t.listId !== listId);
        
        if (state.activeListId === listId) {
            state.activeListId = 'all';
        }

        SoundEngine.playDelete();
        saveState();
        renderCustomLists();
        selectList(state.activeListId);
    }
}

// --- Settings and Help Panel handlers ---
function toggleSoundControl() {
    SoundEngine.enabled = !SoundEngine.enabled;
    state.soundEnabled = SoundEngine.enabled;
    saveState();

    const icon = document.getElementById('soundIcon');
    const label = document.getElementById('soundLabel');

    if (SoundEngine.enabled) {
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
        label.innerText = 'Sounds: ON';
        SoundEngine.playSuccess();
    } else {
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
        label.innerText = 'Sounds: OFF';
    }
}

// --- Utility Helper Functions ---
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// --- Global Event Hook Listeners ---
function initializeEventListeners() {
    // 1. Modals Overlay triggers
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) {
            hideAllModals();
        }
    });

    // Close buttons on Modals
    document.getElementById('btnCloseTaskModal').addEventListener('click', hideAllModals);
    document.getElementById('btnCancelTaskModal').addEventListener('click', hideAllModals);
    document.getElementById('btnCloseListModal').addEventListener('click', hideAllModals);
    document.getElementById('btnCancelListModal').addEventListener('click', hideAllModals);
    document.getElementById('btnCloseHelpModal').addEventListener('click', hideAllModals);

    // 2. Open Modals buttons
    document.getElementById('btnOpenNewTaskModal').addEventListener('click', openNewTaskModal);
    document.getElementById('btnEmptyStateCreate').addEventListener('click', openNewTaskModal);
    document.getElementById('btnOpenNewListModal').addEventListener('click', openNewListModal);
    document.getElementById('btnOpenHelpModal').addEventListener('click', () => showModal('helpModal'));

    // 3. Form Submit triggers
    document.getElementById('taskForm').addEventListener('submit', saveTaskData);
    document.getElementById('listForm').addEventListener('submit', saveListData);

    // 4. Subtasks creation additions
    document.getElementById('btnAddSubtask').addEventListener('click', addTempSubtask);
    document.getElementById('newSubtaskInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTempSubtask();
        }
    });

    // 5. Sidebar lists (Smart Filters) selection
    document.querySelectorAll('#smartLists .list-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const listId = el.getAttribute('data-list-id');
            selectList(listId);
        });
    });

    // 6. Action Row Filter Tabs selection
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeFilter = btn.getAttribute('data-filter');
            saveState();
            renderTasks();
            SoundEngine.playClick();
        });
    });

    // 7. Action Row Sorter select selection
    document.getElementById('taskSortSelect').addEventListener('change', (e) => {
        state.activeSort = e.target.value;
        saveState();
        renderTasks();
        SoundEngine.playClick();
    });

    // 8. Search Input operations
    document.getElementById('taskSearchInput').addEventListener('input', () => {
        renderTasks();
    });

    document.getElementById('btnClearSearch').addEventListener('click', () => {
        const input = document.getElementById('taskSearchInput');
        input.value = '';
        renderTasks();
        SoundEngine.playClick();
    });

    // 9. Collapsible Completed Section
    const completedBtn = document.getElementById('btnToggleCompletedSection');
    const completedList = document.getElementById('completedTasksList');
    completedBtn.addEventListener('click', () => {
        completedBtn.classList.toggle('active');
        completedList.classList.toggle('collapsed');
        SoundEngine.playClick();
    });

    // 10. Sound Toggle settings
    document.getElementById('btnToggleSound').addEventListener('click', toggleSoundControl);

    // 11. Keyboard Shortcuts Hook
    window.addEventListener('keydown', (e) => {
        // If typing inside an input/textarea form field, don't execute shortcuts
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
            return;
        }

        const key = e.key.toLowerCase();

        if (key === 'n') {
            e.preventDefault();
            openNewTaskModal();
        } else if (key === 'l') {
            e.preventDefault();
            openNewListModal();
        } else if (key === 'escape') {
            e.preventDefault();
            hideAllModals();
        } else if (key === 's') {
            e.preventDefault();
            toggleSoundControl();
        } else if (key === 'f' && (e.altKey || e.ctrlKey)) {
            e.preventDefault();
            document.getElementById('taskSearchInput').focus();
        }
    });
}

// --- App Entry point ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateDateDisplay();
    initializeEventListeners();
    
    // Set sound controls UI initially
    const icon = document.getElementById('soundIcon');
    const label = document.getElementById('soundLabel');
    if (SoundEngine.enabled) {
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
        label.innerText = 'Sounds: ON';
    } else {
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
        label.innerText = 'Sounds: OFF';
    }

    // Set sorting select state in UI
    document.getElementById('taskSortSelect').value = state.activeSort;

    // Check streak reset criteria
    checkStreakIntegrity();

    // Render lists & task cards initially
    renderCustomLists();
    selectList(state.activeListId);
});
