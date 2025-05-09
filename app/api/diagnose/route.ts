/**
 * @file app/api/diagnose/route.ts
 * @description Ruta de API para realizar diagnósticos de problemas de red.
 * Esta ruta recibe los síntomas seleccionados por el usuario y devuelve
 * el diagnóstico generado por el sistema experto seleccionado.
 */

import { NextResponse } from "next/server"
import { diagnosticarProblemasDeRed, type ExpertSystemType } from "@/lib/diagnose"

/**
 * Manejador de solicitudes POST para la ruta /api/diagnose.
 * Recibe los síntomas seleccionados y el tipo de sistema experto a utilizar.
 *
 * @param request - Objeto Request con los datos de la solicitud
 * @returns Respuesta JSON con el resultado del diagnóstico
 */
export async function POST(request: Request) {
  try {
    // Extraer los síntomas y el tipo de sistema del cuerpo de la solicitud
    const { sintomas, systemType = "bayesian" } = await request.json()

    // Validar que se proporcionaron síntomas válidos
    if (!sintomas || !Array.isArray(sintomas)) {
      return NextResponse.json({ error: "Síntomas proporcionados no válidos" }, { status: 400 })
    }

    // Validar el tipo de sistema
    if (systemType !== "bayesian" && systemType !== "fuzzy" && systemType !== "rule-based") {
      return NextResponse.json({ error: "Tipo de sistema experto no válido" }, { status: 400 })
    }

    // Usar el sistema experto para diagnosticar
    const resultado = await diagnosticarProblemasDeRed(sintomas, systemType as ExpertSystemType)

    // Devolver el resultado como JSON
    return NextResponse.json(resultado)
  } catch (error) {
    // Manejar errores
    console.error("Error en API de diagnóstico:", error)
    return NextResponse.json({ error: "Error al procesar el diagnóstico" }, { status: 500 })
  }
}
