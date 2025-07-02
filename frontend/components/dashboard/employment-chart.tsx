"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAuth } from "@/hooks/use-auth"

export function EmploymentChart() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user || !user.egresado || !user.egresado.carrera) {
    return <div className="text-center text-muted-foreground py-8">No se pudo determinar tu carrera. Inicia sesión nuevamente.</div>;
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.egresado?.carrera) return;
    setLoading(true);
    fetch(`http://localhost:8080/api/reportes/empleabilidad?carrera=${encodeURIComponent(user?.egresado?.carrera ?? "")}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
      }
    })
      .then(res => res.json())
      .then(res => {
        // El endpoint devuelve un array, pero solo nos interesa la carrera del usuario
        const found = res.find((item: any) => item.name === (user?.egresado?.carrera ?? ""));
        if (found) {
          setData([
            {
              year: new Date().getFullYear().toString(),
              empleados: found.empleados,
              desempleados: found.desempleados,
            },
          ]);
        } else {
          setData([]);
        }
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar los datos de empleabilidad."))
      .finally(() => setLoading(false));
  }, [user?.egresado?.carrera]);

  if (!isMounted || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!data.length) {
    return <div className="text-center text-muted-foreground py-8">No hay datos de empleabilidad para tu carrera.</div>;
  }

  const totalEmpleados = data[0].empleados || 0;
  const totalDesempleados = data[0].desempleados || 0;
  const total = totalEmpleados + totalDesempleados;
  const tasa = total > 0 ? (totalEmpleados * 100) / total : 0;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 justify-center text-sm font-medium">
        <span className="text-utp-600">Empleados: {totalEmpleados}</span>
        <span className="text-utp-400">Desempleados: {totalDesempleados}</span>
        <span className="text-utp-900">Tasa de empleabilidad: {tasa.toFixed(2)}%</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="empleados" name="Empleados" fill="#5b36f2" />
          <Bar dataKey="desempleados" name="Desempleados" fill="#a78bfa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
