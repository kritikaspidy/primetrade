import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  due_date: "",
};

export default function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "pending",
        priority: editingTask.priority || "medium",
        due_date: editingTask.due_date ? editingTask.due_date.split("T")[0] : "",
      });
    } else {
      setFormData(initialState);
    }
  }, [editingTask]);

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
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{editingTask ? "Edit Task" : "Create Task"}</h3>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select name="priority" value={formData.priority} onChange={handleChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
      />

      <div className="task-form-buttons">
        <button type="submit">{editingTask ? "Update Task" : "Create Task"}</button>
        {editingTask && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}