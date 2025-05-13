"use client"

import { useState } from "react"
import { ArrowRight, BarChart4, Brain, Book, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { diagnosticarProblemasDeRed, type ExpertSystemType, type ExtendedDiagnosisResult } from "@/lib/diagnose"
import { LISTA_SINTOMAS } from "@/lib/constants"
import { ExpertSystemInfo } from "@/components/expert-system-info"
import { FuzzySystemInfo } from "@/components/fuzzy-system-info"
import { BayesianSystemInfo } from "@/components/bayesian-system-info"
import { DecisionTreeDiagram } from "@/components/decision-tree-visualization"
import { FuzzyCognitiveMap } from "@/components/fuzzy-cognitive-map"
import { BayesianNetworkDiagram } from "@/components/bayesian-network-visualization"
import { AppliedRules } from "@/components/applied-rules"

// Importar los componentes para el sistema difuso
import { SymptomSlider } from "@/components/symptom-slider"
import { PrimaryDiagnosis } from "@/components/primary-diagnosis"
import { CauseCard } from "@/components/cause-card"

/**
 * Definición de los síntomas con sus rangos y etiquetas para los sliders
 */
const SINTOMAS_CONTINUOS = [
  {
    id: "conexion",
    nombre: "Estado de conexión",
    unidad: "%",
    min: 0,
    max: 100,
    paso: 1,
    valorInicial: 80,
    etiquetas: [
      { valor: 0, texto: "Inexistente" },
      { valor: 50, texto: "Intermitente" },
      { valor: 100, texto: "Estable" },
    ],
    descripcion: "Estabilidad general de la conexión a Internet",
  },
  {
    id: "velocidad",
    nombre: "Velocidad de carga",
    unidad: "Mbps",
    min: 0,
    max: 100,
    paso: 1,
    valorInicial: 50,
    etiquetas: [
      { valor: 0, texto: "Muy baja" },
      { valor: 25, texto: "Baja" },
      { valor: 50, texto: "Media" },
      { valor: 75, texto: "Alta" },
      { valor: 100, texto: "Muy alta" },
    ],
    descripcion: "Velocidad de descarga de datos",
  },
  {
    id: "perdida_paquetes",
    nombre: "Pérdida de paquetes",
    unidad: "%",
    min: 0,
    max: 100,
    paso: 1,
    valorInicial: 5,
    etiquetas: [
      { valor: 0, texto: "Ninguna" },
      { valor: 25, texto: "Baja" },
      { valor: 50, texto: "Moderada" },
      { valor: 75, texto: "Alta" },
      { valor: 100, texto: "Crítica" },
    ],
    descripcion: "Porcentaje de paquetes de datos perdidos durante la transmisión",
  },
  {
    id: "errores_dns",
    nombre: "Errores DNS",
    unidad: "/hora",
    min: 0,
    max: 10,
    paso: 1,
    valorInicial: 0,
    etiquetas: [
      { valor: 0, texto: "Ninguno" },
      { valor: 3, texto: "Ocasional" },
      { valor: 6, texto: "Frecuente" },
      { valor: 10, texto: "Constante" },
    ],
    descripcion: "Frecuencia de errores de resolución de nombres de dominio",
  },
  {
    id: "senal_wifi",
    nombre: "Señal Wi-Fi",
    unidad: "%",
    min: 0,
    max: 100,
    paso: 1,
    valorInicial: 70,
    etiquetas: [
      { valor: 0, texto: "Inexistente" },
      { valor: 25, texto: "Débil" },
      { valor: 50, texto: "Moderada" },
      { valor: 75, texto: "Buena" },
      { valor: 100, texto: "Excelente" },
    ],
    descripcion: "Intensidad de la señal inalámbrica",
  },
  {
    id: "tiempo_carga",
    nombre: "Tiempo de carga promedio",
    unidad: "ms",
    min: 0,
    max: 5000,
    paso: 100,
    valorInicial: 1000,
    etiquetas: [
      { valor: 0, texto: "Instantáneo" },
      { valor: 1000, texto: "Rápido" },
      { valor: 2500, texto: "Moderado" },
      { valor: 4000, texto: "Lento" },
      { valor: 5000, texto: "Muy lento" },
    ],
    descripcion: "Tiempo promedio de carga de páginas web",
  },
  {
    id: "latencia_servidor",
    nombre: "Latencia de respuesta del servidor interno",
    unidad: "ms",
    min: 0,
    max: 5000,
    paso: 100,
    valorInicial: 500,
    etiquetas: [
      { valor: 0, texto: "Óptima" },
      { valor: 1000, texto: "Aceptable" },
      { valor: 2500, texto: "Elevada" },
      { valor: 4000, texto: "Alta" },
      { valor: 5000, texto: "Crítica" },
    ],
    descripcion: "Tiempo de respuesta del servidor interno de la red",
  },
]

/**
 * Componente principal de la herramienta de diagnóstico de red.
 */
export default function HerramientaDiagnosticoRed() {
  // Estado para almacenar los valores de los síntomas (para sistema difuso)
  const [valoresSintomas, setValoresSintomas] = useState<Record<string, number>>(
    SINTOMAS_CONTINUOS.reduce(
      (acc, sintoma) => {
        acc[sintoma.id] = sintoma.valorInicial
        return acc
      },
      {} as Record<string, number>,
    ),
  )

  // Estado para almacenar los síntomas seleccionados (para sistemas bayesiano y basado en reglas)
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState<string[]>([])

  // Estado para almacenar el resultado del diagnóstico
  const [resultado, setResultado] = useState<ExtendedDiagnosisResult | null>(null)

  // Estado para controlar la visualización del indicador de carga
  const [cargando, setCargando] = useState(false)

  // Estado para el tipo de sistema experto seleccionado
  const [tipoSistema, setTipoSistema] = useState<ExpertSystemType>("fuzzy")

  // Estados para controlar la visibilidad de los diagramas
  const [decisionTreeOpen, setDecisionTreeOpen] = useState(false)
  const [fuzzyMapOpen, setFuzzyMapOpen] = useState(false)
  const [bayesianNetworkOpen, setBayesianNetworkOpen] = useState(false)

  /**
   * Maneja el cambio de valor de un síntoma para el sistema difuso.
   */
  const manejarCambioSintoma = (id: string, valor: number[]) => {
    setValoresSintomas((prev) => ({
      ...prev,
      [id]: valor[0],
    }))
  }

  /**
   * Maneja el cambio de selección de un síntoma para los sistemas bayesiano y basado en reglas.
   */
  const manejarSeleccionSintoma = (sintoma: string, seleccionado: boolean) => {
    if (seleccionado) {
      setSintomasSeleccionados((prev) => [...prev, sintoma])
    } else {
      setSintomasSeleccionados((prev) => prev.filter((s) => s !== sintoma))
    }
  }

  /**
   * Maneja el cambio de tipo de sistema experto.
   */
  const manejarCambioTipoSistema = (value: string) => {
    setTipoSistema(value as ExpertSystemType)
    setResultado(null) // Resetear el resultado al cambiar de sistema
  }

  /**
   * Maneja el envío del formulario para solicitar un diagnóstico.
   */
  const manejarEnvio = async () => {
    setCargando(true)
    try {
      if (tipoSistema === "fuzzy") {
        // Para el sistema difuso, usar los valores continuos
        const resultadoDiagnostico = await diagnosticarProblemasDeRed(valoresSintomas, tipoSistema)
        setResultado(resultadoDiagnostico)
      } else {
        // Para los sistemas bayesiano y basado en reglas, usar los síntomas seleccionados
        const resultadoDiagnostico = await diagnosticarProblemasDeRed({ sintomas: sintomasSeleccionados }, tipoSistema)
        setResultado(resultadoDiagnostico)
      }
    } catch (error) {
      console.error("Falló el diagnóstico:", error)
    } finally {
      setCargando(false)
    }
  }

  // Renderizar la interfaz de entrada de síntomas según el tipo de sistema
  const renderizarEntradaSintomas = () => {
    if (tipoSistema === "fuzzy") {
      // Interfaz mejorada con sliders para el sistema difuso
      return (
        <Card className="shadow-lg border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Ingresar Valores de Síntomas</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Ajuste los sliders para indicar la intensidad de cada síntoma que está experimentando
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {/* Mapear cada síntoma a un slider */}
              {SINTOMAS_CONTINUOS.map((sintoma) => (
                <SymptomSlider
                  key={sintoma.id}
                  id={sintoma.id}
                  nombre={sintoma.nombre}
                  unidad={sintoma.unidad}
                  min={sintoma.min}
                  max={sintoma.max}
                  paso={sintoma.paso}
                  valor={valoresSintomas[sintoma.id]}
                  etiquetas={sintoma.etiquetas}
                  descripcion={sintoma.descripcion}
                  onChange={(valor) => manejarCambioSintoma(sintoma.id, valor)}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-6">
            {/* Botón para solicitar diagnóstico */}
            <Button
              onClick={manejarEnvio}
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all hover:shadow-lg"
            >
              {cargando ? "Diagnosticando..." : "Realizar Diagnóstico"}
              {!cargando && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </CardFooter>
        </Card>
      )
    } else {
      // Interfaz original con checkboxes para los sistemas bayesiano y basado en reglas
      return (
        <Card className="shadow-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle>Seleccionar Síntomas</CardTitle>
            <CardDescription>
              Marque los síntomas que está experimentando en su red para obtener un diagnóstico
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {LISTA_SINTOMAS.map((sintoma) => (
                <div key={sintoma} className="flex items-center space-x-2">
                  <Checkbox
                    id={sintoma}
                    checked={sintomasSeleccionados.includes(sintoma)}
                    onCheckedChange={(checked) => manejarSeleccionSintoma(sintoma, checked === true)}
                  />
                  <label
                    htmlFor={sintoma}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {sintoma}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 rounded-b-lg">
            <Button onClick={manejarEnvio} disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700">
              {cargando ? "Diagnosticando..." : "Realizar Diagnóstico"}
              {!cargando && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      )
    }
  }

  // Renderizar la interfaz de resultados según el tipo de sistema
  const renderizarResultados = () => {
    if (tipoSistema === "fuzzy") {
      // Interfaz mejorada para el sistema difuso
      return (
        <div className="space-y-6">
          <Card className="shadow-lg border-gray-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Resultados del Diagnóstico</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Causas probables basadas en los valores de los síntomas (Lógica Difusa)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Mostrar resultados si existen, o un mensaje si no hay diagnóstico */}
              {resultado ? (
                <div className="space-y-4">
                  {/* Mostrar la causa más probable y la certeza */}
                  {resultado.certeza && resultado.causas.length > 0 && (
                    <PrimaryDiagnosis
                      causa={resultado.causas[0].causa}
                      certeza={resultado.certeza}
                      accion={resultado.causas[0].acciones[0]}
                    />
                  )}

                  {/* Título para la sección de todas las causas */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Todas las causas posibles:</h3>

                  {/* Mapear cada causa a un componente CauseCard */}
                  <div className="space-y-4">
                    {resultado.causas.map((item, index) => (
                      <CauseCard
                        key={index}
                        causa={item.causa}
                        probabilidad={item.probabilidad || 0}
                        acciones={item.acciones}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Estado vacío cuando no hay diagnóstico
                <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                  <AlertCircle className="h-16 w-16 mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Aún no hay diagnóstico</p>
                  <p className="text-gray-500 max-w-md">
                    Ajuste los valores de los síntomas y haga clic en "Realizar Diagnóstico" para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    } else if (tipoSistema === "bayesian") {
      // Interfaz para el sistema bayesiano (mantiene los porcentajes)
      return (
        <div className="space-y-6">
          <Card className="shadow-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Resultados del Diagnóstico</CardTitle>
              <CardDescription>
                Causas probables basadas en los síntomas seleccionados (Inferencia Bayesiana)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Mostrar resultados si existen, o un mensaje si no hay diagnóstico */}
              {resultado ? (
                <div className="space-y-6">
                  {/* Mapear cada causa a un panel con acciones recomendadas */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Causas probables:</h3>
                    {resultado.causas.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        {/* Encabezado con nombre de la causa */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{item.causa}</h3>
                          {item.probabilidad && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {item.probabilidad}%
                            </span>
                          )}
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
                </div>
              ) : (
                // Estado vacío cuando no hay diagnóstico
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
                  <p>
                    Aún no hay diagnóstico. Seleccione los síntomas y haga clic en "Realizar Diagnóstico" para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    } else {
      // Interfaz modificada para el sistema basado en reglas (sin porcentajes)
      return (
        <div className="space-y-6">
          <Card className="shadow-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Resultados del Diagnóstico
              </CardTitle>
              <CardDescription>
                Causas identificadas basadas en las reglas aplicadas al conjunto de síntomas seleccionados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Mostrar resultados si existen, o un mensaje si no hay diagnóstico */}
              {resultado ? (
                <div className="space-y-6">
                  {/* Mensaje explicativo sobre el sistema basado en reglas */}
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      El sistema basado en reglas ha identificado las siguientes causas a partir de los síntomas
                      seleccionados. Para ver el detalle de las reglas aplicadas, consulte la sección "Reglas Aplicadas"
                      más abajo.
                    </p>
                  </div>

                  {/* Mapear cada causa a un panel con acciones recomendadas */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Causas identificadas:</h3>
                    {resultado.causas.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        {/* Encabezado con nombre de la causa */}
                        <div className="flex items-center mb-2">
                          <h3 className="font-medium text-gray-900">{item.causa}</h3>
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
                </div>
              ) : (
                // Estado vacío cuando no hay diagnóstico
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
                  <p>
                    Aún no hay diagnóstico. Seleccione los síntomas y haga clic en "Realizar Diagnóstico" para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mostrar el componente de reglas aplicadas solo para el sistema basado en reglas */}
          {tipoSistema === "rule-based" && resultado && resultado.reglasAplicadas && (
            <AppliedRules rules={resultado.reglasAplicadas} />
          )}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Encabezado de la página */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herramienta de Diagnóstico de Red</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {tipoSistema === "fuzzy"
              ? "Ajuste los valores de los síntomas que está experimentando con su red, y nuestro sistema experto de lógica difusa diagnosticará las causas más probables."
              : "Seleccione los síntomas que está experimentando con su red, y nuestro sistema experto diagnosticará las causas más probables."}
          </p>
        </header>

        {/* Selector de sistema experto */}
        <div className="max-w-5xl mx-auto mb-6">
          <Tabs defaultValue="fuzzy" value={tipoSistema} onValueChange={manejarCambioTipoSistema} className="w-full">
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
          {/* Tarjeta de entrada de síntomas */}
          {renderizarEntradaSintomas()}

          {/* Tarjeta de resultados del diagnóstico */}
          {renderizarResultados()}
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
                  <Button variant="outline" className="w-full" onClick={() => setFuzzyMapOpen(true)}>
                    Ver Mapa cognitivo difuso
                  </Button>
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

          {/* Añadir los componentes de visualización */}
          <DecisionTreeDiagram open={decisionTreeOpen} onOpenChange={setDecisionTreeOpen} />
          <FuzzyCognitiveMap open={fuzzyMapOpen} onOpenChange={setFuzzyMapOpen} />
        </div>
      </div>
    </div>
  )
}
