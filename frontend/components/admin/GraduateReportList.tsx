"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface GraduateReportListProps {
    carrera?: string
    fechaInicio?: string
    fechaFin?: string
    estado?: string
    sede?: string
}

// Cambia a true si quieres forzar la URL absoluta (útil para desarrollo local)
const USE_ABSOLUTE_API = true
const API_BASE = USE_ABSOLUTE_API ? "http://localhost:8080" : ""

export function GraduateReportList({ carrera, fechaInicio, fechaFin, estado, sede }: GraduateReportListProps) {
    const [graduates, setGraduates] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchGraduates = async () => {
            setLoading(true);
            setError(false);
            try {
                let baseUrl = `${API_BASE}/api/reportes/egresados?`;
                let queryParams = [];

                if (carrera && carrera !== "all") queryParams.push(`carrera=${encodeURIComponent(carrera)}`);

                if (fechaInicio) {
                    const formattedFechaInicio = fechaInicio.length === 4
                        ? `${fechaInicio}-01-01`
                        : fechaInicio;
                    queryParams.push(`fechaInicio=${encodeURIComponent(formattedFechaInicio)}`);
                }

                if (fechaFin) {
                    const formattedFechaFin = fechaFin.length === 4
                        ? `${fechaFin}-12-31`
                        : fechaFin;
                    queryParams.push(`fechaFin=${encodeURIComponent(formattedFechaFin)}`);
                }

                if (estado && estado !== "all") queryParams.push(`estado=${encodeURIComponent(estado)}`);
                if (sede && sede !== "all") queryParams.push(`sede=${encodeURIComponent(sede)}`);

                queryParams.push(`page=${currentPage}`);
                queryParams.push("size=10");

                const url = baseUrl + queryParams.join('&');
                console.log(`Realizando petición a: ${url}`);

                // Obtener el token y agregarlo al header
                const token = localStorage.getItem("token");
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data && response.data.content) {
                    setGraduates(response.data.content);
                    setTotalPages(response.data.totalPages);
                } else {
                    setGraduates([]);
                    setTotalPages(0);
                }
            } catch (error) {
                console.error("Error al cargar datos de egresados:", error);
                setGraduates([]);
                setTotalPages(0);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchGraduates();
    }, [carrera, fechaInicio, fechaFin, estado, sede, currentPage]);

    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Error al cargar datos. Intente de nuevo más tarde.</p>
            </div>
        )
    }

    if (graduates.length === 0) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No se encontraron egresados con los criterios seleccionados.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Carrera</TableHead>
                        <TableHead>Año Egreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Sede</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {graduates.map((graduate: any) => (
                        <TableRow key={graduate.id}>
                            <TableCell className="font-medium">{graduate.nombre}</TableCell>
                            <TableCell>{graduate.carrera}</TableCell>
                            <TableCell>{graduate.anioEgreso}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    graduate.estadoLaboral === 'EMPLEADO'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {graduate.estadoLaboral}
                                </span>
                            </TableCell>
                            <TableCell>{graduate.sede}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                            >
                                Anterior
                            </Button>
                        </PaginationItem>
                        <PaginationItem className="px-2">
                            {currentPage + 1} de {totalPages}
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p < totalPages - 1 ? p + 1 : p)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Siguiente
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}