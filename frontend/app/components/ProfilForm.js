"use client";

import { useState, useEffect } from "react";
import "../styles/ProfileFormStyle.css";

export default function ProfileForm() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    followersCount: 0,
    followingCount: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8404/profile", {
          method: "GET",
          headers: {
            //     "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            //   },
            // });
            "Content-Type": "application/json",
          },
          //    body: JSON.stringify(postFormInput),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setProfileData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          followersCount: data.totalFollowers,
          followingCount: data.totalFollowing,
          totalPosts: data.totalPosts,
          totalLikes: data.totalLikes,
          totalComments: data.totalComments,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserProfile();
  }, []);

  return (
    <div className="profile-form">
      <h3>Profile</h3>
      <form>
        <div className="input-group">
          <label>First Name</label>
          <input type="text" value={profileData.firstName} readOnly />
        </div>
        <div className="input-group">
          <label>Last Name</label>
          <input type="text" value={profileData.lastName} readOnly />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={profileData.email} readOnly />
        </div>
        <div className="input-group">
          <label>Followers</label>
          <input type="text" value={profileData.followersCount} readOnly />
        </div>
        <div className="input-group">
          <label>Following</label>
          <input type="text" value={profileData.followingCount} readOnly />
        </div>
        <div className="input-group">
          <label>Total Posts</label>
          <input type="text" value={profileData.totalPosts} readOnly />
        </div>
        <div className="input-group">
          <label>Total Likes</label>
          <input type="text" value={profileData.totalLikes} readOnly />
        </div>
        <div className="input-group">
          <label>Total Comments</label>
          <input type="text" value={profileData.totalComments} readOnly />
        </div>
      </form>
    </div>
  );
}
