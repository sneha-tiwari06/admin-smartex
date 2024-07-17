import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./home.css"; 
import axiosInstance from "../utils/axiosInstance";

const PartnersHome = () => {
  const [posts, setPosts] = useState([]);
  const [postToDelete, setPostToDelete] = useState(null);
  const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/partners`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

 

  const handleDeleteConfirmation = (post) => {
    setPostToDelete(post);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/partners/${postToDelete.id}`);
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
      await axiosInstance.put(`/partners/${post.id}`, { active: updatedPost.active });
      setPosts(posts.map(p => (p.id === post.id ? updatedPost : p)));
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  return (
    <div className="UpcomingHome">
      <h1 style={{ justifyContent: "center", textAlign: "center" }}>Partners</h1>
      <span className="write">
        <Link className="link" to="/add-partners">
          <button className="button">Add Partners</button>
        </Link>
      </span>

      <div className="posts">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Actions</th>
             
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
                  <img className="img2" src={post.image_url} alt="" />
                </td>
                <td className="actions">
                  {/* <Link className="read-more" to={`/post/${post.id}`}>
                    View
                  </Link> */}
                  <Link className="read-more" to={`/add-partners?edit=2`} state={post}>
                    Edit
                  </Link>
                  <div className="delete-wrapper">
                    <button className="read-more del" style={{ fontSize: "1rem" }} onClick={() => handleDeleteConfirmation(post)}>Delete</button>
                    {postToDelete && postToDelete.id === post.id && (
                      <div className="confirmation-popup">
                        <p>Are you sure you want to delete this post?</p>
                        <div>
                          <button onClick={handleDelete}>Yes</button>
                          <button onClick={() => setPostToDelete(null)}>No</button>
                        </div>
                      </div>
                    )}
                  </div>
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

export default PartnersHome;
