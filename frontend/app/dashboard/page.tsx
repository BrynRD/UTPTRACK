"use client"

import { BookOpen, Briefcase, GraduationCap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmploymentChart } from "@/components/dashboard/employment-chart"
import { SkillsCloud } from "@/components/dashboard/skills-cloud"
import { RecommendedCourses } from "@/components/dashboard/recommended-courses"
import { useAuth } from "@/hooks/use-auth"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [salarioPromedio, setSalarioPromedio] = useState<number | null>(null)
  const [loadingSalario, setLoadingSalario] = useState(true)

  useEffect(() => {
    if (!user?.egresado?.carrera) return
    setLoadingSalario(true)
    fetch(`http://localhost:8080/api/reportes/salario-promedio-real?carrera=${encodeURIComponent(user.egresado.carrera)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
      }
    })
      .then(res => res.json())
      .then(res => {
        setSalarioPromedio(typeof res.salarioPromedio === "number" ? res.salarioPromedio : 0)
      })
      .catch(() => setSalarioPromedio(0))
      .finally(() => setLoadingSalario(false))
  }, [user?.egresado?.carrera])

  // Cargar el script de iconos animados solo una vez
  // (opcional, si aún lo necesitas)
  // useEffect(() => {
  //   if (typeof window !== "undefined" && !document.querySelector('script[src="https://animatedicons.co/scripts/embed-animated-icons.js"]')) {
  //     const script = document.createElement('script')
  //     script.src = "https://animatedicons.co/scripts/embed-animated-icons.js"
  //     script.async = true
  //     document.head.appendChild(script)
  //   }
  // }, [])

  // Contenido del dashboard
  const DashboardContent = () => (
      <div className="w-full space-y-8 py-8 px-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {user?.name || "Egresado"}. Aquí tienes un resumen de tu situación laboral y recomendaciones.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-white p-2 shadow-sm">
            <div className="rounded-full bg-[#eee9fe] p-1.5 text-[#5b36f2]">
              <AnimatedIcon
                  name="Academic Background"
                  token="ac475d79-687b-476d-a896-eabcc36d2f6a"
                  strokeWidth={1.4}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.egresado?.carrera || "Ingeniería de Sistemas"}</p>
              <p className="text-xs text-gray-500">Egresado {user?.egresado?.anoGraduacion || "Año"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Tasa de Empleabilidad</CardTitle>
              <div className="flex items-center justify-center h-6 w-6">
                <AnimatedIcon
                    name="analytics"
                    token="2bdff727-9a4f-41a9-8222-312ccd145207"
                    size={32}
                    strokeWidth={1.6}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">78%</div>
              <p className="text-xs text-gray-500">Egresados de tu carrera empleados</p>
              <Progress value={78} className="mt-2 h-2 bg-gray-100" indicatorClassName="bg-[#5b36f2]" />
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Salario Promedio</CardTitle>
              <div className="flex items-center justify-center h-6 w-6">
                <AnimatedIcon
                    name="Refund"
                    token="2bdff727-9a4f-41a9-8222-312ccd145207"
                    size={32}
                    strokeWidth={1.6}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {loadingSalario ? "Cargando..." : (salarioPromedio && salarioPromedio > 0 ? `S/. ${salarioPromedio.toFixed(0)}` : "Sin datos suficientes")}
              </div>
              <p className="text-xs text-gray-500">Egresados con 1-2 años de experiencia</p>
              <Progress value={salarioPromedio && salarioPromedio > 0 ? Math.min(100, salarioPromedio / 100) : 0} className="mt-2 h-2 bg-gray-100" indicatorClassName="bg-[#5b36f2]" />
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Ofertas Laborales</CardTitle>
              <div className="flex items-center justify-center h-6 w-6">
                <AnimatedIcon
                    name="Vacancy"
                    token="2bdff727-9a4f-41a9-8222-312ccd145207"
                    size={32}
                    strokeWidth={1.6}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">24</div>
              <p className="text-xs text-gray-500">Nuevas ofertas esta semana</p>
              <Progress value={80} className="mt-2 h-2 bg-gray-100" indicatorClassName="bg-[#5b36f2]" />
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Cursos Recomendados</CardTitle>
              <div className="flex items-center justify-center h-6 w-6">
                <AnimatedIcon
                    name="Accreditation"
                    token="ac475d79-687b-476d-a896-eabcc36d2f6a"
                    size={32}
                    strokeWidth={1.6}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">7</div>
              <p className="text-xs text-gray-500">Basados en tu perfil profesional</p>
              <Progress value={70} className="mt-2 h-2 bg-gray-100" indicatorClassName="bg-[#5b36f2]" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="empleabilidad" className="space-y-4">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="empleabilidad" className="data-[state=active]:bg-[#eee9fe] data-[state=active]:text-[#5b36f2]">
              Empleabilidad
            </TabsTrigger>
            <TabsTrigger value="habilidades" className="data-[state=active]:bg-[#eee9fe] data-[state=active]:text-[#5b36f2]">
              Habilidades Demandadas
            </TabsTrigger>
            <TabsTrigger value="recomendaciones" className="data-[state=active]:bg-[#eee9fe] data-[state=active]:text-[#5b36f2]">
              Recomendaciones
            </TabsTrigger>
          </TabsList>
          <TabsContent value="empleabilidad" className="space-y-4">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Estadísticas de Empleabilidad</CardTitle>
                <CardDescription className="text-gray-500">Porcentaje de egresados empleados vs. desempleados por año</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <EmploymentChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="habilidades" className="space-y-4">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Habilidades más Demandadas</CardTitle>
                <CardDescription className="text-gray-500">Las habilidades más solicitadas en tu área profesional</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <SkillsCloud />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recomendaciones" className="space-y-4">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Cursos y Certificaciones Recomendadas</CardTitle>
                <CardDescription className="text-gray-500">Basado en tu perfil y las tendencias del mercado</CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendedCourses />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )

  return (
      <ProtectedRoute>
        <div className="flex h-full w-full flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="container mx-auto py-4">
              <DashboardContent />
            </div>
          </div>
        </div>
      </ProtectedRoute>
  )
}