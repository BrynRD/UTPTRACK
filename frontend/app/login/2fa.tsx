"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"

export default function ConfigurarDosFactoresPage() {
    const router = useRouter()
    const [qrCode, setQrCode] = useState("")
    const [secreto, setSecreto] = useState("")
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [step, setStep] = useState("inicio") // inicio, configurar, exito
    const [isLoading, setIsLoading] = useState(false)

    const iniciarConfiguracion = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/2fa/configurar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al configurar 2FA')
            }

            setQrCode(data.qrCode)
            setSecreto(data.secreto)
            setStep("configurar")
        } catch (error: any) {
            setError(error.message || 'Error al iniciar configuración 2FA')
        } finally {
            setIsLoading(false)
        }
    }

    const activarDosFactores = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/2fa/activar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    secreto,
                    codigo: parseInt(codigo)
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al activar 2FA')
            }

            setStep("exito")
        } catch (error: any) {
            setError(error.message || 'Código inválido, inténtalo de nuevo')
        } finally {
            setIsLoading(false)
        }
    }

    const renderInicio = () => (
        <div className="space-y-6 text-center">
            <div className="flex justify-center mb-2">
                <div className="rounded-full bg-[#eee9fe] p-4">
                    <Shield size={32} className="text-[#5b36f2]" />
                </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-800">
                Configurar autenticación de dos factores
            </h1>

            <p className="text-gray-600">
                La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta.
                Además de tu contraseña, necesitarás un código temporal generado por una aplicación
                de autenticación en tu dispositivo móvil.
            </p>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 flex items-start text-left">
                <AlertCircle size={20} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-medium text-blue-800">Antes de comenzar</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Necesitarás descargar una aplicación de autenticación como Google Authenticator,
                        Microsoft Authenticator o Authy en tu dispositivo móvil.
                    </p>
                </div>
            </div>

            <Button
                type="button"
                onClick={iniciarConfiguracion}
                disabled={isLoading}
                className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
            >
                {isLoading ? "Preparando..." : "Comenzar configuración"}
            </Button>
        </div>
    )

    const renderConfigurar = () => (
        <form onSubmit={activarDosFactores} className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Configura tu aplicación
                </h1>

                <p className="text-gray-600 mb-4">
                    Escanea este código QR con tu aplicación de autenticación o ingresa el código de configuración manualmente.
                </p>
            </div>

            <div className="flex justify-center my-6">
                <div className="p-3 bg-white border border-gray-200 rounded-md">
                    {qrCode && (
                        <Image
                            src={`data:image/png;base64,${qrCode}`}
                            alt="Código QR para configurar 2FA"
                            width={200}
                            height={200}
                            className="max-w-full h-auto"
                        />
                    )}
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Código de configuración manual:</p>
                <p className="font-mono tracking-wider text-gray-800 select-all">{secreto}</p>
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
                    Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación
                </p>
            </div>

            {error && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading || !codigo || codigo.length !== 6}
                className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
            >
                {isLoading ? "Verificando..." : "Verificar y activar"}
            </Button>
        </form>
    )

    const renderExito = () => (
        <div className="space-y-6 text-center">
            <div className="flex justify-center mb-2">
                <div className="rounded-full bg-[#edfaf1] p-4">
                    <CheckCircle size={32} className="text-[#10b981]" />
                </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-800">
                ¡Configuración completada!
            </h1>

            <p className="text-gray-600">
                La autenticación de dos factores ha sido activada correctamente para tu cuenta.
                A partir de ahora, necesitarás un código de verificación cada vez que inicies sesión.
            </p>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-start text-left">
                <AlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-medium text-yellow-800">Importante</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Guarda los códigos de recuperación en un lugar seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación.
                    </p>
                </div>
            </div>

            <Button
                type="button"
                onClick={() => router.push('/perfil')}
                className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
            >
                Volver a mi perfil
            </Button>
        </div>
    )

    const renderStep = () => {
        switch (step) {
            case "inicio": return renderInicio()
            case "configurar": return renderConfigurar()
            case "exito": return renderExito()
            default: return renderInicio()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                {renderStep()}
            </div>
        </div>
    )
}