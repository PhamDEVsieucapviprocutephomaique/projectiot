import React, { useState, useRef, useEffect } from "react";
import "../components/Profilescss.scss"; // Assuming you have a CSS file for styling

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState(() => {
    const savedData = localStorage.getItem("userProfileData");
    return savedData
      ? JSON.parse(savedData)
      : {
          fullname: "",
          studentId: "",
          githubLink: "",
          postmanFileName: "", // đổi từ postmanLink thành postmanFileName
          postmanFileUrl: "", // đổi từ postmanLink thành postmanFileUrl
          avatarUrl: "",
          pdfFileName: "",
          pdfFileUrl: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("userProfileData", JSON.stringify(userData));
  }, [userData]);

  const handleAvatarClick = () => {
    if (isEditing) {
      document.getElementById("avatar-input").click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          avatarUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfClick = () => {
    if (isEditing) {
      document.getElementById("pdf-input").click();
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          pdfFileName: file.name,
          pdfFileUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm hàm xử lý cho file Postman
  const handlePostmanClick = () => {
    if (isEditing) {
      document.getElementById("postman-input").click();
    }
  };

  const handlePostmanChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          postmanFileName: file.name,
          postmanFileUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Thông tin đã được lưu thành công!");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDownloadPdf = () => {
    if (userData.pdfFileUrl) {
      const a = document.createElement("a");
      a.href = userData.pdfFileUrl;
      a.download = userData.pdfFileName || "bao-cao.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Thêm hàm download file Postman
  const handleDownloadPostman = () => {
    if (userData.postmanFileUrl) {
      const a = document.createElement("a");
      a.href = userData.postmanFileUrl;
      a.download = userData.postmanFileName || "postman-file.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Thông tin cá nhân</h2>

        <div className="profile-section">
          <div className="avatar-section">
            <div
              className={`avatar-preview ${isEditing ? "editable" : ""}`}
              onClick={handleAvatarClick}
            >
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="Avatar"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span>
                    {isEditing ? "Click để tải ảnh lên" : "Chưa có ảnh"}
                  </span>
                </div>
              )}
            </div>

            <input
              id="avatar-input"
              type="file"
              onChange={handleAvatarChange}
              accept="image/*"
              className="file-input-hidden"
            />
          </div>

          <div className="info-section">
            <div className="input-group">
              <label htmlFor="fullname">Họ và tên</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={userData.fullname}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <div className="view-mode-text">
                  {userData.fullname || "Chưa có thông tin"}
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="studentId">Số báo danh</label>
              {isEditing ? (
                <input
                  type="text"
                  name="studentId"
                  value={userData.studentId}
                  onChange={handleInputChange}
                  placeholder="Nhập số báo danh"
                />
              ) : (
                <div className="view-mode-text">
                  {userData.studentId || "Chưa có thông tin"}
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="githubLink">Link GitHub</label>
              {isEditing ? (
                <input
                  type="url"
                  name="githubLink"
                  value={userData.githubLink}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                />
              ) : (
                <div className="view-mode-text">
                  {userData.githubLink ? (
                    <a
                      href={userData.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userData.githubLink}
                    </a>
                  ) : (
                    "Chưa có thông tin"
                  )}
                </div>
              )}
            </div>

            {/* Thay đổi từ Link Postman thành File Postman */}
            <div className="input-group">
              <label htmlFor="postmanFile">File Postman</label>
              {isEditing ? (
                <div
                  className="postman-upload-area editable"
                  onClick={handlePostmanClick}
                >
                  {userData.postmanFileName ? (
                    <div className="file-selected">
                      <span className="file-icon">📦</span>
                      <span className="file-name">
                        {userData.postmanFileName}
                      </span>
                      <span className="click-hint">Click để thay đổi</span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Click để chọn file Postman</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="postman-download-area">
                  {userData.postmanFileName ? (
                    <div
                      className="file-download"
                      onClick={handleDownloadPostman}
                    >
                      <span className="file-icon">📦</span>
                      <span className="file-name">
                        {userData.postmanFileName}
                      </span>
                      <span className="download-hint">Click để tải xuống</span>
                    </div>
                  ) : (
                    <div className="no-file">Chưa có file Postman</div>
                  )}
                </div>
              )}

              <input
                id="postman-input"
                type="file"
                onChange={handlePostmanChange}
                accept=".json,.postman_collection"
                className="file-input-hidden"
              />
            </div>

            <div className="input-group">
              <label htmlFor="pdfReport">File báo cáo PDF</label>
              {isEditing ? (
                <div
                  className="pdf-upload-area editable"
                  onClick={handlePdfClick}
                >
                  {userData.pdfFileName ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{userData.pdfFileName}</span>
                      <span className="click-hint">Click để thay đổi</span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Click để chọn file PDF</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pdf-download-area">
                  {userData.pdfFileName ? (
                    <div className="file-download" onClick={handleDownloadPdf}>
                      <span className="file-icon">📄</span>
                      <span className="file-name">{userData.pdfFileName}</span>
                      <span className="download-hint">Click để tải xuống</span>
                    </div>
                  ) : (
                    <div className="no-file">Chưa có file báo cáo</div>
                  )}
                </div>
              )}

              <input
                id="pdf-input"
                type="file"
                onChange={handlePdfChange}
                accept=".pdf"
                className="file-input-hidden"
              />
            </div>
          </div>
        </div>

        <div className="action-buttons">
          {isEditing ? (
            <button className="save-btn" onClick={handleSave}>
              Lưu thông tin
            </button>
          ) : (
            <button className="edit-btn" onClick={handleEdit}>
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
