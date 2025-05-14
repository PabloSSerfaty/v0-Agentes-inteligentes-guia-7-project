"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

// Definición de tipos para el árbol de decisión
interface DecisionNode {
  id: string
  type: "decision" | "result" | "start"
  text: string
  children?: { condition: string; probability: number; nodeId: string }[]
  probability?: number
  actions?: string[]
}

// Estructura del árbol de decisión actualizada según la imagen proporcionada
const decisionTree: DecisionNode[] = [
  {
    id: "start",
    type: "start",
    text: "Inicio del Diagnóstico",
    children: [{ condition: "Continuar", probability: 1.0, nodeId: "hay_conexion" }],
  },
  {
    id: "hay_conexion",
    type: "decision",
    text: "¿Hay conexión a Internet?",
    children: [
      { condition: "No", probability: 0.5, nodeId: "ping_falla" },
      { condition: "Sí", probability: 0.5, nodeId: "conexion_intermitente" },
    ],
  },
  // Rama: No hay conexión a Internet
  {
    id: "ping_falla",
    type: "decision",
    text: "¿Ping falla?",
    children: [
      { condition: "Sí", probability: 0.6, nodeId: "reiniciar_router" },
      { condition: "No", probability: 0.4, nodeId: "revisar_config_ip" },
    ],
  },
  {
    id: "reiniciar_router",
    type: "result",
    text: "Reiniciar router",
    probability: 0.9,
    actions: [
      "Apagar el router durante 30 segundos",
      "Encender el router y esperar a que se inicialice",
      "Verificar si se restablece la conexión",
    ],
  },
  {
    id: "revisar_config_ip",
    type: "result",
    text: "Revisar configuración IP",
    probability: 0.85,
    actions: [
      "Verificar que la configuración IP sea correcta",
      "Comprobar que el DHCP esté habilitado o la IP estática sea válida",
      "Verificar la máscara de subred y la puerta de enlace",
    ],
  },
  // Rama: Hay conexión pero es intermitente
  {
    id: "conexion_intermitente",
    type: "decision",
    text: "¿Conexión lenta o intermitente?",
    children: [
      { condition: "Sí", probability: 0.7, nodeId: "wifi_o_cable" },
      { condition: "No", probability: 0.3, nodeId: "carga_lento_servidor" },
    ],
  },
  {
    id: "wifi_o_cable",
    type: "decision",
    text: "¿WiFi o cable?",
    children: [
      { condition: "WiFi", probability: 0.6, nodeId: "default_route" },
      { condition: "Cable", probability: 0.4, nodeId: "cable_danado" },
    ],
  },
  {
    id: "default_route",
    type: "result",
    text: "Default route",
    probability: 0.75,
    actions: [
      "Verificar la configuración de la ruta por defecto",
      "Comprobar la tabla de enrutamiento",
      "Revisar la configuración del gateway",
    ],
  },
  {
    id: "cable_danado",
    type: "result",
    text: "Cable dañado",
    probability: 0.8,
    actions: [
      "Inspeccionar visualmente el cable en busca de daños",
      "Reemplazar el cable de red",
      "Verificar los conectores RJ45",
    ],
  },
  // Rama: Hay conexión pero hay problemas
  {
    id: "carga_lento_servidor",
    type: "decision",
    text: "¿Carga lento el servidor interno?",
    children: [
      { condition: "Sí", probability: 0.65, nodeId: "ver_tablas_recursos" },
      { condition: "No", probability: 0.35, nodeId: "utiliza_dns_cable" },
    ],
  },
  {
    id: "ver_tablas_recursos",
    type: "decision",
    text: "Ver tablas y recursos del servidor",
    children: [
      { condition: "Problema identificado", probability: 0.7, nodeId: "controlar_procesos" },
      { condition: "Sin problemas", probability: 0.3, nodeId: "revisar_estado_red" },
    ],
  },
  {
    id: "controlar_procesos",
    type: "result",
    text: "Controlar el proceso",
    probability: 0.85,
    actions: [
      "Identificar los procesos que consumen más recursos",
      "Limitar o detener procesos problemáticos",
      "Optimizar la configuración del servidor",
    ],
  },
  {
    id: "revisar_estado_red",
    type: "result",
    text: "Revisar estado general de red interna",
    probability: 0.7,
    actions: [
      "Verificar el estado de los switches y routers internos",
      "Comprobar la carga de la red",
      "Revisar la configuración de QoS",
    ],
  },
  {
    id: "utiliza_dns_cable",
    type: "decision",
    text: "¿Utiliza DNS o cable con ISP?",
    children: [
      { condition: "DNS", probability: 0.55, nodeId: "cambiar_servidor_dns" },
      { condition: "Cable", probability: 0.45, nodeId: "revisar_mantenimiento" },
    ],
  },
  {
    id: "cambiar_servidor_dns",
    type: "result",
    text: "Cambiar servidor DNS",
    probability: 0.8,
    actions: [
      "Configurar servidores DNS alternativos (8.8.8.8, 1.1.1.1)",
      "Limpiar la caché DNS",
      "Verificar que los nuevos servidores DNS funcionen correctamente",
    ],
  },
  {
    id: "revisar_mantenimiento",
    type: "result",
    text: "Revisar mantenimiento del ISP",
    probability: 0.75,
    actions: [
      "Contactar al proveedor de servicios",
      "Verificar si hay mantenimientos programados",
      "Consultar el estado del servicio en la página del ISP",
    ],
  },
]

