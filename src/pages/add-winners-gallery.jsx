import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import "../style.scss";
import axiosInstance from "../utils/axiosInstance";

const Winners = () => {
  const state = useLocation().state;
  const navigate = useNavigate();
  // const baseURL = process.env.REACT_APP_BASE_URL;

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(state?.img ? state.img : null);
  const { id } = useParams();

  const [draft, setDraft] = useState({
    title: state?.title || "",
    date: state?.date ? moment(state.date).format("YYYY-MM-DD") : "",
    alt_tag: state?.alt_tag || "",
    img: state?.img || null,
  });

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await axiosInstance.get(`/drafts/${id}`);
        const fetchedDraft = res.data;
        setDraft({
          title: fetchedDraft.title,
          date: fetchedDraft.date ? moment(fetchedDraft.date).format("YYYY-MM-DD") : "",
          alt_tag: fetchedDraft.alt_tag,
          img: fetchedDraft.img,
        });
        setPreviewURL(fetchedDraft.img);
      } catch (err) {
        console.error('Error fetching draft:', err);
      }
    };

    if (id) {
      fetchDraft();
    }
  }, [id]);

  const sanitizeFileName = (fileName) => fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  const saveDraft = async () => {
    try {
      let imgUrl = draft.img || "";
      if (file) {
        const formData = new FormData();
        const sanitizedFileName = sanitizeFileName(file.name);
        const renamedFile = new File([file], sanitizedFileName, { type: file.type });
        formData.append("file", renamedFile);
        const res = await axiosInstance.post("/upload", formData);
        imgUrl = res.data.url;
      }

      const payload = {
        title: draft.title,
        img: imgUrl,
        date: draft.date,
        alt_tag: draft.alt_tag,
      };

      if (id) {
        await axiosInstance.put(`/drafts/${id}`, payload);
      } else {
        await axiosInstance.post(`/drafts`, payload);
      }

      alert("Draft saved successfully.");
      navigate("/winners-gallery");
    } catch (err) {
      console.error("Error saving draft:", err);
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
        setErrors({
          file: "Only JPG, JPEG, WEBP, and PNG formats are allowed.",
        });
        setFile(null);
        setPreviewURL(null);
      } else {
        setErrors({ file: null });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft(prevDraft => ({
      ...prevDraft,
      [name]: value
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!draft.title.trim()) {
      errors.title = "Please enter a title.";
    }
    if (!draft.date.trim()) {
      errors.date = "Please enter a date.";
    }
    if (!draft.alt_tag.trim()) {
      errors.alt_tag = "Please enter an alternate text.";
    }
    if (!draft.img && !file && !state?.img) {
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
      await handlePublish();
    }
  };

  const handlePublish = async () => {
    try {
      let imgUrl = draft.img || "";
      if (file) {
        imgUrl = await upload();
      }
  
  
      const payload = {
        title: draft.title,
        date: draft.date,
        alt_tag: draft.alt_tag,
        img: imgUrl,
        created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      };
  
      if (id) {
        await axiosInstance.post(`/drafts/${id}/publish`, payload);
      } else {
        await axiosInstance.post(`/winners/`, payload);
      }
  
      navigate("/winners-gallery"); 
    } catch (err) {
      console.error("Error publishing:", err);
      if (err.message === "Please select an image.") {
        setErrors({ file: err.message });
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };
  

  const upload = async () => {
    try {
      if (!file) {
        throw new Error("Please select an image.");
      }

      const formData = new FormData();
      const sanitizedFileName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedFileName, { type: file.type });
      formData.append("file", renamedFile);

      const res = await axiosInstance.post("/upload", formData);
      return res.data.url;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw err;
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          name="title"
          placeholder="Add Title"
          value={draft.title}
          onChange={handleChange}
        />
        {errors.title && (
          <span className="error">{errors.title}</span>
        )}
        <input
          type="text"
          name="alt_tag"
          placeholder="Add Alternate Text for image"
          value={draft.alt_tag}
          onChange={handleChange}
        />
        {errors.alt_tag && (
          <span className="error">{errors.alt_tag}</span>
        )}
        <input
          type="date"
          name="date"
          placeholder="Add Date"
          value={draft.date}
          onChange={handleChange}
        />
        {errors.date && (
          <span className="error">{errors.date}</span>
        )}
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
        {errors.file && (
          <span className="error">{errors.file}</span>
        )}
        <div className="buttons">
          <button onClick={saveDraft}>Save as a draft</button>
          <button onClick={handleClick}>Publish</button>
        </div>
      </div>
    </div>
  );
};

export default Winners;
