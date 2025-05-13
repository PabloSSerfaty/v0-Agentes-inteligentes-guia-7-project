/**
 * @file lib/expert-system.ts
 * @description Implementación simplificada del sistema experto de diagnóstico de red basado en inferencia bayesiana.
 */

import {
  CAUSAS_UNIFICADAS,
  ACCIONES_RECOMENDADAS,
  MAPEO_SINTOMA_CAUSA,
  type DiagnosisResult,
  SINTOMAS_UNIFICADOS,
} from "./constants"

/**
 * Clase que implementa el sistema experto de diagnóstico de red.
 * Versión simplificada que elimina los grados de confianza.
 */
export class NetworkDiagnosticSystem {
  /**
   * Realiza el diagnóstico en base a los síntomas observados.
   * Devuelve las causas más probables con sus acciones recomendadas.
   *
   * @param observedSymptoms - Los síntomas observados
   * @returns El resultado del diagnóstico
   */
  public diagnose(observedSymptoms: string[]): DiagnosisResult {
    // Si no hay síntomas válidos, devolver un diagnóstico genérico
    if (observedSymptoms.length === 0) {
      return {
        causas: [
          {
            causa: "Problema general de red",
            acciones: [
              "Reiniciar todos los equipos de red",
              "Verificar conexiones físicas",
              "Contactar al soporte técnico",
            ],
          },
        ],
      }
    }

    // Conjunto para almacenar causas únicas
    const causasUnicas = new Set<string>()

    // Para cada síntoma, añadir sus causas más probables
    for (const sintoma of observedSymptoms) {
      const causasProbables = MAPEO_SINTOMA_CAUSA[sintoma] || []
      causasProbables.forEach((causa) => causasUnicas.add(causa))
    }

    // Priorizar causas que aparecen en múltiples síntomas
    const contadorCausas = new Map<string, number>()

    for (const sintoma of observedSymptoms) {
      const causasProbables = MAPEO_SINTOMA_CAUSA[sintoma] || []
      causasProbables.forEach((causa) => {
        contadorCausas.set(causa, (contadorCausas.get(causa) || 0) + 1)
      })
    }

    // Convertir a array y ordenar por frecuencia
    const causasOrdenadas = Array.from(causasUnicas).sort((a, b) => {
      // Primero ordenar por frecuencia
      const freqDiff = (contadorCausas.get(b) || 0) - (contadorCausas.get(a) || 0)
      if (freqDiff !== 0) return freqDiff

      // Si tienen la misma frecuencia, priorizar según el primer síntoma
      if (observedSymptoms.length > 0) {
        const primerSintoma = observedSymptoms[0]
        const causasPrimerSintoma = MAPEO_SINTOMA_CAUSA[primerSintoma] || []
        const indexA = causasPrimerSintoma.indexOf(a)
        const indexB = causasPrimerSintoma.indexOf(b)

        // Si ambas causas están en la lista del primer síntoma
        if (indexA >= 0 && indexB >= 0) {
          return indexA - indexB
        }
        // Si solo una está en la lista, priorizarla
        if (indexA >= 0) return -1
        if (indexB >= 0) return 1
      }

      return 0
    })

    // Caso especial para Error de DNS
    if (observedSymptoms.includes(SINTOMAS_UNIFICADOS.DNS_ERROR)) {
      // Asegurar que Configuración incorrecta de DNS esté al principio
      const dnsConfigIndex = causasOrdenadas.indexOf(CAUSAS_UNIFICADAS.DNS_CONFIG)
      if (dnsConfigIndex > 0) {
        // Mover al principio
        causasOrdenadas.splice(dnsConfigIndex, 1)
        causasOrdenadas.unshift(CAUSAS_UNIFICADAS.DNS_CONFIG)
      }
    }

    // Preparar resultado con diagnóstico y recomendaciones
    const result: DiagnosisResult = {
      causas: [],
    }

    // Agregar causas con sus acciones recomendadas
    for (const causa of causasOrdenadas) {
      result.causas.push({
        causa: causa,
        acciones: ACCIONES_RECOMENDADAS[causa] || [],
      })
    }

    return result
  }
}
