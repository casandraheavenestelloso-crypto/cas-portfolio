/* Edit this one list whenever the stack changes. */
const portfolioTools = [
  { name: 'WordPress Bricks', icon: 'fa-solid fa-cubes', fallback: 'B' },
  { name: 'WordPress Oxygen', icon: 'fa-solid fa-wind', fallback: 'O' },
  { name: 'Elementor', icon: 'simple-icons:elementor' },
  { name: 'Wix', icon: 'simple-icons:wix' },
  { name: 'Squarespace', icon: 'simple-icons:squarespace' },
  { name: 'Shopify', icon: 'fa-brands fa-shopify' },
  { name: 'GitHub', icon: 'fa-brands fa-github' },
  { name: 'n8n Automation', icon: 'simple-icons:n8n' },
  { name: 'BigCommerce', icon: 'simple-icons:bigcommerce' },
  { name: 'HTML', icon: 'fa-brands fa-html5' },
  { name: 'JSON', icon: 'fa-solid fa-code' },
  { name: 'JavaScript', icon: 'fa-brands fa-js' },
  { name: 'Java', icon: 'fa-brands fa-java' },
  { name: 'API', icon: 'fa-solid fa-plug' },
  { name: 'Liquid', icon: 'fa-solid fa-droplet' },
  { name: 'PHP', icon: 'fa-brands fa-php' },
  { name: 'MySQL', icon: 'simple-icons:mysql' },
  { name: 'Android Studio', icon: 'fa-brands fa-android' },
  { name: 'SEO', icon: 'fa-solid fa-magnifying-glass-chart' },
  { name: 'GEO', icon: 'fa-solid fa-earth-americas' },
  { name: 'Web Animation', icon: 'fa-solid fa-wand-magic-sparkles' },
  { name: 'Web3Forms', icon: 'fa-solid fa-file-lines' },
  { name: 'MailerLite', icon: 'simple-icons:mailerlite' },
  { name: 'Klaviyo', icon: 'simple-icons:klaviyo' },
  { name: 'Magento', icon: 'simple-icons:magento' },
  { name: 'Faire', icon: 'fa-solid fa-store', fallback: 'F' },
  { name: 'Email Flow', icon: 'fa-solid fa-envelope-open-text' },
  { name: 'Custom Shopify App', icon: 'simple-icons:shopify' },
  { name: 'Claude Code', icon: 'simple-icons:anthropic' },
  { name: 'Claude Cowork', icon: 'simple-icons:anthropic' },
  { name: 'Manus AI', icon: 'fa-solid fa-robot', fallback: 'M' },
  { name: 'ChatGPT', icon: 'simple-icons:openai' },
  { name: 'Google Flow', icon: 'simple-icons:google' },
  { name: 'Canva', icon: 'simple-icons:canva' },
  { name: 'Figma', icon: 'fa-brands fa-figma' },
  { name: 'GoDaddy', icon: 'simple-icons:godaddy' },
  { name: 'Higgsfield', icon: 'fa-solid fa-wand-magic-sparkles', fallback: 'H' },
  { name: 'Heroku', icon: 'simple-icons:heroku' },
  { name: 'Vercel', icon: 'simple-icons:vercel' },
  { name: 'DigitalOcean', icon: 'simple-icons:digitalocean' },
  { name: 'DigitalOcean Droplet', icon: 'simple-icons:digitalocean' },
  { name: 'Cloudflare', icon: 'simple-icons:cloudflare' },
  { name: 'Railway', icon: 'simple-icons:railway' },
  { name: 'Render', icon: 'simple-icons:render' },
  { name: 'Google Tag Manager', icon: 'simple-icons:googletagmanager' },
  { name: 'Google Analytics', icon: 'simple-icons:googleanalytics' },
  { name: 'Codex', icon: 'simple-icons:openai' },
  { name: 'Google Apps Script', icon: 'simple-icons:googleappsscript' },
  { name: 'Google AppSheet', icon: 'simple-icons:appsheet' },
];

const toolSection = document.querySelector('#tools-section');
const toolList = document.querySelector('#tool-list');

if (toolSection && toolList && portfolioTools.length) {
  toolSection.hidden = false;
  toolList.innerHTML = portfolioTools.map((tool) => (
    '<div class="tool-logo" role="img" tabindex="0" aria-label="' + tool.name + '">' +
    (tool.icon.startsWith('fa-')
      ? '<i class="' + tool.icon + '"></i>'
      : '<span class="tool-monogram" aria-hidden="true">' +
        (tool.fallback || tool.name.split(' ').map((word) => word[0]).join('').slice(0, 2)) +
        '</span>') +
    '<span class="tool-label" aria-hidden="true">' + tool.name + '</span>' +
    '<span class="sr-only">' + tool.name + '</span></div>'
  )).join('');
}
