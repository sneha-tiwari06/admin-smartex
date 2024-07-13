import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Write from "./pages/add-blogs";
import Home from "./pages/blogs";
// import Dashboard from "./components/Dashboard";
import Single from "./pages/Single";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./style.scss"
import StarSpeaks from "./pages/star-speakers";
import StarHome from "./pages/add-star-speakers";
import Winners from "./pages/winners-gallery";
import WinnersHome from "./pages/add-winners-gallery";
import Ceremony from "./pages/ceremony";
import CeremonyHome from "./pages/add-ceremony";                  
import Events from "./pages/events";
import EventHome from "./pages/add-events";
import Upcoming from "./pages/upcoming-events";
import UpcomingHome from "./pages/add-upcoming-events";
import Partners from "./pages/our-partners";
import PartnersHome from "./pages/add-partners";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <div className="container">
          <Routes>
            <Route path="/" element={<Layout><Login /></Layout>} />
            <Route path="/post/:id" element={<Layout><Single /></Layout>} />
            <Route path="/blogs" element={<Layout><Home /></Layout>} />
            <Route path="/add-blogs" element={<Layout><Write /></Layout>} />
            <Route path="/add-star-speakers" element={<Layout><StarHome /></Layout>} />
            <Route path="/star-speakers" element={<Layout><StarSpeaks /></Layout>} />
            <Route path="/add-winners-gallery" element={<Layout><WinnersHome /></Layout>} />
            <Route path="/winners-gallery" element={<Layout><Winners /></Layout>} />
            <Route path="/add-ceremony" element={<Layout><CeremonyHome /></Layout>} />
            <Route path="/ceremony" element={<Layout><Ceremony /></Layout>} />
            <Route path="/add-events" element={<Layout><EventHome /></Layout>} />
            <Route path="/events" element={<Layout><Events /></Layout>} />
            <Route path="/add-upcoming-events" element={<Layout><UpcomingHome /></Layout>} />
            <Route path="/upcoming-events" element={<Layout><Upcoming /></Layout>} />
            <Route path="/our-partners" element={<Layout><Partners /></Layout>} />
            <Route path="/add-partners" element={<Layout><PartnersHome /></Layout>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
