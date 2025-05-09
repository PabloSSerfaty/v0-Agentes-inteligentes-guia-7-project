/**
 * @file lib/fuzzy-system.ts
 * @description Sistema experto basado en lógica difusa para diagnóstico de problemas de red.
 * Adaptado del código Python original a TypeScript.
 */

// Definición de tipos para el sistema difuso
type FuzzyValue = number
type FuzzyOutput = Record<string, number>

interface FuzzyInputs {
  velocidad: FuzzyValue
  estabilidad: FuzzyValue
  intensidad_wifi: FuzzyValue
  latencia: FuzzyValue
  acceso: FuzzyValue
}

interface FuzzyResult {
  causas: {
    causa: string
    confianza: number
    acciones: string[]
  }[]
}

/**
 * Clase que implementa un sistema experto basado en lógica difusa para diagnóstico de red.
 * Esta implementación es una versión simplificada del sistema original en Python,
 * adaptada para JavaScript/TypeScript.
 */
export class FuzzyNetworkDiagnosticSystem {
  // Mapeo de nombres de causas para la interfaz
  private causaLabels: Record<string, string> = {
    congestion: "Congestión de red",
    fallo_router: "Fallo en el router",
    interferencia: "Interferencia en señal Wi-Fi",
    config_incorrecta: "Configuración incorrecta",
    fallo_infraestructura: "Fallo en la infraestructura",
  }

  // Acciones recomendadas para cada causa
  private recomendaciones: Record<string, string[]> = {
    congestion: [
      "Revisar y optimizar el uso de ancho de banda",
      "Implementar QoS (Calidad de Servicio) para priorizar tráfico",
      "Considerar actualizar la capacidad de la red",
      "Verificar si hay dispositivos consumiendo excesivo ancho de banda",
      "Programar transferencias grandes para horas de menor uso",
    ],
    fallo_router: [
      "Reiniciar el router principal",
      "Verificar la configuración del router",
      "Considerar reemplazar el router si es antiguo",
      "Actualizar el firmware del router",
      "Comprobar si hay sobrecalentamiento del dispositivo",
    ],
    interferencia: [
      "Reubicar dispositivos inalámbricos",
      "Cambiar el canal WiFi",
      "Instalar repetidores WiFi en áreas con señal débil",
      "Alejar el router de otros dispositivos electrónicos",
      "Considerar usar la banda de 5GHz si está disponible",
    ],
    config_incorrecta: [
      "Verificar la configuración de IP y DNS",
      "Revisar la configuración de VLANs y subredes",
      "Comprobar reglas de firewall",
      "Verificar la configuración DHCP",
      "Revisar la configuración de enrutamiento",
    ],
    fallo_infraestructura: [
      "Revisar cables y conexiones físicas",
      "Comprobar puntos de acceso y switches",
      "Realizar pruebas de continuidad en cables sospechosos",
      "Verificar el funcionamiento de los equipos de red",
      "Comprobar si hay daños físicos en la infraestructura",
    ],
  }

  /**
   * Función de membresía trapezoidal simplificada.
   *
   * @param x - Valor a evaluar
   * @param a - Primer punto del trapecio
   * @param b - Segundo punto del trapecio
   * @param c - Tercer punto del trapecio
   * @param d - Cuarto punto del trapecio
   * @returns Grado de pertenencia entre 0 y 1
   */
  private trapmf(x: number, a: number, b: number, c: number, d: number): number {
    if (x <= a) return 0
    if (x >= d) return 0
    if (x >= b && x <= c) return 1
    if (x > a && x < b) return (x - a) / (b - a)
    if (x > c && x < d) return (d - x) / (d - c)
    return 0
  }

  /**
   * Función de membresía triangular simplificada.
   *
   * @param x - Valor a evaluar
   * @param a - Primer punto del triángulo
   * @param b - Segundo punto del triángulo (pico)
   * @param c - Tercer punto del triángulo
   * @returns Grado de pertenencia entre 0 y 1
   */
  private trimf(x: number, a: number, b: number, c: number): number {
    if (x <= a || x >= c) return 0
    if (x === b) return 1
    if (x > a && x < b) return (x - a) / (b - a)
    if (x > b && x < c) return (c - x) / (c - b)
    return 0
  }

