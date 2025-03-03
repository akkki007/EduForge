import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import NotFound from "./NotFound";
import SignUp from "./signUp";
import Login from "./Login";
import TeaDashboard from "./TeaDashboard";
import AdminDashboard from "./AdminDashboard";
import StuDashboard from "./StuDashboard"
import AdminLogin from "./AdminLogin";
import MarksModule from "./MarksModule"
import AttendanceModule from "./AttendanceModule"
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacherDashboard" element={<TeaDashboard />} />
        <Route path="/studentDashboard" element={<StuDashboard/>} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/attendance" element={<AttendanceModule/>}/>
        <Route path="*" element={<NotFound />} />
      <Route path="/marks" element={<MarksModule/>}/>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
