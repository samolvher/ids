/**
 * ==========================================================================
 * js/components/popover.js
 * Identity Design System (IDS) - Controlador de Ventanas Emergentes (Popover)
 * Heurística WAI-ARIA RNEP (Rol, Nombre, Estado, Propiedad), Light-Dismiss y Escape Key
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  function closePopover(popover, restoreFocus = false) {
    if (!popover) return;

    popover.classList.remove('is-open');
    popover.classList.remove('ids-popover--open');
    popover.setAttribute('aria-hidden', 'true');

    if (popover.style.display && popover.style.display !== 'none') {
      popover.dataset.prevInlineDisplay = popover.style.display;
      popover.style.display = 'none';
    }

    if (typeof popover.hidePopover === 'function' && popover.matches(':popover-open')) {
      try {
        popover.hidePopover();
      } catch (err) {}
    }

    const popoverId = popover.id;
    let trigger = null;
    if (popoverId) {
      trigger = document.querySelector(`[data-ids-popover-target="${popoverId}"], [aria-controls="${popoverId}"]`);
    }
    if (!trigger) {
      const wrapper = popover.closest('.ids-popover-wrapper');
      if (wrapper) {
        trigger = wrapper.querySelector('.ids-popover-trigger, button, [aria-expanded]');
      }
    }

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        trigger.focus();
      }
    }
  }

  function closeAllPopovers(exceptPopover = null) {
    const openPopovers = document.querySelectorAll('.ids-popover.is-open, .ids-popover.ids-popover--open, .ids-popover[aria-hidden="false"]');
    openPopovers.forEach(popover => {
      if (popover !== exceptPopover) {
        closePopover(popover, false);
      }
    });
  }

  function openPopover(popover, trigger = null) {
    if (!popover) return;
    closeAllPopovers(popover);

    popover.classList.add('is-open');
    popover.classList.add('ids-popover--open');
    popover.setAttribute('aria-hidden', 'false');

    if (popover.style.display === 'none') {
      popover.style.display = popover.dataset.prevInlineDisplay || 'block';
    }

    if (typeof popover.showPopover === 'function' && !popover.matches(':popover-open')) {
      try {
        popover.showPopover();
      } catch (err) {}
    }

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      const popoverId = popover.id;
      if (popoverId) {
        const foundTrigger = document.querySelector(`[data-ids-popover-target="${popoverId}"], [aria-controls="${popoverId}"]`);
        if (foundTrigger) foundTrigger.setAttribute('aria-expanded', 'true');
      }
    }
  }

  function togglePopover(popover, trigger = null) {
    if (!popover) return;
    const isOpen = popover.classList.contains('is-open') || 
                   popover.classList.contains('ids-popover--open') || 
                   popover.getAttribute('aria-hidden') === 'false';
    if (isOpen) {
      closePopover(popover, true);
    } else {
      openPopover(popover, trigger);
    }
  }

  let isInitialized = false;

  function initPopovers() {
    // Normalizar popovers estáticos cerrados
    const popovers = document.querySelectorAll('.ids-popover:not(.is-open):not(.ids-popover--open)');
    popovers.forEach((p) => {
      if (p.getAttribute('aria-hidden') === 'true' && p.style.display && p.style.display !== 'none') {
        p.dataset.prevInlineDisplay = p.style.display;
        p.style.display = 'none';
      }
    });

    if (isInitialized) return;
    isInitialized = true;

    document.addEventListener('click', function (e) {
      // 1. Clic en botón de cierre o acción dentro del popover
      const closeBtn = e.target.closest('.ids-popover__close, [data-ids-popover-close], .ids-popover__footer button');
      if (closeBtn) {
        const popover = closeBtn.closest('.ids-popover');
        if (popover) {
          e.preventDefault();
          closePopover(popover, true);
          return;
        }
      }

      // 2. Clic en disparador con atributo explícito
      const targetTrigger = e.target.closest('[data-ids-popover-target]');
      if (targetTrigger) {
        const targetId = targetTrigger.getAttribute('data-ids-popover-target');
        const popover = document.getElementById(targetId);
        if (popover) {
          e.preventDefault();
          togglePopover(popover, targetTrigger);
          return;
        }
      }

      // 3. Clic en botón dentro de .ids-popover-wrapper
      const wrapperBtn = e.target.closest('.ids-popover-wrapper > button, .ids-popover-trigger');
      if (wrapperBtn) {
        const wrapper = wrapperBtn.closest('.ids-popover-wrapper');
        const popover = wrapper ? wrapper.querySelector('.ids-popover') : null;
        if (popover) {
          e.preventDefault();
          togglePopover(popover, wrapperBtn);
          return;
        }
      }

      // 4. Clic fuera: cerrar todos los popovers
      if (!e.target.closest('.ids-popover') && !e.target.closest('.ids-popover-wrapper')) {
        closeAllPopovers();
      }
    });

    // Tecla Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const openPopoverEl = document.querySelector('.ids-popover.is-open, .ids-popover.ids-popover--open');
        if (openPopoverEl) {
          e.preventDefault();
          closePopover(openPopoverEl, true);
        }
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.popover = {
    init: initPopovers,
    open: openPopover,
    close: closePopover,
    toggle: togglePopover
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopovers);
  } else {
    initPopovers();
  }
})(typeof window !== 'undefined' ? window : this);
