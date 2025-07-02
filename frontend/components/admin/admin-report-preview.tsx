"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { ReportExportButton } from "./ReportExportButton"
import {
    Bar,
    BarChart,
    CartesianGrid, Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { GraduateReportList } from "./GraduateReportList"

interface AdminReportPreviewProps {
    reportType: string
    startDate?: string
    endDate?: string
    career?: string
    estado?: string
    sede?: string
    onExported?: () => void
}

// Cambia esto a true si quieres forzar el uso de la URL absoluta (útil para pruebas locales)
const USE_ABSOLUTE_API = true
const API_BASE = USE_ABSOLUTE_API ? "http://localhost:8080" : ""

export function AdminReportPreview({
                                       reportType,
                                       startDate = "2010-01-01",  // Fecha inicial por defecto cambiada a 2010
                                       endDate = new Date().getFullYear() + "-12-31", // Fecha final dinámica al año actual
                                       career = "all",
                                       estado = "all",
                                       sede = "all",
                                       onExported
                                   }: AdminReportPreviewProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Obtener el token para autenticación
    const getToken = () => {
        return localStorage.getItem("token");
    }

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Formatear las fechas para la API (YYYY-MM-DD)
                const formattedStartDate = startDate && startDate.length === 4
                    ? `${startDate}-01-01`
                    : startDate;

                const formattedEndDate = endDate && endDate.length === 4
                    ? `${endDate}-12-31`
                    : endDate;

                let url = "";
                const token = getToken();

                // Construir query params comunes
                const params = [];
                if (career && career !== "all") params.push(`carrera=${encodeURIComponent(career)}`);
                if (estado && estado !== "all") params.push(`estado=${encodeURIComponent(estado)}`);
                if (sede && sede !== "all") params.push(`sede=${encodeURIComponent(sede)}`);
                if (formattedStartDate) params.push(`fechaInicio=${encodeURIComponent(formattedStartDate)}`);
                if (formattedEndDate) params.push(`fechaFin=${encodeURIComponent(formattedEndDate)}`);
                const queryString = params.length > 0 ? `?${params.join("&")}` : "";

                switch (reportType) {
                    case "empleabilidad":
                        url = `${API_BASE}/api/reportes/empleabilidad${queryString}`;
                        break;
                    case "genero":
                        url = `${API_BASE}/api/reportes/genero${queryString}`;
                        break;
                    case "salarios":
                        url = `${API_BASE}/api/reportes/salarios${queryString}`;
                        break;
                    case "satisfaccion":
                        url = `${API_BASE}/api/reportes/satisfaccion${queryString}`;
                        break;
                    default:
                        setLoading(false)
                        return;
                }

                console.log(`Realizando petición a: ${url}`);

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setData(response.data)
            } catch (error) {
                console.error(`Error al cargar datos de ${reportType}:`, error)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        if (reportType !== "lista_egresados") {
            fetchData()
        } else {
            setLoading(false)
        }
    }, [reportType, startDate, endDate, career, estado, sede, isMounted])

    if (!isMounted) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-sm text-muted-foreground">Cargando datos del reporte...</p>
            </div>
        )
    }

    if (reportType === "empleabilidad") {
        const chartData = Array.isArray(data) && data.length > 0 ? data : [
            { name: "Ing. Sistemas", empleados: 85, desempleados: 15 },
            { name: "Ing. Industrial", empleados: 80, desempleados: 20 },
            { name: "Ing. Civil", empleados: 75, desempleados: 25 },
            { name: "Administración", empleados: 70, desempleados: 30 },
            { name: "Contabilidad", empleados: 78, desempleados: 22 },
            { name: "Marketing", empleados: 65, desempleados: 35 },
        ];
        // Calcular totales para el resumen
        const totalEmpleados = chartData.reduce((acc, curr) => acc + (curr.empleados || 0), 0);
        const totalDesempleados = chartData.reduce((acc, curr) => acc + (curr.desempleados || 0), 0);
        return (
            <div className="h-[400px]">
                <div className="mb-4 flex justify-end">
                    <ReportExportButton
                        reportType="empleabilidad"
                        startDate={startDate}
                        endDate={endDate}
                        career={career}
                        estado={estado}
                        sede={sede}
                        onExported={onExported}
                    />
                </div>
                <ResponsiveContainer width="100%" height="75%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="empleados" name="Empleados (%)" fill="#5b36f2" />
                        <Bar dataKey="desempleados" name="Desempleados (%)" fill="#a78bfa" />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap gap-4 justify-center text-sm font-medium">
                    <span className="text-[#5b36f2]">Total empleados: {totalEmpleados}</span>
                    <span className="text-[#a78bfa]">Total desempleados: {totalDesempleados}</span>
                </div>
            </div>
        )
    }

    if (reportType === "salarios") {
        const chartData = Array.isArray(data) && data.length > 0 ? data : [];
        // Calcular promedio
        const totalSalarios = chartData.reduce((acc, curr) => acc + (curr.salario || 0), 0);
        const promedioSalario = chartData.length > 0 ? (totalSalarios / chartData.length) : 0;
        if (chartData.length === 0) {
            return (
                <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No hay datos suficientes para mostrar el gráfico de salarios.</p>
                </div>
            );
        }
        return (
            <div className="h-[400px]">
                <div className="mb-4 flex justify-end">
                    <ReportExportButton
                        reportType="salarios"
                        startDate={startDate}
                        endDate={endDate}
                        career={career}
                        estado={estado}
                        sede={sede}
                        onExported={onExported}
                    />
                </div>
                <ResponsiveContainer width="100%" height="75%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="salario" name="Salario Promedio (S/.)" fill="#5b36f2" />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap gap-4 justify-center text-sm font-medium">
                    <span className="text-[#5b36f2]">Promedio salario: S/ {promedioSalario.toFixed(2)}</span>
                </div>
            </div>
        )
    }

    if (reportType === "lista_egresados") {
        return (
            <div className="h-[400px] overflow-y-auto">
                <div className="mb-4 flex justify-end">
                    <ReportExportButton
                        reportType="lista_egresados"
                        startDate={startDate}
                        endDate={endDate}
                        career={career}
                        estado={estado}
                        sede={sede}
                        onExported={onExported}
                    />
                </div>
                <GraduateReportList
                    carrera={career !== "all" ? career : undefined}
                    fechaInicio={startDate}
                    fechaFin={endDate}
                    estado={estado !== "all" ? estado : undefined}
                    sede={sede !== "all" ? sede : undefined}
                />
            </div>
        )
    }

    if (reportType === "satisfaccion") {
        const chartData = Array.isArray(data) && data.length > 0
            ? data.map((item: any) => ({
                name: item.carrera || item.name,
                satisfaccion: item.satisfaccion || item.value || item.satisfaccionFormacion
            }))
            : [];
        // Calcular promedio
        const totalSatisfaccion = chartData.reduce((acc, curr) => acc + (curr.satisfaccion || 0), 0);
        const promedioSatisfaccion = chartData.length > 0 ? (totalSatisfaccion / chartData.length) : 0;
        if (chartData.length === 0) {
            return (
                <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No hay datos suficientes para mostrar el gráfico de satisfacción.</p>
                </div>
            );
        }
        // Si solo hay una barra, hacer el gráfico más angosto y la barra más delgada
        const isSingleBar = chartData.length === 1;
        return (
            <div className="h-[400px]">
                <div className="mb-4 flex justify-end">
                    <ReportExportButton
                        reportType="satisfaccion"
                        startDate={startDate}
                        endDate={endDate}
                        career={career}
                        estado={estado}
                        sede={sede}
                        onExported={onExported}
                    />
                </div>
                <div style={{ width: isSingleBar ? 400 : '100%', margin: '0 auto' }}>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            barCategoryGap={isSingleBar ? 60 : 20}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                            <Bar dataKey="satisfaccion" name="Nivel de Satisfacción (1-5)" fill="#5b36f2" barSize={isSingleBar ? 60 : 40} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 justify-center text-sm font-medium">
                    <span className="text-[#5b36f2]">Promedio satisfacción: {promedioSatisfaccion.toFixed(2)}</span>
                </div>
            </div>
        )
    }

    if (reportType === "genero") {
        // Formatear datos para PieChart
        const formattedData = Array.isArray(data) && data.length > 0
            ? data.map((item: any) => ({ name: item.genero || item.name, value: item.cantidad || item.value }))
            : [
                { name: "Masculino", value: 60 },
                { name: "Femenino", value: 40 },
            ];
        const total = formattedData.reduce((acc, curr) => acc + (curr.value || 0), 0);
        return (
            <div className="h-[400px]">
                <div className="mb-4 flex justify-end">
                    <ReportExportButton
                        reportType="genero"
                        startDate={startDate}
                        endDate={endDate}
                        career={career}
                        estado={estado}
                        sede={sede}
                        onExported={onExported}
                    />
                </div>
                <ResponsiveContainer width="100%" height="75%">
                    <PieChart>
                        <Pie
                            data={formattedData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#5b36f2"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {formattedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? "#5b36f2" : "#a78bfa"}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap gap-4 justify-center text-sm font-medium">
                    <span className="text-[#5b36f2]">Total: {total}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="3" x2="21" y1="15" y2="15" />
                    <line x1="9" x2="9" y1="3" y2="21" />
                    <line x1="15" x2="15" y1="3" y2="21" />
                </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Vista Previa no Disponible</h3>
            <p className="text-sm text-muted-foreground">
                La vista previa para este tipo de reporte no está disponible en este momento.
            </p>
        </div>
    )
}