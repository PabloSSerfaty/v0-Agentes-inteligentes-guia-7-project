/**
 * @file lib/rule-based-system.ts
 * @description Sistema experto basado en reglas para diagnóstico de problemas de red.
 * Implementación alineada con el árbol de decisión definido.
 */

import { ACCIONES_RECOMENDADAS, MAPEO_SINTOMAS_REGLAS, type DiagnosisResult } from "./constants"

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
  // Referencia al nodo del árbol de decisión que representa esta regla
  nodoArbolDecision?: string
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
  // Referencia al nodo del árbol de decisión
  nodoArbolDecision?: string
}

/**
 * Clase que implementa un sistema experto basado en reglas para diagnóstico de red.
 * Alineado con el árbol de decisión especificado.
 */
export class RuleBasedNetworkDiagnosticSystem {
  // Lista de reglas del sistema experto, alineadas con el árbol de decisión
  private reglas: Rule[] = [
    // Rama: No hay conexión a Internet
    {
      id: 1,
      condiciones: new Set(["sin_internet", "ping_falla"]),
      accion: "Reiniciar router",
      prioridad: 1,
      descripcion: "Si no hay conexión a Internet y el ping falla, entonces reiniciar el router",
      nodoArbolDecision: "reiniciar_router",
    },
    {
      id: 2,
      condiciones: new Set(["sin_internet", "config_ip_incorrecta"]),
      accion: "Revisar configuración IP",
      prioridad: 1,
      descripcion: "Si no hay conexión a Internet y la configuración IP es incorrecta, revisar configuración IP",
      nodoArbolDecision: "revisar_config_ip",
    },

    // Rama: Hay conexión pero es intermitente - WiFi
    {
      id: 3,
      condiciones: new Set(["intermitencia", "wifi"]),
      accion: "Default route",
      prioridad: 2,
      descripcion: "Si hay conexión intermitente y se usa WiFi, entonces verificar la ruta por defecto",
      nodoArbolDecision: "default_route",
    },

    // Rama: Hay conexión pero es intermitente - Cable
    {
      id: 4,
      condiciones: new Set(["intermitencia", "cable", "cable_danado"]),
      accion: "Cable dañado",
      prioridad: 2,
      descripcion: "Si hay conexión intermitente, se usa cable y está dañado, reemplazar el cable",
      nodoArbolDecision: "cable_danado",
    },

    // Rama: Hay conexión pero hay problemas - Servidor interno lento
    {
      id: 5,
      condiciones: new Set(["servidor_lento", "alto_uso_recursos"]),
      accion: "Controlar el proceso",
      prioridad: 3,
      descripcion: "Si el servidor interno está lento y hay alto uso de recursos, controlar los procesos",
      nodoArbolDecision: "controlar_procesos",
    },
    {
      id: 6,
      condiciones: new Set(["servidor_lento"]),
      accion: "Revisar estado general de red interna",
      prioridad: 3,
      descripcion: "Si el servidor interno está lento, revisar el estado general de la red interna",
      nodoArbolDecision: "revisar_estado_red",
    },

    // Rama: Hay conexión pero hay problemas - DNS
    {
      id: 7,
      condiciones: new Set(["dns", "problemas_dns"]),
      accion: "Cambiar servidor DNS",
      prioridad: 2,
      descripcion: "Si hay problemas con DNS, cambiar el servidor DNS",
      nodoArbolDecision: "cambiar_servidor_dns",
    },
    {
      id: 8,
      condiciones: new Set(["cable_isp", "problemas_isp"]),
      accion: "Revisar mantenimiento del ISP",
      prioridad: 2,
      descripcion: "Si hay problemas con el cable del ISP, revisar si hay mantenimiento programado",
      nodoArbolDecision: "revisar_mantenimiento",
    },

    // Reglas adicionales para cubrir otros escenarios del árbol
    {
      id: 9,
      condiciones: new Set(["sin_internet", "ping_ok"]),
      accion: "Revisar configuración DNS",
      prioridad: 2,
      descripcion: "Si no hay conexión a Internet pero el ping funciona, entonces hay un problema de configuración DNS",
    },
    {
      id: 10,
      condiciones: new Set(["wifi_debil"]),
      accion: "Cambiar canal WiFi",
      prioridad: 3,
      descripcion: "Si la señal WiFi es débil, entonces cambiar el canal WiFi",
    },
  ]

