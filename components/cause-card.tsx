import { CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CauseCardProps {
  causa: string
  probabilidad: number
  acciones: string[]
  index: number
}

export function CauseCard({ causa, probabilidad, acciones, index }: CauseCardProps) {
  // Determinar el color basado en la probabilidad
  const getColors = () => {
    if (probabilidad > 70) {
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800",
        progress: "bg-red-100",
        indicator: "bg-red-500",
      }
    } else if (probabilidad > 40) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-800",
        progress: "bg-amber-100",
        indicator: "bg-amber-500",
      }
    } else {
      return {
        bg: "bg-green-50",
        border: "border-green-100",
        text: "text-green-800",
        badge: "bg-green-100 text-green-800",
        progress: "bg-green-100",
        indicator: "bg-green-500",
      }
    }
  }

  const colors = getColors()

  return (
    <div
      className={`${index === 0 ? colors.bg : "bg-white"} p-5 rounded-2xl border ${index === 0 ? colors.border : "border-gray-200"} shadow-sm mb-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${index === 0 ? colors.text : "text-gray-800"}`}>{causa}</h3>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
          {probabilidad}%
        </span>
      </div>

      <div className="mb-4">
        <Progress value={probabilidad} className={`h-2.5 ${colors.progress}`} indicatorClassName={colors.indicator} />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Acciones Recomendadas:</h4>
        <ul className="space-y-2">
          {acciones.map((accion, accionIndex) => (
            <li key={accionIndex} className="flex items-start">
              <CheckCircle2 className={`h-5 w-5 ${colors.indicator} mr-2 mt-0.5 flex-shrink-0`} />
              <span className="text-sm text-gray-700">{accion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
