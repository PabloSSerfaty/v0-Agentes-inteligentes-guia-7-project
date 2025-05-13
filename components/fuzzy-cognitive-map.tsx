"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

// Definición de tipos para el mapa cognitivo difuso
interface FCMNode {
  id: string
  name: string
  type: "input" | "output" | "cause"
  x?: number
  y?: number
}

interface FCMRelation {
  source: string
  target: string
  weight: number // Peso entre -1 y 1
}

interface FCMData {
  nodes: FCMNode[]
  relations: FCMRelation[]
}

// Datos del mapa cognitivo difuso para el sistema de diagnóstico de red
const fcmData: FCMData = {
  nodes: [
    // Variables lingüísticas de entrada (criterios evaluativos)
    { id: "velocidad", name: "Velocidad de Conexión", type: "input" },
    { id: "estabilidad", name: "Estabilidad de Conexión", type: "input" },
    { id: "intensidad_wifi", name: "Intensidad WiFi", type: "input" },
    { id: "latencia", name: "Latencia", type: "input" },
    { id: "acceso", name: "Acceso a Servicios", type: "input" },

    // Causas potenciales (salidas del sistema difuso)
    { id: "congestion", name: "Congestión de Red", type: "cause" },
    { id: "fallo_router", name: "Fallo del Router", type: "cause" },
    { id: "interferencia", name: "Interferencia WiFi", type: "cause" },
    { id: "config_incorrecta", name: "Config. Incorrecta DNS", type: "cause" },
    { id: "fallo_infraestructura", name: "Fallo Infraestructura", type: "cause" },
  ],
  relations: [
    // Relaciones de velocidad
    { source: "velocidad", target: "congestion", weight: -0.8 },
    { source: "velocidad", target: "fallo_router", weight: -0.6 },
    { source: "velocidad", target: "config_incorrecta", weight: -0.5 },

    // Relaciones de estabilidad
    { source: "estabilidad", target: "fallo_router", weight: -0.7 },
    { source: "estabilidad", target: "interferencia", weight: -0.8 },
    { source: "estabilidad", target: "fallo_infraestructura", weight: -0.6 },

    // Relaciones de intensidad WiFi
    { source: "intensidad_wifi", target: "interferencia", weight: -0.9 },
    { source: "intensidad_wifi", target: "fallo_router", weight: -0.5 },

    // Relaciones de latencia
    { source: "latencia", target: "congestion", weight: 0.8 },
    { source: "latencia", target: "fallo_router", weight: 0.6 },
    { source: "latencia", target: "config_incorrecta", weight: 0.4 },

    // Relaciones de acceso
    { source: "acceso", target: "config_incorrecta", weight: -0.9 },
    { source: "acceso", target: "fallo_infraestructura", weight: -0.7 },
    { source: "acceso", target: "fallo_router", weight: -0.5 },

    // Relaciones entre causas (efectos secundarios)
    { source: "fallo_router", target: "congestion", weight: 0.4 },
    { source: "interferencia", target: "congestion", weight: 0.3 },
    { source: "fallo_infraestructura", target: "congestion", weight: 0.6 },
  ],
}

// Función para abrir el diálogo del mapa cognitivo difuso desde fuera del componente
export function openFCMDialog() {
  // Esta función será implementada por el componente cuando se monte
  console.log("openFCMDialog called but not yet implemented")
}