  /**
   * Evalúa las funciones de membresía para la velocidad.
   *
   * @param x - Valor de velocidad (0-100)
   * @returns Grados de pertenencia para cada conjunto difuso
   */
  private evaluarVelocidad(x: number): Record<string, number> {
    return {
      baja: this.trapmf(x, 0, 0, 5, 10),
      media: this.trapmf(x, 5, 10, 20, 30),
      alta: this.trapmf(x, 20, 30, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para la estabilidad.
   *
   * @param x - Valor de estabilidad (0-100)
   * @returns Grados de pertenencia para cada conjunto difuso
   */
  private evaluarEstabilidad(x: number): Record<string, number> {
    return {
      inestable: this.trapmf(x, 0, 0, 30, 50),
      moderada: this.trapmf(x, 30, 50, 70, 85),
      estable: this.trapmf(x, 70, 85, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para la intensidad WiFi.
   *
   * @param x - Valor de intensidad WiFi (0-100)
   * @returns Grados de pertenencia para cada conjunto difuso
   */
  private evaluarIntensidadWifi(x: number): Record<string, number> {
    return {
      debil: this.trapmf(x, 0, 0, 20, 40),
      moderada: this.trapmf(x, 20, 40, 60, 80),
      fuerte: this.trapmf(x, 60, 80, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para la latencia.
   *
   * @param x - Valor de latencia (0-300)
   * @returns Grados de pertenencia para cada conjunto difuso
   */
  private evaluarLatencia(x: number): Record<string, number> {
    return {
      baja: this.trapmf(x, 0, 0, 15, 30),
      media: this.trapmf(x, 15, 30, 80, 100),
      alta: this.trapmf(x, 80, 100, 300, 300),
    }
  }

  /**
   * Evalúa las funciones de membresía para el acceso a servicios.
   *
   * @param x - Valor de acceso (0-100)
   * @returns Grados de pertenencia para cada conjunto difuso
   */
  private evaluarAcceso(x: number): Record<string, number> {
    return {
      limitado: this.trapmf(x, 0, 0, 30, 50),
      parcial: this.trapmf(x, 30, 50, 70, 85),
      completo: this.trapmf(x, 70, 85, 100, 100),
    }
  }

  /**
   * Aplica el operador AND (mínimo) a dos valores difusos.
   *
   * @param a - Primer valor difuso
   * @param b - Segundo valor difuso
   * @returns El mínimo de los dos valores
   */
  private and(a: number, b: number): number {
    return Math.min(a, b)
  }

  /**
   * Evalúa una regla difusa basada en antecedentes y consecuentes.
   *
   * @param antecedentes - Array de valores de antecedentes
   * @param consecuentes - Objeto con consecuentes y sus niveles
   * @returns Valor de activación de la regla
   */
  private evaluarRegla(antecedentes: number[], consecuentes: Record<string, string>): Record<string, number> {
    // Calcular el valor de activación (mínimo de todos los antecedentes)
    const activacion = antecedentes.reduce((min, val) => Math.min(min, val), 1)

    // Aplicar la activación a cada consecuente
    const resultado: Record<string, number> = {}
    for (const [consecuente, nivel] of Object.entries(consecuentes)) {
      resultado[consecuente] = activacion * (nivel === "alta" ? 0.9 : nivel === "media" ? 0.5 : 0.1)
    }

    return resultado
  }

  /**
   * Realiza el diagnóstico basado en los valores de entrada.
   *
   * @param inputs - Valores de entrada para el diagnóstico
   * @returns Resultado del diagnóstico con causas y recomendaciones
   */
  public diagnose(inputs: FuzzyInputs): FuzzyResult {
    // Evaluar funciones de membresía para cada entrada
    const velocidad = this.evaluarVelocidad(inputs.velocidad)
    const estabilidad = this.evaluarEstabilidad(inputs.estabilidad)
    const intensidad = this.evaluarIntensidadWifi(inputs.intensidad_wifi)
    const latencia = this.evaluarLatencia(inputs.latencia)
    const acceso = this.evaluarAcceso(inputs.acceso)

    // Inicializar resultados para cada causa
    const resultados: FuzzyOutput = {
      congestion: 0,
      fallo_router: 0,
      interferencia: 0,
      config_incorrecta: 0,
      fallo_infraestructura: 0,
    }

    // Evaluar reglas difusas
    // Regla 1: Si velocidad es baja Y estabilidad es inestable Y latencia es alta, entonces fallo_router es alto Y congestion es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, estabilidad.inestable, latencia.alta], {
        fallo_router: "alta",
        congestion: "media",
      }),
    )

    // Regla 2: Si velocidad es baja Y estabilidad es moderada Y acceso es limitado, entonces congestion es alta Y fallo_router es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, estabilidad.moderada, acceso.limitado], {
        congestion: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 3: Si intensidad_wifi es debil Y estabilidad es inestable, entonces interferencia es alta Y fallo_infraestructura es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([intensidad.debil, estabilidad.inestable], {
        interferencia: "alta",
        fallo_infraestructura: "media",
      }),
    )

    // Regla 4: Si velocidad es media Y estabilidad es inestable Y acceso es parcial, entonces config_incorrecta es media Y fallo_router es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.media, estabilidad.inestable, acceso.parcial], {
        config_incorrecta: "media",
        fallo_router: "media",
      }),
    )

    // Regla 5: Si intensidad_wifi es fuerte Y velocidad es baja Y latencia es alta, entonces congestion es alta Y config_incorrecta es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([intensidad.fuerte, velocidad.baja, latencia.alta], {
        congestion: "alta",
        config_incorrecta: "media",
      }),
    )

