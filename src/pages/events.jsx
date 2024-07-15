import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import axiosInstance from "../utils/axiosInstance";

const EventHome = () => {
  const [posts, setPosts] = useState([]);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/event`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const handleDeleteConfirmation = (post) => {
    setPostToDelete(post);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/event/${postToDelete.id}`);
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      await handleFileDelete(postToDelete.image_url);
      setPostToDelete(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFileDelete = async (fileUrl) => {
    try {
      await axiosInstance.delete('/delete',{
        data: { url: fileUrl } 
      });
    } catch (error) {
      console.error('Error deleting file', error);
    }
  };

  const handleToggleStatus = async (post) => {
    try {
      const updatedPost = { ...post, active: !post.active };
      await axiosInstance.put(`/event/${post.id}`, { active: updatedPost.active });
      setPosts(posts.map(p => (p.id === post.id ? updatedPost : p)));
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  return (
    <div className="EventHome">
      <h1 style={{ textAlign: "center" }}>Events</h1>
      <span className="write">
        <Link className="link" to="/add-events">
          <button className="button">Add Event</button>
        </Link>
      </span>

      <div className="posts">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Image</th>
              <th>Created At</th>
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={index}>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {index + 1}
                  </Link>
                </td>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {post.event_name}
                  </Link>
                </td>
                <td>
                  <img className="img2" src={post.image_url} alt="" />
                </td>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {post.created_at.slice(0, 10)}
                  </Link>
                </td>
                <td className="link">
                  <Link className="read-more" to={`/add-events?edit=2`} state={post}>
                    Edit
                  </Link>
                  <button
                    className="read-more"
                    style={{ fontSize: "1rem" , marginLeft: "1rem"}}
                    onClick={() => handleDeleteConfirmation(post)}
                  >
                    Delete
                  </button>
                  {postToDelete && postToDelete.id === post.id && (
                    <div className="confirmation-popup">
                      <p>Are you sure you want to delete this post?</p>
                      <div>
                        <button onClick={handleDelete}>Yes</button>
                        <button onClick={() => setPostToDelete(null)}>No</button>
                      </div>
                    </div>
                  )}
                </td>
                <td>
                <button
                    className="read-more"
                    style={{
                      fontSize: "1rem",
                      backgroundColor: post.active ? "green" : "red",
                      color: "white",  
                    }}
                    onClick={() => handleToggleStatus(post)}
                  >
                    {post.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventHome;
