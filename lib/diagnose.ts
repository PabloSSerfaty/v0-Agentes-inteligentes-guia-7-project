/**
 * @file lib/diagnose.ts
 * @description Funciones para realizar diagnósticos de problemas de red.
 * Este archivo actúa como intermediario entre la interfaz de usuario y los sistemas expertos.
 */

import { NetworkDiagnosticSystem } from "./expert-system"
import { FuzzyNetworkDiagnosticSystem } from "./fuzzy-system"
import { RuleBasedNetworkDiagnosticSystem } from "./rule-based-system"

/**
 * Mapeo de síntomas de la interfaz a síntomas del sistema experto.
 * Esto permite que la interfaz use nombres de síntomas más amigables para el usuario
 * mientras el sistema experto usa nombres más técnicos.
 */
const symptomMapping: Record<string, string> = {
  "Sin conexión a Internet": "Sin conexión a Internet",
  "Pérdida de paquetes": "Pérdida de paquetes",
  "Error de DNS": "Errores de DNS",
  "Carga lenta de páginas": "Carga lenta de páginas",
  "Señal Wi-Fi débil": "Señal Wi-Fi débil",
  "Conexión intermitente": "Conexión intermitente",
  "Lentitud al acceder al servidor interno": "Lentitud en acceso a red interna",
}

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
): Promise<any> {
  // Simular un retraso para dar sensación de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Realizar el diagnóstico según el tipo de sistema seleccionado
  if (systemType === "fuzzy") {
    // Usar el sistema experto basado en lógica difusa
    const inputs = fuzzySystem.convertirSintomasAEntradas(sintomas)
    return fuzzySystem.diagnose(inputs)
  } else if (systemType === "rule-based") {
    // Usar el sistema experto basado en reglas
    return ruleBasedSystem.diagnose(sintomas)
  } else {
    // Usar el sistema experto bayesiano (por defecto)
    const mappedSymptoms = sintomas.map((s) => symptomMapping[s] || s)
    return expertSystem.diagnose(mappedSymptoms)
  }
}
