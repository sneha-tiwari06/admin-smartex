import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import "../style.scss";
import axiosInstance from "../utils/axiosInstance";

const Winners = () => {
  const state = useLocation().state;
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;

  const [title, setTitle] = useState(state?.title || "");
  const [date, setDate] = useState(
    state?.date ? moment(state.date).format("YYYY-MM-DD") : ""
  );
  const [alt_tag, setAltTag] = useState(state?.alt_tag || "");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewURL, setPreviewURL] = useState(
    state?.img ? `${baseURL}${state.img}` : null
  );

  useEffect(() => {
    if (state?.img) {
      setPreviewURL(state.img);
    }
  }, [state]);

  const sanitizeFileName = (fileName) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
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
    if (!date.trim()) {
      errors.date = "Please enter a date.";
    }
    if (!alt_tag.trim()) {
      errors.alt_tag = "Please select an alternate text.";
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

      const payload = {
        title,
        date,
        alt_tag,
        img: imgUrl,
        created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      };

      try {
        if (state) {
          await axiosInstance.put(`/winners/${state.id}`, payload);
        } else {
          await axiosInstance.post(`/winners/`, payload);
        }
        navigate("/winners-gallery");
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
      const arr = new Uint8Array(reader.result).subarray(0, 4);
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
        setErrors((prevErrors) => ({
          ...prevErrors,
          file: "Only JPG, JPEG, WEBP, and PNG formats are allowed.",
        }));
        setFile(null);
        setPreviewURL(null);
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, file: null }));
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
        <input
          type="text"
          name="title"
          placeholder="Add Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span className="error">{errors.title}</span>}
        <input
          type="text"
          name="alt_tag"
          placeholder="Add Alternate Text for image"
          value={alt_tag}
          onChange={(e) => setAltTag(e.target.value)}
        />
        {errors.alt_tag && <span className="error">{errors.alt_tag}</span>}
        <input
          type="date"
          name="date"
          placeholder="Add Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <span className="error">{errors.date}</span>}
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
          name="file"
          onChange={handleFileChange}
        />
        <label className="file" htmlFor="file">
          Upload Image
        </label>
        {previewURL && (
          <img
            src={previewURL}
            alt="Preview"
            style={{ height: "50px", width: "50px" }}
          />
        )}
        {errors.file && <span className="error">{errors.file}</span>}
        <div className="buttons">
          <button>Save as a draft</button>
          <button onClick={handleClick}>Publish</button>
        </div>
      </div>
    </div>
  );
};

export default Winners;
