"use client";
import { useState } from "react";
// import "./styles/AuthForm.css";
import styles from "../styles/AuthForm.module.css";

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
    (formData.email = ""),
      (formData.password = ""),
      (formData.privacy = ""),
      (formData.username = ""),
      (formData.firstName = ""),
      (formData.lastName = ""),
      (formData.confirmedPassword = ""),
      (formData.dateOfBirth = ""),
      (formData.aboutMe = ""),
      (formData.avatar = null),
      (formData.cover = null),
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

        console.log(data);
        if (data.fields) {
          const fieldErrors = {};

          for (const [key, message] of Object.entries(data.fields)) {
            const mappedKey = [key] || key;
            fieldErrors[mappedKey] = message;
          }

          setErrors(fieldErrors);
        } else {
          setErrors({
            form: data.error || "Registration failed. Please try again.",
          });
        }
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
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <img src="./icons/logo.svg" alt="Logo" />
            {/* <h1>Social</h1> */}
          </div>

          <h2 className={styles.authTitle}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>

          <p className={styles.authSubtitle}>
            {isLogin ? "Enter your credentials." : "Register a new account"}
          </p>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {errors.form && (
          <div className={styles.errorMessage}>{errors.form}</div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? styles.error : ""}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {!isLogin && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? styles.error : ""}
                    placeholder="firstname"
                  />
                  {errors.firstName && (
                    <span className={styles.errorText}>{errors.firstName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? styles.error : ""}
                    placeholder="lastname"
                  />
                  {errors.lastName && (
                    <span className={styles.errorText}>{errors.lastName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? styles.error : ""}
                    placeholder="username"
                  />
                  {errors.username && (
                    <span className={styles.errorText}>{errors.username}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="privacy">Privacy</label>
                  <select
                    id="privacy"
                    name="privacy"
                    value={formData.privacy}
                    onChange={handleChange}
                    className={styles.privacySelect}
                  >
                    <option value="">Select Privacy</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={errors.dateOfBirth ? styles.error : ""}
                  />
                  {errors.dateOfBirth && (
                    <span className={styles.errorText}>
                      {errors.dateOfBirth}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="aboutMe">About Me</label>
                  <textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.aboutMe}
                    onChange={handleChange}
                    className={errors.aboutMe ? styles.error : ""}
                    placeholder="about me"
                    rows="3"
                  ></textarea>
                  {errors.aboutMe && (
                    <span className={styles.errorText}>{errors.aboutMe}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Profile Picture</label>
                  {formData.avatar ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Profile Preview"
                      />
                      <button
                        className={styles.removeImageButton}
                        onClick={removeImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        key={imageInputKey}
                        onChange={handleImageChange}
                        accept="image/*"
                        className={styles.fileInput}
                      />
                      <label htmlFor="avatar" className={styles.fileLabel}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="16"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            fill="#475569"
                            d="M10 0C6.834.025 3.933 2.153 3.173 5.536 1.232 6.352 0 8.194 0 10.376 0 13.385 2.376 16 5.312 16H6a1 1 0 1 0 0-2h-.688C3.526 14 2 12.321 2 10.375c0-1.493.934-2.734 2.344-3.156a.98.98 0 0 0 .687-.813C5.417 3.7 7.592 2.02 10 2c2.681-.02 5.021 2.287 5 5v1.094c0 .465.296.864.75.968C17.066 9.367 18 10.4 18 11.5c0 1.35-1.316 2.5-3 2.5h-1a1 1 0 0 0 0 2h1c2.734 0 5-1.983 5-4.5 0-1.815-1.215-3.42-3.013-4.115.002-.178.013-.359.013-.385.03-3.836-3.209-7.03-7-7m0 6L6.988 9.013 9 9v6a1 1 0 0 0 2 0V9l2.012.01z"
                          ></path>
                        </svg>
                        Choose File
                      </label>
                      <span className={styles.fileName}>
                        {formData.avatar
                          ? formData.avatar.name
                          : "No file chosen"}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Profile Cover</label>
                  {formData.cover ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={URL.createObjectURL(formData.cover)}
                        alt="Profile Preview"
                      />
                      <button
                        className={styles.removeImageButton}
                        onClick={removeCover}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="cover"
                        name="cover"
                        key={imageInputKey}
                        onChange={handleCoverChange}
                        accept="image/*"
                        className={styles.fileInput}
                      />
                      <label htmlFor="cover" className={styles.fileLabel}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="16"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            fill="#475569"
                            d="M10 0C6.834.025 3.933 2.153 3.173 5.536 1.232 6.352 0 8.194 0 10.376 0 13.385 2.376 16 5.312 16H6a1 1 0 1 0 0-2h-.688C3.526 14 2 12.321 2 10.375c0-1.493.934-2.734 2.344-3.156a.98.98 0 0 0 .687-.813C5.417 3.7 7.592 2.02 10 2c2.681-.02 5.021 2.287 5 5v1.094c0 .465.296.864.75.968C17.066 9.367 18 10.4 18 11.5c0 1.35-1.316 2.5-3 2.5h-1a1 1 0 0 0 0 2h1c2.734 0 5-1.983 5-4.5 0-1.815-1.215-3.42-3.013-4.115.002-.178.013-.359.013-.385.03-3.836-3.209-7.03-7-7m0 6L6.988 9.013 9 9v6a1 1 0 0 0 2 0V9l2.012.01z"
                          ></path>
                        </svg>
                        Choose File
                      </label>
                      <span className={styles.fileName}>
                        {formData.cover
                          ? formData.cover.name
                          : "No file chosen"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? styles.error : ""}
                placeholder="password"
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmedPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmedPassword"
                  name="confirmedPassword"
                  value={formData.confirmedPassword}
                  onChange={handleChange}
                  className={errors.confirmedPassword ? styles.error : ""}
                  placeholder="password"
                />
                {errors.confirmedPassword && (
                  <span className={styles.errorText}>
                    {errors.confirmedPassword}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
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

        <div className={styles.authFooter}>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className={styles.toggleButton}
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
