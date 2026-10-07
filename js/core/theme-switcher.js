/**
 * ==========================================================================
 * js/core/theme-switcher.js
 * Identity Design System (IDS) - Conmutador Dinámico de Temas
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  global.IDS = global.IDS || {};

  const THEMES = ['default', 'high-contrast', 'low-stimulation', 'discrete'];
  const STORAGE_KEY = 'ids-active-theme';

  /**
   * Conmutador Dinámico de Temas (Core)
   * Gestiona la alternancia entre los 4 ejes temáticos de IDS:
   * 1. default (Queer Palette Base)
   * 2. high-contrast (WCAG AAA 7:1)
   * 3. low-stimulation (Neurodivergencia / Baja Carga Sensorial)
   * 4. discrete (Stealth / Anti-Outing)
   */
  const ThemeSwitcher = (function () {
    let currentTheme = 'default';

    /**
     * Notifica el cambio de tema de forma accesible
     * @param {string} themeName
     */
    function announceChange(themeName) {
      const message = `Tema cambiado a ${themeName}`;
      if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
        global.IDS.ariaLive.announce(message, 'polite');
      } else {
        const legacyLiveRegion = document.getElementById('ids-theme-announcer');
        if (legacyLiveRegion) {
          legacyLiveRegion.textContent = message;
        }
      }
    }

    /**
     * Establece el tema activo en el documento
     * @param {string} themeName - Nombre del tema a activar
     * @param {boolean} [announce=true] - Si debe emitir anuncio auditivo ARIA
     */
    function setTheme(themeName, announce = true) {
      if (!themeName || typeof themeName !== 'string') return;

      const normalizedTheme = themeName.toLowerCase().trim();
      const resolvedTheme = normalizedTheme === 'stealth' ? 'discrete' : normalizedTheme;

      currentTheme = resolvedTheme;
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.setAttribute('data-ids-theme', resolvedTheme);

      // WAI-ARIA Heurística RNEP: Actualización de Estado (aria-pressed)
      const themeButtons = document.querySelectorAll('[data-set-theme], [data-ids-set-theme]');
      themeButtons.forEach((button) => {
        const btnTheme = (button.getAttribute('data-set-theme') || button.getAttribute('data-ids-set-theme') || '').toLowerCase().trim();
        const isCurrent = btnTheme === resolvedTheme || (resolvedTheme === 'discrete' && btnTheme === 'stealth');
        button.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      if (announce) {
        announceChange(resolvedTheme);
      }

      try {
        localStorage.setItem(STORAGE_KEY, resolvedTheme);
      } catch (e) {
        // Entornos sandbox o sin localStorage disponible
      }

      // Notificar a componentes interesados
      document.dispatchEvent(
        new CustomEvent('ids-theme-change', {
          detail: { theme: resolvedTheme },
          bubbles: true
        })
      );
    }

    /**
     * Obtiene el tema activo actual
     * @returns {string}
     */
    function getTheme() {
      return document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-ids-theme') || currentTheme;
    }

    /**
     * Inicializa los listeners en los botones de conmutación de tema
     * y restaura el tema guardado en localStorage
     */
    function init() {
      const themeButtons = document.querySelectorAll('[data-set-theme], [data-ids-set-theme]');

      themeButtons.forEach((button) => {
        button.removeEventListener('click', handleThemeButtonClick);
        button.addEventListener('click', handleThemeButtonClick);
      });

      // Cargar preferencia persistida si existe
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
          setTheme(savedTheme, false);
          return;
        }
      } catch (e) {}

      // Si ya hay un data-theme en el <html>, sincronizar botones
      const initialTheme = document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-ids-theme') || 'default';
      setTheme(initialTheme, false);
    }

    function handleThemeButtonClick(e) {
      const btn = e.currentTarget;
      const theme = btn.getAttribute('data-set-theme') || btn.getAttribute('data-ids-set-theme');
      if (theme) {
        setTheme(theme);
      }
    }

    return {
      init: init,
      setTheme: setTheme,
      getTheme: getTheme,
      THEMES: THEMES
    };
  })();

  global.IDS.themeSwitcher = ThemeSwitcher;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ThemeSwitcher.init);
  } else {
    ThemeSwitcher.init();
  }

  /* ==========================================================================
   * DarkMode — Módulo de Control de Apariencia Claro / Oscuro
   * --------------------------------------------------------------------------
   * Gestiona el atributo [data-color-scheme] en <html> para activar/desactivar
   * los bloques @media (prefers-color-scheme: dark) definidos en _themes.scss.
   *
   * Orden de precedencia (de mayor a menor):
   *   1. Preferencia persistida del usuario en localStorage (ids-color-scheme)
   *   2. Atributo data-color-scheme en el elemento <html> (preselección HTML)
   *   3. prefers-color-scheme del Sistema Operativo (media query del navegador)
   *
   * Cómo preseleccionar modo oscuro desde HTML sin JS:
   *   <html lang="es" data-theme="default" data-color-scheme="dark">
   * ==========================================================================
   */
  const DarkMode = (function () {
    const STORAGE_KEY_DM = 'ids-color-scheme';
    const TOGGLE_ID = 'ids-dark-mode-toggle';
    const LABEL_ID = 'ids-dark-mode-label';
    const LABEL_DARK = 'Modo oscuro';
    const LABEL_LIGHT = 'Modo claro';

    /**
     * Aplica el esquema de color al documento y sincroniza el toggle UI.
     * @param {'dark'|'light'} scheme
     * @param {boolean} [persist=true] - Si se debe guardar en localStorage
     */
    function applyScheme(scheme, persist = true) {
      const isDark = scheme === 'dark';

      // Inyectar data-color-scheme en <html> para que los @media dark actúen
      document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-ids-color-scheme', isDark ? 'dark' : 'light');

      // Sincronizar el toggle accesible en el sidebar y otros botones
      const toggles = document.querySelectorAll(`#${TOGGLE_ID}, [data-ids-dark-toggle]`);
      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        toggle.setAttribute('aria-label', isDark ? 'Desactivar modo oscuro' : 'Activar modo oscuro');
        toggle.classList.toggle('ids-toggle--active', isDark);
      });

      // Actualizar texto descriptivo del label
      const label = document.getElementById(LABEL_ID);
      if (label) {
        label.textContent = isDark ? LABEL_DARK : LABEL_LIGHT;
      }

      // Anuncio ARIA accesible del cambio (polite, no interrumpe)
      if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
        global.IDS.ariaLive.announce(
          isDark ? 'Modo oscuro activado' : 'Modo claro activado',
          'polite'
        );
      }

      // Persistir elección del usuario (Tecnología Consentida)
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY_DM, isDark ? 'dark' : 'light');
        } catch (e) {}
      }

      // Emitir evento personalizado para componentes interesados
      document.dispatchEvent(
        new CustomEvent('ids-color-scheme-change', {
          detail: { scheme: isDark ? 'dark' : 'light' },
          bubbles: true
        })
      );
    }

    /**
     * Alterna entre modo oscuro y claro.
     */
    function toggle() {
      const currentScheme = document.documentElement.getAttribute('data-color-scheme') || document.documentElement.getAttribute('data-ids-color-scheme');
      applyScheme(currentScheme === 'dark' ? 'light' : 'dark');
    }

    /**
     * Resuelve el esquema inicial según la precedencia definida:
     * 1. Atributo data-color-scheme preseleccionado en el elemento <html> (declarativo en HTML)
     * 2. Preferencia persistida por el usuario en localStorage (ids-color-scheme)
     * 3. Preferencia del sistema operativo (media query prefers-color-scheme: dark)
     * 4. Por defecto: 'light'
     *
     * @returns {'dark'|'light'}
     */
    function resolveInitialScheme() {
      // 1. Atributo data-color-scheme directamente preseleccionado en el marcado HTML
      const htmlAttr = document.documentElement.getAttribute('data-color-scheme') || document.documentElement.getAttribute('data-ids-color-scheme');
      if (htmlAttr === 'dark' || htmlAttr === 'light') {
        return htmlAttr;
      }

      // 2. Preferencia persistida por interacción previa en localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY_DM);
        if (saved === 'dark' || saved === 'light') return saved;
      } catch (e) {}

      // 3. Preferencia del sistema operativo (media query)
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }

      return 'light';
    }

    let isDarkInit = false;

    /**
     * Inicializa el módulo DarkMode:
     * - Aplica el esquema inicial
     * - Vincula el toggle del sidebar
     * - Escucha cambios de preferencia del SO en tiempo real
     */
    function init() {
      const initialScheme = resolveInitialScheme();
      applyScheme(initialScheme, false);

      if (isDarkInit) return;
      isDarkInit = true;

      // Vincular el botón toggle del sidebar y otros toggles
      document.addEventListener('click', function (e) {
        const toggleBtn = e.target.closest(`#${TOGGLE_ID}, [data-ids-dark-toggle]`);
        if (toggleBtn) {
          e.preventDefault();
          toggle();
        }
      });

      // Sincronizar si el usuario cambia la preferencia del SO mientras tiene la página abierta
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function (e) {
          try {
            // Solo sincronizar automáticamente si el usuario no ha forzado una preferencia manual
            if (!localStorage.getItem(STORAGE_KEY_DM)) {
              applyScheme(e.matches ? 'dark' : 'light', false);
            }
          } catch (err) {
            applyScheme(e.matches ? 'dark' : 'light', false);
          }
        });
      }
    }

    return {
      init: init,
      apply: applyScheme,
      toggle: toggle
    };
  })();

  global.IDS.darkMode = DarkMode;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DarkMode.init);
  } else {
    DarkMode.init();
  }

})(typeof window !== 'undefined' ? window : this);

