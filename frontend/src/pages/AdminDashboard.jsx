import API from "../api/axios";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/bugService";
import { getProjects } from "../services/projectService";
import { useNavigate } from "react-router-dom";
import { deleteProject } from "../services/projectService";
import { getModulesByProject, deleteModule } from "../services/moduleService";
import { getTasks } from "../services/taskService";
import { deleteTask } from "../services/taskService";
import { getSprints } from "../services/sprintService";
import { assignTaskToSprint } from "../services/sprintService";
import { deleteSprint } from "../services/sprintService";
import { updateSprint } from "../services/sprintService";





const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({
    projects: 0,
    tasks: 0,
    modules: 0,
  });
  const [modulesMap, setModulesMap] = useState({});
  const [openModules, setOpenModules] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [openTasks, setOpenTasks] = useState({});
  const [openTaskDetails, setOpenTaskDetails] = useState({});
  const [taskSprintMap, setTaskSprintMap] = useState({});
  const [sprints, setSprints] = useState([]);
  const [openSprintDetails, setOpenSprintDetails] = useState({});
  const [showSprintTasks, setShowSprintTasks] = useState({});
  const [users, setUsers] = useState([]);
  const [openBugDetails, setOpenBugDetails] = useState({});

 
const allTasks = Object.values(tasksMap).flat();

const sprintStats = {
  total: sprints.length,
  planned: sprints.filter(s => s.status === "planned").length,
  active: sprints.filter(s => s.status === "active").length,
  completed: sprints.filter(s => s.status === "completed").length,
};

const statusCount = allTasks.reduce((acc, task) => {
  const status = task.status?.toLowerCase();

  if (!acc[status]) acc[status] = 0;
  acc[status]++;

  return acc;
}, {});


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      await deleteProject(id);
      alert("Project deleted");
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleDeleteModule = async (id) => {
    const confirmDelete = window.confirm("Delete this module?");
    if (!confirmDelete) return;

    try {
      await deleteModule(id);
      alert("Module deleted");

      setModulesMap((prev) => {
        let updated = { ...prev };

        for (let key in updated) {
          updated[key] = updated[key].filter(m => m._id !== id);
        }

        return updated;
      });

    } catch (error) {
      alert("Delete failed");
    }
  };

const handleDeleteTask = async (id) => {
  const confirmDelete = window.confirm("Delete this task?");
  if (!confirmDelete) return;

  try {
    await deleteTask(id);

    setTasksMap((prev) => {
      let updated = { ...prev };

      for (let key in updated) {
        updated[key] = updated[key].filter(t => t._id !== id);
      }

      return updated;
    });

    alert("Task deleted ✅");

  } catch (error) {
    alert("Delete failed ❌");
  }
};

  const toggleModules = (projectId) => {
  setOpenModules((prev) => ({
    ...prev,
    [projectId]: !prev[projectId],
  }));
};

const toggleTasks = (projectId) => {
  setOpenTasks((prev) => ({
    ...prev,
    [projectId]: !prev[projectId],
  }));
};

const toggleTaskDetails = (taskId) => {
  setOpenTaskDetails((prev) => ({
    ...prev,
    [taskId]: !prev[taskId],
  }));
};

const toggleSprintDetails = (sprintId) => {
  setOpenSprintDetails((prev) => ({
    ...prev,
    [sprintId]: !prev[sprintId],
  }));
};
const handleToggleSprintTasks = (sprintId) => {
  setShowSprintTasks(prev => ({
    ...prev,
    [sprintId]: !prev[sprintId]
  }));
};

