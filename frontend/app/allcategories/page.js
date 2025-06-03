"use client";
import React, { useEffect, useState } from "react";
import PostComponent from "../components/PostComponent";

export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  async function fetchCategories() {
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
          const topCategory = data.reduce((max, cat) =>
            (cat.count > max.count ? cat : max), data[0]);
          hundleClick(topCategory.category_id);
        }
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }


  async function hundleClick(id) {
    setActiveCategory(id);
    try {
      const response = await fetch(`http://localhost:8404/posts_category?category_id=${id}&offset=0`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        const error = await response.json();
        console.error("Failed to fetch posts:", error.error);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);
  
  let content;
  if (posts !== null) {
    if (posts.length !== 0 ) {
      content = <PostComponent posts={posts} />;
    } else {
      content = <p>No posts to show</p>;
    }
  } else {
    content = <p>No posts to show</p>;
  }

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div className="left-sidebar" style={{ marginTop: "7%", backgroundColor: "#f5f5f5", padding: "16px", maxHeight: "80vh", overflowY: "auto", borderRadius: "10px", width: "25%", marginLeft: "2%",position: "fixed" }}>
        <h3 style={{ color: "#333", marginBottom: "16px" }}>All Categories</h3>
        {categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {categories.map((category) => (
              <li
                key={category.category_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  padding: "12px 8px",
                  borderRadius: "8px",
                  backgroundColor: activeCategory === category.category_id ? "#e0e0e0" : "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                }}
                onClick={() => hundleClick(category.category_id)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={`/icons/${category.name}.png`}
                    alt={category.name}
                    style={{ width: "40px", height: "40px", marginRight: "10px" }}
                  />
                  <span style={{ fontWeight: "500", color: "#333" }}>{category.name}</span>
                </div>
                <span style={{ color: "#666", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                  {category.count || 0} posts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, padding: "16px", marginTop: "7%", marginLeft: "30%", position: "relative" }}>
        {content}
      </div>
    </div>
  );
}
