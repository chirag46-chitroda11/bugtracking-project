import React from "react"
import { Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import Login from "../pages/Login"
import Register from "../pages/Register"
import AdminDashboard from "../pages/AdminDashboard"
import DeveloperDashboard from "../pages/DeveloperDashboard"
import TesterDashboard from "../pages/TesterDashboard"
import PMDashboard from "../pages/PMDashboard"
import CreateBug from "../pages/CreateBug"
import CreateProject from "../pages/CreateProject"
import EditProject from "../pages/EditProject"
import CreateModule from "../pages/CreateModule"
import EditModule from "../pages/EditModule"
import CreateTask from "../pages/CreateTask"
import EditTask from "../pages/EditTask"
import CreateSprint from "../pages/CreateSprint"
import EditSprint from "../pages/EditSprint"
import AdminUsers from "../pages/AdminUsers"
import CreateUser from "../pages/CreateUser"
import EditUser from "../pages/EditUser"
import EditBug from "../pages/EditBug"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
     
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
      <Route path="/tester-dashboard" element={<TesterDashboard />} />
      <Route path="/pm-dashboard" element={<PMDashboard />} />

      <Route path="/create-bug" element={<CreateBug/>} />
      <Route path="/create-project" element={<CreateProject/>} />
      <Route path="/edit-project/:id" element={<EditProject/>} />  
      <Route path="/create-module" element={<CreateModule/>} />  
      <Route path="/edit-module/:id" element={<EditModule />} />
      <Route path="/create-task" element={<CreateTask />} />
      <Route path="/edit-task/:id" element={<EditTask />} />
      <Route path="/sprint" element={<CreateSprint />} />
      <Route path="/edit-sprint/:id" element={<EditSprint />} />
      <Route path="/admin-users" element={<AdminUsers />} />

      <Route path="/edit-user/:id" element={<EditUser />} />
      <Route path="/edit-bug/:id" element={<EditBug />} />
     
    

      <Route path="/create-user" element={<CreateUser />} />
    </Routes>
  )
}

export default AppRouter