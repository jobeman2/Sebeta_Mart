"use client";

import Header from "@/context/UI/header";
import React, { useEffect, useState } from "react";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "buyer",
    phone_number: "",
  });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirm_password) {
      setMessage("Passwords do not match");
      setMessageColor("red");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone_number: form.phone_number,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || data.errors?.[0]?.msg || "Registration failed");
        setMessageColor("red");
      } else {
        setMessage("User registered successfully!");
        setMessageColor("green");
        setForm({
          full_name: "",
          email: "",
          password: "",
          confirm_password: "",
          role: "buyer",
          phone_number: "",
        });
        fetchUsers(); // Refresh table
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setMessageColor("red");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Users List</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Full Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Role</th>
              <th className="border border-gray-300 p-2">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 p-2">{user.id}</td>
                <td className="border border-gray-300 p-2">{user.full_name}</td>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">{user.role}</td>
                <td className="border border-gray-300 p-2">
                  {user.phone_number}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl font-semibold mb-2">Register New User</h2>
      {message && <p className={`mb-2 text-${messageColor}-600`}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
