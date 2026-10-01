# TaskCraft - Premium List & Task Manager

TaskCraft is a high-fidelity, interactive vanilla web application featuring a beautiful glassmorphic dark-mode layout, flexible custom list categories, detailed subtask checklists, and custom synthesized sounds. It is built strictly using raw vanilla technologies (HTML, CSS, JavaScript) and adheres to a specific premium color palette.

---

## 🏆 Key Features

- **Smart Focused Lists**:
  - `All Tasks`: Centralized view of all items across all custom lists.
  - `Today`: Displays items due today, ensuring focused single-day execution.
  - `Upcoming`: Provides a chronological roadmap of future agenda items.
  - `Overdue`: Automatically highlights active tasks whose due date/time has passed, styled in red alerts.
- **Custom User Lists**:
  - Create, rename, or delete custom list categories (e.g., *Personal*, *Work*, *Gym*, *Groceries*).
  - Assign distinct colors (Beige, Gold, Red, Muted Blue, Muted Green) to each list.
- **Subtask Checklist Systems**:
  - Create multiple subtasks for any item inside the task creation modal.
  - Track checklist progress with dynamic badges showing completion status (e.g., `Checklist: 3/5`).
  - Toggle checklist sub-items directly on task cards without opening edit forms.
- **Dynamic Productivity Indicators**:
  - Radial SVG completion ring showing overall completion rate across all tasks.
  - Streak tracker (`🔥`) that keeps count of consecutive completion days.
  - Real-time linear progress bars showing completion rates inside individual lists.
- **Web Audio API Sound Engine**:
  - Synthesizes retro/modern chime sounds, click toggles, success sweeps, and deletion tones dynamically inside the browser. No external media files are required!
- **Keyboard Shortcuts**:
  - Navigate and operate the app swiftly without lifting your hands from the keyboard.

---

## 🎨 Color Palette Specifications

This project strictly adheres to the following color tokens:
- **Primary Accent/Red**: `#A63242` — High priority badges, overdue timers, delete warnings, and active alert elements.
- **Highlight/Gold**: `#F2AB27` — Medium priority, active sidebar status, completion progress rings, and focus highlights.
- **Primary Text/Minty White**: `#F4F9F5` — Brand typography, primary header texts, active form fields, and text labels.
- **Secondary Text/Beige**: `#E2E0D8` — Body text, descriptions, low priority tags, and system keyboard guides.
- **Background**: `#000000` — Pure deep-black dashboard background.
- **Dark Surface/Card Background**: `#0D0D0D` — Glassmorphic sidebar panel, card backings, and modal containers.
- **Interaction/Hover Background**: `#161616` — Custom list buttons, tab hovers, table rows, and secondary input boxes.

---

## ⌨️ Keyboard Shortcuts

Speed up your task management with the following integrated keyboard shortcuts:

| Key Binding | Action Performed |
|---|---|
| `N` | Open the New Task Form Modal |
| `L` | Open the Custom List Creator Modal |
| `Alt` + `F` | Focus cursor on the workspace search bar |
| `S` | Toggle Synthesized Audio ON / OFF |
| `Escape` | Close any active modal dialog / overlay |

---

## 🛠️ Technology Stack

- **Structure**: Semantic HTML5 markup
- **Style**: Custom responsive CSS3 Grid and Flexbox layouts
- **Logic**: Vanilla ES6+ Javascript
- **Sound**: Native Browser Web Audio API synthesizer
- **Fonts**: Outfit (headings) & Inter (body) via Google Fonts

---

## 🚀 How to Run Locally

Since this is a client-side vanilla web application, it does not require any installation, bundlers, or build phases.

### Method 1: Local HTTP Server (Recommended)
Running through an HTTP server ensures correct behavior of all browser APIs (e.g., local storage and window controls).

1. Open your terminal in the project root directory.
2. Launch a simple python server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Method 2: Direct Execution
Simply double-click the `index.html` file in your system's file browser to launch it directly in your default web browser.
