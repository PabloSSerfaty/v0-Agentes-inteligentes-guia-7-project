"use client"

import { useEffect, useRef } from "react"

interface MermaidProps {
  chart: string
}

const Mermaid = ({ chart }: MermaidProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Verificar si mermaid está disponible
    if (typeof window !== "undefined" && window.mermaid) {
      try {
        // Limpiar el contenido anterior
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = chart
        }

        // Renderizar el diagrama
        window.mermaid.init(undefined, mermaidRef.current)
      } catch (error) {
        console.error("Error al renderizar el diagrama Mermaid:", error)
      }
    }
  }, [chart])

  return (
    <div className="mermaid" ref={mermaidRef}>
      {chart}
    </div>
  )
}

export default Mermaid
