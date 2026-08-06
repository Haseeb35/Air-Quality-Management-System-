import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditUser = () => {
  const { id } = useParams(); // Get the user ID from the route
  const navigate = useNavigate();
  
  // Simulated user data (in a real-world app, this would come from an API)
  const users = [
    { id: 1, name: "John Doe", email: "johndoe@example.com" },
    { id: 2, name: "Jane Smith", email: "janesmith@example.com" },
    { id: 3, name: "Mark Johnson", email: "markj@example.com" },
  ];

  // Find the user by ID
  const user = users.find((user) => user.id === parseInt(id));

  // If no user found, redirect back
  if (!user) {
    navigate("/view-users");
    return null;
  }

  // State to handle form inputs
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(""); // Password is optional to update

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (name && email) {
      // Update user logic here (e.g., send updated data to API)
      console.log("User updated:", { id, name, email, password });

      // Navigate back to the View Users page
      navigate("/view-users");
    } else {
      alert("Please fill out all required fields.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <h2 className="text-center mb-4">Update User</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password (Optional)
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditUser;
