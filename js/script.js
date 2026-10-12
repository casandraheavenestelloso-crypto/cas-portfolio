/* Shared navigation, carousel, reveal, disclosure, and form interactions. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.current-year').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  const menu = document.querySelector('.nav-menu') || links;

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('open', !isOpen);
    });
  }

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      menu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  const staggerGroups = [
    '.skill-grid',
    '.tool-list',
    '.timeline',
    '.value-grid',
    '.stats',
  ];

  staggerGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((group) => {
      [...group.children].forEach((child, index) => {
        if (!child.classList.contains('reveal')) return;
        child.style.setProperty('--reveal-delay', (index * 85) + 'ms');
      });
    });
  });

  document.querySelectorAll('.portrait-stack, .about-image').forEach((element) => {
    element.classList.add('reveal--scale');
  });

  document.querySelectorAll('.hero-copy, .contact-intro').forEach((element) => {
    element.classList.add('reveal--from-left');
  });

  document.querySelectorAll('.contact-form').forEach((element) => {
    element.classList.add('reveal--from-right');
  });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  document.querySelectorAll('.read-more').forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.closest('.experience-card').querySelector('.more-content');
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isOpen));
      content.hidden = isOpen;
      button.innerHTML = isOpen
        ? 'Read more <i class="fa-solid fa-plus"></i>'
        : 'Show less <i class="fa-solid fa-minus"></i>';
    });
  });

  const carousel = document.querySelector('.carousel');

  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const cards = [...carousel.querySelectorAll('.project-card')];
    const dots = carousel.querySelector('.carousel-dots');
    let current = 1;
    let touchStart = 0;

    const show = (index) => {
      current = (index + cards.length) % cards.length;

      const carouselWindow = carousel.querySelector('.carousel-window');
      const card = cards[current];
      const offset = carouselWindow.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);

      track.style.transform = 'translateX(' + offset + 'px)';

      cards.forEach((item, itemIndex) => {
        item.classList.toggle('active', itemIndex === current);
      });

      [...dots.children].forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    };

    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show project ' + (index + 1));
      dot.addEventListener('click', () => show(index));
      dots.append(dot);
    });

    carousel.querySelector('.prev').addEventListener('click', () => show(current - 1));
    carousel.querySelector('.next').addEventListener('click', () => show(current + 1));
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });

    carousel.tabIndex = 0;
    carousel.addEventListener('touchstart', (event) => {
      touchStart = event.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', (event) => {
      const distance = event.changedTouches[0].screenX - touchStart;
      if (Math.abs(distance) > 40) show(current + (distance < 0 ? 1 : -1));
    }, { passive: true });

    globalThis.addEventListener('resize', () => show(current));
    show(current);
  }

  const form = document.querySelector('.contact-form');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let isValid = true;

      form.querySelectorAll('[required]').forEach((input) => {
        const error = !input.value.trim()
          ? 'This field is required.'
          : input.type === 'email' && !input.validity.valid
            ? 'Enter a valid email address.'
            : '';

        input.closest('.field').querySelector('small').textContent = error;
        input.setAttribute('aria-invalid', String(Boolean(error)));
        if (error) isValid = false;
      });

      const feedback = form.querySelector('.form-feedback');
      feedback.textContent = isValid
        ? 'Thanks! Your message is ready to send—connect this form to a service to receive it.'
        : 'Please correct the fields highlighted above.';
      feedback.className = 'form-feedback ' + (isValid ? 'success' : 'error');
    });
  }
});
