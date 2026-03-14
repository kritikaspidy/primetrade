import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h2>Task Dashboard</h2>
      <div>
        <span className="user-info">
          {user ? `${user.username} (${user.role})` : ""}
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}