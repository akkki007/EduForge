import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import NotFound from "./NotFound";
import SignUp from "./signUp";
import Login from "./Login";
import Playground from "./components/playdir/Playground";
import TeaDashboard from "./TeaDashboard";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/*<Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/teaDashboard" element={<TeaDashboard />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
