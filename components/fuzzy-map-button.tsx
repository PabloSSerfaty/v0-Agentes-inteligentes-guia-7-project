"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FuzzyCognitiveMap } from "@/components/fuzzy-cognitive-map"

export function FuzzyMapButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setDialogOpen(true)}>
        Ver Mapa cognitivo difuso
      </Button>

      {/* Renderizamos el componente FuzzyCognitiveMap con el estado controlado */}
      <FuzzyCognitiveMap open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
