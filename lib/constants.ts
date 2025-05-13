/**
 * @file lib/constants.ts
 * @description Definiciones compartidas para unificar los sistemas expertos
 */

// Conjunto unificado de causas para todos los sistemas expertos
export const CAUSAS_UNIFICADAS = {
  ROUTER_FAILURE: "Falla en el router",
  ISP_PROBLEMS: "Problemas con el ISP",
  NETWORK_HARDWARE: "Hardware de red defectuoso",
  DNS_CONFIG: "Configuración incorrecta de DNS",
  WIFI_INTERFERENCE: "Interferencia en señal Wi-Fi",
  SERVER_OVERLOAD: "Sobrecarga del servidor interno",
  MALWARE: "Malware o virus en equipos",
  NETWORK_CONGESTION: "Congestión de red",
  INFRASTRUCTURE_FAILURE: "Fallo en infraestructura central",
}

// Conjunto unificado de síntomas para todos los sistemas expertos
export const SINTOMAS_UNIFICADOS = {
  NO_INTERNET: "Sin conexión a Internet",
  PACKET_LOSS: "Pérdida de paquetes",
  DNS_ERROR: "Error de DNS",
  SLOW_LOADING: "Carga lenta de páginas",
  WEAK_WIFI: "Señal Wi-Fi débil",
  INTERMITTENT: "Conexión intermitente",
  SLOW_INTERNAL: "Lentitud al acceder al servidor interno",
}

// Mapeo de síntomas a causas más probables (para guiar la coherencia)
export const MAPEO_SINTOMA_CAUSA = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: [
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
    CAUSAS_UNIFICADAS.ISP_PROBLEMS,
    CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
  ],
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: [
    CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
    CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
  ],
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: [
    CAUSAS_UNIFICADAS.DNS_CONFIG,
    CAUSAS_UNIFICADAS.ISP_PROBLEMS,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
  ],
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: [
    CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
    CAUSAS_UNIFICADAS.ISP_PROBLEMS,
    CAUSAS_UNIFICADAS.DNS_CONFIG,
  ],
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: [
    CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
    CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
  ],
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: [
    CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
    CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
    CAUSAS_UNIFICADAS.ISP_PROBLEMS,
  ],
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: [
    CAUSAS_UNIFICADAS.SERVER_OVERLOAD,
    CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
    CAUSAS_UNIFICADAS.MALWARE,
  ],
}

// Acciones recomendadas unificadas para cada causa
export const ACCIONES_RECOMENDADAS = {
  [CAUSAS_UNIFICADAS.ROUTER_FAILURE]: [
    "Reiniciar el router",
    "Verificar los indicadores LED del router",
    "Actualizar el firmware del router",
    "Restaurar la configuración de fábrica",
    "Reemplazar el router si persiste el problema",
  ],
  [CAUSAS_UNIFICADAS.ISP_PROBLEMS]: [
    "Contactar al proveedor de servicios",
    "Verificar el estado de servicio en la página del ISP",
    "Solicitar un diagnóstico remoto",
    "Verificar si hay cortes programados en la zona",
  ],
  [CAUSAS_UNIFICADAS.NETWORK_HARDWARE]: [
    "Inspeccionar visualmente los cables y conectores",
    "Reemplazar cables dañados",
    "Verificar el funcionamiento de los switches",
    "Comprobar las tarjetas de red de los equipos",
  ],
  [CAUSAS_UNIFICADAS.DNS_CONFIG]: [
    "Verificar servidores DNS configurados",
    "Configurar DNS alternativos (8.8.8.8, 1.1.1.1)",
    "Revisar configuración DHCP",
    "Limpiar caché DNS en los equipos",
  ],
  [CAUSAS_UNIFICADAS.WIFI_INTERFERENCE]: [
    "Cambiar el canal de Wi-Fi",
    "Reubicar el router",
    "Instalar repetidores Wi-Fi",
    "Reducir interferencias (microondas, teléfonos inalámbricos)",
  ],
  [CAUSAS_UNIFICADAS.SERVER_OVERLOAD]: [
    "Reiniciar el servidor",
    "Verificar el uso de recursos (CPU, memoria)",
    "Revisar los procesos en ejecución",
    "Optimizar aplicaciones con alto consumo",
  ],
  [CAUSAS_UNIFICADAS.MALWARE]: [
    "Ejecutar escaneo de antivirus en todos los equipos",
    "Actualizar software de seguridad",
    "Revisar equipos con comportamiento anómalo",
    "Implementar políticas de seguridad más estrictas",
  ],
  [CAUSAS_UNIFICADAS.NETWORK_CONGESTION]: [
    "Revisar y optimizar el uso de ancho de banda",
    "Implementar QoS para priorizar tráfico",
    "Verificar si hay dispositivos consumiendo excesivo ancho de banda",
    "Programar transferencias grandes para horas de menor uso",
  ],
  [CAUSAS_UNIFICADAS.INFRASTRUCTURE_FAILURE]: [
    "Revisar estado del router o switch central",
    "Verificar el funcionamiento de los equipos principales",
    "Comprobar la alimentación eléctrica de los dispositivos",
    "Revisar logs de errores en los equipos centrales",
  ],
}

// Lista de síntomas para la interfaz de usuario
export const LISTA_SINTOMAS = Object.values(SINTOMAS_UNIFICADOS)

// Mapeo de síntomas de la interfaz a síntomas internos del sistema basado en reglas
export const MAPEO_SINTOMAS_REGLAS = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: "sin_internet",
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: "ping_perdida_paquetes",
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: "error_dns",
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: "paginas_no_cargan",
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: "wifi_debil",
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: "intermitencia",
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: "servidor_lento",
}

// Interfaz unificada para el resultado del diagnóstico
export interface DiagnosisResult {
  causas: {
    causa: string
    acciones: string[]
  }[]
}

export const MAPEO_SINTOMAS_BAYESIANO = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: "sin_internet",
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: "perdida_paquetes",
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: "error_dns",
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: "carga_lenta",
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: "wifi_debil",
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: "intermitente",
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: "interno_lento",
}
