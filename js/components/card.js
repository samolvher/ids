/**
 * ==========================================================================
 * js/components/card.js
 * Identity Design System (IDS) - Organismo: Tarjetas y Formatos Modulares
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  function announce(message) {
    if (global.IDS && global.IDS.ariaLive && typeof global.IDS.ariaLive.announce === 'function') {
      global.IDS.ariaLive.announce(message);
    } else {
      let announcer = document.getElementById('ids-theme-announcer');
      if (announcer) {
        announcer.textContent = message;
      }
    }
  }

  let isInitialized = false;

  function initCards() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Revelado de Contenido Sensible en Tarjetas (Delegación única para evitar doble alternancia)
    if (!global.IDS || typeof global.IDS.initSensitiveContent !== 'function') {
      document.addEventListener('click', function (e) {
        const revealBtn = e.target.closest('[data-ids-card-reveal], .ids-card__reveal-btn, [data-ids-sensitive-toggle]');
        if (!revealBtn) return;

        const card = revealBtn.closest('.ids-card--sensitive, .ids-figure--sensitive, .ids-img-container--sensitive');
        if (!card) return;

        const isRevealed = card.classList.toggle('is-revealed');
        revealBtn.setAttribute('aria-expanded', isRevealed ? 'true' : 'false');

        const labelEl = revealBtn.querySelector('.ids-card__reveal-btn-text, .ids-sensitive-btn-text');
        if (labelEl) {
          labelEl.textContent = isRevealed ? 'Ocultar contenido sensible' : 'Revelar contenido sensible';
        }

        announce(isRevealed
          ? 'Contenido sensible revelado por consentimiento.'
          : 'Contenido sensible oculto con protección visual.');
      });
    }

    // 2. Tarjetas Seleccionables (.ids-card--selectable)
    function toggleCardSelection(card) {
      if (!card || card.getAttribute('aria-disabled') === 'true') return;

      const checkbox = card.querySelector('input[type="checkbox"], input[type="radio"]');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        card.classList.toggle('is-selected', checkbox.checked);
        card.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');
      } else {
        const isSelected = card.classList.toggle('is-selected');
        card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      }

      const isNowSelected = card.classList.contains('is-selected');
      const cardTitle = card.querySelector('.ids-card__title')?.textContent.trim() || 'Tarjeta';
      announce(`${cardTitle} ${isNowSelected ? 'seleccionada' : 'deseleccionada'}`);

      card.dispatchEvent(new CustomEvent('ids-card-select', {
        detail: { card: card, selected: isNowSelected },
        bubbles: true
      }));
    }

    // Delegación de clics en tarjetas seleccionables
    document.addEventListener('click', function (e) {
      const selectableCard = e.target.closest('.ids-card--selectable');
      if (selectableCard) {
        // Evitar doble toggle si el clic fue en un checkbox, label, enlace o botón interno
        if (e.target.closest('input, label, a, button')) return;
        toggleCardSelection(selectableCard);
      }
    });

    // Accesibilidad por teclado para tarjetas seleccionables (Space / Enter)
    document.addEventListener('keydown', function (e) {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.classList.contains('ids-card--selectable')) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleCardSelection(activeEl);
        }
      }
    });

    // Sincronizar inputs nativos si los hubiera
    document.addEventListener('change', function (e) {
      const input = e.target;
      if (input.matches('.ids-card--selectable input[type="checkbox"], .ids-card--selectable input[type="radio"]')) {
        const card = input.closest('.ids-card--selectable');
        if (card) {
          card.classList.toggle('is-selected', input.checked);
          card.setAttribute('aria-checked', input.checked ? 'true' : 'false');
        }
      }
    });

    // 3. Botón de Cierre / Descarte en Tarjetas (.ids-card__close o [data-ids-card-close])
    document.addEventListener('click', function (e) {
      const closeBtn = e.target.closest('.ids-card__close, [data-ids-card-close]');
      if (closeBtn) {
        e.preventDefault();
        const card = closeBtn.closest('.ids-card');
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
          announce('Tarjeta cerrada');
        }
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.card = {
    init: initCards
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCards);
  } else {
    initCards();
  }
})(typeof window !== 'undefined' ? window : this);
