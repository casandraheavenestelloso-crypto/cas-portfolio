(() => {
  const $ = selector => document.querySelector(selector);
  const form = $('#project-form');
  const feedback = $('#feedback');
  let projects = [], current = {}, gallery = [], cover = '', pending = 0, dirty = false;
  const message = value => { feedback.textContent = value; };
  async function api(path, options = {}) {
    const response = await fetch(path, { ...options, cache: 'no-store' });
    const result = await response.json();
    if (response.status === 401 && path !== '/api/session') showLogin();
    if (!response.ok) throw new Error(result.error || 'Request failed. Please try again.');
    return result;
  }
  function showLogin() { $('#login-panel').hidden = false; $('#workspace').hidden = true; $('#logout').hidden = true; }
  async function showWorkspace() {
    projects = await window.ProjectStore.load();
    $('#login-panel').hidden = true; $('#workspace').hidden = false; $('#logout').hidden = false;
    renderList();
    if (!dirty) edit({});
  }
  function renderList() {
    $('#project-list').replaceChildren(...projects.map(project => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = project.title;
      button.setAttribute('aria-pressed', String(project.slug === current.slug));
      button.onclick = () => { if (canLeave()) edit(project); };
      return button;
    }));
  }
  const canLeave = () => !pending && (!dirty || confirm('Discard your unsaved project changes?'));
  function edit(project) {
    current = structuredClone(project); gallery = structuredClone(project.gallery || []); cover = project.mediaUrl || '';
    form.reset();
    for (const name of ['title', 'slug', 'category', 'description', 'longDescription', 'projectUrl', 'demoUrl', 'driveVideoUrl']) form.elements[name].value = project[name] || '';
    form.elements.slug.readOnly = Boolean(project.slug);
    form.elements.tags.value = (project.tags || []).join(', ');
    form.elements.details.value = (project.detailParagraphs || []).join('\n\n');
    form.elements.featured.checked = Boolean(project.featured);
    $('#editor-title').textContent = project.slug ? `Edit ${project.title}` : 'New project';
    $('#delete-project').hidden = !project.slug;
    $('#preview-project').hidden = !project.slug;
    $('#preview-project').href = `project.html?project=${encodeURIComponent(project.slug || '')}`;
    dirty = false; renderMedia(); renderList();
  }
  function image(src, alt) { const img = document.createElement('img'); img.src = src; img.alt = alt; return img; }
  function action(label, callback) { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.onclick = callback; return button; }
  function renderMedia() {
    $('#cover-preview').replaceChildren();
    if (cover) $('#cover-preview').append(image(cover, 'Current cover'), action('Remove cover', () => { cover = ''; current.mediaType = 'image'; dirty = true; renderMedia(); }));
    $('#gallery-editor').replaceChildren(...gallery.map((item, index) => {
      const row = document.createElement('div'); row.className = 'gallery-item'; row.append(image(item.src, item.alt || 'Screenshot'));
      for (const [key, title] of [['caption', 'Caption'], ['alt', 'Alternative text']]) {
        const label = document.createElement('label'); label.textContent = title;
        const input = document.createElement('input'); input.value = item[key] || ''; input.maxLength = 300;
        input.oninput = () => { item[key] = input.value; dirty = true; };
        label.append(input); row.append(label);
      }
      const controls = document.createElement('div'); controls.className = 'gallery-controls';
      const up = action('Move up', () => { [gallery[index - 1], gallery[index]] = [gallery[index], gallery[index - 1]]; dirty = true; renderMedia(); }); up.disabled = index === 0;
      controls.append(up, action('Use as cover', () => { cover = item.src; current.mediaType = 'image'; dirty = true; renderMedia(); }), action('Remove', () => { gallery.splice(index, 1); dirty = true; renderMedia(); }));
      row.append(controls); return row;
    }));
  }
  function lock(active) {
    form.querySelectorAll('input,textarea,button').forEach(element => { element.disabled = active; });
    $('#new-project').disabled = active;
    $('#logout').disabled = active;
    $('#project-list').querySelectorAll('button').forEach(button => { button.disabled = active; });
  }
  async function upload(file) {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 3 * 1024 * 1024) throw new Error('Choose PNG, JPEG, WebP, or GIF files up to 3 MB each.');
    const result = await api('/api/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
    return { src: result.url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' };
  }
  async function uploadFiles(input, isCover) {
    if (!input.files.length) return;
    const files = [...input.files];
    if (!isCover && gallery.length + files.length > 30) { message('Use at most 30 screenshots.'); input.value = ''; return; }
    pending++; lock(true);
    try {
      for (const [index, file] of files.entries()) {
        message(`Uploading ${index + 1} of ${files.length}…`);
        const item = await upload(file);
        if (isCover) { cover = item.src; current.mediaType = 'image'; } else gallery.push(item);
        dirty = true;
      }
      message('Upload complete. Publish the project to save your changes.');
    } catch (error) { message(error.message); }
    finally { pending--; input.value = ''; renderMedia(); lock(false); }
  }
  $('#cover-file').onchange = event => uploadFiles(event.target, true);
  $('#gallery-files').onchange = event => uploadFiles(event.target, false);
  $('#new-project').onclick = () => { if (canLeave()) { edit({}); message(''); form.elements.title.focus(); } };
  form.oninput = () => { dirty = true; };
  form.elements.title.addEventListener('input', () => {
    if (!current.slug) form.elements.slug.value = form.elements.title.value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '');
  });
  form.onsubmit = async event => {
    event.preventDefault(); if (pending) return;
    const values = Object.fromEntries(new FormData(form));
    const project = { ...current, ...values, featured: form.elements.featured.checked, mediaUrl: cover, gallery, tags: values.tags.split(',').map(x => x.trim()).filter(Boolean), detailParagraphs: values.details.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean) };
    if (!current.slug && projects.some(item => item.slug === project.slug)) { message('That slug belongs to an existing project. Choose a different one.'); return; }
    pending++; lock(true); message('Publishing…');
    try {
      const result = await api('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project, version: current.version || 0 }) });
      projects = [result.project, ...projects.filter(item => item.slug !== project.slug)];
      edit(result.project); message('Project published. It is now live on your portfolio.');
    } catch (error) { message(error.message); }
    finally { pending--; lock(false); }
  };
  $('#delete-project').onclick = async () => {
    if (pending || !confirm(`Delete “${current.title}” from your portfolio?`)) return;
    pending++; lock(true);
    try {
      await api('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: { slug: current.slug, deleted: true }, version: current.version || 0 }) });
      projects = projects.filter(item => item.slug !== current.slug); edit({}); message('Project deleted.');
    } catch (error) { message(error.message); }
    finally { pending--; lock(false); }
  };
  $('#login-form').onsubmit = async event => {
    event.preventDefault(); const button = event.target.querySelector('button'); button.disabled = true;
    try {
      await api('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
      event.target.reset(); await showWorkspace(); message('');
    } catch (error) { message(error.message); }
    finally { button.disabled = false; }
  };
  $('#logout').onclick = async () => {
    if (!canLeave()) return;
    try { await api('/api/session', { method: 'DELETE' }); dirty = false; edit({}); showLogin(); message('Signed out.'); }
    catch (error) { message(error.message); }
  };
  window.addEventListener('beforeunload', event => { if (dirty || pending) { event.preventDefault(); event.returnValue = ''; } });
  api('/api/session').then(async result => { if (result.authenticated) await showWorkspace(); }).catch(error => message(error.message));
})();
