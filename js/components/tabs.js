/**
 * ==========================================================================
 * js/components/tabs.js
 * Identity Design System (IDS) - Controlador de Navegación y Pestañas (Navbars & Tabs)
 * Heurística WAI-ARIA Tabs Pattern & Navbar (RNEP, Roving Tabindex y Teclado)
 * Sector: Tech For Human Rights (T4HR)
 * Filosofía: Trauma-Informed Design, Tecnología Consentida y WCAG AAA
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const TABLIST_SELECTOR = '[role="tablist"], .ids-tabs__list';
  const TAB_SELECTOR = '[role="tab"], .ids-tabs__tab';
  const PANEL_SELECTOR = '[role="tabpanel"], .ids-tabs__panel';
  const NAVBAR_SELECTOR = '.ids-navbar';
  const NAVBAR_LINK_SELECTOR = '.ids-navbar__link';

  /**
   * Activa una pestaña específica y sincroniza su panel correspondiente
   * @param {HTMLElement} tabEl - Elemento de la pestaña a activar
   * @param {boolean} [setFocus=true] - Si debe enfocar la pestaña
   */
  function activateTab(tabEl, setFocus = true) {
    if (!tabEl || tabEl.getAttribute('aria-disabled') === 'true' || tabEl.disabled) {
      return;
    }

    const tablist = tabEl.closest(TABLIST_SELECTOR);
    if (!tablist) return;

    const tabsContainer = tabEl.closest('.ids-tabs') || tablist.parentElement;
    const allTabs = Array.from(tablist.querySelectorAll(TAB_SELECTOR));
    const targetPanelId = tabEl.getAttribute('aria-controls');

    // 1. Actualizar estado de las pestañas hermanas (RNEP & Roving Tabindex)
    allTabs.forEach((tab) => {
      const isTarget = tab === tabEl;
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      tab.setAttribute('tabindex', isTarget ? '0' : '-1');
      tab.classList.toggle('is-selected', isTarget);
      tab.classList.toggle('is-active', isTarget);

      // Si los tabs usan clases de botones IDS, alternar jerarquía visual
      if (tab.classList.contains('ids-button')) {
        if (isTarget) {
          tab.classList.remove('ids-button--secondary', 'ids-button--ghost');
          tab.classList.add('ids-button--primary');
        } else {
          tab.classList.remove('ids-button--primary');
          tab.classList.add('ids-button--secondary');
        }
      }
    });

    // 2. Gestionar la visibilidad de los paneles asociados
    if (tabsContainer) {
      const allPanels = Array.from(tabsContainer.querySelectorAll(PANEL_SELECTOR));

      if (targetPanelId) {
        let matchingPanel = tabsContainer.querySelector(`#${targetPanelId}`);
        // Fallback de resiliencia: si el panel no existe aún en el DOM, crearlo para evitar espacios vacíos
        if (!matchingPanel && targetPanelId) {
          matchingPanel = document.createElement('div');
          matchingPanel.id = targetPanelId;
          matchingPanel.className = 'ids-tabs__panel';
          matchingPanel.setAttribute('role', 'tabpanel');
          matchingPanel.setAttribute('tabindex', '0');
          matchingPanel.style.paddingTop = 'var(--spacing-md)';
          matchingPanel.innerHTML = `<p style="margin: 0; line-height: 1.6; color: var(--color-text-secondary);">Contenido del panel de <strong>${tabEl.textContent.trim()}</strong> activo.</p>`;
          tabsContainer.appendChild(matchingPanel);
          allPanels.push(matchingPanel);
        }

        allPanels.forEach((panel) => {
          const isMatching = panel.id === targetPanelId;
          panel.classList.toggle('is-active', isMatching);
          if (isMatching) {
            panel.removeAttribute('hidden');
            if (panel.style.display === 'none') panel.style.display = '';
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      } else {
        // Fallback por índice numérico si no hay aria-controls explícito
        const activeIndex = allTabs.indexOf(tabEl);
        allPanels.forEach((panel, idx) => {
          const isMatching = idx === activeIndex;
          panel.classList.toggle('is-active', isMatching);
          if (isMatching) {
            panel.removeAttribute('hidden');
            if (panel.style.display === 'none') panel.style.display = '';
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      }
    }

    // 3. Foco accesible opcional
    if (setFocus) {
      tabEl.focus();
    }

    // 4. Despachar evento personalizado para observadores externos
    tabEl.dispatchEvent(
      new CustomEvent('ids-tab-change', {
        detail: {
          tab: tabEl,
          panelId: targetPanelId,
        },
        bubbles: true,
      })
    );
  }

  /**
   * Manejador de teclado accesible conforme a WAI-ARIA Tabs Pattern
   * @param {KeyboardEvent} e
   * @param {HTMLElement} tabEl
   */
  function handleTabKeydown(e, tabEl) {
    const tablist = tabEl.closest(TABLIST_SELECTOR);
    if (!tablist) return;

    const tabsContainer = tabEl.closest('.ids-tabs');
    const isVertical =
      tablist.getAttribute('aria-orientation') === 'vertical' ||
      (tabsContainer &&
        (tabsContainer.classList.contains('ids-tabs--vertical') ||
          tabsContainer.classList.contains('ids-tabs--vertical-end')));

    const enabledTabs = Array.from(tablist.querySelectorAll(TAB_SELECTOR)).filter(
      (t) => !t.disabled && t.getAttribute('aria-disabled') !== 'true'
    );
    if (!enabledTabs.length) return;

    const currentIndex = enabledTabs.indexOf(tabEl);
    if (currentIndex === -1) return;

    let targetIndex = -1;

    if (isVertical) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % enabledTabs.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      }
    } else {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % enabledTabs.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = enabledTabs.length - 1;
    }

    if (targetIndex >= 0 && targetIndex < enabledTabs.length) {
      activateTab(enabledTabs[targetIndex], true);
    }
  }

  let isInitialized = false;

  /**
   * Inicializa la navegación de pestañas y barras de navegación en el DOM
   */
  function initTabsAndNavbars() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Delegación de clics para Pestañas
    document.addEventListener('click', function (e) {
      const tabEl = e.target.closest(TAB_SELECTOR);
      if (tabEl) {
        e.preventDefault();
        activateTab(tabEl, true);
      }
    });

    // 2. Delegación de teclado para Pestañas
    document.addEventListener('keydown', function (e) {
      const activeEl = document.activeElement;
      if (!activeEl) return;

      const tabEl = activeEl.closest(TAB_SELECTOR);
      if (tabEl) {
        handleTabKeydown(e, tabEl);
      }
    });

    // 3. Delegación de clics para Barras de Navegación (.ids-navbar__link)
    document.addEventListener('click', function (e) {
      const linkEl = e.target.closest(NAVBAR_LINK_SELECTOR);
      if (!linkEl) return;

      const navbar = linkEl.closest(NAVBAR_SELECTOR);
      if (!navbar) return;

      const href = linkEl.getAttribute('href');
      if (!href || href === '#' || linkEl.tagName.toLowerCase() === 'button') {
        e.preventDefault();
      }

      const siblingLinks = navbar.querySelectorAll(NAVBAR_LINK_SELECTOR);
      siblingLinks.forEach((item) => {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });

      linkEl.classList.add('is-active');
      linkEl.setAttribute('aria-current', 'page');
    });

    // 4. Configurar estado inicial de pestañas en el documento
    const tablists = document.querySelectorAll(TABLIST_SELECTOR);
    tablists.forEach((tablist) => {
      const tabs = Array.from(tablist.querySelectorAll(TAB_SELECTOR));
      const activeTab =
        tabs.find((t) => t.getAttribute('aria-selected') === 'true' || t.classList.contains('is-selected') || t.classList.contains('is-active')) ||
        tabs[0];

      if (activeTab) {
        activateTab(activeTab, false);
      }
    });
  }

  global.IDS = global.IDS || {};
  global.IDSTabs = {
    init: initTabsAndNavbars,
    activate: activateTab,
  };
  global.IDS.tabs = global.IDSTabs;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabsAndNavbars);
  } else {
    initTabsAndNavbars();
  }
})(typeof window !== 'undefined' ? window : this);
