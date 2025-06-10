import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HiViewGridAdd,
  HiOutlineLogout,
} from 'react-icons/hi';
import {
  MdOutlineManageHistory,
  MdDashboard,
} from 'react-icons/md';
import { FaBook, FaUserCog, FaComment } from 'react-icons/fa';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-indigo-800 text-white">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-900">
            <span className="text-xl font-bold">BookHauks Admin</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <MdDashboard className="mr-3 text-lg" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/add-new-book"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/add-new-book') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <HiViewGridAdd className="mr-3 text-lg" />
              Add Book
            </Link>
            <Link
              to="/dashboard/manage-books"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/manage-books') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <MdOutlineManageHistory className="mr-3 text-lg" />
              Manage Books
            </Link>
            <Link
              to="/dashboard/manage-users"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/manage-users') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <FaUserCog className="mr-3 text-lg" />
              Users
            </Link>
            <Link
              to="/dashboard/orders"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/orders') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <FaBook className="mr-3 text-lg" />
              Orders
            </Link>
            <Link
              to="/dashboard/reviews"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/reviews') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <FaComment className="mr-3 text-lg" />
              Reviews
            </Link>
          </nav>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <HiOutlineLogout className="mr-3 text-lg" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="Admin Avatar"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;