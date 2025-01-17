import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from './components/Home';
// import About from './components/About';
// import Contact from './components/Contact';
import Home from "./Home";
import NotFound from "./NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/*<Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
