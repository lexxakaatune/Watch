import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe, setTheme } from './redux/store'
import Header from './components/Header'
import Footer from './components/Footer'
import Alert from './components/Alert'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Upload from './pages/Upload'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import SearchResults from './pages/SearchResults'
import UserDashboard from './pages/dashboards/UserDashboard'
import CreatorDashboard from './pages/dashboards/CreatorDashboard'
import ModeratorDashboard from './pages/dashboards/ModeratorDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard'
import NotFound from './pages/NotFound'

function App() {
  const dispatch = useDispatch()
  const { mode } = useSelector(state => state.theme)

  useEffect(() => {
    dispatch(fetchMe())
    const saved = localStorage.getItem('watch-theme')
    if (saved) dispatch(setTheme(saved))
    document.documentElement.setAttribute('data-theme', mode)
  }, [dispatch, mode])

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <Alert />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute allowedRoles={['creator','admin','superadmin']}><Upload /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/creator/dashboard" element={<ProtectedRoute allowedRoles={['creator','admin','superadmin']}><CreatorDashboard /></ProtectedRoute>} />
          <Route path="/moderator/dashboard" element={<ProtectedRoute allowedRoles={['moderator','admin','superadmin']}><ModeratorDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
