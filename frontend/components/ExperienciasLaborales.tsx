"use client";

import { useState, useEffect } from "react";
import { 
    Briefcase, 
    Calendar, 
    MapPin, 
    Banknote, // <-- Cambia DollarSign por Banknote
    Edit2, 
    Trash2, 
    Plus, 
    X, 
    Check,
    Building,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExperienciaLaboral } from "../app/types/egresado-data";
import { Checkbox } from "@/components/ui/checkbox";

interface ExperienciasLaboralesProps {
    egresadoId: string;
    experiencias: ExperienciaLaboral[];
    onExperienciasChange: (experiencias: ExperienciaLaboral[]) => void;
}

export default function ExperienciasLaborales({ 
    egresadoId, 
    experiencias, 
    onExperienciasChange 
}: ExperienciasLaboralesProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        empresa: "",
        puesto: "",
        fechaInicio: "",
        fechaFin: "",
        salario: "",
        descripcion: "",
        actual: false // <-- nuevo campo
    });

    const resetForm = () => {
        setFormData({
            empresa: "",
            puesto: "",
            fechaInicio: "",
            fechaFin: "",
            salario: "",
            descripcion: "",
            actual: false
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked,
                ...(name === 'actual' && checked ? { fechaFin: "" } : {})
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

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
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(salary);
    };

    const isCurrentPosition = (experiencia: ExperienciaLaboral) => {
        return !experiencia.fechaFin;
    };

    const getCleanToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        // Limpiar el token de caracteres problemáticos
        return token.replace(/[\r\n\t]/g, '').trim();
    };

    // --- VALIDACIONES ---
    const isAllUpperCase = (text: string) => text === text.toUpperCase() && /[A-Z]/.test(text);

    const isValidDateRange = (start: string, end: string) => {
        if (!start || !end) return true;
        return new Date(start) <= new Date(end);
    };

    const handleAdd = async () => {
        try {
            // Validar campos requeridos
            if (!formData.empresa.trim() || !formData.puesto.trim() || !formData.fechaInicio) {
                alert('Por favor completa los campos requeridos: Empresa, Puesto y Fecha de Inicio');
                return;
            }
            // Validar mayúsculas
            if (isAllUpperCase(formData.empresa) || isAllUpperCase(formData.puesto)) {
                alert('No uses solo mayúsculas en los campos de texto.');
                return;
            }
            // Validar fechas solo si !formData.actual
            if (!formData.actual && !isValidDateRange(formData.fechaInicio, formData.fechaFin)) {
                alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
                return;
            }
            // Validar salario
            if (formData.salario && parseInt(formData.salario) < 0) {
                alert('El salario debe ser un número positivo.');
                return;
            }

            // Limpiar y validar datos antes de enviar
            const datosLimpios = {
                idEgresado: egresadoId,
                empresa: formData.empresa.trim().replace(/[^\w\s\-.,&()]/g, ''),
                puesto: formData.puesto.trim().replace(/[^\w\s\-.,&()]/g, ''),
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.actual ? null : (formData.fechaFin && formData.fechaFin.trim() !== '' ? formData.fechaFin : null),
                salario: formData.salario && formData.salario.trim() !== '' ? parseInt(formData.salario) : null,
                descripcion: formData.descripcion ? formData.descripcion.trim().replace(/[\r\n\t]/g, ' ') : '',
                actual: formData.actual
            };

            console.log('Datos a enviar:', datosLimpios);

            const token = getCleanToken();
            if (!token) {
                alert('No hay token de autorización. Por favor inicia sesión nuevamente.');
                return;
            }

            console.log('Token:', token.substring(0, 50) + '...');
            console.log('Datos a enviar:', JSON.stringify(datosLimpios, null, 2));

            const response = await fetch('http://localhost:8080/api/experiencias-laborales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosLimpios)
            });

            if (response.ok) {
                const nuevaExperiencia = await response.json();
                onExperienciasChange([...experiencias, nuevaExperiencia]);
                setIsAdding(false);
                resetForm();
            } else {
                const errorText = await response.text();
                console.error('Error al agregar experiencia:', errorText);
                alert('Error al agregar experiencia: ' + errorText);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar experiencia: ' + error);
        }
    };

    const handleEdit = async () => {
        if (!editingId) return;

        try {
            // Validar campos requeridos
            if (!formData.empresa.trim() || !formData.puesto.trim() || !formData.fechaInicio) {
                alert('Por favor completa los campos requeridos: Empresa, Puesto y Fecha de Inicio');
                return;
            }
            // Validar mayúsculas
            if (isAllUpperCase(formData.empresa) || isAllUpperCase(formData.puesto)) {
                alert('No uses solo mayúsculas en los campos de texto.');
                return;
            }
            // Validar fechas solo si !formData.actual
            if (!formData.actual && !isValidDateRange(formData.fechaInicio, formData.fechaFin)) {
                alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
                return;
            }
            // Validar salario
            if (formData.salario && parseInt(formData.salario) < 0) {
                alert('El salario debe ser un número positivo.');
                return;
            }

            // Limpiar y validar datos antes de enviar
            const datosLimpios = {
                empresa: formData.empresa.trim().replace(/[^\w\s\-.,&()]/g, ''),
                puesto: formData.puesto.trim().replace(/[^\w\s\-.,&()]/g, ''),
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.actual ? null : (formData.fechaFin && formData.fechaFin.trim() !== '' ? formData.fechaFin : null),
                salario: formData.salario && formData.salario.trim() !== '' ? parseInt(formData.salario) : null,
                descripcion: formData.descripcion ? formData.descripcion.trim().replace(/[\r\n\t]/g, ' ') : '',
                actual: formData.actual
            };

            console.log('Datos a enviar para editar:', datosLimpios);

            const token = getCleanToken();
            if (!token) {
                alert('No hay token de autorización. Por favor inicia sesión nuevamente.');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/experiencias-laborales/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosLimpios)
            });

            if (response.ok) {
                const experienciaActualizada = await response.json();
                const experienciasActualizadas = experiencias.map(exp => 
                    exp.id === editingId ? experienciaActualizada : exp
                );
                onExperienciasChange(experienciasActualizadas);
                setEditingId(null);
                resetForm();
            } else {
                const errorText = await response.text();
                console.error('Error al actualizar experiencia:', errorText);
                alert('Error al actualizar experiencia: ' + errorText);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar experiencia: ' + error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta experiencia laboral?')) {
            return;
        }

        try {
            const token = getCleanToken();
            if (!token) {
                alert('No hay token de autorización. Por favor inicia sesión nuevamente.');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/experiencias-laborales/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const experienciasActualizadas = experiencias.filter(exp => exp.id !== id);
                onExperienciasChange(experienciasActualizadas);
            } else {
                console.error('Error al eliminar experiencia');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const startEditing = (experiencia: ExperienciaLaboral) => {
        setEditingId(experiencia.id);
        setFormData({
            empresa: experiencia.empresa,
            puesto: experiencia.puesto,
            fechaInicio: experiencia.fechaInicio.split('T')[0],
            fechaFin: experiencia.fechaFin ? experiencia.fechaFin.split('T')[0] : "",
            salario: experiencia.salario?.toString() || "",
            descripcion: experiencia.descripcion,
            actual: !experiencia.fechaFin
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const sortedExperiencias = [...experiencias].sort((a, b) => {
        // Current positions first, then by start date (newest first)
        if (isCurrentPosition(a) && !isCurrentPosition(b)) return -1;
        if (!isCurrentPosition(a) && isCurrentPosition(b)) return 1;
        return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-blue-700">Experiencia Laboral</h3>
                        <p className="text-sm text-gray-600">Gestiona tu historial profesional</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Experiencia
                </Button>
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {isAdding ? (
                                <>
                                    <Plus className="h-5 w-5 text-blue-600" />
                                    Nueva Experiencia Laboral
                                </>
                            ) : (
                                <>
                                    <Edit2 className="h-5 w-5 text-blue-600" />
                                    Editar Experiencia
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Empresa *
                                </label>
                                <Input
                                    name="empresa"
                                    value={formData.empresa}
                                    onChange={handleInputChange}
                                    placeholder="Nombre de la empresa"
                                    className="border-gray-300 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Puesto *
                                </label>
                                <Input
                                    name="puesto"
                                    value={formData.puesto}
                                    onChange={handleInputChange}
                                    placeholder="Cargo o posición"
                                    className="border-gray-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Fecha de Inicio *
                                </label>
                                <Input
                                    type="date"
                                    name="fechaInicio"
                                    value={formData.fechaInicio}
                                    onChange={handleInputChange}
                                    className="border-gray-300 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Fecha de Fin
                                </label>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="actual"
                                        name="actual"
                                        checked={formData.actual}
                                        onChange={handleInputChange}
                                        className="mr-2 accent-blue-600"
                                    />
                                    <label htmlFor="actual" className="text-sm text-gray-700 select-none cursor-pointer">
                                        Actualmente trabajo aquí
                                    </label>
                                </div>
                                <Input
                                    type="date"
                                    name="fechaFin"
                                    value={formData.fechaFin}
                                    onChange={handleInputChange}
                                    placeholder="Dejar vacío si es actual"
                                    className="border-gray-300 focus:border-blue-500"
                                    disabled={formData.actual}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Salario (S/)
                                </label>
                                <Input
                                    type="number"
                                    name="salario"
                                    value={formData.salario}
                                    onChange={handleInputChange}
                                    placeholder="Salario mensual"
                                    className="border-gray-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Descripción
                            </label>
                            <Textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="Describe tus responsabilidades y logros..."
                                className="border-gray-300 focus:border-blue-500 min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={isAdding ? handleAdd : handleEdit}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {isAdding ? 'Agregar' : 'Guardar'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={isAdding ? () => setIsAdding(false) : cancelEdit}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Experiences List */}
            <div className="space-y-4">
                {sortedExperiencias.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-300">
                        <CardContent className="py-8 text-center">
                            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                No hay experiencias laborales
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Agrega tu primera experiencia laboral para comenzar a construir tu perfil profesional
                            </p>
                            <Button
                                onClick={() => setIsAdding(true)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Primera Experiencia
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    sortedExperiencias.map((experiencia, index) => (
                        <Card key={experiencia.id} className="group hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <Building className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-semibold text-blue-700">
                                                        {experiencia.puesto}
                                                    </h4>
                                                    {isCurrentPosition(experiencia) && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Actual
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="font-medium">{experiencia.empresa}</span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {formatDate(experiencia.fechaInicio)} - {
                                                                experiencia.fechaFin 
                                                                    ? formatDate(experiencia.fechaFin)
                                                                    : <span className="font-semibold text-green-700">Presente</span>
                                                            }
                                                        </span>
                                                    </div>
                                                    {experiencia.salario && (
                                                        <div className="flex items-center gap-1">
                                                            <Banknote className="h-4 w-4 text-green-600" />
                                                            <span>{formatSalary(experiencia.salario)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {experiencia.descripcion && (
                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                        {experiencia.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEditing(experiencia)}
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(experiencia.id)}
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
} 