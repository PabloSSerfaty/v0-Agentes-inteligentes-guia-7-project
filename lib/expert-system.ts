/**
 * @file lib/expert-system.ts
 * @description Implementación del sistema experto de diagnóstico de red basado en inferencia bayesiana.
 * Este sistema calcula las probabilidades de diferentes causas de problemas de red
 * basándose en los síntomas observados utilizando el teorema de Bayes.
 */

// Definición de tipos para el sistema experto
/** Representa una causa de problema de red */
type Cause = string

/** Representa un síntoma de problema de red */
type Symptom = string

/** Mapa de probabilidades para cada causa */
type ProbabilityMap = Record<Cause, number>

/** Mapa de probabilidades condicionales P(Síntoma|Causa) */
type ConditionalProbability = Record<string, number>

/** Mapa de acciones recomendadas para cada causa */
type RecommendedActions = Record<Cause, string[]>

/**
 * Interfaz que define la estructura del resultado de diagnóstico.
 * Esta estructura es la que se devuelve al frontend.
 */
interface DiagnosisResult {
  causas: {
    causa: string
    confianza: number
    acciones: string[]
  }[]
}

/**
 * Interfaz que define la estructura de un paso de cálculo en la inferencia bayesiana.
 * Se utiliza para registrar el proceso de inferencia para posibles explicaciones.
 */
interface CalculationStep {
  symptom: Symptom
  calculations: Record<
    Cause,
    {
      p_symptom_given_cause: number
      p_cause_prior: number
      p_cause_posterior: number
    }
  >
}

/**
 * Clase que implementa el sistema experto de diagnóstico de red.
 * Utiliza inferencia bayesiana para calcular las probabilidades de diferentes causas
 * basándose en los síntomas observados.
 */
export class NetworkDiagnosticSystem {
  /** Lista de posibles causas de problemas de red */
  private causes: Cause[]

  /** Lista de posibles síntomas de problemas de red */
  private symptoms: Symptom[]

  /** Probabilidades a priori de cada causa */
  private priorProbabilities: ProbabilityMap

  /** Probabilidades condicionales P(Síntoma|Causa) */
  private conditionalProbabilities: ConditionalProbability

  /** Acciones recomendadas para cada causa */
  private recommendedActions: RecommendedActions

