import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./SignIn";          // SignIn component
import SignUp from "./SignUp";          // SignUp component
import UserDashboard from "./UserDashboard";  // User Dashboard component
import AdminDashboard from "./AdminDashboard"; // Admin Dashboard component
import AddUser from "./components/AddUser"; // Import the AddUser component
import ViewUsers from "./components/ViewUsers"; // Import ViewUsers component
import UpdateUser from "./components/UpdateUsers"; // Import UpdateUser component
import UpdateProfile from "./components/UpdateProfile";
import EditUser from "./components/EditUser"; // <--- ADDED THIS IMPORT
import ChangePassword from "./components/ChangePassword";
import MapScreen from "./components/MapScreen";
import Predictions from "./components/Predictions";
import SensorData from "./components/SensorData";
import History from "./components/HistoryScreen";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from "./components/ThemeContext";

// Main App component with routing
function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        {/* Route for Sign In */}
        <Route path="/signin" element={<SignIn />} />
        {/* Route for Sign Up */}
        <Route path="/signup" element={<SignUp />} />
        {/* Route for User Dashboard */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
         <Route path="/add-user" element={<AddUser />} />
         <Route path="/view-users" element={<ViewUsers />} />
         <Route path="/Update-user/:id" element={<UpdateUser />} /> {/* Route for editing user */}
        {/* Route for Admin Dashboard */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* Default Route (Redirect to Sign In if no path matches) */}
        <Route path="/" element={<SignIn />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
        <Route path="/profile" element={<UpdateProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/google-map" element={<MapScreen />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/sensor-data" element={<SensorData />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
