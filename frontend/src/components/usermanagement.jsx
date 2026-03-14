import { useEffect, useState } from "react";
import API from "../utils/api";

export default function UserManagement({ onMessage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data.users || res.data || []);
    } catch (error) {
      onMessage(
        "error",
        error.response?.data?.error || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);
      onMessage("success", "User deleted successfully");
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      onMessage(
        "error",
        error.response?.data?.error || "Failed to delete user"
      );
    }
  };

  return (
    <div className="user-management">
      <div className="user-header">
        <h3>User Management</h3>

        <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        </div>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="user-list">
        {users.filter((user) =>
            user.username.toLowerCase().includes(search.toLowerCase())
            ).map((user) => (
            <div className="user-card" key={user.id}>
              <div className="user-info">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>

              <button
                className="delete-user-btn"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}