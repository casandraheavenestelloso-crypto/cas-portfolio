/* Categorized technology ecosystem. Update a group here when the stack changes. */
const toolGroups = [
  {
    id: 'growth', label: 'Growth, CRM & Email',
    description: 'Search visibility, measurement, forms, and customer communication.',
    tools: [
      ['Technical SEO', 'fa-solid fa-magnifying-glass-chart'], ['GEO', 'fa-solid fa-earth-americas'],
      ['Google Tag Manager', 'fa-solid fa-tags', 'GTM'], ['Google Analytics', 'fa-solid fa-chart-line', 'GA'],
      ['Klaviyo', '', 'K'], ['MailerLite', '', 'M'], ['Web3Forms', 'fa-solid fa-file-lines'], ['Email Flows', 'fa-solid fa-envelope-open-text'],
    ],
  },
  {
    id: 'automation', label: 'Automation & AI',
    description: 'Connected workflows and AI-assisted development.',
    tools: [
      ['n8n', 'fa-solid fa-diagram-project'], ['Google Apps Script', 'fa-solid fa-scroll', 'GAS'],
      ['Google AppSheet', 'fa-solid fa-table-cells-large', 'GA'], ['ChatGPT', 'fa-solid fa-comment-dots', 'C'],
      ['Claude Code', 'fa-solid fa-code', 'CC'], ['Claude Cowork', 'fa-solid fa-people-group', 'CC'], ['Codex', 'fa-solid fa-terminal', 'C'],
      ['Manus AI', 'fa-solid fa-robot', 'M'], ['Google Flow', 'fa-solid fa-wand-magic-sparkles', 'GF'], ['Higgsfield', 'fa-solid fa-wand-magic-sparkles', 'H'],
    ],
  },
  {
    id: 'infrastructure', label: 'Hosting & Infrastructure',
    description: 'Version control, deployment, cloud hosting, and protection.',
    tools: [
      ['Cloudflare', 'fa-solid fa-cloud', 'C'], ['GitHub', 'fa-brands fa-github'], ['Vercel', 'fa-solid fa-play', 'V'],
      ['Heroku', 'fa-solid fa-h', 'H'], ['DigitalOcean / Droplets', 'fa-solid fa-droplet', 'DO'], ['Railway', 'fa-solid fa-train-subway', 'R'],
      ['Render', 'fa-solid fa-server', 'R'], ['GoDaddy', 'fa-solid fa-globe', 'G'],
    ],
  },
];

const toolSection = document.querySelector('#tools-section');
const tabs = document.querySelector('#tool-category-tabs');
const panels = document.querySelector('#tool-groups');

const makeTool = ([name, icon, fallback]) => (
  '<div class="tool-logo" role="img" tabindex="0" aria-label="' + name + '">' +
    (icon ? '<i class="' + icon + '" aria-hidden="true"></i>' : '<span class="tool-monogram" aria-hidden="true">' + fallback + '</span>') +
    '<span class="tool-label" aria-hidden="true">' + name + '</span><span class="sr-only">' + name + '</span></div>'
);

if (toolSection && tabs && panels && toolGroups.length) {
  toolSection.hidden = false;
  tabs.innerHTML = toolGroups.map((group, index) => (
    '<button class="tool-category-tab' + (index === 0 ? ' is-active' : '') + '" type="button" role="tab" id="tab-' + group.id +
    '" aria-controls="panel-' + group.id + '" aria-selected="' + (index === 0) + '">' + group.label + '</button>'
  )).join('');
  panels.innerHTML = toolGroups.map((group, index) => (
    '<section class="tool-category-panel" id="panel-' + group.id + '" role="tabpanel" aria-labelledby="tab-' + group.id + '"' + (index ? ' hidden' : '') + '>' +
      '<div class="tool-category-copy"><h3>' + group.label + '</h3><p>' + group.description + '</p></div><div class="tool-list">' +
      group.tools.map(makeTool).join('') + '</div></section>'
  )).join('');
  tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('.tool-category-tab');
    if (!tab) return;
    const targetId = tab.id.replace('tab-', 'panel-');
    tabs.querySelectorAll('.tool-category-tab').forEach((button) => {
      const active = button === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    panels.querySelectorAll('.tool-category-panel').forEach((panel) => { panel.hidden = panel.id !== targetId; });
  });
}
