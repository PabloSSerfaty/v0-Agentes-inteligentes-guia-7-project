"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SINTOMAS_UNIFICADOS, CAUSAS_UNIFICADAS, MAPEO_SINTOMA_CAUSA } from "@/lib/constants"

export function BayesianNetworkDiagram() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" className="mt-4 w-full" onClick={() => setOpen(true)}>
        Ver Red Bayesiana
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Red Bayesiana de Diagnóstico de Red</DialogTitle>
          </DialogHeader>
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
                        {sintoma}
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
                    {Object.values(CAUSAS_UNIFICADAS).map((causa, index) => (
                      <li key={index} className="border border-green-200 bg-green-50 p-3 rounded-md">
                        {causa}
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
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>
                  El sistema bayesiano analiza las relaciones entre síntomas y causas para determinar las causas más
                  probables basándose en los síntomas observados. La frecuencia de aparición de una causa en múltiples
                  síntomas aumenta su probabilidad en el diagnóstico final.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
