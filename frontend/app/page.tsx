import Link from "next/link"
import { ArrowRight, BarChart3, BookOpen, Briefcase, CheckCircle, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
      <div className="flex min-h-screen flex-col w-full">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-green-600 p-1 text-white">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 1 3 3 3h6c2 0 3-1 3-3v-5" />
                </svg>
              </div>
              <span className="text-xl font-bold">UTPTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium">
                Iniciar Sesión
              </Link>
              <Button asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      Seguimiento de Egresados UTP
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      Conectando egresados con oportunidades laborales y monitoreando su desarrollo profesional.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild size="lg">
                      <Link href="/register">
                        Registrarse <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <img
                      alt="UTPTrack Dashboard"
                      className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                      height="310"
                      src="/placeholder.svg?height=310&width=550"
                      width="550"
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Características Principales
                  </h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    UTPTrack ofrece herramientas completas para el seguimiento y desarrollo profesional de egresados.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Estadísticas de Empleabilidad</h3>
                  <p className="text-center text-muted-foreground">
                    Visualiza datos de empleabilidad por carrera y año de egreso.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Oportunidades Laborales</h3>
                  <p className="text-center text-muted-foreground">
                    Accede a ofertas laborales exclusivas para egresados UTP.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Cursos Recomendados</h3>
                  <p className="text-center text-muted-foreground">
                    Recibe recomendaciones de cursos basadas en tu perfil profesional.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Red de Egresados</h3>
                  <p className="text-center text-muted-foreground">
                    Conecta con otros egresados de tu carrera y promoción.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Seguimiento Personalizado</h3>
                  <p className="text-center text-muted-foreground">
                    Actualiza tu información laboral y recibe seguimiento personalizado.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Reportes Detallados</h3>
                  <p className="text-center text-muted-foreground">
                    Accede a reportes detallados sobre la situación laboral de egresados.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="w-full border-t bg-background py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2025 UTPTrack. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Términos
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Privacidad
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Contacto
              </Link>
            </div>
          </div>
        </footer>
      </div>
  )
}
