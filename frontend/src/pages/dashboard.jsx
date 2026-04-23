import { useCallback, useEffect, useState } from "react";
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

  const showMessage = useCallback((type, text) => {
    setMessageType(type);
    setMessage(text);
  }, []);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const fetchTasks = useCallback(async (currentUser) => {
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
  }, [showMessage]);

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
  }, [fetchTasks, showMessage]);

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
    <div className="min-h-screen bg-slate-50">
      <MessageBox type={messageType} message={message} onClose={clearMessage} />

      <Navbar user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Task Dashboard</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Manage your tasks, track priorities, and keep things under control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === "admin" && (
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setShowUserModal(true)}
              >
                Manage Users
              </button>
            )}

            {user && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="block text-xs text-slate-500">Logged in as</span>
                <span className="text-sm font-semibold text-slate-800">
                  {user.username} ({user.role})
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside>
            <TaskForm
              key={editingTask?.id || "new-task"}
              onSubmit={handleCreateOrUpdate}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
            />
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Your Tasks</h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {tasks.length} total
                </span>
              </div>

              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:max-w-xs"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                Loading tasks...
              </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                className="text-xl leading-none text-slate-500"
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