"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface TrendData {
  año: number
  empleados: number
  desempleados: number
  tasaEmpleabilidad: number
  satisfaccion: number
}

interface TrendChartProps {
  carrera?: string
}

export function AdminTrendChart({ carrera }: TrendChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No se encontró token de autenticación')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        const params = new URLSearchParams()
        if (carrera && carrera !== 'todas') {
          params.append('carrera', carrera)
        }

        const response = await fetch(`http://localhost:8080/api/reportes/tendencias-empleabilidad?${params}`, { headers })
        if (!response.ok) {
          throw new Error('Error al obtener datos de tendencias')
        }
        
        const trendData = await response.json()
        setData(trendData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching trend data:', err)
        
        // Datos de ejemplo en caso de error
        const fallbackData: TrendData[] = [
          { año: 2020, empleados: 150, desempleados: 50, tasaEmpleabilidad: 75, satisfaccion: 3.5 },
          { año: 2021, empleados: 180, desempleados: 40, tasaEmpleabilidad: 81.8, satisfaccion: 3.7 },
          { año: 2022, empleados: 200, desempleados: 35, tasaEmpleabilidad: 85.1, satisfaccion: 3.8 },
          { año: 2023, empleados: 220, desempleados: 30, tasaEmpleabilidad: 88, satisfaccion: 3.9 },
          { año: 2024, empleados: 240, desempleados: 25, tasaEmpleabilidad: 90.6, satisfaccion: 4.0 },
        ]
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [carrera])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando tendencias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Error: {error}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="año" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'tasaEmpleabilidad') return [`${value}%`, 'Tasa de Empleabilidad']
            if (name === 'satisfaccion') return [`${value}/5`, 'Satisfacción']
            return [value, name]
          }}
        />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="tasaEmpleabilidad" 
          stroke="#22c55e" 
          strokeWidth={3}
          name="Tasa de Empleabilidad (%)"
          dot={{ r: 6 }}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="satisfaccion" 
          stroke="#3b82f6" 
          strokeWidth={3}
          name="Satisfacción (/5)"
          dot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
