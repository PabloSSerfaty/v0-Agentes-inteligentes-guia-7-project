"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CAUSAS_UNIFICADAS, SINTOMAS_UNIFICADOS, ACCIONES_RECOMENDADAS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RefreshCw, Info, Download, Filter, Maximize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Definición de tipos para la visualización
interface Node {
  id: string
  name: string
  type: "causa" | "sintoma"
  probability?: number
  color: string
  size: number
  description?: string
}

interface Link {
  source: string
  target: string
  strength: number
  probability: number
  description?: string
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

// Probabilidades a priori de las causas (alineadas con el sistema bayesiano real)
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
  [CAUSAS_UNIFICADAS.NETWORK_CONFIG]: 0.16,
  [CAUSAS_UNIFICADAS.DNS_ISP]: 0.13,
  [CAUSAS_UNIFICADAS.SERVER_RESOURCES]: 0.11,
  [CAUSAS_UNIFICADAS.REINICIAR_ROUTER]: 0.22,
  [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: 0.19,
  [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: 0.14,
  [CAUSAS_UNIFICADAS.CABLE_DANADO]: 0.13,
  [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: 0.1,
  [CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA]: 0.12,
  [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: 0.15,
  [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO]: 0.11,
}

// Descripciones de las causas para mejorar la comprensión
const DESCRIPCIONES_CAUSAS = {
  [CAUSAS_UNIFICADAS.ROUTER_FAILURE]:
    "Problemas con el hardware o software del router que impiden su funcionamiento normal",
  [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: "Problemas en la infraestructura del proveedor de servicios de Internet",
  [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: "Fallos en dispositivos de red como switches, tarjetas de red o conectores",
  [CAUSAS_UNIFICADAS.DNS_CONFIG]: "Configuración incorrecta de los servidores DNS en la red local",
  [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: "Interferencias que afectan a la calidad de la señal WiFi",
  [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: "El servidor no puede manejar la cantidad de solicitudes que recibe",
  [CAUSAS_UNIFICADAS.MALWARE]: "Software malicioso que afecta al rendimiento de la red",
  [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: "Saturación de la red debido a un alto volumen de tráfico",
  [CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE]: "Fallos en la infraestructura central de la red",
  [CAUSAS_UNIFICADAS.NETWORK_CONFIG]: "Errores en la configuración general de la red",
  [CAUSAS_UNIFICADAS.DNS_ISP]: "Problemas con los servidores DNS del proveedor de servicios",
  [CAUSAS_UNIFICADAS.SERVER_RESOURCES]: "Recursos insuficientes (CPU, memoria, disco) en el servidor",
  [CAUSAS_UNIFICADAS.REINICIAR_ROUTER]: "El router necesita reiniciarse para restablecer su funcionamiento",
  [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: "La configuración IP de los dispositivos es incorrecta",
  [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: "Problemas con la ruta por defecto en la configuración de red",
  [CAUSAS_UNIFICADAS.CABLE_DANADO]: "Daños físicos en los cables de red que afectan a la conectividad",
  [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: "Procesos que consumen demasiados recursos en el servidor",
  [CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA]: "Problemas generales en la infraestructura de red interna",
  [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: "Los servidores DNS actuales no funcionan correctamente",
  [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO]: "El ISP podría estar realizando tareas de mantenimiento",
}

// Descripciones de los síntomas para mejorar la comprensión
const DESCRIPCIONES_SINTOMAS = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: "No hay conexión a Internet desde ningún dispositivo",
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: "Se pierden paquetes durante la transmisión de datos",
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: "No se pueden resolver nombres de dominio",
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: "Las páginas web tardan mucho en cargar",
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: "La señal WiFi es débil o inestable",
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: "La conexión se interrumpe periódicamente",
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: "El acceso a recursos internos es lento",
  [SINTOMAS_UNIFICADOS.HIGH_RESOURCE_USAGE]: "Alto consumo de recursos en el servidor",
  [SINTOMAS_UNIFICADOS.DAMAGED_CABLE]: "Cable de red con daños visibles o mal conectado",
  [SINTOMAS_UNIFICADOS.IP_CONFIG_ERROR]: "Configuración IP incorrecta en los dispositivos",
  [SINTOMAS_UNIFICADOS.DNS_PROBLEMS]: "Problemas específicos con la resolución DNS",
  [SINTOMAS_UNIFICADOS.ISP_CABLE_ISSUES]: "Problemas con el cable que conecta a la red del ISP",
}

// Probabilidades condicionales P(Síntoma|Causa) (alineadas con el sistema bayesiano real)
const PROBABILIDADES_CONDICIONALES: Record<string, Record<string, number>> = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: {
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.9,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.85,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.7,
    [CAUSAS_UNIFICADAS.REINICIAR_ROUTER]: 0.95,
    [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: 0.8,
  },
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: {
    [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: 0.8,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.65,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.6,
    [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: 0.75,
    [CAUSAS_UNIFICADAS.CABLE_DANADO]: 0.85,
  },
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: {
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.75,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.7,
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.5,
    [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO]: 0.65,
  },
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: {
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.8,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.65,
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.7,
    [CAUSAS_UNIFICADAS.CABLE_DANADO]: 0.9,
  },
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: {
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.95,
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.6,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.4,
    [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: 0.9,
    [CAUSAS_UNIFICADAS.DNS_ISP]: 0.85,
  },
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: {
    [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: 0.95,
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: 0.5,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.4,
    [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: 0.3,
  },
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: {
    [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: 0.85,
    [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: 0.7,
    [CAUSAS_UNIFICADAS.MALWARE]: 0.6,
    [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: 0.9,
    [CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA]: 0.75,
    [CAUSAS_UNIFICADAS.SERVER_RESOURCES]: 0.8,
  },
  [SINTOMAS_UNIFICADOS.HIGH_RESOURCE_USAGE]: {
    [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: 0.9,
    [CAUSAS_UNIFICADAS.MALWARE]: 0.75,
    [CAUSAS_UNIFICADAS.SERVER_RESOURCES]: 0.95,
    [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: 0.85,
  },
  [SINTOMAS_UNIFICADOS.DAMAGED_CABLE]: {
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.85,
    [CAUSAS_UNIFICADAS.CABLE_DANADO]: 0.98,
  },
  [SINTOMAS_UNIFICADOS.IP_CONFIG_ERROR]: {
    [CAUSAS_UNIFICADAS.NETWORK_CONFIG]: 0.9,
    [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: 0.95,
  },
  [SINTOMAS_UNIFICADOS.DNS_PROBLEMS]: {
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: 0.85,
    [CAUSAS_UNIFICADAS.DNS_ISP]: 0.8,
    [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: 0.9,
  },
  [SINTOMAS_UNIFICADOS.ISP_CABLE_ISSUES]: {
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: 0.85,
    [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO]: 0.75,
    [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: 0.5,
  },
}

// Descripciones de las relaciones para mejorar la comprensión
const DESCRIPCIONES_RELACIONES: Record<string, Record<string, string>> = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: {
    [CAUSAS_UNIFICADAS.ROUTER_FAILURE]:
      "Un router que no funciona correctamente impide completamente la conexión a Internet",
    [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: "Problemas en el ISP pueden causar la pérdida total de conexión a Internet",
    [CAUSAS_UNIFICADAS.REINICIAR_ROUTER]: "Reiniciar el router suele resolver problemas de conexión completa",
    [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: "Una configuración IP incorrecta puede impedir la conexión a Internet",
  },
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: {
    [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: "Las interferencias causan conexiones WiFi intermitentes",
    [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: "Problemas con la ruta por defecto pueden causar intermitencia",
    [CAUSAS_UNIFICADAS.CABLE_DANADO]: "Un cable dañado puede causar conexiones intermitentes",
  },
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: {
    [CAUSAS_UNIFICADAS.DNS_CONFIG]: "Una configuración DNS incorrecta causa errores de resolución de nombres",
    [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: "Cambiar a servidores DNS alternativos resuelve problemas de resolución",
    [CAUSAS_UNIFICADAS.DNS_ISP]: "Problemas con los DNS del ISP causan errores de resolución",
  },
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: {
    [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: "Procesos que consumen muchos recursos causan lentitud en el servidor",
    [CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA]: "Problemas en la red interna pueden causar lentitud en los servidores",
    [CAUSAS_UNIFICADAS.SERVER_RESOURCES]: "Recursos insuficientes en el servidor causan lentitud",
  },
}

export function BayesianNetworkDiagram() {
  const [open, setOpen] = useState(false)
  const [selectedCause, setSelectedCause] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null)
  const [filteredCauses, setFilteredCauses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(2.0) // Aumentado el zoom inicial a 2.0
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
    setZoomLevel(2.0) // Resetear al zoom inicial de 2.0
    setPanOffset({ x: 0, y: 0 })
  }

  // Función para alternar el modo de pantalla completa
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  // Función para exportar el diagrama como imagen
  const exportAsImage = () => {
    const svgElement = document.querySelector(".bayesian-network-svg") as SVGSVGElement
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
        a.download = "red-bayesiana-diagnostico.png"
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Función para filtrar causas
  const toggleCauseFilter = (cause: string) => {
    setFilteredCauses((prev) => (prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]))
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilteredCauses([])
  }

  // Datos filtrados para la visualización
  const filteredGraphData = React.useMemo(() => {
    if (filteredCauses.length === 0) return graphData

    const filteredNodes = graphData.nodes.filter((node) => node.type === "sintoma" || filteredCauses.includes(node.id))

    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

    const filteredLinks = graphData.links.filter(
      (link) => filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string),
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }, [graphData, filteredCauses])

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
        <DialogContent
          className={`${fullscreen ? "max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]" : "max-w-6xl max-h-[90vh]"} overflow-auto`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Red Bayesiana de Diagnóstico de Red</span>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filtrar causas</p>
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

          {showFilters && (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Filtrar por causas</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.values(CAUSAS_UNIFICADAS).map((causa) => (
                  <div key={causa} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`filter-${causa}`}
                      checked={filteredCauses.length === 0 || filteredCauses.includes(causa)}
                      onChange={() => toggleCauseFilter(causa)}
                      className="mr-2"
                    />
                    <label htmlFor={`filter-${causa}`} className="text-sm truncate">
                      {causa}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`grid ${fullscreen ? "grid-cols-4" : "grid-cols-1 md:grid-cols-3"} gap-6 mt-4`}>
            <div className={`${fullscreen ? "col-span-3" : "md:col-span-2"}`}>
              <div className={`border rounded-lg p-4 bg-white ${fullscreen ? "h-[85vh]" : "h-[800px]"} relative`}>
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
                  data={filteredGraphData}
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
                  setZoomLevel={setZoomLevel}
                  fullscreen={fullscreen}
                />

                {/* Información sobre nodo al hacer hover */}
                {hoveredNode && (
                  <div className="absolute top-2 left-2 bg-white p-3 border rounded shadow-md z-10 max-w-xs">
                    <h4 className="font-medium text-base">{hoveredNode.name}</h4>
                    {hoveredNode.type === "causa" && (
                      <p className="text-sm mt-1">Probabilidad a priori: {(hoveredNode.probability || 0).toFixed(2)}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{hoveredNode.type === "causa" ? "Causa" : "Síntoma"}</p>
                    {hoveredNode.description && <p className="text-xs mt-2 text-gray-600">{hoveredNode.description}</p>}
                  </div>
                )}

                {/* Información sobre enlace al hacer hover */}
                {hoveredLink && (
                  <div className="absolute top-2 left-40 bg-white p-3 border rounded shadow-md z-10 max-w-xs">
                    <h4 className="font-medium text-base">Relación</h4>
                    <p className="text-sm mt-1">
                      {getCausaName(hoveredLink.source as string)} → {getSintomaName(hoveredLink.target as string)}
                    </p>
                    <p className="text-sm mt-1">P(Síntoma|Causa): {hoveredLink.probability.toFixed(2)}</p>
                    {hoveredLink.description && <p className="text-xs mt-2 text-gray-600">{hoveredLink.description}</p>}
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
                  <p>• Usa el filtro para centrarte en causas específicas</p>
                </div>
              </div>
            </div>

            {/* Panel lateral con información adicional */}
            <div>
              <Card className="p-4 h-full">
                <h3 className="font-medium mb-4 text-lg">Información del Modelo Bayesiano</h3>

                {selectedCause ? (
                  <div>
                    <h4 className="font-medium text-[#4E79A7] mb-2 text-lg">{selectedCause}</h4>
                    <p className="text-sm mb-2">
                      Probabilidad a priori: {PROBABILIDADES_PRIORI[selectedCause]?.toFixed(2) || "N/A"}
                    </p>

                    {DESCRIPCIONES_CAUSAS[selectedCause] && (
                      <p className="text-sm text-gray-600 mb-4">{DESCRIPCIONES_CAUSAS[selectedCause]}</p>
                    )}

                    <h5 className="font-medium mt-4 mb-2 text-base">Acciones Recomendadas:</h5>
                    <ul className="space-y-2 text-sm">
                      {ACCIONES_RECOMENDADAS[selectedCause]?.map((accion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-[#4E79A7] rounded-full mr-2 mt-1.5"></span>
                          {accion}
                        </li>
                      ))}
                    </ul>

                    <h5 className="font-medium mt-4 mb-2 text-base">Síntomas Relacionados:</h5>
                    <ul className="space-y-2 text-sm">
                      {Object.entries(PROBABILIDADES_CONDICIONALES)
                        .filter(([_, causas]) => causas[selectedCause])
                        .sort((a, b) => b[1][selectedCause] - a[1][selectedCause])
                        .map(([sintoma, causas]) => (
                          <li key={sintoma} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-[#F28E2B] rounded-full mr-2 mt-1.5"></span>
                            <div>
                              <div>
                                {sintoma} ({(causas[selectedCause] * 100).toFixed(0)}%)
                              </div>
                              {DESCRIPCIONES_RELACIONES[sintoma]?.[selectedCause] && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {DESCRIPCIONES_RELACIONES[sintoma][selectedCause]}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Selecciona un nodo de causa para ver sus detalles y acciones recomendadas.
                    </p>

                    <h4 className="font-medium mb-2 text-base">Sobre el Modelo Bayesiano</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Este modelo representa las relaciones probabilísticas entre síntomas observables y sus posibles
                      causas. Las flechas indican la probabilidad condicional P(Síntoma|Causa).
                    </p>

                    <h4 className="font-medium mb-2 text-base">Cómo Interpretar</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• El grosor de las líneas indica la fuerza de la relación probabilística</li>
                      <li>• Haz hover sobre nodos y conexiones para ver detalles</li>
                      <li>• Haz clic en una causa para ver sus acciones recomendadas</li>
                      <li>• Usa los controles de zoom para explorar el diagrama en detalle</li>
                      <li>• Utiliza el filtro para centrarte en causas específicas</li>
                    </ul>

                    <h4 className="font-medium mt-4 mb-2 text-base">Aplicación en el Diagnóstico</h4>
                    <p className="text-sm text-gray-600">
                      El sistema utiliza el teorema de Bayes para calcular la probabilidad de cada causa dado un
                      conjunto de síntomas observados. Esto permite identificar las causas más probables y recomendar
                      acciones específicas para resolver el problema.
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
  setZoomLevel,
  fullscreen,
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

    // Renderizar la visualización mejorada
    const svg = renderEnhancedVisualization(
      containerRef.current,
      data,
      onNodeHover,
      onLinkHover,
      onNodeClick,
      fullscreen,
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
  }, [data, onNodeHover, onLinkHover, onNodeClick, zoomLevel, panOffset, setZoomLevel, fullscreen])

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
  fullscreen: boolean,
): SVGSVGElement {
  // Limpiar el contenedor
  container.innerHTML = ""

  // Crear un SVG para la visualización con dimensiones aumentadas
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", "0 0 1200 600") // Aumentado de 800x400 a 1200x600 para más espacio
  svg.setAttribute("class", "bayesian-network-svg")
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
    // Estimación aproximada: 14px por carácter + margen (aumentado para mejor legibilidad)
    return Math.max(nombre.length * 14 + 70, 200)
  }

  // Calcular posiciones horizontales para causas con espaciado mejorado
  const posicionesCausas: { x: number; width: number }[] = []
  let posicionXActual = 100 // Posición inicial

  causas.forEach((causa) => {
    const ancho = calcularAnchoCausa(causa.name)
    posicionesCausas.push({ x: posicionXActual + ancho / 2, width: ancho })
    posicionXActual += ancho + 100 // Añadir 100px de espacio entre nodos (aumentado)
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
    rect.setAttribute("y", (y - 30).toString()) // Aumentado para hacer el nodo más alto
    rect.setAttribute("width", width.toString())
    rect.setAttribute("height", "70") // Aumentado a 70
    rect.setAttribute("rx", "8") // Aumentado de 5 a 8
    rect.setAttribute("ry", "8") // Aumentado de 5 a 8
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
    text.setAttribute("y", (y - 5).toString()) // Ajustado para centrar mejor en el nodo más alto
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("dominant-baseline", "middle")
    text.setAttribute("fill", "white")
    text.setAttribute("font-size", "18") // Aumentado a 18
    text.setAttribute("font-weight", "bold")
    text.textContent = causa.name

    group.appendChild(text)

    // Probabilidad a priori
    const probText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    probText.setAttribute("x", x.toString())
    probText.setAttribute("y", (y + 20).toString()) // Ajustado para el nodo más alto
    probText.setAttribute("text-anchor", "middle")
    probText.setAttribute("fill", "white")
    probText.setAttribute("font-size", "14") // Aumentado a 14
    probText.setAttribute("font-family", "monospace")
    probText.textContent = `(${causa.probability?.toFixed(2)})`

    group.appendChild(probText)
  })

  // Calcular el ancho de cada nodo síntoma basado en el texto
  const calcularAnchoSintoma = (nombre: string): number => {
    // Estimación aproximada: 12px por carácter + margen (aumentado)
    return Math.max(nombre.length * 12 + 60, 160)
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
    posicionXActual += ancho + 90 // Añadir 90px de espacio entre nodos (aumentado)
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
    ellipse.setAttribute("ry", "40") // Aumentado a 40
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
    text.setAttribute("font-size", "16") // Aumentado a 16
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
    const sourceY = 130 // Punto de salida desde la parte inferior del nodo causa (ajustado)

    const targetX = posicionesSintomas[targetIndex].x
    const targetY = 415 // Punto de entrada en la parte superior del nodo síntoma (ajustado)

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
    const textWidth = 60 // Aumentado a 60
    const textHeight = 26 // Aumentado a 26
    textBg.setAttribute("x", (labelX - textWidth / 2).toString())
    textBg.setAttribute("y", (adjustedLabelY - textHeight / 2).toString())
    textBg.setAttribute("width", textWidth.toString())
    textBg.setAttribute("height", textHeight.toString())
    textBg.setAttribute("fill", "white")
    textBg.setAttribute("opacity", "0.9")
    textBg.setAttribute("rx", "4") // Aumentado de 3 a 4
    textBg.setAttribute("ry", "4") // Aumentado de 3 a 4

    group.appendChild(textBg)

    // Texto de probabilidad
    const probText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    probText.setAttribute("x", labelX.toString())
    probText.setAttribute("y", adjustedLabelY.toString())
    probText.setAttribute("text-anchor", "middle")
    probText.setAttribute("dominant-baseline", "middle")
    probText.setAttribute("fill", "#333")
    probText.setAttribute("font-size", "14") // Aumentado a 14
    probText.setAttribute("font-family", "monospace")
    probText.textContent = link.probability.toFixed(2)

    group.appendChild(probText)
  })

  // Definir marcador de flecha
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  marker.setAttribute("id", "arrowhead")
  marker.setAttribute("markerWidth", "12") // Aumentado de 10 a 12
  marker.setAttribute("markerHeight", "8") // Aumentado de 7 a 8
  marker.setAttribute("refX", "12") // Aumentado de 10 a 12
  marker.setAttribute("refY", "4") // Aumentado de 3.5 a 4
  marker.setAttribute("orient", "auto")

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("points", "0 0, 12 4, 0 8") // Aumentado para flecha más grande
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
      size: 22, // Aumentado a 22 para nodos aún más grandes
      description: DESCRIPCIONES_CAUSAS[name] || "",
    })
  })

  // Añadir nodos de síntoma
  Object.values(SINTOMAS_UNIFICADOS).forEach((name) => {
    nodes.push({
      id: name,
      name,
      type: "sintoma",
      color: "#F28E2B", // Naranja
      size: 18, // Aumentado a 18
      description: DESCRIPCIONES_SINTOMAS[name] || "",
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
        description: DESCRIPCIONES_RELACIONES[sintoma]?.[causa] || "",
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
