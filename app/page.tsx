/**
 * @file app/page.tsx
 * @description Componente principal de la aplicación de diagnóstico de red.
 * Implementa la interfaz de usuario que permite a los usuarios seleccionar síntomas
 * y visualizar los resultados del diagnóstico generados por el sistema experto.
 */

"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, ArrowRight, BarChart4, Brain, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { diagnosticarProblemasDeRed, type ExpertSystemType } from "@/lib/diagnose"
import { LISTA_SINTOMAS, type DiagnosisResult } from "@/lib/constants"

// Importar los componentes de visualización
import { BayesianNetworkDiagram } from "@/components/bayesian-network-visualization"
import { ExpertSystemInfo } from "@/components/expert-system-info"
import { FuzzySystemInfo } from "@/components/fuzzy-system-info"
import { BayesianSystemInfo } from "@/components/bayesian-system-info"
import { DecisionTreeDiagram } from "@/components/decision-tree-visualization"
import { FuzzyMapButton } from "@/components/fuzzy-map-button"

/**
 * Lista de síntomas que pueden ser seleccionados por el usuario.
 */
const SINTOMAS = LISTA_SINTOMAS

/**
 * Componente principal de la herramienta de diagnóstico de red.
 * Gestiona la selección de síntomas, la solicitud de diagnóstico y la visualización de resultados.
 *
 * @returns Componente React con la interfaz de usuario completa
 */
