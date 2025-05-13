import type { AppliedRule } from "@/lib/rule-based-system"
import { MAPEO_SINTOMAS_REGLAS_INVERSO } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Info, ArrowDownIcon, ListOrdered } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppliedRulesProps {
  rules: AppliedRule[]
}

export function AppliedRules({ rules }: AppliedRulesProps) {
  if (!rules || rules.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reglas Aplicadas</CardTitle>
          <CardDescription>No se aplicaron reglas en este diagnóstico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-gray-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>No hay reglas aplicadas para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Ordenar reglas: primero las coincidencias exactas, luego por prioridad
  const sortedRules = [...rules].sort((a, b) => {
    if (a.coincidenciaExacta && !b.coincidenciaExacta) return -1
    if (!a.coincidenciaExacta && b.coincidenciaExacta) return 1
    return a.prioridad - b.prioridad
  })

  return (
    <Card className="mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center">
          <ListOrdered className="mr-2 h-5 w-5 text-blue-600" />
          Secuencia de Reglas Aplicadas
        </CardTitle>
        <CardDescription>
          Este es el proceso de razonamiento que siguió el sistema experto basado en reglas para llegar al diagnóstico
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Cómo interpretar este diagrama:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Las reglas se muestran en orden de aplicación, de arriba hacia abajo</li>
                <li>Las reglas con coincidencia exacta (verde) tienen mayor prioridad que las parciales (ámbar)</li>
                <li>
                  Dentro de cada grupo, las reglas se ordenan por su valor de prioridad (menor número = mayor prioridad)
                </li>
                <li>Las condiciones marcadas con ✓ son las que se cumplieron en el diagnóstico actual</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {sortedRules.map((rule, index) => (
            <div key={rule.id} className="relative">
              {/* Conector vertical entre reglas */}
              {index < sortedRules.length - 1 && (
                <div className="absolute left-[1.5rem] top-[5.5rem] h-8 w-0.5 bg-gray-300 z-0"></div>
              )}

              <div className="border rounded-lg overflow-hidden relative z-10 bg-white">
                <div
                  className={`p-4 ${
                    rule.coincidenciaExacta
                      ? "bg-green-50 border-b border-green-100"
                      : "bg-amber-50 border-b border-amber-100"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 mr-3 text-gray-700 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium flex items-center">
                        {rule.coincidenciaExacta ? (
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                        )}
                        Regla #{rule.id} - Prioridad {rule.prioridad}
                      </h3>
                      <p className="mt-1 text-sm text-gray-700">{rule.descripcion}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        rule.coincidenciaExacta ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rule.coincidenciaExacta ? "Coincidencia Exacta" : "Coincidencia Parcial"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Condiciones evaluadas:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-1 h-4 w-4 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Estas son las condiciones que la regla evalúa para determinar si se aplica
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h4>
                      <ul className="space-y-1 bg-gray-50 p-3 rounded-md">
                        {rule.condiciones.map((condicion) => {
                          const esCoincidente = rule.condicionesCoincidentes.includes(condicion)
                          return (
                            <li
                              key={condicion}
                              className={`text-sm flex items-start ${esCoincidente ? "text-gray-800" : "text-gray-400"}`}
                            >
                              {esCoincidente ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              )}
                              <span>
                                {MAPEO_SINTOMAS_REGLAS_INVERSO[condicion] || condicion}
                                {!esCoincidente && " (no presente)"}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Resultado:</h4>
                      <div className="p-3 bg-blue-50 rounded-md flex-1 flex items-center">
                        <ArrowDownIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-sm font-medium text-blue-800">{rule.accion}</p>
                      </div>
                    </div>
                  </div>

                  {rule.condicionesCoincidentes.length > 0 && (
                    <div className="mt-4">
                      <Separator className="my-2" />
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Síntomas detectados que activaron esta regla:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rule.condicionesCoincidentes.map((condicion) => (
                          <span
                            key={condicion}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {MAPEO_SINTOMAS_REGLAS_INVERSO[condicion] || condicion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!rule.coincidenciaExacta && rule.condicionesFaltantes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Síntomas faltantes (no detectados):</h4>
                      <div className="flex flex-wrap gap-2">
                        {rule.condicionesFaltantes.map((condicion) => (
                          <span
                            key={condicion}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {MAPEO_SINTOMAS_REGLAS_INVERSO[condicion] || condicion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
