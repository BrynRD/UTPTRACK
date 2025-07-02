"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEmploymentByCareer } from "@/hooks/use-employment-data"

export function AdminEmploymentChart() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, loading, error } = useEmploymentByCareer()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando datos de empleabilidad...</p>
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
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            `${value}%`, 
            name === 'empleados' ? 'Empleados' : 'Desempleados'
          ]}
        />
        <Legend />
        <Bar dataKey="empleados" name="Empleados (%)" fill="#22c55e" />
        <Bar dataKey="desempleados" name="Desempleados (%)" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
