import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"

import { useEffect, useState } from "react"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import Agents from "./pages/Agents"
import Tasks from "./pages/Tasks"
import Analytics from "./pages/Analytics"
import Logs from "./pages/Logs"
import Settings from "./pages/Settings"
import Login from "./pages/Login/Login"

import {
  getAccessToken,
} from "./lib/auth"

function ProtectedRoute({
  authenticated,
  children,
}) {
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

function AdminLayout() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content ml-60 w-[calc(100%-15rem)]">
        <Header />

        <div className="page-content">
          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/users"
              element={<Users />}
            />

            <Route
              path="/agents"
              element={<Agents />}
            />

            <Route
              path="/tasks"
              element={<Tasks />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/logs"
              element={<Logs />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </div>
      </main>
    </div>
  )
}

function AppContent() {
  const location = useLocation()

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true)

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      setCheckingSession(true)

      const accessToken =
        await getAccessToken()

      if (cancelled) {
        return
      }

      if (!accessToken) {
        setAuthenticated(false)
      } else {
        setAuthenticated(true)
      }

      setCheckingSession(false)
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [location.pathname])

  /*
   * Cek session secara berkala.
   * Jadi kalau token expired ketika
   * user sedang diam di halaman,
   * session tetap akan diperiksa.
   */
  useEffect(() => {
    if (
      location.pathname === "/login"
    ) {
      return
    }

    const interval = window.setInterval(
      async () => {
        const accessToken =
          await getAccessToken()

        if (!accessToken) {
          setAuthenticated(false)
          window.location.replace(
            "/login"
          )
        }
      },
      15000
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [location.pathname])

  if (location.pathname === "/login") {
    return <Login />
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Checking session...
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute
      authenticated={authenticated}
    >
      <AdminLayout />
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App