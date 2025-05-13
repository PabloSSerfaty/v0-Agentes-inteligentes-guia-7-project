"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DocumentationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentationModal({ open, onOpenChange }: DocumentationModalProps) {
  const [activeTab, setActiveTab] = useState("reas")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Modelado del Agente para Sistema Experto de Diagnóstico de Red
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-gray-700 mb-4">
            Analizaré el sistema experto basado en reglas para diagnóstico de problemas de red utilizando diferentes
            descriptores que permiten modelar completamente el agente.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="reas">REAS</TabsTrigger>
              <TabsTrigger value="pama">PAMA</TabsTrigger>
              <TabsTrigger value="pya">Tabla PyA</TabsTrigger>
              <TabsTrigger value="tipo">Tipo y Metodología</TabsTrigger>
            </TabsList>

            <TabsContent value="reas" className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">1. Descriptor REAS</h3>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Rendimiento (o recompensa)</h4>
                <p className="mb-2">
                  <strong>Objetivo principal:</strong> Identificar correctamente la causa de los problemas de red y
                  proporcionar acciones recomendadas adecuadas
                </p>
                <p>
                  <strong>Métricas de rendimiento:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Precisión en la identificación de causas raíz</li>
                  <li>Relevancia de las acciones recomendadas</li>
                  <li>Rapidez en el diagnóstico</li>
                  <li>Minimización de falsos positivos/negativos</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Entorno</h4>
                <p className="mb-2">
                  <strong>Tipo de entorno:</strong> Red informática empresarial
                </p>
                <p>
                  <strong>Propiedades del entorno:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Parcialmente observable: No todos los estados de la red son visibles directamente</li>
                  <li>Determinista: Los mismos síntomas conducen a los mismos diagnósticos</li>
                  <li>Episódico: Cada diagnóstico es independiente de diagnósticos anteriores</li>
                  <li>Estático: El estado del problema no cambia durante el proceso de diagnóstico</li>
                  <li>Discreto: Conjunto finito de estados de problema posibles</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Actuadores</h4>
                <p>Sistema de recomendaciones que genera:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Lista priorizada de causas probables</li>
                  <li>Acciones recomendadas para cada causa identificada</li>
                  <li>Presentación de resultados a través de la interfaz (componente DiagnosisResult)</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Sensores</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Interfaz de usuario para capturar síntomas reportados</li>
                  <li>Mapeo de síntomas de interfaz a síntomas internos (MAPEO_SINTOMAS_REGLAS)</li>
                  <li>Mecanismo de inferencia para detectar síntomas adicionales</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="pama" className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">2. Descriptor PAMA</h3>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Percepción</h4>
                <p className="mb-2">
                  <strong>Entradas:</strong> Síntomas seleccionados por el usuario desde la interfaz
                </p>
                <p>
                  <strong>Procesamiento de percepción:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Conversión de síntomas de interfaz a síntomas del sistema (método convertirSintomas)</li>
                  <li>
                    Inferencia de síntomas adicionales basados en los reportados (método inferirSintomasAdicionales)
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Acción</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Generación del diagnóstico con causas probables y acciones recomendadas</li>
                  <li>Las acciones son ordenadas por prioridad según las reglas coincidentes</li>
                  <li>Cada causa tiene asociado un conjunto específico de acciones recomendadas</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Metas (Medio-Fines)</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Meta primaria:</strong> Identificar correctamente la causa raíz del problema de red
                  </li>
                  <li>
                    <strong>Meta secundaria:</strong> Proporcionar acciones efectivas para resolver el problema
                  </li>
                  <li>
                    <strong>Estrategia medio-fin:</strong> Utilizar reglas basadas en condiciones para mapear síntomas a
                    causas y soluciones
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Ambiente</h4>
                <p>Sistema de red empresarial con múltiples componentes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Infraestructura física (routers, switches, cables)</li>
                  <li>Servicios de red (DNS, servidores internos)</li>
                  <li>Conectividad externa (ISP)</li>
                  <li>Factores ambientales (interferencia WiFi)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="pya">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">3. Tabla PyA (Percepción-Acción)</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Percepción (Síntomas)</th>
                      <th className="py-2 px-4 border-b text-left">Acción (Causas y Recomendaciones)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b">sin_internet + ping_falla</td>
                      <td className="py-2 px-4 border-b">ROUTER_FAILURE → Reiniciar router, verificar LEDs, etc.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b">sin_internet + ping_ok</td>
                      <td className="py-2 px-4 border-b">
                        DNS_CONFIG → Verificar servidores DNS, usar DNS alternativos
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">intermitencia + wifi</td>
                      <td className="py-2 px-4 border-b">WIFI_INTERFERENCE → Cambiar canal WiFi, reubicar router</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b">ping_perdida_paquetes</td>
                      <td className="py-2 px-4 border-b">NETWORK_HARDWARE → Inspeccionar cables, verificar switches</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">error_dns</td>
                      <td className="py-2 px-4 border-b">DNS_CONFIG → Verificar servidores DNS, limpiar caché DNS</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b">wifi_debil</td>
                      <td className="py-2 px-4 border-b">WIFI_INTERFERENCE → Reubicar router, instalar repetidores</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">servidor_lento</td>
                      <td className="py-2 px-4 border-b">SERVER_OVERLOAD → Reiniciar servidor, verificar recursos</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b">multiples_usuarios_afectados</td>
                      <td className="py-2 px-4 border-b">INFRASTRUCTURE_FAILURE → Revisar equipos centrales</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="tipo" className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">
                4. Tipo, Metodología y Elementos Constitutivos del Agente Experto
              </h3>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Tipo de Agente</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Agente basado en conocimiento</li>
                  <li>Subtipo: Sistema experto basado en reglas</li>
                  <li>Enfoque: Diagnóstico mediante correspondencia de patrones</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Metodología Involucrada</h4>
                <p className="mb-2">
                  <strong>Representación del conocimiento:</strong> Reglas condicionales (condición-acción)
                </p>
                <p className="mb-2">
                  <strong>Mecanismo de razonamiento:</strong> Encadenamiento hacia adelante (forward chaining)
                </p>
                <p className="mb-2">
                  <strong>Estrategia de resolución:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-2">
                  <li>Coincidencia de patrones exactos (prioridad alta)</li>
                  <li>Coincidencia de patrones parciales (prioridad media)</li>
                  <li>Solución por defecto (cuando no hay coincidencias)</li>
                </ul>
                <p>
                  <strong>Procesamiento:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Convertir síntomas de interfaz a símbolos internos</li>
                  <li>Inferir síntomas adicionales relacionados</li>
                  <li>Aplicar reglas ordenadas por prioridad</li>
                  <li>Generar diagnóstico con acciones recomendadas</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Elementos Constitutivos</h4>
                <p className="mb-2">
                  <strong>Base de conocimiento:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-2">
                  <li>Reglas condicionales (13 reglas definidas)</li>
                  <li>Mapeo de síntomas-causas (MAPEO_SINTOMA_CAUSA)</li>
                  <li>Acciones recomendadas por causa (ACCIONES_RECOMENDADAS)</li>
                </ul>
                <p className="mb-2">
                  <strong>Motor de inferencia:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-2">
                  <li>Método diagnose() que implementa el algoritmo de diagnóstico</li>
                  <li>Inferencia de síntomas adicionales</li>
                  <li>Aplicación de reglas por prioridad</li>
                </ul>
                <p className="mb-2">
                  <strong>Interfaz de usuario (implícita en el código):</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-2">
                  <li>Captura de síntomas (LISTA_SINTOMAS)</li>
                  <li>Presentación de resultados (DiagnosisResult)</li>
                </ul>
                <p className="mb-2">
                  <strong>Mecanismos de priorización:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cada regla tiene un nivel de prioridad (1-4)</li>
                  <li>Reglas con menor número tienen mayor prioridad</li>
                  <li>Coincidencias exactas prevalecen sobre parciales</li>
                </ul>
              </div>

              <p className="mt-4 text-gray-700">
                El sistema implementa un enfoque simplificado que elimina grados de confianza, centrándose en reglas
                deterministas para proporcionar diagnósticos claros y accionables para problemas de red empresarial.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
