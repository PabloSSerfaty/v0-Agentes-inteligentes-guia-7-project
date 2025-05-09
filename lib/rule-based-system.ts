/**
 * @file lib/rule-based-system.ts
 * @description Sistema experto basado en reglas para diagnóstico de problemas de red.
 * Adaptado del código Python original a TypeScript.
 */

// Definición de tipos para el sistema basado en reglas
type Condition = string
type Action = string
type Priority = number

interface Rule {
  id: number
  condiciones: Set<Condition>
  accion: Action
  prioridad: Priority
}

interface RuleMatch {
  accion: string
  prioridad: number
  tipo: "exacta" | "parcial"
}

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
 * Clase que implementa un sistema experto basado en reglas para diagnóstico de red.
 * Esta implementación es una adaptación del sistema original en Python.
 */
export class RuleBasedNetworkDiagnosticSystem {
  // Lista de reglas del sistema experto
  private reglas: Rule[] = [
    { id: 1, condiciones: new Set(["sin_internet", "ping_falla"]), accion: "Falla en el router o ISP", prioridad: 1 },
    {
      id: 2,
      condiciones: new Set(["sin_internet", "ping_ok"]),
      accion: "Configuración incorrecta de red",
      prioridad: 2,
    },
    { id: 3, condiciones: new Set(["intermitencia", "wifi"]), accion: "Interferencia en señal Wi-Fi", prioridad: 3 },
    { id: 4, condiciones: new Set(["intermitencia", "cable"]), accion: "Problemas de cableado", prioridad: 3 },
    { id: 5, condiciones: new Set(["cable_danado"]), accion: "Hardware de red defectuoso", prioridad: 2 },
    {
      id: 6,
      condiciones: new Set(["paginas_no_cargan", "error_dns"]),
      accion: "Configuración incorrecta de DNS",
      prioridad: 2,
    },
    { id: 7, condiciones: new Set(["lento_subir_archivos"]), accion: "Congestión de red", prioridad: 4 },
    { id: 8, condiciones: new Set(["servidor_lento"]), accion: "Sobrecarga del servidor interno", prioridad: 3 },
    { id: 9, condiciones: new Set(["ping_perdida_paquetes"]), accion: "Pérdida de paquetes", prioridad: 2 },
    {
      id: 10,
      condiciones: new Set(["multiples_usuarios_afectados"]),
      accion: "Fallo en infraestructura central",
      prioridad: 1,
    },
    { id: 11, condiciones: new Set(["wifi_debil"]), accion: "Señal Wi-Fi débil", prioridad: 3 },
    {
      id: 12,
      condiciones: new Set(["mantenimiento_isp", "problemas_persisten"]),
      accion: "Problemas persistentes con ISP",
      prioridad: 4,
    },
  ]

