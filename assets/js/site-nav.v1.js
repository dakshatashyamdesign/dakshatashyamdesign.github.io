/* site-nav.js: shared by the homepage and every project page.
   1. Desktop hover prefetch: when a mouse rests on a link to another page of the site, the browser
      fetches that page's HTML only (rel=prefetch, as=document), never its images.
   2. Homepage scroll memory: going to a project and coming back (Back button, reload, or a
      "back to work" link ending in #work) returns to where the visitor was.
   3. Project cards: any element with data-href opens its page on click, tap or Enter,
      but not at the end of a swipe or drag. */
(function(){
  'use strict';
  var KEY = 'daxx:home-scroll';
  var isHome = document.documentElement.getAttribute('data-page') === 'home';

  function sameSitePage(href){
    try{
      var u = new URL(href, location.href);
      if(u.origin !== location.origin) return null;
      if(u.pathname === location.pathname) return null;           // in-page jumps are not prefetched
      return u.href.split('#')[0];
    }catch(e){ return null; }
  }

  /* ---------- 1. hover prefetch (desktop, fine pointer, not on data saver or 2G) ---------- */
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var conn = navigator.connection || {};
  var thrifty = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  if(fine && !thrifty){
    var done = {}, timer = 0;
    var prefetch = function(url){
      if(done[url]) return; done[url] = 1;
      var l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'document'; l.href = url;
      document.head.appendChild(l);
    };
    document.addEventListener('pointerover', function(e){
      if(e.pointerType && e.pointerType !== 'mouse') return;
      var el = e.target.closest && e.target.closest('a[href], [data-href]'); if(!el) return;
      var url = sameSitePage(el.getAttribute('data-href') || el.getAttribute('href')); if(!url || done[url]) return;
      clearTimeout(timer); timer = setTimeout(function(){ prefetch(url); }, 80);   // a passing cursor doesn't count
    }, {passive:true});
    document.addEventListener('pointerout', function(){ clearTimeout(timer); }, {passive:true});
  }

  /* ---------- 3. cards with data-href: click / tap / Enter, ignoring drags ---------- */
  var downX = 0, downY = 0;
  document.addEventListener('pointerdown', function(e){ downX = e.clientX; downY = e.clientY; }, {passive:true, capture:true});
  function openCard(el, e){
    var href = el.getAttribute('data-href'); if(!href) return;
    if(e && (e.metaKey || e.ctrlKey || e.button === 1)){ window.open(href, '_blank', 'noopener'); return; }
    saveHome(); location.href = href;
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-href]'); if(!el || el.closest('a[href]')) return;
    if(Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10) return;   // that was a swipe, not a tap
    e.preventDefault(); openCard(el, e);
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    var el = e.target.closest && e.target.closest('[data-href]'); if(el) openCard(el, e);
  });

  /* ---------- 2. homepage scroll memory ---------- */
  function saveHome(){
    if(!isHome) return;
    try{
      var tab = document.querySelector('#grid [role="tab"][aria-selected="true"]');
      sessionStorage.setItem(KEY, JSON.stringify({ y: window.scrollY, cat: tab ? tab.getAttribute('data-cat') : null, at: Date.now() }));
    }catch(e){}
  }
  if(!isHome) return;

  // leaving for another page of the site (link or card) records the spot; so does any page hide
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(a && sameSitePage(a.getAttribute('href'))) saveHome();
  }, true);
  addEventListener('pagehide', saveHome);

  // the browser's own restore runs before the pinned scenes exist, so the page restores itself
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var kind = navEntry ? navEntry.type : '';
  var state = null;
  try{ state = JSON.parse(sessionStorage.getItem(KEY) || 'null'); }catch(e){}
  var toWork = location.hash === '#work';
  var toFoot = location.hash === '#foot' || location.hash === '#contact';   // e.g. "Get in touch" on a case study
  if(!toWork && !toFoot && !(state && (kind === 'back_forward' || kind === 'reload'))) return;

  function whenSettled(fn){
    var go = function(){ requestAnimationFrame(function(){ requestAnimationFrame(fn); }); };
    var afterLoad = function(){ (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go); };
    if(document.readyState === 'complete') afterLoad(); else addEventListener('load', afterLoad, {once:true});
  }
  whenSettled(function(){
    if(window.ScrollTrigger) ScrollTrigger.refresh();
    if(toFoot){
      var contact = document.querySelector('#nav a[data-go="contact"]');   // the nav's own Contact jump, so it lands exactly where it always does
      if(contact) contact.click(); else { var f = document.getElementById('foot'); if(f) scrollTo(0, f.getBoundingClientRect().top + scrollY); }
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    if(toWork){
      var work = document.querySelector('#nav a[data-go="work"]');   // the nav's own "Work" jump, so it lands exactly where it always does
      if(work) work.click(); else { var g = document.getElementById('grid'); if(g) scrollTo(0, g.getBoundingClientRect().top + scrollY); }
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    var tab = state.cat && document.querySelector('#grid [role="tab"][data-cat="' + state.cat + '"]');
    var land = function(){ window.scrollTo(0, state.y); };
    if(tab && tab.getAttribute('aria-selected') !== 'true'){ tab.click(); setTimeout(land, 720); }   // the tab switch settles first
    else land();
  });
  // returning from the back/forward cache keeps everything exactly as it was; nothing to do
})();
