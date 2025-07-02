"use client"

import { useState, useEffect } from 'react'

interface SedeData {
  sede: string
  cantidad: number
  coordinates?: [number, number] // [lat, lng]
}

// Coordenadas de las sedes de la UTP
const SEDE_COORDINATES: Record<string, [number, number]> = {
  'Lima': [-12.0464, -77.0428],
  'Lima Norte': [-11.9892, -77.0386],
  'Lima Sur': [-12.1538, -76.9731],
  'Lima Centro': [-12.0464, -77.0428],
  'Arequipa': [-16.4090, -71.5375],
  'Chiclayo': [-6.7775, -79.8441],
  'Trujillo': [-8.1116, -79.0287],
  'Piura': [-5.1945, -80.6328],
  'Huancayo': [-12.0653, -75.2049],
  'Iquitos': [-3.7437, -73.2516],
  'Chimbote': [-9.0853, -78.5714],
  'Cajamarca': [-7.1615, -78.5136],
  'Pucallpa': [-8.3791, -74.5539]
}

export function useSedeDistribution() {
  const [data, setData] = useState<SedeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSedeData = async () => {
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

        // Obtener datos de distribución por sede
        const response = await fetch('http://localhost:8080/api/reportes/sedes', { headers })
        if (!response.ok) {
          throw new Error('Error al obtener datos de sedes')
        }
        
        const sedeData = await response.json()
        
        // Transformar los datos agregando coordenadas (sin agrupar Lima)
        const transformedData: SedeData[] = sedeData.map((item: any) => ({
          sede: item.sede || 'Sede no especificada',
          cantidad: Number(item.cantidad) || 0,
          coordinates: SEDE_COORDINATES[item.sede] || [-12.0464, -77.0428] // Default a Lima Centro
        }))

        setData(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching sede data:', err)
        
        // Usar datos de ejemplo en caso de error
        const fallbackData: SedeData[] = [
          { sede: "Lima", cantidad: 150, coordinates: [-12.0464, -77.0428] },
          { sede: "Arequipa", cantidad: 85, coordinates: [-16.4090, -71.5375] },
          { sede: "Chiclayo", cantidad: 65, coordinates: [-6.7775, -79.8441] },
          { sede: "Trujillo", cantidad: 75, coordinates: [-8.1116, -79.0287] },
          { sede: "Piura", cantidad: 45, coordinates: [-5.1945, -80.6328] },
          { sede: "Huancayo", cantidad: 55, coordinates: [-12.0653, -75.2049] },
        ]
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchSedeData()
  }, [])

  return { data, loading, error, SEDE_COORDINATES }
}
