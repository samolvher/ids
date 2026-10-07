/**
 * ==========================================================================
 * js/components/modal.js
 * Identity Design System (IDS) - Organismo: Ventana Modal y Diálogos Accesibles
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  let isInitialized = false;

  let openModalFn = null;
  let closeModalFn = null;

  function initModals() {
    if (isInitialized) return;
    isInitialized = true;

    let lastActiveTrigger = null;

    function announceModal(message) {
      if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
        global.IDS.ariaLive.announce(message);
        return;
      }
      let announcer = document.getElementById('ids-modal-announcer') || document.getElementById('ids-theme-announcer');
      if (announcer) {
        announcer.textContent = message;
      }
    }

    function getFocusableElements(container) {
      if (!container) return [];
      const selector = [
        'button:not([disabled]):not([aria-disabled="true"])',
        '[href]:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"]):not([disabled])'
      ].join(', ');

      return Array.from(container.querySelectorAll(selector)).filter((el) => {
        return (
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
        );
      });
    }

    function openModal(modalTarget, triggerEl) {
      let modal = null;
      if (typeof modalTarget === 'string') {
        const cleanId = modalTarget.replace('#', '');
        modal = document.getElementById(cleanId);
      } else {
        modal = modalTarget;
      }

      if (!modal) return;

      lastActiveTrigger = triggerEl || document.activeElement;

      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      modal._idsSavedScroll = { x: scrollX, y: scrollY };

      // Activar diálogo
      if (typeof modal.showModal === 'function') {
        if (!modal.open) {
          try {
            modal.showModal();
          } catch (e) {
            modal.setAttribute('open', '');
          }
        }
      } else {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      }

      modal.classList.add('is-active');
      document.body.classList.add('ids-modal-is-active');
      document.body.style.overflow = 'hidden';

      const modalTitle = modal.querySelector('.ids-modal-dialog__title, h2, h3, h4');
      const titleText = modalTitle ? modalTitle.textContent.trim() : 'Diálogo';
      announceModal(`Diálogo abierto: ${titleText}. Presiona Escape para salir.`);

      requestAnimationFrame(() => {
        const focusable = getFocusableElements(modal);
        if (focusable.length > 0) {
          focusable[0].focus({ preventScroll: true });
        } else {
          modal.setAttribute('tabindex', '-1');
          modal.focus({ preventScroll: true });
        }
      });
    }

    function closeModal(modal) {
      if (!modal) return;

      const savedScroll = modal._idsSavedScroll || {
        x: window.scrollX || window.pageXOffset || 0,
        y: window.scrollY || window.pageYOffset || 0
      };

      if (typeof modal.close === 'function' && modal.open) {
        modal.close();
      } else {
        modal.removeAttribute('open');
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      }

      modal.classList.remove('is-active');

      const anyOtherOpen = document.querySelector('dialog.ids-modal-dialog[open], .ids-modal-dialog.is-open');
      if (!anyOtherOpen) {
        document.body.classList.remove('ids-modal-is-active');
        document.body.style.overflow = '';
      }

      announceModal('Diálogo cerrado');

      if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') {
        lastActiveTrigger.focus({ preventScroll: true });
        lastActiveTrigger = null;
      }

      const postY = window.scrollY || window.pageYOffset || 0;
      const postX = window.scrollX || window.pageXOffset || 0;
      if (postY !== savedScroll.y || postX !== savedScroll.x) {
        window.scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
      }
    }

    // Delegación global de clics para apertura
    document.addEventListener('click', function (e) {
      const openBtn = e.target.closest('[data-ids-modal-open], [data-modal-target], [data-ids-modal]');
      if (openBtn) {
        e.preventDefault();
        const targetId = openBtn.getAttribute('data-ids-modal-open') ||
                         openBtn.getAttribute('data-modal-target') ||
                         openBtn.getAttribute('data-ids-modal');
        openModal(targetId, openBtn);
        return;
      }

      // Delegación de clics para cierre
      const closeBtn = e.target.closest('[data-ids-modal-close], .ids-modal-dialog__close, [data-dismiss="modal"]');
      if (closeBtn) {
        e.preventDefault();
        const modal = closeBtn.closest('dialog, .ids-modal-dialog');
        if (modal) {
          closeModal(modal);
        }
        return;
      }

      // Clics en el backdrop de elementos <dialog>
      const dialog = e.target;
      if (dialog && dialog.tagName === 'DIALOG' && dialog.open) {
        const rect = dialog.getBoundingClientRect();
        const isClickInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!isClickInside) {
          closeModal(dialog);
        }
      }
    });

    // Control de teclado: Escape y Focus Trap
    document.addEventListener('keydown', function (e) {
      const activeDialog = document.querySelector('dialog[open], .ids-modal-dialog.is-open');
      if (!activeDialog) return;

      if (e.key === 'Tab') {
        const focusable = getFocusableElements(activeDialog);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !activeDialog.contains(document.activeElement)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else {
          if (document.activeElement === last || !activeDialog.contains(document.activeElement)) {
            e.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal(activeDialog);
      }
    });

    openModalFn = openModal;
    closeModalFn = closeModal;
  }

  global.IDS = global.IDS || {};
  global.IDS.modal = {
    init: initModals,
    open: (target, trigger) => {
      if (openModalFn) {
        openModalFn(target, trigger);
      } else {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        if (el && typeof el.showModal === 'function') el.showModal();
        else if (el) el.classList.add('is-open');
      }
    },
    close: (target) => {
      if (closeModalFn) {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        closeModalFn(el);
      } else {
        const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
        if (el && typeof el.close === 'function') el.close();
        else if (el) el.classList.remove('is-open');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
  } else {
    initModals();
  }
})(typeof window !== 'undefined' ? window : this);
