import { useCallback, useEffect, useState } from "react";
import API from "../utils/api";

export default function UserManagement({ onMessage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
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
  }, [onMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>

        <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        </div>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-y-auto">
        {users.filter((user) =>
            user.username.toLowerCase().includes(search.toLowerCase())
            ).map((user) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={user.id}
            >
              <div className="space-y-1 text-sm text-slate-700">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>

              <button
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
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