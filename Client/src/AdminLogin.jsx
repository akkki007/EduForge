import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [adminLogin, setAdminLogin] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdminChange = (e) => {
    setAdminLogin({ ...adminLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = adminLogin;

    // Validate inputs
    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(adminLogin),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        navigate("/admin"); // Correctly navigate to the admin dashboard
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 mt-20 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 poppins-bold tracking-tight text-gray-900">
            Admin Login
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 poppins-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={adminLogin.email}
                  onChange={handleAdminChange}
                  className="block w-full rounded-md poppins-regular bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm/6 poppins-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminLogin.password}
                  onChange={handleAdminChange}
                  className="block w-full rounded-md poppins-regular bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                }`}
              >
                {loading ? "Logging in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center poppins-regular text-sm/6 text-gray-500">
            Not an admin?{" "}
            <a href="/login" className="text-green-600 hover:underline">
              Log in as a teacher or student
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
