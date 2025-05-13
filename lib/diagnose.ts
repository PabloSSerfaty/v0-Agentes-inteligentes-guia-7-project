/**
 * @file lib/diagnose.ts
 * @description Funciones para realizar diagnósticos de problemas de red.
 * Este archivo actúa como intermediario entre la interfaz de usuario y los sistemas expertos.
 */

import { NetworkDiagnosticSystem } from "./expert-system"
import { FuzzyNetworkDiagnosticSystem } from "./fuzzy-system"
import { RuleBasedNetworkDiagnosticSystem } from "./rule-based-system"
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
 * Realiza un diagnóstico de problemas de red basado en los síntomas proporcionados.
 *
 * @param sintomas - Array de síntomas seleccionados por el usuario
 * @param systemType - Tipo de sistema experto a utilizar (bayesiano, difuso o basado en reglas)
 * @returns Promesa que resuelve al resultado del diagnóstico
 */
export async function diagnosticarProblemasDeRed(
  sintomas: string[],
  systemType: ExpertSystemType = "bayesian",
): Promise<DiagnosisResult> {
  // Simular un retraso para dar sensación de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Realizar el diagnóstico según el tipo de sistema seleccionado
  let resultado: DiagnosisResult

  if (systemType === "fuzzy") {
    // Usar el sistema experto basado en lógica difusa
    const inputs = fuzzySystem.convertirSintomasAEntradas(sintomas)
    resultado = fuzzySystem.diagnose(inputs)
  } else if (systemType === "rule-based") {
    // Usar el sistema experto basado en reglas
    resultado = ruleBasedSystem.diagnose(sintomas)
  } else {
    // Usar el sistema experto bayesiano (por defecto)
    resultado = expertSystem.diagnose(sintomas)
  }

  // Aplicar post-procesamiento para mejorar la coherencia
  if (sintomas.includes(SINTOMAS_UNIFICADOS.DNS_ERROR)) {
    // Asegurar que para Error de DNS, la configuración de DNS siempre esté entre las primeras causas
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
      })
    }
  }

  return resultado
}
