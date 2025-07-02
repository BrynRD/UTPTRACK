"use client"

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalEgresados: number
  totalEmpleados: number
  totalDesempleados: number
  tasaEmpleabilidad: number
  satisfaccionPromedio: number
  encuestasCompletadas: number
  participacionEncuestas: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Esperar un poco para asegurar que el token esté disponible
        await new Promise(resolve => setTimeout(resolve, 100))

        // Obtener token de autenticación
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No se encontró token de autenticación')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Obtener estadísticas generales
        const statsResponse = await fetch('http://localhost:8080/api/reportes/estadisticas', { headers })
        if (!statsResponse.ok) {
          throw new Error('Error al obtener estadísticas')
        }
        const statsData = await statsResponse.json()

        // Obtener total de egresados
        const egresadosResponse = await fetch('http://localhost:8080/api/egresados', { headers })
        if (!egresadosResponse.ok) {
          throw new Error('Error al obtener total de egresados')
        }
        const egresadosData = await egresadosResponse.json()
        const totalEgresados = egresadosData.length || 0

        // Calcular encuestas (aproximación basada en datos disponibles)
        const encuestasCompletadas = statsData.totalEmpleados + statsData.totalDesempleados
        const participacionEncuestas = totalEgresados > 0 ? (encuestasCompletadas / totalEgresados) * 100 : 0

        setStats({
          totalEgresados,
          totalEmpleados: statsData.totalEmpleados || 0,
          totalDesempleados: statsData.totalDesempleados || 0,
          tasaEmpleabilidad: (statsData.tasaEmpleabilidad || 0) * 100,
          satisfaccionPromedio: statsData.satisfaccionPromedio || 0,
          encuestasCompletadas,
          participacionEncuestas
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error, refetch: () => window.location.reload() }
}
