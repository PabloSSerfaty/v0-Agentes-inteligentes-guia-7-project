/**
 * @file lib/fuzzy-system.ts
 * @description Sistema experto basado en lógica difusa para diagnóstico de problemas de red.
 * Versión mejorada con correcciones de discrepancias y optimizaciones.
 */

import { CAUSAS_UNIFICADAS, ACCIONES_RECOMENDADAS, type DiagnosisResult } from "./constants"

// Definición de tipos para el sistema difuso
type FuzzyValue = number
type FuzzyOutput = Record<string, number>

// Interfaz para los valores de entrada continuos
interface FuzzyInputs {
  conexion: FuzzyValue // Estado de conexión (0-100%)
  velocidad: FuzzyValue // Velocidad de carga (0-100 Mbps)
  perdida_paquetes: FuzzyValue // Pérdida de paquetes (0-100%)
  errores_dns: FuzzyValue // Errores DNS (0-10 por hora)
  senal_wifi: FuzzyValue // Señal Wi-Fi (0-100%)
  tiempo_carga: FuzzyValue // Tiempo de carga promedio (0-5000 ms)
  latencia_servidor: FuzzyValue // Latencia de respuesta del servidor interno (0-5000 ms)
}

/**
 * Clase que implementa un sistema experto basado en lógica difusa para diagnóstico de red.
 * Versión mejorada con correcciones de discrepancias y optimizaciones.
 */
export class FuzzyNetworkDiagnosticSystem {
  // Mapeo de nombres de causas para la interfaz
  private causaLabels: Record<string, string> = {
    congestion: CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
    fallo_router: CAUSAS_UNIFICADAS.ROUTER_FAILURE,
    interferencia: CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
    config_incorrecta: CAUSAS_UNIFICADAS.DNS_CONFIG,
    fallo_infraestructura: CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE,
    problemas_isp: CAUSAS_UNIFICADAS.ISP_PROBLEMS,
    hardware_defectuoso: CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
  }

