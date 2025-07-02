"use client"

import { useEffect, useState } from "react"

const skills = [
  { text: "Java", value: 100 },
  { text: "Spring Boot", value: 85 },
  { text: "React", value: 80 },
  { text: "SQL", value: 75 },
  { text: "AWS", value: 70 },
  { text: "Docker", value: 65 },
  { text: "Git", value: 60 },
  { text: "JavaScript", value: 55 },
  { text: "TypeScript", value: 50 },
  { text: "Python", value: 45 },
  { text: "Agile", value: 40 },
  { text: "Scrum", value: 35 },
  { text: "DevOps", value: 30 },
  { text: "CI/CD", value: 25 },
]

export function SkillsCloud() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Cargando nube de habilidades...</p>
        </div>
    )
  }

  // Función para calcular el color basado en el valor de la habilidad
  const getBackgroundColor = (value: number) => {
    // Usamos diferentes niveles de opacidad para el mismo color base
    const opacity = Math.max(0.1, Math.min(0.3, value / 100 * 0.3));
    return `rgba(91, 54, 242, ${opacity})`;
  }

  return (
      <div className="flex h-full flex-wrap items-center justify-center gap-3 p-4">
        {skills.map((skill) => (
            <div
                key={skill.text}
                style={{
                  fontSize: `${Math.max(0.8, skill.value / 40)}rem`,
                  backgroundColor: getBackgroundColor(skill.value),
                  color: "#5b36f2",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "9999px",
                  fontWeight: skill.value > 70 ? 600 : skill.value > 40 ? 500 : 400,
                  border: "1px solid rgba(91, 54, 242, 0.2)",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer"
                }}
                className="hover:shadow-md hover:border-[rgba(91,54,242,0.5)] hover:scale-110 hover:z-10"
            >
              {skill.text}
            </div>
        ))}
      </div>
  )
}