export default function HerramientaDiagnosticoRed() {
  // Estado para almacenar los síntomas seleccionados por el usuario
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState<string[]>([])

  // Estado para almacenar el resultado del diagnóstico
  const [resultado, setResultado] = useState<DiagnosisResult | null>(null)

  // Estado para controlar la visualización del indicador de carga
  const [cargando, setCargando] = useState(false)

  // Estado para el tipo de sistema experto seleccionado
  const [tipoSistema, setTipoSistema] = useState<ExpertSystemType>("bayesian")

  // Estado para controlar la visibilidad del árbol de decisión
  const [decisionTreeOpen, setDecisionTreeOpen] = useState(false)

  /**
   * Maneja la selección/deselección de un síntoma.
   * Si el síntoma ya está seleccionado, lo elimina; si no, lo agrega.
   *
   * @param sintoma - El síntoma a alternar
   */
  const manejarAlternarSintoma = (sintoma: string) => {
    setSintomasSeleccionados((prev) =>
      prev.includes(sintoma) ? prev.filter((s) => s !== sintoma) : [...prev, sintoma],
    )
  }

  /**
   * Maneja el envío del formulario para solicitar un diagnóstico.
   * Llama a la función diagnosticarProblemasDeRed con los síntomas seleccionados
   * y actualiza el estado con el resultado.
   */
  const manejarEnvio = async () => {
    // No hacer nada si no hay síntomas seleccionados
    if (sintomasSeleccionados.length === 0) return

    // Activar indicador de carga
    setCargando(true)
    try {
      // Llamar a la función de diagnóstico con los síntomas seleccionados y el tipo de sistema
      const resultadoDiagnostico = await diagnosticarProblemasDeRed(sintomasSeleccionados, tipoSistema)
      // Actualizar el estado con el resultado
      setResultado(resultadoDiagnostico)
    } catch (error) {
      console.error("Falló el diagnóstico:", error)
    } finally {
      // Desactivar indicador de carga
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Encabezado de la página */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herramienta de Diagnóstico de Red</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Seleccione los síntomas que está experimentando con su red, y nuestros sistemas expertos diagnosticarán las
            causas más probables.
          </p>
        </header>

        {/* Selector de sistema experto */}
        <div className="max-w-5xl mx-auto mb-6">
          <Tabs
            defaultValue="bayesian"
            value={tipoSistema}
            onValueChange={(value) => setTipoSistema(value as ExpertSystemType)}
            className="w-full"
          >
            <div className="flex justify-center mb-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="bayesian" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Sistema Bayesiano</span>
                </TabsTrigger>
                <TabsTrigger value="fuzzy" className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4" />
                  <span>Lógica Difusa</span>
                </TabsTrigger>
                <TabsTrigger value="rule-based" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span>Basado en Reglas</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Contenido principal: grid de dos columnas en pantallas medianas y grandes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tarjeta de selección de síntomas */}
          <Card className="shadow-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Seleccionar Síntomas</CardTitle>
              <CardDescription>Elija todos los problemas de red que está experimentando actualmente</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Mapear cada síntoma a un checkbox */}
                {SINTOMAS.map((sintoma) => (
                  <div
                    key={sintoma}
                    className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <Checkbox
                      id={sintoma}
                      checked={sintomasSeleccionados.includes(sintoma)}
                      onCheckedChange={() => manejarAlternarSintoma(sintoma)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor={sintoma} className="cursor-pointer">
                      {sintoma}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg">
              {/* Botón para solicitar diagnóstico */}
              <Button
                onClick={manejarEnvio}
                disabled={sintomasSeleccionados.length === 0 || cargando}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {cargando ? "Diagnosticando..." : "Diagnosticar Problemas"}
                {!cargando && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>

          {/* Tarjeta de resultados del diagnóstico */}
          <Card className="shadow-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Resultados del Diagnóstico</CardTitle>
              <CardDescription>
                Causas probables basadas en los síntomas seleccionados
                {tipoSistema === "bayesian"
                  ? " (Inferencia Bayesiana)"
                  : tipoSistema === "fuzzy"
                    ? " (Lógica Difusa)"
                    : " (Sistema Basado en Reglas)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Mostrar resultados si existen, o un mensaje si no hay diagnóstico */}
              {resultado ? (
                <div className="space-y-4">
                  {/* Mapear cada causa a un panel con acciones recomendadas */}
                  {resultado.causas.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      {/* Encabezado con nombre de la causa */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{item.causa}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            index === 0
                              ? "bg-green-100 text-green-800"
                              : index < 3
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {index === 0 ? "Alta probabilidad" : index < 3 ? "Probabilidad media" : "Posible causa"}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      {/* Lista de acciones recomendadas */}
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Acciones Recomendadas:</h4>
                        <ul className="space-y-1">
                          {item.acciones.map((accion, accionIndex) => (
                            <li key={accionIndex} className="text-sm flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{accion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Estado vacío cuando no hay diagnóstico
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
                  <p>
                    Aún no hay diagnóstico. Seleccione síntomas y haga clic en "Diagnosticar Problemas" para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección informativa sobre los sistemas expertos */}
        <div className="mt-12 max-w-5xl mx-auto">
          <Separator className="my-6" />
          <h2 className="text-2xl font-bold text-center mb-6">Acerca de los Sistemas Expertos</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Sistema Bayesiano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  El sistema experto bayesiano utiliza el teorema de Bayes para identificar las causas más probables
                  basándose en los síntomas observados. Este enfoque prioriza las causas según su frecuencia de
                  aparición en los síntomas seleccionados.
                </p>
                <div className="mt-4">
                  <BayesianNetworkDiagram />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5" />
                  Sistema de Lógica Difusa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  El sistema de lógica difusa permite manejar la incertidumbre y la imprecisión en los datos de entrada.
                  Utiliza funciones de membresía para determinar el grado de pertenencia a diferentes conjuntos difusos,
                  y reglas difusas para inferir las causas más probables de los problemas de red.
                </p>
                <div className="mt-4">
                  <FuzzyMapButton />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Sistema Basado en Reglas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  El sistema basado en reglas utiliza un conjunto de reglas predefinidas para identificar causas
                  probables basándose en los síntomas observados. Este enfoque permite coincidencias exactas y
                  parciales, priorizando las soluciones según la relevancia de las reglas activadas.
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setDecisionTreeOpen(true)}>
                    Ver Árbol de Decisión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Añadir los componentes de información de sistemas expertos */}
          <BayesianSystemInfo />
          <FuzzySystemInfo />
          <ExpertSystemInfo />

          {/* Añadir el componente DecisionTreeDiagram */}
          <DecisionTreeDiagram open={decisionTreeOpen} onOpenChange={setDecisionTreeOpen} />
        </div>
      </div>
    </div>
  )
}