  // Acciones recomendadas para cada causa
  private recomendaciones: Record<string, string[]> = {
    congestion: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.NETWORK_CONGESTION],
    fallo_router: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.ROUTER_FAILURE],
    interferencia: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.WIFI_INTERFERENCE],
    config_incorrecta: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.DNS_CONFIG],
    fallo_infraestructura: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE],
    problemas_isp: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.ISP_PROBLEMS],
    hardware_defectuoso: ACCIONES_RECOMENDADAS[CAUSAS_UNIFICADAS.NETWORK_HARDWARE],
  }

  /**
   * Función de membresía trapezoidal.
   * Calcula el grado de pertenencia de un valor a un conjunto difuso definido por un trapecio.
   *
   * @param x - Valor a evaluar
   * @param a - Punto donde comienza a subir (0 de pertenencia)
   * @param b - Punto donde alcanza el máximo (1 de pertenencia)
   * @param c - Punto donde comienza a bajar (1 de pertenencia)
   * @param d - Punto donde termina de bajar (0 de pertenencia)
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
   * Función de membresía triangular.
   * Calcula el grado de pertenencia de un valor a un conjunto difuso definido por un triángulo.
   *
   * @param x - Valor a evaluar
   * @param a - Punto donde comienza a subir (0 de pertenencia)
   * @param b - Punto máximo (1 de pertenencia)
   * @param c - Punto donde termina de bajar (0 de pertenencia)
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
   * Evalúa las funciones de membresía para el estado de conexión.
   * MEJORA: Aumentada sensibilidad en los extremos y mejor distribución.
   *
   * @param x - Valor del estado de conexión (0-100%)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarConexion(x: number): Record<string, number> {
    return {
      inexistente: this.trapmf(x, 0, 0, 15, 35),
      intermitente: this.trimf(x, 25, 50, 75),
      estable: this.trapmf(x, 65, 85, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para la velocidad de carga.
   * MEJORA: Mejor distribución de rangos.
   *
   * @param x - Valor de la velocidad (0-100 Mbps)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarVelocidad(x: number): Record<string, number> {
    return {
      baja: this.trapmf(x, 0, 0, 15, 35),
      media: this.trimf(x, 25, 50, 75),
      alta: this.trapmf(x, 65, 85, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para la pérdida de paquetes.
   * MEJORA: Mejor distribución y sensibilidad.
   *
   * @param x - Valor de pérdida de paquetes (0-100%)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarPerdidaPaquetes(x: number): Record<string, number> {
    return {
      ninguna: this.trapmf(x, 0, 0, 5, 15),
      moderada: this.trimf(x, 10, 30, 60),
      alta: this.trapmf(x, 50, 80, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para los errores DNS.
   * MEJORA: Añadida categoría "crítico" para mayor precisión.
   *
   * @param x - Valor de errores DNS (0-10 por hora)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarErroresDNS(x: number): Record<string, number> {
    return {
      ninguno: this.trapmf(x, 0, 0, 0.5, 2),
      ocasional: this.trimf(x, 1.5, 3, 5),
      frecuente: this.trimf(x, 4, 6, 8),
      critico: this.trapmf(x, 7, 9, 10, 10),
    }
  }

  /**
   * Evalúa las funciones de membresía para la señal Wi-Fi.
   * MEJORA: Mejor distribución de rangos.
   *
   * @param x - Valor de la señal Wi-Fi (0-100%)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarSenalWifi(x: number): Record<string, number> {
    return {
      debil: this.trapmf(x, 0, 0, 20, 40),
      moderada: this.trimf(x, 30, 50, 70),
      fuerte: this.trapmf(x, 60, 80, 100, 100),
    }
  }

  /**
   * Evalúa las funciones de membresía para el tiempo de carga.
   * MEJORA: Rangos refinados para mejor sensibilidad.
   *
   * @param x - Valor del tiempo de carga (0-5000 ms)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarTiempoCarga(x: number): Record<string, number> {
    return {
      rapido: this.trapmf(x, 0, 0, 300, 1000),
      moderado: this.trimf(x, 800, 2000, 3500),
      lento: this.trapmf(x, 3000, 4000, 5000, 5000),
    }
  }

  /**
   * Evalúa las funciones de membresía para la latencia del servidor.
   * MEJORA: Rangos refinados para mejor sensibilidad.
   *
   * @param x - Valor de la latencia (0-5000 ms)
   * @returns Grados de pertenencia a los conjuntos difusos
   */
  private evaluarLatenciaServidor(x: number): Record<string, number> {
    return {
      baja: this.trapmf(x, 0, 0, 200, 800),
      media: this.trimf(x, 600, 1500, 3000),
      alta: this.trapmf(x, 2500, 3500, 5000, 5000),
    }
  }

  /**
   * Evalúa una regla difusa basada en antecedentes y consecuentes.
   * MEJORA: Añadido factor de confianza para ponderar reglas.
   *
   * @param antecedentes - Valores de activación de los antecedentes
   * @param consecuentes - Consecuentes con sus niveles de activación
   * @param factorConfianza - Factor de confianza para la regla (1.0 por defecto)
   * @returns Resultado de la evaluación de la regla
   */
  private evaluarRegla(
    antecedentes: number[],
    consecuentes: Record<string, string>,
    factorConfianza = 1.0,
  ): Record<string, number> {
    // Calcular el valor de activación (mínimo de todos los antecedentes)
    const activacion = antecedentes.reduce((min, val) => Math.min(min, val), 1) * factorConfianza

    // Aplicar la activación a cada consecuente
    const resultado: Record<string, number> = {}
    for (const [consecuente, nivel] of Object.entries(consecuentes)) {
      resultado[consecuente] = activacion * (nivel === "alta" ? 0.9 : nivel === "media" ? 0.5 : 0.1)
    }

    return resultado
  }

  /**
   * Realiza el diagnóstico basado en los valores de entrada continuos.
   * MEJORA: Implementadas todas las mejoras sugeridas.
   *
   * @param inputs - Valores de entrada continuos
   * @returns Resultado del diagnóstico con causas probables, probabilidades y acciones recomendadas
   */
  public diagnose(inputs: FuzzyInputs): DiagnosisResult {
    // Evaluar funciones de membresía para cada entrada
    const conexion = this.evaluarConexion(inputs.conexion)
    const velocidad = this.evaluarVelocidad(inputs.velocidad)
    const perdidaPaquetes = this.evaluarPerdidaPaquetes(inputs.perdida_paquetes)
    const erroresDNS = this.evaluarErroresDNS(inputs.errores_dns)
    const senalWifi = this.evaluarSenalWifi(inputs.senal_wifi)
    const tiempoCarga = this.evaluarTiempoCarga(inputs.tiempo_carga)
    const latenciaServidor = this.evaluarLatenciaServidor(inputs.latencia_servidor)

    // Inicializar resultados para cada causa
    const resultados: FuzzyOutput = {
      congestion: 0,
      fallo_router: 0,
      interferencia: 0,
      config_incorrecta: 0,
      fallo_infraestructura: 0,
      problemas_isp: 0,
      hardware_defectuoso: 0,
    }

    // REGLAS ORIGINALES MEJORADAS
    // Regla 1: Si conexión es inexistente Y velocidad es baja, entonces fallo_router es alto Y problemas_isp es medio
    this.actualizarResultados(
      resultados,
      this.evaluarRegla(
        [conexion.inexistente, velocidad.baja],
        {
          fallo_router: "alta",
          problemas_isp: "media",
        },
        1.2,
      ), // Factor de confianza aumentado para síntomas críticos
    )

    // Regla 2: Si pérdida de paquetes es alta Y conexión es intermitente, entonces hardware_defectuoso es alto
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([perdidaPaquetes.alta, conexion.intermitente], {
        hardware_defectuoso: "alta",
        fallo_infraestructura: "media",
      }),
    )

    // Regla 3: Si errores DNS es frecuente Y tiempo de carga es lento, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([erroresDNS.frecuente, tiempoCarga.lento], {
        config_incorrecta: "alta",
        problemas_isp: "baja",
      }),
    )

    // Regla 4: Si señal WiFi es débil Y conexión es intermitente, entonces interferencia es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([senalWifi.debil, conexion.intermitente], {
        interferencia: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 5: Si tiempo de carga es lento Y velocidad es baja Y conexión es estable, entonces congestion es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([tiempoCarga.lento, velocidad.baja, conexion.estable], {
        congestion: "alta",
        problemas_isp: "media",
      }),
    )

    // Regla 6: Si latencia servidor es alta Y tiempo de carga es moderado, entonces fallo_infraestructura es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([latenciaServidor.alta, tiempoCarga.moderado], {
        fallo_infraestructura: "media",
        congestion: "media",
      }),
    )

    // Regla 7: Si errores DNS es ocasional Y conexión es estable, entonces config_incorrecta es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([erroresDNS.ocasional, conexion.estable], {
        config_incorrecta: "media",
        fallo_router: "baja",
      }),
    )

    // Regla 8: Si pérdida de paquetes es moderada Y velocidad es media, entonces congestion es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([perdidaPaquetes.moderada, velocidad.media], {
        congestion: "media",
        hardware_defectuoso: "baja",
      }),
    )

    // Regla 9: Si señal WiFi es moderada Y pérdida de paquetes es moderada, entonces interferencia es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([senalWifi.moderada, perdidaPaquetes.moderada], {
        interferencia: "media",
        fallo_router: "baja",
      }),
    )

    // Regla 10: Si conexión es inexistente Y señal WiFi es fuerte, entonces problemas_isp es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla(
        [conexion.inexistente, senalWifi.fuerte],
        {
          problemas_isp: "alta",
          fallo_infraestructura: "media",
        },
        1.2,
      ), // Factor de confianza aumentado para síntomas críticos
    )

    // Regla 11: Si latencia servidor es alta Y conexión es estable, entonces fallo_infraestructura es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([latenciaServidor.alta, conexion.estable], {
        fallo_infraestructura: "alta",
        congestion: "baja",
      }),
    )

    // Regla 12: Si tiempo de carga es lento Y errores DNS es ninguno, entonces congestion es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([tiempoCarga.lento, erroresDNS.ninguno], {
        congestion: "alta",
        problemas_isp: "media",
      }),
    )

    // Regla 13: Si errores DNS es frecuente Y conexión es intermitente, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([erroresDNS.frecuente, conexion.intermitente], {
        config_incorrecta: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 14: Si pérdida de paquetes es alta Y señal WiFi es fuerte, entonces hardware_defectuoso es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([perdidaPaquetes.alta, senalWifi.fuerte], {
        hardware_defectuoso: "alta",
        fallo_infraestructura: "baja",
      }),
    )

    // Regla 15: Si velocidad es baja Y señal WiFi es fuerte Y pérdida de paquetes es ninguna, entonces problemas_isp es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, senalWifi.fuerte, perdidaPaquetes.ninguna], {
        problemas_isp: "alta",
        congestion: "media",
      }),
    )

    // Regla 16: Si latencia servidor es baja Y tiempo de carga es lento, entonces congestion es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([latenciaServidor.baja, tiempoCarga.lento], {
        congestion: "alta",
        problemas_isp: "media",
      }),
    )

    // Regla 17: Si señal WiFi es débil Y velocidad es baja, entonces interferencia es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([senalWifi.debil, velocidad.baja], {
        interferencia: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 18: Si conexión es intermitente Y velocidad es alta, entonces hardware_defectuoso es media
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([conexion.intermitente, velocidad.alta], {
        hardware_defectuoso: "media",
        interferencia: "media",
      }),
    )

    // Regla 19: Si errores DNS es frecuente Y velocidad es alta, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([erroresDNS.frecuente, velocidad.alta], {
        config_incorrecta: "alta",
        fallo_router: "baja",
      }),
    )

    // Regla 20: Si latencia servidor es alta Y pérdida de paquetes es alta, entonces fallo_infraestructura es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([latenciaServidor.alta, perdidaPaquetes.alta], {
        fallo_infraestructura: "alta",
        hardware_defectuoso: "media",
      }),
    )

    // NUEVAS REGLAS PARA EQUILIBRAR CAUSAS Y MEJORAR CONSISTENCIA

    // Regla 21: Si errores DNS es crítico, entonces config_incorrecta es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla(
        [erroresDNS.critico],
        {
          config_incorrecta: "alta",
        },
        1.3,
      ), // Factor de confianza alto para síntoma crítico
    )

    // Regla 22: Si velocidad es baja Y perdida_paquetes es alta Y latencia_servidor es baja, entonces hardware_defectuoso es alta
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([velocidad.baja, perdidaPaquetes.alta, latenciaServidor.baja], {
        hardware_defectuoso: "alta",
        fallo_router: "media",
      }),
    )

    // Regla 23: Para valores medios (escenario ambiguo)
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([conexion.intermitente, velocidad.media, perdidaPaquetes.moderada, senalWifi.moderada], {
        congestion: "media",
        problemas_isp: "media",
        fallo_router: "baja",
      }),
    )

    // Regla 24: Regla compleja para problemas_isp
    this.actualizarResultados(
      resultados,
      this.evaluarRegla([conexion.intermitente, velocidad.baja, perdidaPaquetes.moderada, erroresDNS.ocasional], {
        problemas_isp: "alta",
        fallo_infraestructura: "media",
      }),
    )

    // Regla 25: Si todos los síntomas son bajos excepto uno, ese síntoma es determinante
    if (
      inputs.conexion > 80 &&
      inputs.velocidad > 80 &&
      inputs.perdida_paquetes < 10 &&
      inputs.errores_dns < 2 &&
      inputs.senal_wifi > 80 &&
      inputs.tiempo_carga < 500
    ) {
      // Solo latencia_servidor es problemática
      if (inputs.latencia_servidor > 3000) {
        this.actualizarResultados(
          resultados,
          this.evaluarRegla(
            [latenciaServidor.alta],
            {
              fallo_infraestructura: "alta",
            },
            1.5,
          ),
        )
      }
    }

    // Regla 26: Si todos los valores son medios, distribuir probabilidades equitativamente
    const todosValoresMedios =
      conexion.intermitente > 0.7 &&
      velocidad.media > 0.7 &&
      perdidaPaquetes.moderada > 0.7 &&
      (erroresDNS.ocasional > 0.7 || erroresDNS.frecuente > 0.7) &&
      senalWifi.moderada > 0.7 &&
      tiempoCarga.moderado > 0.7 &&
      latenciaServidor.media > 0.7

    if (todosValoresMedios) {
      this.actualizarResultados(resultados, {
        congestion: 0.5,
        fallo_router: 0.5,
        interferencia: 0.5,
        config_incorrecta: 0.5,
        fallo_infraestructura: 0.5,
        problemas_isp: 0.5,
        hardware_defectuoso: 0.5,
      })
    }

    // MEJORA: Normalización de resultados para evitar sesgos
    const totalActivacion = Object.values(resultados).reduce((sum, val) => sum + val, 0)
    if (totalActivacion > 0) {
      for (const causa in resultados) {
        resultados[causa] = resultados[causa] / totalActivacion
      }
    }

    // Convertir los valores de activación a porcentajes (0-100)
    const resultadosPorcentaje: Record<string, number> = {}
    for (const causa in resultados) {
      resultadosPorcentaje[causa] = Math.round(resultados[causa] * 100)
    }

    // Ordenar causas por nivel de activación
    const causasOrdenadas = Object.entries(resultadosPorcentaje)
      .sort((a, b) => b[1] - a[1])
      .map(([causa, probabilidad]) => ({
        causa: this.causaLabels[causa],
        acciones: this.recomendaciones[causa],
        probabilidad,
      }))

    // MEJORA: Cálculo de certeza mejorado
    let certeza = 100
    if (causasOrdenadas.length >= 2) {
      const diferencia = causasOrdenadas[0].probabilidad - causasOrdenadas[1].probabilidad
      const sumaProbabilidades = causasOrdenadas.reduce((sum, c) => sum + c.probabilidad, 0)
      const dispersion =
        causasOrdenadas.reduce(
          (sum, c) => sum + Math.abs(c.probabilidad - sumaProbabilidades / causasOrdenadas.length),
          0,
        ) / causasOrdenadas.length

      certeza = Math.max(60, causasOrdenadas[0].probabilidad - (dispersion > 20 ? 0 : 20 - dispersion))
    }

    return {
      causas: causasOrdenadas,
      certeza,
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
   * Convierte los valores de entrada continuos a un objeto FuzzyInputs.
   *
   * @param valores - Valores de entrada desde la interfaz
   * @returns Objeto FuzzyInputs con los valores normalizados
   */
  public convertirValoresAEntradas(valores: Record<string, number>): FuzzyInputs {
    return {
      conexion: valores.conexion || 0,
      velocidad: valores.velocidad || 0,
      perdida_paquetes: valores.perdida_paquetes || 0,
      errores_dns: valores.errores_dns || 0,
      senal_wifi: valores.senal_wifi || 0,
      tiempo_carga: valores.tiempo_carga || 0,
      latencia_servidor: valores.latencia_servidor || 0,
    }
  }
}
