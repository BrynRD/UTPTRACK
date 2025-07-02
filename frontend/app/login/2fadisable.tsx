"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle } from "lucide-react"

export default function DesactivarDosFactoresPage() {
    const router = useRouter()
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const desactivarDosFactores = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/2fa/desactivar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    codigo: parseInt(codigo)
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al desactivar 2FA')
            }

            router.push('/perfil?mensaje=2FA-desactivado')
        } catch (error: any) {
            setError(error.message || 'Código inválido, inténtalo de nuevo')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <form onSubmit={desactivarDosFactores} className="space-y-6">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-[#fef2f2] p-4">
                            <Shield size={32} className="text-red-500" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                            Desactivar autenticación de dos factores
                        </h1>

                        <p className="text-gray-600 mb-4">
                            Estás a punto de desactivar la autenticación de dos factores para tu cuenta.
                            Esto reducirá la seguridad de tu cuenta.
                        </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-md border border-orange-200 flex items-start">
                        <AlertTriangle size={20} className="text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-orange-800">Advertencia de seguridad</h3>
                            <p className="text-sm text-orange-700 mt-1">
                                Al desactivar 2FA, tu cuenta será más vulnerable. Recomendamos mantener esta capa adicional de seguridad.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="codigo" className="text-gray-700 font-medium">Código de verificación</Label>
                        <Input
                            id="codigo"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            className="border-gray-300 rounded-md h-12 text-center text-lg tracking-wider"
                        />
                        <p className="text-sm text-gray-500">
                            Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación para confirmar
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 p-3 rounded-md border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            disabled={isLoading || !codigo || codigo.length !== 6}
                            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md"
                        >
                            {isLoading ? "Verificando..." : "Desactivar autenticación de dos factores"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}