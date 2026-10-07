/**
 * ==========================================================================
 * js/core/aria-live.js
 * Identity Design System (IDS) - Región en Vivo Accesible (ARIA Live)
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  global.IDS = global.IDS || {};

  /**
   * Gestor Centralizado de Anuncios Accesibles para Tecnologías Asistivas
   * Cumple con WCAG AAA y WAI-ARIA Heurística RNEP.
   * Proporciona canales independientes 'polite' (cortés) y 'assertive' (urgente)
   * con limpieza temporal garantizada para lecturas consecutivas idénticas.
   */
  const AriaLive = (function () {
    let politeRegion = null;
    let assertiveRegion = null;

    /**
     * Aplica estilos estandarizados para ocultar visualmente la región
     * sin retirarla del árbol de accesibilidad (patrón sr-only).
     * @param {HTMLElement} el
     */
    function applySrOnlyStyles(el) {
      el.style.position = 'absolute';
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.padding = '0';
      el.style.margin = '-1px';
      el.style.overflow = 'hidden';
      el.style.clip = 'rect(0, 0, 0, 0)';
      el.style.whiteSpace = 'nowrap';
      el.style.border = '0';
    }

    /**
     * Obtiene o crea la región en vivo según el nivel de cortesía
     * @param {'polite'|'assertive'} politeness
     * @returns {HTMLElement}
     */
    function getOrCreateRegion(politeness = 'polite') {
      const isAssertive = politeness === 'assertive';
      const id = isAssertive ? 'ids-live-assertive' : 'ids-live-polite';
      let region = document.getElementById(id);

      if (!region) {
        region = document.createElement('div');
        region.id = id;
        region.className = 'ids-sr-only';
        region.setAttribute('role', isAssertive ? 'alert' : 'status');
        region.setAttribute('aria-live', isAssertive ? 'assertive' : 'polite');
        region.setAttribute('aria-atomic', 'true');
        applySrOnlyStyles(region);

        if (document.body) {
          document.body.appendChild(region);
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            if (!document.getElementById(id)) {
              document.body.appendChild(region);
            }
          });
        }
      }

      return region;
    }

    let isInitialized = false;

    /**
     * Inicializa las regiones en vivo en el DOM
     */
    function init() {
      if (isInitialized) return;
      isInitialized = true;

      politeRegion = getOrCreateRegion('polite');
      assertiveRegion = getOrCreateRegion('assertive');

      // Soporte retrocompatible para anunciadores heredados por IDs antiguos
      const legacyIds = ['ids-theme-announcer', 'ids-modal-announcer', 'ids-offcanvas-announcer'];
      legacyIds.forEach((legacyId) => {
        let el = document.getElementById(legacyId);
        if (!el && document.body) {
          el = document.createElement('div');
          el.id = legacyId;
          el.className = 'ids-sr-only';
          el.setAttribute('role', 'status');
          el.setAttribute('aria-live', 'polite');
          el.setAttribute('aria-atomic', 'true');
          applySrOnlyStyles(el);
          document.body.appendChild(el);
        }
      });
    }

    /**
     * Emite un anuncio de texto a tecnologías asistivas
     * @param {string} message - Texto a comunicar
     * @param {'polite'|'assertive'} [politeness='polite'] - Nivel de urgencia
     */
    function announce(message, politeness = 'polite') {
      if (!message || typeof message !== 'string') return;

      const region = getOrCreateRegion(politeness);
      if (!region) return;

      // Reseteo previo para forzar a lectores de pantalla a anunciar mensajes repetidos
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message.trim();

        // Sincronizar también con anunciador de temas heredado si existe
        const themeAnnouncer = document.getElementById('ids-theme-announcer');
        if (themeAnnouncer && themeAnnouncer !== region) {
          themeAnnouncer.textContent = message.trim();
        }
      }, 50);
    }

    /**
     * Anuncio con prioridad cortés (espera pausas de usuario)
     * @param {string} message
     */
    function announcePolite(message) {
      announce(message, 'polite');
    }

    /**
     * Anuncio con prioridad inmediata / asertiva (interrupciones de emergencia)
     * @param {string} message
     */
    function announceAssertive(message) {
      announce(message, 'assertive');
    }

    return {
      init: init,
      announce: announce,
      announcePolite: announcePolite,
      announceAssertive: announceAssertive,
      getRegion: getOrCreateRegion
    };
  })();

  global.IDS.ariaLive = AriaLive;
  global.IDS.announce = AriaLive.announce;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AriaLive.init);
  } else {
    AriaLive.init();
  }
})(typeof window !== 'undefined' ? window : this);
