import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Task Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
          {user ? `${user.username} (${user.role})` : ""}
        </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}