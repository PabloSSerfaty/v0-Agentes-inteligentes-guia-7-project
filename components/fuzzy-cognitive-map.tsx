"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ZoomIn, ZoomOut, RefreshCw, Download, Maximize2, Filter } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Definición de tipos para el mapa cognitivo difuso
interface FCMNode {
  id: string
  label: string
  type: "sintoma" | "causa" | "factor"
  value?: number
  description?: string
}

interface FCMEdge {
  source: string
  target: string
  weight: number
  description?: string
}

interface FCMData {
  nodes: FCMNode[]
  edges: FCMEdge[]
}

// Datos para el mapa cognitivo difuso
const fcmData: FCMData = {
  nodes: [
    // Síntomas
    {
      id: "conexion",
      label: "Estado de conexión",
      type: "sintoma",
      description: "Estabilidad general de la conexión a Internet",
    },
    { id: "velocidad", label: "Velocidad de carga", type: "sintoma", description: "Velocidad de descarga de datos" },
    {
      id: "perdida_paquetes",
      label: "Pérdida de paquetes",
      type: "sintoma",
      description: "Porcentaje de paquetes perdidos durante la transmisión",
    },
    {
      id: "errores_dns",
      label: "Errores DNS",
      type: "sintoma",
      description: "Frecuencia de errores de resolución de nombres de dominio",
    },
    { id: "senal_wifi", label: "Señal Wi-Fi", type: "sintoma", description: "Intensidad de la señal inalámbrica" },
    {
      id: "tiempo_carga",
      label: "Tiempo de carga",
      type: "sintoma",
      description: "Tiempo promedio de carga de páginas web",
    },
    {
      id: "latencia_servidor",
      label: "Latencia del servidor",
      type: "sintoma",
      description: "Tiempo de respuesta del servidor interno",
    },

    // Factores intermedios
    {
      id: "calidad_conexion",
      label: "Calidad de conexión",
      type: "factor",
      description: "Factor que representa la calidad general de la conexión",
    },
    {
      id: "rendimiento_red",
      label: "Rendimiento de red",
      type: "factor",
      description: "Factor que representa el rendimiento general de la red",
    },
    {
      id: "configuracion_red",
      label: "Configuración de red",
      type: "factor",
      description: "Factor que representa la correcta configuración de la red",
    },

    // Causas
    {
      id: "router_failure",
      label: "Fallo del router",
      type: "causa",
      description: "Problemas con el hardware o software del router",
    },
    {
      id: "isp_problems",
      label: "Problemas del ISP",
      type: "causa",
      description: "Problemas en la infraestructura del proveedor de servicios",
    },
    {
      id: "network_hardware",
      label: "Hardware de red",
      type: "causa",
      description: "Fallos en dispositivos de red como switches o tarjetas",
    },
    {
      id: "dns_config",
      label: "Configuración DNS",
      type: "causa",
      description: "Configuración incorrecta de los servidores DNS",
    },
    {
      id: "wifi_interference",
      label: "Interferencia WiFi",
      type: "causa",
      description: "Interferencias que afectan a la calidad de la señal WiFi",
    },
    {
      id: "server_overload",
      label: "Sobrecarga del servidor",
      type: "causa",
      description: "El servidor no puede manejar la cantidad de solicitudes",
    },
    {
      id: "network_congestion",
      label: "Congestión de red",
      type: "causa",
      description: "Saturación de la red debido a alto volumen de tráfico",
    },
  ],
  edges: [
    // Conexiones de síntomas a factores
    {
      source: "conexion",
      target: "calidad_conexion",
      weight: 0.9,
      description: "El estado de conexión afecta directamente a la calidad de conexión",
    },
    {
      source: "velocidad",
      target: "rendimiento_red",
      weight: 0.8,
      description: "La velocidad de carga es un indicador clave del rendimiento de red",
    },
    {
      source: "perdida_paquetes",
      target: "rendimiento_red",
      weight: 0.7,
      description: "La pérdida de paquetes reduce el rendimiento de la red",
    },
    {
      source: "errores_dns",
      target: "configuracion_red",
      weight: 0.85,
      description: "Los errores DNS indican problemas de configuración",
    },
    {
      source: "senal_wifi",
      target: "calidad_conexion",
      weight: 0.75,
      description: "La señal WiFi afecta a la calidad de la conexión inalámbrica",
    },
    {
      source: "tiempo_carga",
      target: "rendimiento_red",
      weight: 0.8,
      description: "El tiempo de carga refleja el rendimiento de la red",
    },
    {
      source: "latencia_servidor",
      target: "rendimiento_red",
      weight: 0.7,
      description: "La latencia del servidor afecta al rendimiento percibido",
    },

    // Conexiones de factores a causas
    {
      source: "calidad_conexion",
      target: "router_failure",
      weight: 0.7,
      description: "Una mala calidad de conexión puede indicar fallos en el router",
    },
    {
      source: "calidad_conexion",
      target: "isp_problems",
      weight: 0.65,
      description: "Problemas de calidad pueden originarse en el ISP",
    },
    {
      source: "calidad_conexion",
      target: "wifi_interference",
      weight: 0.6,
      description: "Interferencias WiFi afectan a la calidad de conexión",
    },
    {
      source: "rendimiento_red",
      target: "network_congestion",
      weight: 0.75,
      description: "Bajo rendimiento puede deberse a congestión de red",
    },
    {
      source: "rendimiento_red",
      target: "server_overload",
      weight: 0.7,
      description: "Sobrecarga del servidor reduce el rendimiento",
    },
    {
      source: "rendimiento_red",
      target: "network_hardware",
      weight: 0.6,
      description: "Hardware defectuoso afecta al rendimiento",
    },
    {
      source: "configuracion_red",
      target: "dns_config",
      weight: 0.85,
      description: "Problemas de configuración a menudo implican DNS incorrectos",
    },
    {
      source: "configuracion_red",
      target: "router_failure",
      weight: 0.5,
      description: "Fallos del router pueden causar problemas de configuración",
    },

    // Conexiones entre causas
    {
      source: "router_failure",
      target: "network_hardware",
      weight: 0.4,
      description: "Fallos de hardware pueden afectar al router",
    },
    {
      source: "isp_problems",
      target: "network_congestion",
      weight: 0.5,
      description: "Problemas del ISP pueden causar congestión",
    },
    {
      source: "wifi_interference",
      target: "network_congestion",
      weight: 0.3,
      description: "Interferencias pueden contribuir a la congestión",
    },
  ],
}

