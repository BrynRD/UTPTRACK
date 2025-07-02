"use client"

import { BookOpen, ExternalLink, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const courses = [
  {
    id: 1,
    title: "AWS Cloud Practitioner",
    description: "Certificación básica de AWS para profesionales de TI",
    match: 95,
    provider: "AWS",
    duration: "30 horas",
    link: "#",
    featured: true,
  },
  {
    id: 2,
    title: "Spring Boot Avanzado",
    description: "Desarrollo de aplicaciones empresariales con Spring Boot",
    match: 90,
    provider: "UTP",
    duration: "40 horas",
    link: "#",
    featured: false,
  },
  {
    id: 3,
    title: "React y Next.js",
    description: "Desarrollo de aplicaciones web modernas con React y Next.js",
    match: 85,
    provider: "Coursera",
    duration: "25 horas",
    link: "#",
    featured: false,
  },
]

export function RecommendedCourses() {
  return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
            <Card
                key={course.id}
                className={cn(
                    "flex flex-col border transition-all duration-200 hover:shadow-md",
                    course.featured ? "border-[#5b36f2]/30 bg-[#fbfaff]" : "border-gray-200"
                )}
            >
              <CardHeader className="pb-3 relative">
                {course.featured && (
                    <div className="absolute -right-1 -top-1 bg-[#5b36f2] text-white text-xs py-1 px-2 rounded-md shadow-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      <span>Destacado</span>
                    </div>
                )}
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800">{course.title}</CardTitle>
                  <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      course.featured ? "bg-[#eee9fe] text-[#5b36f2]" : "bg-green-100 text-green-700"
                  )}>
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                </div>
                <CardDescription className="text-xs mt-1.5">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Coincidencia con tu perfil</span>
                  <span className={cn(
                      "text-xs font-semibold",
                      course.match >= 90 ? "text-[#5b36f2]" : "text-gray-700"
                  )}>{course.match}%</span>
                </div>
                <Progress
                    value={course.match}
                    className="h-2 bg-gray-100"
                    indicatorClassName={cn(
                        course.match >= 90 ? "bg-[#5b36f2]" : "bg-green-500"
                    )}
                />
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-gray-500 mb-0.5">Proveedor</p>
                    <p className="font-medium text-gray-800">{course.provider}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-gray-500 mb-0.5">Duración</p>
                    <p className="font-medium text-gray-800">{course.duration}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-2">
                <Button
                    asChild
                    variant={course.featured ? "default" : "outline"}
                    size="sm"
                    className={cn(
                        "w-full transition-all",
                        course.featured ? "bg-[#5b36f2] hover:bg-[#4b2ad8] text-white" : "hover:border-[#5b36f2] hover:text-[#5b36f2]"
                    )}
                >
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Ver curso
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
        ))}
      </div>
  )
}