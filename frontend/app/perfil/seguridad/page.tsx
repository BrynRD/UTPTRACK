
import ProtectedRoute from "@/components/ProtectedRoute";
import PerfilSeguridad from "@/components/dashboard/PerfilSeguridad";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function SeguridadPage() {
    return (
        <ProtectedRoute>
            <div className="flex h-full w-full flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold">Configuración de Seguridad</h1>
                    </div>
                </header>
                <div className="flex-1 overflow-auto">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-2xl font-bold mb-6">Configuración de seguridad</h1>
                        <PerfilSeguridad />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

