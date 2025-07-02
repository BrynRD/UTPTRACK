"use client"

import { useState, useEffect } from 'react'

interface EmploymentData {
  name: string
  empleados: number
  desempleados: number
  tasaEmpleabilidad: number
}

export function useEmploymentByCareer() {
  const [data, setData] = useState<EmploymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmploymentData = async () => {
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

        // Obtener datos de empleabilidad por carrera
        const response = await fetch('http://localhost:8080/api/reportes/empleabilidad', { headers })
        if (!response.ok) {
          throw new Error('Error al obtener datos de empleabilidad')
        }
        
        const employmentData = await response.json()
        
        // Transformar los datos para el gráfico
        const transformedData: EmploymentData[] = employmentData.map((item: any) => {
          const empleados = Number(item.empleados) || 0
          const desempleados = Number(item.desempleados) || 0
          const total = empleados + desempleados
          const tasaEmpleabilidad = total > 0 ? (empleados / total) * 100 : 0
          
          return {
            name: item.name || 'Sin especificar',
            empleados: empleados,
            desempleados: desempleados,
            tasaEmpleabilidad: Math.round(tasaEmpleabilidad * 100) / 100 // Redondear a 2 decimales
          }
        })

        setData(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching employment data:', err)
        
        // Usar datos de ejemplo en caso de error
        const fallbackData: EmploymentData[] = [
          { name: "Ing. Sistemas", empleados: 85, desempleados: 15, tasaEmpleabilidad: 85 },
          { name: "Ing. Industrial", empleados: 80, desempleados: 20, tasaEmpleabilidad: 80 },
          { name: "Ing. Civil", empleados: 75, desempleados: 25, tasaEmpleabilidad: 75 },
          { name: "Administración", empleados: 70, desempleados: 30, tasaEmpleabilidad: 70 },
          { name: "Contabilidad", empleados: 78, desempleados: 22, tasaEmpleabilidad: 78 },
          { name: "Marketing", empleados: 65, desempleados: 35, tasaEmpleabilidad: 65 },
        ]
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchEmploymentData()
  }, [])

  return { data, loading, error }
}
