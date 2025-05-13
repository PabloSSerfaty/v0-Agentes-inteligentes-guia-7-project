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
  NETWORK_CONFIG: "Configuración de red incorrecta",
  DNS_ISP: "Problemas con DNS del ISP",
  SERVER_RESOURCES: "Recursos insuficientes en el servidor",
  // Nuevas causas alineadas con el árbol de decisión
  REINICIAR_ROUTER: "Reiniciar router",
  REVISAR_CONFIG_IP: "Revisar configuración IP",
  DEFAULT_ROUTE: "Default route",
  CABLE_DANADO: "Cable dañado",
  CONTROLAR_PROCESOS: "Controlar el proceso",
  REVISAR_RED_INTERNA: "Revisar estado general de red interna",
  CAMBIAR_DNS: "Cambiar servidor DNS",
  REVISAR_MANTENIMIENTO: "Revisar mantenimiento del ISP",
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
  HIGH_RESOURCE_USAGE: "Alto uso de recursos en servidor",
  DAMAGED_CABLE: "Cable de red dañado",
  IP_CONFIG_ERROR: "Error en configuración IP",
  DNS_PROBLEMS: "Problemas con DNS",
  ISP_CABLE_ISSUES: "Problemas con el cable del ISP",
}

// Mapeo de síntomas a causas más probables (para guiar la coherencia)
export const MAPEO_SINTOMA_CAUSA = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: [
    CAUSAS_UNIFICADAS.REINICIAR_ROUTER,
    CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
  ],
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: [
    CAUSAS_UNIFICADAS.NETWORK_HARDWARE,
    CAUSAS_UNIFICADAS.CABLE_DANADO,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
  ],
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: [
    CAUSAS_UNIFICADAS.CAMBIAR_DNS,
    CAUSAS_UNIFICADAS.DNS_CONFIG,
    CAUSAS_UNIFICADAS.DNS_ISP,
  ],
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: [
    CAUSAS_UNIFICADAS.NETWORK_CONGESTION,
    CAUSAS_UNIFICADAS.ISP_PROBLEMS,
    CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO,
  ],
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: [
    CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
    CAUSAS_UNIFICADAS.DEFAULT_ROUTE,
    CAUSAS_UNIFICADAS.ROUTER_FAILURE,
  ],
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: [
    CAUSAS_UNIFICADAS.DEFAULT_ROUTE,
    CAUSAS_UNIFICADAS.CABLE_DANADO,
    CAUSAS_UNIFICADAS.WIFI_INTERFERENCE,
  ],
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: [
    CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS,
    CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA,
    CAUSAS_UNIFICADAS.SERVER_OVERLOAD,
  ],
  [SINTOMAS_UNIFICADOS.HIGH_RESOURCE_USAGE]: [
    CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS,
    CAUSAS_UNIFICADAS.SERVER_RESOURCES,
    CAUSAS_UNIFICADAS.SERVER_OVERLOAD,
  ],
  [SINTOMAS_UNIFICADOS.DAMAGED_CABLE]: [CAUSAS_UNIFICADAS.CABLE_DANADO, CAUSAS_UNIFICADAS.NETWORK_HARDWARE],
  [SINTOMAS_UNIFICADOS.IP_CONFIG_ERROR]: [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP, CAUSAS_UNIFICADAS.NETWORK_CONFIG],
  [SINTOMAS_UNIFICADOS.DNS_PROBLEMS]: [CAUSAS_UNIFICADAS.CAMBIAR_DNS, CAUSAS_UNIFICADAS.DNS_CONFIG],
  [SINTOMAS_UNIFICADOS.ISP_CABLE_ISSUES]: [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO, CAUSAS_UNIFICADAS.ISP_PROBLEMS],
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
  [CAUSAS_UNIFICADAS.REINICIAR_ROUTER]: [
    "Apagar el router durante 30 segundos",
    "Encender el router y esperar a que se inicialice",
    "Verificar si se restablece la conexión",
  ],
  [CAUSAS_UNIFICADAS.REVISAR_CONFIG_IP]: [
    "Verificar que la configuración IP sea correcta",
    "Comprobar que el DHCP esté habilitado o la IP estática sea válida",
    "Verificar la máscara de subred y la puerta de enlace",
  ],
  [CAUSAS_UNIFICADAS.DEFAULT_ROUTE]: [
    "Verificar la configuración de la ruta por defecto",
    "Comprobar la tabla de enrutamiento",
    "Revisar la configuración del gateway",
  ],
  [CAUSAS_UNIFICADAS.CABLE_DANADO]: [
    "Inspeccionar visualmente el cable en busca de daños",
    "Reemplazar el cable de red",
    "Verificar los conectores RJ45",
  ],
  [CAUSAS_UNIFICADAS.CONTROLAR_PROCESOS]: [
    "Identificar los procesos que consumen más recursos",
    "Limitar o detener procesos problemáticos",
    "Optimizar la configuración del servidor",
  ],
  [CAUSAS_UNIFICADAS.REVISAR_RED_INTERNA]: [
    "Verificar el estado de los switches y routers internos",
    "Comprobar la carga de la red",
    "Revisar la configuración de QoS",
  ],
  [CAUSAS_UNIFICADAS.CAMBIAR_DNS]: [
    "Configurar servidores DNS alternativos (8.8.8.8, 1.1.1.1)",
    "Limpiar la caché DNS",
    "Verificar que los nuevos servidores DNS funcionen correctamente",
  ],
  [CAUSAS_UNIFICADAS.REVISAR_MANTENIMIENTO]: [
    "Contactar al proveedor de servicios",
    "Verificar si hay mantenimientos programados",
    "Consultar el estado del servicio en la página del ISP",
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
  [SINTOMAS_UNIFICADOS.HIGH_RESOURCE_USAGE]: "alto_uso_recursos",
  [SINTOMAS_UNIFICADOS.DAMAGED_CABLE]: "cable_danado",
  [SINTOMAS_UNIFICADOS.IP_CONFIG_ERROR]: "config_ip_incorrecta",
  [SINTOMAS_UNIFICADOS.DNS_PROBLEMS]: "problemas_dns",
  [SINTOMAS_UNIFICADOS.ISP_CABLE_ISSUES]: "problemas_isp",
}

