/**
 * @file lib/fuzzy-system.ts
 * @description Sistema experto basado en lógica difusa para diagnóstico de problemas de red.
 * Adaptado para mantener coherencia con los otros sistemas simplificados.
 */

import { CAUSAS_UNIFICADAS, ACCIONES_RECOMENDADAS, SINTOMAS_UNIFICADOS, type DiagnosisResult } from "./constants"

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

/**
 * Clase que implementa un sistema experto basado en lógica difusa para diagnóstico de red.
 */
export class FuzzyNetworkDiagnosticSystem {
  // Mapeo de nombres de causas para la interfaz
  private causaLabels: Record<string, string> = {
    congestion: CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
    fallo_router: CAUSAS_UNIFICADAS.ROUTER_FAILURE,
    interferencia: CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
    config_incorrecta: CAUSAS_UNIFICADAS.DNS_CONFIG,
    fallo_infraestructura: CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE,
  }

  // Acciones recomendadas para cada causa
  private recomendaciones: Record<string, string[]> = {
    congestion: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.NETWORK_CONGESTION],
    fallo_router: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.ROUTER_FAILURE],
    interferencia: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.WIFI_INTERFERENCE],
    config_incorrecta: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.DNS_CONFIG],
    fallo_infraestructura: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE],
  }

  /**
   * Función de membresía trapezoidal simplificada.
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
   * Evalúa las funciones de membresía para la velocidad.
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
   */
  private evaluarAcceso(x: number): Record<string, number> {
    return {
      limitado: this.trapmf(x, 0, 0, 30, 50),
      parcial: this.trapmf(x, 30, 50, 70, 85),
      completo: this.trapmf(x, 70, 85, 100, 100),
    }
  }

  /**
   * Evalúa una regla difusa basada en antecedentes y consecuentes.
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
   */
  public diagnose(inputs: FuzzyInputs): DiagnosisResult {
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

    // Regla 16: Si acceso es limitado Y velocidad es media Y estabilidad es moderada, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([acceso.limitado, velocidad.media, estabilidad.moderada], {
        config_incorrecta: "alta",
        fallo_router: "baja",
      }),
    )

    // Caso especial para DNS
    if (inputs.acceso <= 30 && inputs.latencia >= 50) {
      resultados.config_incorrecta = Math.max(resultados.config_incorrecta, 0.9)
    }

    // Ordenar causas por nivel de activación
    const causasOrdenadas = Object.entries(resultados)
      .sort((a, b) => b[1] - a[1])
      .map(([causa, _]) => ({
        causa: this.causaLabels[causa],
        acciones: this.recomendaciones[causa],
      }))

    return {
      causas: causasOrdenadas,
    }
  }

  /**
   * Actualiza los resultados con los valores de una regla.
   * Utiliza el máximo para combinar resultados.
   */
  private actualizarResultados(resultados: FuzzyOutput, nuevosResultados: FuzzyOutput): void {
    for (const causa in nuevosResultados) {
      resultados[causa] = Math.max(resultados[causa], nuevosResultados[causa])
    }
  }

  /**
   * Convierte valores de síntomas de la interfaz a valores para el sistema difuso.
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
    if (sintomas.includes(SINTOMAS_UNIFICADOS.NO_INTERNET)) {
      inputs.velocidad = 0
      inputs.acceso = 0
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.PACKET_LOSS)) {
      inputs.estabilidad = 20
      inputs.latencia = 150
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.DNS_ERROR)) {
      inputs.acceso = 20
      inputs.velocidad = 30
      inputs.estabilidad = 40
      inputs.latencia = 70
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.SLOW_LOADING)) {
      inputs.velocidad = 20
      inputs.latencia = 120
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.WEAK_WIFI)) {
      inputs.intensidad_wifi = 15
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.INTERMITTENT)) {
      inputs.estabilidad = 25
    }

    if (sintomas.includes(SINTOMAS_UNIFICADOS.SLOW_INTERNAL)) {
      inputs.velocidad = 30
      inputs.latencia = 100
      inputs.acceso = 40
    }

    return inputs
  }
}