  // Acciones recomendadas para cada causa
  private recomendaciones: Record<string, string[]> = {
    "Falla en el router o ISP": [
      "Reiniciar el router",
      "Verificar los indicadores LED del router",
      "Contactar al proveedor de servicios",
      "Verificar el estado de servicio en la página del ISP",
      "Comprobar la conexión física con el ISP",
    ],
    "Configuración incorrecta de red": [
      "Verificar la configuración IP del equipo",
      "Comprobar la configuración de DNS",
      "Revisar la configuración de proxy",
      "Verificar la configuración de firewall",
      "Restaurar la configuración de red a valores predeterminados",
    ],
    "Interferencia en señal Wi-Fi": [
      "Cambiar el canal de Wi-Fi",
      "Reubicar el router",
      "Instalar repetidores Wi-Fi",
      "Reducir interferencias (microondas, teléfonos inalámbricos)",
      "Considerar usar la banda de 5GHz si está disponible",
    ],
    "Problemas de cableado": [
      "Inspeccionar visualmente los cables y conectores",
      "Reemplazar cables sospechosos",
      "Verificar que los cables estén correctamente conectados",
      "Comprobar que no haya cables doblados o aplastados",
      "Utilizar un tester de cables para verificar la continuidad",
    ],
    "Hardware de red defectuoso": [
      "Reemplazar cables dañados",
      "Verificar el funcionamiento de los switches",
      "Comprobar las tarjetas de red de los equipos",
      "Reemplazar conectores RJ45 dañados",
      "Verificar el funcionamiento de los puertos de red",
    ],
    "Configuración incorrecta de DNS": [
      "Verificar servidores DNS configurados",
      "Configurar DNS alternativos (8.8.8.8, 1.1.1.1)",
      "Revisar configuración DHCP",
      "Limpiar caché DNS en los equipos",
      "Comprobar que el servidor DNS responde correctamente",
    ],
    "Congestión de red": [
      "Revisar y optimizar el uso de ancho de banda",
      "Implementar QoS para priorizar tráfico",
      "Verificar si hay dispositivos consumiendo excesivo ancho de banda",
      "Programar transferencias grandes para horas de menor uso",
      "Considerar aumentar el ancho de banda contratado",
    ],
    "Sobrecarga del servidor interno": [
      "Reiniciar el servidor",
      "Verificar el uso de recursos (CPU, memoria)",
      "Revisar los procesos en ejecución",
      "Optimizar aplicaciones con alto consumo",
      "Considerar actualizar el hardware del servidor",
    ],
    "Pérdida de paquetes": [
      "Verificar interferencias o saturación de red",
      "Comprobar la calidad de la conexión física",
      "Revisar la configuración de los equipos de red",
      "Realizar pruebas de ping extendidas para monitorear la pérdida",
      "Identificar patrones de pérdida (horarios, aplicaciones)",
    ],
    "Fallo en infraestructura central": [
      "Revisar estado del router o switch central",
      "Verificar el funcionamiento de los equipos principales",
      "Comprobar la alimentación eléctrica de los dispositivos",
      "Revisar logs de errores en los equipos centrales",
      "Considerar redundancia para puntos críticos",
    ],
    "Señal Wi-Fi débil": [
      "Instalar repetidor o reubicar el router",
      "Verificar obstáculos físicos entre el router y los dispositivos",
      "Actualizar firmware del router",
      "Considerar un router con mayor potencia",
      "Realizar un análisis de cobertura Wi-Fi",
    ],
    "Problemas persistentes con ISP": [
      "Contactar al ISP para confirmar estabilidad",
      "Solicitar revisión técnica de la línea",
      "Documentar los problemas (fechas, horas, síntomas)",
      "Verificar si hay trabajos de mantenimiento programados",
      "Considerar cambiar de proveedor si los problemas persisten",
    ],
  }

  // Mapeo de síntomas de la interfaz a síntomas del sistema basado en reglas
  private symptomMapping: Record<string, string> = {
    "Sin conexión a Internet": "sin_internet",
    "Pérdida de paquetes": "ping_perdida_paquetes",
    "Error de DNS": "error_dns",
    "Carga lenta de páginas": "paginas_no_cargan",
    "Señal Wi-Fi débil": "wifi_debil",
    "Conexión intermitente": "intermitencia",
    "Lentitud al acceder al servidor interno": "servidor_lento",
  }

  // Síntomas adicionales que se pueden inferir
  private inferirSintomasAdicionales(sintomas: Set<string>): Set<string> {
    const sintomasInferidos = new Set<string>(sintomas)

    if (sintomas.has("sin_internet")) {
      // Si no hay internet, podemos inferir que las páginas no cargan
      sintomasInferidos.add("paginas_no_cargan")
    }

    if (sintomas.has("wifi_debil")) {
      // Si la señal WiFi es débil, podemos inferir que se usa WiFi
      sintomasInferidos.add("wifi")
    }

    if (sintomas.has("ping_perdida_paquetes")) {
      // Si hay pérdida de paquetes, puede haber intermitencia
      sintomasInferidos.add("intermitencia")
    }

    if (sintomas.has("error_dns")) {
      // Si hay errores de DNS, las páginas pueden no cargar correctamente
      sintomasInferidos.add("paginas_no_cargan")
    }

    return sintomasInferidos
  }

