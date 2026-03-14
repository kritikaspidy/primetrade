import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import MessageBox from "../components/messagebox";

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const res = await API.post(endpoint, formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessageType("success");
      setMessage(isLogin ? "Login successful" : "Registration successful");

      navigate("/dashboard");
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <MessageBox type={messageType} message={message} onClose={clearMessage} />

      <div className="auth-layout">
        <div className="auth-left">
          <p className="eyebrow">Task Manager</p>
          <h1>Stay organized without the mess</h1>
          <p className="auth-description">
            A simple task management dashboard with authentication, protected access,
            CRUD operations, and admin controls.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleAuth}>
          <h2>{isLogin ? "Login" : "Create account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Access your dashboard securely"
              : "Register to start managing tasks"}
          </p>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          <p className="switch-auth">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}