/**
 * ==========================================================================
 * js/components/carousel.js
 * Identity Design System (IDS) - Organismo: Carrusel y Deslizador Accesible
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

  function initCarousels() {
    const carousels = document.querySelectorAll('.ids-carousel');
    if (!carousels.length) return;

    carousels.forEach((carousel) => {
      if (carousel.dataset.idsCarouselInit === 'true') return;
      carousel.dataset.idsCarouselInit = 'true';

      const track = carousel.querySelector('.ids-carousel__track');
      let slides = Array.from(carousel.querySelectorAll('.ids-carousel__slide'));
      if (!slides.length) return;

      const prevBtn = carousel.querySelector('.ids-carousel__control--prev');
      const nextBtn = carousel.querySelector('.ids-carousel__control--next');
      const indicators = carousel.querySelectorAll('.ids-carousel__indicator');
      const counterEl = carousel.querySelector('.ids-carousel__counter');
      const pauseToggle = carousel.querySelector('.ids-carousel__playback-btn, .ids-carousel__pause-toggle');

      let currentIndex = 0;
      const totalSlides = slides.length;

      function updateSlide(newIndex, announceChange = true) {
        if (newIndex < 0) {
          currentIndex = totalSlides - 1;
        } else if (newIndex >= totalSlides) {
          currentIndex = 0;
        } else {
          currentIndex = newIndex;
        }

        slides.forEach((slide, idx) => {
          const isActive = idx === currentIndex;
          slide.classList.toggle('is-active', isActive);
          slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
          slide.setAttribute('tabindex', isActive ? '0' : '-1');
          slide.style.display = isActive ? 'block' : 'none';
        });

        if (indicators.length) {
          indicators.forEach((indicator, idx) => {
            const isActive = idx === currentIndex;
            indicator.classList.toggle('is-active', isActive);
            indicator.setAttribute('aria-current', isActive ? 'true' : 'false');
          });
        }

        if (counterEl) {
          counterEl.textContent = `${currentIndex + 1} de ${totalSlides}`;
        }

        if (announceChange) {
          const activeSlide = slides[currentIndex];
          const slideLabel = activeSlide.getAttribute('aria-label') || `Diapositiva ${currentIndex + 1} de ${totalSlides}`;
          announce(slideLabel);
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          updateSlide(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          updateSlide(currentIndex + 1);
        });
      }

      if (pauseToggle) {
        let isPlaying = false;
        let autoTimer = null;
        pauseToggle.addEventListener('click', (e) => {
          e.preventDefault();
          isPlaying = !isPlaying;
          pauseToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
          pauseToggle.setAttribute('aria-label', isPlaying ? 'Pausar avance automático' : 'Reanudar avance automático');
          if (isPlaying) {
            autoTimer = setInterval(() => updateSlide(currentIndex + 1, false), 4000);
            announce('Avance automático del carrusel reanudado');
          } else {
            clearInterval(autoTimer);
            announce('Avance automático del carrusel pausado');
          }
        });
      }

      // Teclas de dirección cuando el carrusel tiene foco
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateSlide(currentIndex + 1);
        }
      });

      // Estado inicial
      updateSlide(0, false);
    });
  }

  global.IDS = global.IDS || {};
  global.IDS.carousel = {
    init: initCarousels
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
})(typeof window !== 'undefined' ? window : this);
