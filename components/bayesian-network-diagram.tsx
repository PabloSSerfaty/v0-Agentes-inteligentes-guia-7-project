"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SINTOMAS_UNIFICADOS, CAUSAS_UNIFICADAS, MAPEO_SINTOMA_CAUSA } from "@/lib/constants"
import { AlertCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function BayesianNetworkDiagram() {
  const [open, setOpen] = useState(false)
  const [networkLoaded, setNetworkLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Efecto para registrar cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      try {
        console.log("Diálogo de red bayesiana abierto")
        // Simular un pequeño retraso para la carga de la red
        const timer = setTimeout(() => {
          setNetworkLoaded(true)
        }, 300)
        return () => clearTimeout(timer)
      } catch (err) {
        console.error("Error al cargar la red bayesiana:", err)
        setError("Ocurrió un error al cargar la red bayesiana")
      }
    } else {
      // Resetear el estado cuando se cierra el diálogo
      setNetworkLoaded(false)
      setError(null)
    }
  }, [open])

  // Función para verificar la consistencia de los datos
  const verificarConsistenciaDatos = (): boolean => {
    // Verificar que todos los síntomas tengan al menos una causa asociada
    for (const sintoma of Object.values(SINTOMAS_UNIFICADOS)) {
      if (!MAPEO_SINTOMA_CAUSA[sintoma] || MAPEO_SINTOMA_CAUSA[sintoma].length === 0) {
        console.error(`El síntoma "${sintoma}" no tiene causas asociadas`)
        return false
      }
    }

    // Verificar que todas las causas estén asociadas a al menos un síntoma
    const causasUsadas = new Set<string>()
    Object.values(MAPEO_SINTOMA_CAUSA).forEach((causas) => {
      causas.forEach((causa) => causasUsadas.add(causa))
    })

    for (const causa of Object.values(CAUSAS_UNIFICADAS)) {
      if (!causasUsadas.has(causa)) {
        console.error(`La causa "${causa}" no está asociada a ningún síntoma`)
        return false
      }
    }

    return true
  }

  return (
    <>
      <Button
        variant="outline"
        className="mt-4 w-full flex items-center justify-center gap-2"
        onClick={() => {
          console.log("Botón de red bayesiana presionado")
          setOpen(true)
        }}
      >
        <Info className="h-4 w-4" />
        Ver Red Bayesiana
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          console.log("Estado del diálogo cambiado:", isOpen)
          setOpen(isOpen)
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Red Bayesiana de Diagnóstico de Red</DialogTitle>
          </DialogHeader>

          {error ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : !networkLoaded ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="text-lg font-medium mb-4">Relaciones entre Síntomas y Causas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna de síntomas */}
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Síntomas</h4>
                    <ul className="space-y-2">
                      {Object.values(SINTOMAS_UNIFICADOS).map((sintoma, index) => (
                        <li key={index} className="border border-blue-200 bg-blue-50 p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{sintoma}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-blue-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-64">
                                    Este síntoma está relacionado con {MAPEO_SINTOMA_CAUSA[sintoma]?.length || 0} causas
                                    potenciales
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <ul className="mt-2 pl-4 text-sm text-gray-600">
                            <li className="italic">Puede indicar:</li>
                            {MAPEO_SINTOMA_CAUSA[sintoma]?.map((causa, causaIndex) => (
                              <li key={causaIndex} className="flex items-center">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {causa}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Columna de causas */}
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Causas Potenciales</h4>
                    <ul className="space-y-2">
                      {Object.values(CAUSAS_UNIFICADAS).map((causa, index) => {
                        // Calcular cuántos síntomas están relacionados con esta causa
                        const sintomasRelacionados = Object.entries(MAPEO_SINTOMA_CAUSA)
                          .filter(([_, causas]) => causas.includes(causa))
                          .map(([sintoma]) => sintoma)

                        return (
                          <li key={index} className="border border-green-200 bg-green-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{causa}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-green-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="w-64">
                                      Esta causa está relacionada con {sintomasRelacionados.length} síntomas
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <ul className="mt-2 pl-4 text-sm text-gray-600">
                              <li className="italic">Síntomas relacionados:</li>
                              {Object.entries(MAPEO_SINTOMA_CAUSA).map(([sintoma, causas]) =>
                                causas.includes(causa) ? (
                                  <li key={sintoma} className="flex items-center">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {sintoma}
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-2">Acerca de la Red Bayesiana</h4>
                  <p className="text-sm text-gray-600">
                    El sistema bayesiano analiza las relaciones entre síntomas y causas para determinar las causas más
                    probables basándose en los síntomas observados. La frecuencia de aparición de una causa en múltiples
                    síntomas aumenta su probabilidad en el diagnóstico final.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Esta visualización muestra las relaciones directas entre síntomas y causas según el modelo bayesiano
                    implementado en el sistema. Cada conexión representa una probabilidad condicional P(Síntoma|Causa).
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
