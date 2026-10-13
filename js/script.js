/* Shared navigation, carousel, reveal, disclosure, and form interactions. */
document.addEventListener('DOMContentLoaded', () => {
  // Keep one-screen sections aligned to the visible space below the sticky navigation.
  const syncHeaderHeight = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    document.documentElement.style.setProperty(
      '--header-offset',
      `${Math.ceil(header.getBoundingClientRect().height)}px`,
    );
  };

  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });

  document.querySelectorAll('.current-year').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  const menu = document.querySelector('.nav-menu') || links;
  const backdrop = document.querySelector('.nav-backdrop');

  const setMenuOpen = (isOpen) => {
    toggle?.setAttribute('aria-expanded', String(isOpen));
    menu?.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);

    if (!backdrop) return;

    if (isOpen) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add('open'));
      return;
    }

    backdrop.classList.remove('open');
    window.setTimeout(() => {
      if (!backdrop.classList.contains('open')) backdrop.hidden = true;
    }, 420);
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    });
  }

  backdrop?.addEventListener('transitionend', () => {
    if (!backdrop.classList.contains('open')) backdrop.hidden = true;
  });

  backdrop?.addEventListener('click', () => setMenuOpen(false));

  document.addEventListener('click', (event) => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (menu?.contains(event.target) || toggle?.contains(event.target)) return;
    setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const isMenuOpen = toggle?.getAttribute('aria-expanded') === 'true';
      const isLocalLink = link.origin === window.location.origin && link.pathname !== window.location.pathname;

      if (isMenuOpen && isLocalLink) {
        event.preventDefault();
        setMenuOpen(false);
        window.setTimeout(() => {
          window.location.href = link.href;
        }, 280);
        return;
      }

      setMenuOpen(false);
    });
  });

  const projects = window.PROJECTS || [];
  const projectLink = (slug) => 'project.html?project=' + encodeURIComponent(slug);
  const renderTags = (tags = []) => tags.map((tag) => '<span>' + tag + '</span>').join('');
  const renderProjectMedia = (project, isDetail = false) => {
    const mediaUrl = project.mediaUrl || 'assets/images/project-orbit.svg';

    if (project.mediaType === 'video') {
      return isDetail
        ? '<video src="' + mediaUrl + '" controls playsinline></video>'
        : '<video src="' + mediaUrl + '" autoplay muted loop playsinline></video>';
    }

    return '<img src="' + mediaUrl + '" alt="' + project.title + ' project preview">';
  };

  const projectsGrid = document.querySelector('[data-projects-grid]');

  if (projectsGrid && projects.length) {
    projectsGrid.innerHTML = projects.map((project) => [
      '<a class="project-template reveal" href="' + projectLink(project.slug) + '">',
      renderProjectMedia(project),
      '<div class="project-content">',
      '<p class="card-kicker">' + project.category + '</p>',
      '<h3>' + project.title + '</h3>',
      '<p>' + project.description + '</p>',
      '<div class="tag-row">' + renderTags(project.tags) + '</div>',
      '</div>',
      '</a>',
    ].join('')).join('');
  }

  const projectDetail = document.querySelector('[data-project-detail]');

  if (projectDetail) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('project') || projects[0]?.slug;
    const project = projects.find((item) => item.slug === slug);

    if (project) {
      document.title = project.title + ' - CAS';
      projectDetail.innerHTML = [
        '<section class="project-detail-hero container">',
        '<a class="text-link" href="projects.html"><i class="fa-solid fa-arrow-left"></i> Back to projects</a>',
        '<p class="eyebrow">' + project.category + '</p>',
        '<h1>' + project.title + '</h1>',
        '<p class="lead">' + project.longDescription + '</p>',
        '<div class="tag-row">' + renderTags(project.tags) + '</div>',
        project.projectUrl ? '<a class="button" href="' + project.projectUrl + '" target="_blank" rel="noreferrer">Visit Project <i class="fa-solid fa-arrow-up-right-from-square"></i></a>' : '',
        '</section>',
        '<section class="project-detail-media container">',
        renderProjectMedia(project, true),
        '</section>',
      ].join('');
    } else {
      projectDetail.innerHTML = [
        '<section class="page-hero container">',
        '<p class="eyebrow">Project not found</p>',
        '<h1>Missing <span>Project.</span></h1>',
        '<p>That project slug is not in the project data yet.</p>',
        '<a class="button button-outline" href="projects.html">Back to Projects <i class="fa-solid fa-arrow-right"></i></a>',
        '</section>',
      ].join('');
    }
  }

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

  const featuredTrack = document.querySelector('[data-featured-carousel]');

  if (featuredTrack) {
    const featuredProjects = projects.filter((project) => project.featured);
    featuredTrack.innerHTML = featuredProjects.map((project) => [
      '<article class="project-card">',
      renderProjectMedia(project),
      '<div class="project-content">',
      '<p class="card-kicker">' + project.category + '</p>',
      '<h3>' + project.title + '</h3>',
      '<p>' + project.description + '</p>',
      '<div class="tag-row">' + renderTags(project.tags) + '</div>',
      '<a href="' + projectLink(project.slug) + '" class="card-link">View Project <i class="fa-solid fa-arrow-right"></i></a>',
      '</div>',
      '</article>',
    ].join('')).join('');
  }

  const carousel = document.querySelector('.carousel');

  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const originalCards = [...carousel.querySelectorAll('.project-card')];
    const carouselWindow = carousel.querySelector('.carousel-window');
    const beforeClones = originalCards.map((card) => card.cloneNode(true));
    const afterClones = originalCards.map((card) => card.cloneNode(true));
    let current = originalCards.length;
    const autoplayDelay = 5000;
    let autoplay;
    let autoplayResume;
    let isSliding = false;
    let slideUnlock;
    let lastOffset = 0;
    let dragStartX = 0;
    let dragDelta = 0;
    let isDragging = false;
    let didDrag = false;

    [...beforeClones, ...afterClones].forEach((card) => {
      card.setAttribute('aria-hidden', 'true');
      card.classList.add('carousel-clone');
    });

    track.prepend(...beforeClones);
    track.append(...afterClones);

    let cards = [...carousel.querySelectorAll('.project-card')];

    const setTrackTransition = () => {
      track.style.transition = 'none';
    };

    const updateActiveCard = () => {
      cards.forEach((item, itemIndex) => {
        item.classList.toggle('active', itemIndex === current);
      });
    };

    const getCardOffset = (card) => (
      carouselWindow.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2)
    );

    const getNearestCardIndex = (offset) => {
      let nearestIndex = current;
      let shortestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(getCardOffset(card) - offset);

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    };

    const animateTrack = (from, to) => {
      const duration = 360;
      const startTime = performance.now();
      const ease = (progress) => (
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
      );

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = from + (to - from) * ease(progress);

        track.style.transform = 'translateX(' + value + 'px)';

        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }

        lastOffset = to;
        window.clearTimeout(slideUnlock);
        finishSlide();
      };

      requestAnimationFrame(step);
    };

    const finishSlide = () => {
      if (current < originalCards.length) {
        show(current + originalCards.length, false);
      }

      if (current >= originalCards.length * 2) {
        show(current - originalCards.length, false);
      }

      isSliding = false;
    };

    const show = (index, animate = true) => {
      if (animate && isSliding) return;

      current = index;
      const card = cards[current];

      if (!card) return;

      const offset = getCardOffset(card);

      isSliding = animate;
      setTrackTransition();
      if (!animate) track.offsetHeight;
      updateActiveCard();

      window.clearTimeout(slideUnlock);

      if (!animate) {
        track.style.transform = 'translateX(' + offset + 'px)';
        lastOffset = offset;
        isSliding = false;
        return;
      }

      animateTrack(lastOffset, offset);
      if (animate) {
        slideUnlock = window.setTimeout(() => {
          lastOffset = offset;
          finishSlide();
        }, 460);
      }
    };

    const move = (direction) => show(current + direction);

    const restartAutoplay = () => {
      window.clearInterval(autoplay);
      window.clearTimeout(autoplayResume);
      autoplay = window.setInterval(() => move(1), autoplayDelay);
    };

    const pauseAutoplay = (resumeDelay = 0) => {
      window.clearInterval(autoplay);
      window.clearTimeout(autoplayResume);

      if (resumeDelay > 0) {
        autoplayResume = window.setTimeout(restartAutoplay, resumeDelay);
      }
    };

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        move(-1);
        restartAutoplay();
      }
      if (event.key === 'ArrowRight') {
        move(1);
        restartAutoplay();
      }
    });

    carousel.tabIndex = 0;
    carouselWindow.addEventListener('pointerdown', (event) => {
      if (isSliding || event.button > 0) return;

      pauseAutoplay();
      isDragging = true;
      didDrag = false;
      dragDelta = 0;
      dragStartX = event.clientX;
      carousel.classList.add('dragging');
      carouselWindow.setPointerCapture?.(event.pointerId);
    });

    carouselWindow.addEventListener('pointermove', (event) => {
      if (!isDragging) return;

      dragDelta = event.clientX - dragStartX;
      if (Math.abs(dragDelta) > 6) didDrag = true;

      track.style.transform = 'translateX(' + (lastOffset + dragDelta) + 'px)';
    });

    const endDrag = (event) => {
      if (!isDragging) return;

      isDragging = false;
      carousel.classList.remove('dragging');
      carouselWindow.releasePointerCapture?.(event.pointerId);

      const draggedOffset = lastOffset + dragDelta;
      const activeCard = cards[current];
      const threshold = Math.min(160, activeCard.offsetWidth * 0.28);
      let nextIndex = getNearestCardIndex(draggedOffset);

      if (nextIndex === current && Math.abs(dragDelta) > threshold) {
        nextIndex = current + (dragDelta < 0 ? 1 : -1);
      }

      lastOffset = draggedOffset;

      if (nextIndex !== current) {
        show(nextIndex);
      } else {
        show(current);
      }

      pauseAutoplay(autoplayDelay);
    };

    carouselWindow.addEventListener('pointerup', endDrag);
    carouselWindow.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('click', (event) => {
      if (!didDrag) return;

      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    }, true);
    carousel.addEventListener('click', (event) => {
      if (didDrag || event.target.closest('a, button')) return;

      const card = event.target.closest('.project-card');
      const link = card?.querySelector('.card-link');

      if (link?.href) window.location.href = link.href;
    });

    globalThis.addEventListener('resize', () => show(current));
    show(current, false);
    restartAutoplay();
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
