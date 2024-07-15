import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./home.css";
import axiosInstance from "../utils/axiosInstance";

const StarHome = () => {
  const [posts, setPosts] = useState([]);
  const [postToDelete, setPostToDelete] = useState(null); 
  const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/star`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent.slice(0, 30) +  "...";
  };


  const handleDeleteConfirmation = (post) => {
    setPostToDelete(post);
  };


  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/star/${postToDelete.id}`);
    
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      await handleFileDelete(postToDelete.speaker_img);
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

      await axiosInstance.put(`/star/${post.id}`, { active: updatedPost.active });
      setPosts(posts.map(p => (p.id === post.id ? updatedPost : p)));
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };
  return (
    <div className="StarHome">
      <h1 style={{justifyContent: "center", textAlign: "center"}}>Star Speaks</h1>
      <span className="write">
        <Link className="link" to="/add-star-speakers">
          <button className="button">Add Post</button>
        </Link>
      </span>

      <div className="posts">
        <table>
          <thead>
            <tr>
              <th> ID </th>
              <th>Title</th>
              <th>Image</th>
              <th>Description</th>
              <th> Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={index}>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {index+1}
                  </Link>
                </td>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {post.speaker_name}
                  </Link>
                </td>
                <td>
                  <img className="img2" src={post.speaker_img} alt=""  />
                  
                </td>
                <td>{getText(post.description)}</td>
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {post.created_at.slice(0, 10)}
                  </Link>
                </td>
                <td className="actions">
                  {/* <Link className="read-more" to={`/post/${post.id}`}>
                    View
                  </Link> */}
                  <Link className="read-more" to={`/add-star-speakers?edit=2`} state={post}>
                    Edit
                  </Link>
                  <div className="delete-wrapper">
                  <button className="read-more" style={{ fontSize: "1rem" }} onClick={() => handleDeleteConfirmation(post)}>Delete</button>
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

export default StarHome;
