import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface PrimaryDiagnosisProps {
  causa: string
  certeza: number
  accion: string
}

export function PrimaryDiagnosis({ causa, certeza, accion }: PrimaryDiagnosisProps) {
  // Determinar el ícono y color basado en la certeza
  const getIconAndColor = () => {
    if (certeza > 80) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        bgColor: "bg-white",
        borderColor: "border-gray-200",
        textColor: "text-gray-800",
      }
    } else if (certeza > 60) {
      return {
        icon: <Info className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-white",
        borderColor: "border-gray-200",
        textColor: "text-gray-800",
      }
    } else {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-gray-600" />,
        bgColor: "bg-white",
        borderColor: "border-gray-200",
        textColor: "text-gray-800",
      }
    }
  }

  const { icon, bgColor, borderColor, textColor } = getIconAndColor()

  return (
    <div className={`${bgColor} p-6 rounded-2xl border ${borderColor} shadow-sm mb-6`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xl font-bold ${textColor}`}>{causa}</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 border border-gray-200 shadow-sm">
              Certeza: {certeza}%
            </span>
          </div>
          <p className={`text-base ${textColor}`}>{accion}</p>
        </div>
      </div>
    </div>
  )
}
