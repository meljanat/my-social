"use client";
import { useState } from "react";
import "./styles/AuthForm.css";

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    privacy: "",
    username: "",
    firstName: "",
    lastName: "",
    confirmedPassword: "",
    dateOfBirth: "",
    aboutMe: "",
    avatar: null,
    cover: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageInputKey, setImageInputKey] = useState(Date.now());

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      avatar: file,
    });
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      cover: file,
    });
  };

  const removeImage = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      avatar: null,
    });
    setImageInputKey(Date.now());
  };
  const removeCover = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      cover: null,
    });
    setImageInputKey(Date.now());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!isLogin) {
      if (!formData.username) newErrors.username = "Username is required";
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required";

      if (!formData.confirmedPassword) {
        newErrors.confirmedPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmedPassword) {
        newErrors.confirmedPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8404/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload();
      } else {
        setErrors({
          form: data.error || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      setErrors({
        form: "An error occurred. Please try again later.",
      });
    }
  };

  const handleRegister = async () => {
    try {
      const registerData = new FormData();

      registerData.append("email", formData.email);
      registerData.append("username", formData.username);
      registerData.append("firstName", formData.firstName);
      registerData.append("lastName", formData.lastName);
      registerData.append("password", formData.password);
      registerData.append("confirmedPassword", formData.confirmedPassword);
      registerData.append("dateOfBirth", formData.dateOfBirth);
      registerData.append("aboutMe", formData.aboutMe);
      registerData.append("privacy", formData.privacy);

      if (formData.avatar) {
        registerData.append("avatar", formData.avatar);
      }

      if (formData.cover) {
        registerData.append("cover", formData.cover);
      }

      const response = await fetch(
        "http://localhost:8404/register?type=register",
        {
          method: "POST",
          body: registerData,
        }
      );

      if (response.ok) {
        setSuccessMessage("Registration successful! You can now log in.");
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 2000);
      } else {
        const data = await response.json();
        setErrors({
          form: data.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        form: "An error occurred. Please try again later.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="./icons/logo.svg" alt="Logo" />
            {/* <h1>Social</h1> */}
          </div>

          <h2 className="auth-title">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>

          <p className="auth-subtitle">
            {isLogin ? "Enter your credentials." : "Register a new account"}
          </p>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.form && <div className="error-message">{errors.form}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {!isLogin && (
              <>
                {/* <div className="form-row"> */}
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "error" : ""}
                    placeholder="firstname"
                  />
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "error" : ""}
                    placeholder="lastname"
                  />
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
                {/* </div> */}

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? "error" : ""}
                    placeholder="username"
                  />
                  {errors.username && (
                    <span className="error-text">{errors.username}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="privacy">Privacy</label>
                  <select
                    id="privacy"
                    name="privacy"
                    // required
                    value={formData.privacy}
                    onChange={handleChange}
                    className="privacy-select"
                  >
                    <option value="">Select Privacy</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={errors.dateOfBirth ? "error" : ""}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-text">{errors.dateOfBirth}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="aboutMe">About Me</label>
                  <textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.aboutMe}
                    onChange={handleChange}
                    className={errors.aboutMe ? "error" : ""}
                    placeholder="about me"
                    rows="3"
                  ></textarea>
                  {errors.aboutMe && (
                    <span className="error-text">{errors.aboutMe}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Profile Picture</label>
                  {formData.avatar ? (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Profile Preview"
                      />
                      <button
                        className="remove-image-button"
                        onClick={removeImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload">
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        key={imageInputKey}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="file-input"
                      />
                      <label htmlFor="avatar" className="file-label">
                        <img src="./icons/upload.svg" alt="" />
                        Choose File
                      </label>
                      <span className="file-name">
                        {formData.avatar
                          ? formData.avatar.name
                          : "No file chosen"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Profile Cover</label>
                  {formData.cover ? (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.cover)}
                        alt="Profile Preview"
                      />
                      <button
                        className="remove-image-button"
                        onClick={removeCover}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload">
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        key={imageInputKey}
                        onChange={handleCoverChange}
                        accept="image/*"
                        className="file-input"
                      />
                      <label htmlFor="avatar" className="file-label">
                        <img src="./icons/upload.svg" alt="" />
                        Choose File
                      </label>
                      <span className="file-name">
                        {formData.cover
                          ? formData.cover.name
                          : "No file chosen"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="password"
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmedPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmedPassword"
                  name="confirmedPassword"
                  value={formData.confirmedPassword}
                  onChange={handleChange}
                  className={errors.confirmedPassword ? "error" : ""}
                  placeholder="password"
                />
                {errors.confirmedPassword && (
                  <span className="error-text">{errors.confirmedPassword}</span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
              ? "Log In"
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
