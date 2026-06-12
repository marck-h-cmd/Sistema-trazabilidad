# 🎨 NORMAS Y REGLAS DE DISEÑO

## 1. PRINCIPIOS GENERALES

### 1.1 Filosofía de Diseño

**"Simple, Rápido, Confiable"**

- **Simple**: Cualquier operario debe poder usar el sistema en 5 minutos
- **Rápido**: Escanear un código debe tomar menos de 1 segundo
- **Confiable**: El sistema debe funcionar sin internet (offline first cuando sea posible)

### 1.2 Reglas de Oro

1. **Mobile First**: Diseñar primero para tablet (dispositivo principal en planta)
2. **Touch Friendly**: Botones mínimo 44x44px para dedos
3. **Alto Contraste**: Legible en condiciones de luz variables (planta, almacén, camión)
4. **Feedback Inmediato**: Toda acción debe tener respuesta visual/sonora en < 200ms
5. **Modo Dual**: Toda funcionalidad debe funcionar con escaneo Y manualmente

## 2. PALETA DE COLORES

### 2.1 Colores Principales

\`\`\`css
:root {
  /* Marca / Primarios */
  --color-primary-50: #FFF7ED;   /* Fondo cálido */
  --color-primary-100: #FFEDD5;
  --color-primary-200: #FED7AA;
  --color-primary-300: #FDBA74;
  --color-primary-400: #FB923C;
  --color-primary-500: #F97316;  /* Naranja principal - botones, links */
  --color-primary-600: #EA580C;
  --color-primary-700: #C2410C;
  --color-primary-800: #9A3412;
  --color-primary-900: #7C2D12;

  /* Semánticos */
  --color-success: #22C55E;  /* Verde - operaciones exitosas */
  --color-warning: #F59E0B;  /* Ámbar - advertencias */
  --color-error: #EF4444;    /* Rojo - errores, bloqueos */
  --color-info: #3B82F6;     /* Azul - información */
  
  /* Estados de Lote */
  --color-lot-active: #22C55E;
  --color-lot-expiring: #F59E0B;
  --color-lot-expired: #EF4444;
  --color-lot-blocked: #8B5CF6;
  --color-lot-recalled: #DC2626;

  /* Neutros */
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-300: #D4D4D4;
  --color-gray-400: #A3A3A3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
}
\`\`\`

### 2.2 Uso de Colores por Contexto

| Contexto | Color | Uso |
|----------|-------|-----|
| Acciones principales | Naranja (primary-500) | Botones primarios, CTAs |
| Confirmar/Guardar | Verde (success) | Guardar, confirmar, aprobar |
| Cancelar/Eliminar | Rojo (error) | Cancelar, eliminar, rechazar |
| Advertencias | Ámbar (warning) | Alertas, caducidad próxima |
| Info | Azul (info) | Información, ayuda |
| Lote activo | Verde | Stock disponible |
| Lote por vencer | Ámbar | Caduca en < 7 días |
| Lote vencido | Rojo | No apto para expedición |
| Lote bloqueado | Púrpura | Alerta sanitaria activa |

## 3. TIPOGRAFÍA

### 3.1 Familias

\`\`\`css
/* Principal - Interfaz */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Monoespaciada - Códigos de lote, códigos de barras */
--font-mono: 'JetBrains Mono', 'Consolas', monospace;

/* Display - Títulos y números grandes (dashboard) */
--font-display: 'Inter', system-ui, sans-serif;
\`\`\`

### 3.2 Escala Tipográfica

| Nombre | Tamaño | Uso |
|--------|--------|-----|
| xs | 12px / 0.75rem | Etiquetas, badges pequeños |
| sm | 14px / 0.875rem | Texto secundario, tablas |
| base | 16px / 1rem | Texto general |
| lg | 18px / 1.125rem | Subtítulos |
| xl | 20px / 1.25rem | Títulos de sección |
| 2xl | 24px / 1.5rem | Títulos de página |
| 3xl | 30px / 1.875rem | Dashboard KPIs |
| 4xl | 36px / 2.25rem | Pantalla de escaneo |

### 3.3 Pesos

- **Regular (400)**: Texto general, tablas, formularios
- **Medium (500)**: Subtítulos, labels, botones
- **Semibold (600)**: Títulos, KPIs, navegación activa
- **Bold (700)**: Códigos de lote, números importantes

### 3.4 Regla Especial para Códigos

Todos los códigos de lote, códigos de barras, SKUs deben mostrarse en **JetBrains Mono** con `letter-spacing: 0.05em` para máxima legibilidad.

\`\`\`css
.lot-code {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: var(--color-gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
\`\`\`

## 4. ESPACIADO Y LAYOUT

### 4.1 Grid System

Usar grid de 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)

\`\`\`css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
\`\`\`

### 4.2 Breakpoints (Tailwind)

| Breakpoint | Min Width | Dispositivo |
|------------|-----------|-------------|
| sm | 640px | Teléfono landscape |
| md | 768px | Tablet portrait |
| lg | 1024px | Tablet landscape / Desktop pequeño |
| xl | 1280px | Desktop |
| 2xl | 1536px | Desktop grande |

### 4.3 Layout de Páginas

\`\`\`tsx
// Estructura estándar de página
<div className="flex flex-col h-screen">
  <Header />                    {/* 64px altura */}
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />                 {/* 280px ancho en desktop */}
    <main className="flex-1 overflow-y-auto p-6">
      <PageHeader />            {/* Título + breadcrumb + acciones */}
      <PageContent />           {/* Contenido principal */}
    </main>
  </div>
</div>
\`\`\`

## 5. COMPONENTES UI (Shadcn/ui)

### 5.1 Configuración Base

\`\`\`json
// components.json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
\`\`\`

### 5.2 Componentes Personalizados

Todos los componentes deben:
1. Extender los props de shadcn/ui
2. Aceptar `className` para personalización
3. Soportar variantes (`size`, `variant`, `intent`)
4. Tener documentación JSDoc

### 5.3 Variantes de Botones

| Variante | Uso |
|----------|-----|
| `default` | Acción principal (naranja) |
| `secondary` | Acción secundaria (gris) |
| `destructive` | Eliminar, cancelar (rojo) |
| `outline` | Acción terciaria |
| `ghost` | Navegación, iconos |
| `link` | Enlaces |
| `success` | Confirmar, guardar (verde) |
| `warning` | Advertencia (ámbar) |

### 5.4 Tamaños de Botones

| Tamaño | Altura | Padding | Uso |
|--------|--------|---------|-----|
| xs | 32px | 8px 12px | Tablas, badges |
| sm | 36px | 12px 16px | Formularios |
| md | 40px | 16px 20px | General (default) |
| lg | 48px | 20px 24px | Móvil/Tablet, escaneo |
| xl | 56px | 24px 32px | Botón de escanear principal |
| icon | 40px | 8px | Solo icono |

## 6. DISEÑO DE FORMULARIOS

### 6.1 Reglas

1. **Single Column**: Una columna en móvil/tablet, máximo 2 en desktop
2. **Label Arriba**: Labels siempre encima del input (no inline)
3. **Placeholder**: Usar para ejemplos, no para labels
4. **Validación en Tiempo Real**: Feedback inmediato al perder foco
5. **Mensajes de Error Claros**: "El código de lote debe tener el formato L + 6 dígitos + L + 1 dígito + 2 dígitos"

### 6.2 Estructura de Input

\`\`\`tsx
<div className="space-y-2">
  <Label htmlFor="lot-code" className="text-sm font-medium">
    Código de Lote
    <span className="text-destructive ml-1">*</span>
  </Label>
  <Input
    id="lot-code"
    placeholder="Ej: L260625L301"
    className="font-mono"
    {...register("lotCode")}
  />
  <p className="text-sm text-muted-foreground">
    Formato: L + fecha(YYMMDD) + línea + correlativo
  </p>
  <ErrorMessage field="lotCode" className="text-sm text-destructive" />
</div>
\`\`\`

### 6.3 Patrones Comunes

| Patrón | Cuándo usarlo |
|--------|---------------|
| Input + Botón Escanear | Campos de código de lote/barras |
| Select con búsqueda | Listas > 10 items |
| Combobox | Búsqueda autocompletada |
| DatePicker | Fechas de caducidad/producción |
| FileUpload con preview | Documentos adjuntos |
| Stepper/Wizard | Procesos de múltiples pasos (producción) |

## 7. ESTADOS Y FEEDBACK

### 7.1 Estados de UI

Todo componente debe manejar estos estados:
