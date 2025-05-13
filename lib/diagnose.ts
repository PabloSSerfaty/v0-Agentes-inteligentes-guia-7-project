/**
 * @file lib/diagnose.ts
 * @description Funciones para realizar diagnósticos de problemas de red.
 * Este archivo actúa como intermediario entre la interfaz de usuario y los sistemas expertos.
 */

import { NetworkDiagnosticSystem } from "./expert-system"
import { FuzzyNetworkDiagnosticSystem } from "./fuzzy-system"
import { RuleBasedNetworkDiagnosticSystem, type AppliedRule } from "./rule-based-system"
import { type DiagnosisResult, SINTOMAS_UNIFICADOS, CAUSAS_UNIFICADAS } from "./constants"

// Crear instancias de los sistemas expertos
const expertSystem = new NetworkDiagnosticSystem()
const fuzzySystem = new FuzzyNetworkDiagnosticSystem()
const ruleBasedSystem = new RuleBasedNetworkDiagnosticSystem()

/**
 * Tipo de sistema experto a utilizar para el diagnóstico.
 */
export type ExpertSystemType = "bayesian" | "fuzzy" | "rule-based"

/**
 * Resultado extendido del diagnóstico que incluye las reglas aplicadas.
 */
export interface ExtendedDiagnosisResult extends DiagnosisResult {
  reglasAplicadas?: AppliedRule[]
}

/**
 * Realiza un diagnóstico de problemas de red basado en los valores de los síntomas proporcionados.
 *
 * @param input - Objeto con los valores continuos de los síntomas o array de síntomas seleccionados
 * @param systemType - Tipo de sistema experto a utilizar (bayesiano, difuso o basado en reglas)
 * @returns Promesa que resuelve al resultado del diagnóstico
 */
export async function diagnosticarProblemasDeRed(
  input: Record<string, any>,
  systemType: ExpertSystemType = "fuzzy",
): Promise<ExtendedDiagnosisResult> {
  // Simular un retraso para dar sensación de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Realizar el diagnóstico según el tipo de sistema seleccionado
  let resultado: ExtendedDiagnosisResult

  if (systemType === "fuzzy") {
    // Usar el sistema experto basado en lógica difusa con valores continuos
    const inputs = fuzzySystem.convertirValoresAEntradas(input)
    resultado = fuzzySystem.diagnose(inputs)
  } else if (systemType === "rule-based") {
    // Para el sistema basado en reglas, usar los síntomas seleccionados
    const sintomas = input.sintomas || []
    resultado = ruleBasedSystem.diagnose(sintomas) as ExtendedDiagnosisResult

    // Añadir probabilidades estimadas basadas en el orden
    resultado.causas = resultado.causas.map((causa, index) => ({
      ...causa,
      probabilidad: Math.max(90 - index * 15, 10), // Estimación simple basada en el orden
    }))

    // Añadir certeza basada en la diferencia entre las primeras causas
    if (resultado.causas.length >= 2) {
      resultado.certeza = Math.max(85 - (resultado.causas.length - 1) * 5, 60)
    } else if (resultado.causas.length === 1) {
      resultado.certeza = 90
    }
  } else {
    // Para el sistema bayesiano, usar los síntomas seleccionados
    const sintomas = input.sintomas || []
    resultado = expertSystem.diagnose(sintomas)

    // Añadir probabilidades estimadas basadas en el orden
    resultado.causas = resultado.causas.map((causa, index) => ({
      ...causa,
      probabilidad: Math.max(95 - index * 12, 15), // Estimación simple basada en el orden
    }))

    // Añadir certeza basada en la diferencia entre las primeras causas
    if (resultado.causas.length >= 2) {
      resultado.certeza = Math.max(90 - (resultado.causas.length - 1) * 5, 65)
    } else if (resultado.causas.length === 1) {
      resultado.certeza = 95
    }
  }

  // Aplicar post-procesamiento para mejorar la coherencia
  if (systemType === "fuzzy" && input.errores_dns > 5) {
    // Asegurar que para Error de DNS alto, la configuración de DNS siempre esté entre las primeras causas
    const dnsConfigIndex = resultado.causas.findIndex((c) => c.causa === CAUSAS_UNIFICADAS.DNS_CONFIG)

    if (dnsConfigIndex > 0) {
      // Si existe pero no es la primera causa, moverla al principio
      const dnsConfig = resultado.causas.splice(dnsConfigIndex, 1)[0]
      resultado.causas.unshift(dnsConfig)
    } else if (dnsConfigIndex === -1) {
      // Si no existe, añadirla al principio
      resultado.causas.unshift({
        causa: CAUSAS_UNIFICADAS.DNS_CONFIG,
        acciones: [
          "Verificar servidores DNS configurados",
          "Configurar DNS alternativos (8.8.8.8, 1.1.1.1)",
          "Revisar configuración DHCP",
          "Limpiar caché DNS en los equipos",
        ],
        probabilidad: 85,
      })
    }
  }

  return resultado
}

/**
 * Convierte los valores continuos de los síntomas a un array de síntomas binarios.
 * Esta función se mantiene para compatibilidad con versiones anteriores.
 *
 * @param valoresSintomas - Objeto con los valores continuos de los síntomas
 * @returns Array de síntomas binarios (presentes)
 */
function convertirValoresASintomasBinarios(valoresSintomas: Record<string, number>): string[] {
  const sintomas: string[] = []

  // Convertir cada valor continuo a síntoma binario según umbrales
  if (valoresSintomas.conexion < 30) {
    sintomas.push(SINTOMAS_UNIFICADOS.NO_INTERNET)
  }

  if (valoresSintomas.perdida_paquetes > 20) {
    sintomas.push(SINTOMAS_UNIFICADOS.PACKET_LOSS)
  }

  if (valoresSintomas.errores_dns > 3) {
    sintomas.push(SINTOMAS_UNIFICADOS.DNS_ERROR)
  }

  if (valoresSintomas.tiempo_carga > 2000) {
    sintomas.push(SINTOMAS_UNIFICADOS.SLOW_LOADING)
  }

  if (valoresSintomas.senal_wifi < 40) {
    sintomas.push(SINTOMAS_UNIFICADOS.WEAK_WIFI)
  }

  if (valoresSintomas.conexion >= 30 && valoresSintomas.conexion < 70) {
    sintomas.push(SINTOMAS_UNIFICADOS.INTERMITTENT)
  }

  if (valoresSintomas.latencia_servidor > 2000) {
    sintomas.push(SINTOMAS_UNIFICADOS.SLOW_INTERNAL)
  }

  return sintomas
}
