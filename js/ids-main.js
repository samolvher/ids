/**
 * ==========================================================================
 * js/ids-main.js
 * Identity Design System (IDS) - Inicializador y Orquestador del Sistema
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * Metodología: Atomic Design y Token-Design (Vanilla JS sin dependencias)
 * ==========================================================================
 */

(function (global) {
  'use strict';

  global.IDS = global.IDS || {};

  /* ==========================================================================
     1. SISTEMA DE ANUNCIOS ACCESIBLES (aria-live) - Core Bridge
     ========================================================================== */
  const ariaLiveModule = (function () {
    let politeRegion = null;
    let assertiveRegion = null;

    function getOrCreateRegion(id, role, politeness) {
      let region = document.getElementById(id);
      if (!region && document.body) {
        region = document.createElement('div');
        region.id = id;
        region.setAttribute('role', role);
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'ids-sr-only';
        region.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        document.body.appendChild(region);
      }
      return region;
    }

    function init() {
      politeRegion = getOrCreateRegion('ids-live-polite', 'status', 'polite');
      assertiveRegion = getOrCreateRegion('ids-live-assertive', 'alert', 'assertive');

      const legacyIds = ['ids-theme-announcer', 'ids-modal-announcer', 'ids-offcanvas-announcer'];
      legacyIds.forEach((legacyId) => {
        getOrCreateRegion(legacyId, 'status', 'polite');
      });
    }

    function announce(message, priority = 'polite') {
      if (global.IDS.ariaLive && global.IDS.ariaLive !== ariaLiveBridge && typeof global.IDS.ariaLive.announce === 'function') {
        global.IDS.ariaLive.announce(message, priority);
        return;
      }
      init();
      const region = priority === 'assertive' ? (assertiveRegion || document.getElementById('ids-live-assertive')) : (politeRegion || document.getElementById('ids-live-polite') || document.getElementById('ids-theme-announcer'));
      if (region) {
        region.textContent = '';
        setTimeout(() => {
          region.textContent = message;
        }, 50);
      }
    }

    return { init, announce };
  })();

  const ariaLiveBridge = {
    init: function () {
      if (global.IDSAriaLive && typeof global.IDSAriaLive.init === 'function') {
        global.IDSAriaLive.init();
      } else {
        ariaLiveModule.init();
      }
    },
    announce: function (message, priority) {
      if (global.IDSAriaLive && typeof global.IDSAriaLive.announce === 'function') {
        global.IDSAriaLive.announce(message, priority);
      } else {
        ariaLiveModule.announce(message, priority);
      }
    }
  };

  global.IDS.ariaLive = global.IDS.ariaLive || ariaLiveBridge;

  /* ==========================================================================
     2. GESTOR DE CAPTURA DE FOCO (Focus Trap) - Core Bridge
     ========================================================================== */
  const focusTrapModule = (function () {
    const FOCUSABLE_SELECTOR = [
      'button:not([disabled]):not([aria-disabled="true"])',
      '[href]:not([disabled])',
      'input:not([disabled]):not([type="hidden"]):not([aria-disabled="true"])',
      'select:not([disabled]):not([aria-disabled="true"])',
      'textarea:not([disabled]):not([aria-disabled="true"])',
      '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])',
      'details > summary:first-of-type'
    ].join(', ');

    function getFocusableElements(container) {
      if (!container) return [];
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
        return (
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
        );
      });
    }

    function trap(container, event) {
      if (global.IDSFocusTrap && typeof global.IDSFocusTrap.trap === 'function') {
        global.IDSFocusTrap.trap(container, event);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(container);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    }

    return { getFocusableElements, trap };
  })();

  global.IDS.focusTrap = global.IDS.focusTrap || focusTrapModule;

  /* ==========================================================================
     3. CONMUTADOR DE TEMAS Y MODO OSCURO (Core Bridge)
     ========================================================================== */
  const themeSwitcherBridge = (function () {
    const THEMES = ['default', 'high-contrast', 'low-stimulation', 'discrete'];

    function setTheme(themeName) {
      if (global.IDSThemeSwitcher && typeof global.IDSThemeSwitcher.setTheme === 'function') {
        global.IDSThemeSwitcher.setTheme(themeName);
        return;
      }
      const normalizedTheme = (themeName || 'default').toLowerCase().trim();
      const resolved = normalizedTheme === 'stealth' ? 'discrete' : (normalizedTheme === 'low-stim' ? 'low-stimulation' : normalizedTheme);
      document.documentElement.setAttribute('data-ids-theme', resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      try {
        localStorage.setItem('ids-active-theme', resolved);
      } catch (e) {}

      const themeBtns = document.querySelectorAll('[data-set-theme], [data-ids-set-theme]');
      themeBtns.forEach((btn) => {
        const val = btn.getAttribute('data-set-theme') || btn.getAttribute('data-ids-set-theme');
        const isCurrent = val === resolved || (resolved === 'discrete' && val === 'stealth');
        btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      global.IDS.ariaLive.announce(`Tema cambiado a ${resolved}`);
    }

    function init() {
      if (global.IDSThemeSwitcher && typeof global.IDSThemeSwitcher.init === 'function') {
        global.IDSThemeSwitcher.init();
      }
    }

    return { init, setTheme, THEMES };
  })();

  global.IDS.themeSwitcher = global.IDS.themeSwitcher || themeSwitcherBridge;

  /* ==========================================================================
     4. CONTROLES DE FORMULARIO TRANSVERSALES (Átomos y Moléculas)
     ========================================================================== */
  let isFormControlsInitialized = false;

  function initFormControls() {
    if (isFormControlsInitialized) return;
    isFormControlsInitialized = true;

    // 1. Estado indeterminado nativo en checkboxes (declarativo mediante data-indeterminate)
    const indeterminateBoxes = document.querySelectorAll('input[type="checkbox"][data-indeterminate="true"]');
    indeterminateBoxes.forEach((box) => {
      box.indeterminate = true;
    });

    // 2. Alternador universal de visibilidad de contraseña (Agnóstico mediante tokens y data-attributes)
    document.addEventListener('click', function (e) {
      const togglePwdBtn = e.target.closest(
        '[data-ids-toggle-password], [data-toggle-password], .ids-password-toggle, .ids-input-group__button--password'
      );
      if (!togglePwdBtn) return;

      e.preventDefault();
      let pwdInput = null;
      const targetId = togglePwdBtn.getAttribute('data-ids-toggle-password') || togglePwdBtn.getAttribute('data-toggle-password') || togglePwdBtn.getAttribute('aria-controls');
      if (targetId) {
        pwdInput = document.getElementById(targetId);
      }
      if (!pwdInput) {
        const group = togglePwdBtn.closest('.ids-input-group, .ids-form-group');
        if (group) {
          pwdInput = group.querySelector('input[type="password"], input[data-is-password="true"]');
        }
      }

      if (pwdInput) {
        const isPassword = pwdInput.type === 'password';
        pwdInput.type = isPassword ? 'text' : 'password';
        pwdInput.dataset.isPassword = 'true';

        togglePwdBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
        togglePwdBtn.setAttribute(
          'aria-label',
          isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña en texto plano'
        );

        const iconShow = togglePwdBtn.querySelector('.icon-pwd-show, [data-icon="show"]');
        const iconHide = togglePwdBtn.querySelector('.icon-pwd-hide, [data-icon="hide"]');
        if (iconShow && iconHide) {
          iconShow.style.display = isPassword ? 'none' : 'block';
          iconHide.style.display = isPassword ? 'block' : 'none';
        }

        global.IDS.ariaLive.announce(
          isPassword ? 'Contraseña mostrada en texto claro' : 'Contraseña oculta'
        );
      }
    });

    // 3. Contadores de caracteres accesibles
    document.addEventListener('input', function (e) {
      const input = e.target;
      const counterId = input.getAttribute('data-char-counter');
      if (counterId) {
        const counterEl = document.getElementById(counterId);
        const max = parseInt(input.getAttribute('maxlength') || input.getAttribute('data-max-chars') || '0', 10);
        if (counterEl && max > 0) {
          const currentLen = input.value.length;
          const remaining = max - currentLen;
          counterEl.textContent = `${currentLen} / ${max}`;
          counterEl.classList.toggle('ids-counter--limit', remaining <= 0);
          counterEl.classList.toggle('ids-counter--warning', remaining > 0 && remaining <= Math.max(10, Math.floor(max * 0.15)));
        }
      }

      const wrapper = input.closest('.ids-textarea-wrapper');
      if (wrapper) {
        const counterEl = wrapper.querySelector('.ids-textarea-wrapper__counter');
        if (counterEl) {
          const max = parseInt(input.getAttribute('maxlength') || input.getAttribute('data-max-chars') || '0', 10);
          const len = input.value.length;
          counterEl.textContent = max > 0 ? `${len} / ${max} caracteres` : `${len} caracteres`;
        }
      }
    });

    // 4. Controles Deslizantes de Rango (.ids-range)
    document.addEventListener('input', function (e) {
      const range = e.target;
      if (range.matches('.ids-range[data-range-output], input[type="range"][data-range-output]')) {
        const outputId = range.getAttribute('data-range-output');
        const outputEl = document.getElementById(outputId);
        if (outputEl) {
          const unit = range.getAttribute('data-range-unit') || '';
          outputEl.textContent = `${range.value}${unit}`;
          range.setAttribute('aria-valuenow', range.value);
        }
      }
    });

    // 5. Interruptores Booleanos (role="switch" o .ids-toggle)
    document.addEventListener('click', function (e) {
      const switchBtn = e.target.closest('button[role="switch"]:not(#ids-dark-mode-toggle):not([data-ids-dark-toggle]), button.ids-toggle:not(#ids-dark-mode-toggle):not([data-ids-dark-toggle])');
      if (!switchBtn || switchBtn.disabled || switchBtn.getAttribute('aria-disabled') === 'true') return;

      e.preventDefault();
      const isChecked = switchBtn.getAttribute('aria-checked') === 'true';
      const nextState = !isChecked;
      switchBtn.setAttribute('aria-checked', nextState ? 'true' : 'false');
      switchBtn.classList.toggle('ids-toggle--active', nextState);
      switchBtn.dispatchEvent(new CustomEvent('ids-toggle-change', { detail: { checked: nextState }, bubbles: true }));

      const label = switchBtn.getAttribute('aria-label') || switchBtn.textContent.trim() || 'Interruptor';
      global.IDS.ariaLive.announce(`${label} ${nextState ? 'activado' : 'desactivado'}`);
    });
  }

  /* ==========================================================================
     5. CONTENIDO SENSIBLE (Trauma-Informed & Tecnología Consentida)
     ========================================================================== */
  let isSensitiveContentInitialized = false;

  function initSensitiveContent() {
    if (isSensitiveContentInitialized) return;
    isSensitiveContentInitialized = true;

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-ids-sensitive-toggle], [data-ids-card-reveal], .ids-card__reveal-btn');
      if (!btn) return;

      e.preventDefault();
      const container = btn.closest(
        '.ids-figure--sensitive, .ids-img-container--sensitive, .ids-card--sensitive, .ids-sensitive-wrapper'
      );
      if (!container) return;

      const isRevealed = container.classList.toggle('is-revealed');
      btn.setAttribute('aria-expanded', isRevealed ? 'true' : 'false');

      const label = btn.querySelector('.ids-sensitive-btn-text, .ids-card__reveal-btn-text');
      if (label) {
        label.textContent = isRevealed ? 'Ocultar contenido sensible' : 'Ver contenido sensible';
      }

      global.IDS.ariaLive.announce(
        isRevealed ? 'Contenido sensible revelado por consentimiento.' : 'Contenido sensible difuminado con protección visual.'
      );
    });
  }

  /* ==========================================================================
     6. ORQUESTADOR CENTRAL DEL IDS (Master Initializer)
     ========================================================================== */
  function init() {
    // 1. Core modules
    if (global.IDS.ariaLive && typeof global.IDS.ariaLive.init === 'function') {
      global.IDS.ariaLive.init();
    }
    if (global.IDS.themeSwitcher && typeof global.IDS.themeSwitcher.init === 'function') {
      global.IDS.themeSwitcher.init();
    }

    // 2. Global utilities & Form controls
    initFormControls();
    initSensitiveContent();

    // 3. Orquestación limpia de los componentes modulares (invocación segura y sin duplicación)
    const componentModules = [
      'accordion',
      'card',
      'carousel',
      'consentCard',
      'dropdown',
      'fab',
      'globalNav',
      'modal',
      'offcanvas',
      'popover',
      'snackbar',
      'tabs',
      'toolbar'
    ];

    componentModules.forEach((modName) => {
      const mod = global.IDS[modName];
      if (mod && typeof mod.init === 'function') {
        try {
          mod.init();
        } catch (err) {
          console.warn(`[IDS] Error al inicializar componente ${modName}:`, err);
        }
      }
    });
  }

  global.IDS.init = init;
  global.IDS.initFormControls = initFormControls;
  global.IDS.initSensitiveContent = initSensitiveContent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
