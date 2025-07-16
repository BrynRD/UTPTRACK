// ReportExportButton.tsx
"use client"

import { useState } from "react"
import axios from "axios"
import { Download, FileSpreadsheet, FileText, Bookmark } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { toast } from "../ui/use-toast"

interface ReportExportButtonProps {
    reportType: string
    startDate?: string
    endDate?: string
    career?: string
    estado?: string
    sede?: string
    onExported?: () => void
    data?: any[] // Para exportar solo los egresados filtrados (experiencias laborales)
}

const USE_ABSOLUTE_API = true
const API_BASE = USE_ABSOLUTE_API ? "http://localhost:8080" : ""

export function ReportExportButton({ reportType, startDate, endDate, career, estado, sede, onExported, data }: ReportExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (format: string) => {
        try {
            setIsExporting(true)

            const formattedStartDate = startDate && startDate.length === 4
                ? `${startDate}-01-01`
                : startDate;

            const formattedEndDate = endDate && endDate.length === 4
                ? `${endDate}-12-31`
                : endDate;

            const userStr = localStorage.getItem("user");
            if (!userStr) throw new Error("No se encontró el usuario");
            const user = JSON.parse(userStr);
            if (!user.id) throw new Error("No se encontró el ID del usuario");
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No se encontró el token de autenticación");

            // Mapear el tipo de reporte para el backend
            let reportTypeParam = reportType;
            if (reportType === "lista_egresados") {
                reportTypeParam = "egresados";
            }

            // Construir params para exportar y guardar
            const params = new URLSearchParams();
            params.append("type", reportTypeParam);
            if (career && career !== "all") params.append("carrera", career);
            if (estado && estado !== "all") params.append("estado", estado);
            if (sede && sede !== "all") params.append("sede", sede);
            if (formattedStartDate) params.append("fechaInicio", formattedStartDate);
            if (formattedEndDate) params.append("fechaFin", formattedEndDate);
            params.append("formato", format);

            // Si es experiencias_laborales y hay data filtrada, enviar los egresadosIds
            if (reportType === "experiencias_laborales" && Array.isArray(data) && data.length > 0) {
                const egresadosIds = data.map(item => item.egresado.id).join(",");
                params.append("egresadosIds", egresadosIds);
            }

            // 1. Exportar y guardar archivo en backend
            const exportRes = await fetch(`${API_BASE}/api/reportes/exportar-y-guardar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                },
                body: params.toString() + `&usuarioId=${user.id}`,
            });
            if (!exportRes.ok) throw new Error("Error al exportar el archivo");
            const exportData = await exportRes.json();

            // 2. Descargar el archivo automáticamente solo cuando esté disponible
            const filename = exportData.nombreArchivo || (exportData.urlArchivo && exportData.urlArchivo.split('/').pop()) || 'reporte.pdf';
            const forcedDownloadUrl = `${API_BASE}/api/reportes/guardados/descargar-archivo/${filename}`;
            async function waitForFile(url: string, maxTries: number = 10, delay: number = 300): Promise<boolean> {
                for (let i = 0; i < maxTries; i++) {
                    try {
                        const res = await fetch(url, { method: "HEAD" });
                        if (res.ok) return true;
                    } catch {}
                    await new Promise(r => setTimeout(r, delay));
                }
                return false;
            }
            const fileReady = await waitForFile(forcedDownloadUrl);
            if (fileReady) {
                // Descargar usando fetch y blob para máxima compatibilidad
                const res = await fetch(forcedDownloadUrl);
                if (!res.ok) throw new Error("No se pudo descargar el archivo");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                toast({ title: "Archivo no disponible", description: "El archivo aún no está listo para descargar. Intenta desde el historial.", variant: "destructive" });
            }

            // 3. Mostrar toast de éxito
            toast({ title: "Reporte exportado y guardado", description: `El archivo se generó correctamente y está disponible en Reportes Guardados.` });
            // Llamar callback para refrescar la tabla
            if (onExported) onExported();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "No se pudo exportar el reporte.", variant: "destructive" });
        } finally {
            setIsExporting(false)
        }
    }

    const handleGuardar = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return alert("No se encontró el usuario");
        
        const user = JSON.parse(userStr);
        if (!user.id) return alert("No se encontró el ID del usuario");
        
        const token = localStorage.getItem("token");
        if (!token) return alert("No se encontró el token de autenticación");
        
        await fetch("/api/reportes/guardados/guardar", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                usuarioId: user.id,
                tipoReporte: reportType,
                parametros: JSON.stringify({ startDate, endDate, career, estado, sede }),
                urlArchivo: undefined, // Puedes agregar la URL real si la tienes
                estado: "guardado"
            })
        });
        alert("¡Reporte guardado en el historial!");
    };

    return (
        <div className="flex gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                    {isExporting && "..."}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
    )
}