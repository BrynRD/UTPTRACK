"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
  Shield,
  School
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import type { EgresadoData } from "@/app/types/egresado-data"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, role, logout, isLoading } = useAuth()

  // Estado local de respaldo para garantizar que siempre tengamos datos
  const [userData, setUserData] = useState<{
    nombre: string;
    codigoEstudiante?: string;
    carrera?: string;
    anoGraduacion?: number;
    role?: string;
  }>({
    nombre: "Usuario"
  })

  // Efecto para actualizar datos locales cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.egresado?.nombre || user.name || "Usuario",
        codigoEstudiante: user.egresado?.codigoEstudiante,
        carrera: user.egresado?.carrera,
        anoGraduacion: user.egresado?.anoGraduacion,
        role: user.role
      })
    } else if (typeof window !== 'undefined') {
      // Intentar obtener datos de localStorage como respaldo
      try {
        const localStorageUser = JSON.parse(localStorage.getItem("user") || 'null')
        if (localStorageUser) {
          setUserData({
            nombre: localStorageUser.egresado?.nombre || localStorageUser.name || "Usuario",
            codigoEstudiante: localStorageUser.egresado?.codigoEstudiante,
            carrera: localStorageUser.egresado?.carrera,
            anoGraduacion: localStorageUser.egresado?.anoGraduacion,
            role: localStorageUser.role
          })
        }
      } catch (e) {
        console.error("Error al leer datos del usuario desde localStorage:", e)
      }
    }
  }, [user])

  const isAdminSection = pathname.startsWith('/admin')

  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null
  }

  // Estado de carga mientras no tenemos datos
  if (isLoading) {
    return (
        <Sidebar className="border-r transition-all duration-300 font-inter bg-[#fbfaff] border-gray-200">
          <SidebarHeader className="flex items-center justify-center py-6 px-5">
            <div className="flex items-center gap-2">
              <div className="animate-pulse bg-gray-200 h-10 w-40 rounded"></div>
            </div>
          </SidebarHeader>
          <SidebarSeparator className="opacity-50" />
          <SidebarContent className="px-3 py-2">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter className="mt-auto">
            <div className="p-4">
              <div className="flex flex-col rounded-lg border p-4 shadow-sm transition-all bg-white border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-pulse bg-gray-200 rounded-full h-14 w-14"></div>
                  <div className="flex-1">
                    <div className="animate-pulse bg-gray-200 h-5 w-20 rounded mb-2"></div>
                    <div className="animate-pulse bg-gray-100 h-3 w-28 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
    )
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  const graduateMenuItems = [
    { title: "Inicio", url: "/dashboard", icon: Home },
    { title: "Mi Perfil", url: "/perfil", icon: User },
    { title: "Oportunidades Laborales", url: "/jobs", icon: Briefcase },
    { title: "Cursos Recomendados", url: "/courses", icon: BookOpen },
    { title: "Encuestas", url: "/surveys", icon: MessageSquare },
  ]

  const adminMenuItems = [
    { title: "Dashboard", url: "/admin", icon: Home, description: "Vista ejecutiva completa con KPIs y gráficos" },
    { title: "Egresados", url: "/admin/egresados", icon: Users, description: "Gestión de egresados y perfiles" },
    { title: "Reportes", url: "/admin/reports", icon: FileText, description: "Documentos detallados y personalizados" },
    { title: "Encuestas", url: "/admin/surveys", icon: MessageSquare, description: "Gestión de encuestas de seguimiento" },
    { title: "Configuración", url: "/admin/settings", icon: Settings, description: "Configuración del sistema" },
  ]

  return (
      <Sidebar className={cn(
          "border-r transition-all duration-300 font-inter",
          isAdminSection
              ? "bg-white border-gray-200"
              : "bg-[#fbfaff] border-gray-200"
      )}>
        <SidebarHeader className={cn(
            "flex items-center justify-center py-8 px-6",
            isAdminSection && "border-b border-gray-200"
        )}>
          <Link href={isAdminSection ? "/admin" : "/dashboard"} className="flex items-center">
            <div className="flex items-center gap-3">
              {isAdminSection ? (
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8" style={{color: "rgb(91, 54, 242)"}} />
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900">UTP+</span>
                      <span className="text-sm font-medium -mt-1" style={{color: "rgb(91, 54, 242)"}}>Panel Admin</span>
                    </div>
                  </div>
              ) : (
                  <Image
                      src="/logo.png"
                      alt="UTP+class"
                      width={150}
                      height={30}
                      className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  />
              )}
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator className="opacity-50" />
        <SidebarContent className={cn(
            "px-4 py-6",
            isAdminSection && "bg-transparent"
        )}>
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
                "text-xs uppercase tracking-wider font-semibold px-3 mb-4",
                isAdminSection ? "" : "text-gray-500"
            )} style={isAdminSection ? {color: "rgb(91, 54, 242)"} : undefined}>
              {isAdminSection ? "Panel Administrativo" : "Mi Seguimiento"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {(isAdminSection ? adminMenuItems : graduateMenuItems).map((item) => {
                  const active = isActive(item.url);
                  return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.title}
                            className={cn(
                                "my-1 rounded-xl transition-all duration-300",
                                isAdminSection
                                    ? active 
                                        ? "font-medium" 
                                        : "text-gray-700 hover:bg-gray-50"
                                    : active 
                                        ? "bg-[#eee9fe] text-utp-500 font-medium" 
                                        : "text-gray-700 hover:bg-[#f0ecfd]"
                            )}
                            style={isAdminSection && active ? {
                                backgroundColor: "rgba(91, 54, 242, 0.1)",
                                color: "rgb(91, 54, 242)"
                            } : undefined}
                        >
                          <Link href={item.url} className="flex items-center gap-3 px-4 py-3 w-full">
                            <item.icon className={cn(
                                "h-5 w-5 transition-all duration-200",
                                isAdminSection 
                                  ? active ? "" : "text-gray-600"
                                  : active ? "text-utp-500" : "text-gray-600"
                            )} style={isAdminSection && active ? {color: "rgb(91, 54, 242)"} : undefined} />
                            <span className={cn(
                                "text-sm transition-all duration-200",
                                isAdminSection 
                                  ? active ? "font-medium" : ""
                                  : active ? "font-medium" : ""
                            )}>
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <div className="p-4">
            <div className={cn(
              "flex flex-col rounded-lg border p-4 shadow-sm transition-all",
              isAdminSection 
                ? "bg-white border-gray-200" 
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className={cn(
                    "h-12 w-12 border-2 transition-all",
                    isAdminSection ? "" : "border-gray-200"
                )} style={isAdminSection ? {borderColor: "rgba(91, 54, 242, 0.3)"} : undefined}>
                  <AvatarImage src="/placeholder-user.jpg" alt={userData.nombre} />
                  <AvatarFallback className={cn(
                      "text-sm font-semibold",
                      isAdminSection 
                        ? "text-white" 
                        : "bg-utp-500 text-white"
                  )} style={isAdminSection ? {backgroundColor: "rgb(91, 54, 242)"} : undefined}>
                    {userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 max-w-full">
                  <p className={cn(
                      "text-sm font-semibold mb-1 truncate",
                      isAdminSection ? "text-gray-800" : "text-gray-800"
                  )} title={userData.nombre}>
                    {userData.nombre}
                  </p>
                  {!isAdminSection && (
                      <div className="flex flex-col text-xs">
                        {userData.carrera && (
                            <span className="text-utp-500 font-medium truncate" title={userData.carrera}>
                        {userData.carrera} {userData.anoGraduacion && `(${userData.anoGraduacion})`}
                      </span>
                        )}
                        {userData.codigoEstudiante && (
                            <span className="text-gray-500 truncate" title={userData.codigoEstudiante}>
                        {userData.codigoEstudiante}
                      </span>
                        )}
                      </div>
                  )}
                  {isAdminSection && (
                      <span className="flex items-center gap-1.5 text-xs font-medium" style={{color: "rgb(91, 54, 242)"}}>
                    <Shield className="h-3.5 w-3.5" />
                    <span>Administrador</span>
                  </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-2 text-xs transition-all py-2 px-4 rounded-lg font-medium",
                        isAdminSection
                            ? "hover:text-white"
                            : "hover:bg-red-50 hover:text-red-600"
                    )}
                    style={isAdminSection ? {
                        "--hover-bg": "rgba(91, 54, 242, 0.1)"
                    } as React.CSSProperties : undefined}
                    onMouseEnter={(e) => {
                        if (isAdminSection) {
                            (e.target as HTMLElement).style.backgroundColor = "rgba(91, 54, 242, 0.1)";
                            (e.target as HTMLElement).style.color = "rgb(91, 54, 242)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (isAdminSection) {
                            (e.target as HTMLElement).style.backgroundColor = "";
                            (e.target as HTMLElement).style.color = "";
                        }
                    }}
                    title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
  )
}