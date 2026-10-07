/**
 * ==========================================================================
 * js/components/offcanvas.js
 * Identity Design System (IDS) - Organismo: Paneles Deslizantes Offcanvas
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  let isInitialized = false;
  let openOffcanvasFn = null;
  let closeOffcanvasFn = null;

  function initOffcanvas() {
    if (isInitialized) return;
    isInitialized = true;

    let lastActiveTrigger = null;

    function announceOffcanvas(message) {
      if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
        global.IDS.ariaLive.announce(message);
        return;
      }
      let announcer = document.getElementById('ids-offcanvas-announcer') || document.getElementById('ids-theme-announcer');
      if (announcer) {
        announcer.textContent = message;
      }
    }

    function getFocusableElements(container) {
      if (!container) return [];
      const selector = [
        'button:not([disabled]):not([aria-disabled="true"])',
        '[href]:not([disabled])',
        'input:not([disabled]):not([type="hidden"]):not([aria-disabled="true"])',
        'select:not([disabled]):not([aria-disabled="true"])',
        'textarea:not([disabled]):not([aria-disabled="true"])',
        '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])'
      ].join(', ');

      return Array.from(container.querySelectorAll(selector)).filter((el) => {
        return (
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
        );
      });
    }

    function openOffcanvas(panelTarget, triggerEl) {
      let panel = null;
      if (typeof panelTarget === 'string') {
        const cleanId = panelTarget.replace('#', '');
        panel = document.getElementById(cleanId);
      } else {
        panel = panelTarget;
      }

      if (!panel) return;

      lastActiveTrigger = triggerEl || document.activeElement;
      panel._idsSavedTrigger = lastActiveTrigger;

      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');

      // Buscar o crear backdrop
      let backdrop = document.querySelector(`.ids-offcanvas-backdrop[data-for="${panel.id}"]`);
      if (!backdrop) {
        backdrop = document.querySelector('.ids-offcanvas-backdrop');
      }
      if (backdrop) {
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');
      }

      document.body.style.overflow = 'hidden';

      const panelTitle = panel.querySelector('.ids-offcanvas__title, h2, h3, h4');
      const titleText = panelTitle ? panelTitle.textContent.trim() : 'Panel lateral';
      announceOffcanvas(`Panel lateral abierto: ${titleText}. Presiona Escape para salir.`);

      requestAnimationFrame(() => {
        const focusable = getFocusableElements(panel);
        if (focusable.length > 0) {
          focusable[0].focus({ preventScroll: true });
        } else {
          panel.setAttribute('tabindex', '-1');
          panel.focus({ preventScroll: true });
        }
      });
    }

    function closeOffcanvas(panel) {
      if (!panel) return;

      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');

      let backdrop = document.querySelector(`.ids-offcanvas-backdrop[data-for="${panel.id}"]`) ||
                     document.querySelector('.ids-offcanvas-backdrop');

      if (backdrop) {
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
      }

      const anyOtherOpen = document.querySelector('.ids-offcanvas.is-open, dialog.ids-modal-dialog[open], .ids-modal-dialog.is-open');
      if (!anyOtherOpen) {
        document.body.style.overflow = '';
      }

      announceOffcanvas('Panel lateral cerrado');

      const triggerToRestore = panel._idsSavedTrigger || lastActiveTrigger;
      if (triggerToRestore && typeof triggerToRestore.focus === 'function') {
        triggerToRestore.focus({ preventScroll: true });
      }
      panel._idsSavedTrigger = null;
      lastActiveTrigger = null;
    }

    // Delegación de clics
    document.addEventListener('click', function (e) {
      const openBtn = e.target.closest('[data-ids-offcanvas-open], [data-offcanvas-target], [data-ids-offcanvas]');
      if (openBtn) {
        e.preventDefault();
        const targetId = openBtn.getAttribute('data-ids-offcanvas-open') ||
                         openBtn.getAttribute('data-offcanvas-target') ||
                         openBtn.getAttribute('data-ids-offcanvas');
        openOffcanvas(targetId, openBtn);
        return;
      }

      const closeBtn = e.target.closest('[data-ids-offcanvas-close], .ids-offcanvas__close, [data-dismiss="offcanvas"]');
      if (closeBtn) {
        e.preventDefault();
        const panel = closeBtn.closest('.ids-offcanvas');
        if (panel) closeOffcanvas(panel);
        return;
      }

      // Clic en backdrop
      const backdrop = e.target.closest('.ids-offcanvas-backdrop');
      if (backdrop && backdrop.classList.contains('is-open')) {
        const targetId = backdrop.getAttribute('data-for');
        const panel = targetId ? document.getElementById(targetId) : document.querySelector('.ids-offcanvas.is-open');
        if (panel) {
          closeOffcanvas(panel);
        }
      }
    });

    // Control de teclado: Escape y Focus Trap
    document.addEventListener('keydown', function (e) {
      const activePanel = document.querySelector('.ids-offcanvas.is-open');
      if (!activePanel) return;

      if (e.key === 'Tab') {
        const focusable = getFocusableElements(activePanel);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !activePanel.contains(document.activeElement)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else {
          if (document.activeElement === last || !activePanel.contains(document.activeElement)) {
            e.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeOffcanvas(activePanel);
      }
    });

    openOffcanvasFn = openOffcanvas;
    closeOffcanvasFn = closeOffcanvas;
  }

  global.IDS = global.IDS || {};
  global.IDS.offcanvas = {
    init: initOffcanvas,
    open: (target, trigger) => {
      if (openOffcanvasFn) {
        openOffcanvasFn(target, trigger);
      } else {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        if (el) el.classList.add('is-open');
      }
    },
    close: (target) => {
      if (closeOffcanvasFn) {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        closeOffcanvasFn(el);
      } else {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        if (el) el.classList.remove('is-open');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOffcanvas);
  } else {
    initOffcanvas();
  }
})(typeof window !== 'undefined' ? window : this);