    // Regla 6: Si estabilidad es inestable Y intensidad_wifi es moderada, entonces fallo_router es media Y interferencia es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([estabilidad.inestable, intensidad.moderada], {
        fallo_router: "media",
        interferencia: "media",
      }),
    )

    // Regla 7: Si velocidad es baja Y estabilidad es estable Y intensidad_wifi es fuerte, entonces config_incorrecta es alta Y congestion es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, estabilidad.estable, intensidad.fuerte], {
        config_incorrecta: "alta",
        congestion: "media",
      }),
    )

    // Regla 8: Si velocidad es alta Y latencia es baja Y acceso es limitado, entonces config_incorrecta es alta Y fallo_router es baja
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.alta, latencia.baja, acceso.limitado], {
        config_incorrecta: "alta",
        fallo_router: "baja",
      }),
    )

    // Regla 9: Si estabilidad es inestable Y intensidad_wifi es fuerte, entonces fallo_infraestructura es media Y fallo_router es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([estabilidad.inestable, intensidad.fuerte], {
        fallo_infraestructura: "media",
        fallo_router: "media",
      }),
    )

    // Regla 10: Si velocidad es baja Y estabilidad es inestable Y intensidad_wifi es debil, entonces fallo_infraestructura es alta Y interferencia es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, estabilidad.inestable, intensidad.debil], {
        fallo_infraestructura: "alta",
        interferencia: "alta",
      }),
    )

    // Regla 11: Si latencia es alta Y velocidad es media Y estabilidad es moderada, entonces congestion es media Y interferencia es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([latencia.alta, velocidad.media, estabilidad.moderada], {
        congestion: "media",
        interferencia: "media",
      }),
    )

    // Regla 12: Si acceso es limitado Y estabilidad es estable Y velocidad es alta, entonces fallo_router es baja Y config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([acceso.limitado, estabilidad.estable, velocidad.alta], {
        fallo_router: "baja",
        config_incorrecta: "alta",
      }),
    )

    // Regla 13: Si acceso es limitado Y velocidad es media, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([acceso.limitado, velocidad.media], {
        config_incorrecta: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 14: Si acceso es limitado Y estabilidad es moderada, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([acceso.limitado, estabilidad.moderada], {
        config_incorrecta: "alta",
        fallo_infraestructura: "baja",
      }),
    )

    // Regla 15: Si acceso es limitado Y latencia es media, entonces config_incorrecta es alta Y congestion es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([acceso.limitado, latencia.media], {
        config_incorrecta: "alta",
        congestion: "media",
      }),
    )

    // Normalizar resultados a porcentajes (0-100)
    this.normalizarResultados(resultados)

    // Ordenar causas por nivel de confianza
    const causasOrdenadas = Object.entries(resultados)
      .map(([causa, confianza]) => ({
        causa: this.causaLabels[causa],
        confianza: Math.round(confianza),
        acciones: this.recomendaciones[causa],
      }))
      .sort((a, b) => b.confianza - a.confianza)

    return {
      causas: causasOrdenadas,
    }
  }

  /**
   * Actualiza los resultados con los valores de una regla.
   * Utiliza el máximo para combinar resultados.
   *
   * @param resultados - Resultados actuales
   * @param nuevosResultados - Nuevos resultados a combinar
   */
  private actualizarResultados(resultados: FuzzyOutput, nuevosResultados: FuzzyOutput): void {
    for (const causa in nuevosResultados) {
      resultados[causa] = Math.max(resultados[causa], nuevosResultados[causa])
    }
  }

  /**
   * Normaliza los resultados para que estén en el rango 0-100.
   * Asegura que siempre haya al menos un resultado con confianza significativa.
   *
   * @param resultados - Resultados a normalizar
   */
  private normalizarResultados(resultados: FuzzyOutput): void {
    // Encontrar el valor máximo
    const maxValor = Math.max(...Object.values(resultados))

    // Si el máximo es mayor que 0, normalizar
    if (maxValor > 0) {
      for (const causa in resultados) {
        // Normalizar a 0-100 y aplicar un factor para que el máximo sea cercano a 100
        resultados[causa] = (resultados[causa] / maxValor) * 100
      }
    } else {
      // Si todos los valores son 0, asignar valores por defecto basados en heurísticas
      // para evitar que todos los diagnósticos tengan 0% de confianza
      if (Object.keys(resultados).includes("config_incorrecta")) {
        resultados["config_incorrecta"] = 75 // Los errores de DNS suelen ser problemas de configuración
      }
      if (Object.keys(resultados).includes("fallo_router")) {
        resultados["fallo_router"] = 40 // Los routers también pueden causar problemas de DNS
      }
      if (Object.keys(resultados).includes("fallo_infraestructura")) {
        resultados["fallo_infraestructura"] = 25
      }
    }
  }

  /**
   * Convierte valores de síntomas de la interfaz a valores para el sistema difuso.
   *
   * @param sintomas - Síntomas seleccionados en la interfaz
   * @returns Valores de entrada para el sistema difuso
   */
  public convertirSintomasAEntradas(sintomas: string[]): FuzzyInputs {
    // Valores por defecto
    const inputs: FuzzyInputs = {
      velocidad: 50,
      estabilidad: 50,
      intensidad_wifi: 50,
      latencia: 50,
      acceso: 50,
    }

    // Ajustar valores según los síntomas seleccionados
    if (sintomas.includes("Sin conexión a Internet")) {
      inputs.velocidad = 0
      inputs.acceso = 0
    }

    if (sintomas.includes("Pérdida de paquetes")) {
      inputs.estabilidad = 20
      inputs.latencia = 150
    }

    if (sintomas.includes("Error de DNS")) {
      inputs.acceso = 30
      inputs.velocidad = 40 // Afecta a la velocidad percibida
      inputs.estabilidad = 40 // Puede causar inestabilidad en la conexión
    }

    if (sintomas.includes("Carga lenta de páginas")) {
      inputs.velocidad = 20
      inputs.latencia = 120
    }

    if (sintomas.includes("Señal Wi-Fi débil")) {
      inputs.intensidad_wifi = 15
    }

    if (sintomas.includes("Conexión intermitente")) {
      inputs.estabilidad = 25
    }

    if (sintomas.includes("Lentitud al acceder al servidor interno")) {
      inputs.velocidad = 30
      inputs.latencia = 100
      inputs.acceso = 40
    }

    return inputs
  }
}
