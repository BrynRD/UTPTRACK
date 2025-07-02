"use client"

import { useState, useEffect } from 'react'

interface SurveyData {
  id: number
  title: string
  date: string
  responses: number
  totalSent: number
  status: string
}

export function useRecentSurveys() {
  const [surveys, setSurveys] = useState<SurveyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener token de autenticación
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No se encontró token de autenticación')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Obtener datos de egresados para simular encuestas
        const egresadosResponse = await fetch('http://localhost:8080/api/egresados', { headers })
        if (!egresadosResponse.ok) {
          throw new Error('Error al obtener datos de egresados')
        }
        const egresadosData = await egresadosResponse.json()
        const totalEgresados = egresadosData.length || 0

        // Obtener estadísticas para calcular respuestas
        const statsResponse = await fetch('http://localhost:8080/api/reportes/estadisticas', { headers })
        const statsData = statsResponse.ok ? await statsResponse.json() : null
        const respondedSurveys = statsData ? (statsData.totalEmpleados + statsData.totalDesempleados) : 0

        // Generar datos de encuestas basados en información real
        const currentDate = new Date()
        const generatedSurveys: SurveyData[] = [
          {
            id: 1,
            title: "Situación Laboral Actual",
            date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            responses: respondedSurveys,
            totalSent: totalEgresados,
            status: totalEgresados > 0 ? "Activa" : "Pendiente",
          },
          {
            id: 2,
            title: "Satisfacción con la Formación Académica",
            date: new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            responses: Math.floor(respondedSurveys * 0.8),
            totalSent: totalEgresados,
            status: "Activa",
          },
          {
            id: 3,
            title: "Evaluación de Salarios",
            date: new Date(currentDate.getTime() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            responses: Math.floor(respondedSurveys * 0.7),
            totalSent: totalEgresados,
            status: "Cerrada",
          },
          {
            id: 4,
            title: "Habilidades Requeridas en el Trabajo",
            date: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            responses: Math.floor(respondedSurveys * 0.9),
            totalSent: totalEgresados,
            status: "Cerrada",
          },
        ]

        setSurveys(generatedSurveys)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching surveys:', err)
        
        // Usar datos de ejemplo en caso de error
        const fallbackSurveys: SurveyData[] = [
          {
            id: 1,
            title: "Satisfacción con la formación académica",
            date: "15/05/2025",
            responses: 342,
            totalSent: 500,
            status: "Activa",
          },
          {
            id: 2,
            title: "Evaluación de salarios en el mercado",
            date: "02/05/2025",
            responses: 287,
            totalSent: 450,
            status: "Activa",
          },
          {
            id: 3,
            title: "Habilidades más utilizadas en el trabajo",
            date: "20/04/2025",
            responses: 412,
            totalSent: 500,
            status: "Cerrada",
          },
        ]
        setSurveys(fallbackSurveys)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  return { surveys, loading, error }
}
