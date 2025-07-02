"use client"

import { useEffect, useState } from "react"
import { MapPin, Users, ChevronDown, ChevronRight } from "lucide-react"
import { useSedeDistribution } from "@/hooks/use-sede-distribution"

interface SedeMarker {
  sede: string
  cantidad: number
  coordinates: [number, number]
  percentage: number
  isLima?: boolean
}

export function AdminGraduatesMap() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, loading, error } = useSedeDistribution()
  const [selectedSede, setSelectedSede] = useState<string | null>(null)
  const [showLimaDetails, setShowLimaDetails] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-bounce mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando datos del mapa...</p>
        </div>
      </div>
    )
  }

  const totalEgresados = data.reduce((sum, sede) => sum + sede.cantidad, 0)
  
  // Separar sedes de Lima y otras con percentages calculados
  const sedesLima = data
    .filter(sede => sede.sede.toLowerCase().includes('lima'))
    .map(sede => ({
      ...sede,
      percentage: totalEgresados > 0 ? (sede.cantidad / totalEgresados) * 100 : 0
    }))
  
  const sedesOtras = data
    .filter(sede => !sede.sede.toLowerCase().includes('lima'))
    .map(sede => ({
      ...sede,
      percentage: totalEgresados > 0 ? (sede.cantidad / totalEgresados) * 100 : 0
    }))
  
  const totalLima = sedesLima.reduce((sum, sede) => sum + sede.cantidad, 0)
  
  // Crear marcadores con sedes agrupadas para el mapa visual
  const sedesParaMapa: SedeMarker[] = [
    // Grupo Lima (suma de todas las sedes de Lima)
    ...(sedesLima.length > 0 ? [{
      sede: 'Lima',
      cantidad: totalLima,
      coordinates: [-12.0464, -77.0428] as [number, number],
      percentage: totalEgresados > 0 ? (totalLima / totalEgresados) * 100 : 0,
      isLima: true
    }] : []),
    // Otras sedes
    ...sedesOtras.map(sede => ({
      sede: sede.sede,
      cantidad: sede.cantidad,
      coordinates: sede.coordinates || [-12.0464, -77.0428],
      percentage: sede.percentage,
      isLima: false
    }))
  ]

  // Todas las sedes para la lista (sin agrupar)
  const todasLasSedes: SedeMarker[] = data.map(sede => ({
    sede: sede.sede,
    cantidad: sede.cantidad,
    coordinates: sede.coordinates || [-12.0464, -77.0428],
    percentage: totalEgresados > 0 ? (sede.cantidad / totalEgresados) * 100 : 0,
    isLima: sede.sede.toLowerCase().includes('lima')
  }))

  // Calcular el tamaño del marcador basado en la cantidad - Más grande
  const getMarkerSize = (cantidad: number) => {
    const maxCantidad = Math.max(...sedesParaMapa.map(s => s.cantidad))
    const minSize = 40  // Aumentado de 20 a 40
    const maxSize = 80  // Aumentado de 60 a 80
    return Math.max(minSize, (cantidad / maxCantidad) * maxSize)
  }

  const handleMarkerClick = (sede: SedeMarker) => {
    if (sede.isLima) {
      setShowLimaDetails(!showLimaDetails)
      setSelectedSede('Lima') // Usar 'Lima' consistentemente
    } else {
      setSelectedSede(selectedSede === sede.sede ? null : sede.sede)
    }
  }

  return (
    <div className="h-full w-full">
      {error && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">⚠️ {error}. Mostrando datos de ejemplo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Mapa SVG del Perú con efectos - Más grande */}
        <div className="bg-gradient-to-br from-white via-purple-25 to-purple-50 rounded-xl p-6 relative overflow-hidden shadow-lg border border-purple-200">
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/20 to-purple-100/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-center h-full min-h-[500px]">
            {/* SVG del mapa del Perú más grande */}
            <svg 
              viewBox="0 0 500 600" 
              className="w-full h-full max-w-lg transition-all duration-500 hover:scale-105"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(91, 54, 242, 0.2))' }}
            >
              {/* Contorno del Perú con gradiente */}
              <defs>
                <linearGradient id="peruGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(245, 243, 255)" />
                  <stop offset="100%" stopColor="rgb(237, 233, 254)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <path
                d="M120 60 Q150 50 190 70 L250 95 Q310 110 350 150 L380 190 Q400 230 390 280 L380 330 Q370 380 340 430 L310 480 Q280 530 240 570 L190 590 Q150 600 120 590 L90 570 Q60 530 70 480 L90 430 Q110 380 105 330 L100 280 Q95 230 105 180 L120 130 Q125 90 120 60 Z"
                fill="url(#peruGradient)"
                stroke="rgb(91, 54, 242)"
                strokeWidth="3"
                className="hover:stroke-purple-700 transition-all duration-300"
                filter="url(#glow)"
              />
              
              {/* Marcadores de sedes con efectos */}
              {sedesParaMapa.map((sede, index) => {
                const positions: Record<string, [number, number]> = {
                  'Lima': [190, 320],
                  'Arequipa': [230, 480],
                  'Chiclayo': [160, 200],
                  'Trujillo': [170, 230],
                  'Piura': [140, 180],
                  'Huancayo': [210, 360],
                  'Iquitos': [280, 150],
                  'Chimbote': [180, 260],
                  'Cajamarca': [200, 200],
                  'Pucallpa': [250, 320]
                }
                
                const [x, y] = positions[sede.sede] || [190, 320]
                const size = getMarkerSize(sede.cantidad)
                const isSelected = sede.isLima ? selectedSede === 'Lima' : selectedSede === sede.sede
                
                return (
                  <g key={sede.sede}>
                    {/* Efecto de glow para marcador seleccionado */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={size / 2.5}
                        fill="none"
                        stroke="rgb(91, 54, 242)"
                        strokeWidth="4"
                        opacity="0.8"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* Círculo del marcador más grande y visible */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size / 2}
                      fill={isSelected ? "rgb(91, 54, 242)" : "rgb(91, 54, 242)"}
                      stroke="white"
                      strokeWidth="4"
                      className="cursor-pointer hover:fill-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      onClick={() => handleMarkerClick(sede)}
                      style={{ filter: 'drop-shadow(0 6px 12px rgba(91, 54, 242, 0.4))' }}
                    />
                    
                    {/* Icono de ubicación más grande */}
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      📍
                    </text>
                    
                    {/* Tooltip mejorado y más grande */}
                    {(sede.isLima ? selectedSede === 'Lima' : selectedSede === sede.sede) && (
                      <g>
                        <rect
                          x={x - 60}
                          y={y - 55}
                          width="120"
                          height={sede.isLima && showLimaDetails ? "75" : "45"}
                          rx="10"
                          fill="rgb(91, 54, 242)"
                          stroke="white"
                          strokeWidth="3"
                          style={{ filter: 'drop-shadow(0 6px 15px rgba(91, 54, 242, 0.4))' }}
                        />
                        <text
                          x={x}
                          y={y - 30}
                          textAnchor="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {sede.sede}
                        </text>
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                        >
                          {sede.cantidad} egresados
                        </text>
                        {sede.isLima && showLimaDetails && (
                          <text
                            x={x}
                            y={y + 2}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            Click para detalles
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
          
          {/* Título del mapa con efectos */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Distribución por Sedes
            </h3>
            <p className="text-sm text-gray-600">{totalEgresados} egresados total</p>
          </div>
        </div>

        {/* Lista de sedes mejorada */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Egresados por Sede
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Sedes de Lima expandibles */}
            {sedesLima.length > 0 && (
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedSede === 'Lima'
                      ? 'bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:bg-purple-25'
                  }`}
                  style={{
                    borderColor: selectedSede === 'Lima' ? 'rgb(91, 54, 242)' : undefined,
                    borderWidth: selectedSede === 'Lima' ? '2px' : '2px'
                  }}
                  onClick={() => {
                    if (selectedSede === 'Lima') {
                      setSelectedSede(null)
                      setShowLimaDetails(false)
                    } else {
                      setSelectedSede('Lima')
                      setShowLimaDetails(true)
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {showLimaDetails && selectedSede === 'Lima' ? (
                        <ChevronDown className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">Lima (Total)</span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{totalLima}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${totalEgresados > 0 ? (totalLima / totalEgresados) * 100 : 0}%`,
                          background: 'rgb(91, 54, 242)'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {(totalEgresados > 0 ? (totalLima / totalEgresados) * 100 : 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Detalles de sedes de Lima */}
                {showLimaDetails && (
                  <div className="ml-6 space-y-2 animate-fadeIn">
                    {sedesLima
                      .sort((a, b) => b.cantidad - a.cantidad)
                      .map((sede) => (
                        <div
                          key={sede.sede}
                          className="p-2 rounded-lg bg-purple-25 border border-purple-100 transition-all duration-200 hover:bg-purple-50"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-purple-900">↳ {sede.sede}</span>
                            <span className="text-sm text-purple-700">{sede.cantidad}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-purple-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${sede.percentage || 0}%`,
                                  background: 'rgb(91, 54, 242)'
                                }}
                              />
                            </div>
                            <span className="text-xs text-purple-600">
                              {(sede.percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Otras sedes */}
            {sedesOtras
              .sort((a, b) => b.cantidad - a.cantidad)
              .map((sede) => (
                <div
                  key={sede.sede}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedSede === sede.sede
                      ? 'bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{
                    borderColor: selectedSede === sede.sede ? 'rgb(91, 54, 242)' : undefined,
                    borderWidth: '2px'
                  }}
                  onClick={() => setSelectedSede(selectedSede === sede.sede ? null : sede.sede)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{sede.sede}</span>
                    <span className="text-sm text-gray-600 font-medium">{sede.cantidad}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${sede.percentage || 0}%`,
                          background: 'rgb(91, 54, 242)'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {(sede.percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
