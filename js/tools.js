/* Categorized technology ecosystem. Update a group here when the stack changes. */
const toolGroups = [
  {
    id: 'growth', label: 'Growth, CRM & Email',
    description: 'Search visibility, measurement, forms, scheduling, and customer communication.',
    tools: [
      ['Technical SEO', 'fa-solid fa-magnifying-glass-chart'], ['GEO', 'fa-solid fa-earth-americas'],
      ['Google Tag Manager', '', '', 'pink/google-tag-manager.svg'], ['Google Analytics', '', '', 'pink/google-analytics.svg'],
      ['Klaviyo', '', '', 'pink/klaviyo.svg'], ['MailerLite', '', '', 'pink/MailerLite_Logo.svg'], ['Web3Forms', '', '', 'pink/web3forms-mark.svg'], ['Calendly', '', '', 'pink/calendly.svg'],
      ['SMTP', 'fa-solid fa-server'], ['Mailgun', '', '', 'pink/mailgun.svg'],
    ],
  },
  {
    id: 'automation', label: 'Automation & AI',
    description: 'Connected workflows and AI-assisted development.',
    tools: [
      ['n8n', '', '', 'pink/n8n.svg'], ['Google Apps Script', '', '', 'pink/google-apps-script.svg'],
      ['Google AppSheet', '', '', 'pink/google app sheet.svg'], ['OpenAI', '', '', 'pink/openai.svg'],
      ['Anthropic', '', '', 'pink/anthropic.svg'], ['Codex', '', '', 'pink/codex.svg'],
      ['Manus AI', '', '', 'pink/manus-ai.svg'], ['Google Flow', '', '', 'pink/google-flow.svg'], ['Higgsfield', '', '', 'pink/higgsfield.svg'],
    ],
  },
  {
    id: 'infrastructure', label: 'Hosting & Infrastructure',
    description: 'Version control, deployment, cloud services, hosting, and protection.',
    tools: [
      ['Cloudflare', '', '', 'pink/cloudflare.svg'], ['GitHub', 'fa-brands fa-github'], ['Vercel', '', '', 'pink/vercel.svg'],
      ['Heroku', '', '', 'pink/heroku.svg'], ['DigitalOcean / Droplets', '', '', 'pink/digitalocean.svg'], ['Railway', '', '', 'pink/railway.svg'],
      ['Render', '', '', 'pink/render.svg'], ['Firebase', '', '', 'pink/firebase.svg'], ['GoDaddy', '', '', 'pink/godaddy.svg'],
    ],
  },
];

const toolSection = document.querySelector('#tools-section');
const tabs = document.querySelector('#tool-category-tabs');
const panels = document.querySelector('#tool-groups');

const makeTool = ([name, icon, fallback, image]) => (
  '<div class="tool-logo" role="img" tabindex="0" aria-label="' + name + '">' +
    (image ? '<img class="tool-image' + (image === 'pink/MailerLite_Logo.svg' ? ' tool-image-wordmark' : '') + '" src="assets/images/platforms/' + image.split('/').map(encodeURIComponent).join('/') + '" alt="" aria-hidden="true" width="44" height="44">' : icon ? '<i class="' + icon + '" aria-hidden="true"></i>' : '<span class="tool-monogram" aria-hidden="true">' + fallback + '</span>') +
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
