"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CAUSAS_UNIFICADAS, SINTOMAS_UNIFICADOS, ACCIONES_RECOMENDADAS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RefreshCw, Info } from "lucide-react"

// Definición de tipos para la visualización
interface Node {
  id: string
  name: string
  type: "causa" | "sintoma"
  probability?: number
  color: string
  size: number
}

interface Link {
  source: string
  target: string
  strength: number
  probability: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

// Probabilidades a priori de las causas (simuladas para la visualización)
const PROBABILIDADES_PRIORI = {
  [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.25,
  [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.2,
  [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.15,
  [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.18,
  [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: 0.22,
  [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: 0.12,
  [CAUSAS_UNIFICADAS.MALWARE]: 0.08,
  [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.17,
  [CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE]: 0.14,
}

// Probabilidades condicionales P(Síntoma|Causa) (simuladas para la visualización)
const PROBABILIDADES_CONDICIONALES: Record<string, Record<string, number>> = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: {
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.9,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.85,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.7,
  },
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: {
    [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: 0.8,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.65,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.6,
  },
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: {
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.75,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.7,
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.5,
  },
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: {
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.8,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.65,
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.7,
  },
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: {
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.95,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.6,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.4,
  },
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: {
    [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: 0.95,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.5,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.4,
  },
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: {
    [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: 0.85,
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.7,
    [CAUSAS_UNIFICADAS.MALWARE]: 0.6,
  },
}

export function BayesianNetworkDiagram() {
  const [open, setOpen] = useState(false)
  const [selectedCause, setSelectedCause] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null)

  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Preparar los datos para la visualización
  const graphData = prepareGraphData()

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
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <>
      <Button
        variant="outline"
        className="mt-4 w-full flex items-center justify-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Info className="h-4 w-4" />
        Ver Red Bayesiana
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Red Bayesiana de Diagnóstico de Red</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-2">
              <div className="border rounded-lg p-4 bg-white h-[600px] relative">
                {/* Controles de zoom */}
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 bg-white/80 p-1 rounded-md shadow-sm">
                  <Button variant="outline" size="icon" onClick={zoomIn} title="Acercar" className="h-8 w-8">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={zoomOut} title="Alejar" className="h-8 w-8">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetZoom}
                    title="Restablecer zoom"
                    className="h-8 w-8"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Indicador de zoom */}
                <div className="absolute bottom-2 right-2 z-20 bg-white/80 px-2 py-1 rounded-md text-xs text-gray-600">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </div>

                <BayesianNetworkGraph
                  data={graphData}
                  onNodeHover={setHoveredNode}
                  onLinkHover={setHoveredLink}
                  onNodeClick={(node) => {
                    if (node.type === "causa") {
                      setSelectedCause(node.id)
                    }
                  }}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                  setPanOffset={setPanOffset}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  dragStart={dragStart}
                  setDragStart={setDragStart}
                />

                {/* Información sobre nodo al hacer hover */}
                {hoveredNode && (
                  <div className="absolute top-2 left-2 bg-white p-2 border rounded shadow-md z-10">
                    <h4 className="font-medium">{hoveredNode.name}</h4>
                    {hoveredNode.type === "causa" && (
                      <p className="text-sm">Probabilidad a priori: {(hoveredNode.probability || 0).toFixed(2)}</p>
                    )}
                    <p className="text-xs text-gray-500">{hoveredNode.type === "causa" ? "Causa" : "Síntoma"}</p>
                  </div>
                )}

                {/* Información sobre enlace al hacer hover */}
                {hoveredLink && (
                  <div className="absolute top-2 left-40 bg-white p-2 border rounded shadow-md z-10">
                    <h4 className="font-medium">Relación</h4>
                    <p className="text-sm">
                      {getCausaName(hoveredLink.source as string)} → {getSintomaName(hoveredLink.target as string)}
                    </p>
                    <p className="text-sm">P(Síntoma|Causa): {hoveredLink.probability.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Leyenda */}
              <div className="mt-4 border rounded-lg p-4 bg-white">
                <h3 className="font-medium mb-2">Leyenda</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-md bg-[#4E79A7] mr-2"></div>
                      <span className="text-sm">Nodos Causa</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#F28E2B] mr-2"></div>
                      <span className="text-sm">Nodos Síntoma</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Grosor de línea:</div>
                    <div className="flex items-center">
                      <div className="h-[1px] w-10 bg-[#555555] mr-2"></div>
                      <span className="text-xs">Relación débil (P&lt;0.3)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-[2px] w-10 bg-[#555555] mr-2"></div>
                      <span className="text-xs">Relación media (0.3≤P≤0.7)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-[3px] w-10 bg-[#555555] mr-2"></div>
                      <span className="text-xs">Relación fuerte (P&gt;0.7)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p>• Utiliza los controles de zoom o arrastra para navegar por el diagrama</p>
                  <p>• Haz clic en una causa para ver sus detalles en el panel lateral</p>
                </div>
              </div>
            </div>

            {/* Panel lateral con información adicional */}
            <div>
              <Card className="p-4 h-full">
                <h3 className="font-medium mb-4">Información del Modelo Bayesiano</h3>

                {selectedCause ? (
                  <div>
                    <h4 className="font-medium text-[#4E79A7] mb-2">{selectedCause}</h4>
                    <p className="text-sm mb-2">
                      Probabilidad a priori: {PROBABILIDADES_PRIORI[selectedCause]?.toFixed(2) || "N/A"}
                    </p>

                    <h5 className="font-medium mt-4 mb-2">Acciones Recomendadas:</h5>
                    <ul className="space-y-1 text-sm">
                      {ACCIONES_RECOMENDADAS[selectedCause]?.map((accion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-[#4E79A7] rounded-full mr-2 mt-1.5"></span>
                          {accion}
                        </li>
                      ))}
                    </ul>

                    <h5 className="font-medium mt-4 mb-2">Síntomas Relacionados:</h5>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(PROBABILIDADES_CONDICIONALES)
                        .filter(([_, causas]) => causas[selectedCause])
                        .sort((a, b) => b[1][selectedCause] - a[1][selectedCause])
                        .map(([sintoma, causas]) => (
                          <li key={sintoma} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-[#F28E2B] rounded-full mr-2 mt-1.5"></span>
                            {sintoma} ({(causas[selectedCause] * 100).toFixed(0)}%)
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Selecciona un nodo de causa para ver sus detalles y acciones recomendadas.
                    </p>

                    <h4 className="font-medium mb-2">Sobre el Modelo Bayesiano</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Este modelo representa las relaciones probabilísticas entre síntomas observables y sus posibles
                      causas. Las flechas indican la probabilidad condicional P(Síntoma|Causa).
                    </p>

                    <h4 className="font-medium mb-2">Cómo Interpretar</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• El grosor de las líneas indica la fuerza de la relación probabilística</li>
                      <li>• Haz hover sobre nodos y conexiones para ver detalles</li>
                      <li>• Haz clic en una causa para ver sus acciones recomendadas</li>
                      <li>• Usa los controles de zoom para explorar el diagrama en detalle</li>
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para la visualización de la red bayesiana
function BayesianNetworkGraph({
  data,
  onNodeHover,
  onLinkHover,
  onNodeClick,
  zoomLevel,
  panOffset,
  setPanOffset,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
}: {
  data: GraphData
  onNodeHover: (node: Node | null) => void
  onLinkHover: (link: Link | null) => void
  onNodeClick: (node: Node) => void
  zoomLevel: number
  panOffset: { x: number; y: number }
  setPanOffset: (offset: { x: number; y: number }) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  dragStart: { x: number; y: number }
  setDragStart: (start: { x: number; y: number }) => void
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

    // Actualizar el zoom
    setZoomLevel(newZoom)
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Renderizar la visualización mejorada
    const svg = renderEnhancedVisualization(containerRef.current, data, onNodeHover, onLinkHover, onNodeClick)

    // Guardar referencia al SVG
    svgRef.current = svg

    // Aplicar transformación de zoom y pan
    if (svg) {
      const mainGroup = svg.querySelector("g.main-group")
      if (mainGroup) {
        const centerX = 600 // Mitad del viewBox
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
  }, [data, onNodeHover, onLinkHover, onNodeClick, zoomLevel, panOffset])

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

// Función para renderizar una visualización mejorada con mayor espaciado
function renderEnhancedVisualization(
  container: HTMLDivElement,
  data: GraphData,
  onNodeHover: (node: Node | null) => void,
  onLinkHover: (link: Link | null) => void,
  onNodeClick: (node: Node) => void,
): SVGSVGElement {
  // Limpiar el contenedor
  container.innerHTML = ""

  // Crear un SVG para la visualización con dimensiones aumentadas
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", "0 0 1200 600") // Aumentado de 800x400 a 1200x600 para más espacio
  container.appendChild(svg)

  // Crear un grupo principal para aplicar transformaciones
  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  mainGroup.setAttribute("class", "main-group")
  svg.appendChild(mainGroup)

  // Separar nodos por tipo
  const causas = data.nodes.filter((node) => node.type === "causa")
  const sintomas = data.nodes.filter((node) => node.type === "sintoma")

  // Definir colores según especificaciones
  const colorCausa = "#4E79A7" // Azul
  const colorSintoma = "#F28E2B" // Naranja
  const colorConexion = "#555555" // Gris oscuro

  // Calcular el ancho de cada nodo causa basado en el texto
  const calcularAnchoCausa = (nombre: string): number => {
    // Estimación aproximada: 10px por carácter + margen
    return Math.max(nombre.length * 10 + 40, 160)
  }

  // Calcular posiciones horizontales para causas con espaciado mejorado
  const posicionesCausas: { x: number; width: number }[] = []
  let posicionXActual = 100 // Posición inicial

  causas.forEach((causa) => {
    const ancho = calcularAnchoCausa(causa.name)
    posicionesCausas.push({ x: posicionXActual + ancho / 2, width: ancho })
    posicionXActual += ancho + 60 // Añadir 60px de espacio entre nodos
  })

  // Calcular el ancho total necesario
  const anchoTotalCausas = posicionXActual

  // Ajustar el viewBox si es necesario
  if (anchoTotalCausas > 1200) {
    svg.setAttribute("viewBox", `0 0 ${anchoTotalCausas + 100} 600`)
  }

  // Posicionar causas en la parte superior con mayor espaciado vertical
  causas.forEach((causa, index) => {
    const x = posicionesCausas[index].x
    const y = 100 // Aumentado de 80 a 100 para más espacio vertical
    const width = posicionesCausas[index].width

    // Crear grupo para el nodo causa
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("class", "node causa-node")
    group.setAttribute("data-id", causa.id)
    mainGroup.appendChild(group)

    // Crear rectángulo para la causa con bordes redondeados y sombra
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("x", (x - width / 2).toString())
    rect.setAttribute("y", (y - 25).toString())
    rect.setAttribute("width", width.toString())
    rect.setAttribute("height", "50")
    rect.setAttribute("rx", "5")
    rect.setAttribute("ry", "5")
    rect.setAttribute("fill", colorCausa)

    // Añadir sombra
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", `shadow-${index}`)
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
    rect.setAttribute("filter", `url(#shadow-${index})`)

    // Eventos
    rect.addEventListener("mouseover", () => onNodeHover(causa))
    rect.addEventListener("mouseout", () => onNodeHover(null))
    rect.addEventListener("click", () => onNodeClick(causa))

    group.appendChild(rect)

    // Texto para la causa (nombre completo, sin truncar)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", x.toString())
    text.setAttribute("y", y.toString())
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("dominant-baseline", "middle")
    text.setAttribute("fill", "white")
    text.setAttribute("font-size", "14")
    text.setAttribute("font-weight", "bold")
    text.textContent = causa.name

    group.appendChild(text)

    // Probabilidad a priori
    const probText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    probText.setAttribute("x", x.toString())
    probText.setAttribute("y", (y + 20).toString())
    probText.setAttribute("text-anchor", "middle")
    probText.setAttribute("fill", "white")
    probText.setAttribute("font-size", "10")
    probText.setAttribute("font-family", "monospace")
    probText.textContent = `(${causa.probability?.toFixed(2)})`

    group.appendChild(probText)
  })

  // Calcular el ancho de cada nodo síntoma basado en el texto
  const calcularAnchoSintoma = (nombre: string): number => {
    // Estimación aproximada: 8px por carácter + margen
    return Math.max(nombre.length * 8 + 40, 120)
  }

  // Optimizar la disposición de las conexiones para minimizar cruces
  // Ordenar los síntomas según sus causas más fuertes
  const sintomaOrden = new Map<string, number>()

  sintomas.forEach((sintoma) => {
    // Encontrar la causa más fuerte para este síntoma
    let causaMasFuerte = ""
    let probabilidadMasFuerte = 0

    Object.entries(PROBABILIDADES_CONDICIONALES[sintoma.id] || {}).forEach(([causa, prob]) => {
      if (prob > probabilidadMasFuerte) {
        probabilidadMasFuerte = prob
        causaMasFuerte = causa
      }
    })

    // Asignar el índice de la causa más fuerte
    const causaIndex = causas.findIndex((c) => c.id === causaMasFuerte)
    sintomaOrden.set(sintoma.id, causaIndex >= 0 ? causaIndex : 0)
  })

  // Ordenar los síntomas
  const sintomasOrdenados = [...sintomas].sort((a, b) => {
    return (sintomaOrden.get(a.id) || 0) - (sintomaOrden.get(b.id) || 0)
  })

  // Calcular posiciones horizontales para síntomas con espaciado mejorado
  const posicionesSintomas: { x: number; width: number }[] = []
  posicionXActual = 100 // Reiniciar posición inicial

  sintomasOrdenados.forEach((sintoma) => {
    const ancho = calcularAnchoSintoma(sintoma.name)
    posicionesSintomas.push({ x: posicionXActual + ancho / 2, width: ancho })
    posicionXActual += ancho + 60 // Añadir 60px de espacio entre nodos
  })

  // Ajustar el viewBox si es necesario para acomodar los síntomas
  const anchoTotalSintomas = posicionXActual
  if (anchoTotalSintomas > anchoTotalCausas && anchoTotalSintomas > 1200) {
    svg.setAttribute("viewBox", `0 0 ${anchoTotalSintomas + 100} 600`)
  }

  // Posicionar síntomas en la parte inferior con mayor espaciado vertical
  sintomasOrdenados.forEach((sintoma, index) => {
    const x = posicionesSintomas[index].x
    const y = 450 // Aumentado de 320 a 450 para más espacio vertical
    const width = posicionesSintomas[index].width

    // Crear grupo para el nodo síntoma
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("class", "node sintoma-node")
    group.setAttribute("data-id", sintoma.id)
    mainGroup.appendChild(group)

    // Crear elipse para el síntoma con sombra
    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
    ellipse.setAttribute("cx", x.toString())
    ellipse.setAttribute("cy", y.toString())
    ellipse.setAttribute("rx", (width / 2).toString())
    ellipse.setAttribute("ry", "30")
    ellipse.setAttribute("fill", colorSintoma)

    // Añadir sombra
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", `shadow-sintoma-${index}`)
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
    ellipse.setAttribute("filter", `url(#shadow-sintoma-${index})`)

    // Eventos
    ellipse.addEventListener("mouseover", () => onNodeHover(sintoma))
    ellipse.addEventListener("mouseout", () => onNodeHover(null))

    group.appendChild(ellipse)

    // Texto para el síntoma (nombre completo, sin truncar)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", x.toString())
    text.setAttribute("y", y.toString())
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("dominant-baseline", "middle")
    text.setAttribute("fill", "white")
    text.setAttribute("font-size", "12")
    text.textContent = sintoma.name

    group.appendChild(text)
  })

  // Crear un mapa para rastrear las posiciones de las etiquetas y evitar superposiciones
  const etiquetasOcupadas: Map<string, boolean> = new Map()

  // Dibujar enlaces con curvas Bézier mejoradas y mayor espaciado
  data.links.forEach((link) => {
    const sourceNode = causas.find((n) => n.id === link.source)
    const targetNode = sintomasOrdenados.find((n) => n.id === link.target)

    if (!sourceNode || !targetNode) return

    // Calcular posiciones
    const sourceIndex = causas.indexOf(sourceNode)
    const targetIndex = sintomasOrdenados.indexOf(targetNode)

    const sourceX = posicionesCausas[sourceIndex].x
    const sourceY = 125 // Punto de salida desde la parte inferior del nodo causa

    const targetX = posicionesSintomas[targetIndex].x
    const targetY = 420 // Punto de entrada en la parte superior del nodo síntoma

    // Determinar grosor de línea según la fuerza de la relación
    let strokeWidth = 1
    if (link.probability > 0.7) {
      strokeWidth = 3
    } else if (link.probability >= 0.3) {
      strokeWidth = 2
    }

    // Crear grupo para el enlace
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("class", "link")
    group.setAttribute("data-source", link.source as string)
    group.setAttribute("data-target", link.target as string)
    mainGroup.appendChild(group)

    // Calcular puntos de control para curva Bézier con mayor espaciado vertical
    const dx = targetX - sourceX
    const dy = targetY - sourceY

    // Ajustar los puntos de control para crear curvas más suaves y evitar cruces
    // Usar diferentes estrategias según la distancia horizontal
    let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y

    if (Math.abs(dx) < 100) {
      // Para conexiones casi verticales, usar puntos de control más alejados
      controlPoint1X = sourceX + dx * 0.1
      controlPoint1Y = sourceY + dy * 0.3
      controlPoint2X = sourceX + dx * 0.9
      controlPoint2Y = sourceY + dy * 0.7
    } else if (dx > 0) {
      // Para conexiones que van de izquierda a derecha
      controlPoint1X = sourceX + Math.min(dx * 0.2, 100)
      controlPoint1Y = sourceY + dy * 0.3
      controlPoint2X = targetX - Math.min(dx * 0.2, 100)
      controlPoint2Y = targetY - dy * 0.3
    } else {
      // Para conexiones que van de derecha a izquierda
      controlPoint1X = sourceX - Math.min(Math.abs(dx) * 0.2, 100)
      controlPoint1Y = sourceY + dy * 0.3
      controlPoint2X = targetX + Math.min(Math.abs(dx) * 0.2, 100)
      controlPoint2Y = targetY - dy * 0.3
    }

    const d = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", d)
    path.setAttribute("stroke", colorConexion)
    path.setAttribute("stroke-width", strokeWidth.toString())
    path.setAttribute("fill", "none")

    // Añadir flecha al final de la curva
    path.setAttribute("marker-end", "url(#arrowhead)")

    // Eventos
    path.addEventListener("mouseover", () => onLinkHover(link))
    path.addEventListener("mouseout", () => onLinkHover(null))

    group.appendChild(path)

    // Calcular posición para la etiqueta de probabilidad
    // Punto medio de la curva Bézier (aproximado)
    const labelX = sourceX + dx * 0.5
    const labelY = sourceY + dy * 0.5

    // Ajustar la posición vertical para evitar superposiciones
    let adjustedLabelY = labelY

    // Crear una clave única para la posición aproximada
    const posKey = `${Math.round(labelX / 30)}_${Math.round(labelY / 30)}`

    // Si la posición ya está ocupada, ajustar verticalmente
    if (etiquetasOcupadas.has(posKey)) {
      // Buscar una posición libre cercana
      for (let offset = 1; offset <= 5; offset++) {
        const altPosKey1 = `${Math.round(labelX / 30)}_${Math.round((labelY + offset * 20) / 30)}`
        const altPosKey2 = `${Math.round(labelX / 30)}_${Math.round((labelY - offset * 20) / 30)}`

        if (!etiquetasOcupadas.has(altPosKey1)) {
          adjustedLabelY = labelY + offset * 20
          etiquetasOcupadas.set(altPosKey1, true)
          break
        } else if (!etiquetasOcupadas.has(altPosKey2)) {
          adjustedLabelY = labelY - offset * 20
          etiquetasOcupadas.set(altPosKey2, true)
          break
        }
      }
    } else {
      etiquetasOcupadas.set(posKey, true)
    }

    // Fondo para el texto
    const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    const textWidth = 40
    const textHeight = 18
    textBg.setAttribute("x", (labelX - textWidth / 2).toString())
    textBg.setAttribute("y", (adjustedLabelY - textHeight / 2).toString())
    textBg.setAttribute("width", textWidth.toString())
    textBg.setAttribute("height", textHeight.toString())
    textBg.setAttribute("fill", "white")
    textBg.setAttribute("opacity", "0.9")
    textBg.setAttribute("rx", "3")
    textBg.setAttribute("ry", "3")

    group.appendChild(textBg)

    // Texto de probabilidad
    const probText = document.createElementNS("http://wwwwww.w3.org/2000/svg", "text")
    probText.setAttribute("x", labelX.toString())
    probText.setAttribute("y", adjustedLabelY.toString())
    probText.setAttribute("text-anchor", "middle")
    probText.setAttribute("dominant-baseline", "middle")
    probText.setAttribute("fill", "#333")
    probText.setAttribute("font-size", "10")
    probText.setAttribute("font-family", "monospace")
    probText.textContent = link.probability.toFixed(2)

    group.appendChild(probText)
  })

  // Definir marcador de flecha
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  marker.setAttribute("id", "arrowhead")
  marker.setAttribute("markerWidth", "10")
  marker.setAttribute("markerHeight", "7")
  marker.setAttribute("refX", "10")
  marker.setAttribute("refY", "3.5")
  marker.setAttribute("orient", "auto")

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("points", "0 0, 10 3.5, 0 7")
  polygon.setAttribute("fill", colorConexion)

  marker.appendChild(polygon)
  defs.appendChild(marker)

  return svg
}

// Función para preparar los datos del grafo
function prepareGraphData(): GraphData {
  const nodes: Node[] = []
  const links: Link[] = []

  // Añadir nodos de causa
  Object.entries(CAUSAS_UNIFICADAS).forEach(([key, name]) => {
    nodes.push({
      id: name,
      name,
      type: "causa",
      probability: PROBABILIDADES_PRIORI[name] || 0.1,
      color: "#4E79A7", // Azul
      size: 15,
    })
  })

  // Añadir nodos de síntoma
  Object.values(SINTOMAS_UNIFICADOS).forEach((name) => {
    nodes.push({
      id: name,
      name,
      type: "sintoma",
      color: "#F28E2B", // Naranja
      size: 12,
    })
  })

  // Añadir enlaces
  Object.entries(PROBABILIDADES_CONDICIONALES).forEach(([sintoma, causas]) => {
    Object.entries(causas).forEach(([causa, probabilidad]) => {
      links.push({
        source: causa,
        target: sintoma,
        strength: probabilidad,
        probability: probabilidad,
      })
    })
  })

  return { nodes, links }
}

// Funciones auxiliares
function getCausaName(id: string): string {
  return id
}

function getSintomaName(id: string): string {
  return id
}