export function FuzzyCognitiveMap({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [hoveredNode, setHoveredNode] = useState<FCMNode | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<FCMEdge | null>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(1.5) // Aumentado el zoom inicial a 1.5
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Función para aumentar el zoom
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3))
  }

  // Función para disminuir el zoom
  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }

  // Función para resetear el zoom
  const resetZoom = () => {
    setZoomLevel(1.5) // Resetear al zoom inicial de 1.5
    setPanOffset({ x: 0, y: 0 })
  }

  // Función para alternar el modo de pantalla completa
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  // Función para exportar el mapa como imagen
  const exportAsImage = () => {
    const svgElement = document.querySelector(".fcm-svg") as SVGSVGElement
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    // Establecer dimensiones del canvas (más grandes para mejor calidad)
    canvas.width = svgElement.viewBox.baseVal.width * 3
    canvas.height = svgElement.viewBox.baseVal.height * 3

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Crear enlace de descarga
        const a = document.createElement("a")
        a.download = "mapa-cognitivo-difuso.png"
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Filtrar nodos según el tipo seleccionado
  const filteredData = React.useMemo(() => {
    if (!selectedNodeType) return fcmData

    const filteredNodes = fcmData.nodes.filter((node) => !selectedNodeType || node.type === selectedNodeType)
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

    const filteredEdges = fcmData.edges.filter(
      (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    )

    return { nodes: filteredNodes, edges: filteredEdges }
  }, [selectedNodeType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${fullscreen ? "max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]" : "max-w-6xl max-h-[90vh]"} overflow-auto`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Mapa Cognitivo Difuso del Sistema de Diagnóstico</span>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedNodeType(selectedNodeType ? null : "causa")}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedNodeType ? "Mostrar todos los nodos" : "Filtrar por causas"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={exportAsImage}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar como imagen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className={`border rounded-lg p-4 bg-white ${fullscreen ? "h-[80vh]" : "h-[700px]"} relative`}>
          {/* Controles de zoom */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 bg-white/80 p-1 rounded-md shadow-sm">
            <Button variant="outline" size="icon" onClick={zoomIn} title="Acercar" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={zoomOut} title="Alejar" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetZoom} title="Restablecer zoom" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicador de zoom */}
          <div className="absolute bottom-2 right-2 z-20 bg-white/80 px-2 py-1 rounded-md text-xs text-gray-600">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>

          {/* Filtros de tipo de nodo */}
          <div className="absolute top-2 left-2 z-20 flex gap-2 bg-white/80 p-2 rounded-md shadow-sm">
            <Button
              variant={selectedNodeType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNodeType(null)}
              className="text-xs h-7"
            >
              Todos
            </Button>
            <Button
              variant={selectedNodeType === "sintoma" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNodeType("sintoma")}
              className="text-xs h-7"
            >
              Síntomas
            </Button>
            <Button
              variant={selectedNodeType === "factor" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNodeType("factor")}
              className="text-xs h-7"
            >
              Factores
            </Button>
            <Button
              variant={selectedNodeType === "causa" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNodeType("causa")}
              className="text-xs h-7"
            >
              Causas
            </Button>
          </div>

          <FCMVisualization
            data={filteredData}
            onNodeHover={setHoveredNode}
            onEdgeHover={setHoveredEdge}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            setPanOffset={setPanOffset}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            dragStart={dragStart}
            setDragStart={setDragStart}
            setZoomLevel={setZoomLevel}
            fullscreen={fullscreen}
          />

          {/* Información sobre nodo al hacer hover */}
          {hoveredNode && (
            <div className="absolute top-16 left-2 bg-white p-3 border rounded shadow-md z-10 max-w-xs">
              <h4 className="font-medium text-base">{hoveredNode.label}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Tipo: {hoveredNode.type === "sintoma" ? "Síntoma" : hoveredNode.type === "causa" ? "Causa" : "Factor"}
              </p>
              {hoveredNode.description && <p className="text-xs mt-2 text-gray-600">{hoveredNode.description}</p>}
            </div>
          )}

          {/* Información sobre enlace al hacer hover */}
          {hoveredEdge && (
            <div className="absolute top-16 left-64 bg-white p-3 border rounded shadow-md z-10 max-w-xs">
              <h4 className="font-medium text-base">Relación</h4>
              <p className="text-sm mt-1">
                {getNodeLabel(hoveredEdge.source, filteredData.nodes)} →{" "}
                {getNodeLabel(hoveredEdge.target, filteredData.nodes)}
              </p>
              <p className="text-sm mt-1">Peso: {hoveredEdge.weight.toFixed(2)}</p>
              {hoveredEdge.description && <p className="text-xs mt-2 text-gray-600">{hoveredEdge.description}</p>}
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="mt-4 border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-2">Leyenda</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-[#E41A1C] mr-2"></div>
                <span className="text-sm">Síntomas</span>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-[#377EB8] mr-2"></div>
                <span className="text-sm">Factores</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#4DAF4A] mr-2"></div>
                <span className="text-sm">Causas</span>
              </div>
            </div>
            <div>
              <div className="text-sm mb-1">Grosor de línea:</div>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-[#666666] mr-2"></div>
                <span className="text-xs">Relación débil (peso &lt; 0.4)</span>
              </div>
              <div className="flex items-center">
                <div className="h-[2px] w-10 bg-[#666666] mr-2"></div>
                <span className="text-xs">Relación media (0.4 ≤ peso ≤ 0.7)</span>
              </div>
              <div className="flex items-center">
                <div className="h-[3px] w-10 bg-[#666666] mr-2"></div>
                <span className="text-xs">Relación fuerte (peso &gt; 0.7)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-medium mb-1">Sobre el Mapa Cognitivo Difuso:</p>
            <p className="text-xs text-gray-600">
              El mapa cognitivo difuso representa las relaciones causales entre síntomas, factores intermedios y causas
              potenciales. El grosor de las líneas indica la fuerza de la relación causal, y la dirección de las flechas
              muestra el flujo de influencia. Este modelo permite razonar con incertidumbre y capturar relaciones
              complejas entre múltiples variables.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente para la visualización del mapa cognitivo difuso
function FCMVisualization({
  data,
  onNodeHover,
  onEdgeHover,
  zoomLevel,
  panOffset,
  setPanOffset,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  setZoomLevel,
  fullscreen,
}: {
  data: FCMData
  onNodeHover: (node: FCMNode | null) => void
  onEdgeHover: (edge: FCMEdge | null) => void
  zoomLevel: number
  panOffset: { x: number; y: number }
  setPanOffset: (offset: { x: number; y: number }) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  dragStart: { x: number; y: number }
  setDragStart: (start: { x: number; y: number }) => void
  setZoomLevel: (zoom: number) => void
  fullscreen: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Función para manejar el inicio del arrastre
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // Solo botón izquierdo
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Función para manejar el movimiento durante el arrastre
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dx = (e.clientX - dragStart.x) / zoomLevel
    const dy = (e.clientY - dragStart.y) / zoomLevel

    setPanOffset({
      x: panOffset.x + dx,
      y: panOffset.y + dy,
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Función para manejar el fin del arrastre
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Función para manejar la rueda del ratón para zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()

    // Determinar la dirección del zoom
    const delta = e.deltaY < 0 ? 0.1 : -0.1

    // Calcular el nuevo nivel de zoom
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta))

    // Actualizar el zoom usando la prop setZoomLevel
    if (typeof setZoomLevel === "function") {
      setZoomLevel(newZoom)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Renderizar la visualización
    const svg = renderFCMVisualization(containerRef.current, data, onNodeHover, onEdgeHover, fullscreen)

    // Guardar referencia al SVG
    svgRef.current = svg

    // Aplicar transformación de zoom y pan
    if (svg) {
      const mainGroup = svg.querySelector("g.main-group")
      if (mainGroup) {
        const centerX = 500 // Mitad del viewBox
        const centerY = 300 // Mitad del viewBox

        // Transformación: primero trasladar al centro, luego aplicar zoom, luego trasladar de vuelta y aplicar pan
        mainGroup.setAttribute(
          "transform",
          `translate(${centerX}, ${centerY}) scale(${zoomLevel}) translate(${-centerX + panOffset.x}, ${-centerY + panOffset.y})`,
        )
      }
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [data, onNodeHover, onEdgeHover, zoomLevel, panOffset, setZoomLevel, fullscreen])

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    ></div>
  )
}

// Función para renderizar el mapa cognitivo difuso
function renderFCMVisualization(
  container: HTMLDivElement,
  data: FCMData,
  onNodeHover: (node: FCMNode | null) => void,
  onEdgeHover: (edge: FCMEdge | null) => void,
  fullscreen: boolean,
): SVGSVGElement {
  // Limpiar el contenedor
  container.innerHTML = ""

  // Crear un SVG para la visualización
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", "0 0 1000 600")
  svg.setAttribute("class", "fcm-svg")
  container.appendChild(svg)

  // Crear un grupo principal para aplicar transformaciones
  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  mainGroup.setAttribute("class", "main-group")
  svg.appendChild(mainGroup)

  // Definir colores según el tipo de nodo
  const nodeColors = {
    sintoma: "#E41A1C", // Rojo
    factor: "#377EB8", // Azul
    causa: "#4DAF4A", // Verde
  }

  // Calcular posiciones de los nodos
  const nodePositions: Record<string, { x: number; y: number }> = {}

  // Posicionar síntomas en la parte superior
  const sintomas = data.nodes.filter((node) => node.type === "sintoma")
  const sintomaWidth = 800 / (sintomas.length + 1)
  sintomas.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100 + (index + 1) * sintomaWidth,
      y: 100,
    }
  })

  // Posicionar factores en el medio
  const factores = data.nodes.filter((node) => node.type === "factor")
  const factorWidth = 800 / (factores.length + 1)
  factores.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100 + (index + 1) * factorWidth,
      y: 300,
    }
  })

  // Posicionar causas en la parte inferior
  const causas = data.nodes.filter((node) => node.type === "causa")
  const causaWidth = 800 / (causas.length + 1)
  causas.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 100 + (index + 1) * causaWidth,
      y: 500,
    }
  })

  // Dibujar enlaces
  data.edges.forEach((edge) => {
    const sourcePos = nodePositions[edge.source]
    const targetPos = nodePositions[edge.target]

    if (!sourcePos || !targetPos) return

    // Determinar grosor de línea según el peso
    let strokeWidth = 1
    if (edge.weight > 0.7) {
      strokeWidth = 3
    } else if (edge.weight >= 0.4) {
      strokeWidth = 2
    }

    // Calcular puntos de control para curva Bézier
    const dx = targetPos.x - sourcePos.x
    const dy = targetPos.y - sourcePos.y
    const controlPoint1X = sourcePos.x + dx * 0.5
    const controlPoint1Y = sourcePos.y + dy * 0.3
    const controlPoint2X = sourcePos.x + dx * 0.5
    const controlPoint2Y = targetPos.y - dy * 0.3

    // Crear grupo para el enlace
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("class", "edge")
    mainGroup.appendChild(group)

    // Dibujar curva Bézier
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute(
      "d",
      `M ${sourcePos.x} ${sourcePos.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetPos.x} ${targetPos.y}`,
    )
    path.setAttribute("stroke", "#666666")
    path.setAttribute("stroke-width", strokeWidth.toString())
    path.setAttribute("fill", "none")
    path.setAttribute("marker-end", "url(#arrowhead)")

    // Eventos
    path.addEventListener("mouseover", () => onEdgeHover(edge))
    path.addEventListener("mouseout", () => onEdgeHover(null))

    group.appendChild(path)

    // Etiqueta de peso
    const labelX = sourcePos.x + dx * 0.5
    const labelY = sourcePos.y + dy * 0.5 - 10

    // Fondo para el texto
    const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    const textWidth = 40
    const textHeight = 20
    textBg.setAttribute("x", (labelX - textWidth / 2).toString())
    textBg.setAttribute("y", (labelY - textHeight / 2).toString())
    textBg.setAttribute("width", textWidth.toString())
    textBg.setAttribute("height", textHeight.toString())
    textBg.setAttribute("fill", "white")
    textBg.setAttribute("opacity", "0.9")
    textBg.setAttribute("rx", "4")
    textBg.setAttribute("ry", "4")

    group.appendChild(textBg)

    // Texto de peso
    const weightText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    weightText.setAttribute("x", labelX.toString())
    weightText.setAttribute("y", labelY.toString())
    weightText.setAttribute("text-anchor", "middle")
    weightText.setAttribute("dominant-baseline", "middle")
    weightText.setAttribute("fill", "#333")
    weightText.setAttribute("font-size", "12")
    weightText.textContent = edge.weight.toFixed(2)

    group.appendChild(weightText)
  })

  // Dibujar nodos
  data.nodes.forEach((node) => {
    const pos = nodePositions[node.id]
    if (!pos) return

    // Crear grupo para el nodo
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("class", "node")
    mainGroup.appendChild(group)

    // Dibujar círculo
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    circle.setAttribute("cx", pos.x.toString())
    circle.setAttribute("cy", pos.y.toString())
    circle.setAttribute("r", "25") // Aumentado de 20 a 25
    circle.setAttribute("fill", nodeColors[node.type])

    // Añadir sombra
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", `shadow-${node.id}`)
    filter.setAttribute("x", "-20%")
    filter.setAttribute("y", "-20%")
    filter.setAttribute("width", "140%")
    filter.setAttribute("height", "140%")

    const feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset")
    feOffset.setAttribute("dx", "2")
    feOffset.setAttribute("dy", "2")
    feOffset.setAttribute("in", "SourceAlpha")
    feOffset.setAttribute("result", "offOut")

    const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur")
    feGaussianBlur.setAttribute("in", "offOut")
    feGaussianBlur.setAttribute("stdDeviation", "3")
    feGaussianBlur.setAttribute("result", "blurOut")

    const feBlend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend")
    feBlend.setAttribute("in", "SourceGraphic")
    feBlend.setAttribute("in2", "blurOut")
    feBlend.setAttribute("mode", "normal")

    filter.appendChild(feOffset)
    filter.appendChild(feGaussianBlur)
    filter.appendChild(feBlend)

    svg.appendChild(filter)
    circle.setAttribute("filter", `url(#shadow-${node.id})`)

    // Eventos
    circle.addEventListener("mouseover", () => onNodeHover(node))
    circle.addEventListener("mouseout", () => onNodeHover(null))

    group.appendChild(circle)

    // Texto del nodo
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", pos.x.toString())
    text.setAttribute("y", (pos.y + 40).toString()) // Posicionado debajo del círculo
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("fill", "#333")
    text.setAttribute("font-size", "14") // Aumentado de 12 a 14
    text.setAttribute("font-weight", "bold")

    // Limitar el texto a 15 caracteres y añadir "..." si es más largo
    const label = node.label.length > 15 ? node.label.substring(0, 12) + "..." : node.label
    text.textContent = label

    group.appendChild(text)
  })

  // Definir marcador de flecha
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  marker.setAttribute("id", "arrowhead")
  marker.setAttribute("markerWidth", "12")
  marker.setAttribute("markerHeight", "8")
  marker.setAttribute("refX", "12")
  marker.setAttribute("refY", "4")
  marker.setAttribute("orient", "auto")

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("points", "0 0, 12 4, 0 8")
  polygon.setAttribute("fill", "#666666")

  marker.appendChild(polygon)
  defs.appendChild(marker)

  return svg
}

// Función auxiliar para obtener la etiqueta de un nodo por su ID
function getNodeLabel(id: string, nodes: FCMNode[]): string {
  const node = nodes.find((n) => n.id === id)
  return node ? node.label : id
}
