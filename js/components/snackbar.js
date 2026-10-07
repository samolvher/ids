/**
 * ==========================================================================
 * js/components/snackbar.js
 * Identity Design System (IDS) - Controlador de Snackbars (Barras de Notificación)
 * Heurística WAI-ARIA RNEP (Rol, Nombre, Estado, Propiedad) y Accesibilidad de Teclado
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    duration: 6000,
    position: 'bottom-center',
    type: 'default',
    singleLine: true,
    dismissible: true
  };

  function getOrCreateContainer(position) {
    const validPositions = [
      'bottom-center', 'bottom-start', 'bottom-end',
      'top-center', 'top-start', 'top-end'
    ];
    const safePosition = validPositions.includes(position) ? position : 'bottom-center';
    const containerId = `ids-snackbar-container-${safePosition}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = `ids-snackbar-container ids-snackbar-container--${safePosition}`;
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(container);
    }

    return container;
  }

  function dismissSnackbar(snackbarEl) {
    if (!snackbarEl || snackbarEl.dataset.isDismissing === 'true') return;

    snackbarEl.dataset.isDismissing = 'true';
    snackbarEl.style.opacity = '0';
    snackbarEl.style.transform = 'scale(0.95)';
    snackbarEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    setTimeout(() => {
      if (snackbarEl.parentNode) {
        snackbarEl.parentNode.removeChild(snackbarEl);
      }
    }, 250);
  }

  function showSnackbar(options = {}) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    const config = Object.assign({}, DEFAULT_CONFIG, options);
    const container = getOrCreateContainer(config.position);

    const snackbar = document.createElement('div');
    snackbar.className = `ids-snackbar ids-snackbar--${config.type}`;
    snackbar.setAttribute('role', config.type === 'danger' ? 'alert' : 'status');
    snackbar.setAttribute('aria-live', config.type === 'danger' ? 'assertive' : 'polite');

    const msgEl = document.createElement('span');
    msgEl.className = 'ids-snackbar__message';
    msgEl.textContent = config.message || 'Notificación del sistema';
    snackbar.appendChild(msgEl);

    if (config.dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ids-snackbar__close ids-button ids-button--ghost ids-button--sm';
      closeBtn.setAttribute('aria-label', 'Cerrar notificación');
      closeBtn.innerHTML = `
        <svg class="ids-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="width: 1rem; height: 1rem; fill: currentColor;">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
      closeBtn.addEventListener('click', () => dismissSnackbar(snackbar));
      snackbar.appendChild(closeBtn);
    }

    container.appendChild(snackbar);

    if (config.duration && config.duration > 0) {
      let timer = setTimeout(() => dismissSnackbar(snackbar), config.duration);
      snackbar.addEventListener('mouseenter', () => clearTimeout(timer));
      snackbar.addEventListener('mouseleave', () => {
        timer = setTimeout(() => dismissSnackbar(snackbar), 2000);
      });
    }

    return snackbar;
  }

  let isInitialized = false;

  function initSnackbars() {
    if (isInitialized) return;
    isInitialized = true;

    document.addEventListener('click', function (e) {
      // Botones de cierre
      const closeBtn = e.target.closest('.ids-snackbar__close, [data-ids-snackbar-close]');
      if (closeBtn) {
        e.preventDefault();
        const snackbar = closeBtn.closest('.ids-snackbar, .snackbar, .ids-toast');
        if (snackbar) {
          dismissSnackbar(snackbar);
        }
        return;
      }

      // Botones declarativos para disparar snackbar
      const triggerBtn = e.target.closest('[data-ids-snackbar-trigger], [data-ids-snackbar-show]');
      if (triggerBtn) {
        e.preventDefault();
        const msg = triggerBtn.getAttribute('data-snackbar-msg') || 'Operación completada con éxito en modo seguro.';
        const type = triggerBtn.getAttribute('data-snackbar-type') || 'success';
        showSnackbar({ message: msg, type: type });
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const activeSnackbar = document.querySelector('.ids-snackbar:last-child');
        if (activeSnackbar) {
          dismissSnackbar(activeSnackbar);
        }
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.snackbar = {
    init: initSnackbars,
    show: showSnackbar,
    dismiss: dismissSnackbar
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnackbars);
  } else {
    initSnackbars();
  }
})(typeof window !== 'undefined' ? window : this);
