"use client";
import React, { useEffect, useState } from "react";
export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  async function fetchCategories() {
    try {
      const response = await fetch("http://localhost:8404/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        console.log(data);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h1>All Categories</h1>
      {categories.length > 0 ? (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <a href={`/category/${category.id}`}>{category.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No categories found</p>
      )}
    </div>
  );
}
