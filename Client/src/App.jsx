import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import NotFound from "./NotFound";
import SignUp from "./SignUp";
import Login from "./Login";
import Playground from "./components/playdir/Playground";
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/*<Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
