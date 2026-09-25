import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Header() {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("admin_access_token")
    localStorage.removeItem("admin_refresh_token")
    localStorage.removeItem("admin_user")

    setProfileOpen(false)
    navigate("/login")
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-7">

      {/* LEFT */}

      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-0.5 text-xs text-slate-500">
          Manage your Agentic AI platform
        </p>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3">

        {/* PROFILE */}

        <div className="relative">

          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
          >

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              A
            </div>

            <div className="hidden text-left sm:block">

              <p className="text-xs font-semibold text-slate-800">
                Admin
              </p>

              <p className="text-[10px] text-slate-400">
                Administrator
              </p>

            </div>

            <span className="text-xs text-slate-400">
              ▾
            </span>

          </button>

          {/* PROFILE DROPDOWN */}

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">

              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold text-slate-800">
                  Administrator
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  admin@example.com
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  )
}

export default Header