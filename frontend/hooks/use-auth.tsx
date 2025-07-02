"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { EgresadoData } from "@/app/types/egresado-data"

type User = {
  id?: string
  username: string
  email: string
  role: string
  egresado?: EgresadoData
  name?: string
}

type AuthContextType = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  role: string | null
  login: (username: string, password: string) => Promise<{success: boolean, mensaje?: string, requiere2FA?: boolean}>
  verify2FA: (code: string) => Promise<{success: boolean, mensaje?: string}>
  logout: () => void
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = "http://localhost:8080/api/auth"

// --- Mapea el rol del backend a un valor simple ---
function mapRole(role: string | null) {
  if (role === "ROLE_ADMIN") return "ADMIN";
  if (role === "ROLE_EGRESADO") return "EGRESADO";
  return role;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingUsername, setPendingUsername] = useState<string | null>(null)
  const [pendingPassword, setPendingPassword] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Refresca datos de usuario desde backend
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return;

      const res = await fetch(`${API_BASE}/verificar-token`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const userData: User = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          egresado: data.egresado,
          name: data.egresado?.nombre || data.username
        }
        setUser(userData)
        setRole(data.role)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (err) {
      console.error("Error al refrescar datos de usuario:", err)
    }
  }

  // Solo carga usuario desde backend al montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsLoading(false)
          return;
        }

        const res = await fetch(`${API_BASE}/verificar-token`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()
          const userData: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            egresado: data.egresado,
            name: data.egresado?.nombre || data.username
          }
          setUser(userData)
          setRole(data.role)
          setIsAuthenticated(true)
          localStorage.setItem("user", JSON.stringify(userData))
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setUser(null)
          setRole(null)
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Error al verificar autenticación:", err)
        setError("Error al verificar la autenticación")
        logout()
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname
      const mappedRole = mapRole(role)
      if (isAuthenticated && (path === "/login" || path === "/register" || path === "/")) {
        if (mappedRole === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
      if (!isAuthenticated && path !== "/login" && path !== "/register" && path !== "/") {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, role, router])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.mensaje || "Error al iniciar sesión")
        setIsLoading(false)
        return { success: false, mensaje: data.mensaje }
      }

      if (data.requiere2FA) {
        setPendingUsername(username)
        setPendingPassword(password)
        setIsLoading(false)
        return { success: false, requiere2FA: true }
      }

      localStorage.setItem("token", data.token)

      // Espera a que el backend devuelva el usuario completo
      await refreshUserData()

      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setError("Error al iniciar sesión")
      setIsLoading(false)
      return { success: false, mensaje: "Error al iniciar sesión" }
    }
  }

  const verify2FA = async (code: string) => {
    if (!pendingUsername) {
      setError("No hay intento de inicio de sesión pendiente");
      return { success: false, mensaje: "No hay intento de inicio de sesión pendiente" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/2fa/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: pendingUsername,
          codigo: code
        })
      });

      const data = await res.json();

      if (!res.ok || !data.valido) {
        const errorMsg = data.mensaje || "Código 2FA incorrecto";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, mensaje: errorMsg };
      }

      // Si el código es válido, el backend devuelve un nuevo token
      localStorage.setItem("token", data.token);

      // Limpiamos las credenciales pendientes
      setPendingUsername(null);
      setPendingPassword(null);

      // Refresca los datos del usuario con el nuevo token
      await refreshUserData();

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Error al verificar 2FA:", error);
      setError("Error al verificar el código 2FA");
      setIsLoading(false);
      return { success: false, mensaje: "Error al verificar el código 2FA" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setRole(null)
    setPendingUsername(null)
    setPendingPassword(null)
    setIsAuthenticated(false)
    window.location.href = "/login"
  }

  return (
      <AuthContext.Provider
          value={{
            user,
            setUser,
            role,
            login,
            verify2FA,
            logout,
            isLoading,
            error,
            isAuthenticated,
            refreshUserData
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}