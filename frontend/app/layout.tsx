import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"  // Añadir esta importación

export const metadata = {
    title: "UTPTRACK",
    description: "Plataforma para el seguimiento de egresados de la UTP",
    icons: {
        icon: "/public/favicon.ico",
    }
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
        <Toaster />  {/* Añadir el componente Toaster aquí */}
        </body>
        </html>
    )
}