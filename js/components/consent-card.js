/**
 * ==========================================================================
 * js/components/consent-card.js
 * Identity Design System (IDS) - Controlador de Consentimiento Asistido
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * Heurística WAI-ARIA: RNEP (Rol, Nombre, Estado y Propiedad)
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const CARD_SELECTOR = '.ids-consent-card, .consent-card';
  const BANNER_SELECTOR = '.ids-consent-banner, .consent-banner';

  /**
   * Actualiza el anuncio en vivo para lectores de pantalla
   * @param {HTMLElement} container
   * @param {string} message
   */
  function announceConsentStatus(container, message) {
    if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
      global.IDS.ariaLive.announce(message);
    } else {
      let announcer = document.getElementById('ids-theme-announcer');
      if (announcer) {
        announcer.textContent = message;
      }
    }
  }

  /**
   * Obtiene todos los toggles / switches de permisos granulares no bloqueados
   * @param {HTMLElement} cardEl
   * @returns {HTMLInputElement[]}
   */
  function getOptionalToggles(cardEl) {
    if (!cardEl) return [];
    return Array.from(
      cardEl.querySelectorAll('input[type="checkbox"]:not(:disabled)')
    );
  }

  /**
   * Acepta todos los permisos y actualiza la tarjeta
   * @param {HTMLElement} cardEl
   * @param {Object} [options]
   */
  function acceptAllConsent(cardEl, options = {}) {
    if (!cardEl) return;
    const toggles = getOptionalToggles(cardEl);
    toggles.forEach(toggle => {
      toggle.checked = true;
      toggle.setAttribute('aria-checked', 'true');
    });

    cardEl.classList.remove('ids-consent-card--revoked');
    cardEl.classList.add('ids-consent-card--granted');

    const statusMsg = 'Consentimiento otorgado voluntariamente.';
    announceConsentStatus(cardEl, statusMsg);

    cardEl.dispatchEvent(new CustomEvent('ids:consent-change', {
      bubbles: true,
      detail: {
        status: 'granted',
        allAccepted: true,
        timestamp: new Date().toISOString()
      }
    }));

    if (options.closeBanner) {
      dismissBanner(cardEl);
    }
  }

  /**
   * Revoca / rechaza todos los permisos
   * @param {HTMLElement} cardEl
   * @param {Object} [options]
   */
  function rejectAllConsent(cardEl, options = {}) {
    if (!cardEl) return;
    const toggles = getOptionalToggles(cardEl);
    toggles.forEach(toggle => {
      toggle.checked = false;
      toggle.setAttribute('aria-checked', 'false');
    });

    cardEl.classList.remove('ids-consent-card--granted');
    cardEl.classList.add('ids-consent-card--revoked');

    const statusMsg = 'Consentimiento rechazado / revocado.';
    announceConsentStatus(cardEl, statusMsg);

    cardEl.dispatchEvent(new CustomEvent('ids:consent-change', {
      bubbles: true,
      detail: {
        status: 'revoked',
        allAccepted: false,
        timestamp: new Date().toISOString()
      }
    }));

    if (options.closeBanner) {
      dismissBanner(cardEl);
    }
  }

  /**
   * Cierra o repliega un banner de consentimiento
   * @param {HTMLElement} bannerEl
   */
  function dismissBanner(bannerEl) {
    if (!bannerEl) return;
    bannerEl.style.opacity = '0';
    bannerEl.style.pointerEvents = 'none';

    setTimeout(() => {
      bannerEl.setAttribute('hidden', '');
      bannerEl.style.display = 'none';
    }, 250);
  }

  let isInitialized = false;

  /**
   * Inicializa escuchadores delegados en el DOM
   */
  function initConsentListeners() {
    if (isInitialized) return;
    isInitialized = true;

    document.addEventListener('click', function (e) {
      // 1. Botón Aceptar Todo / Consentir
      const acceptBtn = e.target.closest('[data-consent-action="accept-all"], .ids-consent-card__action-btn--accept, .ids-button--consent-accept');
      if (acceptBtn) {
        e.preventDefault();
        const container = acceptBtn.closest(CARD_SELECTOR) || acceptBtn.closest(BANNER_SELECTOR);
        acceptAllConsent(container, { closeBanner: !!acceptBtn.closest(BANNER_SELECTOR) });
        return;
      }

      // 2. Botón Rechazar Todo
      const rejectBtn = e.target.closest('[data-consent-action="reject-all"], .ids-consent-card__action-btn--reject, .ids-button--consent-reject');
      if (rejectBtn) {
        e.preventDefault();
        const container = rejectBtn.closest(CARD_SELECTOR) || rejectBtn.closest(BANNER_SELECTOR);
        rejectAllConsent(container, { closeBanner: !!rejectBtn.closest(BANNER_SELECTOR) });
        return;
      }

      // 3. Botón Revocar Inmediato
      const revokeBtn = e.target.closest('[data-consent-action="revoke"]');
      if (revokeBtn) {
        e.preventDefault();
        const container = revokeBtn.closest(CARD_SELECTOR);
        rejectAllConsent(container);
        return;
      }

      // 4. Descartar Banner
      const dismissBtn = e.target.closest('[data-consent-action="dismiss"]');
      if (dismissBtn) {
        e.preventDefault();
        const banner = dismissBtn.closest(BANNER_SELECTOR);
        dismissBanner(banner);
        return;
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.consentCard = {
    init: initConsentListeners,
    accept: acceptAllConsent,
    reject: rejectAllConsent
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsentListeners);
  } else {
    initConsentListeners();
  }
})(typeof window !== 'undefined' ? window : this);
