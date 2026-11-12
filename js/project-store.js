/* Merge saved changes with the original portfolio without requiring a redeploy. */
window.ProjectStore = {
  merge(original, saved) {
    const changes = new Map(saved.map(project => [project.slug, project]));
    return [
      ...saved.filter(project => !project.deleted && !original.some(item => item.slug === project.slug)),
      ...original.map(project => changes.get(project.slug) || { ...project, version: 0 }).filter(project => !project.deleted),
    ];
  },
  async load() {
    const response = await fetch('/api/projects', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load projects.');
    return this.merge(window.PROJECTS || [], result.projects);
  },
};
