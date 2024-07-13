import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import "../style.scss";
import axiosInstance from "../utils/axiosInstance";

const Write = () => {

  const state = useLocation().state;
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_URL;
  

  const [desc, setDesc] = useState(state?.desc || "");
  const [meta_title, setMetaTitle] = useState(state?.meta_title || "");
  const [meta_keywords, setMetaKeywords] = useState(state?.meta_keywords || "");
  const [meta_desc, setMetaDesc] = useState(state?.meta_desc || "");
  const [title, setTitle] = useState(state?.title || "");
  const [blog_by, setBlogBy] = useState(state?.blog_by || "");

  const [blog_date, setBlogDate] = useState(
    state?.blog_date ? moment(state.blog_date).format('YYYY-MM-DD') : ''
  );

  const [blog_image_title, setBlogImageTitle] = useState(
    state?.blog_image_title || ""
  );
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");
  const [errors, setErrors] = useState({});
  const [previewURL, setPreviewURL] = useState(state?.img ? `${baseURL}${state.img}` : null);

  useEffect(() => {
    // console.log(baseURL, "hello")
    if (state?.img) {
      setPreviewURL(state.img);
    }
  }, [state]);

  const handleDragStart = (event, data) => {
    event.dataTransfer.setData('text/plain', data);
  };

  const handleDragOver = event => {
    event.preventDefault();
  };
  
 

  const handleDrop = event => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const imgDataUrl = reader.result;
        const imgTag = `<img src="${imgDataUrl}" alt="Dropped Image" />`;
        setDesc(prevDesc => prevDesc + imgTag);
      };
      reader.readAsDataURL(file);
    }
  };

  var modules = {
    toolbar: [
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] }
      ],
      [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
    ]
  };

  var formats = [
    "header", "height", "bold", "italic",
    "underline", "strike", "blockquote",
    "list", "color", "bullet", "indent",
    "link", "image", "align", "size",
  ];

  const sanitizeFileName = (fileName) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };
  const upload = async () => {
    try {
      const formData = new FormData();
      const sanitizedFileName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedFileName, { type: file.type });
      formData.append("file", renamedFile);
      const res = await axiosInstance.post("/upload", formData);
      return res.data.url;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

   
    const errors = {};
    if (!title.trim()) {
      errors.title = "Please enter a title.";
    }
    if (!desc.trim()) {
      errors.desc = "Please enter a description.";
    }
    if (!blog_date) {
      errors.blog_date = "Please select a date.";
    }
    if (!blog_by) {
      errors.blog_by = "Please enter Blog By.";
    }
    if (!blog_image_title) {
      errors.blog_image_title = "Please enter Blog Image title.";
    }
    if (!cat) {
      errors.cat = "Please select category of blog";
    }
    if (!file && !state?.img) {
      errors.file = "Please select an image.";
    } else if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        errors.file = "Only JPG, JPEG, WEBP and PNG formats are allowed.";
      }
    }
    setErrors(errors);
   
  
    if (Object.keys(errors).length === 0) {
      let imgUrl = state?.img || "";
      if (file) {
        imgUrl = await upload();
      }
      try {
        state
          ? await axiosInstance.put(`${process.env.REACT_APP_API_URL}/posts/${state.id}`, {
            title,
            meta_title,
            meta_keywords,
            meta_desc,
            blog_by,
            blog_date,
            blog_image_title,
            desc,
            cat,
            img: imgUrl,
          })
          : await axiosInstance.post(`${process.env.REACT_APP_API_URL}/posts/`, {
            title,
            meta_title,
            meta_keywords,
            meta_desc,
            blog_by,
            blog_date,
            blog_image_title,
            desc,
            cat,
            img: imgUrl,
            date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
          });
        navigate("/blogs");
      } catch (err) {
        console.log(err);
      }
    }
  };
  
 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = (new Uint8Array(reader.result)).subarray(0, 4);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      let fileType = "";
      switch (header) {
        case "89504e47":
          fileType = "image/png";
          break;
        case "52494646":
          fileType = "image/webp";
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          fileType = "image/jpeg";
          break;
        default:
          fileType = "unknown";
          break;
      }

      const allowedTypes = ["image/png", "image/webp", "image/jpeg"];
      if (!allowedTypes.includes(fileType)) {
        setErrors(prevErrors => ({ ...prevErrors, file: "Only JPG, JPEG, WEBP, and PNG formats are allowed." }));
        setFile(null);
        setPreviewURL(null);
      } else {
        setErrors(prevErrors => ({ ...prevErrors, file: null }));
        setFile(selectedFile);
        const previewReader = new FileReader();
        previewReader.onloadend = () => {
          setPreviewURL(previewReader.result);
        };
        previewReader.readAsDataURL(selectedFile);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="add">
      <div className="content">
        <h4> Meta Tags</h4>
        <input
          type="text"
          name="meta_tags"
          placeholder="Meta Title"
          value={meta_title}
          onChange={(e) => setMetaTitle(e.target.value)}
        />
        <input
          type="text"
          name="meta_keywords"
          placeholder="Meta Keywords"
          value={meta_keywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
        />

        <input
          type="text"
          name="meta_desc"
          placeholder="Meta Description"
          value={meta_desc}
          onChange={(e) => setMetaDesc(e.target.value)}
        />




        <h4> Blog Description</h4>
        <input
          type="text"
          name="blog_name"
          placeholder="Blog Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span className="error">{errors.title}</span>}
        <input
          type="text"
          name="blog_by"
          placeholder="Blog By"
          value={blog_by}
          onChange={(e) => setBlogBy(e.target.value)}
        />
        {errors.blog_by && <span className="error">{errors.blog_by}</span>}
        <input
          type="date"
          name="blog_date"
          placeholder="YYYY-MM-DD"
          value={blog_date}
          onChange={(e) => setBlogDate(e.target.value)}
          required
        />
        {errors.blog_date && <span className="error">{errors.blog_date}</span>}
        <input
          type="text"
          name="blog_image_title"
          placeholder="Blog Image Title"
          value={blog_image_title}
          onChange={(e) => setBlogImageTitle(e.target.value)}
        />
        {errors.blog_image_title && <span className="error">{errors.blog_image_title}</span>}
        <div>
          <div onDrop={handleDrop} onDragOver={handleDragOver} >
            <ReactQuill
              // ref={quillRef}

              placeholder="Start writing..."
              modules={modules}
              formats={formats}
              value={desc}
              onChange={setDesc}
              onDragStart={e => handleDragStart(e, 'Your dragged content')}
              draggable
            />

          </div>
        </div>

        {errors.desc && <span className="error">{errors.desc}</span>}
      </div>
      <div className="menu" >
        <div className="item" >
          <h1>Blog Category</h1>
          <div className="cat">
            <input
              type="radio"
           
              name="cat"
              value="news"
              id="blogs1"
              onChange={(e) => setCat(e.target.value)}
              checked={cat === "news"}
            />
            <label for="blogs1"  htmlFor="blogs">News</label>
          </div>
          <div className="cat">
            <input
              type="radio"
             
              name="cat"
              value="events"
              id="blogs2"
              onChange={(e) => setCat(e.target.value)}
              checked={cat === "events"}
            />
            <label for="blogs2" htmlFor="blogs">Events</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              
              name="cat"
              value="article"
              id="blogs3"
              onChange={(e) => setCat(e.target.value)}
              checked={cat === "article"}
            />
            <label for="blogs3" htmlFor="blogs">Article</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              name="cat"
              value="features"
              id="blogs4"
              onChange={(e) => setCat(e.target.value)}
              checked={cat === "features"}
            />
            <label for="blogs4" htmlFor="blogs">Features</label>
          </div>
        </div>
        {errors.cat && <span className="error">{errors.cat}</span>}
        <div className="item" >
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name=""
            onChange={handleFileChange}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          {previewURL && <img src={previewURL} alt="Preview" style={{ height: "50px", width: "50px" }} />}
          {errors.file && <span className="error">{errors.file}</span>}
          <div className="buttons">
            <button>Save as a draft</button>
            <button className = "sub" onClick={handleClick}>Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;
