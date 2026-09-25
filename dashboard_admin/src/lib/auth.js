const API_URL = "http://localhost:8080"

let refreshPromise = null

export function clearAdminSession() {
  localStorage.removeItem("admin_access_token")
  localStorage.removeItem("admin_refresh_token")
  localStorage.removeItem("admin_user")
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".")

    if (parts.length !== 3) {
      return null
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )

    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  if (!token) {
    return true
  }

  const payload = decodeJwtPayload(token)

  if (!payload?.exp) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)

  return payload.exp <= now
}

export async function refreshAccessToken() {
  // Jangan jalankan refresh kedua kalau refresh pertama
  // masih sedang berjalan.
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (!data?.access_token) {
        return null
      }

      localStorage.setItem(
        "admin_access_token",
        data.access_token
      )

      return data.access_token
    } catch (error) {
      console.error(
        "Refresh access token gagal:",
        error
      )

      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function getAccessToken() {
  const accessToken = localStorage.getItem(
    "admin_access_token"
  )

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken
  }

  return await refreshAccessToken()
}