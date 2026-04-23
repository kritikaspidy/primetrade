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
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <MessageBox type={messageType} message={message} onClose={clearMessage} />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_420px]">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Task Manager
          </p>
          <h1 className="mb-3 text-4xl font-bold leading-tight text-slate-900">
            Stay organized without the mess
          </h1>
          <p className="max-w-xl text-slate-600">
            A simple task management dashboard with authentication, protected access,
            CRUD operations, and admin controls.
          </p>
        </div>

        <form
          className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
          onSubmit={handleAuth}
        >
          <h2 className="text-2xl font-semibold text-slate-900">
            {isLogin ? "Login" : "Create account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? "Access your dashboard securely"
              : "Register to start managing tasks"}
          </p>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          <p className="mt-4 text-sm text-slate-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="cursor-pointer font-semibold text-blue-600"
            >
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}