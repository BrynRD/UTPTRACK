"use client"

import {Search, Filter, UserCog, Shield, ShieldOff, Pencil, Trash2, CheckCircle, XCircle, ChevronDown, User, Users, UserPlus, AlertTriangle} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast";

export default function EgresadosPage() {
    // Usar el hook useToast
    const { toast } = useToast();

    const [isCreatingGraduate, setIsCreatingGraduate] = useState(false);
    const [newGraduate, setNewGraduate] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        codigoEstudiante: "",
        career: "",
        graduationYear: new Date().getFullYear(),
        employed: false,
        role: "GRADUATE"
    });
    const [graduates, setGraduates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGraduates, setSelectedGraduates] = useState<string[]>([])
    const [editingGraduate, setEditingGraduate] = useState<any>(null)
    const [filter, setFilter] = useState("todos")
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem("token")
        fetch("http://localhost:8080/api/egresados", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                const mapped = data.map((egresado: any) => ({
                    id: egresado.id,
                    usuarioId: egresado.usuarioId,
                    name: egresado.nombre,
                    email: egresado.email,
                    career: egresado.carrera,
                    graduationYear: egresado.anoGraduacion,
                    employed: egresado.estadoLaboral === "empleado",
                    has2FA: egresado.has2FA,
                    role: egresado.role,
                    status: egresado.enabled ? "active" : "inactive",
                    verified: egresado.verified
                }))
                setGraduates(mapped)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false);
                toast({
                    variant: "destructive",
                    title: "Error de conexión",
                    description: "No se pudo cargar la lista de egresados",
                });
            })
    }, []);

    // Función para crear un nuevo egresado
    const handleCreateGraduate = async () => {
        // Validaciones básicas
        if (!newGraduate.name || !newGraduate.email || !newGraduate.username || !newGraduate.password) {
            toast({
                variant: "destructive",
                title: "Campos incompletos",
                description: "Por favor completa todos los campos obligatorios"
            });
            return;
        }

        if (newGraduate.password !== newGraduate.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "Las contraseñas no coinciden"
            });
            return;
        }

        const token = localStorage.getItem("token");

        try {
            // Primero registramos el usuario - Sin enviar el rol aquí
            const resUsuario = await fetch("http://localhost:8080/api/auth/registro", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: newGraduate.username,
                    email: newGraduate.email,
                    password: newGraduate.password
                })
            });

            const dataUsuario = await resUsuario.json();

            if (!resUsuario.ok) {
                throw new Error(dataUsuario.mensaje || "Error al crear el usuario");
            }

            // Asignamos el rol en una petición separada
            const resRol = await fetch(`http://localhost:8080/api/usuarios/${dataUsuario.usuario.id}/cambiar-rol`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: "GRADUATE" })
            });

            if (!resRol.ok) {
                const dataRol = await resRol.json();
                throw new Error(dataRol.mensaje || "Error al asignar rol");
            }

            // Luego creamos el egresado asociado
            const resEgresado = await fetch("http://localhost:8080/api/egresados", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuarioId: dataUsuario.usuario.id,
                    nombre: newGraduate.name,
                    codigoEstudiante: newGraduate.codigoEstudiante || newGraduate.username,
                    carrera: newGraduate.career,
                    anoGraduacion: newGraduate.graduationYear,
                    estadoLaboral: newGraduate.employed ? "empleado" : "desempleado"
                })
            });

            const dataEgresado = await resEgresado.json();

            if (!resEgresado.ok) {
                toast({
                    variant: "destructive",
                    title: "Error parcial",
                    description: "El usuario fue creado pero no se pudo asociar como egresado"
                });
                throw new Error(dataEgresado.mensaje || "Error al crear el egresado");
            }

            // Añadimos el nuevo egresado a la lista
            const nuevoEgresado = {
                id: dataEgresado.id,
                usuarioId: dataUsuario.usuario.id,
                name: dataEgresado.nombre,
                email: newGraduate.email,
                career: newGraduate.career,
                graduationYear: newGraduate.graduationYear,
                employed: newGraduate.employed,
                has2FA: false,
                role: "GRADUATE",
                status: "active",
                verified: false
            };

            setGraduates(prev => [...prev, nuevoEgresado]);
            setIsCreatingGraduate(false);

            // Limpiar el formulario
            setNewGraduate({
                name: "",
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
                codigoEstudiante: "",
                career: "",
                graduationYear: new Date().getFullYear(),
                employed: false,
                role: "GRADUATE"
            });

            toast({
                title: "Éxito",
                description: "Egresado creado correctamente",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Error al crear el egresado: ${error}`
            });
        }
    };

    const filteredGraduates = graduates.filter(graduate => {
        const matchesSearch = graduate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            graduate.email.toLowerCase().includes(searchTerm.toLowerCase())

        if (filter === "todos") return matchesSearch
        if (filter === "activos") return matchesSearch && graduate.status === "active"
        if (filter === "inactivos") return matchesSearch && graduate.status === "inactive"
        if (filter === "admin") return matchesSearch && graduate.role === "ADMIN"
        if (filter === "con2fa") return matchesSearch && graduate.has2FA
        if (filter === "sin2fa") return matchesSearch && !graduate.has2FA

        return matchesSearch
    });

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGraduates = filteredGraduates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredGraduates.length / itemsPerPage);

    // Funciones para navegar entre páginas
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Reset de la página actual cuando cambian los filtros o la búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const handleToggleSelect = (id: string) => {
        setSelectedGraduates(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedGraduates.length === currentGraduates.length) {
            setSelectedGraduates([])
        } else {
            setSelectedGraduates(currentGraduates.map(g => g.id))
        }
    }

    const handleToggle2FA = async (graduate: any) => {
        const token = localStorage.getItem("token");
        if (!graduate.has2FA) {
            toast({
                title: "Información",
                description: "Solo se implementa desactivar 2FA desde el panel."
            });
            return;
        }
        try {
            const res = await fetch(`http://localhost:8080/api/auth/2fa/desactivar/${graduate.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (res.ok) {
                setGraduates(prev =>
                    prev.map(g =>
                        g.id === graduate.id ? { ...g, has2FA: false } : g
                    )
                );
                toast({
                    title: "Éxito",
                    description: "2FA desactivado correctamente"
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.mensaje || "Error al desactivar 2FA"
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error de red",
                description: "No se pudo completar la operación"
            });
        }
    };

    const handleChangeRole = async (graduate: any, newRole: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${graduate.usuarioId}/cambiar-rol`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (res.ok) {
                setGraduates(prev =>
                    prev.map(g =>
                        g.id === graduate.id ? { ...g, role: newRole } : g
                    )
                );
                toast({
                    title: "Rol actualizado",
                    description: `El rol ha sido cambiado a ${newRole}`
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.mensaje || "Error al cambiar rol"
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error de red",
                description: "No se pudo cambiar el rol del usuario"
            });
        }
    };

    const handleEditGraduate = (graduate: any) => {
        setEditingGraduate({
            ...graduate,
            _originalRole: graduate.role, // Guardamos el rol original para comparar luego
            codigoEstudiante: graduate.codigoEstudiante || "" // Aseguramos que este campo exista
        });
    }

    const handleSaveEdit = async () => {
        const token = localStorage.getItem("token");

        try {
            // Primero preparamos los datos para el backend
            const egresadoData = {
                nombre: editingGraduate.name,
                // Importante: Asegurarse que codigoEstudiante no sea vacío o tenga un valor único
                codigoEstudiante: editingGraduate.codigoEstudiante || editingGraduate.id, // Usar el ID como código si está vacío
                carrera: editingGraduate.career,
                anoGraduacion: editingGraduate.graduationYear,
                estadoLaboral: editingGraduate.employed ? "empleado" : "desempleado"
            };

            // Realizar la petición para actualizar el egresado
            const resEgresado = await fetch(`http://localhost:8080/api/egresados/${editingGraduate.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(egresadoData)
            });

            if (!resEgresado.ok) {
                const errorData = await resEgresado.json();
                throw new Error(errorData.mensaje || "Error al actualizar información del egresado");
            }

            // Si hay cambio de rol, actualizamos el rol también
            if (editingGraduate._originalRole !== editingGraduate.role) {
                const resRol = await fetch(`http://localhost:8080/api/usuarios/${editingGraduate.usuarioId}/cambiar-rol`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ role: editingGraduate.role })
                });

                if (!resRol.ok) {
                    const errorData = await resRol.json();
                    throw new Error(errorData.mensaje || "Error al actualizar el rol");
                }
            }

            // Actualizamos la lista de graduados en el estado
            setGraduates(prev =>
                prev.map(g =>
                    g.id === editingGraduate.id ?
                        {
                            ...g,
                            name: editingGraduate.name,
                            email: editingGraduate.email,
                            career: editingGraduate.career,
                            graduationYear: editingGraduate.graduationYear,
                            employed: editingGraduate.employed,
                            role: editingGraduate.role,
                            status: editingGraduate.status,
                            has2FA: editingGraduate.has2FA,
                            codigoEstudiante: egresadoData.codigoEstudiante
                        } :
                        g
                )
            );

            // Cerramos el modal
            setEditingGraduate(null);

            toast({
                title: "Cambios guardados",
                description: "La información del egresado ha sido actualizada"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Error al guardar cambios: ${error}`
            });
        }
    };

    const handleDeleteUser = async (id: string) => {
        const token = localStorage.getItem("token");

        try {
            if (id === "multiple") {
                // Si se están eliminando múltiples egresados
                for (const graduateId of selectedGraduates) {
                    const graduate = graduates.find(g => g.id === graduateId);
                    if (!graduate) continue;

                    // Primero eliminamos el registro de egresado
                    await fetch(`http://localhost:8080/api/egresados/${graduate.id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    // Luego eliminamos el usuario asociado
                    await fetch(`http://localhost:8080/api/usuarios/${graduate.usuarioId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                }
                // Actualizamos la lista filtrando los eliminados
                setGraduates(prev => prev.filter(g => !selectedGraduates.includes(g.id)));
                // Limpiamos la selección
                setSelectedGraduates([]);
            } else {
                // Si se está eliminando un solo egresado
                const graduate = graduates.find(g => g.id === id);
                if (!graduate) {
                    throw new Error("Egresado no encontrado");
                }

                try {
                    // Primero eliminamos el registro de egresado
                    const resEgresado = await fetch(`http://localhost:8080/api/egresados/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (!resEgresado.ok) {
                        const errorData = await resEgresado.json();
                        throw new Error(errorData.mensaje || "Error al eliminar el egresado");
                    }

                    // Luego eliminamos el usuario asociado
                    const resUsuario = await fetch(`http://localhost:8080/api/usuarios/${graduate.usuarioId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (!resUsuario.ok) {
                        const errorData = await resUsuario.json();
                        throw new Error(errorData.mensaje || "Error al eliminar el usuario");
                    }

                    // Actualizamos la lista filtrando el eliminado
                    setGraduates(prev => prev.filter(g => g.id !== id));
                } catch (error: any) {
                    console.error("Error al eliminar:", error);
                    // Si el error es porque no se encuentra, podemos asumir que ya fue eliminado
                    if (error.message.includes("no encontrado")) {
                        // Actualizamos la lista de todos modos
                        setGraduates(prev => prev.filter(g => g.id !== id));
                    } else {
                        throw error; // Re-lanzamos otros tipos de errores
                    }
                }
            }

            // Cerramos el diálogo de confirmación
            setDeleteConfirmation(null);

            toast({
                title: "Eliminación completada",
                description: id === "multiple"
                    ? `${selectedGraduates.length} egresados eliminados correctamente`
                    : "Egresado eliminado correctamente"
            });
        } catch (error) {            toast({
                variant: "destructive",
                title: "Error durante la eliminación",
                description: `${error}`
            });
        }
    };

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="text-lg font-semibold">Gestión de Egresados</h1>
                </div>
            </header>            <div className="flex-1 overflow-auto">
                <div className="container py-8 space-y-6 font-inter">
                    {/* Header mejorado */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-utp-600 to-utp-500 p-8 text-white shadow-2xl">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                                    <User className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight">Gestión de Egresados</h1>
                                    <p className="text-white/90 text-lg">Administra los usuarios egresados, sus roles y configuraciones de seguridad.</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
                        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5"></div>
                    </div>            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-utp-50 to-blue-50 rounded-t-lg border-b border-gray-200">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">                        <div>
                            <CardTitle className="flex items-center gap-2 text-utp-700 font-inter font-semibold">
                                <Users className="h-5 w-5" />
                                Lista de Egresados
                            </CardTitle>
                            <CardDescription className="text-gray-600 font-inter font-medium">
                                {selectedGraduates.length === 0
                                    ? `${filteredGraduates.length} egresados encontrados`
                                    : `${selectedGraduates.length} egresados seleccionados`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">                            <Tabs
                                value={filter}
                                onValueChange={setFilter}
                                className="w-full sm:w-auto"
                            >
                                <TabsList className="bg-white/80 backdrop-blur-sm border border-utp-200 shadow-lg">
                                    <TabsTrigger value="todos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-500 data-[state=active]:to-utp-600 data-[state=active]:text-white data-[state=active]:font-medium data-[state=active]:shadow-lg">
                                        Todos
                                    </TabsTrigger>
                                    <TabsTrigger value="activos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-500 data-[state=active]:to-utp-600 data-[state=active]:text-white data-[state=active]:font-medium data-[state=active]:shadow-lg">
                                        Activos
                                    </TabsTrigger>
                                    <TabsTrigger value="inactivos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-utp-500 data-[state=active]:to-utp-600 data-[state=active]:text-white data-[state=active]:font-medium data-[state=active]:shadow-lg">
                                        Inactivos
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center">                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-utp-500" />
                            <Input
                                placeholder="Buscar por nombre o correo electrónico..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 border-utp-200 focus:border-utp-500 focus:ring-utp-500/20 bg-white/80 backdrop-blur-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedGraduates.length > 0 && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeleteConfirmation("multiple")}
                                        className="border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-medium"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                        Eliminar Seleccionados
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-gray-200 text-gray-700 hover:border-[#5b36f2] hover:text-[#5b36f2] font-medium"
                                            >
                                                Acciones
                                                <ChevronDown className="ml-1.5 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Desactivar 2FA</DropdownMenuItem>
                                            <DropdownMenuItem>Activar cuentas</DropdownMenuItem>
                                            <DropdownMenuItem>Desactivar cuentas</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </> )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-gray-200 text-gray-700 font-medium"
                                    >
                                        <Filter className="h-4 w-4 mr-1.5" />
                                        Filtros Avanzados
                                        <ChevronDown className="ml-1.5 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ver por rol</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setFilter("admin")}>Solo Administradores</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Ver por 2FA</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setFilter("con2fa")}>Con 2FA</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter("sin2fa")}>Sin 2FA</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Gestión de Egresados</h1>
                            <Button
                                className="bg-[#5b36f2] hover:bg-[#4c2bd4] text-white font-medium"
                                onClick={() => setIsCreatingGraduate(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-1.5" />
                                Nuevo Egresado
                            </Button>
                        </div>



                        {isCreatingGraduate && (
                            <Dialog open={isCreatingGraduate} onOpenChange={() => setIsCreatingGraduate(false)}>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Crear Nuevo Egresado</DialogTitle>
                                        <DialogDescription>
                                            Completa los datos para crear un nuevo egresado en el sistema.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-name" className="text-right">
                                                Nombre
                                            </Label>
                                            <Input
                                                id="new-name"
                                                value={newGraduate.name}
                                                onChange={(e) => setNewGraduate({...newGraduate, name: e.target.value})}
                                                placeholder="Nombre completo"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-email" className="text-right">
                                                Email
                                            </Label>
                                            <Input
                                                id="new-email"
                                                type="email"
                                                value={newGraduate.email}
                                                readOnly
                                                placeholder="correo@utp.edu.pe"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-username" className="text-right">
                                                Usuario
                                            </Label>
                                            <Input
                                                id="new-username"
                                                value={newGraduate.username}
                                                onChange={(e) => setNewGraduate({...newGraduate, username: e.target.value})}
                                                placeholder="Nombre de usuario"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-password" className="text-right">
                                                Contraseña
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newGraduate.password}
                                                onChange={(e) => setNewGraduate({...newGraduate, password: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-confirm-password" className="text-right">
                                                Confirmar Contraseña
                                            </Label>
                                            <Input
                                                id="new-confirm-password"
                                                type="password"
                                                value={newGraduate.confirmPassword}
                                                onChange={(e) => setNewGraduate({...newGraduate, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-codigo" className="text-right">
                                                Código Estudiante
                                            </Label>
                                            <Input
                                                id="new-codigo"
                                                value={newGraduate.codigoEstudiante}
                                                onChange={(e) => {
                                                    const codigo = e.target.value;
                                                    setNewGraduate({
                                                        ...newGraduate,
                                                        codigoEstudiante: codigo,
                                                        email: codigo ? `${codigo}@utp.edu.pe` : "",
                                                        username: codigo
                                                    });
                                                }}
                                                placeholder="Código único"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-career" className="text-right">
                                                Carrera
                                            </Label>
                                            <Input
                                                id="new-career"
                                                value={newGraduate.career}
                                                onChange={(e) => setNewGraduate({...newGraduate, career: e.target.value})}
                                                placeholder="Carrera universitaria"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-graduation-year" className="text-right">
                                                Año de Graduación
                                            </Label>
                                            <Input
                                                id="new-graduation-year"
                                                type="number"
                                                value={newGraduate.graduationYear}
                                                onChange={(e) => setNewGraduate({...newGraduate, graduationYear: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-employed" className="text-right">
                                                Estado Laboral
                                            </Label>
                                            <Select
                                                value={newGraduate.employed ? "empleado" : "desempleado"}
                                                onValueChange={(value) => setNewGraduate({...newGraduate, employed: value === "empleado"})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="empleado">Empleado</SelectItem>
                                                    <SelectItem value="desempleado">Desempleado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="new-role" className="text-right">
                                                Rol
                                            </Label>
                                            <Select
                                                value={newGraduate.role}
                                                onValueChange={(value) => setNewGraduate({...newGraduate, role: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GRADUATE">Egresado</SelectItem>
                                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setIsCreatingGraduate(false)} variant="outline">
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleCreateGraduate} className="bg-[#5b36f2] hover:bg-[#4c2bd4]">
                                            Crear Egresado
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Modal de edición (ya existente) */}
                        {editingGraduate && (
                            <Dialog open={!!editingGraduate} onOpenChange={() => setEditingGraduate(null)}>
                                {/* ...contenido del modal de edición... */}
                            </Dialog>
                        )}
                    </div>


                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/70 hover:bg-gray-50">
                                    <TableHead className="w-12">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-[#5b36f2] focus:ring-[#5b36f2]/20"
                                                checked={selectedGraduates.length > 0 && selectedGraduates.length === filteredGraduates.length}
                                                onChange={handleSelectAll}
                                            />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">Nombre / Email</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Carrera / Año</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Rol</TableHead>
                                    <TableHead className="font-semibold text-gray-700">2FA</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentGraduates.map.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="bg-[#f7f5ff] p-3 rounded-full">
                                                    <Search className="h-5 w-5 text-[#5b36f2]" />
                                                </div>
                                                <div className="font-medium text-gray-600">No se encontraron egresados</div>
                                                <div className="text-sm text-gray-500">Intenta modificar los filtros o realiza una búsqueda diferente</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentGraduates.map((graduate) => (
                                        <TableRow key={graduate.id} className="hover:bg-[#f9f8ff]">
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-[#5b36f2] focus:ring-[#5b36f2]/20"
                                                        checked={selectedGraduates.includes(graduate.id)}
                                                        onChange={() => handleToggleSelect(graduate.id)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-[#eee9fe]">
                                                        <AvatarImage src="" />
                                                        <AvatarFallback className="bg-[#eee9fe] text-[#5b36f2] font-bold">
                                                            {graduate.name.split(' ').map((n: string) => n[0]).join('')}

                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{graduate.name}</p>
                                                        <p className="text-xs text-gray-500">{graduate.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-gray-800">{graduate.career}</p>
                                                <p className="text-xs text-gray-500">Promoción {graduate.graduationYear}</p>
                                            </TableCell>
                                            <TableCell>
                                                {graduate.status === "active" ? (
                                                    <Badge className="bg-green-50 text-green-700 hover:bg-green-50 font-medium px-2.5 py-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                            <span>Activo</span>
                                                        </div>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50 px-2.5 py-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                                                            <span>Inactivo</span>
                                                        </div>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {graduate.role === "ADMIN" ? (
                                                    <Badge className="bg-[#eee9fe] text-[#5b36f2] hover:bg-[#eee9fe] font-medium px-2.5 py-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <Shield className="h-3 w-3" />
                                                            <span>Admin</span>
                                                        </div>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>Egresado</span>
                                                        </div>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {graduate.has2FA ? (
                                                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                                        <CheckCircle className="h-5 w-5 fill-green-100" />
                                                        <span className="text-xs">Activo</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <XCircle className="h-5 w-5" />
                                                        <span className="text-xs">Inactivo</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggle2FA(graduate)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:bg-[#f7f5ff] hover:text-[#5b36f2]"
                                                        title={graduate.has2FA ? "Desactivar 2FA" : "Activar 2FA"}
                                                    >
                                                        {graduate.has2FA ? (
                                                            <ShieldOff className="h-4 w-4" />
                                                        ) : (
                                                            <Shield className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-gray-500 hover:bg-[#f7f5ff] hover:text-[#5b36f2]"
                                                                title="Cambiar rol"
                                                            >
                                                                <UserCog className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                disabled={graduate.role === "ADMIN"}
                                                                onClick={() => handleChangeRole(graduate, "ADMIN")}
                                                                className={graduate.role === "ADMIN" ? "text-gray-400 pointer-events-none" : ""}
                                                            >
                                                                Hacer administrador
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                disabled={graduate.role === "GRADUATE"}
                                                                onClick={() => handleChangeRole(graduate, "GRADUATE")}
                                                                className={graduate.role === "GRADUATE" ? "text-gray-400 pointer-events-none" : ""}
                                                            >
                                                                Hacer egresado
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditGraduate(graduate)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:bg-[#f7f5ff] hover:text-[#5b36f2]"
                                                        title="Editar egresado"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDeleteConfirmation(graduate.id)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600 font-medium">
                            Mostrando {filteredGraduates.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredGraduates.length)} de {filteredGraduates.length} registros
                            • Página {currentPage} de {totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-gray-200 text-gray-700 font-medium"
                                disabled={currentPage === 1 || filteredGraduates.length === 0}
                                onClick={goToPreviousPage}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-200 text-gray-700 hover:border-[#5b36f2] hover:text-[#5b36f2] font-medium"
                                disabled={currentPage === totalPages || filteredGraduates.length === 0}
                                onClick={goToNextPage}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {editingGraduate && (
                <Dialog open={!!editingGraduate} onOpenChange={() => setEditingGraduate(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-[#5b36f2] font-bold">Editar información de
                                egresado</DialogTitle>
                            <DialogDescription className="font-medium">
                                Actualiza los datos personales y académicos del egresado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="font-medium text-gray-700">Nombre completo</Label>
                                <Input
                                    id="name"
                                    value={editingGraduate.name}
                                    onChange={e => setEditingGraduate({...editingGraduate, name: e.target.value})}
                                    className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="codigoEstudiante" className="font-medium text-gray-700">Código de
                                    estudiante</Label>
                                <Input
                                    id="codigoEstudiante"
                                    value={editingGraduate.codigoEstudiante || ""}
                                    onChange={e => setEditingGraduate({
                                        ...editingGraduate,
                                        codigoEstudiante: e.target.value
                                    })}
                                    className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-medium text-gray-700">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editingGraduate.email}
                                    onChange={e => setEditingGraduate({...editingGraduate, email: e.target.value})}
                                    className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="career" className="font-medium text-gray-700">Carrera</Label>
                                    <Input
                                        id="career"
                                        value={editingGraduate.career}
                                        onChange={e => setEditingGraduate({...editingGraduate, career: e.target.value})}
                                        className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="graduationYear" className="font-medium text-gray-700">Año de
                                        egreso</Label>
                                    <Input
                                        id="graduationYear"
                                        type="number"
                                        value={editingGraduate.graduationYear}
                                        onChange={e => setEditingGraduate({
                                            ...editingGraduate,
                                            graduationYear: Number(e.target.value)
                                        })}
                                        className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role" className="font-medium text-gray-700">Rol</Label>
                                <Select
                                    value={editingGraduate.role}
                                    onValueChange={(value) => setEditingGraduate({...editingGraduate, role: value})}
                                >
                                    <SelectTrigger id="role"
                                                   className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GRADUATE">Egresado</SelectItem>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status" className="font-medium text-gray-700">Estado</Label>
                                <Select
                                    value={editingGraduate.status}
                                    onValueChange={(value) => setEditingGraduate({...editingGraduate, status: value})}
                                >
                                    <SelectTrigger id="status"
                                                   className="border-gray-200 focus:border-[#5b36f2] focus:ring-[#5b36f2]/20">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                            <div className="grid gap-2">
                                <Label className="font-medium text-gray-700">Configuración de seguridad</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="has2fa"
                                        checked={editingGraduate.has2FA}
                                        onChange={e => setEditingGraduate({
                                            ...editingGraduate,
                                            has2FA: e.target.checked
                                        })}
                                        className="h-4 w-4 rounded border-gray-300 text-[#5b36f2] focus:ring-[#5b36f2]/20"
                                    />
                                    <Label htmlFor="has2fa" className="font-medium cursor-pointer">
                                        Autenticación de dos factores (2FA)
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingGraduate(null)}
                                    className="border-gray-200 font-medium">Cancelar</Button>
                            <Button
                                onClick={handleSaveEdit}
                                className="bg-[#5b36f2] hover:bg-[#4c2bd4] text-white font-medium"
                            >
                            Guardar cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Diálogo de confirmación de eliminación */}
            {deleteConfirmation && (
                <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 font-bold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Confirmar eliminación
                            </DialogTitle>
                            <DialogDescription className="font-medium text-gray-700">
                                {deleteConfirmation === "multiple"
                                    ? `¿Estás seguro de que deseas eliminar ${selectedGraduates.length} usuarios seleccionados?`
                                    : `¿Estás seguro de que deseas eliminar este usuario?`
                                }
                                <p className="mt-2 text-red-500">Esta acción no se puede deshacer.</p>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteConfirmation(null)}
                                className="border-gray-200 font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleDeleteUser(deleteConfirmation)}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium"
                            >
                                Sí, eliminar
                            </Button>                        </DialogFooter>                    </DialogContent>
                </Dialog>
            )}

                </div>
            </div>
        </div>
    )
}