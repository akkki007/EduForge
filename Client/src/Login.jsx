import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Header from "./components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createStore } from "redux";
export default function Login() {
  const navigate = useNavigate(); // ✅ Use useNavigate for redirection
  const [isTeacher, setIsTeacher] = useState(true);
  const [loading, setLoading] = useState(false);
  const [teacherLogin, setTeacherLogin] = useState({ email: "", password: "" });
  const [studentLogin, setStudentLogin] = useState({ email: "", password: "" });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
          return value;
        }
    }
    return null;
  }

  useEffect(() => {
    const token = getCookie('jwt')
    if (token) {
      navigate(isTeacher ? "/teacherDashboard" : "/studentDashboard");
    }
  }, [isTeacher, navigate]);
  
  

  const handleTeacherChange = (e) => {
    setTeacherLogin({ ...teacherLogin, [e.target.name]: e.target.value });
  };

  const handleStudentChange = (e) => {
    setStudentLogin({ ...studentLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = isTeacher ? teacherLogin : studentLogin;

    // Validate inputs
    if (!loginData.email || !loginData.password) {
      toast.error("All fields are required");
      return;
    }
    if (!validateEmail(loginData.email)) {
      toast.error("Invalid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        isTeacher ? "http://localhost:4000/teacherLogin" : "http://localhost:4000/studentLogin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate(isTeacher ? "/teacherDashboard" : "/studentDashboard"); // ✅ Use navigate
        }, 1000); // Add delay for better UX
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
            {isTeacher ? "Teacher Login" : "Student Login"}
          </h2>
          <button
            onClick={() => setIsTeacher(!isTeacher)}
            className="mt-4 text-sm text-green-600 underline"
          >
            {isTeacher ? "Switch to Student Login" : "Switch to Teacher Login"}
          </button>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 poppins-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={isTeacher ? teacherLogin.email : studentLogin.email}
                  onChange={isTeacher ? handleTeacherChange : handleStudentChange}
                  className="block w-full rounded-md poppins-regular bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm/6 poppins-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={isTeacher ? teacherLogin.password : studentLogin.password}
                  onChange={isTeacher ? handleTeacherChange : handleStudentChange}
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
            Not a member?{" "}
            <a href="/signup" className="poppins-semibold text-green-600 hover:text-green-500">
              Register Here
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