const toggleBugDetails = (bugId) => {
  setOpenBugDetails((prev) => ({
    ...prev,
    [bugId]: !prev[bugId],
  }));
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminDashboard();
        setStats(data.stats);
        setBugs(data.bugs);

        const projData = await getProjects();
        setProjects(projData.data);

        setCounts(prev => ({
          ...prev,
          projects: projData.data.length
        }));

const taskData = await getTasks();

const sprintData = await getSprints();
setSprints(sprintData.data);

const userRes = await API.get("/user/users");
setUsers(userRes.data.data);

let taskTemp = {};

for (let task of taskData.data) {
  const projId = (task.projectId?._id || task.projectId || task.project?._id || task.project)?.toString();

  if (!projId) continue;

  if (!taskTemp[projId]) {
    taskTemp[projId] = [];
  }

  taskTemp[projId].push(task);
}

setTasksMap(taskTemp);

        let temp = {};

        for (let proj of projData.data) {
          const res = await getModulesByProject(proj._id);
          temp[proj._id] = res.data;
        }

        setModulesMap(temp);

      } catch (error) {
        console.log("Dashboard error:", error);
      }
    };

    
    fetchData();
  }, []);

  return (
    <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
      
      <h1>🚀 Fixify Admin Dashboard</h1>

      {/* BUTTONS */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/create-project")}>➕ Project</button>
        <button onClick={() => navigate("/create-module")}>➕ Module</button>
        <button onClick={() => navigate("/create-task")}>➕ Task</button>
        <button onClick={() => navigate("/sprint")}>➕ Sprint</button>
        <button onClick={() => navigate("/create-user")}>➕ User</button>
        <button onClick={() => navigate("/create-bug")}>➕ Bug</button>
      </div>

      {/* STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>

<div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>
  <h2>👤 Users</h2>

  <p>Total: {users.length}</p>
  <p>Developers: {users.filter(u => u.role === "developer").length}</p>
  <p>Testers: {users.filter(u => u.role === "tester").length}</p>
  <p>Managers: {users.filter(u => u.role === "project_manager").length}</p>
</div>

        <div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>
  <h2>🚀 Sprints</h2>

  <p>Total: {sprintStats.total}</p>
  <p>Planned: {sprintStats.planned}</p>
  <p>Active: {sprintStats.active}</p>
  <p>Completed: {sprintStats.completed}</p>
</div>

                <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <h2>📦 Modules</h2>

          <p>Total Modules: {
            Object.values(modulesMap).reduce((acc, curr) => acc + curr.length, 0)
          }</p>
        </div>
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>

          
          <h2>🐞 Bugs</h2>

<p>Total: {bugs.length}</p>
<p>Open: {bugs.filter(b => b.status === "OPEN").length}</p>
<p>Closed: {bugs.filter(b => b.status === "closed").length}</p>
<p>Critical: {bugs.filter(b => b.severity === "critical").length}</p>
        </div>

        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <h2>📁 Projects</h2>
          <p>Total Projects: {projects.length}</p>
        </div>
        <div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>
  <h2>📋 Tasks</h2>

<p>Total: {allTasks.length}</p>

{Object.entries(statusCount).map(([status, count]) => (
  <p key={status}>
    {status}: {count}
  </p>
))}



</div>
      </div>

      {/* BUGS */}
      <h2 style={{ marginTop: "40px" }}>🐞 Bugs</h2>
     {bugs.map((bug) => (
  <div
    key={bug._id}
    style={{
      background: "#fff",
      padding: "15px",
      marginTop: "10px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}
  >
    {/* HEADER */}
    <div
      style={{ cursor: "pointer" }}
      onClick={() => toggleBugDetails(bug._id)}
    >
      <h4>
        • {bug.bugTitle} {openBugDetails[bug._id] ? "▲" : "▼"}
      </h4>
    </div>

    {/* DETAILS */}
    {openBugDetails[bug._id] && (
      <div style={{
        marginTop: "10px",
        padding: "10px",
        background: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <p><strong>Description:</strong> {bug.description}</p>
        <p><strong>Status:</strong> {bug.status}</p>
        <p><strong>Severity:</strong> {bug.severity}</p>
        <p><strong>Reported By:</strong> {bug.reportBy}</p>

        {/* 🖼️ IMAGE */}
        {bug.bugImage && (
          <img
            src={bug.bugImage}
            alt="bug"
            style={{
              width: "200px",
              marginTop: "10px",
              borderRadius: "8px"
            }}
          />
        )}

        {/* ACTIONS */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={() => navigate(`/edit-bug/${bug._id}`)}>
            ✏️ Edit
          </button>

          <button
            onClick={async () => {
              const confirmDelete = window.confirm("Delete bug?");
              if (!confirmDelete) return;

              await API.delete(`/bug/${bug._id}`);
              setBugs(bugs.filter(b => b._id !== bug._id));
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    )}
  </div>
))}
      <h2 style={{ marginTop: "40px" }}>🚀 Sprints</h2>

{sprints.length === 0 ? (
  <p>No sprints found</p>
) : (
  sprints.map((sprint) => (
    <div
      key={sprint._id}
      style={{
        background: "#fff",
        padding: "15px",
        marginTop: "10px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <h3>{sprint.sprintName}</h3>

      <p>📁 Project: {sprint.projectId?.projectName || "N/A"}</p>

      <p>📅 Start: {new Date(sprint.startDate).toLocaleDateString()}</p>
      <p>📅 End: {new Date(sprint.endDate).toLocaleDateString()}</p>

      <p>📌 Status: <strong>{sprint.status}</strong></p>

      <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
  <p>📋 Tasks: {sprint.tasks?.length || 0}</p>

  <button onClick={() => handleToggleSprintTasks(sprint._id)}>
    {showSprintTasks[sprint._id] ? "Hide" : "View Tasks"}
  </button>
</div>
{showSprintTasks[sprint._id] && (
  <div style={{
    marginTop: "10px",
    padding: "10px",
    background: "#f9f9f9",
    borderRadius: "5px"
  }}>
    {sprint.tasks && sprint.tasks.length > 0 ? (
      sprint.tasks.map((task) => (
        <div key={task._id}>
          • {task.taskTitle}
        </div>
      ))
    ) : (
      <p>No tasks in this sprint</p>
    )}
  </div>
)}

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button onClick={() => navigate(`/edit-sprint/${sprint._id}`)}>
          ✏️ Edit
        </button>

        <button
          onClick={async () => {
            const confirmDelete = window.confirm("Delete sprint?");
            if (!confirmDelete) return;

            await deleteSprint(sprint._id);

            setSprints(sprints.filter(s => s._id !== sprint._id));
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  ))
)}

<h2 style={{ marginTop: "40px" }}>👤 Users</h2>

{users.length === 0 ? (
  <p>No users found</p>
) : (
  users.map((user) => (
    <div
      key={user._id}
      style={{
        background: "#fff",
        padding: "15px",
        marginTop: "10px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <strong>{user.name}</strong> ({user.role})

      <p>Email: {user.email}</p>
      <p>Status: {user.status}</p>
      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

      <div style={{ display: "flex", gap: "10px" }}>

        {/* EDIT */}
        <button onClick={() => navigate(`/edit-user/${user._id}`)}>
          ✏️ Edit
        </button>

        {/* BLOCK */}
        <button
          onClick={async () => {
            await API.put(`/user/users/toggle/${user._id}`);
            const res = await API.get("/user/users");
            setUsers(res.data.data);
          }}
        >
          {user.status === "blocked" ? "Unblock" : "Block"}
        </button>

        {/* DELETE */}
        <button
          onClick={async () => {
            const confirmDelete = window.confirm("Delete user?");
            if (!confirmDelete) return;

            await API.delete(`/user/users/${user._id}`);
            setUsers(users.filter(u => u._id !== user._id));
          }}
        >
          🗑️ Delete
        </button>

      </div>
    </div>
  ))
)}
      {/* PROJECTS */}
      <h2 style={{ marginTop: "40px" }}>📁 Projects</h2>

      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        projects.map((proj) => (
          <div
            key={proj._id}
            style={{
              background: "#fff",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <h3>{proj.projectName}</h3>

            <p>{proj.description}</p>

            <p>👤 {proj.createdBy?.name || "N/A"}</p>

            <p>📅 {new Date(proj.createdAt).toLocaleDateString()}</p>

            <p>📌 Status: {proj.status}</p>

            {/* 🔥 MODULE FIXED */}
            <h4 
              style={{ cursor: "pointer" }}
              onClick={() => toggleModules(proj._id)}
            >
              📦 Modules ({modulesMap[proj._id]?.length || 0})
              {openModules[proj._id] ? "▲" : "▼"}
            </h4>

            {/* 👇 SHOW ONLY WHEN CLICKED */}
            {openModules[proj._id] && (
              !modulesMap[proj._id] || modulesMap[proj._id].length === 0 ? (
                <p>No modules</p>
              ) : (
                            modulesMap[proj._id].map((mod) => (
                <div 
                  key={mod._id} 
                  style={{ 
                    marginLeft: "10px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px" 
                  }}
                >
                  <span>• {mod.moduleName}</span>

                  <button onClick={() => navigate(`/edit-module/${mod._id}`)}>
                    ✏️
                  </button>

                  <button onClick={() => handleDeleteModule(mod._id)}>
                    🗑️
                  </button>
                </div>
              ))
              )
            )}

            <h4 
  style={{ cursor: "pointer" }}
  onClick={() => toggleTasks(proj._id)}
>
  📋 Tasks ({tasksMap[proj._id]?.length || 0})
  {openTasks[proj._id] ? "▲" : "▼"}


</h4>

{/* 👇 SHOW TASKS */}
{openTasks[proj._id] && (
  !tasksMap[proj._id] || tasksMap[proj._id].length === 0 ? (
    <p>No tasks</p>
  ) : (
    tasksMap[proj._id].map((task) => (
      <div 
        key={task._id} 
        style={{ 
          marginLeft: "10px", 
          display: "flex", 
          flexDirection: "column",
          gap: "10px" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span 
            style={{ cursor: "pointer" }}
            onClick={() => toggleTaskDetails(task._id)}
          >
            • {task.taskTitle} {openTaskDetails[task._id] ? "▲" : "▼"}
          </span>

          <select
      value={taskSprintMap[task._id] || ""}
      onChange={(e) =>
        setTaskSprintMap({
          ...taskSprintMap,
          [task._id]: e.target.value
        })
      }
    >

  <option value="">Select Sprint</option>
  {sprints.map((s) => (
    <option key={s._id} value={s._id}>
      {s.sprintName}
    </option>
  ))}
</select>

<button
  onClick={async () => {
   const sprintId = taskSprintMap[task._id];

if (!sprintId) {
  alert("Select sprint first");
  return;
}

    await assignTaskToSprint({
      sprintId: sprintId,
      taskId: task._id
    });

    alert("Task added to sprint ✅");
    const sprintData = await getSprints();
setSprints(sprintData.data);
  }}
>
  ➕ Sprint
</button>

          <button onClick={() => navigate(`/edit-task/${task._id}`)}>
            ✏️
          </button>

          <button onClick={() => handleDeleteTask(task._id)}>
            🗑️
          </button>
        </div>

        {openTaskDetails[task._id] && (
          <div style={{ marginLeft: "20px", padding: "10px", background: "#f9f9f9", borderRadius: "5px" }}>
            <p><strong>Description:</strong> {task.description || "N/A"}</p>
            <p><strong>Status:</strong> {task.status || "N/A"}</p>
            <p><strong>Priority:</strong> {task.priority || "N/A"}</p>
            <p><strong>Assigned To:</strong> {task.assignedTo?.name || "N/A"}</p>
            <p><strong>Created At:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</p>
            {/* If there are subtasks, you can add them here */}
          </div>
        )}
      </div>
    ))
  )
)}
            <p>🚀 Progress: {proj.progress}%</p>

            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button onClick={() => navigate(`/edit-project/${proj._id}`)}>
                ✏️ Edit
              </button>

              <button onClick={() => handleDelete(proj._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;