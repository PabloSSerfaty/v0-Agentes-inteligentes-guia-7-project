"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BayesianSystemInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-6">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <Network className="mr-2 h-4 w-4" />
          <span>Información del Sistema Experto Bayesiano</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-4 p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Modelado del Agente para Sistema Experto Bayesiano de Diagnóstico de Red
          </h2>

          <Tabs defaultValue="reas" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="reas">REAS</TabsTrigger>
              <TabsTrigger value="pama">PAMA</TabsTrigger>
              <TabsTrigger value="pya">Tabla PyA</TabsTrigger>
              <TabsTrigger value="tipo">Tipo y Metodología</TabsTrigger>
            </TabsList>

            {/* REAS Tab */}
            <TabsContent value="reas">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">1. Descriptor REAS</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Componente</th>
                        <th className="border border-gray-300 px-4 py-2 text-left w-3/4">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Rendimiento */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>R</strong> - Rendimiento (o recompensa)
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-2">
                            <strong>Objetivo principal:</strong> Inferir las causas más probables de problemas de red a
                            partir de síntomas observados
                          </p>
                          <p className="mb-1">
                            <strong>Métricas de rendimiento:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Precisión en la identificación de causas probables</li>
                            <li>Ordenamiento apropiado de causas según su probabilidad</li>
                            <li>Pertinencia de las acciones recomendadas</li>
                            <li>Eficiencia computacional del proceso de inferencia</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Entorno */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>E</strong> - Entorno
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-2">
                            <strong>Tipo de entorno:</strong> Red informática con relaciones probabilísticas entre
                            síntomas y causas
                          </p>
                          <p className="mb-1">
                            <strong>Propiedades del entorno:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Parcialmente observable: Solo los síntomas son directamente observables</li>
                            <li>Estocástico: Existe una relación probabilística entre síntomas y causas</li>
                            <li>Episódico: Cada diagnóstico es independiente de diagnósticos anteriores</li>
                            <li>Estático: El estado del problema no cambia durante el proceso de diagnóstico</li>
                            <li>Discreto: Conjunto finito de síntomas y causas posibles</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Actuadores */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>A</strong> - Actuadores
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-1">Sistema de salida que genera:</p>
                          <ul className="list-disc pl-5">
                            <li>Lista ordenada de causas probables basada en frecuencia de aparición</li>
                            <li>Acciones recomendadas para cada causa identificada</li>
                            <li>Presentación de resultados conforme a la interfaz DiagnosisResult</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Sensores */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>S</strong> - Sensores
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <ul className="list-disc pl-5">
                            <li>Interfaz de usuario para capturar síntomas reportados</li>
                            <li>Mapeador de síntomas a causas (MAPEO_SINTOMA_CAUSA)</li>
                            <li>Filtro para detectar casos especiales (como Error DNS)</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* PAMA Tab */}
            <TabsContent value="pama">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">2. Descriptor PAMA</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Componente</th>
                        <th className="border border-gray-300 px-4 py-2 text-left w-3/4">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Percepción */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>P</strong> - Percepción
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-2">
                            <strong>Entradas:</strong> Síntomas seleccionados por el usuario desde la interfaz
                          </p>
                          <p className="mb-1">
                            <strong>Procesamiento de percepción:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Identificación de síntomas válidos</li>
                            <li>Mapeo de síntomas a sus causas probables mediante el mapeo predefinido</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Acción */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>A</strong> - Acción
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-2">
                            Generación del diagnóstico basado en la frecuencia de aparición de causas
                          </p>
                          <p className="mb-1">Priorización de causas según múltiples criterios:</p>
                          <ul className="list-disc pl-5 mb-2">
                            <li>Frecuencia de aparición entre los síntomas</li>
                            <li>Posición en la lista de causas del primer síntoma</li>
                            <li>Casos especiales (como Error DNS)</li>
                          </ul>
                          <p>Provisión de acciones recomendadas para cada causa identificada</p>
                        </td>
                      </tr>

                      {/* Metas */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>M</strong> - Metas (Medio-Fines)
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <ul className="list-disc pl-5">
                            <li>
                              <strong>Meta primaria:</strong> Determinar las causas más probables del problema de red
                            </li>
                            <li>
                              <strong>Meta secundaria:</strong> Proporcionar acciones efectivas para resolver el
                              problema
                            </li>
                            <li>
                              <strong>Estrategia medio-fin:</strong> Utilizar un enfoque basado en frecuencia para
                              aproximar la probabilidad bayesiana de cada causa
                            </li>
                          </ul>
                        </td>
                      </tr>

                      {/* Ambiente */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>A</strong> - Ambiente
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-1">Red empresarial con relaciones probabilísticas entre:</p>
                          <ul className="list-disc pl-5">
                            <li>Síntomas observables (7 tipos de síntomas unificados)</li>
                            <li>Causas subyacentes (9 tipos de causas unificadas)</li>
                            <li>Acciones recomendadas para cada causa</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* PyA Tab */}
            <TabsContent value="pya">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">3. Tabla PyA (Percepción-Acción)</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Percepción (Síntomas)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Acción (Causas y Recomendaciones)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">NO_INTERNET</td>
                        <td className="border border-gray-300 px-4 py-2">
                          ROUTER_FAILURE, ISP_PROBLEMS, NETWORK_HARDWARE → Reiniciar router, contactar ISP, verificar
                          hardware
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">PACKET_LOSS</td>
                        <td className="border border-gray-300 px-4 py-2">
                          NETWORK_HARDWARE, ROUTER_FAILURE, NETWORK_CONGESTION → Inspeccionar cables, reiniciar router,
                          optimizar tráfico
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">DNS_ERROR</td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG, ISP_PROBLEMS, ROUTER_FAILURE → Verificar DNS, contactar ISP, reiniciar router
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">SLOW_LOADING</td>
                        <td className="border border-gray-300 px-4 py-2">
                          NETWORK_CONGESTION, ISP_PROBLEMS, DNS_CONFIG → Optimizar ancho de banda, contactar ISP,
                          verificar DNS
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">WEAK_WIFI</td>
                        <td className="border border-gray-300 px-4 py-2">
                          WIFI_INTERFERENCE, ROUTER_FAILURE, NETWORK_HARDWARE → Cambiar canal WiFi, verificar router,
                          revisar hardware
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">INTERMITTENT</td>
                        <td className="border border-gray-300 px-4 py-2">
                          WIFI_INTERFERENCE, NETWORK_HARDWARE, ISP_PROBLEMS → Reubicar router, verificar cables,
                          contactar ISP
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">SLOW_INTERNAL</td>
                        <td className="border border-gray-300 px-4 py-2">
                          SERVER_OVERLOAD, NETWORK_CONGESTION, MALWARE → Reiniciar servidor, optimizar tráfico, escanear
                          virus
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Múltiples síntomas</td>
                        <td className="border border-gray-300 px-4 py-2">
                          Causas ordenadas por frecuencia y posición en listas → Acciones correspondientes
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Tipo y Metodología Tab */}
            <TabsContent value="tipo">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  4. Tipo, Metodología y Elementos Constitutivos del Agente Experto
                </h3>

                <div className="space-y-4">
                  {/* Tipo de Agente */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Tipo de Agente</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Agente basado en conocimiento probabilístico</li>
                      <li>Subtipo: Sistema experto con inferencia bayesiana simplificada</li>
                      <li>Enfoque: Razonamiento probabilístico aproximado basado en frecuencia</li>
                    </ul>
                  </div>

                  {/* Metodología */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Metodología Involucrada</h4>
                    <p className="mb-2">
                      <strong>Representación del conocimiento:</strong> Mapeo predefinido de síntomas a causas probables
                    </p>
                    <p className="mb-2">
                      <strong>Mecanismo de razonamiento:</strong> Aproximación bayesiana basada en frecuencia de
                      aparición
                    </p>
                    <p className="mb-1">
                      <strong>Estrategia de resolución:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Identificación de causas relacionadas con cada síntoma</li>
                      <li>Conteo de frecuencia de aparición de cada causa</li>
                      <li>Priorización por frecuencia y relevancia para el primer síntoma</li>
                      <li>Manejo de casos especiales (Error DNS)</li>
                    </ul>
                    <p className="mb-1">
                      <strong>Procesamiento:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Verificar validez de síntomas reportados</li>
                      <li>Extraer causas potenciales para cada síntoma</li>
                      <li>Calcular frecuencia de aparición de cada causa</li>
                      <li>Ordenar causas según criterios múltiples</li>
                      <li>Generar diagnóstico con acciones recomendadas</li>
                    </ul>
                  </div>

                  {/* Elementos Constitutivos */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Elementos Constitutivos</h4>

                    <p className="mb-1">
                      <strong>Base de conocimiento:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Mapeo de síntomas a causas probables (MAPEO_SINTOMA_CAUSA)</li>
                      <li>Conjunto unificado de causas (CAUSAS_UNIFICADAS)</li>
                      <li>Acciones recomendadas para cada causa (ACCIONES_RECOMENDADAS)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Motor de inferencia:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Método diagnose() que implementa el algoritmo de diagnóstico</li>
                      <li>Sistema de conteo de frecuencia de causas</li>
                      <li>Algoritmo de ordenamiento de causas por relevancia</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Mecanismo de priorización:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Contador de frecuencia de aparición de cada causa</li>
                      <li>Criterio de posición en la lista del primer síntoma</li>
                      <li>Manejo de casos especiales (priorización de DNS_CONFIG para síntoma DNS_ERROR)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Sistema de salida:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Generación de estructura DiagnosisResult</li>
                      <li>Mapeo de causas a acciones recomendadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
