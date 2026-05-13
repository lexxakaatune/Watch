import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchMe } from './store/slices/authSlice';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserDashboard from './pages/UserDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UploadPage from './pages/UploadPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagingPage from './pages/MessagingPage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

function AppInitializer() {
  useEffect(() => {
    store.dispatch(fetchMe());
  }, []);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="watch/:id" element={<WatchPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="messages" element={<MessagingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Creator Routes */}
            <Route element={<RoleRoute allowedRoles={['creator', 'admin', 'superadmin']} />}>
              <Route path="creator" element={<CreatorDashboard />} />
              <Route path="upload" element={<UploadPage />} />
            </Route>

            {/* Moderator Routes */}
            <Route element={<RoleRoute allowedRoles={['moderator', 'admin', 'superadmin']} />}>
              <Route path="moderator" element={<ModeratorDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['admin', 'superadmin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* SuperAdmin Routes */}
            <Route element={<RoleRoute allowedRoles={['superadmin']} />}>
              <Route path="superadmin" element={<SuperAdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