export function DecisionTreeDiagram({
  open = false,
  onOpenChange = (value: boolean) => {},
}: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Función para manejar el inicio del arrastre
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // Solo botón izquierdo
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Función para manejar el movimiento durante el arrastre
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Árbol de Decisión para Diagnóstico de Red</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2">
            <div className="border rounded-lg p-4 bg-white h-[600px] relative overflow-hidden">
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

              {/* Contenedor para la imagen con zoom y pan */}
              <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1KNe2lkIbrLuxgLCAanUJ1vecbarmA.png"
                    alt="Árbol de decisión para diagnóstico de red"
                    className="max-w-full max-h-full object-contain"
                    style={{ pointerEvents: "none" }} // Evita problemas con el arrastre
                  />
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-4 border rounded-lg p-4 bg-white">
              <h3 className="font-medium mb-2">Leyenda</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-md border border-blue-500 mr-2"></div>
                    <span className="text-sm">Nodo de decisión</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-md border border-red-500 mr-2"></div>
                    <span className="text-sm">Nodo de decisión crítico</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-md bg-white border border-gray-500 mr-2"></div>
                    <span className="text-sm">Acción recomendada</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm mb-1">Conexiones:</div>
                  <div className="flex items-center mb-1">
                    <div className="h-[1px] w-10 bg-[#555555] mr-2"></div>
                    <span className="text-xs">Flujo de decisión</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="text-xs mr-2">Sí</span>
                    <div className="h-[1px] w-10 bg-[#555555]"></div>
                    <span className="text-xs ml-2">Respuesta afirmativa</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">No</span>
                    <div className="h-[1px] w-10 bg-[#555555]"></div>
                    <span className="text-xs ml-2">Respuesta negativa</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <p>• Utiliza los controles de zoom o la rueda del ratón para acercar/alejar</p>
                <p>• Arrastra para navegar por el diagrama cuando está ampliado</p>
              </div>
            </div>
          </div>

          {/* Panel lateral con información adicional */}
          <div>
            <Card className="p-4 h-full">
              <h3 className="font-medium mb-4">Información del Diagnóstico</h3>

              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Este árbol de decisión ilustra el proceso de diagnóstico de problemas de red que implementa el sistema
                  experto basado en reglas.
                </p>

                <h4 className="font-medium mb-2">Cómo Interpretar</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Los rectángulos con borde azul/rojo representan preguntas sobre síntomas</li>
                  <li>• Los rectángulos con borde simple son acciones recomendadas</li>
                  <li>• Siga las flechas según las respuestas a cada pregunta</li>
                  <li>• Las etiquetas "Sí" y "No" indican qué camino seguir</li>
                </ul>

                <h4 className="font-medium mt-4 mb-2">Sobre el Sistema Basado en Reglas</h4>
                <p className="text-sm text-gray-600">
                  El sistema experto basado en reglas implementa este árbol de decisión mediante un conjunto de reglas
                  SI-ENTONCES. Cada regla evalúa los síntomas seleccionados y determina las causas más probables del
                  problema de red.
                </p>

                <h4 className="font-medium mt-4 mb-2">Ejemplo de Regla</h4>
                <div className="text-sm p-3 bg-gray-100 rounded-md font-mono">
                  SI [Sin conexión a Internet] Y [Ping falla] ENTONCES [Reiniciar router]
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
// Función para obtener la ruta de decisión hasta un nodo resultado
function getDecisionPath(tree: DecisionNode[], resultId: string): string[] {
  const path: string[] = []
  let currentId = resultId

  // Buscar el nodo padre
  const findParent = (nodeId: string): string | null => {
    for (const node of tree) {
      if (node.children) {
        for (const child of node.children) {
          if (child.nodeId === nodeId) {
            return node.id
          }
        }
      }
    }
    return null
  }

  // Buscar la condición entre nodos
  const findCondition = (parentId: string, childId: string): string => {
    const parent = tree.find((node) => node.id === parentId)
    if (parent && parent.children) {
      const child = parent.children.find((c) => c.nodeId === childId)
      if (child) {
        return `${parent.text} = ${child.condition}`
      }
    }
    return ""
  }

  // Construir la ruta desde el resultado hasta el inicio
  let parentId = findParent(currentId)
  while (parentId && parentId !== "start") {
    const condition = findCondition(parentId, currentId)
    if (condition) {
      path.unshift(condition)
    }
    currentId = parentId
    parentId = findParent(currentId)
  }

  return path
}

// Componente para la visualización del árbol de decisión
function DecisionTreeGraph({
  tree,
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
  setZoomLevel,
}: {
  tree: DecisionNode[]
  onNodeHover: (node: DecisionNode | null) => void
  onLinkHover: (link: { from: string; to: string; condition: string; probability: number } | null) => void
  onNodeClick: (node: DecisionNode) => void
  zoomLevel: number
  panOffset: { x: number; y: number }
  setPanOffset: (offset: { x: number; y: number }) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  dragStart: { x: number; y: number }
  setDragStart: (start: { x: number; y: number }) => void
  setZoomLevel: (zoom: number) => void
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
    if (typeof setZoomLevel === "function") {
      setZoomLevel(newZoom)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Renderizar la visualización del árbol de decisión
    const svg = renderDecisionTree(containerRef.current, tree, onNodeHover, onLinkHover, onNodeClick)

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
  }, [tree, onNodeHover, onLinkHover, onNodeClick, zoomLevel, panOffset])

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

// Función para renderizar el árbol de decisión
function renderDecisionTree(
  container: HTMLDivElement,
  tree: DecisionNode[],
  onNodeHover: (node: DecisionNode | null) => void,
  onLinkHover: (link: { from: string; to: string; condition: string; probability: number } | null) => void,
  onNodeClick: (node: DecisionNode) => void,
): SVGSVGElement {
  // Limpiar el contenedor
  container.innerHTML = ""

  // Crear un SVG para la visualización
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", "0 0 1200 800") // Viewbox más grande para el árbol
  container.appendChild(svg)

  // Crear un grupo principal para aplicar transformaciones
  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  mainGroup.setAttribute("class", "main-group")
  svg.appendChild(mainGroup)

  // Definir colores según especificaciones
  const colorStart = "#4A86E8" // Azul
  const colorDecision = "#F1C232" // Amarillo
  const colorResult = "#6AA84F" // Verde
  const colorConnection = "#555555" // Gris oscuro

  // Calcular la estructura del árbol
  const treeLayout = calculateTreeLayout(tree)

  // Dibujar conexiones
  drawConnections(mainGroup, tree, treeLayout, colorConnection, onLinkHover)

  // Dibujar nodos
  drawNodes(mainGroup, tree, treeLayout, colorStart, colorDecision, colorResult, onNodeHover, onNodeClick)

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
  polygon.setAttribute("fill", colorConnection)

  marker.appendChild(polygon)
  defs.appendChild(marker)

  return svg
}

// Función para calcular la disposición del árbol
function calculateTreeLayout(tree: DecisionNode[]): Map<string, { x: number; y: number; level: number }> {
  const layout = new Map<string, { x: number; y: number; level: number }>()

  // Encontrar el nodo raíz
  const root = tree.find((node) => node.id === "start")
  if (!root) return layout

  // Calcular niveles para cada nodo
  const levels: { [key: string]: number } = {}
  calculateLevels(root.id, 0)

  function calculateLevels(nodeId: string, level: number) {
    levels[nodeId] = level
    const node = tree.find((n) => n.id === nodeId)
    if (node && node.children) {
      for (const child of node.children) {
        calculateLevels(child.nodeId, level + 1)
      }
    }
  }

  // Calcular el número de nodos en cada nivel
  const nodesPerLevel: { [key: number]: string[] } = {}
  for (const [nodeId, level] of Object.entries(levels)) {
    if (!nodesPerLevel[level]) {
      nodesPerLevel[level] = []
    }
    nodesPerLevel[level].push(nodeId)
  }

  // Calcular posiciones X e Y
  const levelHeight = 150 // Espacio vertical entre niveles
  const maxNodesInLevel = Math.max(...Object.values(nodesPerLevel).map((nodes) => nodes.length))
  const totalWidth = 1000 // Ancho total disponible

  for (const [level, nodes] of Object.entries(nodesPerLevel)) {
    const levelNum = Number.parseInt(level)
    const nodeWidth = totalWidth / Math.max(nodes.length, 1)

    nodes.forEach((nodeId, index) => {
      const x = 100 + (index + 0.5) * nodeWidth
      const y = 80 + levelNum * levelHeight

      layout.set(nodeId, { x, y, level: levelNum })
    })
  }

  return layout
}

// Función para dibujar las conexiones entre nodos
function drawConnections(
  group: SVGGElement,
  tree: DecisionNode[],
  layout: Map<string, { x: number; y: number; level: number }>,
  color: string,
  onLinkHover: (link: { from: string; to: string; condition: string; probability: number } | null) => void,
) {
  // Para cada nodo con hijos, dibujar conexiones
  for (const node of tree) {
    if (!node.children) continue

    const parentPos = layout.get(node.id)
    if (!parentPos) continue

    for (const child of node.children) {
      const childPos = layout.get(child.nodeId)
      if (!childPos) continue

      // Determinar grosor de línea según la probabilidad
      let strokeWidth = 1
      if (child.probability > 0.7) {
        strokeWidth = 3
      } else if (child.probability >= 0.4) {
        strokeWidth = 2
      }

      // Calcular puntos para la curva
      const startX = parentPos.x
      const startY = parentPos.y + 30 // Punto de salida desde la parte inferior del nodo

      const endX = childPos.x
      const endY = childPos.y - 30 // Punto de entrada en la parte superior del nodo

      // Calcular puntos de control para curva Bézier
      const midY = (startY + endY) / 2

      // Crear grupo para la conexión
      const connectionGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      connectionGroup.setAttribute("class", "connection")
      group.appendChild(connectionGroup)

      // Dibujar la línea de conexión
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`)
      path.setAttribute("stroke", color)
      path.setAttribute("stroke-width", strokeWidth.toString())
      path.setAttribute("fill", "none")
      path.setAttribute("marker-end", "url(#arrowhead)")

      // Eventos
      path.addEventListener("mouseover", () =>
        onLinkHover({
          from: node.id,
          to: child.nodeId,
          condition: child.condition,
          probability: child.probability,
        }),
      )
      path.addEventListener("mouseout", () => onLinkHover(null))

      connectionGroup.appendChild(path)

      // Añadir etiqueta de condición
      const labelX = (startX + endX) / 2
      const labelY = midY - 10

      // Fondo para el texto
      const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      const textWidth = child.condition.length * 8 + 16
      const textHeight = 20
      textBg.setAttribute("x", (labelX - textWidth / 2).toString())
      textBg.setAttribute("y", (labelY - textHeight / 2).toString())
      textBg.setAttribute("width", textWidth.toString())
      textBg.setAttribute("height", textHeight.toString())
      textBg.setAttribute("fill", "white")
      textBg.setAttribute("opacity", "0.9")
      textBg.setAttribute("rx", "3")
      textBg.setAttribute("ry", "3")

      connectionGroup.appendChild(textBg)

      // Texto de condición
      const conditionText = document.createElementNS("http://www.w3.org/2000/svg", "text")
      conditionText.setAttribute("x", labelX.toString())
      conditionText.setAttribute("y", labelY.toString())
      conditionText.setAttribute("text-anchor", "middle")
      conditionText.setAttribute("dominant-baseline", "middle")
      conditionText.setAttribute("fill", "#333")
      conditionText.setAttribute("font-size", "12")
      conditionText.textContent = `${child.condition} (${(child.probability * 100).toFixed(0)}%)`

      connectionGroup.appendChild(conditionText)
    }
  }
}

// Función para dibujar los nodos
function drawNodes(
  group: SVGGElement,
  tree: DecisionNode[],
  layout: Map<string, { x: number; y: number; level: number }>,
  colorStart: string,
  colorDecision: string,
  colorResult: string,
  onNodeHover: (node: DecisionNode | null) => void,
  onNodeClick: (node: DecisionNode) => void,
) {
  for (const node of tree) {
    const pos = layout.get(node.id)
    if (!pos) continue

    // Crear grupo para el nodo
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    nodeGroup.setAttribute("class", `node ${node.type}-node`)
    nodeGroup.setAttribute("data-id", node.id)
    group.appendChild(nodeGroup)

    // Determinar forma y color según el tipo de nodo
    let shape: SVGElement
    const width = 160
    const height = 60

    if (node.type === "start") {
      // Óvalo para nodo de inicio
      shape = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      shape.setAttribute("cx", pos.x.toString())
      shape.setAttribute("cy", pos.y.toString())
      shape.setAttribute("rx", (width / 2).toString())
      shape.setAttribute("ry", (height / 2).toString())
      shape.setAttribute("fill", colorStart)
    } else if (node.type === "decision") {
      // Diamante para nodo de decisión
      const diamondPoints = [
        `${pos.x},${pos.y - height / 2}`,
        `${pos.x + width / 2},${pos.y}`,
        `${pos.x},${pos.y + height / 2}`,
        `${pos.x - width / 2},${pos.y}`,
      ].join(" ")

      shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
      shape.setAttribute("points", diamondPoints)
      shape.setAttribute("fill", colorDecision)
    } else {
      // Rectángulo para nodo de resultado
      shape = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      shape.setAttribute("x", (pos.x - width / 2).toString())
      shape.setAttribute("y", (pos.y - height / 2).toString())
      shape.setAttribute("width", width.toString())
      shape.setAttribute("height", height.toString())
      shape.setAttribute("rx", "5")
      shape.setAttribute("ry", "5")
      shape.setAttribute("fill", colorResult)
    }

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

    group.appendChild(filter)
    shape.setAttribute("filter", `url(#shadow-${node.id})`)

    // Eventos
    shape.addEventListener("mouseover", () => onNodeHover(node))
    shape.addEventListener("mouseout", () => onNodeHover(null))
    shape.addEventListener("click", () => onNodeClick(node))

    nodeGroup.appendChild(shape)

    // Texto para el nodo
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", pos.x.toString())
    text.setAttribute("y", pos.y.toString())
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("dominant-baseline", "middle")
    text.setAttribute("fill", "white")
    text.setAttribute("font-size", "12")
    text.setAttribute("font-weight", "bold")

    // Ajustar el texto para que quepa en el nodo
    const maxLength = node.type === "decision" ? 20 : 25
    let displayText = node.text

    if (displayText.length > maxLength) {
      displayText = displayText.substring(0, maxLength - 3) + "..."
    }

    text.textContent = displayText

    nodeGroup.appendChild(text)

    // Para nodos de resultado, añadir probabilidad
    if (node.type === "result" && node.probability) {
      const probText = document.createElementNS("http://www.w3.org/2000/svg", "text")
      probText.setAttribute("x", pos.x.toString())
      probText.setAttribute("y", (pos.y + 20).toString())
      probText.setAttribute("text-anchor", "middle")
      probText.setAttribute("fill", "white")
      probText.setAttribute("font-size", "10")
      probText.textContent = `Probabilidad: ${(node.probability * 100).toFixed(0)}%`

      nodeGroup.appendChild(probText)
    }
  }
}
