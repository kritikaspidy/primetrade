import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  due_date: "",
};

export default function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [formData, setFormData] = useState(() =>
    editingTask
      ? {
          title: editingTask.title || "",
          description: editingTask.description || "",
          status: editingTask.status || "pending",
          priority: editingTask.priority || "medium",
          due_date: editingTask.dueDate ? editingTask.dueDate.split("T")[0] : "",
        }
      : initialState
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingTask) {
      setFormData(initialState);
    }
  };

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h3 className="mb-4 text-lg font-semibold">
        {editingTask ? "Edit Task" : "Create Task"}
      </h3>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="mb-3 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
        className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {editingTask ? "Update Task" : "Create Task"}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}