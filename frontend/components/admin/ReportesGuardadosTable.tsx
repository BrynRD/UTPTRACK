import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReporteGuardado {
  id: string;
  tipoReporte: string;
  parametros: string;
  fechaGeneracion: string;
  urlArchivo?: string;
  estado: string;
  usuario: { username: string };
}

interface Props {
  usuarioId: string;
}

export const ReportesGuardadosTable: React.FC<Props> = ({ usuarioId }) => {
  const [reportes, setReportes] = useState<ReporteGuardado[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(reportes.length / pageSize);
  const paginatedReportes = reportes.slice((page - 1) * pageSize, page * pageSize);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/reportes/guardados/usuario/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportes(res.data);
    } catch (e) {
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
    // eslint-disable-next-line
  }, [usuarioId]);

  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Eliminar este reporte guardado?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`/api/reportes/guardados/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReportes();
  };

  return (
    <div className="mt-8">
      <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <div className="bg-gradient-to-r from-utp-50 to-blue-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-utp-700 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes Guardados
          </h3>
          <p className="text-gray-600 text-sm mt-1">Historial de reportes generados y exportados</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-utp-600"></div>
              <span className="ml-3 text-gray-600">Cargando reportes...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Filtros aplicados</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Generado por</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReportes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-2" />
                            <p>No hay reportes guardados.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedReportes.map((r, index) => (
                        <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-utp-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">{r.tipoReporte}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {(() => {
                              let params = null;
                              try {
                                params = r.parametros ? JSON.parse(r.parametros) : null;
                              } catch (e) {}
                              if (!params) return <span className="text-xs text-gray-400">Sin filtros</span>;
                              const filtros = [];
                              if (params.career && params.career !== "all") filtros.push(`Carrera: ${params.career}`);
                              if (params.estado && params.estado !== "all") filtros.push(`Estado: ${params.estado}`);
                              if (params.sede && params.sede !== "all") filtros.push(`Sede: ${params.sede}`);
                              if (params.startDate) filtros.push(`Desde: ${params.startDate}`);
                              if (params.endDate) filtros.push(`Hasta: ${params.endDate}`);
                              return filtros.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {filtros.map((filtro, i) => (
                                    <span key={i} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                                      {filtro}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Sin filtros</span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                            {new Date(r.fechaGeneracion).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                            {r.usuario?.username || "-"}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <Badge 
                              variant={r.estado === "guardado" ? "default" : "secondary"}
                              className={r.estado === "guardado" ? "bg-green-100 text-green-800" : ""}
                            >
                              {r.estado}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div className="flex gap-2 items-center">
                              <TooltipProvider>
                                {r.urlArchivo ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
                                        asChild
                                      >
                                        <a
                                          href={`http://localhost:8080/api/reportes/guardados/descargar-archivo/${r.urlArchivo.split('/').pop()}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Download className="h-4 w-4 text-blue-600" />
                                        </a>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Descargar archivo</TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
                                        disabled
                                      >
                                        <Download className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Archivo no disponible</TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                                      onClick={() => handleEliminar(r.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Eliminar reporte</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-2"
                  >
                    ← Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-2"
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};