# Identity Design System (IDS)

> **El sistema de diseño ético, agnóstico y radicalmente fácil de usar.**

[![Sector: Tech For Human Rights](https://img.shields.io/badge/Sector-Tech%20For%20Human%20Rights%20(T4HR)-1a365d.svg)](#)
[![Accessibility: WCAG AAA](https://img.shields.io/badge/Accessibility-WCAG%20AAA%20(7:1)-2e7d32.svg)](#)
[![Philosophy: Trauma--Informed](https://img.shields.io/badge/Philosophy-Trauma--Informed%20Design-6a1b9a.svg)](#)
[![Consent: F.R.I.E.S.](https://img.shields.io/badge/Consent-Consentful--Tech%20(F.R.I.E.S.)-00695c.svg)](#)
[![Stack: Vanilla JS & SCSS](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20SCSS-e65100.svg)](#)
[![Dependencies: Zero](https://img.shields.io/badge/Dependencies-0%20(No%20CDNs)-000000.svg)](#)

---

## Descripción General

El **Identity Design System (IDS)** es un marco de diseño agnóstico e independiente creado para construir interfaces escalables, accesibles y cohesivas en el sector **Tech For Human Rights (T4HR)**. IDS no es solo otra biblioteca de componentes de interfaz de usuario; representa una evolución frente a frameworks tradicionales como Bootstrap o Tailwind.

Construido estrictamente con **SCSS modular** y **Vanilla JavaScript**, IDS elimina el exceso de dependencias, el bloqueo de frameworks (*framework lock-in*) y la complejidad innecesaria, ofreciendo un sistema altamente escalable, ético y autocontenido.

---

## La Directriz "Easy-to-Use"

En IDS, creemos firmemente que la accesibilidad y el diseño ético no deben ser difíciles de implementar. Nuestra directriz principal es ser **extremadamente fáciles de usar** para cualquier equipo de diseño y desarrollo:

* **Arquitectura de "Esqueleto y Piel":** Implementa la estructura y la lógica de accesibilidad (el esqueleto) con clases predecibles basadas en la metodología BEM, e inyecta la identidad visual de tu marca (la piel) únicamente modificando el archivo central de variables CSS (Design Tokens). Cero necesidad de refactorizar código.
* **Cero Dependencias, Cero CDNs:** Sin librerías de terceros complejas, configuraciones pesadas de empaquetadores ni dependencias reactivas. Todo el poder de IDS reside en Vanilla JS puro y CSS nativo; opera con tipografía local y enfoque *offline-first* para garantizar la máxima privacidad.
* **Agnóstico al Contexto:** Los componentes se adaptan fluidamente al contenedor padre (*Layout and Content Agnostic*), gestionando textos largos y estados vacíos automáticamente. Simplemente copia, pega y funcionará.
* **Metodología Predictiva con Atomic Design:** Código organizado bajo principios claros y predecibles, estructurado desde lo indivisible (Átomos y Moléculas) hasta lo funcionalmente complejo (Organismos y Plantillas).

---

## Los 6 Ejes del Sistema (Nuestros Pilares)

A diferencia de bibliotecas de componentes enfocadas únicamente en el aspecto estético superficial, IDS audita y construye cada pieza bajo **6 ejes normativos innegociables**:

### 1. Accesibilidad Extrema (WCAG AAA y WAI-ARIA)
Accesible por defecto. Garantizamos contrastes superiores a 7:1 en temas dedicados, navegación integral por teclado sin trampas de foco, etiquetas semánticas HTML5 nativas y soporte estricto para `@media (prefers-reduced-motion: reduce)`. Se implementa rigurosamente la heurística **RNEP** (*Rol, Nombre, Estado y Propiedad*) en cada control e interacción interactiva.

### 2. Tecnología Consentida (Consentful-Tech)
Implementación integral del framework **F.R.I.E.S.** (*Freely given, Reversible, Informed, Enthusiastic, Specific*). Las interfaces nunca manipulan ni engañan a las personas usuarias:
* Prohibición absoluta de patrones oscuros (*dark patterns*).
* Los controles de consentimiento (aceptar y rechazar) poseen idéntica jerarquía y peso visual en el DOM.
* Flujos transparentes y reversibles en cualquier instante.

### 3. Adaptación Responsive y Fluida
Diseño verdaderamente *Mobile-First*. No dependemos de píxeles estáticos: utilizamos unidades relativas (`rem`, `vh`, `vw`, `clamp()`) para asegurar que la tipografía, el espaciado y la geometría escalen de forma orgánica en cualquier pantalla, soportando ampliaciones de zoom de hasta un 200% sin ruptura de interfaces.

### 4. Excelencia en Código (SCSS/CSS y Vanilla JS)
Desarrollado bajo la metodología *Atomic Design* estricta. Separación rigurosa de la lógica visual mediante *Design Tokens*. El código JavaScript está encapsulado, prioriza la delegación de eventos y no contamina el entorno global, asegurando compatibilidad e interoperabilidad inmediata en cualquier stack técnico.

### 5. Trauma-Informed Design (TID)
Diseñado para reducir la carga cognitiva y prevenir estados de hipervigilancia o estrés en entornos sensibles de derechos humanos:
* Microcopia objetiva, clara y libre de culpabilización.
* Vías de salida rápidas y seguras sin fricción.
* Advertencias de contenido previo (*Content Warnings*) antes de interactuar con datos o relatos sensibles.
* Mecanismos de "Deshacer" (*Undo*) y autoguardado para erradicar la ansiedad ante errores destructivos accidentales.

### 6. Agnosticidad y Reusabilidad
Componentes desacoplados de su contenedor y resilientes a contenido dinámico. La configuración y los estados se leen directamente desde atributos `data-*` nativos en el DOM, permitiendo reutilizar el mismo organismo en múltiples aplicaciones y plataformas sin alterar el código fuente.

---

## Tematización Dinámica

IDS incluye 4 ejes temáticos controlados a nivel de documento mediante atributos `data-theme`:

| Modo | Atributo | Propósito |
| :--- | :--- | :--- |
| **Default** | `data-theme="default"` | Paleta equilibrada optimizada para lectura diurna y nocturna. |
| **High Contrast** | `data-theme="high-contrast"` | Cumplimiento estricto WCAG AAA con ratios de contraste superiores a 7:1. |
| **Low Stimulation** | `data-theme="low-stimulation"` | Reducción deliberada de saturación y brillo para mitigar sobrecarga sensorial y neurodivergencias. |
| **Stealth** | `data-theme="stealth"` | Modo de alta discreción para proteger la privacidad visual en contextos de riesgo o monitoreo. |

---

## Estructura de la Arquitectura (Atomic Design)

```text
IDS/
├── scss/
│   ├── 00-tokens/       # Variables semánticas, colores, espaciados y temas (_themes.scss)
│   ├── 01-base/         # Reseteos A11y, normalizaciones y tipografía base (_typography.scss)
│   ├── 02-atoms/        # Elementos indivisibles (_buttons, _inputs, _badges, _icons)
│   ├── 03-molecules/    # Grupos simples UI (_form-group, _alerts, _breadcrumbs)
│   ├── 04-organisms/    # Componentes modulares complejos (_modal-dialog, _cards, _tables)
│   ├── 05-templates/    # Esqueletos y estructuras de layout (_wizards, _grids)
│   └── main.scss        # Importador secuencial principal
├── js/
│   ├── core/            # Módulos globales (conmutador de temas, focus trap, aria-live)
│   ├── components/      # Comportamientos específicos por componente
│   └── ids-main.js      # Inicializador y despachador del sistema
├── compilaciones/       # Archivos listos para producción (ids.min.css, ids.min.js)
└── README.md            # Documentación general del sistema
```

---

## Inicio Rápido

Para integrar IDS en cualquier proyecto web sin dependencias externas:

### 1. Vincular los estilos
```html
<!-- En el <head> de tu documento HTML -->
<link rel="stylesheet" href="css/main.css">
<!-- O la versión minificada compilada: -->
<!-- <link rel="stylesheet" href="compilaciones/ids.min.css"> -->
```

### 2. Vincular el script
```html
<!-- Al final del <body> -->
<script src="js/ids-main.js"></script>
<!-- O la versión minificada compilada: -->
<!-- <script src="compilaciones/ids.min.js"></script> -->
```

### 3. Establecer el tema
Define el tema base en la etiqueta raíz:
```html
<html lang="es" data-theme="default" data-color-scheme="dark">
```

---

## Empieza a construir hoy

Deja atrás los frameworks pesados y adopta un modelo de diseño verdaderamente centrado en los derechos humanos, la accesibilidad universal y la autonomía de las personas usuarias.
