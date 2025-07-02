"use client"

import { useState } from "react"
import { BarChart3, Download, Filter, TrendingUp, Users, Calendar } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminEmploymentChart } from "@/components/admin/admin-employment-chart"
import { AdminGraduatesMap } from "@/components/admin/admin-graduates-map"
import { AdminTrendChart } from "@/components/admin/admin-trend-chart"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EstadisticasPage() {
  const { user } = useAuth()
  const { stats, loading } = useDashboardStats()
  const [selectedCarrera, setSelectedCarrera] = useState<string>("todas")
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("ultimo-ano")
  const [dateRange, setDateRange] = useState<any>(null)

  const handleExportDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        type: 'dashboard-completo',
        formato: 'pdf',
        carrera: selectedCarrera !== 'todas' ? selectedCarrera : '',
        periodo: selectedPeriodo
      })
      
      const response = await fetch(`http://localhost:8080/api/reportes/exportar-dashboard?${params}`, {
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
        a.download = `dashboard-estadisticas-${new Date().toISOString().split('T')[0]}.pdf`
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

  const handleExportChart = async (chartType: string, format: string) => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        type: chartType,
        formato: format,
        carrera: selectedCarrera !== 'todas' ? selectedCarrera : ''
      })
      
      const response = await fetch(`http://localhost:8080/api/reportes/exportar-grafico?${params}`, {
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
        a.download = `grafico-${chartType}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error al exportar gráfico:', error)
      alert('Error al exportar el gráfico')
    }
  }

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard de Estadísticas</h1>
        </div>
      </header>
      
      <div className="flex-1 space-y-6 p-6">
        {/* Header explicativo */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard de Estadísticas</h2>
              <p className="text-gray-600 mb-3">
                Vista ejecutiva con KPIs principales y gráficos interactivos para análisis en tiempo real de todos los egresados.
              </p>
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-gray-700">
                  <strong>¿Necesitas reportes detallados?</strong> Usa la sección <a href="/admin/reports" className="text-blue-600 hover:underline font-medium">"Reportes"</a> para crear documentos personalizados con filtros específicos y guardarlos para uso posterior.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Exportación
            </CardTitle>
            <CardDescription>
              Personaliza las estadísticas y exporta reportes con gráficos interactivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Carrera</label>
                <Select value={selectedCarrera} onValueChange={setSelectedCarrera}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las carreras</SelectItem>
                    <SelectItem value="Ingeniería de Sistemas">Ing. Sistemas</SelectItem>
                    <SelectItem value="Ingeniería Industrial">Ing. Industrial</SelectItem>
                    <SelectItem value="Ingeniería Civil">Ing. Civil</SelectItem>
                    <SelectItem value="Administración">Administración</SelectItem>
                    <SelectItem value="Contabilidad">Contabilidad</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultimo-ano">Último año</SelectItem>
                    <SelectItem value="ultimos-2-anos">Últimos 2 años</SelectItem>
                    <SelectItem value="ultimos-5-anos">Últimos 5 años</SelectItem>
                    <SelectItem value="todos">Todos los períodos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Acciones</label>
                <div className="flex gap-2">
                  <Button onClick={handleExportDashboard} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Egresados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : (stats?.totalEgresados?.toLocaleString() || "0")}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCarrera !== 'todas' ? `Carrera: ${selectedCarrera}` : 'Todas las carreras'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Empleabilidad</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${(stats?.tasaEmpleabilidad || 0).toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Período: {selectedPeriodo.replace('-', ' ')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${(stats?.satisfaccionPromedio || 0).toFixed(1)}/5`}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio general
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respuestas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : (stats?.encuestasCompletadas?.toLocaleString() || "0")}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${(stats?.participacionEncuestas || 0).toFixed(1)}% participación`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y análisis detallados */}
        <Tabs defaultValue="empleabilidad" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empleabilidad">Empleabilidad</TabsTrigger>
            <TabsTrigger value="geografico">Distribución Geográfica</TabsTrigger>
            <TabsTrigger value="tendencias">Tendencias Temporales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="empleabilidad" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Empleabilidad por Carrera</CardTitle>
                  <CardDescription>
                    Porcentaje de empleabilidad filtrado por carrera y período seleccionado
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('empleabilidad', 'pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('empleabilidad', 'excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <AdminEmploymentChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="geografico" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Distribución Geográfica</CardTitle>
                  <CardDescription>
                    Ubicación de egresados empleados por región
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('geografico', 'pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('geografico', 'excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <AdminGraduatesMap />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tendencias" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tendencias Temporales</CardTitle>
                  <CardDescription>
                    Evolución de la empleabilidad y satisfacción a lo largo del tiempo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('tendencias', 'pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportChart('tendencias', 'excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <AdminTrendChart carrera={selectedCarrera} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
