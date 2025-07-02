"use client"

import { FileText, MoreHorizontal, PieChart, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useRecentSurveys } from "@/hooks/use-surveys-data"

export function AdminRecentSurveys() {
  const { surveys, loading, error } = useRecentSurveys()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">Encuestas Recientes</h3>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Nueva Encuesta
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Cargando encuestas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">Encuestas Recientes</h3>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Nueva Encuesta
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Encuestas Recientes</h3>
        <Button size="sm">
          <Send className="mr-2 h-4 w-4" />
          Nueva Encuesta
        </Button>
      </div>
      <div className="space-y-4">
        {surveys.map((survey) => (
          <Card key={survey.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="rounded-md bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{survey.title}</h4>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <span>Enviada: {survey.date}</span>
                      <span className="mx-2">•</span>
                      <span>Estado: {survey.status}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <PieChart className="mr-2 h-4 w-4" />
                      Ver resultados
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="mr-2 h-4 w-4" />
                      Reenviar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Exportar datos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>
                    Respuestas: {survey.responses.toLocaleString()}/{survey.totalSent.toLocaleString()}
                  </span>
                  <span>
                    {survey.totalSent > 0 ? Math.round((survey.responses / survey.totalSent) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={survey.totalSent > 0 ? (survey.responses / survey.totalSent) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
