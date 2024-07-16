import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./home.css"; 
import axiosInstance from "../utils/axiosInstance";
import Swal from 'sweetalert2';

const WinnersHome = () => {
  const [posts, setPosts] = useState([]);
  // const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/winners`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);


  const handleDeleteConfirmation = (post) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleDelete(post);
      }
    });
  };
  
  const handleDelete = async (post) => {
    try {
      await axiosInstance.delete(`/winners/${post.id}`);
  
      setPosts(posts.filter(p => p.id !== post.id));
      await handleFileDelete(post.img);
  
      Swal.fire(
        'Deleted!',
        'Your post has been deleted.',
        'success'
      );
    } catch (err) {
      console.log(err);
      Swal.fire(
        'Error!',
        'There was an error deleting your post.',
        'error'
      );
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

      await axiosInstance.put(`/winners/${post.id}`, { active: updatedPost.active });
      setPosts(posts.map(p => (p.id === post.id ? updatedPost : p)));
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };
  return (
    <div className="WinnersHome">
      <h1 style={{justifyContent: "center", textAlign: "center"}}>Winners gallery</h1>
      <span className="write">
        <Link className="link" to="/add-winners-gallery">
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
              <th> Created At</th>
              <th >Actions</th>
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
                    {post.title}
                  </Link>
                </td>
                <td>
                  <img className="img2" src={post.img} alt="" />
                  
                </td>
               
                <td>
                  <Link className="link" to={`/post/${post.id}`}>
                    {post.created_at.slice(0,10)}
                  </Link>
                </td>
                <td className="actions">
                  {/* <Link className="read-more" to={`/post/${post.id}`}>
                    View
                  </Link> */}
                  <Link className="read-more" to={`/add-winners-gallery?edit=2`} state={post}>
                    Edit
                  </Link>
                  <div className="delete-wrapper">
                  <button className="read-more" style={{ fontSize: "1rem" }} onClick={() => handleDeleteConfirmation(post)}>Delete</button>
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

export default WinnersHome;
