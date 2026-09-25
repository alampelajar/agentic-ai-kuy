import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (event) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const responseText = await response.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Login gagal"
        )
      }

      if (!data.access_token) {
        throw new Error(
          "Access token tidak diterima dari server"
        )
      }

      localStorage.setItem(
        "admin_access_token",
        data.access_token
      )

      localStorage.setItem(
        "admin_user",
        JSON.stringify(data.user)
      )

      navigate("/dashboard", {
        replace: true,
      })
    } catch (error) {
      setError(
        error.message ||
          "Terjadi kesalahan saat login"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
              AI
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your dashboard
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                required
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-200
                "
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-200
                "
              />

            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-lg
                bg-slate-900
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Admin Dashboard
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login