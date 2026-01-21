import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";

export default function DashboardNavbar({ role = "renter" }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/welcome");
  };

  // Navigation items based on role
  const ownerNavItems = [
    { label: "Dashboard", path: "/owner-dashboard" },
    { label: "My Machines", path: "/my-machines" },
    { label: "Earnings", path: "/earnings" },
    { label: "Analytics", path: "/analytics" },
  ];

  const renterNavItems = [
    { label: "Dashboard", path: "/renter-dashboard" },
    { label: "Browse Machines", path: "/browse-machines" },
    { label: "My Rentals", path: "/my-rentals" },
    { label: "Analytics", path: "/renter-analytics" },
  ];

  const navItems = role === "owner" ? ownerNavItems : renterNavItems;

  return (
    <>
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-gray-600 hover:text-green-600 transition-colors"
              >
                {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>

              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <FaTractor className="text-3xl text-green-600" />
                <span className="text-2xl font-bold text-green-700">AgriRent</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">
                    {userName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-green-600 capitalize">{role}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <FaUser /> Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
}
