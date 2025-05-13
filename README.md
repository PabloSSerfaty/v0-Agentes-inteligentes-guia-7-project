# Sistema Experto de Diagnóstico de Red

Un sistema experto interactivo para el diagnóstico de problemas de red, implementando tres enfoques diferentes de inteligencia artificial: inferencia bayesiana, lógica difusa y sistemas basados en reglas.

![Sistema Experto de Diagnóstico de Red](/placeholder.svg?height=400&width=800&query=network%20diagnostic%20expert%20system%20dashboard%20with%20graphs%20and%20diagnostic%20tools)

## Características Principales

- **Tres sistemas expertos integrados**:
  - Sistema Bayesiano: Utiliza probabilidades para determinar las causas más probables
  - Sistema de Lógica Difusa: Maneja la incertidumbre mediante conjuntos difusos
  - Sistema Basado en Reglas: Utiliza reglas predefinidas para el diagnóstico

- **Interfaz de usuario intuitiva**:
  - Selección de síntomas mediante casillas de verificación
  - Visualización clara de resultados con causas probables y acciones recomendadas
  - Cambio sencillo entre los diferentes sistemas expertos

- **Visualizaciones avanzadas**:
  - Red bayesiana interactiva
  - Árbol de decisión para el sistema basado en reglas
  - Documentación detallada del modelado de agentes

## Tecnologías Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Visualización**: SVG personalizado para diagramas interactivos
- **Arquitectura**: App Router de Next.js con componentes del lado del cliente y del servidor

## Instalación

1. Clonar el repositorio:
   \`\`\`bash
   git clone https://github.com/tu-usuario/sistemas-expertos-diagnosticos-red.git
   cd sistemas-expertos-diagnosticos-red
   \`\`\`

2. Instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Iniciar el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Uso

1. Selecciona el tipo de sistema experto que deseas utilizar (Bayesiano, Lógica Difusa o Basado en Reglas).
2. Marca los síntomas que estás experimentando en tu red.
3. Haz clic en "Diagnosticar Problemas" para obtener resultados.
4. Revisa las causas probables y las acciones recomendadas.
5. Explora las visualizaciones adicionales como la red bayesiana o el árbol de decisión.

## Arquitectura del Sistema

### Componentes Principales

- **Módulo de Diagnóstico**: Coordina la interacción entre la interfaz y los sistemas expertos.
- **Sistemas Expertos**:
  - `expert-system.ts`: Implementa el sistema bayesiano
  - `fuzzy-system.ts`: Implementa el sistema de lógica difusa
  - `rule-based-system.ts`: Implementa el sistema basado en reglas
- **Constantes Compartidas**: Define síntomas, causas y acciones recomendadas unificadas.
- **Visualizaciones**: Componentes para mostrar la red bayesiana y el árbol de decisión.

### Flujo de Datos

1. El usuario selecciona síntomas en la interfaz.
2. La solicitud se envía al sistema experto seleccionado.
3. El sistema experto procesa los síntomas y genera un diagnóstico.
4. Los resultados se muestran al usuario con causas probables y acciones recomendadas.

## Explicación de los Sistemas Expertos

### Sistema Bayesiano

Utiliza el teorema de Bayes para identificar las causas más probables basándose en los síntomas observados. Este enfoque prioriza las causas según su frecuencia de aparición en los síntomas seleccionados.

### Sistema de Lógica Difusa

Permite manejar la incertidumbre y la imprecisión en los datos de entrada. Utiliza funciones de membresía para determinar el grado de pertenencia a diferentes conjuntos difusos, y reglas difusas para inferir las causas más probables de los problemas de red.

### Sistema Basado en Reglas

Utiliza un conjunto de reglas predefinidas para identificar causas probables basándose en los síntomas observados. Este enfoque permite coincidencias exactas y parciales, priorizando las soluciones según la relevancia de las reglas activadas.

## Modelado de Agentes

Cada sistema experto está modelado utilizando diferentes descriptores:

- **REAS**: Rendimiento, Entorno, Actuadores y Sensores
- **PAMA**: Percepción, Acción, Metas y Ambiente
- **Tabla PyA**: Mapeo de Percepción-Acción
- **Tipo y Metodología**: Clasificación del agente y enfoque metodológico

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Posibles Mejoras Futuras

- [ ] Ajustar colores del diagrama
- [ ] Añadir modo de filtrado
- [ ] Exportar diagrama como imagen
- [ ] Implementar zoom interactivo
- [ ] Crear versión imprimible
- [ ] Añadir interactividad entre componentes
- [ ] Mejorar la accesibilidad
- [ ] Añadir animaciones
- [ ] Exportar como PDF
- [ ] Añadir visualización de red bayesiana
- [ ] Unificar estilos de todos los componentes
- [ ] Añadir modo oscuro

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.
