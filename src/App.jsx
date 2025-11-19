import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/common/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Reports from './pages/common/Reports'
import RateUs from './pages/common/RateUs'
import Emergency from './pages/common/Emergency'
import Student from './pages/student/Student'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import StudentNotifications from './pages/student/StudentNotifications'
import DoctorNotifications from './pages/doctor/DoctorNotifications'
import Chat from './pages/common/Chat'
import ProtectedRoute from './components/ProtectedRoute'
import { useUserStore } from './store/UserStore'


function App() {
  const initAuth = useUserStore((s) => s.initAuth)

  useEffect(() => {
    // start firebase auth listener on mount
    const unsub = initAuth && initAuth()
    return () => unsub && unsub()
  }, [initAuth])
  return (
    <Router>
      <div>
        {/* Navigation Menu */}
{/* 
        <nav className="p-4 bg-gradient-to-r from-blue-500 to-orange-400 text-white flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
          <Link to="/">Home</Link>
          <Link to="/signup">Signup</Link>         
          <Link to="/login">Login</Link>
          
          <Link to="/emergency">Emergency</Link>
          <Link to="/student">Student</Link>
          <Link to="/doctor">Doctor</Link>
          <Link to="/notifications">St Notification</Link>
          <Link to="/doctor-notifications">Doctor Notifications</Link>
         
          <Link to="/reports">Reports</Link>
          <Link to="/rateus">Rate Us</Link>
        </nav> */}

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rateus" element={<RateUs />} />
          <Route
            path="/emergency"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Emergency userRole="student" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Student />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-notifications"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              // allow both roles to access chat; omit allowedRoles or include both
              <ProtectedRoute allowedRoles={["student", "doctor"]}>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App