// Mapeo inverso de síntomas internos a nombres legibles
export const MAPEO_SINTOMAS_REGLAS_INVERSO: Record<string, string> = {
  sin_internet: "Sin conexión a Internet",
  ping_falla: "Ping fallido",
  ping_ok: "Ping exitoso",
  ping_perdida_paquetes: "Pérdida de paquetes",
  error_dns: "Error de DNS",
  paginas_no_cargan: "Páginas no cargan",
  wifi_debil: "Señal Wi-Fi débil",
  intermitencia: "Conexión intermitente",
  servidor_lento: "Servidor lento",
  wifi: "Conexión Wi-Fi",
  cable: "Conexión por cable",
  cable_danado: "Cable dañado",
  lento_subir_archivos: "Lentitud al subir archivos",
  multiples_usuarios_afectados: "Múltiples usuarios afectados",
  mantenimiento_isp: "Mantenimiento del ISP",
  problemas_persisten: "Problemas persistentes",
  config_incorrecta: "Configuración incorrecta",
  alto_uso_recursos: "Alto uso de recursos",
  config_ip_incorrecta: "Configuración IP incorrecta",
  default_route: "Problema con ruta por defecto",
  dns: "Usa DNS",
  problemas_dns: "Problemas con DNS",
  cable_isp: "Usa cable con ISP",
  problemas_isp: "Problemas con ISP",
}

// Interfaz unificada para el resultado del diagnóstico
export interface DiagnosisResult {
  causas: {
    causa: string
    acciones: string[]
    probabilidad?: number
  }[]
  certeza?: number
}

export const MAPEO_SINTOMAS_BAYESIANO = {
  [SINTOMAS_UNIFICADOS.NO_INTERNET]: "sin_internet",
  [SINTOMAS_UNIFICADOS.PACKET_LOSS]: "perdida_paquetes",
  [SINTOMAS_UNIFICADOS.DNS_ERROR]: "error_dns",
  [SINTOMAS_UNIFICADOS.SLOW_LOADING]: "carga_lenta",
  [SINTOMAS_UNIFICADOS.WEAK_WIFI]: "wifi_debil",
  [SINTOMAS_UNIFICADOS.INTERMITTENT]: "intermitente",
  [SINTOMAS_UNIFICADOS.SLOW_INTERNAL]: "interno_lento",
  [SINTOMAS_UNIFICADOS.HIGH_RESOURCE_USAGE]: "recursos_altos",
  [SINTOMAS_UNIFICADOS.DAMAGED_CABLE]: "cable_danado",
  [SINTOMAS_UNIFICADOS.IP_CONFIG_ERROR]: "config_ip_error",
  [SINTOMAS_UNIFICADOS.DNS_PROBLEMS]: "problemas_dns",
  [SINTOMAS_UNIFICADOS.ISP_CABLE_ISSUES]: "problemas_isp",
}
