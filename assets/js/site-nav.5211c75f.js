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

  /* ---------- 0. one top nav everywhere: every project page gets the homepage's nav ----------
     DAX logo (assets/css/logo.css) on the left, Work / Meet Me / Off Clock / Contact on the right, same type, size and colour,
     fixed at the top with the same blend over whatever is beneath it. A page's own top nav is hidden
     (kept in the page, so its scripts still find it); in-page section menus are left alone. */
  if(!isHome){
    var ROOT = '../';
    if(!document.querySelector('link[href*="fonts.c7810c7b.css"]')){
      var lf = document.createElement('link'); lf.rel = 'stylesheet'; lf.href = ROOT + 'assets/css/fonts.c7810c7b.css'; document.head.appendChild(lf);
    }
    var css = document.createElement('style'); css.id = 'daxx-nav-style';
    css.textContent =
      '#daxxNav{position:fixed;top:0;left:0;right:0;z-index:9990;display:flex;justify-content:space-between;align-items:center;gap:16px;'+
        'padding:calc(env(safe-area-inset-top,0px) + 18px) clamp(18px,4vw,48px) 18px;mix-blend-mode:difference;color:#F3EADB;'+
        'pointer-events:none;box-sizing:border-box;margin:0;background:none;border:0}'+
      '#daxxNav a{pointer-events:auto;color:#F3EADB;text-decoration:none}'+
      '#daxxNav .mark{font-family:"Archivo","Helvetica Neue",Arial,sans-serif;font-weight:900;font-stretch:96%;font-size:clamp(20px,1.75vw,30px);letter-spacing:0;line-height:1;text-transform:none}'+
      '#daxxNav ul{list-style:none;display:flex;gap:clamp(14px,2.4vw,32px);margin:0;padding:0}'+
      '#daxxNav li{margin:0!important;padding:0!important;list-style:none!important;display:block!important;visibility:visible!important;opacity:1!important;width:auto!important;height:auto!important;position:static!important}'+
      '#daxxNav ul{display:flex!important;visibility:visible!important;opacity:1!important;position:static!important;transform:none!important}'+
      '#daxxNav a{display:inline-block!important;visibility:visible!important;opacity:1!important;position:static!important;transform:none!important}'+
      '#daxxNav ul a{font-family:"DM Sans","Helvetica Neue",Arial,sans-serif;font-weight:400;font-size:.95rem;letter-spacing:normal;text-transform:none;line-height:1.6;white-space:nowrap}'+
      '#daxxNav ul a:hover{text-decoration:underline;text-underline-offset:5px}'+
      '#daxxNav a:focus-visible{outline:2px solid currentColor;outline-offset:3px}'+
      '@media (max-width:640px){#daxxNav ul{gap:clamp(10px,3.6vw,18px)}#daxxNav ul a{font-size:clamp(11.5px,3.5vw,14px)}}'+
      '.daxx-old-nav{display:none!important}';
    document.head.appendChild(css);
    var mount = function(){
      if(document.getElementById('daxxNav')) return;
      // the page's own top bar: the one holding the DAXX mark, or the page's #nav
      document.querySelectorAll('nav').forEach(function(n){
        if(n.id === 'nav' || n.querySelector('a.mark') || /\bnav\b/.test(n.className) && n.parentElement && n.getBoundingClientRect().top < 40 && /fixed|sticky/.test(getComputedStyle(n).position)){
          if(/subnav|steps|chapters/.test(n.className)) return;
          n.classList.add('daxx-old-nav'); n.setAttribute('aria-hidden','true');
          n.querySelectorAll('a,button').forEach(function(x){ x.tabIndex = -1; });
        }
      });
      var nav = document.createElement('nav'); nav.id = 'daxxNav'; nav.setAttribute('aria-label','Main');
      nav.innerHTML = '<a href="'+ROOT+'" class="mark" aria-label="DAXX, back to the home page"><span class="dax-logo" aria-hidden="true"></span></a>'+
        '<ul><li><a href="'+ROOT+'#work">Work</a></li><li><a href="'+ROOT+'#hero">Meet Me</a></li>'+
        '<li><a href="'+ROOT+'#bloom">Off Clock</a></li><li><a href="'+ROOT+'#foot">Contact</a></li></ul>';
      document.body.insertBefore(nav, document.body.firstChild);
    };
    if(document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  }

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
