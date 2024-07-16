import React, { useState, useEffect } from "react";
// import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import "../style.scss";
import axiosInstance from "../utils/axiosInstance";

const Events = () => {
  const state = useLocation().state;
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;

  const [meta_title, setMetaTitle] = useState(state?.meta_title || "");
  const [meta_key, setMetaKey] = useState(state?.meta_key || "");
  const [meta_desc, setMetaDesc] = useState(state?.meta_desc || "");
  const [event_name, setEventName] = useState(state?.event_name || "");
  const [event_date, setEventDate] = useState(
    state?.event_date ? moment(state.event_date).format('YYYY-MM-DD') : ''
  );
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewURL, setPreviewURL] = useState(state?.image_url ? `${baseURL}${state.image_url}` : null);

  useEffect(() => {
    if (state?.image_url) {
      setPreviewURL(state.image_url);
    }
  }, [state]);

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
    if (!event_name.trim()) {
      errors.event_name = "Please enter a title.";
    }
    if (!event_date.trim()) {
      errors.event_date = "Please enter a Event date.";
    }
  
    if (!file && !state?.image_url) {
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
      let imgUrl = state?.image_url || "";
      if (file) {
        imgUrl = await upload();
      }

      const payload = {
        meta_title,
        meta_key,
        meta_desc,
        event_name,
        event_date,
        img: imgUrl,
        created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      };

      try {
        if (state) {
          await axiosInstance.put(`/event/${state.id}`, payload);
        } else {
          await axiosInstance.post(`/event/`, payload);
        }
        navigate("/events");
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
          name="meta_title"
          placeholder="Meta Title"
          value={meta_title}
          onChange={(e) => setMetaTitle(e.target.value)}
        />
        <input
          type="text"
          name="meta_key"
          placeholder="Meta Keywords"
          value={meta_key}
          onChange={(e) => setMetaKey(e.target.value)}
        />
        <input
          type="text"
          name="meta_desc"
          placeholder="Meta Description"
          value={meta_desc}
          onChange={(e) => setMetaDesc(e.target.value)}
        />
       
        <input
          type="text"
          name="event_name"
          placeholder="Add Event Name"
          value={event_name}
          onChange={(e) => setEventName(e.target.value)}
        />
        {errors.event_name && <span className="error">{errors.event_name}</span>}
        <input
          type="date"
          name="event_date"
          placeholder="Add Date"
          value={event_date}
          onChange={(e) => setEventDate(e.target.value)}
        />
        {errors.event_date && <span className="error">{errors.event_date}</span>}
       
       
      </div>
      <div className="item">
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
          <button onClick={handleClick}>Publish</button>
        </div>
      </div>
    </div>
  );
};

export default Events;
