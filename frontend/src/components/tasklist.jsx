import { useEffect, useState } from "react";
import API from "../utils/api";

export default function TaskList({
  tasks,
  user,
  onEdit,
  onDelete,
  onTaskAssigned,
  onMessage,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [assigningTaskId, setAssigningTaskId] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      onMessage?.(
        "error",
        error.response?.data?.error || "Failed to fetch users"
      );
    }
  };

  const handleSelectChange = (taskId, userId) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [taskId]: userId,
    }));
  };

  const handleAssign = async (taskId) => {
    const assigned_to = selectedUsers[taskId];

    if (!assigned_to) {
      onMessage?.("error", "Please select a user to assign");
      return;
    }

    try {
      setAssigningTaskId(taskId);

      await API.patch(`/admin/tasks/${taskId}/assign`, {
        assigned_to: Number(assigned_to),
      });

      onTaskAssigned?.();
    } catch (error) {
      onMessage?.(
        "error",
        error.response?.data?.error || "Failed to assign task"
      );
    } finally {
      setAssigningTaskId(null);
    }
  };

  if (!tasks.length) {
    return <div className="empty-state">No tasks found.</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div className="task-card" key={task.id}>
          <h4>{task.title}</h4>
          <p>{task.description || "No description provided."}</p>

          <p>
            <strong>Created By:</strong>{" "}
            {users.find((u) => u.id === task.created_by)?.username || task.created_by}
            </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={`badge badge-${task.status}`}>{task.status}</span>
          </p>

          <p>
            <strong>Priority:</strong>{" "}
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          </p>

          <p>
            <strong>Due Date:</strong>{" "}
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}
          </p>

          {task.assigned_to && (
            <p>
             <strong>Assigned To:</strong>{" "}
{users.find((u) => u.id === task.assigned_to)?.username || task.assigned_to}
            </p>
          )}

          <div className="task-actions">
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </div>

          {user?.role === "admin" && (
            <div className="assign-section">
              <label className="assign-label">Assign task</label>

              <div className="assign-controls">
                <select
                  value={selectedUsers[task.id] || ""}
                  onChange={(e) => handleSelectChange(task.id, e.target.value)}
                >
                  <option value="">Select user</option>
                  {users.filter((u) => u.role !== "admin").map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.role})
                    </option>
                  ))}
                </select>

                <button
                  className="assign-btn"
                  onClick={() => handleAssign(task.id)}
                  disabled={assigningTaskId === task.id}
                >
                  {assigningTaskId === task.id ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}