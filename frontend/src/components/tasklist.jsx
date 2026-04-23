import { useCallback, useEffect, useState } from "react";
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

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      onMessage?.(
        "error",
        error.response?.data?.error || "Failed to fetch users"
      );
    }
  }, [onMessage]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user, fetchUsers]);

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
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto pr-1">
      {tasks.map((task) => (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={task.id}>
          <h4 className="mb-2 text-base font-semibold">{task.title}</h4>
          <p className="mb-2 text-sm text-slate-700">
            {task.description || "No description provided."}
          </p>

          <p className="text-sm text-slate-700">
            <strong>Created By:</strong>{" "}
            {users.find((u) => u.id === task.createdBy)?.username || task.createdBy}
          </p>

          <p className="text-sm text-slate-700">
            <strong>Status:</strong>{" "}
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {task.status}
            </span>
          </p>

          <p className="text-sm text-slate-700">
            <strong>Priority:</strong>{" "}
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              {task.priority}
            </span>
          </p>

          <p className="text-sm text-slate-700">
            <strong>Due Date:</strong>{" "}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
          </p>

          {task.assignedTo && (
            <p className="text-sm text-slate-700">
              <strong>Assigned To:</strong>{" "}
              {users.find((u) => u.id === task.assignedTo)?.username || task.assignedTo}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Delete
            </button>
          </div>

          {user?.role === "admin" && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assign task
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedUsers[task.id] || ""}
                  onChange={(e) => handleSelectChange(task.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select user</option>
                  {users.filter((u) => u.role !== "admin").map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.role})
                    </option>
                  ))}
                </select>

                <button
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
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