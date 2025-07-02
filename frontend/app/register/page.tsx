"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Info } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    institucion: "Universidad Tecnológica del Perú", 
    codigoInstitucional: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  useEffect(() => {
    if (formData.codigoInstitucional) {
      setFormData(prev => ({ 
        ...prev, 
        email: `${formData.codigoInstitucional}@utp.edu.pe`
      }));
    }
  }, [formData.codigoInstitucional]);

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

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
    if (!formData.codigoInstitucional.trim()) newErrors.codigoInstitucional = "El código institucional es requerido"

    if (!formData.codigoInstitucional.match(/^U\d{7}$/)) {
      newErrors.codigoInstitucional = "El código debe tener formato Uxxxxxxx (U seguido de 7 dígitos)"
    }

    if (!formData.email) {
      newErrors.email = "El email es generado automáticamente con tu código"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // Simulando registro exitoso
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push("/login")
    } catch (error: any) {
      console.error('Error al registrar usuario:', error)
      setErrors({
        submit: 'Error al registrar usuario. Por favor intenta nuevamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block md:w-1/2">
        <div className="h-full flex items-center justify-center">
          <div className="w-[95%] p-6">
            <Image
              src="/login.svg"
              alt="Registro illustration"
              width={800}
              height={800}
              className="w-full h-auto"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>
    
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 bg-white rounded-l-3xl md:h-screen overflow-y-auto">
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
            <p className="text-gray-500 whitespace-nowrap">Datos, empleabilidad y proyección profesional</p>
          </div>
          
          <p className="text-gray-700 mb-4 whitespace-nowrap">Completa tus datos para crear una cuenta.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700 font-medium whitespace-nowrap">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ingresa tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="border-gray-300 rounded-md h-12"
                />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-700 font-medium whitespace-nowrap">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  placeholder="Ingresa tu apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="border-gray-300 rounded-md h-12"
                />
                {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoInstitucional" className="text-gray-700 font-medium whitespace-nowrap">Código Institucional</Label>
              <Input
                id="codigoInstitucional"
                name="codigoInstitucional"
                placeholder="Ej: U2210133"
                value={formData.codigoInstitucional}
                onChange={handleChange}
                className="border-gray-300 rounded-md h-12"
              />
              {errors.codigoInstitucional ? (
                <p className="text-sm text-red-500">{errors.codigoInstitucional}</p>
              ) : (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Info size={14} className="mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    Formato: Uxxxxxxx (U seguido de 7 dígitos)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium whitespace-nowrap">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                readOnly
                placeholder="El correo se generará automáticamente"
                value={formData.email}
                className="border-gray-300 rounded-md h-12 bg-gray-50"
              />
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Info size={14} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">El correo se genera automáticamente con tu código institucional</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium whitespace-nowrap">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium whitespace-nowrap">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="border-gray-300 rounded-md h-12 pr-10"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
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
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
            
            <div className="mt-4 flex justify-center">
              <p className="text-sm text-gray-600 whitespace-nowrap">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-[#5b36f2] font-medium hover:underline">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}