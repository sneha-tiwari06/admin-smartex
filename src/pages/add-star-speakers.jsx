import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import "../style.scss";
import axiosInstance from "../utils/axiosInstance";

const StarSpeaks = () => {
  const state = useLocation().state;
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_URL;

  const [speaker_name, setSpeakerName] = useState(state?.speaker_name || "");
  const [designation, setDesignation] = useState(state?.designation || "");
  const [speaker_order, setSpeakerOrder] = useState(state?.speaker_order || "");
  const [description, setDescription] = useState(state?.description || "");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewURL, setPreviewURL] = useState(state?.speaker_img ? `${baseURL}${state.speaker_img}` : null);

  useEffect(() => {
    if (state?.speaker_img) {
      setPreviewURL(state.speaker_img);
    }
  }, [state, baseURL]);

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
        setDescription(prevDesc => prevDesc + imgTag);
      };
      reader.readAsDataURL(file);
    }
  };

  const modules = {
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

  const formats = [
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
    if (!speaker_name.trim()) {
      errors.speaker_name = "Please enter a title.";
    }
    if (!designation.trim()) {
      errors.designation = "Please enter a designation.";
    }
    if (!String(speaker_order).trim()) {
      errors.speaker_order = "Please add order.";
    } else if (!/^\d+$/.test(String(speaker_order).trim())) {
      errors.speaker_order = "Order must be an integer.";
    }
    if (!description.trim()) {
      errors.description = "Please select description.";
    }
    if (!file && !state?.speaker_img) {
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
      let imgUrl = state?.speaker_img || "";
      if (file) {
        imgUrl = await upload();
      }

      const payload = {
        speaker_name,
        designation,
        speaker_order,
        description,
        speaker_img: imgUrl,
        date_speaker: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      };

      try {
        if (state) {
          await axiosInstance.put(`/star/${state.id}`, payload);
        } else {
          await axiosInstance.post(`/star/`, payload);
        }
        navigate("/star-speakers");
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
        <input
          type="text"
          name="speaker_name"
          placeholder="Add Speaker Name"
          value={speaker_name}
          onChange={(e) => setSpeakerName(e.target.value)}
        />
        {errors.speaker_name && <span className="error">{errors.speaker_name}</span>}
        <input
          type="text"
          name="designation"
          placeholder="Add Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />
        {errors.designation && <span className="error">{errors.designation}</span>}
        <input
          type="text"
          name="speaker_order"
          placeholder="Add Speaker Order"
          value={speaker_order}
          onChange={(e) => setSpeakerOrder(e.target.value)}
        />
        {errors.speaker_order && <span className="error">{errors.speaker_order}</span>}
        <div>
          <div onDrop={handleDrop} onDragOver={handleDragOver}>
            <ReactQuill
              placeholder="Start writing..."
              modules={modules}
              formats={formats}
              value={description}
              onChange={setDescription}
              onDragStart={e => handleDragStart(e, 'Your dragged content')}
              draggable
            />
          </div>
        </div>
        {errors.description && <span className="error">{errors.description}</span>}
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

export default StarSpeaks;
