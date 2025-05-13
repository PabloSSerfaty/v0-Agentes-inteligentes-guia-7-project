"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, BarChart4 } from "lucide-react"

export function FuzzySystemInfo() {
  const [isOpen, setIsOpen] = useState(false)

  // Declare variables for fuzzy sets
  const baja = "baja"
  const media = "media"
  const alta = "alta"
  const inestable = "inestable"
  const moderada = "moderada"
  const estable = "estable"
  const debil = "debil"
  const fuerte = "fuerte"
  const limitado = "limitado"
  const parcial = "parcial"
  const completo = "completo"

  return (
    <div className="mt-6">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BarChart4 className="mr-2 h-4 w-4" />
          <span>Información del Sistema Experto Difuso</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-4 p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Modelado del Agente para Sistema Experto Difuso de Diagnóstico de Red
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
                            <strong>Objetivo principal:</strong> Determinar las causas más probables de problemas de red
                            mediante lógica difusa y proporcionar acciones recomendadas
                          </p>
                          <p className="mb-1">
                            <strong>Métricas de rendimiento:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Precisión en la distribución de los grados de pertenencia</li>
                            <li>Coherencia entre los valores de entrada difusos y los resultados proporcionados</li>
                            <li>Relevancia de las acciones recomendadas para cada causa identificada</li>
                            <li>Capacidad para manejar la incertidumbre y los valores intermedios</li>
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
                            <strong>Tipo de entorno:</strong> Red informática con diversas variables continuas
                          </p>
                          <p className="mb-1">
                            <strong>Propiedades del entorno:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>
                              Parcialmente observable: Las mediciones de red representan solo una parte del estado real
                            </li>
                            <li>
                              No determinista: Existe incertidumbre inherente en las mediciones y en la interpretación
                              de los valores
                            </li>
                            <li>Episódico: Cada diagnóstico es independiente de los anteriores</li>
                            <li>Estático: Los valores de entrada no cambian durante el análisis</li>
                            <li>
                              Continuo: Las variables de entrada (velocidad, estabilidad, intensidad WiFi, etc.) tienen
                              valores en rangos continuos
                            </li>
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
                            <li>Lista ordenada de causas probables con grados de pertenencia</li>
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
                            <li>
                              Convertidor de síntomas a valores difusos mediante el método convertirSintomasAEntradas
                            </li>
                            <li>
                              Funciones de membresía que actúan como "sensores virtuales" para evaluar valores difusos
                            </li>
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
                            <strong>Entradas primarias:</strong> Síntomas seleccionados por el usuario desde la interfaz
                          </p>
                          <p className="mb-2">
                            <strong>Entradas procesadas:</strong> Valores numéricos para cinco variables lingüísticas:
                          </p>
                          <ul className="list-disc pl-5 mb-2">
                            <li>Velocidad de conexión (0-100)</li>
                            <li>Estabilidad de la conexión (0-100)</li>
                            <li>Intensidad de la señal WiFi (0-100)</li>
                            <li>Latencia (0-300 ms)</li>
                            <li>Acceso a servicios (0-100)</li>
                          </ul>
                          <p className="mb-1">
                            <strong>Procesamiento de percepción:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            <li>Conversión de síntomas discretos a valores numéricos continuos</li>
                            <li>Evaluación de funciones de membresía para cada variable lingüística</li>
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
                            <li>Evaluación de reglas difusas para determinar causas probables</li>
                            <li>Cálculo de grados de activación para cada posible causa</li>
                            <li>Ordenamiento de causas según su grado de activación</li>
                            <li>Generación del resultado con causas ordenadas y acciones recomendadas</li>
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
                              <strong>Meta primaria:</strong> Clasificar adecuadamente el problema de red en categorías
                              difusas
                            </li>
                            <li>
                              <strong>Meta secundaria:</strong> Proporcionar recomendaciones relevantes basadas en la
                              distribución de probabilidades
                            </li>
                            <li>
                              <strong>Estrategia medio-fin:</strong> Utilizar un sistema de inferencia difusa para
                              manejar la incertidumbre y representar relaciones complejas entre síntomas y causas
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
                          <p className="mb-2">Sistema de red con variables continuas:</p>
                          <ul className="list-disc pl-5 mb-2">
                            <li>Métricas de rendimiento (velocidad, latencia)</li>
                            <li>Métricas de calidad (estabilidad, intensidad de señal)</li>
                            <li>Métricas de accesibilidad (acceso a servicios)</li>
                          </ul>
                          <p>Conjunto de posibles causas y acciones recomendadas</p>
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
                        <th className="border border-gray-300 px-4 py-2 text-left">Percepción (Valores Difusos)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Acción (Causas y Recomendaciones)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Velocidad baja + Estabilidad inestable + Latencia alta
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          ROUTER_FAILURE (alto), NETWORK_CONGESTION (medio) → Reiniciar router, verificar QoS
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          Velocidad baja + Estabilidad moderada + Acceso limitado
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          NETWORK_CONGESTION (alto), ROUTER_FAILURE (medio) → Optimizar ancho de banda, verificar router
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Intensidad WiFi débil + Estabilidad inestable
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          WIFI_INTERFERENCE (alto), INFRASTRUCTURE_FAILURE (medio) → Cambiar canal WiFi, verificar
                          equipos centrales
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          Velocidad media + Estabilidad inestable + Acceso parcial
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG (medio), ROUTER_FAILURE (medio) → Verificar DNS, revisar router
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Intensidad WiFi fuerte + Velocidad baja + Latencia alta
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          NETWORK_CONGESTION (alto), DNS_CONFIG (medio) → Verificar uso de ancho de banda, revisar DNS
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Acceso limitado + Velocidad media</td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG (alto), ROUTER_FAILURE (medio) → Verificar configuración DNS, reiniciar router
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Acceso limitado + Latencia media</td>
                        <td className="border border-gray-300 px-4 py-2">
                          DNS_CONFIG (alto), NETWORK_CONGESTION (medio) → Verificar DNS, optimizar tráfico
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
                      <li>Agente basado en conocimiento difuso</li>
                      <li>Subtipo: Sistema experto basado en lógica difusa</li>
                      <li>Enfoque: Diagnóstico mediante razonamiento aproximado</li>
                    </ul>
                  </div>

                  {/* Metodología */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Metodología Involucrada</h4>
                    <p className="mb-2">
                      <strong>Representación del conocimiento:</strong> Reglas difusas (antecedente-consecuente)
                    </p>
                    <p className="mb-2">
                      <strong>Mecanismo de razonamiento:</strong> Lógica difusa con método de inferencia de Mamdani
                      simplificado
                    </p>
                    <p className="mb-1">
                      <strong>Estrategia de resolución:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Fuzzificación (convertir valores nítidos a conjuntos difusos)</li>
                      <li>Evaluación de reglas difusas (16 reglas de inferencia)</li>
                      <li>Agregación de resultados (método del máximo)</li>
                      <li>Ordenamiento por grado de activación (defuzzificación implícita)</li>
                    </ul>
                    <p className="mb-1">
                      <strong>Procesamiento:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Convertir síntomas reportados a valores numéricos</li>
                      <li>Evaluar funciones de membresía para cada variable</li>
                      <li>Aplicar reglas difusas y calcular grados de activación</li>
                      <li>Generar diagnóstico ordenado por relevancia</li>
                    </ul>
                  </div>

                  {/* Elementos Constitutivos */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Elementos Constitutivos</h4>

                    <p className="mb-1">
                      <strong>Base de conocimiento:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>16 reglas difusas con antecedentes y consecuentes</li>
                      <li>Funciones de membresía trapezoidales para cada variable lingüística</li>
                      <li>Mapeo de causas internas a etiquetas para la interfaz (causaLabels)</li>
                      <li>Acciones recomendadas para cada causa (recomendaciones)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Motor de inferencia difusa:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Método diagnose() que implementa el algoritmo de diagnóstico difuso</li>
                      <li>Funciones de evaluación para las reglas difusas</li>
                      <li>Método de agregación de resultados (actualizarResultados)</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Fuzzificador:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Convertidor de síntomas a valores numéricos (convertirSintomasAEntradas)</li>
                      <li>Funciones de membresía para cada variable lingüística:</li>
                      <ul className="list-disc pl-5 mb-2">
                        <li>evaluarVelocidad</li>
                        <li>evaluarEstabilidad</li>
                        <li>evaluarIntensidadWifi</li>
                        <li>evaluarLatencia</li>
                        <li>evaluarAcceso</li>
                      </ul>
                    </ul>

                    <p className="mb-1">
                      <strong>Defuzzificador implícito:</strong>
                    </p>
                    <ul className="list-disc pl-5 mb-2">
                      <li>Ordenamiento de causas según grado de activación</li>
                      <li>Conversión a estructura DiagnosisResult para presentación</li>
                    </ul>

                    <p className="mb-1">
                      <strong>Funciones de membresía:</strong>
                    </p>
                    <ul className="list-disc pl-5">
                      <li>Función trapezoidal simplificada (trapmf)</li>
                      <li>Conjuntos difusos para cada variable:</li>
                      <ul className="list-disc pl-5">
                        <li>Velocidad: {(baja, media, alta)}</li>
                        <li>Estabilidad: {(inestable, moderada, estable)}</li>
                        <li>Intensidad WiFi: {(debil, moderada, fuerte)}</li>
                        <li>Latencia: {(baja, media, alta)}</li>
                        <li>Acceso: {(limitado, parcial, completo)}</li>
                      </ul>
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
