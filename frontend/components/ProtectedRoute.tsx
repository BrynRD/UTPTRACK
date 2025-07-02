"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
}

// Mapea el rol del backend a un valor simple
function mapRole(role: string | null) {
    if (role === "ROLE_ADMIN") return "ADMIN";
    if (role === "ROLE_EGRESADO") return "EGRESADO";
    return role;
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoading, isAuthenticated, role } = useAuth();
    const mappedRole = mapRole(role);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Verifica acceso a rutas específicas
        if (pathname.startsWith("/admin") && mappedRole !== "ADMIN") {
            router.push("/unauthorized");
            return;
        }

        // Verifica roles requeridos
        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(mappedRole || "")) {
                router.push("/unauthorized");
                return;
            }
        }
    }, [isLoading, isAuthenticated, mappedRole, pathname, requiredRoles, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}