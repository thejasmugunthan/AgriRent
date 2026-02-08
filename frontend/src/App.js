import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import OwnerDashboard from "./pages/OwnerDashboard";
import MyMachines from "./pages/MyMachines";
import Earnings from "./Owner/Earnings";
import Profile from "./pages/Profile";  
import RenterDashboard from "./pages/RenterDashboard";
import BrowseMachines from "./pages/BrowseMachines";
import MyRentals from "./pages/MyRentals";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PricePredictor from "./components/PricePredictor";
import AddMachine from "./pages/AddMachine";
import Booking from "./pages/Booking";
import Analytics from "./Owner/Analytics";
import ChatSupport from "./pages/ChatSupport";
import RenterAnalytics from "./Renter/RenterAnalytics";
import RateMachine from "./pages/RateMachine";
import ViewMachine from "./Renter/ViewMachine";
import EditMachine from "./pages/EditMachine";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* General */}
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Renter */}
        <Route path="/renter-dashboard" element={<RenterDashboard />} />
        <Route path="/browse-machines" element={<BrowseMachines />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        <Route path="/renter-analytics" element={<RenterAnalytics />} />

        {/* Rating Page */}
        <Route path="/rate-machine/:machineId" element={<RateMachine />} />

        {/* Booking Route — the ONLY correct one */}
        <Route path="/rent-machine/:machineId" element={<Booking />} />
        <Route path="/machine/:id" element={<ViewMachine />} />


        {/* Owner */}
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/my-machines" element={<MyMachines />} />
        <Route path="/add-machine" element={<AddMachine />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/edit-machine/:id" element={<EditMachine />} />


        {/* Support */}
        <Route path="/chat" element={<ChatSupport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/price-predictor" element={<PricePredictor />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
