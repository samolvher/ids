/**
 * ==========================================================================
 * js/components/fab.js
 * Identity Design System (IDS) - Controlador de Floating Action Buttons (FAB),
 * Speed Dial (.ids-fab-group) y Menú Flotante Contextual (.ids-fab-menu / .fab-menu)
 * Heurística WAI-ARIA RNEP (Rol, Nombre, Estado, Propiedad) y Accesibilidad de Teclado
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  // Selectores universales para contenedores de FAB interactivo
  const CONTAINER_SELECTOR = '.ids-fab-group, .ids-fab-menu, .fab-menu';
  const OPEN_SELECTOR = '.ids-fab-group.is-open, .ids-fab-group[aria-expanded="true"], .ids-fab-menu.is-open, .ids-fab-menu[aria-expanded="true"], .fab-menu.is-open, .fab-menu[aria-expanded="true"]';
  const TRIGGER_SELECTOR = '.ids-fab-group__trigger, .ids-fab-menu__trigger, .fab-menu__trigger, .ids-fab';

  /**
   * Obtiene el botón disparador de un contenedor FAB
   * @param {HTMLElement} container
   * @returns {HTMLElement|null}
   */
  function getTrigger(container) {
    if (!container) return null;
    return container.querySelector(TRIGGER_SELECTOR);
  }

  /**
   * Obtiene el panel de contenido desplegable (acciones speed-dial o panel de menú)
   * @param {HTMLElement} container
   * @returns {HTMLElement|null}
   */
  function getExpandablePanel(container) {
    if (!container) return null;
    return container.querySelector(
      '.ids-fab-group__actions, .ids-fab-menu__panel, .fab-menu__panel, .ids-fab-menu__menu, .fab-menu__menu'
    );
  }

  /**
   * Cierra un contenedor de FAB (Speed Dial o FAB Menu) y actualiza atributos ARIA
   * @param {HTMLElement} container - Contenedor .ids-fab-group, .ids-fab-menu o .fab-menu
   * @param {boolean} restoreFocus - Si debe regresar el foco al botón principal
   */
  function closeFab(container, restoreFocus = false) {
    if (!container) return;

    container.classList.remove('is-open');
    container.classList.remove('ids-fab-group--open');
    container.classList.remove('ids-fab-menu--open');
    container.classList.remove('fab-menu--open');
    container.setAttribute('aria-expanded', 'false');

    const trigger = getTrigger(container);
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        trigger.focus();
      }
    }
  }

  /**
   * Cierra todos los contenedores de FAB abiertos
   * @param {HTMLElement|null} exceptContainer - Contenedor opcional a excluir
   */
  function closeAllFabs(exceptContainer = null) {
    const openContainers = document.querySelectorAll(OPEN_SELECTOR);
    openContainers.forEach(container => {
      if (container !== exceptContainer) {
        closeFab(container, false);
      }
    });
  }

  /**
   * Abre un contenedor de FAB (Speed Dial o FAB Menu)
   * @param {HTMLElement} container - Contenedor .ids-fab-group, .ids-fab-menu o .fab-menu
   */
  function openFab(container) {
    if (!container) return;
    closeAllFabs(container);

    container.classList.add('is-open');
    if (container.classList.contains('ids-fab-group')) {
      container.classList.add('ids-fab-group--open');
    }
    if (container.classList.contains('ids-fab-menu')) {
      container.classList.add('ids-fab-menu--open');
    }
    if (container.classList.contains('fab-menu')) {
      container.classList.add('fab-menu--open');
    }
    container.setAttribute('aria-expanded', 'true');

    const trigger = getTrigger(container);
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Alterna el estado abierto/cerrado de un contenedor de FAB
   * @param {HTMLElement} container
   */
  function toggleFab(container) {
    if (!container) return;
    const isOpen = container.classList.contains('is-open') || 
                   container.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeFab(container, true);
    } else {
      openFab(container);
    }
  }

  /**
   * Manejo de navegación por teclado dentro de un panel abierto (WCAG AAA)
   * @param {KeyboardEvent} e
   * @param {HTMLElement} panel
   * @param {HTMLElement} container
   */
  function handlePanelKeydown(e, panel, container) {
    const focusableItems = Array.from(
      panel.querySelectorAll('a:not([aria-disabled="true"]), button:not(:disabled):not([aria-disabled="true"]), [tabindex="0"]')
    );
    if (!focusableItems.length) return;

    const currentIndex = focusableItems.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
      focusableItems[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
      focusableItems[prevIndex].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusableItems[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusableItems[focusableItems.length - 1].focus();
    }
  }

  let isInitialized = false;

  /**
   * Inicializa los escuchadores globales de eventos para FABs, Speed Dials y FAB Menus
   */
  function initFabs() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Delegación de clics para disparadores y elementos interactivos
    document.addEventListener('click', function (e) {
      // Caso A: Clic en el botón principal dentro de un Speed Dial o FAB Menu
      const trigger = e.target.closest(
        '.ids-fab-group .ids-fab-group__trigger, .ids-fab-group > .ids-fab, ' +
        '.ids-fab-menu .ids-fab-menu__trigger, .ids-fab-menu > .ids-fab, ' +
        '.fab-menu .fab-menu__trigger, .fab-menu > .ids-fab'
      );
      if (trigger) {
        const container = trigger.closest(CONTAINER_SELECTOR);
        if (container) {
          const panel = getExpandablePanel(container);
          if (panel) {
            e.preventDefault();
            toggleFab(container);
            return;
          }
        }
      }

      // Caso B: Clic en una acción dentro de Speed Dial o FAB Menu (ejecutar y cerrar)
      const actionItem = e.target.closest(
        '.ids-fab-group__actions .ids-fab, .ids-fab-group__actions a, .ids-fab-group__actions button, ' +
        '.ids-fab-menu__link, .fab-menu__link, .ids-fab-menu__action, .fab-menu__action, ' +
        '.ids-fab-menu__panel a, .fab-menu__panel a, .ids-fab-menu__panel button, .fab-menu__panel button'
      );
      if (actionItem) {
        const container = actionItem.closest(CONTAINER_SELECTOR);
        if (container) {
          closeFab(container, true);
          return;
        }
      }

      // Caso C: Clic fuera (Light Dismiss universal)
      const clickedInside = e.target.closest(CONTAINER_SELECTOR);
      if (!clickedInside) {
        closeAllFabs();
      }
    });

    // 2. Descarte accesible mediante tecla Escape y navegación por teclado (WCAG 2.2 / AAA)
    document.addEventListener('keydown', function (e) {
      const openContainers = Array.from(document.querySelectorAll(OPEN_SELECTOR));
      if (!openContainers.length) return;

      // Escape: Descartar todos los menús y devolver foco al disparador activo
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        openContainers.forEach(container => closeFab(container, true));
        return;
      }

      // Si el foco está dentro de un contenedor abierto o en su trigger
      const activeContainer = openContainers.find(container => container.contains(document.activeElement));
      if (activeContainer) {
        const panel = getExpandablePanel(activeContainer);
        const trigger = getTrigger(activeContainer);

        // Si el foco está en el trigger y presiona ArrowDown, mover foco al primer ítem del panel
        if (document.activeElement === trigger && e.key === 'ArrowDown' && panel) {
          e.preventDefault();
          const firstItem = panel.querySelector('a:not([aria-disabled="true"]), button:not(:disabled):not([aria-disabled="true"])');
          if (firstItem) {
            firstItem.focus();
          }
          return;
        }

        // Si el foco está dentro del panel, permitir navegación con flechas
        if (panel && panel.contains(document.activeElement)) {
          handlePanelKeydown(e, panel, activeContainer);
        }
      }
    });
  }

  // Exportar en el objeto global para acceso modular
  global.IDSFab = {
    init: initFabs,
    open: openFab,
    close: closeFab,
    closeAll: closeAllFabs,
    toggle: toggleFab,
    // Aliases semánticos para Speed Dial y FAB Menu
    openGroup: openFab,
    closeGroup: closeFab,
    toggleGroup: toggleFab,
    openMenu: openFab,
    closeMenu: closeFab,
    toggleMenu: toggleFab
  };

  global.IDS = global.IDS || {};
  global.IDS.fab = global.IDSFab;

  // Inicializar automáticamente cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFabs);
  } else {
    initFabs();
  }

})(typeof window !== 'undefined' ? window : this);
