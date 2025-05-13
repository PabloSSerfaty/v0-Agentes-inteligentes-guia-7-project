/**
 * @file lib/rule-based-system.ts
 * @description Sistema experto basado en reglas simplificado para diagnóstico de problemas de red.
 */

import { CAUSAS_UNIFICADAS, ACCIONES_RECOMENDADAS, MAPEO_SINTOMAS_REGLAS, type DiagnosisResult } from "./constants"

// Definición de tipos para el sistema basado en reglas
type Condition = string
type Action = string
type Priority = number

export interface Rule {
  id: number
  condiciones: Set<Condition>
  accion: Action
  prioridad: Priority
  descripcion?: string
}

export interface AppliedRule {
  id: number
  condiciones: string[]
  accion: string
  prioridad: number
  descripcion: string
  coincidenciaExacta: boolean
  condicionesCoincidentes: string[]
  condicionesFaltantes: string[]
}

/**
 * Clase que implementa un sistema experto basado en reglas para diagnóstico de red.
 * Versión simplificada que elimina los grados de confianza.
 */
export class RuleBasedNetworkDiagnosticSystem {
  // Lista de reglas del sistema experto
  private reglas: Rule[] = [
    {
      id: 1,
      condiciones: new Set(["sin_internet", "ping_falla"]),
      accion: CAUSAS_UNIFICADAS.ROUTER_FAILURE,
      prioridad: 1,
      descripcion: "Si no hay conexión a Internet y el ping falla, entonces hay un problema con el router",
    },
    {
      id: 2,
      condiciones: new Set(["sin_internet", "ping_ok"]),
      accion: CAUSAS_UNIFICADAS.DNS_CONFIG,
      prioridad: 2,
      descripcion: "Si no hay conexión a Internet pero el ping funciona, entonces hay un problema de configuración DNS",
    },
    {
      id: 3,
      condiciones: new Set(["intermitencia", "wifi"]),
      accion: CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
      prioridad: 3,
      descripcion: "Si hay conexión intermitente y se usa WiFi, entonces hay interferencia WiFi",
    },
    {
      id: 4,
      condiciones: new Set(["intermitencia", "cable"]),
      accion: CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
      prioridad: 3,
      descripcion: "Si hay conexión intermitente y se usa cable, entonces hay un problema de hardware de red",
    },
    {
      id: 5,
      condiciones: new Set(["cable_danado"]),
      accion: CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
      prioridad: 2,
      descripcion: "Si hay cables dañados, entonces hay un problema de hardware de red",
    },
    {
      id: 6,
      condiciones: new Set(["paginas_no_cargan", "error_dns"]),
      accion: CAUSAS_UNIFICADAS.DNS_CONFIG,
      prioridad: 1,
      descripcion: "Si las páginas no cargan y hay errores DNS, entonces hay un problema de configuración DNS",
    },
    {
      id: 7,
      condiciones: new Set(["lento_subir_archivos"]),
      accion: CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
      prioridad: 4,
      descripcion: "Si es lento subir archivos, entonces hay congestión de red",
    },
    {
      id: 8,
      condiciones: new Set(["servidor_lento"]),
      accion: CAUSAS_UNIFICADAS.SERVER_OVERLOAD,
      prioridad: 3,
      descripcion: "Si el servidor está lento, entonces hay sobrecarga del servidor",
    },
    {
      id: 9,
      condiciones: new Set(["ping_perdida_paquetes"]),
      accion: CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
      prioridad: 2,
      descripcion: "Si hay pérdida de paquetes en el ping, entonces hay un problema de hardware de red",
    },
    {
      id: 10,
      condiciones: new Set(["multiples_usuarios_afectados"]),
      accion: CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE,
      prioridad: 1,
      descripcion: "Si múltiples usuarios están afectados, entonces hay un fallo en la infraestructura",
    },
    {
      id: 11,
      condiciones: new Set(["wifi_debil"]),
      accion: CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
      prioridad: 3,
      descripcion: "Si la señal WiFi es débil, entonces hay interferencia WiFi",
    },
    {
      id: 12,
      condiciones: new Set(["mantenimiento_isp", "problemas_persisten"]),
      accion: CAUSAS_UNIFICADAS.ISP_PROBLEMS,
      prioridad: 4,
      descripcion: "Si hay mantenimiento del ISP y los problemas persisten, entonces hay problemas con el ISP",
    },
    // Regla específica para error DNS
    {
      id: 13,
      condiciones: new Set(["error_dns"]),
      accion: CAUSAS_UNIFICADAS.DNS_CONFIG,
      prioridad: 1,
      descripcion: "Si hay errores DNS, entonces hay un problema de configuración DNS",
    },
  ]

  // Síntomas adicionales que se pueden inferir
  private inferirSintomasAdicionales(sintomas: Set<string>): Set<string> {
    const sintomasInferidos = new Set<string>(sintomas)

    if (sintomas.has("sin_internet")) {
      sintomasInferidos.add("paginas_no_cargan")
    }

    if (sintomas.has("wifi_debil")) {
      sintomasInferidos.add("wifi")
    }

    if (sintomas.has("ping_perdida_paquetes")) {
      sintomasInferidos.add("intermitencia")
    }

    if (sintomas.has("error_dns")) {
      sintomasInferidos.add("paginas_no_cargan")
      sintomasInferidos.add("config_incorrecta")
    }

    return sintomasInferidos
  }

