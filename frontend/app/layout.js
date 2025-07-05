"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import "./globals.css";
import Navbar from "./components/NavBar";
import WebSocketManager from "./websocket/ws";
import AuthForm from "./components/AuthForm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState('chil3ba');

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
          setIsLoggedIn(data ? "true" : "false");
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {isLoggedIn === "false" && (
          <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
        {isLoggedIn === "true" && (
          <>
            <WebSocketManager />
            <Navbar />
            {children}
          </>
        )}
      </body>
    </html>
  );
}
