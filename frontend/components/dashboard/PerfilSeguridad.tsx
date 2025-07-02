"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2, Shield, AlertCircle, CheckCircle } from "lucide-react";
import {AnimatedIcon} from "@/components/ui/animated-icon";

// Definición de constantes
const API_URL = 'http://localhost:8080';

// Defino interfaces para los tipos
interface Estado2FA {
    activado: boolean;
    cargando: boolean;
    error: string | null;
}

interface DatosQR {
    secreto: string;
    qrCode: string;
}

export default function PerfilSeguridad() {
    const [estado2fa, setEstado2fa] = useState<Estado2FA>({
        activado: false,
        cargando: true,
        error: null
    });
    const [configurando, setConfigurando] = useState(false);
    const [datosQr, setDatosQr] = useState<DatosQR | null>(null);
    const [codigo, setCodigo] = useState("");
    const [step, setStep] = useState<"inicial" | "configurando" | "exito">("inicial");
    const [error, setError] = useState("");

    // Verificar estado inicial de 2FA
    useEffect(() => {
        const verificarEstado2FA = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/auth/2fa/estado`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEstado2fa({
                        activado: data.activado,
                        cargando: false,
                        error: null
                    });
                } else {
                    setEstado2fa({
                        activado: false,
                        cargando: false,
                        error: "No se pudo obtener el estado de 2FA"
                    });
                }
            } catch (error) {
                setEstado2fa({
                    activado: false,
                    cargando: false,
                    error: "Error al verificar estado de 2FA"
                });
            }
        };

        verificarEstado2FA();
    }, []);

    // Iniciar configuración de 2FA
    const iniciarConfiguracion = async () => {
        setConfigurando(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/2fa/configurar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDatosQr(data);
                setStep("configurando");
            } else {
                const errorData = await response.text();
                console.error("Error en la respuesta:", response.status, errorData);
                setError("No se pudo iniciar la configuración 2FA");
            }
        } catch (error) {
            console.error("Error al iniciar configuración:", error);
            setError("Error de conexión");
        }
    };

    // Activar 2FA
    const activar2FA = async () => {
        if (!datosQr) return;
        setError("");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/2fa/activar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    secreto: datosQr.secreto,
                    codigo: parseInt(codigo)
                })
            });

            if (response.ok) {
                setEstado2fa({...estado2fa, activado: true});
                setStep("exito");
            } else {
                const errorData = await response.text();
                setError("Código inválido. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error activando 2FA:", error);
            setError("Error al activar 2FA");
        }
    };

    // Desactivar 2FA
    const desactivar2FA = async () => {
        if (confirm("¿Estás seguro de que quieres desactivar la autenticación de dos factores?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/auth/2fa/desactivar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setEstado2fa({...estado2fa, activado: false});
                }
            } catch (error) {
                console.error("Error desactivando 2FA:", error);
            }
        }
    };

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

            <p className="text-gray-600 mb-4">
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
                className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
            >
                Comenzar configuración
            </Button>
        </div>
    );

    const renderConfiguracion = () => (
        <div className="space-y-6">
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
                    {datosQr && (
                        <Image
                            src={`data:image/png;base64,${datosQr.qrCode}`}
                            alt="Código QR para 2FA"
                            width={200}
                            height={200}
                            className="max-w-full h-auto"
                        />
                    )}
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Código de configuración manual:</p>
                <p className="font-mono tracking-wider text-gray-800 select-all">{datosQr?.secreto}</p>
            </div>

            <div className="space-y-2">
                <div className="font-medium text-gray-700">Código de verificación</div>
                <Input
                    type="text"
                    className="w-full p-2 border rounded text-center text-lg tracking-wider"
                    placeholder="Ingresa el código de 6 dígitos"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
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

            <div className="flex gap-2 mt-2">
                <Button
                    onClick={activar2FA}
                    disabled={codigo.length !== 6}
                    className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
                >
                    Verificar y activar
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        setConfigurando(false);
                        setStep("inicial");
                    }}
                    className="h-12 rounded-md"
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );

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
                onClick={() => setStep("inicial")}
                className="w-full h-12 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md"
            >
                Continuar
            </Button>
        </div>
    );

    // Muestra lo que corresponda según el estado
    if (estado2fa.cargando) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Autenticación de dos factores</h2>
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </Card>
        );
    }

    if (estado2fa.error) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Autenticación de dos factores</h2>
                <p className="text-red-500">{estado2fa.error}</p>
            </Card>
        );
    }

    if (estado2fa.activado) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Autenticación de dos factores</h2>
                <div>
                    <div className="mb-4 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-green-600 font-medium">La autenticación de dos factores está activada.</p>
                    </div>
                    <Button onClick={desactivar2FA} variant="destructive">
                        Desactivar 2FA
                    </Button>
                </div>
            </Card>
        );
    }

    if (configurando) {
        return (
            <Card className="p-6">
                {step === "configurando" ? renderConfiguracion() :
                    step === "exito" ? renderExito() : renderInicio()}
            </Card>
        );
    }

    // Muestra la pantalla cuando 2FA no está activada
    if (!estado2fa.activado && !configurando) {
        return (
            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Autenticación de dos factores</h2>
                        <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            No activado
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="font-medium text-amber-800">Tu cuenta es vulnerable</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Sin 2FA, tu cuenta podría ser comprometida incluso si tu contraseña es robada. La
                                    autenticación
                                    de dos factores añade una capa adicional de protección.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex flex-col items-center text-center">

                                <AnimatedIcon
                                    name="Security"
                                    token="af857f3d-6096-42d0-9f04-a9ee72f54aa4"
                                    size={60}
                                    strokeWidth={1.4}
                                />
                                <h3 className="font-medium text-gray-800">Mayor seguridad</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Protege tu cuenta con una segunda capa de verificación
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex flex-col items-center text-center">
                                <AnimatedIcon
                                    name="download"
                                    token="14753700-7e5e-4d5a-9613-15db10f59766"
                                    size={60}
                                    strokeWidth={1.4}
                                />
                                <h3 className="font-medium text-gray-800">Fácil de usar</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Sólo necesitas tu teléfono y una aplicación gratuita
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex flex-col items-center text-center">
                                <AnimatedIcon
                                    name="Running Person"
                                    token="f6cc1292-1aa7-4566-89b2-c5bfa23de4b6"
                                    size={60}
                                    strokeWidth={1.4}
                                />
                                <h3 className="font-medium text-gray-800">Rápido</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    La verificación toma solo segundos adicionales
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={iniciarConfiguracion}
                            className="px-6 h-11 bg-[#5b36f2] hover:bg-[#4a2bd0] text-white font-medium rounded-md flex items-center justify-center shadow-sm"
                        >
                            <Shield className="h-4.5 w-4.5 mr-2"/>
                            Activar autenticación de dos factores
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }
}


