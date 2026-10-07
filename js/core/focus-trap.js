/**
 * ==========================================================================
 * js/core/focus-trap.js
 * Identity Design System (IDS) - Captura de Foco Bidireccional (Focus Trap)
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  global.IDS = global.IDS || {};

  /**
   * Selector canónico de elementos interactivos enfocables según WAI-ARIA
   */
  const FOCUSABLE_SELECTOR = [
    'button:not([disabled]):not([aria-disabled="true"])',
    'a[href]:not([disabled]):not([aria-disabled="true"])',
    'input:not([disabled]):not([type="hidden"]):not([aria-disabled="true"])',
    'select:not([disabled]):not([aria-disabled="true"])',
    'textarea:not([disabled]):not([aria-disabled="true"])',
    '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])',
    'summary:not([disabled])',
    'iframe',
    'audio[controls]',
    'video[controls]'
  ].join(', ');

  /**
   * Determina si un elemento está visible en la pantalla (renderizado en layout)
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  function isVisible(el) {
    if (!el) return false;
    return !!(
      el.offsetWidth ||
      el.offsetHeight ||
      el.getClientRects().length ||
      el.offsetParent !== null
    );
  }

  /**
   * Obtiene la lista ordenada de elementos enfocables y visibles dentro de un contenedor
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    if (!container || !(container instanceof HTMLElement)) return [];

    const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    return elements.filter((el) => {
      const isAriaHidden = el.getAttribute('aria-hidden') === 'true' || !!el.closest('[aria-hidden="true"]');
      return !isAriaHidden && isVisible(el);
    });
  }

  /**
   * Captura y cicla el foco de forma bidireccional estricta (Tab / Shift + Tab)
   * WAI-ARIA Heurística RNEP: no permite escape inadvertido del foco.
   * @param {HTMLElement} container - Contenedor delimitador (diálogo, modal, panel offcanvas)
   * @param {KeyboardEvent} event - Evento de teclado originado por el navegador
   */
  function trap(container, event) {
    if (!container || !event || event.key !== 'Tab') return;

    const focusable = getFocusableElements(container);

    // Caso borde: Si no existen controles interactivos, enfocar el contenedor mismo
    if (focusable.length === 0) {
      event.preventDefault();
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeEl = document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab (Ciclo inverso hacia atrás):
      // Si el foco se halla en el primer elemento, en el contenedor o fuera de él, saltar al último
      if (activeEl === first || activeEl === container || !container.contains(activeEl)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
    } else {
      // Tab (Ciclo directo hacia adelante):
      // Si el foco se halla en el último elemento, en el contenedor o fuera de él, saltar al primero
      if (activeEl === last || activeEl === container || !container.contains(activeEl)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }
  }

  /**
   * Pila de trampas de foco activas (soporta modales apilados o superpuestos)
   */
  const activeTraps = [];

  /**
   * Activa una trampa de foco continua en un contenedor específico
   * @param {HTMLElement} container
   * @param {Object} [options]
   * @param {HTMLElement} [options.initialFocus] - Elemento específico a enfocar al iniciar
   * @param {HTMLElement} [options.triggerEl] - Elemento detonador para devolver el foco al cerrar
   * @param {Function} [options.onEscape] - Callback ejecutado al presionar Escape
   * @returns {Function} Función para desactivar la trampa
   */
  function activate(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      return () => {};
    }

    const savedTrigger = options.triggerEl || document.activeElement;

    function handleKeydown(event) {
      if (event.key === 'Tab') {
        trap(container, event);
      } else if (event.key === 'Escape' && typeof options.onEscape === 'function') {
        options.onEscape(event);
      }
    }

    document.addEventListener('keydown', handleKeydown, true);

    const trapRecord = {
      container,
      savedTrigger,
      handleKeydown,
      options
    };
    activeTraps.push(trapRecord);

    // Otorgar foco inicial protegido con preventScroll (WCAG AAA)
    requestAnimationFrame(() => {
      if (options.initialFocus && isVisible(options.initialFocus)) {
        options.initialFocus.focus({ preventScroll: true });
      } else {
        const focusable = getFocusableElements(container);
        if (focusable.length > 0) {
          focusable[0].focus({ preventScroll: true });
        } else {
          if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '-1');
          }
          container.focus({ preventScroll: true });
        }
      }
    });

    return function deactivateCurrent(deactOptions = {}) {
      deactivate(container, deactOptions);
    };
  }

  /**
   * Desactiva la trampa de foco y devuelve el foco al control detonador
   * @param {HTMLElement} [container] - Contenedor a desactivar. Si se omite, desactiva la más reciente.
   * @param {Object} [options]
   * @param {boolean} [options.returnFocus=true] - Si debe retornar el foco al detonador
   */
  function deactivate(container, options = { returnFocus: true }) {
    let index = -1;
    if (container) {
      index = activeTraps.findIndex((t) => t.container === container);
    } else {
      index = activeTraps.length - 1;
    }

    if (index === -1) return;

    const trapRecord = activeTraps.splice(index, 1)[0];
    document.removeEventListener('keydown', trapRecord.handleKeydown, true);

    if (options.returnFocus !== false && trapRecord.savedTrigger && typeof trapRecord.savedTrigger.focus === 'function') {
      requestAnimationFrame(() => {
        trapRecord.savedTrigger.focus({ preventScroll: true });
      });
    }
  }

  const FocusTrap = {
    getFocusableElements,
    trap,
    activate,
    deactivate,
    focusableSelector: FOCUSABLE_SELECTOR
  };

  global.IDS.focusTrap = FocusTrap;
})(typeof window !== 'undefined' ? window : this);
