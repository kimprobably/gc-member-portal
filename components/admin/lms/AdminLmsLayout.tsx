import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminLmsSidebar from './AdminLmsSidebar';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { isAdminEmail } from '../../../config/adminConfig';
import { Menu } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/admin/lms': 'LMS Admin',
  '/admin/lms/cohorts': 'LMS Cohorts',
  '/admin/lms/curriculum': 'Curriculum Editor',
};

const AdminLmsLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { gcMember, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if user is authenticated and is an admin
  if (!isAuthenticated || !gcMember) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminEmail(gcMember.email)) {
    return <Navigate to="/login" replace />;
  }

  // Match route title, handle dynamic routes
  let pageTitle = routeTitles[location.pathname] || 'LMS Admin';
  if (location.pathname.startsWith('/admin/lms/curriculum/')) {
    pageTitle = 'Curriculum Editor';
  }

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar */}
      <AdminLmsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`h-16 flex items-center justify-between px-4 md:px-6 border-b ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded ${
              isDarkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-700'
            }`}
          >
            LMS Admin
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
          }`}
        >
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLmsLayout;
