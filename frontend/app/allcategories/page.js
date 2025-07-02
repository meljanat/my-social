"use client";
import React, { useEffect, useState } from "react";
import AuthForm from "../components/AuthForm";
import PostComponent from "../components/PostComponent";
import styles from "../styles/AllCategories.module.css";

export default function AllCategories() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data);
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

  async function fetchCategories() {
    setIsLoadingCategories(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8404/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);

        if (data.length > 0) {
          const topCategory = data.reduce(
            (max, cat) => (cat.count > max.count ? cat : max),
            data[0]
          );
          hundleClick(topCategory.category_id);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch categories.");
      }
    } catch (error) {
      setError("Network error while fetching categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  }

  async function hundleClick(id) {
    setActiveCategory(id);
    setIsLoadingPosts(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8404/posts_category?category_id=${id}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch posts for this category.");
        setPosts([]);
      }
    } catch (error) {
      setError("Network error while fetching posts.");
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchCategories();
  }, []);

  let content;
  if (isLoadingPosts) {
    content = (
      <div className={styles.loadingMessage}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading posts...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className={styles.errorMessageContainer}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  } else if (posts && posts.length > 0) {
    content = <PostComponent posts={posts} />;
  } else {
    content = (
      <div className={styles.noPostsMessage}>
        <p>No posts to show for this category.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={styles.categoriesPageContainer}>
      <div className={styles.leftSidebar}>
        <h3 className={styles.sidebarTitle}>All Categories</h3>
        {isLoadingCategories ? (
          <div className={styles.loadingMessage}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessageContainer}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className={styles.noCategoriesMessage}>No categories found</p>
        ) : (
          <ul className={styles.categoryList}>
            {categories.map((category) => (
              <li
                key={category.category_id}
                className={`${styles.categoryItem} ${activeCategory === category.category_id
                  ? styles.activeCategory
                  : ""
                  }`}
                onClick={() => hundleClick(category.category_id)}
              >
                <div className={styles.categoryContent}>
                  <img
                    src={`/icons/${category.name}.png`}
                    alt={category.name}
                    className={styles.categoryIcon}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/inconnu/default-category.png";
                    }}
                  />
                  <span className={styles.categoryName}>{category.name}</span>
                </div>
                <span className={styles.categoryCount}>
                  {category.count || 0} posts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.mainContentArea}>{content}</div>
    </div>
  );
}
