/**
 * ==========================================================================
 * js/components/global-nav.js
 * Identity Design System (IDS) - Controlador de Navegación Global (Top Navbar)
 * Heurística WAI-ARIA RNEP (Rol, Nombre, Estado, Propiedad) y Accesibilidad Móvil
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const NAV_SELECTOR = '.ids-global-nav';
  const TOGGLE_SELECTOR = '.ids-global-nav__toggle';
  const COLLAPSE_SELECTOR = '.ids-global-nav__collapse';

  /**
   * Abre o cierra el panel colapsable de navegación móvil
   * @param {HTMLElement} nav - Contenedor .ids-global-nav
   * @param {HTMLElement} toggleBtn - Botón disparador hamburguesa
   * @param {HTMLElement} collapse - Panel colapsable
   * @param {boolean} [forceState] - Estado explícito opcional (true = abrir, false = cerrar)
   */
  function toggleNavCollapse(nav, toggleBtn, collapse, forceState) {
    if (!toggleBtn || !collapse) return;

    const isCurrentlyExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyExpanded;

    toggleBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    collapse.classList.toggle('is-open', shouldOpen);
    collapse.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');

    if (shouldOpen) {
      // Enfocar el primer enlace o botón interactivo dentro del menú colapsable
      const firstFocusable = collapse.querySelector('a, button, input, [tabindex="0"]');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    } else {
      // Regresar foco accesible al toggle
      toggleBtn.focus();
    }
  }

  /**
   * Cierra todos los paneles de navegación abiertos
   */
  function closeAllNavCollapses() {
    const navs = document.querySelectorAll(NAV_SELECTOR);
    navs.forEach(nav => {
      const toggle = nav.querySelector(TOGGLE_SELECTOR);
      const collapse = nav.querySelector(COLLAPSE_SELECTOR);
      if (toggle && collapse && toggle.getAttribute('aria-expanded') === 'true') {
        toggleNavCollapse(nav, toggle, collapse, false);
      }
    });
  }

  let isGlobalListenersAttached = false;

  /**
   * Inicializa las instancias de navegación global en el DOM
   * @param {HTMLElement|Document} [root=document]
   */
  function initGlobalNav(root = document) {
    const navs = root.querySelectorAll(NAV_SELECTOR);
    if (!navs.length && isGlobalListenersAttached) return;

    navs.forEach(nav => {
      if (nav.dataset.idsNavInit === 'true') return;
      nav.dataset.idsNavInit = 'true';

      const toggleBtn = nav.querySelector(TOGGLE_SELECTOR);
      const collapse = nav.querySelector(COLLAPSE_SELECTOR);

      if (!toggleBtn || !collapse) return;

      // Garantizar atributos ARIA RNEP iniciales
      if (!toggleBtn.hasAttribute('aria-expanded')) {
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      if (!toggleBtn.hasAttribute('aria-label')) {
        toggleBtn.setAttribute('aria-label', 'Alternar menú de navegación');
      }

      // Si no tiene id, generarlo para aria-controls
      if (!collapse.id) {
        collapse.id = 'ids-global-nav-collapse-' + Math.random().toString(36).substring(2, 9);
      }
      toggleBtn.setAttribute('aria-controls', collapse.id);

      // Evento de clic en el botón de alternancia
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNavCollapse(nav, toggleBtn, collapse);
      });

      // En pantallas pequeñas, cerrar el menú al hacer clic en un enlace de navegación
      const links = collapse.querySelectorAll('.ids-global-nav__link');
      links.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 1024) {
            toggleNavCollapse(nav, toggleBtn, collapse, false);
          }
        });
      });
    });

    if (isGlobalListenersAttached) return;
    isGlobalListenersAttached = true;

    // Cierre al presionar la tecla Escape (WCAG AAA)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openNavToggle = document.querySelector(`${TOGGLE_SELECTOR}[aria-expanded="true"]`);
        if (openNavToggle) {
          const nav = openNavToggle.closest(NAV_SELECTOR);
          const collapse = nav ? nav.querySelector(COLLAPSE_SELECTOR) : null;
          if (nav && collapse) {
            toggleNavCollapse(nav, openNavToggle, collapse, false);
          }
        }
      }
    });

    // Cierre al hacer clic fuera de la barra de navegación
    document.addEventListener('click', (e) => {
      const openNavToggle = document.querySelector(`${TOGGLE_SELECTOR}[aria-expanded="true"]`);
      if (openNavToggle) {
        const nav = openNavToggle.closest(NAV_SELECTOR);
        if (nav && !nav.contains(e.target)) {
          const collapse = nav.querySelector(COLLAPSE_SELECTOR);
          if (collapse) {
            toggleNavCollapse(nav, openNavToggle, collapse, false);
          }
        }
      }
    });

    // Ajuste al redimensionar ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        closeAllNavCollapses();
      }
    });
  }

  // Exportar a espacio global de IDS
  global.IDS = global.IDS || {};
  global.IDS.GlobalNav = {
    init: initGlobalNav,
    toggle: toggleNavCollapse,
    closeAll: closeAllNavCollapses
  };
  global.IDS.globalNav = global.IDS.GlobalNav;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initGlobalNav());
  } else {
    initGlobalNav();
  }

})(typeof window !== 'undefined' ? window : this);
