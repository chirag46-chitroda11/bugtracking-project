# Global Premium Loading System — Implementation Plan

## Goal

Replace **every** `if (loading) return <...>` and blank/boring loading state across the entire Fixify app with a premium branded Fixify loader.

---

## Architecture: 2 New Components

### `PageLoader.jsx` — Full-page branded loader
- **For**: Standalone pages (Profile, BugDetails, TaskDetail, EditTask, etc.)
- **Visual**: Dark overlay + animated shield+bolt logo + "FIXIFY." text + contextual message
- **Anti-flicker**: 300ms delay before showing

### `InlineLoader.jsx` — Compact in-content loader
- **For**: Dashboard sub-tabs (PMTasks, TesterBugs, MyTasks, etc.)
- **Visual**: Glassmorphism card, small animated shield icon + pulse glow + status text
- **Fits**: Inside the dashboard content area, matches lavender background

---

## 21 Files to Modify

### Full-page loaders (7 files)
- Profile.jsx, BugDetails.jsx, TaskDetail.jsx, TesterTaskDetail.jsx
- EditTask.jsx, EditProject.jsx, EditSprint.jsx

### Dashboard sub-tab loaders (14 files)
- TesterSummary, TesterTasks, TesterBugs
- MyTasks, MyBugs, WorkLogs
- PMDashboardSummary, PMProjects, PMTasks, PMBugs, PMSprints
- PMTeam, PMWorkload, PMProjectDetail

---

## What Stays Untouched
- All routes, auth, API calls, services, context, business logic
- Only the loading return JSX is swapped
