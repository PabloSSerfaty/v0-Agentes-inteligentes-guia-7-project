"use client"

import { Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SymptomSliderProps {
  id: string
  nombre: string
  unidad: string
  min: number
  max: number
  paso: number
  valor: number
  etiquetas: { valor: number; texto: string }[]
  descripcion: string
  onChange: (valor: number[]) => void
}

export function SymptomSlider({
  id,
  nombre,
  unidad,
  min,
  max,
  paso,
  valor,
  etiquetas,
  descripcion,
  onChange,
}: SymptomSliderProps) {
  // Obtener la etiqueta actual basada en el valor
  const obtenerEtiqueta = () => {
    // Ordenar las etiquetas por valor (de menor a mayor)
    const etiquetasOrdenadas = [...etiquetas].sort((a, b) => a.valor - b.valor)

    // Si el valor es igual o menor que el valor de la primera etiqueta, devolver esa etiqueta
    if (valor <= etiquetasOrdenadas[0].valor) {
      return etiquetasOrdenadas[0].texto
    }

    // Si el valor es igual o mayor que el valor de la última etiqueta, devolver esa etiqueta
    if (valor >= etiquetasOrdenadas[etiquetasOrdenadas.length - 1].valor) {
      return etiquetasOrdenadas[etiquetasOrdenadas.length - 1].texto
    }

    // Buscar las dos etiquetas entre las que se encuentra el valor
    for (let i = 0; i < etiquetasOrdenadas.length - 1; i++) {
      if (valor >= etiquetasOrdenadas[i].valor && valor <= etiquetasOrdenadas[i + 1].valor) {
        // Calcular qué tan cerca está el valor de cada etiqueta
        const distanciaTotal = etiquetasOrdenadas[i + 1].valor - etiquetasOrdenadas[i].valor
        const distanciaAlSiguiente = valor - etiquetasOrdenadas[i].valor
        const proporcion = distanciaAlSiguiente / distanciaTotal

        // Si está más cerca de la siguiente etiqueta, devolver esa
        if (proporcion > 0.5) {
          return etiquetasOrdenadas[i + 1].texto
        }
        // Si no, devolver la etiqueta actual
        return etiquetasOrdenadas[i].texto
      }
    }

    // Por defecto, devolver la última etiqueta
    return etiquetasOrdenadas[etiquetasOrdenadas.length - 1].texto
  }

  // Obtener el color basado en el valor (para indicadores visuales)
  const obtenerColorEtiqueta = () => {
    const porcentaje = ((valor - min) / (max - min)) * 100

    if (id === "perdida_paquetes" || id === "errores_dns" || id === "tiempo_carga" || id === "latencia_servidor") {
      // Para síntomas donde valores altos son negativos
      if (porcentaje > 70) return "text-red-600"
      if (porcentaje > 40) return "text-amber-600"
      return "text-green-600"
    } else {
      // Para síntomas donde valores altos son positivos
      if (porcentaje < 30) return "text-red-600"
      if (porcentaje < 60) return "text-amber-600"
      return "text-green-600"
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-800">{nombre}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-blue-50 text-blue-800 border border-blue-100">
                <p className="max-w-xs">{descripcion}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${obtenerColorEtiqueta()}`}>{obtenerEtiqueta()}</span>
          <span className="text-sm font-medium text-gray-700 min-w-[70px] text-right">
            {valor} {unidad}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <Slider
          id={id}
          min={min}
          max={max}
          step={paso}
          value={[valor]}
          onValueChange={onChange}
          className="cursor-pointer"
        />
      </div>

      <div className="flex justify-between px-1">
        {etiquetas.map((etiqueta) => {
          const posicion = ((etiqueta.valor - min) / (max - min)) * 100
          return (
            <div
              key={etiqueta.valor}
              className="flex flex-col items-center"
              style={{
                position: "relative",
                left: `${posicion}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
              <span className="mt-1 text-xs font-medium text-gray-600">{etiqueta.texto}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
