"use client";

import { useState, useEffect } from "react";
import {
    User, Mail, Building, Phone, Calendar, MapPin,
    BookOpen, Award, Briefcase, Edit2, Camera, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import PerfilSeguridad from "@/components/dashboard/PerfilSeguridad";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EgresadoData } from "../types/egresado-data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";



export default function DashboardPerfil() {
    const { user, setUser } = useAuth();
    console.log("Valor de user?.role:", user?.role);

    const [egresado, setEgresado] = useState<EgresadoData | undefined>(user?.egresado);
    useEffect(() => {
        setEgresado(user?.egresado);
    }, [user]);
    const [activeTab, setActiveTab] = useState("personal");
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    const [isEditingAcademic, setIsEditingAcademic] = useState(false);
    const [isEditingLaboral, setIsEditingLaboral] = useState(false);

    // Inicializa los formularios vacíos
    const [basicForm, setBasicForm] = useState({
        nombre: "",
        telefono: "",
        dni: "",
        sede: "",
    });

    const [academicForm, setAcademicForm] = useState({
        carrera: "",
        anoGraduacion: 0,
        codigoEstudiante: "",
        habilidadesTecnicas: "[]",
        habilidadesBlandas: "[]",
    });

    const [laboralForm, setLaboralForm] = useState({
        estadoLaboral: "",
        tiempoPrimerEmpleo: 0,
        linkedin: "{}",
        satisfaccionFormacion: 0,
    });

    // Cuando egresado esté disponible, actualiza los formularios
    useEffect(() => {
        if (egresado) {
            setBasicForm({
                nombre: egresado.nombre || "",
                telefono: egresado.telefono || "",
                dni: egresado.dni || "",
                sede: egresado.sede || "",
            });
            setAcademicForm({
                carrera: egresado.carrera || "",
                anoGraduacion: egresado.anoGraduacion || 0,
                codigoEstudiante: egresado.codigoEstudiante || "",
                habilidadesTecnicas: egresado.habilidadesTecnicas || "[]",
                habilidadesBlandas: egresado.habilidadesBlandas || "[]",
            });
            setLaboralForm({
                estadoLaboral: egresado.estadoLaboral || "",
                tiempoPrimerEmpleo: egresado.tiempoPrimerEmpleo || 0,
                linkedin: egresado.linkedin || "{}",
                satisfaccionFormacion: egresado.satisfaccionFormacion || 0,
            });
        }
    }, [egresado]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBasicForm({ ...basicForm, [e.target.name]: e.target.value });
    };

    const handleAcademicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAcademicForm({ ...academicForm, [e.target.name]: e.target.value });
    };

    const handleLaboralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLaboralForm({ ...laboralForm, [e.target.name]: e.target.value });
    };

    const handleLinkedinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const currentLinkedin = laboralForm.linkedin ? JSON.parse(laboralForm.linkedin) : {};
            const newLinkedin = { ...currentLinkedin, url: e.target.value };
            setLaboralForm({ ...laboralForm, linkedin: JSON.stringify(newLinkedin) });
        } catch {
            setLaboralForm({ ...laboralForm, linkedin: JSON.stringify({ url: e.target.value }) });
        }
    };

    const handleSkillsChange = (type: 'tecnicas' | 'blandas', value: string) => {
        if (type === 'tecnicas') {
            setAcademicForm({ ...academicForm, habilidadesTecnicas: value });
        } else {
            setAcademicForm({ ...academicForm, habilidadesBlandas: value });
        }
    };



    async function saveBasicInfo() {
        if (!egresado) return;
        try {
            const res = await fetch('http://localhost:8080/api/egresados/' + egresado.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ ...egresado, ...basicForm }),
            });
            if (res.ok) {
                const actualizado = await res.json();
                setEgresado(actualizado); // Actualiza el estado local
                setBasicForm({
                    nombre: actualizado.nombre,
                    telefono: actualizado.telefono,
                    dni: actualizado.dni,
                    sede: actualizado.sede,
                });

                // Actualiza el estado global del usuario y localStorage
                setUser(prev => {
                    if (!prev) return null;

                    const updated = {
                        ...prev,
                        egresado: actualizado,
                        name: actualizado.nombre || prev.username // Actualiza el nombre mostrado
                    };

                    // También actualiza localStorage para persistir cambios
                    localStorage.setItem("user", JSON.stringify(updated));

                    return updated;
                });
            }
            setIsEditingBasic(false);
        } catch (error) {
            console.error("Error al guardar información básica:", error);
        }
    }


    async function saveAcademicInfo() {
        if (!egresado) return;
        try {
            JSON.parse(academicForm.habilidadesTecnicas);
            JSON.parse(academicForm.habilidadesBlandas);

            const res = await fetch(`http://localhost:8080/api/egresados/${egresado.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    ...egresado,
                    ...academicForm,
                    anoGraduacion: Number(academicForm.anoGraduacion)
                }),
            });
            if (res.ok) {
                const actualizado = await res.json();
                setAcademicForm({
                    carrera: actualizado.carrera,
                    anoGraduacion: actualizado.anoGraduacion,
                    codigoEstudiante: actualizado.codigoEstudiante,
                    habilidadesTecnicas: actualizado.habilidadesTecnicas,
                    habilidadesBlandas: actualizado.habilidadesBlandas,
                });
                setEgresado(actualizado); // Actualiza el estado local

                // Actualiza el estado global del usuario y localStorage
                setUser(prev => {
                    if (!prev) return null;

                    const updated = {
                        ...prev,
                        egresado: actualizado,
                        name: actualizado.nombre || prev.username
                    };

                    // También actualiza localStorage para persistir cambios
                    localStorage.setItem("user", JSON.stringify(updated));

                    return updated;
                });

                setIsEditingAcademic(false);
            } else {
                const errorText = await res.text();
                console.error("Error en respuesta:", errorText);
            }
        } catch (error) {
            console.error("Error al guardar información académica:", error);
            alert("Verifica que los campos de habilidades sean un array JSON válido.");
        }
    }

    async function saveLaboralInfo() {
        if (!egresado) return;
        try {
            const res = await fetch('http://localhost:8080/api/egresados/' + egresado.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    ...egresado,
                    ...laboralForm,
                    tiempoPrimerEmpleo: Number(laboralForm.tiempoPrimerEmpleo),
                    satisfaccionFormacion: Number(laboralForm.satisfaccionFormacion)
                }),
            });
            if (res.ok) {
                const actualizado = await res.json();
                setLaboralForm({
                    estadoLaboral: actualizado.estadoLaboral,
                    tiempoPrimerEmpleo: actualizado.tiempoPrimerEmpleo,
                    linkedin: actualizado.linkedin,
                    satisfaccionFormacion: actualizado.satisfaccionFormacion,
                });
                setEgresado(actualizado); // Actualiza el estado local

                // Actualiza el estado global del usuario y localStorage
                setUser(prev => {
                    if (!prev) return null;

                    const updated = {
                        ...prev,
                        egresado: actualizado,
                        name: actualizado.nombre || prev.username
                    };

                    // También actualiza localStorage para persistir cambios
                    localStorage.setItem("user", JSON.stringify(updated));

                    return updated;
                });
            }
            setIsEditingLaboral(false);        } catch (error) {
            console.error("Error al guardar información laboral:", error);
        }
    }

    // Parseamos JSON almacenado como string en la base de datos
    const habilidadesTecnicas: string[] = egresado?.habilidadesTecnicas
        ? JSON.parse(egresado.habilidadesTecnicas)
        : [];
    
    const habilidadesBlandas: string[] = egresado?.habilidadesBlandas
        ? JSON.parse(egresado.habilidadesBlandas)
        : [];
    
    const linkedin: { url?: string } = egresado?.linkedin
        ? JSON.parse(egresado.linkedin)
        : {};

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="text-lg font-semibold">Mi Perfil</h1>
                </div>
            </header>
            <div className="flex-1 overflow-auto">                <div className="container py-8 space-y-6 font-inter">
                    {/* Cabecera de perfil con gradiente hermoso */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-utp-600 to-utp-500 p-8 text-white shadow-2xl">
                        {/* Elementos decorativos */}
                        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 backdrop-blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/5 backdrop-blur-3xl"></div>
                        
                        <div className="relative flex items-center gap-6">
                            <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-2">Mi Perfil</h1>
                                <p className="text-white/90 text-lg font-medium">
                                    Gestiona tu información personal y configuración de seguridad
                                </p>
                            </div>
                        </div>
                    </div>            {/* Sección principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Información básica */}
                <Card className="lg:col-span-1 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-800">Información Básica</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500"
                                onClick={() => setIsEditingBasic(!isEditingBasic)}
                            >
                                {isEditingBasic ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isEditingBasic ? (
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        name="nombre"
                                        value={basicForm.nombre}
                                        onChange={handleBasicChange}
                                        placeholder="Nombre completo"
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <Input
                                        name="telefono"
                                        value={basicForm.telefono}
                                        onChange={handleBasicChange}
                                        placeholder="Número de teléfono"
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <Input
                                        name="dni"
                                        value={basicForm.dni}
                                        onChange={handleBasicChange}
                                        placeholder="Documento de identidad"
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <Input
                                        name="sede"
                                        value={basicForm.sede}
                                        onChange={handleBasicChange}
                                        placeholder="Sede universitaria"
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        onClick={saveBasicInfo}
                                        className="bg-[#5b36f2] text-white"
                                    >
                                        Guardar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditingBasic(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        <div
                                            className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow">
                                            {egresado?.nombre ? (
                                                <div
                                                    className="w-full h-full flex items-center justify-center bg-[#eee9fe] text-[#5b36f2] text-2xl font-bold">
                                                    {egresado.nombre.charAt(0)}
                                                </div>
                                            ) : (
                                                <User className="w-full h-full p-4 text-gray-400"/>
                                            )}
                                        </div>
                                        <button
                                            className="absolute bottom-0 right-0 rounded-full bg-[#5b36f2] p-1.5 text-white shadow-sm">
                                            <Camera className="h-4 w-4"/>
                                        </button>
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-gray-800">{egresado?.nombre || "Sin nombre"}</h2>
                                    <span
                                        className="px-3 py-1 mt-1.5 text-xs font-medium rounded-full bg-[#eee9fe] text-[#5b36f2]">
    {(user?.role === "GRADUATE" || user?.role === "EGRESADO" || user?.role === "ROLE_EGRESADO")
        ? "Egresado"
        : (user?.role === "ADMIN" || user?.role === "ROLE_ADMIN")
            ? "Administrador"
            : "Sin rol"}
</span>
                                </div>
                                <div className="space-y-3 text-[15px]">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-gray-500"/>
                                        <span className="text-gray-600">{user?.email || "No disponible"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{egresado?.telefono || "No disponible"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">DNI: {egresado?.dni || "No disponible"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Sede: {egresado?.sede || "No disponible"}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>                {/* Columna derecha - Tabs con información detallada */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">                        <CardHeader className="bg-gradient-to-r from-utp-50 to-blue-50 rounded-t-lg border-b border-gray-100 pb-2">
                            <TabsList className="bg-white/70 backdrop-blur-sm border border-gray-200 w-full justify-start rounded-lg px-1 h-12 shadow-sm">                                <TabsTrigger
                                    value="personal"
                                    className="rounded-lg px-4 py-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-600 data-[state=active]:to-utp-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium"
                                >
                                    Datos Académicos
                                </TabsTrigger>
                                <TabsTrigger
                                    value="laboral"
                                    className="rounded-lg px-4 py-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-600 data-[state=active]:to-utp-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium"
                                >
                                    Situación Laboral
                                </TabsTrigger>
                                <TabsTrigger
                                    value="seguridad"
                                    className="rounded-lg px-4 py-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-600 data-[state=active]:to-utp-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium"
                                >
                                    Seguridad
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <TabsContent value="personal">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <BookOpen className="h-5 w-5 mr-2 text-[#5b36f2]" />
                                            Información Académica
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-500"
                                            onClick={() => setIsEditingAcademic(!isEditingAcademic)}
                                        >
                                            {isEditingAcademic ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {isEditingAcademic ? (
                                        <div className="space-y-4">
                                            <div className="space-y-4">
                                                <Input
                                                    name="carrera"
                                                    value={academicForm.carrera}
                                                    onChange={handleAcademicChange}
                                                    placeholder="Carrera"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                                <Input
                                                    type="number"
                                                    name="anoGraduacion"
                                                    value={academicForm.anoGraduacion}
                                                    onChange={handleAcademicChange}
                                                    placeholder="Año de graduación"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                                <Input
                                                    name="codigoEstudiante"
                                                    value={academicForm.codigoEstudiante}
                                                    onChange={handleAcademicChange}
                                                    placeholder="Código de estudiante"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Habilidades Técnicas</label>
                                                <Textarea
                                                    value={academicForm.habilidadesTecnicas}
                                                    onChange={(e) => handleSkillsChange('tecnicas', e.target.value)}
                                                    placeholder='Ej: ["JavaScript", "React", "Node.js"]'
                                                    className="border rounded px-3 py-2 w-full min-h-[100px]"
                                                />
                                                <p className="text-xs text-gray-500">Ingrese como un array JSON</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Habilidades Blandas</label>
                                                <Textarea
                                                    value={academicForm.habilidadesBlandas}
                                                    onChange={(e) => handleSkillsChange('blandas', e.target.value)}
                                                    placeholder='Ej: ["Trabajo en equipo", "Comunicación", "Liderazgo"]'
                                                    className="border rounded px-3 py-2 w-full min-h-[100px]"
                                                />
                                                <p className="text-xs text-gray-500">Ingrese como un array JSON</p>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    onClick={saveAcademicInfo}
                                                    className="bg-[#5b36f2] text-white"
                                                >
                                                    Guardar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditingAcademic(false)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Building className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Institución</p>
                                                        <p className="text-gray-800 font-medium">Universidad Tecnológica del Perú</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <BookOpen className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Carrera</p>
                                                        <p className="text-gray-800 font-medium">{egresado?.carrera || "No disponible"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Calendar className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Año de Graduación</p>
                                                        <p className="text-gray-800 font-medium">{egresado?.anoGraduacion || "No disponible"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Award className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Código de Estudiante</p>
                                                        <p className="text-gray-800 font-medium">{egresado?.codigoEstudiante || "No disponible"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-3">Habilidades Técnicas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {habilidadesTecnicas && habilidadesTecnicas.length > 0 ? (
                                                        habilidadesTecnicas.map((skill: string, index: number) => (
                                                            <span
                                                                key={index}
                                                                className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#eee9fe] text-[#5b36f2]"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">No hay habilidades registradas</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-3">Habilidades Blandas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {habilidadesBlandas && habilidadesBlandas.length > 0 ? (
                                                        habilidadesBlandas.map((skill: string, index: number) => (
                                                            <span
                                                                key={index}
                                                                className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#f0f9ff] text-[#0ea5e9]"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">No hay habilidades registradas</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="laboral">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <Briefcase className="h-5 w-5 mr-2 text-[#5b36f2]" />
                                            Situación Laboral
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-500"
                                            onClick={() => setIsEditingLaboral(!isEditingLaboral)}
                                        >
                                            {isEditingLaboral ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {isEditingLaboral ? (
                                        <div className="space-y-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Estado Laboral</label>
                                                    <Select
                                                        value={laboralForm.estadoLaboral}
                                                        onValueChange={(value) => setLaboralForm({...laboralForm, estadoLaboral: value})}
                                                    >
                                                        <SelectTrigger className="w-full border rounded px-3 py-2">
                                                            <SelectValue placeholder="Seleccione estado laboral" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Empleado">Empleado</SelectItem>
                                                            <SelectItem value="Desempleado">Desempleado</SelectItem>
                                                            <SelectItem value="Emprendedor">Emprendedor</SelectItem>
                                                            <SelectItem value="Estudiando">Estudiando</SelectItem>
                                                            <SelectItem value="Otro">Otro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input
                                                    type="number"
                                                    name="tiempoPrimerEmpleo"
                                                    value={laboralForm.tiempoPrimerEmpleo}
                                                    onChange={handleLaboralChange}
                                                    placeholder="Tiempo para primer empleo (meses)"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                                <Input
                                                    value={linkedin?.url || ""}
                                                    onChange={handleLinkedinChange}
                                                    placeholder="URL de LinkedIn"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    name="satisfaccionFormacion"
                                                    value={laboralForm.satisfaccionFormacion}
                                                    onChange={handleLaboralChange}
                                                    placeholder="Satisfacción con formación (1-10)"
                                                    className="border rounded px-3 py-2 w-full"
                                                />
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    onClick={saveLaboralInfo}
                                                    className="bg-[#5b36f2] text-white"
                                                >
                                                    Guardar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditingLaboral(false)}
                                                >

                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Briefcase className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Estado Laboral Actual</p>
                                                        <p className="text-gray-800 font-medium">{egresado?.estadoLaboral || "No especificado"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Calendar className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Tiempo para conseguir primer empleo</p>
                                                        <p className="text-gray-800 font-medium">
                                                            {egresado?.tiempoPrimerEmpleo ? `${egresado.tiempoPrimerEmpleo} meses` : "No especificado"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Award className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Perfil de LinkedIn</p>
                                                        <p className="text-[#5b36f2] font-medium">
                                                            {linkedin?.url ? (
                                                                <a href={linkedin.url} target="_blank" rel="noopener noreferrer">
                                                                    Ver perfil
                                                                </a>
                                                            ) : (
                                                                "No disponible"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f7f5ff] flex items-center justify-center mr-3">
                                                        <Award className="h-5 w-5 text-[#5b36f2]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-500">Satisfacción con la formación</p>
                                                        <p className="text-gray-800 font-medium">
                                                            {egresado?.satisfaccionFormacion ? `${egresado.satisfaccionFormacion}/10` : "No especificado"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                              <TabsContent value="seguridad">
                                <PerfilSeguridad />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
                </div>
            </div>
        </div>
    );
}