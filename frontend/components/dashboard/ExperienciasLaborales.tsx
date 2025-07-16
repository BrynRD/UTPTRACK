"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
    Building, 
    Calendar, 
    DollarSign, 
    Edit2, 
    Plus, 
    X, 
    Check, 
    Trash2,
    MapPin,
    Clock,
    Briefcase
} from "lucide-react";
import type { ExperienciaLaboral } from "@/app/types/egresado-data";

interface ExperienciasLaboralesProps {
    experiencias: ExperienciaLaboral[];
    egresadoId: string;
    onExperienciasChange: (experiencias: ExperienciaLaboral[]) => void;
}

export default function ExperienciasLaborales({ 
    experiencias, 
    egresadoId, 
    onExperienciasChange 
}: ExperienciasLaboralesProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newExperiencia, setNewExperiencia] = useState<Partial<ExperienciaLaboral>>({
        empresa: "",
        puesto: "",
        fechaInicio: "",
        fechaFin: "",
        salario: null,
        descripcion: ""
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    };

    const formatSalary = (salary: number | null) => {
        if (!salary) return "No especificado";
        return `S/ ${salary.toLocaleString('es-PE')}`;
    };

    const isCurrentlyWorking = (fechaFin: string | null) => {
        return !fechaFin || fechaFin === "";
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const experienciaData = {
                ...newExperiencia,
                idEgresado: egresadoId,
                salario: newExperiencia.salario ? Number(newExperiencia.salario) : null
            };

            const response = await fetch('http://localhost:8080/api/experiencias-laborales', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(experienciaData)
            });

            if (response.ok) {
                const savedExperiencia = await response.json();
                onExperienciasChange([...experiencias, savedExperiencia]);
                setNewExperiencia({
                    empresa: "",
                    puesto: "",
                    fechaInicio: "",
                    fechaFin: "",
                    salario: null,
                    descripcion: ""
                });
                setIsAdding(false);
            }
        } catch (error) {
            console.error("Error al guardar experiencia:", error);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const experienciaToUpdate = experiencias.find(exp => exp.id === id);
            if (!experienciaToUpdate) return;

            const updatedData = {
                ...experienciaToUpdate,
                salario: experienciaToUpdate.salario ? Number(experienciaToUpdate.salario) : null
            };

            const response = await fetch(`http://localhost:8080/api/experiencias-laborales/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const updatedExperiencia = await response.json();
                const updatedExperiencias = experiencias.map(exp => 
                    exp.id === id ? updatedExperiencia : exp
                );
                onExperienciasChange(updatedExperiencias);
                setEditingId(null);
            }
        } catch (error) {
            console.error("Error al actualizar experiencia:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`http://localhost:8080/api/experiencias-laborales/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedExperiencias = experiencias.filter(exp => exp.id !== id);
                onExperienciasChange(updatedExperiencias);
            }
        } catch (error) {
            console.error("Error al eliminar experiencia:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-[#5b36f2]" />
                    Experiencias Laborales
                </h3>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-[#5b36f2] text-white hover:bg-[#4a2fd1]"
                    size="sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Experiencia
                </Button>
            </div>

            {/* Formulario para agregar nueva experiencia */}
            {isAdding && (
                <Card className="border-2 border-[#5b36f2]/20 bg-gradient-to-r from-[#f7f5ff] to-white">
                    <CardHeader>
                        <CardTitle className="text-[#5b36f2] flex items-center">
                            <Plus className="h-5 w-5 mr-2" />
                            Nueva Experiencia Laboral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Empresa *</label>
                                <Input
                                    value={newExperiencia.empresa || ""}
                                    onChange={(e) => setNewExperiencia({...newExperiencia, empresa: e.target.value})}
                                    placeholder="Nombre de la empresa"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Puesto *</label>
                                <Input
                                    value={newExperiencia.puesto || ""}
                                    onChange={(e) => setNewExperiencia({...newExperiencia, puesto: e.target.value})}
                                    placeholder="Cargo o posición"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fecha de inicio *</label>
                                <Input
                                    type="date"
                                    value={newExperiencia.fechaInicio || ""}
                                    onChange={(e) => setNewExperiencia({...newExperiencia, fechaInicio: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                                <Input
                                    type="date"
                                    value={newExperiencia.fechaFin || ""}
                                    onChange={(e) => setNewExperiencia({...newExperiencia, fechaFin: e.target.value})}
                                    className="mt-1"
                                    placeholder="Dejar vacío si es actual"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Salario (S/)</label>
                                <Input
                                    type="number"
                                    value={newExperiencia.salario || ""}
                                    onChange={(e) => setNewExperiencia({...newExperiencia, salario: e.target.value ? Number(e.target.value) : null})}
                                    placeholder="Salario mensual"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Descripción</label>
                            <Textarea
                                value={newExperiencia.descripcion || ""}
                                onChange={(e) => setNewExperiencia({...newExperiencia, descripcion: e.target.value})}
                                placeholder="Describe tus responsabilidades y logros..."
                                className="mt-1 min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSave} className="bg-[#5b36f2] text-white">
                                <Check className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewExperiencia({
                                        empresa: "",
                                        puesto: "",
                                        fechaInicio: "",
                                        fechaFin: "",
                                        salario: null,
                                        descripcion: ""
                                    });
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de experiencias */}
            <div className="space-y-4">
                {experiencias.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-300">
                        <CardContent className="text-center py-8">
                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay experiencias laborales registradas</p>
                            <p className="text-sm text-gray-400">Agrega tu primera experiencia laboral</p>
                        </CardContent>
                    </Card>
                ) : (
                    experiencias.map((experiencia) => (
                        <Card key={experiencia.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-lg bg-[#f7f5ff] flex items-center justify-center">
                                                <Building className="h-6 w-6 text-[#5b36f2]" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">
                                                    {experiencia.puesto}
                                                </h4>
                                                <p className="text-[#5b36f2] font-medium">
                                                    {experiencia.empresa}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {formatDate(experiencia.fechaInicio)} - {
                                                        isCurrentlyWorking(experiencia.fechaFin) 
                                                            ? "Presente" 
                                                            : formatDate(experiencia.fechaFin!)
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{formatSalary(experiencia.salario)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {isCurrentlyWorking(experiencia.fechaFin) ? "Actual" : "Finalizado"}
                                                </span>
                                            </div>
                                        </div>

                                        {experiencia.descripcion && (
                                            <div className="mb-4">
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {experiencia.descripcion}
                                                </p>
                                            </div>
                                        )}

                                        {isCurrentlyWorking(experiencia.fechaFin) && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                Trabajo Actual
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingId(editingId === experiencia.id ? null : experiencia.id)}
                                            className="text-gray-500 hover:text-[#5b36f2]"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(experiencia.id)}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Formulario de edición */}
                                {editingId === experiencia.id && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                        <h5 className="font-medium text-gray-800 mb-3">Editar Experiencia</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Empresa</label>
                                                <Input
                                                    value={experiencia.empresa}
                                                    onChange={(e) => {
                                                        const updatedExperiencias = experiencias.map(exp => 
                                                            exp.id === experiencia.id 
                                                                ? {...exp, empresa: e.target.value}
                                                                : exp
                                                        );
                                                        onExperienciasChange(updatedExperiencias);
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Puesto</label>
                                                <Input
                                                    value={experiencia.puesto}
                                                    onChange={(e) => {
                                                        const updatedExperiencias = experiencias.map(exp => 
                                                            exp.id === experiencia.id 
                                                                ? {...exp, puesto: e.target.value}
                                                                : exp
                                                        );
                                                        onExperienciasChange(updatedExperiencias);
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
                                                <Input
                                                    type="date"
                                                    value={experiencia.fechaInicio.split('T')[0]}
                                                    onChange={(e) => {
                                                        const updatedExperiencias = experiencias.map(exp => 
                                                            exp.id === experiencia.id 
                                                                ? {...exp, fechaInicio: e.target.value}
                                                                : exp
                                                        );
                                                        onExperienciasChange(updatedExperiencias);
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Fecha fin</label>
                                                <Input
                                                    type="date"
                                                    value={experiencia.fechaFin ? experiencia.fechaFin.split('T')[0] : ""}
                                                    onChange={(e) => {
                                                        const updatedExperiencias = experiencias.map(exp => 
                                                            exp.id === experiencia.id 
                                                                ? {...exp, fechaFin: e.target.value}
                                                                : exp
                                                        );
                                                        onExperienciasChange(updatedExperiencias);
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Salario</label>
                                                <Input
                                                    type="number"
                                                    value={experiencia.salario || ""}
                                                    onChange={(e) => {
                                                        const updatedExperiencias = experiencias.map(exp => 
                                                            exp.id === experiencia.id 
                                                                ? {...exp, salario: e.target.value ? Number(e.target.value) : null}
                                                                : exp
                                                        );
                                                        onExperienciasChange(updatedExperiencias);
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-700">Descripción</label>
                                            <Textarea
                                                value={experiencia.descripcion}
                                                onChange={(e) => {
                                                    const updatedExperiencias = experiencias.map(exp => 
                                                        exp.id === experiencia.id 
                                                            ? {...exp, descripcion: e.target.value}
                                                            : exp
                                                    );
                                                    onExperienciasChange(updatedExperiencias);
                                                }}
                                                className="mt-1 min-h-[80px]"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => handleUpdate(experiencia.id)}
                                                className="bg-[#5b36f2] text-white"
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Guardar
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setEditingId(null)}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
} 