  /**
   * Constructor de la clase NetworkDiagnosticSystem.
   * Inicializa el sistema experto con las causas, síntomas, probabilidades y acciones recomendadas.
   */
  constructor() {
    // Definir causas y síntomas
    this.causes = [
      "Falla en el router",
      "Problemas con el ISP",
      "Hardware de red defectuoso",
      "Configuración incorrecta de DNS",
      "Interferencia en señal Wi-Fi",
      "Sobrecarga del servidor interno",
      "Malware o virus en equipos",
    ]

    this.symptoms = [
      "Sin conexión a Internet",
      "Conexión intermitente",
      "Carga lenta de páginas",
      "Pérdida de paquetes",
      "Errores de DNS",
      "Señal Wi-Fi débil",
      "Lentitud en acceso a red interna",
    ]

    // Probabilidades a priori de cada causa
    this.priorProbabilities = {
      "Falla en el router": 0.25,
      "Problemas con el ISP": 0.2,
      "Hardware de red defectuoso": 0.15,
      "Configuración incorrecta de DNS": 0.12,
      "Interferencia en señal Wi-Fi": 0.08,
      "Sobrecarga del servidor interno": 0.1,
      "Malware o virus en equipos": 0.1,
    }

    // Matriz de probabilidades condicionales P(Síntoma|Causa)
    this.conditionalProbabilities = {}

    // Inicializar todas las probabilidades condicionales
    // Probabilidades para "Sin conexión a Internet"
    this.setConditionalProbability("Sin conexión a Internet", "Falla en el router", 0.9)
    this.setConditionalProbability("Sin conexión a Internet", "Problemas con el ISP", 0.85)
    this.setConditionalProbability("Sin conexión a Internet", "Hardware de red defectuoso", 0.6)
    this.setConditionalProbability("Sin conexión a Internet", "Configuración incorrecta de DNS", 0.3)
    this.setConditionalProbability("Sin conexión a Internet", "Interferencia en señal Wi-Fi", 0.2)
    this.setConditionalProbability("Sin conexión a Internet", "Sobrecarga del servidor interno", 0.1)
    this.setConditionalProbability("Sin conexión a Internet", "Malware o virus en equipos", 0.05)

    // Probabilidades para "Conexión intermitente"
    this.setConditionalProbability("Conexión intermitente", "Falla en el router", 0.7)
    this.setConditionalProbability("Conexión intermitente", "Problemas con el ISP", 0.75)
    this.setConditionalProbability("Conexión intermitente", "Hardware de red defectuoso", 0.8)
    this.setConditionalProbability("Conexión intermitente", "Configuración incorrecta de DNS", 0.2)
    this.setConditionalProbability("Conexión intermitente", "Interferencia en señal Wi-Fi", 0.8)
    this.setConditionalProbability("Conexión intermitente", "Sobrecarga del servidor interno", 0.3)
    this.setConditionalProbability("Conexión intermitente", "Malware o virus en equipos", 0.15)

    // Probabilidades para "Carga lenta de páginas"
    this.setConditionalProbability("Carga lenta de páginas", "Falla en el router", 0.6)
    this.setConditionalProbability("Carga lenta de páginas", "Problemas con el ISP", 0.7)
    this.setConditionalProbability("Carga lenta de páginas", "Hardware de red defectuoso", 0.5)
    this.setConditionalProbability("Carga lenta de páginas", "Configuración incorrecta de DNS", 0.7)
    this.setConditionalProbability("Carga lenta de páginas", "Interferencia en señal Wi-Fi", 0.6)
    this.setConditionalProbability("Carga lenta de páginas", "Sobrecarga del servidor interno", 0.75)
    this.setConditionalProbability("Carga lenta de páginas", "Malware o virus en equipos", 0.8)

    // Probabilidades para "Pérdida de paquetes"
    this.setConditionalProbability("Pérdida de paquetes", "Falla en el router", 0.85)
    this.setConditionalProbability("Pérdida de paquetes", "Problemas con el ISP", 0.65)
    this.setConditionalProbability("Pérdida de paquetes", "Hardware de red defectuoso", 0.9)
    this.setConditionalProbability("Pérdida de paquetes", "Configuración incorrecta de DNS", 0.1)
    this.setConditionalProbability("Pérdida de paquetes", "Interferencia en señal Wi-Fi", 0.5)
    this.setConditionalProbability("Pérdida de paquetes", "Sobrecarga del servidor interno", 0.4)
    this.setConditionalProbability("Pérdida de paquetes", "Malware o virus en equipos", 0.15)

    // Probabilidades para "Errores de DNS"
    this.setConditionalProbability("Errores de DNS", "Falla en el router", 0.4)
    this.setConditionalProbability("Errores de DNS", "Problemas con el ISP", 0.5)
    this.setConditionalProbability("Errores de DNS", "Hardware de red defectuoso", 0.1)
    this.setConditionalProbability("Errores de DNS", "Configuración incorrecta de DNS", 0.95)
    this.setConditionalProbability("Errores de DNS", "Interferencia en señal Wi-Fi", 0.05)
    this.setConditionalProbability("Errores de DNS", "Sobrecarga del servidor interno", 0.15)
    this.setConditionalProbability("Errores de DNS", "Malware o virus en equipos", 0.25)

    // Probabilidades para "Señal Wi-Fi débil"
    this.setConditionalProbability("Señal Wi-Fi débil", "Falla en el router", 0.5)
    this.setConditionalProbability("Señal Wi-Fi débil", "Problemas con el ISP", 0.05)
    this.setConditionalProbability("Señal Wi-Fi débil", "Hardware de red defectuoso", 0.3)
    this.setConditionalProbability("Señal Wi-Fi débil", "Configuración incorrecta de DNS", 0.05)
    this.setConditionalProbability("Señal Wi-Fi débil", "Interferencia en señal Wi-Fi", 0.95)
    this.setConditionalProbability("Señal Wi-Fi débil", "Sobrecarga del servidor interno", 0.1)
    this.setConditionalProbability("Señal Wi-Fi débil", "Malware o virus en equipos", 0.05)

    // Probabilidades para "Lentitud en acceso a red interna"
    this.setConditionalProbability("Lentitud en acceso a red interna", "Falla en el router", 0.4)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Problemas con el ISP", 0.2)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Hardware de red defectuoso", 0.6)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Configuración incorrecta de DNS", 0.3)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Interferencia en señal Wi-Fi", 0.4)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Sobrecarga del servidor interno", 0.9)
    this.setConditionalProbability("Lentitud en acceso a red interna", "Malware o virus en equipos", 0.75)

    // Acciones recomendadas para cada causa
    this.recommendedActions = {
      "Falla en el router": [
        "Reiniciar el router",
        "Verificar los indicadores LED del router",
        "Actualizar el firmware del router",
        "Restaurar la configuración de fábrica",
        "Reemplazar el router si persiste el problema",
      ],
      "Problemas con el ISP": [
        "Contactar al proveedor de servicios",
        "Verificar el estado de servicio en la página del ISP",
        "Solicitar un diagnóstico remoto",
        "Verificar si hay cortes programados en la zona",
      ],
      "Hardware de red defectuoso": [
        "Inspeccionar visualmente los cables y conectores",
        "Reemplazar cables dañados",
        "Verificar el funcionamiento de los switches",
        "Comprobar las tarjetas de red de los equipos",
      ],
      "Configuración incorrecta de DNS": [
        "Verificar servidores DNS configurados",
        "Configurar DNS alternativos (8.8.8.8, 1.1.1.1)",
        "Revisar configuración DHCP",
        "Limpiar caché DNS en los equipos",
      ],
      "Interferencia en señal Wi-Fi": [
        "Cambiar el canal de Wi-Fi",
        "Reubicar el router",
        "Instalar repetidores Wi-Fi",
        "Reducir interferencias (microondas, teléfonos inalámbricos)",
      ],
      "Sobrecarga del servidor interno": [
        "Reiniciar el servidor",
        "Verificar el uso de recursos (CPU, memoria)",
        "Revisar los procesos en ejecución",
        "Optimizar aplicaciones con alto consumo",
      ],
      "Malware o virus en equipos": [
        "Ejecutar escaneo de antivirus en todos los equipos",
        "Actualizar software de seguridad",
        "Revisar equipos con comportamiento anómalo",
        "Implementar políticas de seguridad más estrictas",
      ],
    }
  }

  /**
   * Establece la probabilidad condicional P(Síntoma|Causa).
   *
   * @param symptom - El síntoma
   * @param cause - La causa
   * @param probability - La probabilidad condicional P(Síntoma|Causa)
   */
  private setConditionalProbability(symptom: Symptom, cause: Cause, probability: number): void {
    const key = `${symptom}|${cause}`
    this.conditionalProbabilities[key] = probability
  }

  /**
   * Obtiene la probabilidad condicional P(Síntoma|Causa).
   * Si no existe, devuelve un valor por defecto de 0.01.
   *
   * @param symptom - El síntoma
   * @param cause - La causa
   * @returns La probabilidad condicional P(Síntoma|Causa)
   */
  private getConditionalProbability(symptom: Symptom, cause: Cause): number {
    const key = `${symptom}|${cause}`
    return this.conditionalProbabilities[key] || 0.01 // Valor por defecto si no existe
  }

  /**
   * Calcula las probabilidades posteriores de cada causa dados los síntomas observados.
   * Utiliza el teorema de Bayes para actualizar las probabilidades.
   *
   * @param observedSymptoms - Los síntomas observados
   * @returns Un par con las probabilidades posteriores y los pasos de cálculo
   */
  private calculatePosteriorProbabilities(observedSymptoms: Symptom[]): [ProbabilityMap, CalculationStep[]] {
    // Copiar las probabilidades a priori iniciales
    const currentProbabilities: ProbabilityMap = { ...this.priorProbabilities }

    // Array para almacenar los pasos de cálculo (para posibles explicaciones)
    const calculationSteps: CalculationStep[] = []

    // Para cada síntoma observado, actualizar las probabilidades
    for (const symptom of observedSymptoms) {
      // Crear un objeto para almacenar los detalles de este paso
      const stepDetail: CalculationStep = {
        symptom,
        calculations: {},
      }

      // Calcular P(Síntoma) usando la ley de probabilidad total
      // P(S) = Σ P(S|C_i) * P(C_i)
      let pSymptom = 0
      for (const cause of this.causes) {
        pSymptom += this.getConditionalProbability(symptom, cause) * currentProbabilities[cause]
      }

      // Calcular P(Causa|Síntoma) para cada causa usando el teorema de Bayes
      for (const cause of this.causes) {
        // P(S|C) - Probabilidad del síntoma dada la causa
        const pSymptomGivenCause = this.getConditionalProbability(symptom, cause)

        // P(C) - Probabilidad a priori de la causa
        const pCause = currentProbabilities[cause]

        // Aplicar el teorema de Bayes: P(C|S) = P(S|C) * P(C) / P(S)
        // Evitar división por cero usando un valor pequeño si P(S) es 0
        const pCauseGivenSymptom = (pSymptomGivenCause * pCause) / (pSymptom || 0.0001)

        // Almacenar los detalles del cálculo para este paso
        stepDetail.calculations[cause] = {
          p_symptom_given_cause: pSymptomGivenCause,
          p_cause_prior: pCause,
          p_cause_posterior: pCauseGivenSymptom,
        }

        // Actualizar la probabilidad de la causa
        currentProbabilities[cause] = pCauseGivenSymptom
      }

      // Agregar este paso al array de pasos
      calculationSteps.push(stepDetail)
    }

    // Normalizar probabilidades para asegurar que sumen 1
    const totalProbability = Object.values(currentProbabilities).reduce((sum, prob) => sum + prob, 0)
    if (totalProbability > 0) {
      for (const cause in currentProbabilities) {
        currentProbabilities[cause] /= totalProbability
      }
    }

    return [currentProbabilities, calculationSteps]
  }

  /**
   * Realiza el diagnóstico en base a los síntomas observados.
   * Devuelve las causas más probables con sus niveles de confianza y acciones recomendadas.
   *
   * @param observedSymptoms - Los síntomas observados
   * @returns El resultado del diagnóstico
   */
  public diagnose(observedSymptoms: string[]): DiagnosisResult {
    // Verificar síntomas válidos (que existan en la lista de síntomas conocidos)
    const validSymptoms = observedSymptoms.filter((s) => this.symptoms.includes(s))

    // Si no hay síntomas válidos, devolver un diagnóstico genérico
    if (validSymptoms.length === 0) {
      return {
        causas: [
          {
            causa: "Problema general de red",
            confianza: 100,
            acciones: [
              "Reiniciar todos los equipos de red",
              "Verificar conexiones físicas",
              "Contactar al soporte técnico",
            ],
          },
        ],
      }
    }

    // Calcular probabilidades posteriores usando inferencia bayesiana
    // El segundo elemento del par (los pasos de cálculo) no se usa actualmente,
    // pero podría usarse para explicar el razonamiento
    const [posteriorProbabilities, _] = this.calculatePosteriorProbabilities(validSymptoms)

    // Ordenar causas por probabilidad (de mayor a menor)
    const sortedCauses = Object.entries(posteriorProbabilities).sort((a, b) => b[1] - a[1])

    // Preparar resultado con diagnóstico y recomendaciones
    const result: DiagnosisResult = {
      causas: [],
    }

    // Agregar causas con sus probabilidades y acciones recomendadas
    for (const [cause, probability] of sortedCauses) {
      result.causas.push({
        causa: cause,
        confianza: Math.round(probability * 100), // Convertir a porcentaje y redondear
        acciones: this.recommendedActions[cause],
      })
    }

    return result
  }
}
