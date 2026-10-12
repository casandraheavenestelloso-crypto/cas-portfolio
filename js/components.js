/* Shared site shell: edit navigation and footer content once here. */
(() => {
  const page = document.body.dataset.page || 'home';
  const isActive = (name) => (page === name ? ' class="active" aria-current="page"' : '');
  const main = document.querySelector('main');

  if (!main) return;

  document.body.insertAdjacentHTML('afterbegin', [
    '<a class="skip-link" href="#main-content">Skip to content</a>',
    '<header class="site-header">',
    '<nav class="nav container" aria-label="Main navigation">',
    '<a class="brand" href="index.html" aria-label="Homepage">CAS</a>',
    '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links">',
    '<span></span><span></span><span></span><span class="sr-only">Open menu</span>',
    '</button>',
    '<div class="nav-menu">',
    '<ul class="nav-links" id="nav-links">',
    '<li><a' + isActive('home') + ' href="index.html">home</a></li>',
    '<li><a' + isActive('about') + ' href="about.html">about</a></li>',
    '<li><a href="index.html#projects">projects</a></li>',
    '<li><a' + isActive('contact') + ' href="contact.html">contact</a></li>',
    '</ul>',
    '<button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="false">',
    '<i class="fa-solid fa-sun"></i></button>',
    '</div>',
    '</nav></header>',
  ].join(''));

  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersLight = globalThis.matchMedia?.('(prefers-color-scheme: light)').matches;

  const setTheme = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-' + (isLight ? 'moon' : 'sun') + '"></i>';
  };

  setTheme(savedTheme || (prefersLight ? 'light' : 'dark'));
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', nextTheme);
    setTheme(nextTheme);
  });

  main.insertAdjacentHTML('afterend', [
    '<footer class="site-footer"><div class="container footer-grid"><div>',
    '<a class="brand" href="index.html">CAS</a>',
    '<p>Thoughtful digital work for brands with somewhere to go.</p></div>',
    '<div class="footer-links"><a href="index.html">home</a>',
    '<a href="about.html">about</a><a href="index.html#projects">projects</a>',
    '<a href="contact.html">contact</a></div>',
    '<div class="socials"><a href="[SOCIAL MEDIA URL]" aria-label="LinkedIn profile">',
    '<i class="fa-brands fa-linkedin-in"></i></a>',
    '<a href="[SOCIAL MEDIA URL]" aria-label="Behance profile"><i class="fa-brands fa-behance"></i></a>',
    '<a href="[SOCIAL MEDIA URL]" aria-label="Instagram profile"><i class="fa-brands fa-instagram"></i></a>',
    '</div></div><div class="container copyright">© <span class="current-year"></span>',
    ' CAS. All rights reserved.</div></footer>',
  ].join(''));
})();
