"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import {AnimatedIcon} from "@/components/ui/animated-icon";

export default function LoginPage() {
  const router = useRouter()
  const { login, verify2FA, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    codigoOTP: ""
  })

  const [loginStep, setLoginStep] = useState("credentials") // credentials, otp
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (loginStep === "credentials") {
      if (!formData.username.trim()) {
        newErrors.username = "El código institucional es requerido"
      } else if (!formData.username.match(/^U\d{8}$/) && formData.username !== "admin") {
        newErrors.username = "Formato inválido. Ejemplo: U22210133 o admin"
      }

      if (!formData.password) {
        newErrors.password = "La contraseña es requerida"
      }
    } else if (loginStep === "otp") {
      if (!formData.codigoOTP) {
        newErrors.codigoOTP = "El código de verificación es requerido"
      } else if (formData.codigoOTP.length !== 6 || !/^\d+$/.test(formData.codigoOTP)) {
        newErrors.codigoOTP = "El código debe contener 6 dígitos"
      }
    }

    return newErrors
  }

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await login(formData.username, formData.password)

      if (result.requiere2FA) {
        setLoginStep("otp")
        return
      }

      if (!result.success) {
        setErrors({ submit: result.mensaje || "Error al iniciar sesión" })
        return
      }

      // El contexto ya redirige automáticamente según el rol

    } catch (error: any) {
      setErrors({
        submit: error.message || "Error al iniciar sesión. Verifica tus credenciales."
      })
    }
  }

  const handleSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await verify2FA(formData.codigoOTP);

    if (!result.success) {
      setErrors({ submit: result.mensaje || "Código de verificación inválido" });
      return;
    }

    // El contexto ya redirige automáticamente según el rol
  }

  const renderCredentialsForm = () => (
      <form onSubmit={handleSubmitCredentials} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700 font-medium whitespace-nowrap">Código UTP</Label>
          <Input
              id="username"
              name="username"
              placeholder="Ingresa tu usuario"
              value={formData.username}
              onChange={handleChange}
              className="border-gray-300 rounded-md h-12"
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password" className="text-gray-700 font-medium whitespace-nowrap">Contraseña</Label>
            <Link href="/recuperar-password" className="text-sm text-[#5b36f2] hover:underline whitespace-nowrap">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleChange}
                className="border-gray-300 rounded-md h-12 pr-10"
            />
            <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {errors.submit && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
        )}

        <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
        >
          {isLoading ? "Verificando..." : "Iniciar Sesión"}
        </Button>
      </form>
  )

  const renderOTPForm = () => (
      <form onSubmit={handleSubmitOTP} className="space-y-6">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-[#eee9fe] p-4">
            <AnimatedIcon
                name="Face Id"
                token="3860ecda-3dc3-460a-94e4-0c88f5040813"
                size={65}
                strokeWidth={1.8}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Verificación de dos factores</h2>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa el código de 6 dígitos de tu aplicación de autenticación
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigoOTP" className="text-gray-700 font-medium whitespace-nowrap">Código de verificación</Label>
          <Input
              id="codigoOTP"
              name="codigoOTP"
              placeholder="000000"
              value={formData.codigoOTP}
              onChange={handleChange}
              className="border-gray-300 rounded-md h-12 text-center text-lg tracking-wider"
              maxLength={6}
          />
          {errors.codigoOTP && <p className="text-sm text-red-500">{errors.codigoOTP}</p>}
        </div>

        {errors.submit && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
        )}

        <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
        >
          {isLoading ? "Verificando..." : "Verificar"}
        </Button>

        <button
            type="button"
            onClick={() => setLoginStep("credentials")}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
        >
          Volver al inicio de sesión
        </button>
      </form>
  )

  return (
      <div className="flex min-h-screen">
        <div className="hidden md:block md:w-1/2">
          <div className="h-full flex items-center justify-center">
            <div className="w-[95%] p-6">
              <Image
                  src="/login.svg"
                  alt="Login illustration"
                  width={800}
                  height={800}
                  className="w-full h-auto"
                  quality={100}
                  priority
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 bg-white rounded-l-3xl md:h-screen">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <Link href="/">
                <Image
                    src="/logo.png"
                    alt="UTP+class"
                    width={240}
                    height={60}
                    className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 font-['Lato',sans-serif] whitespace-nowrap">Seguimiento para egresados UTP</h1>
              <p className="text-gray-500">Inicia sesión para continuar</p>
            </div>

            {loginStep === "credentials" ? renderCredentialsForm() : renderOTPForm()}

            {loginStep === "credentials" && (
                <div className="mt-4 flex justify-center">
                  <p className="text-sm text-gray-600 whitespace-nowrap">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/register" className="text-[#5b36f2] font-medium hover:underline">
                      Regístrate
                    </Link>
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}