import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";



const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogoutBroadcast = () => {
      localStorage.setItem('isLoggedOut', 'true');
      navigate("/login");
    };

    const broadcastChannel = new BroadcastChannel("logoutChannel");
    broadcastChannel.addEventListener("message", handleLogoutBroadcast);

    return () => {
      broadcastChannel.close();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    localStorage.setItem('isLoggedOut', 'true');
    const broadcastChannel = new BroadcastChannel("logoutChannel");
    broadcastChannel.postMessage("logout");
    navigate("/login");
  };
  
  return (
    <div className="w-100 navbar">
      <div className="container">
        <div className="logo">
          <Link to="/login">
            <img src="https://ecis.in/admin-smartex/logo.png" alt="logo" />
          </Link>
        </div>
        <div className="links">
          <Link className="link" to="/blogs">
            <h6>Blogs</h6>
          </Link>
          <Link className="link" to="/winners-gallery">
            <h6>Winners Gallery</h6>
          </Link>
          <Link className="link" to="/star-speakers">
            <h6>Star Speaks</h6>
          </Link>
          <Link className="link" to="/ceremony">
            <h6>Ceremony</h6>
          </Link>
          <Link className="link" to="/events">
            <h6>Events</h6>
          </Link>
          <Link className="link" to="/upcoming-events">
            <h6>Upcoming Events</h6>
          </Link>
          <Link className="link" to="/add-partners">
            <h6>Partners</h6>
          </Link>
          {/* <Link className="link" to="/draft">
            <h6>Drafts</h6>
          </Link> */}

          <span>{currentUser?.username}</span>
          {currentUser ? (
            <span onClick={handleLogout}>Logout</span>
          ) : (
            <Link className="link" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
