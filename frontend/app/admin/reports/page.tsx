"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Filter } from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminReportPreview } from "@/components/admin/admin-report-preview"
import { ReportesGuardadosTable } from "@/components/admin/ReportesGuardadosTable"

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("empleabilidad")
  const [startDate, setStartDate] = useState("2024-01-01")
  const [endDate, setEndDate] = useState("2024-12-31")
  const [career, setCareer] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [estado, setEstado] = useState("all")
  const [sede, setSede] = useState("all")
  const [savedReports, setSavedReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsuarioId(user.id);
    }
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    setLoadingReports(true);
    const token = localStorage.getItem("token");
    console.log('Frontend - usuarioId:', usuarioId);
    console.log('Frontend - token raw:', token);
    
    if (!token) {
      console.error('Frontend - No hay token disponible');
      setSavedReports([]);
      setLoadingReports(false);
      return;
    }
    
    axios.get(`/api/reportes/guardados/usuario/${usuarioId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('Frontend - response:', res.data);
        setSavedReports(res.data);
      })
      .catch((error) => {
        console.error('Frontend - error:', error.response?.data || error.message);
        setSavedReports([]);
      })
      .finally(() => setLoadingReports(false));
  }, [usuarioId]);

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      setReportGenerated(true)
    }, 1500)
  }

  // Nuevo handler para exportar y guardar reporte
  const handleExportAndSave = async (formato: "pdf" | "excel") => {
    if (!usuarioId) return;
    setIsGenerating(true);
    try {
      // 1. Exportar y guardar archivo en backend
      const params = new URLSearchParams();
      params.append("type", reportType);
      if (career !== "all") params.append("carrera", career);
      if (startDate) params.append("fechaInicio", startDate);
      if (endDate) params.append("fechaFin", endDate);
      if (estado !== "all") params.append("estado", estado);
      if (sede !== "all") params.append("sede", sede);
      params.append("formato", formato);
      const exportRes = await fetch(`/api/reportes/exportar-y-guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (!exportRes.ok) throw new Error("Error al exportar el archivo");
      const exportData = await exportRes.json();
      // 2. Guardar registro del reporte
      const saveRes = await fetch(`/api/reportes/guardados/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          tipoReporte: reportType,
          parametros: JSON.stringify({ career, startDate, endDate, estado, sede }),
          urlArchivo: exportData.urlArchivo,
          estado: "guardado"
        })
      });
      if (!saveRes.ok) throw new Error("Error al guardar el reporte");
      toast({ title: "Reporte exportado y guardado", description: `El archivo se generó correctamente y está disponible en Reportes Guardados.` });
      setReportGenerated(true);
      // Opcional: recargar la tabla de reportes guardados
      setLoadingReports(true);
      axios.get(`/api/reportes/guardados/usuario/${usuarioId}`)
        .then(res => setSavedReports(res.data))
        .finally(() => setLoadingReports(false));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Generación de Reportes</h1>
          </div>
        </header>
        <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container w-full space-y-8 py-8">
          {/* Header mejorado */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-utp-600 to-utp-500 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Generación de Reportes</h1>
                  <p className="text-white/90 text-lg">Crea reportes personalizados y detallados sobre los egresados de la UTP</p>
                </div>
              </div>
              {/* Diferenciación con Dashboard */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
                <p className="text-white/95 text-sm">
                  <strong className="text-white">💡 Diferencia:</strong> Esta sección permite crear reportes específicos con parámetros detallados y guardarlos. 
                  Para análisis visual ejecutivo y KPIs, usa <a href="/admin" className="text-yellow-200 hover:text-yellow-100 underline font-medium">Dashboard Ejecutivo</a>.
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-utp-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-utp-700">
                    <Filter className="h-5 w-5" />
                    Configuración del Reporte
                  </CardTitle>
                  <CardDescription>
                    Configura parámetros detallados para generar reportes específicos que podrás guardar y consultar después.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                  <Label htmlFor="report-type" className="text-sm font-semibold text-gray-700">Tipo de Reporte</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type" className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12">
                      <SelectValue placeholder="Selecciona un tipo de reporte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lista_egresados">Lista de Egresados</SelectItem>
                      <SelectItem value="empleabilidad">Empleabilidad por Carrera</SelectItem>
                      <SelectItem value="salarios">Salarios Promedio</SelectItem>
                      <SelectItem value="genero">Empleabilidad por Género</SelectItem>
                      <SelectItem value="ubicacion">Distribución Geográfica</SelectItem>
                      <SelectItem value="satisfaccion">Satisfacción Laboral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="career" className="text-sm font-semibold text-gray-700">Carrera</Label>
                  <Select value={career} onValueChange={setCareer}>
                    <SelectTrigger id="career" className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12">
                      <SelectValue placeholder="Selecciona una carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Carreras</SelectItem>
                      <SelectItem value="Contabilidad">Contabilidad</SelectItem>
                      <SelectItem value="Ingeniería Electrónica">Ingeniería Electrónica</SelectItem>
                      <SelectItem value="Ingeniería Mecánica">Ingeniería Mecánica</SelectItem>
                      <SelectItem value="Turismo y Hotelería">Turismo y Hotelería</SelectItem>
                      <SelectItem value="Ingeniería de Sistemas">Ingeniería de Sistemas</SelectItem>
                      <SelectItem value="Comunicaciones">Comunicaciones</SelectItem>
                      <SelectItem value="Diseño Gráfico">Diseño Gráfico</SelectItem>
                      <SelectItem value="Economía">Economía</SelectItem>
                      <SelectItem value="Ingeniería Ambiental">Ingeniería Ambiental</SelectItem>
                      <SelectItem value="Administración">Administración</SelectItem>
                      <SelectItem value="Ingeniería de Software">Ingeniería de Software</SelectItem>
                      <SelectItem value="Psicología">Psicología</SelectItem>
                      <SelectItem value="Derecho">Derecho</SelectItem>
                      <SelectItem value="Negocios Internacionales">Negocios Internacionales</SelectItem>
                      <SelectItem value="Ingeniería Biomédica">Ingeniería Biomédica</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Ingeniería Industrial">Ingeniería Industrial</SelectItem>
                      <SelectItem value="Administración y Marketing">Administración y Marketing</SelectItem>
                      <SelectItem value="Ingeniería Civil">Ingeniería Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="estado" className="text-sm font-semibold text-gray-700">Estado Laboral</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger id="estado" className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="EMPLEADO">Empleado</SelectItem>
                      <SelectItem value="DESEMPLEADO">Desempleado</SelectItem>
                      <SelectItem value="EMPRENDEDOR">Emprendedor</SelectItem>
                      <SelectItem value="ESTUDIANDO">Estudiando</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sede" className="text-sm font-semibold text-gray-700">Sede</Label>
                  <Select value={sede} onValueChange={setSede}>
                    <SelectTrigger id="sede" className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12">
                      <SelectValue placeholder="Selecciona una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Sedes</SelectItem>
                      <SelectItem value="Lima">Lima</SelectItem>
                      <SelectItem value="Arequipa">Arequipa</SelectItem>
                      <SelectItem value="Chiclayo">Chiclayo</SelectItem>
                      <SelectItem value="Trujillo">Trujillo</SelectItem>
                      <SelectItem value="Piura">Piura</SelectItem>
                      <SelectItem value="Huancayo">Huancayo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="start-date" className="text-sm font-semibold text-gray-700">Fecha Inicio</Label>
                    <Input 
                      id="start-date" 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="end-date" className="text-sm font-semibold text-gray-700">Fecha Fin</Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-2 border-gray-200 focus:border-utp-500 rounded-xl h-12"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-utp-600 to-utp-500 hover:from-utp-700 hover:to-utp-600 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl" 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generando..." : "Generar Reporte"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <FileText className="h-5 w-5 text-utp-600" />
                      Vista Previa del Reporte
                    </CardTitle>
                    <CardDescription>
                      {reportGenerated
                          ? `Reporte de ${
                              reportType === "empleabilidad"
                                  ? "Empleabilidad por Carrera"
                                  : reportType === "salarios"
                                      ? "Salarios Promedio"
                                      : reportType === "genero"
                                          ? "Empleabilidad por Género"
                                          : reportType === "ubicacion"
                                              ? "Distribución Geográfica"
                                              : "Satisfacción Laboral"
                          }`
                          : "Genera un reporte para ver la vista previa"}
                    </CardDescription>
                  </div>
                  {reportGenerated && (
                      <div className="flex gap-2">

                      </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {reportGenerated ? (
                    <AdminReportPreview
                      reportType={reportType}
                      startDate={startDate}
                      endDate={endDate}
                      career={career}
                      estado={estado}
                      sede={sede}
                      onExported={() => setRefreshTable(r => r + 1)}
                    />
                ) : (
                    <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">Sin reportes generados</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Configura los parámetros y haz clic en "Generar Reporte" para ver la vista previa.
                      </p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

          {/* Tabla de reportes guardados usando el componente correcto */}
          {usuarioId && (
            <ReportesGuardadosTable key={refreshTable} usuarioId={usuarioId} />
          )}
          </div>
        </div>
      </div>
  )
}