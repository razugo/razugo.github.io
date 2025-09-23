(function(window, document) {
  const DEFAULT_BASE = '/projects/poker_tracker';
  window.PokerTracker = window.PokerTracker || {};
  const PT = window.PokerTracker;

  const NAV_ITEMS = [
    { id: 'dashboard', path: '/' },
    { id: 'bankroll', path: '/bankroll/' },
    { id: 'sessions', path: '/sessions/' },
    { id: 'tools', path: '/tools/' }
  ];

  const navInstances = new Set();
  let documentClickBound = false;

  function registerOutsideClickHandler() {
    if (documentClickBound) return;
    document.addEventListener('click', handleDocumentClick, true);
    documentClickBound = true;
  }

  function handleDocumentClick(event) {
    navInstances.forEach(instance => {
      const { menu, toggle } = instance;
      if (!menu || !toggle) return;
      const target = event.target;
      if (!menu.contains(target) && !toggle.contains(target)) {
        menu.classList.remove('open');
      }
    });
  }

  function buildNav(container) {
    const active = container.dataset.active || '';
    const base = normalizeBase(container.dataset.base || PT.basePath);

    const existingNav = container.querySelector('nav.nav');
    const navElement = existingNav || container;
    const menu = navElement.querySelector('.nav-menu');
    const toggle = navElement.querySelector('.nav-toggle');
    const liveSessionLink = navElement.querySelector('.live-session-btn');

    if (navElement === container && !existingNav) {
      container.innerHTML = getDefaultMarkup(base);
    }

    updateLinkTargets(menu, base);
    setActiveLink(menu, active);

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
      });
    }

    PT.routes = PT.routes || {};
    PT.routes.session = `${base}/session/`;

    const instance = { container, base, menu, toggle, liveSessionLink };
    navInstances.add(instance);
    registerOutsideClickHandler();

    updateLiveSessionLink(instance);
  }

  function normalizeBase(base) {
    if (!base || typeof base !== 'string') return DEFAULT_BASE;
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }

  function getDefaultMarkup(base) {
    const links = NAV_ITEMS.map(item => {
      return `<li><a href="${base}${item.path}" class="nav-link" data-nav-id="${item.id}">${capitalize(item.id)}</a></li>`;
    }).join('');

    return `
      <nav class="nav">
        <a href="${base}/" class="nav-brand">PokerTracker</a>
        <ul class="nav-menu">
          <li><a href="#" class="nav-link live-session-btn">Live Session</a></li>
          ${links}
        </ul>
        <button class="nav-toggle" aria-label="Toggle navigation">☰</button>
      </nav>
    `;
  }

  function updateLinkTargets(menu, base) {
    if (!menu) return;
    menu.querySelectorAll('a[data-nav-id]').forEach(link => {
      const id = link.dataset.navId;
      const item = NAV_ITEMS.find(entry => entry.id === id);
      if (item) {
        link.href = `${base}${item.path}`;
      }
    });
  }

  function setActiveLink(menu, activeId) {
    if (!menu) return;
    menu.querySelectorAll('a[data-nav-id]').forEach(link => {
      link.classList.toggle('active', link.dataset.navId === activeId);
    });
  }

  function updateLiveSessionLink(instance) {
    const { liveSessionLink, base } = instance;
    if (!liveSessionLink) return;

    if (!PT.DataStore) {
      liveSessionLink.textContent = 'Live Session';
      liveSessionLink.href = '#';
      liveSessionLink.style.opacity = '0.5';
      liveSessionLink.style.pointerEvents = 'none';
      liveSessionLink.title = 'Live sessions unavailable';
      liveSessionLink.classList.remove('live-session-start', 'live-session-active');
      return;
    }

    const activeSession = PT.DataStore.getActiveSession();
    liveSessionLink.classList.remove('live-session-start', 'live-session-active');

    if (activeSession) {
      liveSessionLink.textContent = 'Live Session';
      liveSessionLink.href = `${base}/session/?session_id=${activeSession.id}`;
      liveSessionLink.classList.add('live-session-active');
      liveSessionLink.style.opacity = '1';
      liveSessionLink.style.pointerEvents = 'auto';
      liveSessionLink.title = `Active session: ${activeSession.name || 'Unnamed Session'}`;
    } else {
      liveSessionLink.textContent = '+ Live Session';
      liveSessionLink.href = '#';
      liveSessionLink.classList.add('live-session-start');
      liveSessionLink.style.opacity = '1';
      liveSessionLink.style.pointerEvents = 'auto';
      liveSessionLink.title = 'Start a new live session';
    }

    liveSessionLink.onclick = function(event) {
      const currentActive = PT.DataStore.getActiveSession();
      if (!currentActive) {
        event.preventDefault();
        startNewLiveSession(base);
      }
    };
  }

  function refreshAllNavs() {
    navInstances.forEach(instance => {
      updateLinkTargets(instance.menu, instance.base);
      updateLiveSessionLink(instance);
    });
  }

  function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function startNewLiveSession(base) {
    const sessionRoute = `${base}/session/`;

    if (PT.Modal && typeof PT.Modal.showNewSessionModal === 'function') {
      PT.Modal.showNewSessionModal(true);
      return;
    }

    const sessionName = prompt('Enter a name for this live session:');
    if (!sessionName) return;

    try {
      const newSession = PT.DataStore.createLiveSession();
      PT.DataStore.updateSession(newSession.id, { name: sessionName });
      refreshAllNavs();
      window.location.href = `${sessionRoute}?session_id=${newSession.id}`;
    } catch (error) {
      console.error('Error creating live session:', error);
    }
  }

  function init() {
    const nodes = document.querySelectorAll('[data-component="nav-bar"]');
    nodes.forEach(node => buildNav(node));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('pokertracker:live-session-change', refreshAllNavs);

  PT.NavBar = {
    init,
    refresh: refreshAllNavs
  };

  window.updateLiveSessionNavLink = refreshAllNavs;
})(window, document);