  /**
   * Convierte los síntomas de la interfaz a síntomas del sistema basado en reglas.
   *
   * @param sintomas - Síntomas seleccionados en la interfaz
   * @returns Conjunto de síntomas para el sistema basado en reglas
   */
  public convertirSintomas(sintomas: string[]): Set<string> {
    const sintomasConvertidos = new Set<string>()

    for (const sintoma of sintomas) {
      const sintomaConvertido = MAPEO_SINTOMAS_REGLAS[sintoma]
      if (sintomaConvertido) {
        sintomasConvertidos.add(sintomaConvertido)
      }
    }

    // Añadir inferencias adicionales basadas en combinaciones de síntomas
    if (sintomas.includes("Sin conexión a Internet") && sintomas.includes("Pérdida de paquetes")) {
      sintomasConvertidos.add("ping_falla")
    } else if (sintomas.includes("Sin conexión a Internet") && !sintomas.includes("Pérdida de paquetes")) {
      sintomasConvertidos.add("ping_ok")
    }

    if (sintomas.includes("Conexión intermitente") && sintomas.includes("Señal Wi-Fi débil")) {
      sintomasConvertidos.add("wifi")
    }

    return sintomasConvertidos
  }

  /**
   * Realiza el diagnóstico basado en los síntomas proporcionados.
   *
   * @param sintomas - Síntomas seleccionados por el usuario
   * @returns Resultado del diagnóstico con causas y recomendaciones
   */
  public diagnose(sintomas: string[]): DiagnosisResult {
    // Convertir síntomas de la interfaz a síntomas del sistema basado en reglas
    const sintomasConvertidos = this.convertirSintomas(sintomas)

    // Si no hay síntomas válidos, devolver un diagnóstico genérico
    if (sintomasConvertidos.size === 0) {
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

    // Inferir síntomas adicionales
    const sintomasAmpliados = this.inferirSintomasAdicionales(sintomasConvertidos)

    // Encontrar reglas que coinciden exactamente (todos los síntomas de la regla están presentes)
    const coincidenciasExactas = this.reglas
      .filter((regla) => Array.from(regla.condiciones).every((c) => sintomasAmpliados.has(c)))
      .sort((a, b) => a.prioridad - b.prioridad) // Ordenar por prioridad (menor número = mayor prioridad)

    // Encontrar reglas que coinciden parcialmente (al menos un síntoma de la regla está presente)
    const coincidenciasParciales = this.reglas
      .filter(
        (regla) =>
          !coincidenciasExactas.includes(regla) && // No incluir las que ya están en coincidencias exactas
          Array.from(regla.condiciones).some((c) => sintomasAmpliados.has(c)),
      )
      .sort((a, b) => a.prioridad - b.prioridad)

    // Preparar el resultado
    const resultado: DiagnosisResult & { reglasAplicadas?: AppliedRule[] } = {
      causas: [],
      reglasAplicadas: [],
    }

    // Conjunto para rastrear causas ya añadidas
    const causasAñadidas = new Set<string>()

    // Añadir coincidencias exactas
    for (const coincidencia of coincidenciasExactas) {
      if (!causasAñadidas.has(coincidencia.accion)) {
        resultado.causas.push({
          causa: coincidencia.accion,
          acciones: ACCIONES_RECOMENDADAS[coincidencia.accion] || [],
        })
        causasAñadidas.add(coincidencia.accion)

        // Añadir información sobre la regla aplicada
        const condicionesArray = Array.from(coincidencia.condiciones)
        resultado.reglasAplicadas?.push({
          id: coincidencia.id,
          condiciones: condicionesArray,
          accion: coincidencia.accion,
          prioridad: coincidencia.prioridad,
          descripcion: coincidencia.descripcion || `Regla #${coincidencia.id}`,
          coincidenciaExacta: true,
          condicionesCoincidentes: condicionesArray,
          condicionesFaltantes: [],
        })
      }
    }

    // Añadir coincidencias parciales
    for (const coincidencia of coincidenciasParciales) {
      if (!causasAñadidas.has(coincidencia.accion)) {
        resultado.causas.push({
          causa: coincidencia.accion,
          acciones: ACCIONES_RECOMENDADAS[coincidencia.accion] || [],
        })
        causasAñadidas.add(coincidencia.accion)

        // Añadir información sobre la regla aplicada
        const condicionesArray = Array.from(coincidencia.condiciones)
        const condicionesCoincidentes = condicionesArray.filter((c) => sintomasAmpliados.has(c))
        const condicionesFaltantes = condicionesArray.filter((c) => !sintomasAmpliados.has(c))

        resultado.reglasAplicadas?.push({
          id: coincidencia.id,
          condiciones: condicionesArray,
          accion: coincidencia.accion,
          prioridad: coincidencia.prioridad,
          descripcion: coincidencia.descripcion || `Regla #${coincidencia.id}`,
          coincidenciaExacta: false,
          condicionesCoincidentes,
          condicionesFaltantes,
        })
      }
    }

    // Si no hay coincidencias, añadir un diagnóstico genérico
    if (resultado.causas.length === 0) {
      resultado.causas.push({
        causa: "Problema no identificado",
        acciones: [
          "Reiniciar todos los equipos de red",
          "Verificar conexiones físicas",
          "Realizar pruebas de conectividad básicas",
          "Contactar al soporte técnico para un diagnóstico más detallado",
        ],
      })
    }

    return resultado
  }
}
