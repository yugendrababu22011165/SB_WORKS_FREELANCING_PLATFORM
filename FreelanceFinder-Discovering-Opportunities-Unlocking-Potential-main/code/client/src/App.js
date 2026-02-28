// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";

// Pages
import Landing from "./pages/Landing";
import Authenticate from "./pages/Authenticate";

// Freelancer Pages
import Freelancer from "./pages/freelancer/Freelancer";
import AllProjects from "./pages/freelancer/AllProjects";
import MyProjects from "./pages/freelancer/MyProjects";
import MyApplications from "./pages/freelancer/MyApplications";
import ProjectData from "./pages/freelancer/ProjectData";

// Client Pages
import Client from "./pages/client/Client";
import ProjectApplications from "./pages/client/ProjectApplications";
import NewProject from "./pages/client/NewProject";
import ProjectWorking from "./pages/client/ProjectWorking";

// Admin Pages
import Admin from "./pages/admin/Admin";
import AdminProjects from "./pages/admin/AdminProjects";
import AllApplications from "./pages/admin/AllApplications";
import AllUsers from "./pages/admin/AllUsers";

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        {/* Landing & Authentication */}
        <Route path="/" element={<Landing />} />
        <Route path="/authenticate" element={<Authenticate />} />

        {/* Freelancer Routes */}
        <Route path="/freelancer" element={<Freelancer />} />
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/myApplications" element={<MyApplications />} />
        <Route path="/project/:id" element={<ProjectData />} />

        {/* Client Routes */}
        <Route path="/client" element={<Client />} />
        <Route path="/project-applications" element={<ProjectApplications />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/client-project/:id" element={<ProjectWorking />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-projects" element={<AdminProjects />} />
        <Route path="/admin-applications" element={<AllApplications />} />
        <Route path="/all-users" element={<AllUsers />} />
      </Routes>
    </div>
  );
}

export default App;