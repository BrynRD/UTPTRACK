"use client"

import { BarChart3, Briefcase, FileText, Users, AlertCircle, Download } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminEmploymentChart } from "@/components/admin/admin-employment-chart"
import { AdminGraduatesMap } from "@/components/admin/admin-graduates-map"
import { AdminRecentSurveys } from "@/components/admin/admin-recent-surveys"
import { AdminTrendChart } from "@/components/admin/admin-trend-chart"
import { useAuth } from "@/hooks/use-auth"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { stats, loading, error } = useDashboardStats()

  const handleExportDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/reportes/exportar-dashboard?type=resumen&formato=pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-resumen-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error al exportar dashboard:', error)
      alert('Error al exportar el dashboard')
    }
  }

  return (
      <ProtectedRoute requiredRoles={["ADMIN"]}>
        {/* Header elegante con estilo UTP - Color exacto */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(91, 54, 242), rgb(91, 54, 242))' }}>
          <div className="p-6 shadow-lg">
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(91, 54, 242, 0.95), rgba(91, 54, 242, 0.95))' }}></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full -translate-y-32 -translate-x-32"></div>
            
            {/* Contenido del header */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-white hover:bg-white/20" />
                <Separator orientation="vertical" className="mr-2 h-6 bg-white/30" />
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white/20 backdrop-blur-sm p-3 shadow-lg border border-white/30">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo</h1>
                  <p className="text-purple-100">Analiza los datos de egresados con visualizaciones interactivas y KPIs en tiempo real.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-white via-purple-25 to-purple-50 min-h-screen">
          {/* Guía de navegación simplificada con efectos */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 via-white to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg">
            {/* Efectos de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/40 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Panel de Control UTP</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <strong className="text-gray-900">Dashboard Completo</strong>
                    </div>
                    <p>Vista ejecutiva con KPIs, gráficos interactivos, tendencias temporales y análisis visual completo.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <strong className="text-gray-900">Generación de Reportes</strong>
                    </div>
                    <p>Crea documentos detallados y personalizados con filtros específicos para informes oficiales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">
                Bienvenido, {user?.name || "Administrador"}. Aquí tienes un resumen de los KPIs de egresados.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleExportDashboard}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4 text-purple-600" />
                Exportar Dashboard
              </Button>
            </div>
          </div>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar los datos: {error}. Mostrando datos de ejemplo.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Efecto de brillo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-xl"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Total de Egresados</CardTitle>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(91, 54, 242, 0.1)' }}>
                  <Users className="h-5 w-5" style={{ color: 'rgb(91, 54, 242)' }} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats?.totalEgresados?.toLocaleString() || "0"
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Egresados registrados en el sistema
                </p>
                <Progress 
                  value={loading ? 0 : Math.min(100, (stats?.totalEgresados || 0) / 50)} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Efecto de brillo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-xl"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Tasa de Empleabilidad</CardTitle>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(91, 54, 242, 0.1)' }}>
                  <Briefcase className="h-5 w-5" style={{ color: 'rgb(91, 54, 242)' }} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    `${(stats?.tasaEmpleabilidad || 0).toFixed(1)}%`
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {loading ? "Cargando..." : `${stats?.totalEmpleados || 0} empleados de ${(stats?.totalEmpleados || 0) + (stats?.totalDesempleados || 0)} encuestados`}
                </p>
                <Progress 
                  value={loading ? 0 : (stats?.tasaEmpleabilidad || 0)} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Efecto de brillo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-xl"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Encuestas Completadas</CardTitle>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(91, 54, 242, 0.1)' }}>
                  <FileText className="h-5 w-5" style={{ color: 'rgb(91, 54, 242)' }} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    stats?.encuestasCompletadas?.toLocaleString() || "0"
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {loading ? "Cargando..." : `${(stats?.participacionEncuestas || 0).toFixed(1)}% de participación`}
                </p>
                <Progress 
                  value={loading ? 0 : (stats?.participacionEncuestas || 0)} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Efecto de brillo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-xl"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Satisfacción Laboral</CardTitle>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(91, 54, 242, 0.1)' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: 'rgb(91, 54, 242)' }} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    `${(stats?.satisfaccionPromedio || 0).toFixed(1)}/5`
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Promedio de satisfacción laboral
                </p>
                <Progress 
                  value={loading ? 0 : ((stats?.satisfaccionPromedio || 0) / 5) * 100} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="empleabilidad" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-purple-200 shadow-sm">
              <TabsTrigger value="empleabilidad" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">Empleabilidad por Carrera</TabsTrigger>
              <TabsTrigger value="mapa" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">Distribución Geográfica</TabsTrigger>
              <TabsTrigger value="tendencias" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">Tendencias Temporales</TabsTrigger>
              <TabsTrigger value="encuestas" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">Encuestas Recientes</TabsTrigger>
            </TabsList>
            <TabsContent value="empleabilidad" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="text-purple-900">Tasa de Empleabilidad por Carrera</CardTitle>
                  <CardDescription className="text-purple-700">Porcentaje de egresados empleados por carrera en los últimos 5 años</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] p-6">
                  <AdminEmploymentChart />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mapa" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-blue-900">Distribución Geográfica de Egresados</CardTitle>
                  <CardDescription className="text-blue-700">Ubicación de egresados empleados por sedes de la UTP</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-6">
                  <AdminGraduatesMap />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tendencias" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="text-indigo-900">Tendencias de Empleabilidad en el Tiempo</CardTitle>
                  <CardDescription className="text-indigo-700">Evolución de la empleabilidad por períodos académicos</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] p-6">
                  <AdminTrendChart />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="encuestas" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
                  <CardTitle className="text-amber-900">Encuestas Recientes</CardTitle>
                  <CardDescription className="text-amber-700">Resultados de las últimas encuestas enviadas a egresados</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <AdminRecentSurveys />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ProtectedRoute>
  )
}