  // Síntomas adicionales que se pueden inferir basados en el árbol de decisión
  private inferirSintomasAdicionales(sintomas: Set<string>): Set<string> {
    const sintomasInferidos = new Set<string>(sintomas)

    // Inferencias basadas en el árbol de decisión
    if (sintomas.has("sin_internet")) {
      sintomasInferidos.add("paginas_no_cargan")
    }

    if (sintomas.has("wifi_debil")) {
      sintomasInferidos.add("wifi")
      sintomasInferidos.add("intermitencia")
    }

    if (sintomas.has("ping_perdida_paquetes")) {
      sintomasInferidos.add("intermitencia")
    }

    if (sintomas.has("error_dns")) {
      sintomasInferidos.add("dns")
      sintomasInferidos.add("problemas_dns")
    }

    // Inferencias adicionales basadas en el árbol
    if (sintomas.has("cable_danado")) {
      sintomasInferidos.add("cable")
      sintomasInferidos.add("intermitencia")
    }

    if (sintomas.has("alto_uso_recursos")) {
      sintomasInferidos.add("servidor_lento")
    }

    if (sintomas.has("problemas_isp")) {
      sintomasInferidos.add("cable_isp")
    }

    return sintomasInferidos
  }

  /**
   * Convierte los síntomas de la interfaz a síntomas del sistema basado en reglas.
   * Alineado con los nodos del árbol de decisión.
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

    // Añadir inferencias adicionales basadas en combinaciones de síntomas según el árbol
    if (sintomas.includes("Sin conexión a Internet") && sintomas.includes("Pérdida de paquetes")) {
      sintomasConvertidos.add("ping_falla")
    } else if (sintomas.includes("Sin conexión a Internet") && !sintomas.includes("Pérdida de paquetes")) {
      sintomasConvertidos.add("ping_ok")
    }

    if (sintomas.includes("Conexión intermitente") && sintomas.includes("Señal Wi-Fi débil")) {
      sintomasConvertidos.add("wifi")
    }

    if (sintomas.includes("Carga lenta de páginas") && sintomas.includes("Error de DNS")) {
      sintomasConvertidos.add("dns")
      sintomasConvertidos.add("problemas_dns")
    }

    return sintomasConvertidos
  }

  /**
   * Realiza el diagnóstico basado en los síntomas proporcionados.
   * Sigue la lógica del árbol de decisión para determinar las causas.
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

    // Inferir síntomas adicionales basados en el árbol de decisión
    const sintomasAmpliados = this.inferirSintomasAdicionales(sintomasConvertidos)

    // Encontrar reglas que coinciden exactamente (todos los síntomas de la regla están presentes)
    // Esto sigue la lógica de recorrer el árbol de decisión hasta llegar a una hoja
    const coincidenciasExactas = this.reglas
      .filter((regla) => Array.from(regla.condiciones).every((c) => sintomasAmpliados.has(c)))
      .sort((a, b) => a.prioridad - b.prioridad) // Ordenar por prioridad (menor número = mayor prioridad)

    // Encontrar reglas que coinciden parcialmente (al menos un síntoma de la regla está presente)
    // Esto permite manejar casos donde no se llega a una hoja específica del árbol
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

    // Añadir coincidencias exactas (siguiendo el camino exacto del árbol)
    for (const coincidencia of coincidenciasExactas) {
      if (!causasAñadidas.has(coincidencia.accion)) {
        // Buscar acciones recomendadas para esta acción
        let acciones = ACCIONES_RECOMENDADAS[coincidencia.accion] || []

        // Si no hay acciones predefinidas, crear algunas basadas en la acción
        if (acciones.length === 0) {
          switch (coincidencia.accion) {
            case "Reiniciar router":
              acciones = [
                "Apagar el router durante 30 segundos",
                "Encender el router y esperar a que se inicialice",
                "Verificar si se restablece la conexión",
              ]
              break
            case "Revisar configuración IP":
              acciones = [
                "Verificar que la configuración IP sea correcta",
                "Comprobar que el DHCP esté habilitado o la IP estática sea válida",
                "Verificar la máscara de subred y la puerta de enlace",
              ]
              break
            case "Default route":
              acciones = [
                "Verificar la configuración de la ruta por defecto",
                "Comprobar la tabla de enrutamiento",
                "Revisar la configuración del gateway",
              ]
              break
            case "Cable dañado":
              acciones = [
                "Inspeccionar visualmente el cable en busca de daños",
                "Reemplazar el cable de red",
                "Verificar los conectores RJ45",
              ]
              break
            case "Controlar el proceso":
              acciones = [
                "Identificar los procesos que consumen más recursos",
                "Limitar o detener procesos problemáticos",
                "Optimizar la configuración del servidor",
              ]
              break
            case "Revisar estado general de red interna":
              acciones = [
                "Verificar el estado de los switches y routers internos",
                "Comprobar la carga de la red",
                "Revisar la configuración de QoS",
              ]
              break
            case "Cambiar servidor DNS":
              acciones = [
                "Configurar servidores DNS alternativos (8.8.8.8, 1.1.1.1)",
                "Limpiar la caché DNS",
                "Verificar que los nuevos servidores DNS funcionen correctamente",
              ]
              break
            case "Revisar mantenimiento del ISP":
              acciones = [
                "Contactar al proveedor de servicios",
                "Verificar si hay mantenimientos programados",
                "Consultar el estado del servicio en la página del ISP",
              ]
              break
            default:
              acciones = ["Realizar diagnóstico adicional", "Contactar al soporte técnico"]
          }
        }

        resultado.causas.push({
          causa: coincidencia.accion,
          acciones: acciones,
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
          nodoArbolDecision: coincidencia.nodoArbolDecision,
        })
      }
    }

    // Añadir coincidencias parciales (para casos donde no se sigue un camino completo)
    for (const coincidencia of coincidenciasParciales) {
      if (!causasAñadidas.has(coincidencia.accion)) {
        // Buscar acciones recomendadas para esta acción
        let acciones = ACCIONES_RECOMENDADAS[coincidencia.accion] || []

        // Si no hay acciones predefinidas, crear algunas basadas en la acción
        if (acciones.length === 0) {
          switch (coincidencia.accion) {
            case "Reiniciar router":
              acciones = [
                "Apagar el router durante 30 segundos",
                "Encender el router y esperar a que se inicialice",
                "Verificar si se restablece la conexión",
              ]
              break
            case "Revisar configuración IP":
              acciones = [
                "Verificar que la configuración IP sea correcta",
                "Comprobar que el DHCP esté habilitado o la IP estática sea válida",
                "Verificar la máscara de subred y la puerta de enlace",
              ]
              break
            case "Default route":
              acciones = [
                "Verificar la configuración de la ruta por defecto",
                "Comprobar la tabla de enrutamiento",
                "Revisar la configuración del gateway",
              ]
              break
            case "Cable dañado":
              acciones = [
                "Inspeccionar visualmente el cable en busca de daños",
                "Reemplazar el cable de red",
                "Verificar los conectores RJ45",
              ]
              break
            case "Controlar el proceso":
              acciones = [
                "Identificar los procesos que consumen más recursos",
                "Limitar o detener procesos problemáticos",
                "Optimizar la configuración del servidor",
              ]
              break
            case "Revisar estado general de red interna":
              acciones = [
                "Verificar el estado de los switches y routers internos",
                "Comprobar la carga de la red",
                "Revisar la configuración de QoS",
              ]
              break
            case "Cambiar servidor DNS":
              acciones = [
                "Configurar servidores DNS alternativos (8.8.8.8, 1.1.1.1)",
                "Limpiar la caché DNS",
                "Verificar que los nuevos servidores DNS funcionen correctamente",
              ]
              break
            case "Revisar mantenimiento del ISP":
              acciones = [
                "Contactar al proveedor de servicios",
                "Verificar si hay mantenimientos programados",
                "Consultar el estado del servicio en la página del ISP",
              ]
              break
            default:
              acciones = ["Realizar diagnóstico adicional", "Contactar al soporte técnico"]
          }
        }

        resultado.causas.push({
          causa: coincidencia.accion,
          acciones: acciones,
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
          nodoArbolDecision: coincidencia.nodoArbolDecision,
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
