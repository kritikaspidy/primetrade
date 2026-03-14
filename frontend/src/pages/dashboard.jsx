import { useEffect, useState } from "react";
import API from "../utils/api";
import Navbar from "../components/navbar";
import TaskForm from "../components/taskform";
import TaskList from "../components/tasklist";
import MessageBox from "../components/messagebox";
import UserManagement from "../components/usermanagement";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);

  const showMessage = (type, text) => {
    setMessageType(type);
    setMessage(text);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const fetchTasks = async (currentUser) => {
    try {
      setLoading(true);

      const endpoint =
        currentUser?.role === "admin" ? "/admin/tasks" : "/tasks";

      const res = await API.get(endpoint);

      setTasks(res.data.tasks || []);
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.error || "Failed to fetch tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await API.get("/auth/profile");
        const currentUser = res.data.user || res.data;

        setUser(currentUser);

        fetchTasks(currentUser);
      } catch (error) {
        showMessage(
          "error",
          error.response?.data?.error || "Failed to load dashboard"
        );
      }
    };

    loadDashboard();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    const payload = {
      ...formData,
      due_date: formData.due_date === "" ? null : formData.due_date,
    };

    try {
      if (editingTask) {
        await API.patch(`/tasks/${editingTask.id}`, payload);
        showMessage("success", "Task updated successfully");
      } else {
        await API.post("/tasks", payload);
        showMessage("success", "Task created successfully");
      }

      setEditingTask(null);
      fetchTasks(user);
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      showMessage("success", "Task deleted successfully");
      fetchTasks(user);
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="page-shell">
      <MessageBox type={messageType} message={message} onClose={clearMessage} />

      <Navbar user={user} />

      <main className="dashboard-wrapper">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Task Dashboard</h1>
            <p className="dashboard-subtext">
              Manage your tasks, track priorities, and keep things under control.
            </p>
          </div>

          <div className="dashboard-actions">
            {user?.role === "admin" && (
              <button
                className="admin-btn"
                onClick={() => setShowUserModal(true)}
              >
                Manage Users
              </button>
            )}

            {user && (
              <div className="profile-chip">
                <span className="profile-chip-label">Logged in as</span>
                <span className="profile-chip-name">
                  {user.username} ({user.role})
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="dashboard-grid">
          <aside className="left-panel">
            <TaskForm
              onSubmit={handleCreateOrUpdate}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
            />
          </aside>

          <section className="tasks-panel">
            <div className="panel-header">
              <div className="task-header-left">
                <h3>Your Tasks</h3>
                <span className="task-count">{tasks.length} total</span>
              </div>

              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="empty-state">Loading tasks...</div>
            ) : (
              <TaskList
                tasks={tasks.filter(
                  (task) =>
                    task.title
                      ?.toLowerCase()
                      .includes(taskSearch.toLowerCase()) ||
                    task.description
                      ?.toLowerCase()
                      .includes(taskSearch.toLowerCase())
                )}
                user={user}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onTaskAssigned={() => {
                  fetchTasks(user);
                  showMessage("success", "Task assigned successfully");
                }}
                onMessage={showMessage}
              />
            )}
          </section>
        </div>
      </main>

      {showUserModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>User Management</h2>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ✕
              </button>
            </div>

            <UserManagement onMessage={showMessage} />
          </div>
        </div>
      )}
    </div>
  );
}