export function FuzzyCognitiveMap({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Usa el estado externo si se proporciona, de lo contrario usa el interno
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }
  const [hoveredNode, setHoveredNode] = useState<FCMNode | null>(null)
  const [hoveredRelation, setHoveredRelation] = useState<FCMRelation | null>(null)
  const [selectedNode, setSelectedNode] = useState<FCMNode | null>(null)

  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(1)
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
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Mapa Cognitivo Difuso de Criterios Evaluativos</DialogTitle>
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

                <FCMVisualization
                  data={fcmData}
                  onNodeHover={setHoveredNode}
                  onRelationHover={setHoveredRelation}
                  onNodeClick={setSelectedNode}
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
                    <p className="text-xs text-gray-500">
                      {hoveredNode.type === "input"
                        ? "Variable Lingüística"
                        : hoveredNode.type === "cause"
                          ? "Causa Potencial"
                          : "Variable de Salida"}
                    </p>
                  </div>
                )}

                {/* Información sobre relación al hacer hover */}
                {hoveredRelation && (
                  <div className="absolute top-2 left-40 bg-white p-2 border rounded shadow-md z-10">
                    <h4 className="font-medium">Relación Causal</h4>
                    <p className="text-sm">
                      {getNodeName(fcmData, hoveredRelation.source)} → {getNodeName(fcmData, hoveredRelation.target)}
                    </p>
                    <p className="text-sm">
                      Peso: {hoveredRelation.weight.toFixed(2)}(
                      {hoveredRelation.weight > 0 ? "Relación Positiva" : "Relación Negativa"})
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.abs(hoveredRelation.weight) > 0.7
                        ? "Influencia Fuerte"
                        : Math.abs(hoveredRelation.weight) > 0.4
                          ? "Influencia Media"
                          : "Influencia Débil"}
                    </p>
                  </div>
                )}
              </div>

              {/* Leyenda */}
              <div className="mt-4 border rounded-lg p-4 bg-white">
                <h3 className="font-medium mb-2">Leyenda</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-full bg-[#4E79A7] mr-2"></div>
                      <span className="text-sm">Variables Lingüísticas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#F28E2B] mr-2"></div>
                      <span className="text-sm">Causas Potenciales</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Relaciones:</div>
                    <div className="flex items-center">
                      <div className="h-[2px] w-10 bg-[#59A14F] mr-2"></div>
                      <span className="text-xs">Relación Positiva</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-[2px] w-10 bg-[#E15759] mr-2"></div>
                      <span className="text-xs">Relación Negativa</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-[3px] w-10 bg-[#555555] mr-2"></div>
                      <span className="text-xs">Influencia Fuerte</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p>• El grosor de las líneas indica la fuerza de la relación causal</p>
                  <p>• Las líneas verdes indican relaciones positivas (si A aumenta, B aumenta)</p>
                  <p>• Las líneas rojas indican relaciones negativas (si A aumenta, B disminuye)</p>
                </div>
              </div>
            </div>

            {/* Panel lateral con información adicional */}
            <div>
              <Card className="p-4 h-full">
                <h3 className="font-medium mb-4">Información del Mapa Cognitivo Difuso</h3>

                {selectedNode ? (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">{selectedNode.name}</h4>

                    {selectedNode.type === "input" ? (
                      <>
                        <p className="text-sm mb-4">
                          Variable lingüística de entrada que representa un criterio evaluativo en el sistema difuso.
                        </p>

                        <h5 className="font-medium mt-4 mb-2">Influye en:</h5>
                        <ul className="space-y-1 text-sm">
                          {fcmData.relations
                            .filter((rel) => rel.source === selectedNode.id)
                            .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                            .map((rel, index) => {
                              const targetNode = fcmData.nodes.find((n) => n.id === rel.target)
                              return (
                                <li key={index} className="flex items-start">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full mr-2 mt-1.5 ${rel.weight > 0 ? "bg-[#59A14F]" : "bg-[#E15759]"}`}
                                  ></span>
                                  {targetNode?.name} ({rel.weight > 0 ? "+" : ""}
                                  {rel.weight.toFixed(2)})
                                </li>
                              )
                            })}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="text-sm mb-4">
                          Causa potencial que puede ser identificada por el sistema difuso basado en los valores de las
                          variables de entrada.
                        </p>

                        <h5 className="font-medium mt-4 mb-2">Influenciado por:</h5>
                        <ul className="space-y-1 text-sm">
                          {fcmData.relations
                            .filter((rel) => rel.target === selectedNode.id)
                            .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                            .map((rel, index) => {
                              const sourceNode = fcmData.nodes.find((n) => n.id === rel.source)
                              return (
                                <li key={index} className="flex items-start">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full mr-2 mt-1.5 ${rel.weight > 0 ? "bg-[#59A14F]" : "bg-[#E15759]"}`}
                                  ></span>
                                  {sourceNode?.name} ({rel.weight > 0 ? "+" : ""}
                                  {rel.weight.toFixed(2)})
                                </li>
                              )
                            })}
                        </ul>

                        {fcmData.relations.some((rel) => rel.source === selectedNode.id) && (
                          <>
                            <h5 className="font-medium mt-4 mb-2">Influye en:</h5>
                            <ul className="space-y-1 text-sm">
                              {fcmData.relations
                                .filter((rel) => rel.source === selectedNode.id)
                                .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                                .map((rel, index) => {
                                  const targetNode = fcmData.nodes.find((n) => n.id === rel.target)
                                  return (
                                    <li key={index} className="flex items-start">
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full mr-2 mt-1.5 ${rel.weight > 0 ? "bg-[#59A14F]" : "bg-[#E15759]"}`}
                                      ></span>
                                      {targetNode?.name} ({rel.weight > 0 ? "+" : ""}
                                      {rel.weight.toFixed(2)})
                                    </li>
                                  )
                                })}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Selecciona un nodo para ver información detallada sobre sus relaciones causales.
                    </p>

                    <h4 className="font-medium mb-2">Sobre los Mapas Cognitivos Difusos</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Los Mapas Cognitivos Difusos (FCM) son una técnica de modelado que combina aspectos de redes
                      neuronales y lógica difusa para representar conocimiento causal. En este diagrama:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Los nodos azules representan variables lingüísticas de entrada (criterios evaluativos)</li>
                      <li>• Los nodos naranjas representan causas potenciales de problemas de red</li>
                      <li>• Las conexiones representan relaciones causales con diferentes pesos</li>
                      <li>• El peso de una relación indica la fuerza e influencia (positiva o negativa)</li>
                    </ul>

                    <h4 className="font-medium mt-4 mb-2">Aplicación en el Sistema Difuso</h4>
                    <p className="text-sm text-gray-600">
                      Este mapa muestra cómo las variables lingüísticas influyen en la identificación de causas
                      potenciales en el sistema experto difuso. Las relaciones causales con sus pesos representan las
                      reglas difusas implementadas en el sistema.
                    </p>
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

// Función auxiliar para obtener el nombre de un nodo por su ID
function getNodeName(data: FCMData, nodeId: string): string {
  const node = data.nodes.find((n) => n.id === nodeId)
  return node ? node.name : nodeId
}

// Componente para la visualización del mapa cognitivo difuso
function FCMVisualization({
  data,
  onNodeHover,
  onRelationHover,
  onNodeClick,
  zoomLevel,
  panOffset,
  setPanOffset,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
}: {
  data: FCMData
  onNodeHover: (node: FCMNode | null) => void
  onRelationHover: (relation: FCMRelation | null) => void
  onNodeClick: (node: FCMNode) => void
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
    // setZoomLevel(newZoom) // This line was causing the error
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Calcular posiciones para los nodos si no están definidas
    const dataWithPositions = calculateNodePositions(data)

    // Renderizar la visualización
    const svg = renderFCMVisualization(
      containerRef.current,
      dataWithPositions,
      onNodeHover,
      onRelationHover,
      onNodeClick,
    )

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
  }, [data, onNodeHover, onRelationHover, onNodeClick, zoomLevel, panOffset])

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

// Función para calcular posiciones de los nodos
function calculateNodePositions(data: FCMData): FCMData {
  const result = { ...data, nodes: [...data.nodes] }

  // Separar nodos por tipo
  const inputNodes = result.nodes.filter((node) => node.type === "input")
  const causeNodes = result.nodes.filter((node) => node.type === "cause")

  // Calcular posiciones para nodos de entrada (arriba)
  const inputCount = inputNodes.length
  const inputSpacing = 1000 / (inputCount + 1)

  inputNodes.forEach((node, index) => {
    node.x = 100 + (index + 1) * inputSpacing
    node.y = 100
  })

  // Calcular posiciones para nodos de causa (abajo)
  const causeCount = causeNodes.length
  const causeSpacing = 1000 / (causeCount + 1)

  causeNodes.forEach((node, index) => {
    node.x = 100 + (index + 1) * causeSpacing
    node.y = 500
  })

  return result
}

// Función para renderizar la visualización del mapa cognitivo difuso
function renderFCMVisualization(
  container: HTMLDivElement,
  data: FCMData,
  onNodeHover: (node: FCMNode | null) => void,
  onRelationHover: (relation: FCMRelation | null) => void,
  onNodeClick: (node: FCMNode) => void,
): SVGSVGElement {
  // Limpiar el contenedor
  container.innerHTML = ""

  // Crear un SVG para la visualización
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", "0 0 1200 600")
  container.appendChild(svg)

  // Crear un grupo principal para aplicar transformaciones
  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  mainGroup.setAttribute("class", "main-group")
  svg.appendChild(mainGroup)

  // Definir colores
  const colorInput = "#4E79A7" // Azul para variables de entrada
  const colorCause = "#F28E2B" // Naranja para causas
  const colorPositiveRelation = "#59A14F" // Verde para relaciones positivas
  const colorNegativeRelation = "#E15759" // Rojo para relaciones negativas

  // Dibujar relaciones
  data.relations.forEach((relation) => {
    const sourceNode = data.nodes.find((n) => n.id === relation.source)
    const targetNode = data.nodes.find((n) => n.id === relation.target)

    if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) return

    // Crear grupo para la relación
    const relationGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    relationGroup.setAttribute("class", "relation")
    mainGroup.appendChild(relationGroup)

    // Determinar color y grosor según el peso
    const color = relation.weight >= 0 ? colorPositiveRelation : colorNegativeRelation
    const strokeWidth = Math.abs(relation.weight) > 0.7 ? 3 : Math.abs(relation.weight) > 0.4 ? 2 : 1

    // Calcular puntos para la curva
    const startX = sourceNode.x
    const startY = sourceNode.y
    const endX = targetNode.x
    const endY = targetNode.y

    // Calcular punto de control para curva cuadrática
    const controlX = (startX + endX) / 2
    const controlY = (startY + endY) / 2 - 50 // Desplazar hacia arriba para curvar

    // Dibujar la línea de relación
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`)
    path.setAttribute("stroke", color)
    path.setAttribute("stroke-width", strokeWidth.toString())
    path.setAttribute("fill", "none")
    path.setAttribute("marker-end", `url(#arrowhead-${relation.weight >= 0 ? "positive" : "negative"})`)

    // Eventos
    path.addEventListener("mouseover", () => onRelationHover(relation))
    path.addEventListener("mouseout", () => onRelationHover(null))

    relationGroup.appendChild(path)

    // Añadir etiqueta de peso
    const labelX = controlX
    const labelY = controlY - 10

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
    textBg.setAttribute("rx", "3")
    textBg.setAttribute("ry", "3")

    relationGroup.appendChild(textBg)

    // Texto de peso
    const weightText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    weightText.setAttribute("x", labelX.toString())
    weightText.setAttribute("y", labelY.toString())
    weightText.setAttribute("text-anchor", "middle")
    weightText.setAttribute("dominant-baseline", "middle")
    weightText.setAttribute("fill", color)
    weightText.setAttribute("font-size", "10")
    weightText.setAttribute("font-weight", "bold")
    weightText.textContent = relation.weight.toFixed(2)

    relationGroup.appendChild(weightText)
  })

  // Dibujar nodos
  data.nodes.forEach((node) => {
    if (!node.x || !node.y) return

    // Crear grupo para el nodo
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    nodeGroup.setAttribute("class", `node ${node.type}-node`)
    nodeGroup.setAttribute("data-id", node.id)
    mainGroup.appendChild(nodeGroup)

    // Determinar color según el tipo
    const color = node.type === "input" ? colorInput : colorCause

    // Crear círculo para el nodo
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    circle.setAttribute("cx", node.x.toString())
    circle.setAttribute("cy", node.y.toString())
    circle.setAttribute("r", "30")
    circle.setAttribute("fill", color)

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
    circle.addEventListener("click", () => onNodeClick(node))

    nodeGroup.appendChild(circle)

    // Texto para el nodo
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", node.x.toString())
    text.setAttribute("y", node.y.toString())
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("dominant-baseline", "middle")
    text.setAttribute("fill", "white")
    text.setAttribute("font-size", "12")
    text.setAttribute("font-weight", "bold")

    // Ajustar el texto para que quepa en el nodo
    const displayText = node.name
    if (displayText.length > 15) {
      const parts = displayText.split(" ")
      if (parts.length > 1) {
        // Dividir en dos líneas si hay espacios
        const midpoint = Math.floor(parts.length / 2)
        const line1 = parts.slice(0, midpoint).join(" ")
        const line2 = parts.slice(midpoint).join(" ")

        const tspan1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan")
        tspan1.setAttribute("x", node.x.toString())
        tspan1.setAttribute("dy", "-0.6em")
        tspan1.textContent = line1

        const tspan2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan")
        tspan2.setAttribute("x", node.x.toString())
        tspan2.setAttribute("dy", "1.2em")
        tspan2.textContent = line2

        text.appendChild(tspan1)
        text.appendChild(tspan2)
      } else {
        // Si es una palabra larga, truncar
        text.textContent = displayText.substring(0, 12) + "..."
      }
    } else {
      text.textContent = displayText
    }

    nodeGroup.appendChild(text)
  })

  // Definir marcadores de flecha
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  // Flecha para relaciones positivas
  const markerPositive = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  markerPositive.setAttribute("id", "arrowhead-positive")
  markerPositive.setAttribute("markerWidth", "10")
  markerPositive.setAttribute("markerHeight", "7")
  markerPositive.setAttribute("refX", "9")
  markerPositive.setAttribute("refY", "3.5")
  markerPositive.setAttribute("orient", "auto")

  const polygonPositive = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygonPositive.setAttribute("points", "0 0, 10 3.5, 0 7")
  polygonPositive.setAttribute("fill", colorPositiveRelation)

  markerPositive.appendChild(polygonPositive)
  defs.appendChild(markerPositive)

  // Flecha para relaciones negativas
  const markerNegative = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  markerNegative.setAttribute("id", "arrowhead-negative")
  markerNegative.setAttribute("markerWidth", "10")
  markerNegative.setAttribute("markerHeight", "7")
  markerNegative.setAttribute("refX", "9")
  markerNegative.setAttribute("refY", "3.5")
  markerNegative.setAttribute("orient", "auto")

  const polygonNegative = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygonNegative.setAttribute("points", "0 0, 10 3.5, 0 7")
  polygonNegative.setAttribute("fill", colorNegativeRelation)

  markerNegative.appendChild(polygonNegative)
  defs.appendChild(markerNegative)

  return svg
}
