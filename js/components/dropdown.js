/**
 * ==========================================================================
 * js/components/dropdown.js
 * Identity Design System (IDS) - Controlador de Menús Desplegables (Dropdowns)
 * Heurística WAI-ARIA RNEP (Rol, Nombre, Estado, Propiedad) y Accesibilidad de Teclado
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  /**
   * Cierra un menú desplegable específico y restaura el foco si se solicita
   * @param {HTMLElement} dropdown - Contenedor .ids-dropdown
   * @param {boolean} restoreFocus - Si debe regresar el foco al botón disparador
   */
  function closeDropdown(dropdown, restoreFocus = false) {
    if (!dropdown) return;
    const trigger = dropdown.querySelector('.ids-dropdown__trigger');
    const menu = dropdown.querySelector('.ids-dropdown__menu');

    dropdown.classList.remove('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        trigger.focus();
      }
    }
    if (menu) {
      menu.classList.remove('is-visible');
      // Neutralizar estilos inline restrictivos de maquetas estáticas
      if (menu.style.display && menu.style.display !== 'none') {
        menu.dataset.prevInlineDisplay = menu.style.display;
        menu.style.display = 'none';
      }
    }
  }

  /**
   * Cierra todos los menús desplegables abiertos excepto el opcionalmente excluido
   * @param {HTMLElement|null} exceptDropdown
   */
  function closeAllDropdowns(exceptDropdown = null) {
    const openDropdowns = document.querySelectorAll('.ids-dropdown.is-open, .ids-dropdown__trigger[aria-expanded="true"]');
    openDropdowns.forEach(el => {
      const container = el.classList.contains('ids-dropdown') ? el : el.closest('.ids-dropdown');
      if (container && container !== exceptDropdown) {
        closeDropdown(container, false);
      }
    });
  }

  /**
   * Abre un menú desplegable y coloca el foco en el primer ítem si fue abierto por teclado
   * @param {HTMLElement} dropdown - Contenedor .ids-dropdown
   * @param {boolean} focusFirstItem - Si debe enfocar el primer elemento interactivo
   */
  function openDropdown(dropdown, focusFirstItem = false) {
    if (!dropdown) return;
    closeAllDropdowns(dropdown);

    const trigger = dropdown.querySelector('.ids-dropdown__trigger');
    const menu = dropdown.querySelector('.ids-dropdown__menu');

    dropdown.classList.add('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
    if (menu) {
      menu.classList.add('is-visible');
      if (menu.style.display === 'none') {
        menu.style.display = menu.dataset.prevInlineDisplay || '';
      }

      if (focusFirstItem) {
        const firstItem = menu.querySelector('.ids-dropdown__item:not([disabled]):not([aria-disabled="true"]), [role="menuitem"]:not([disabled])');
        if (firstItem) {
          firstItem.focus();
        }
      }
    }
  }

  /**
   * Alterna la apertura/cierre de un menú desplegable
   * @param {HTMLElement} dropdown
   * @param {boolean} focusFirstItem
   */
  function toggleDropdown(dropdown, focusFirstItem = false) {
    if (!dropdown) return;
    const trigger = dropdown.querySelector('.ids-dropdown__trigger');
    const isExpanded = (trigger && trigger.getAttribute('aria-expanded') === 'true') || dropdown.classList.contains('is-open');

    if (isExpanded) {
      closeDropdown(dropdown, true);
    } else {
      openDropdown(dropdown, focusFirstItem);
    }
  }

  let isInitialized = false;

  /**
   * Inicializa los controladores de eventos para todos los dropdowns en el documento
   */
  function initDropdowns() {
    // Normalizar menús estáticos que tengan inline display pero aria-expanded="false"
    const closedMenus = document.querySelectorAll('.ids-dropdown:not(.is-open) .ids-dropdown__menu');
    closedMenus.forEach(menu => {
      const dropdown = menu.closest('.ids-dropdown');
      const trigger = dropdown ? dropdown.querySelector('.ids-dropdown__trigger') : null;
      if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
        if (menu.style.display && menu.style.display !== 'none') {
          menu.dataset.prevInlineDisplay = menu.style.display;
          menu.style.display = 'none';
        }
      }
    });

    if (isInitialized) return;
    isInitialized = true;

    // 1. Delegación de clics para abrir/cerrar menús
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.ids-dropdown__trigger');
      
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = trigger.closest('.ids-dropdown');
        if (dropdown) {
          toggleDropdown(dropdown, false);
        }
        return;
      }

      // Si hace clic en un ítem de menú que no sea un control persistente
      const item = e.target.closest('.ids-dropdown__item, [role="menuitem"]');
      if (item) {
        const dropdown = item.closest('.ids-dropdown');
        const role = item.getAttribute('role');
        if (role !== 'menuitemcheckbox' && role !== 'menuitemradio' && !item.hasAttribute('data-ids-keep-open')) {
          closeDropdown(dropdown, true);
        }
        return;
      }

      // Clic fuera de cualquier dropdown: cerrar todos
      if (!e.target.closest('.ids-dropdown')) {
        closeAllDropdowns();
      }
    });

    // 2. Navegación accesible por teclado (WCAG AAA & WAI-ARIA Menu Button Pattern)
    document.addEventListener('keydown', function (e) {
      const activeElement = document.activeElement;
      const openDropdownEl = document.querySelector('.ids-dropdown.is-open');

      // Tecla Escape: cerrar el menú activo y retornar el foco al botón disparador
      if (e.key === 'Escape' && openDropdownEl) {
        e.preventDefault();
        closeDropdown(openDropdownEl, true);
        return;
      }

      // Si el foco está en el botón disparador
      if (activeElement && activeElement.classList.contains('ids-dropdown__trigger')) {
        const dropdown = activeElement.closest('.ids-dropdown');

        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDropdown(dropdown, true);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          openDropdown(dropdown, false);
          const menu = dropdown.querySelector('.ids-dropdown__menu');
          const items = menu ? menu.querySelectorAll('.ids-dropdown__item:not([disabled]):not([aria-disabled="true"])') : [];
          if (items.length) {
            items[items.length - 1].focus();
          }
        }
        return;
      }

      // Si el foco está dentro de un ítem del menú desplegable
      if (activeElement && (activeElement.classList.contains('ids-dropdown__item') || activeElement.getAttribute('role') === 'menuitem')) {
        const dropdown = activeElement.closest('.ids-dropdown');
        const menu = dropdown ? dropdown.querySelector('.ids-dropdown__menu') : null;
        if (!menu) return;

        const items = Array.from(menu.querySelectorAll('.ids-dropdown__item:not([disabled]):not([aria-disabled="true"]), [role="menuitem"]:not([disabled])'));
        const currentIndex = items.indexOf(activeElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1]?.focus();
        } else if (e.key === 'Tab') {
          closeDropdown(dropdown, false);
        }
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.dropdown = {
    init: initDropdowns,
    open: openDropdown,
    close: closeDropdown,
    toggle: toggleDropdown
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})(typeof window !== 'undefined' ? window : this);
