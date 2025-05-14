"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, Book } from "lucide-react"

export function ExpertSystemInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-6">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <Book className="mr-2 h-4 w-4" />
          <span>Información del Sistema Experto Basado en Reglas</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-4 p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4">Modelado del Agente para Sistema Experto de Diagnóstico de Red</h2>

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
                            <strong>Objetivo principal:</strong> Identificar correctamente la causa de los problemas de
                            red y proporcionar acciones recomendadas adecuadas
                          </p>
                          <p className="mb-1">
                            <strong>Métricas de rendimiento:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Precisión en la identificación de causas raíz</li>
                            <li>Relevancia de las acciones recomendadas</li>
                            <li>Rapidez en el diagnóstico</li>
                            <li>Minimización de falsos positivos/negativos</li>
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
                            <strong>Tipo de entorno:</strong> Red informática empresarial
                          </p>
                          <p className="mb-1">
                            <strong>Propiedades del entorno:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Parcialmente observable: No todos los estados de la red son visibles directamente</li>
                            <li>Determinista: Los mismos síntomas conducen a los mismos diagnósticos</li>
                            <li>Episódico: Cada diagnóstico es independiente de diagnósticos anteriores</li>
                            <li>Estático: El estado del problema no cambia durante el proceso de diagnóstico</li>
                            <li>Discreto: Conjunto finito de estados de problema posibles</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Actuadores */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>A</strong> - Actuadores
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p className="mb-1">Sistema de recomendaciones que genera:</p>
                          <ul className="list-disc pl-5">
                            <li>Lista priorizada de causas probables</li>
                            <li>Acciones recomendadas para cada causa identificada</li>
                            <li>Presentación de resultados a través de la interfaz (componente DiagnosisResult)</li>
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
                            <li>Mapeo de síntomas de interfaz a síntomas internos (MAPEO_SINTOMAS_REGLAS)</li>
                            <li>Mecanismo de inferencia para detectar síntomas adicionales</li>
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
                            <li>
                              Conversión de síntomas de interfaz a síntomas del sistema (método convertirSintomas)
                            </li>
                            <li>
                              Inferencia de síntomas adicionales basados en los reportados (método
                              inferirSintomasAdicionales)
                            </li>
                          </ul>
                        </td>
                      </tr>

                      {/* Acción */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          <strong>A</strong> - Acción
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <ul className="list-disc pl-5">
                            <li>Generación del diagnóstico con causas probables y acciones recomendadas</li>
                            <li>Las acciones son ordenadas por prioridad según las reglas coincidentes</li>
                            <li>Cada causa tiene asociado un conjunto específico de acciones recomendadas</li>
                          </ul>
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
                              <strong>Meta primaria:</strong> Identificar correctamente la causa raíz del problema de
                              red
                            </li>
                            <li>
                              <strong>Meta secundaria:</strong> Proporcionar acciones efectivas para resolver el
                              problema
                            </li>
                            <li>
                              <strong>Estrategia medio-fin:</strong> Utilizar reglas basadas en condiciones para mapear
                              síntomas a causas y soluciones
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
                          <p className="mb-1">Servidores de Vercel con acceso a:</p>
                          <ul className="list-disc pl-5">
                            <li>Infraestructura física (routers, switches, cables)</li>
                            <li>Servicios de red (DNS, servidores internos)</li>
                            <li>Conectividad externa (ISP)</li>
                            <li>Factores ambientales (interferencia WiFi)</li>
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
                        <td className="border border-gray-300 px-4 py-2">sin_internet + ping_falla</td>
                        <td className="border border-gray-300 px-4 py-2">
                          ROUTER_FAILURE → Reiniciar router, verificar LEDs, etc.
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">sin_internet + ping_ok</td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG → Verificar servidores DNS, usar DNS alternativos
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">intermitencia + wifi</td>
                        <td className="border border-gray-300 px-4 py-2">
                          WIFI_INTERFERENCE → Cambiar canal WiFi, reubicar router
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">ping_perdida_paquetes</td>
                        <td className="border border-gray-300 px-4 py-2">
                          NETWORK_HARDWARE → Inspeccionar cables, verificar switches
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">error_dns</td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG → Verificar servidores DNS, limpiar caché DNS
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">wifi_debil</td>
                        <td className="border border-gray-300 px-4 py-2">
                          WIFI_INTERFERENCE → Reubicar router, instalar repetidores
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">servidor_lento</td>
                        <td className="border border-gray-300 px-4 py-2">
                          SERVER_OVERLOAD → Reiniciar servidor, verificar recursos
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">multiples_usuarios_afectados</td>
                        <td className="border border-gray-300 px-4 py-2">
                          INFRASTRUCTURE_FAILURE → Revisar equipos centrales
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
                      <li>Agente basado en conocimiento</li>
                      <li>Subtipo: Sistema experto basado en reglas</li>
                      <li>Enfoque: Diagnóstico mediante correspondencia de patrones</li>
                    </ul>
                  </div>

                  {/* Metodología */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Metodología Involucrada</h4>
                    <p className="mb-2">
                      <strong>Representación del conocimiento:</strong> Reglas condicionales (condición-acción)
                    </p>
                    <p className="mb-2">
                      <strong>Mecanismo de razonamiento:</strong> Encadenamiento hacia adelante (forward chaining)
                    </p>
                    <p className="mb-1">
                      <strong>Estrategia de resolución:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Coincidencia de patrones exactos (prioridad alta)</li>
                      <li>Coincidencia de patrones parciales (prioridad media)</li>
                      <li>Solución por defecto (cuando no hay coincidencias)</li>
                    </ul>
                    <p className="mb-1">
                      <strong>Procesamiento:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Convertir síntomas de interfaz a símbolos internos</li>
                      <li>Inferir síntomas adicionales relacionados</li>
                      <li>Aplicar reglas ordenadas por prioridad</li>
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
                      <li>Reglas condicionales (13 reglas definidas)</li>
                      <li>Mapeo de síntomas-causas (MAPEO_SINTOMA_CAUSA)</li>
                      <li>Acciones recomendadas por causa (ACCIONES_RECOMENDADAS)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Motor de inferencia:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Método diagnose() que implementa el algoritmo de diagnóstico</li>
                      <li>Inferencia de síntomas adicionales</li>
                      <li>Aplicación de reglas por prioridad</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Interfaz de usuario (implícita en el código):</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Captura de síntomas (LISTA_SINTOMAS)</li>
                      <li>Presentación de resultados (DiagnosisResult)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Mecanismos de priorización:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Cada regla tiene un nivel de prioridad (1-4)</li>
                      <li>Reglas con menor número tienen mayor prioridad</li>
                      <li>Coincidencias exactas prevalecen sobre parciales</li>
                    </ul>
                  </div>

                  <p className="text-gray-700 italic">
                    El sistema implementa un enfoque simplificado que elimina grados de confianza, centrándose en reglas
                    deterministas para proporcionar diagnósticos claros y accionables para problemas de red empresarial.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
