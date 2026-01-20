"use client";
import Image from "next/image";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle signup validation (frontend only)
  const handleSignUp = () => {
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Simulate successful registration
    setSuccess("Account created successfully! You can now log in.");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <Image
          src="/logo.jpg" // make sure logo exists in /public/logo.jpg
          alt="E-Channeling Logo"
          width={180}
          height={70}
          className="mb-2"
        />
      </div>

      {/* Sign Up Card */}
      <div className="border border-gray-300 rounded-md p-8 w-full max-w-sm shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-2">Sign Up</h2>
        <p className="text-center text-gray-600 mb-6">
          Create your agent account
        </p>

        {/* Error / Success Messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* Full Name */}
        <label className="block mb-2 font-medium text-gray-700">
          Full Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Email */}
        <label className="block mb-2 font-medium text-gray-700">
          Email<span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@example.com"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Password */}
        <label className="block mb-2 font-medium text-gray-700">
          Password<span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Confirm Password */}
        <label className="block mb-2 font-medium text-gray-700">
          Confirm Password<span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition"
        >
          Sign Up
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-700 mt-4">
          Already have an account?{" "}
          <a href="/pages/Signin" className="text-blue-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
