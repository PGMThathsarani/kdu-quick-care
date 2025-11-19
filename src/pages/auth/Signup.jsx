import React from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import authBgIMg from "../../assets/auth_back.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    specialization: "", // Add specialization field
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate specialization for doctors
    if (form.userType === "doctor" && !form.specialization.trim()) {
      setError("Specialization is required for doctors");
      return;
    }
    if (form.email.split("@")[1] !== "kdu.ac.lk") {
      setError("Please use your KDU email address to sign up.");
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = cred.user.uid;

      // Create user document in Firestore under `Users` collection
      const usersRef = collection(db, "Users");
      const userData = {
        uid,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.userType,
        createdAt: serverTimestamp(),
      };

      // Add specialization only if user is a doctor
      if (form.userType === "doctor") {
        userData.specialization = form.specialization;
      }

      await addDoc(usersRef, userData);

      // Navigate to login or to role landing
      if (form.userType === "doctor") navigate("/doctor");
      else navigate("/student");
    } catch (err) {
      console.error("Signup failed", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${authBgIMg})` }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <Input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              name="userType"
              value={form.userType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            >
              <option value="student">Student</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Specialization field - only shown for doctors */}
          {form.userType === "doctor" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization <span className="text-red-500">*</span>
              </label>
              <Input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Pediatrics, General Medicine"
                required={form.userType === "doctor"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your medical specialization
              </p>
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </div>
        </form>
        <p className="text-center text-gray-500 mt-6">
          Already have an account ?{" "}
          <button
            type="button"
            className="text-blue-800 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;