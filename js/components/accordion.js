/**
 * ==========================================================================
 * js/components/accordion.js
 * Identity Design System (IDS) - Controlador de Acordeones y Secciones Colapsables
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * Heurística WAI-ARIA: RNEP (Rol, Nombre, Estado y Propiedad)
 * ==========================================================================
 */

(function (global) {
  'use strict';

  /**
   * Notifica a tecnologías asistivas a través del sistema aria-live
   * @param {string} message
   */
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

  /**
   * Alterna el estado de un ítem de acordeón (.ids-accordion__item o .ids-collapse)
   * @param {HTMLElement} triggerBtn - Botón detonador (.ids-accordion__trigger o .ids-collapse__trigger)
   * @param {boolean} [forceState] - Estado explícito opcional (true = abrir, false = cerrar)
   */
  function toggleAccordion(triggerBtn, forceState) {
    if (!triggerBtn || triggerBtn.disabled || triggerBtn.getAttribute('aria-disabled') === 'true') {
      return;
    }

    const item = triggerBtn.closest('.ids-accordion__item') || triggerBtn.closest('.ids-collapse');
    const accordion = triggerBtn.closest('.ids-accordion');
    const isCurrentlyExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
    const shouldExpand = typeof forceState === 'boolean' ? forceState : !isCurrentlyExpanded;

    // 1. Obtener el panel asociado mediante aria-controls o búsqueda en el DOM
    const panelId = triggerBtn.getAttribute('aria-controls');
    let panel = panelId ? document.getElementById(panelId) : null;
    if (!panel && item) {
      panel = item.querySelector('.ids-accordion__collapse, .ids-accordion__panel, .ids-accordion__body, .ids-collapse__panel');
    }

    // 2. Si el acordeón es exclusivo (data-accordion-exclusive="true"), cerrar otros ítems
    if (shouldExpand && accordion && accordion.getAttribute('data-accordion-exclusive') === 'true') {
      const siblingTriggers = accordion.querySelectorAll('.ids-accordion__trigger');
      siblingTriggers.forEach((otherTrigger) => {
        if (otherTrigger !== triggerBtn && otherTrigger.getAttribute('aria-expanded') === 'true') {
          toggleAccordion(otherTrigger, false);
        }
      });
    }

    // 3. Actualizar atributos ARIA en el botón detonador
    triggerBtn.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');

    // 4. Actualizar estado visual y clases en el ítem contenedor
    if (item) {
      item.classList.toggle('is-open', shouldExpand);
      // Para elementos <details> nativos
      if (item.tagName === 'DETAILS') {
        item.open = shouldExpand;
      }
    }

    // 5. Gestionar visibilidad y accesibilidad del panel colapsable
    if (panel) {
      panel.classList.toggle('is-open', shouldExpand);
      panel.setAttribute('aria-hidden', shouldExpand ? 'false' : 'true');

      // Limpiar estilos inline restrictivos heredados de maquetas estáticas
      if (shouldExpand) {
        if (panel.style.display === 'none') {
          panel.style.display = '';
        }
        panel.removeAttribute('hidden');
      } else {
        panel.style.display = 'none';
        panel.setAttribute('hidden', '');
      }
    }

    // 6. Anuncio para tecnologías asistivas
    const titleText = triggerBtn.querySelector('.ids-accordion__title, .ids-collapse__trigger-text')?.textContent.trim() ||
                      triggerBtn.textContent.trim() || 'Sección';
    announce(`${titleText} ${shouldExpand ? 'expandida' : 'colapsada'}`);

    // 7. Despachar evento personalizado
    triggerBtn.dispatchEvent(new CustomEvent('ids-accordion-toggle', {
      detail: { expanded: shouldExpand, trigger: triggerBtn, panel: panel },
      bubbles: true
    }));
  }

  /**
   * Navegación por teclado accesible (WAI-ARIA Accordion Pattern)
   * Flechas arriba/abajo para saltar entre disparadores, Home y End
   * @param {KeyboardEvent} e
   * @param {HTMLElement} triggerBtn
   */
  function handleAccordionKeydown(e, triggerBtn) {
    const accordion = triggerBtn.closest('.ids-accordion');
    if (!accordion) return;

    const allTriggers = Array.from(accordion.querySelectorAll('.ids-accordion__trigger:not([disabled])'));
    const currentIndex = allTriggers.indexOf(triggerBtn);
    if (currentIndex === -1) return;

    let targetIndex = -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % allTriggers.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + allTriggers.length) % allTriggers.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = allTriggers.length - 1;
    }

    if (targetIndex >= 0 && targetIndex < allTriggers.length) {
      allTriggers[targetIndex].focus();
    }
  }

  let isInitialized = false;

  /**
   * Inicializa escuchadores delegados en el DOM
   */
  function initAccordions() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Delegación de clics
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.ids-accordion__trigger, .ids-collapse__trigger');
      if (trigger) {
        e.preventDefault();
        toggleAccordion(trigger);
      }
    });

    // 2. Delegación de teclado (Flechas direccionales)
    document.addEventListener('keydown', function (e) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.classList.contains('ids-accordion__trigger') || activeEl.classList.contains('ids-collapse__trigger'))) {
        handleAccordionKeydown(e, activeEl);
      }
    });

    // 3. Sincronización inicial del estado de acordeones en el DOM
    const triggers = document.querySelectorAll('.ids-accordion__trigger, .ids-collapse__trigger');
    triggers.forEach((trigger) => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const item = trigger.closest('.ids-accordion__item') || trigger.closest('.ids-collapse');

      if (item) {
        item.classList.toggle('is-open', isExpanded);
      }
      if (panel) {
        panel.classList.toggle('is-open', isExpanded);
        panel.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
        if (isExpanded) {
          panel.removeAttribute('hidden');
          if (panel.style.display === 'none') {
            panel.style.display = '';
          }
        } else {
          panel.style.display = 'none';
          panel.setAttribute('hidden', '');
        }
      }
    });
  }

  // Exponer API en espacio de nombres IDS
  global.IDS = global.IDS || {};
  global.IDS.accordion = {
    init: initAccordions,
    toggle: toggleAccordion
  };

  // Autoejecución al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordions);
  } else {
    initAccordions();
  }
})(typeof window !== 'undefined' ? window : this);
