/** Injects the site nav bar. Call once per page after DOM is ready. */
window.SiteLayout = {
  injectNav() {
    if (document.querySelector('.nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
      <a href="index.html" class="nav-brand">Productivity <span>Hub</span></a>
      <div class="nav-actions">
        <a href="index.html" class="nav-home">🏠 Home</a>
        <a href="account.html" class="nav-auth" id="nav-auth">Sign in</a>
      </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
  },
};
