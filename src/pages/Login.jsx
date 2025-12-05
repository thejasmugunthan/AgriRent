import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data?.success) {
        alert(res.data?.message || "Login failed");
        return;
      }

      const user = res.data?.user;
      if (!user) {
        alert("Login error: No user data received");
        return;
      }

      const userId = user._id;
      if (!userId) {
        alert("Login error: Missing userId");
        return;
      }

      // ⭐ FIX: Save full user object for Booking.jsx
      localStorage.setItem("user", JSON.stringify(user));

      // Existing stored values
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", user.role);

      // Redirect
      if (user.role === "owner") {
        nav("/owner-dashboard");
      } else {
        nav("/renter-dashboard");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login failed. Check backend.");
    }
  };

  return (
    <div className="login-page">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
