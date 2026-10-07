/**
 * ==========================================================================
 * js/components/toolbar.js
 * Identity Design System (IDS) - Controlador de Barras de Herramientas (Toolbar)
 * Heurística WAI-ARIA Toolbar Pattern (RNEP, Roving Tabindex y Teclado)
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const TOOLBAR_SELECTOR = '[role="toolbar"], .ids-toolbar, .toolbar';
  const ITEM_SELECTOR = 'button:not(:disabled):not([aria-disabled="true"]), a:not([aria-disabled="true"]), input:not(:disabled), select:not(:disabled), [tabindex="0"]';

  /**
   * Obtiene todos los controles interactivos dentro de un toolbar
   * @param {HTMLElement} toolbarEl
   * @returns {HTMLElement[]}
   */
  function getToolbarItems(toolbarEl) {
    if (!toolbarEl) return [];
    return Array.from(toolbarEl.querySelectorAll(ITEM_SELECTOR));
  }

  /**
   * Manejador de navegación accesible por teclado (WAI-ARIA Toolbar Pattern)
   * @param {KeyboardEvent} e
   * @param {HTMLElement} toolbarEl
   */
  function handleToolbarKeydown(e, toolbarEl) {
    const isVertical = toolbarEl.getAttribute('aria-orientation') === 'vertical' ||
                       toolbarEl.classList.contains('ids-toolbar--vertical') ||
                       toolbarEl.classList.contains('toolbar--vertical');

    const items = getToolbarItems(toolbarEl);
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let targetIndex = -1;

    // Navegación con flechas direccionales
    if (isVertical) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
    } else {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        targetIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
    }

    // Teclas Home y End para saltos rápidos
    if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = items.length - 1;
    }

    if (targetIndex >= 0 && targetIndex < items.length) {
      items[targetIndex].focus();
    }
  }

  let isInitialized = false;

  /**
   * Inicializa las barras de herramientas en el DOM
   */
  function initToolbars() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Delegación de teclado para barras de herramientas
    document.addEventListener('keydown', function (e) {
      const activeEl = document.activeElement;
      if (!activeEl) return;

      const toolbarEl = activeEl.closest(TOOLBAR_SELECTOR);
      if (toolbarEl) {
        handleToolbarKeydown(e, toolbarEl);
      }
    });

    // 2. Delegación de clics para botones con alternancia de estado (aria-pressed)
    document.addEventListener('click', function (e) {
      const btn = e.target.closest(
        '.ids-toolbar__button[data-toggle="pressed"], .toolbar__button[data-toggle="pressed"], [role="toolbar"] button[aria-pressed]'
      );
      if (btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true') {
        const isPressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', isPressed ? 'false' : 'true');
        btn.classList.toggle('is-active', !isPressed);
      }
    });
  }

  // Exportar en el objeto global
  global.IDSToolbar = {
    init: initToolbars,
    getItems: getToolbarItems
  };

  global.IDS = global.IDS || {};
  global.IDS.toolbar = global.IDSToolbar;

  // Inicialización automática cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolbars);
  } else {
    initToolbars();
  }

})(typeof window !== 'undefined' ? window : this);