  /**
   * Motor de inferencia que encuentra coincidencias exactas y parciales
   * entre los síntomas del usuario y las reglas del sistema.
   *
   * @param sintomas - Conjunto de síntomas del usuario
   * @returns Pares de coincidencias exactas y parciales
   */
  private motorInferencia(sintomas: Set<string>): [RuleMatch[], RuleMatch[]] {
    const coincidenciasExactas: RuleMatch[] = []
    const coincidenciasParciales: RuleMatch[] = []

    // Inferir síntomas adicionales basados en los síntomas proporcionados
    const sintomasAmpliados = this.inferirSintomasAdicionales(sintomas)

    for (const regla of this.reglas) {
      const condiciones = regla.condiciones

      // Verificar coincidencia exacta (todos los síntomas de la regla están presentes)
      if (Array.from(condiciones).every((c) => sintomasAmpliados.has(c))) {
        coincidenciasExactas.push({
          accion: regla.accion,
          prioridad: regla.prioridad,
          tipo: "exacta",
        })
      }
      // Verificar coincidencia parcial (al menos un síntoma de la regla está presente)
      else if (Array.from(condiciones).some((c) => sintomasAmpliados.has(c))) {
        coincidenciasParciales.push({
          accion: regla.accion,
          prioridad: regla.prioridad + 2, // Reducir prioridad para coincidencias parciales
          tipo: "parcial",
        })
      }
    }

    // Ordenar por prioridad (menor número = mayor prioridad)
    coincidenciasExactas.sort((a, b) => a.prioridad - b.prioridad)
    coincidenciasParciales.sort((a, b) => a.prioridad - b.prioridad)

    return [coincidenciasExactas, coincidenciasParciales]
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
      const sintomaConvertido = this.symptomMapping[sintoma]
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

    // Ejecutar el motor de inferencia
    const [coincidenciasExactas, coincidenciasParciales] = this.motorInferencia(sintomasConvertidos)

    // Preparar el resultado
    const resultado: DiagnosisResult = {
      causas: [],
    }

    // Añadir coincidencias exactas con alta confianza
    for (const coincidencia of coincidenciasExactas) {
      resultado.causas.push({
        causa: coincidencia.accion,
        confianza: this.calcularConfianza(coincidencia.prioridad, "exacta"),
        acciones: this.recomendaciones[coincidencia.accion] || [],
      })
    }

    // Añadir coincidencias parciales con menor confianza
    for (const coincidencia of coincidenciasParciales) {
      // Evitar duplicados (si ya existe una coincidencia exacta para esta acción)
      if (!resultado.causas.some((c) => c.causa === coincidencia.accion)) {
        resultado.causas.push({
          causa: coincidencia.accion,
          confianza: this.calcularConfianza(coincidencia.prioridad, "parcial"),
          acciones: this.recomendaciones[coincidencia.accion] || [],
        })
      }
    }

    // Si no hay coincidencias, añadir un diagnóstico genérico
    if (resultado.causas.length === 0) {
      resultado.causas.push({
        causa: "Problema no identificado",
        confianza: 50,
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

  /**
   * Calcula el nivel de confianza basado en la prioridad y el tipo de coincidencia.
   *
   * @param prioridad - Prioridad de la regla (1-6, donde 1 es la más alta)
   * @param tipo - Tipo de coincidencia (exacta o parcial)
   * @returns Nivel de confianza como porcentaje (0-100)
   */
  private calcularConfianza(prioridad: number, tipo: "exacta" | "parcial"): number {
    // Base de confianza según prioridad (invertida: menor prioridad numérica = mayor confianza)
    const baseConfianza = 100 - (prioridad - 1) * 15

    // Ajustar según tipo de coincidencia
    if (tipo === "parcial") {
      return Math.max(30, baseConfianza - 30) // Las coincidencias parciales tienen menor confianza
    }

    return Math.max(50, baseConfianza) // Asegurar un mínimo de 50% para coincidencias exactas
  }
}
