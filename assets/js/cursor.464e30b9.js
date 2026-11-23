/* cursor.js: the site's custom cursor, shared by every page.
   - Everywhere: an iris. The pupil dilates over anything clickable or zoomable, and it blinks on click.
   - Some case studies get their own cursor (chosen by the page's folder):
       /chumma/    gum bubble: blows up on hover, pops on click
       /eggsta/    egg: tilts on hover, cracks on click
       /blackhole/ black hole: disk spins faster on hover, collapses on click
     The top nav and the footer always use the iris.
   - Off on touch screens (no mouse). Under "reduce motion" the cursor tracks without drift or spin.
   - Areas that already draw their own cursor (the homepage game, insight pill, the Black Hole lens)
     hide this one there. To opt any element out, add data-own-cursor to it. */
(function(){
  'use strict';
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seg = location.pathname.split('/').filter(Boolean)[0] || '';
  var PAGE = {chumma:'gum', eggsta:'egg', blackhole:'hole'}[seg] || 'eye';
  var IRIS_ZONES = '#daxxNav, footer';
  var OWN = '[data-own-cursor], .crowd, .playfield, #hero .insight.on:not(.touch), .full';
  var OWN_EXCEPT = '#hero .insight-box';
  var HOT = 'a[href], button, summary, label, select, [role=button], [role=tab], [role=link], [data-href], [onclick]';
  var HOT_NATIVE = {pointer:1, 'zoom-in':1, 'zoom-out':1, grab:1, grabbing:1};

  var css = document.createElement('style'); css.id = 'dax-cursor-style';
  css.textContent =
    'html.dax-cc, html.dax-cc *{cursor:none!important}' +
    'html.dax-cc input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]), html.dax-cc textarea, html.dax-cc [contenteditable]{cursor:text!important}' +
    'html.dax-cc #yolk{display:none!important}' +
    '#daxCur{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483000;opacity:0;transition:opacity .2s}' +
    '#daxCur.on{opacity:1}' +
    '#daxCur .dx-k{position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.28))}' +
    '#daxCur[data-kind=eye] .dx-eye,#daxCur[data-kind=gum] .dx-gum,#daxCur[data-kind=egg] .dx-egg,#daxCur[data-kind=hole] .dx-hole{display:block}' +
    '#daxCur .dx-eye,#daxCur .dx-hole{width:40px;height:40px}#daxCur .dx-gum{width:34px;height:34px}#daxCur .dx-egg{width:30px;height:38px}' +
    '#daxCur .dx-k svg{display:block;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;overflow:visible;transition:transform .25s cubic-bezier(.3,1.6,.5,1)}' +
    /* iris */
    '#daxCur .dx-lid{transform-origin:50% 50%}' +
    '#daxCur .dx-pupil{transition:r .28s cubic-bezier(.3,1.5,.5,1)}' +
    '#daxCur.hot .dx-pupil{r:9.5px}' +
    '#daxCur.hot .dx-eye svg{transform:scale(1.35)}' +
    '#daxCur.click .dx-lid{animation:daxBlink .22s ease-in-out}' +
    '@keyframes daxBlink{0%{transform:scaleY(1)}45%{transform:scaleY(.06)}100%{transform:scaleY(1)}}' +
    /* gum */
    '#daxCur.hot .dx-gum svg{transform:scale(1.6)}' +
    '#daxCur.click .dx-gum svg{animation:daxPop .4s ease-out}' +
    '@keyframes daxPop{0%{transform:scale(1.6)}40%{transform:scale(2.1);opacity:.4}41%{transform:scale(.2);opacity:0}100%{transform:scale(1);opacity:1}}' +
    /* egg */
    '#daxCur.hot .dx-egg svg{transform:rotate(-14deg) scale(1.2)}' +
    '#daxCur .dx-crack{opacity:0}' +
    '#daxCur.click .dx-crack{animation:daxCrack .45s}' +
    '#daxCur.click .dx-egg svg{animation:daxShake .45s}' +
    '@keyframes daxCrack{0%,100%{opacity:0}20%,70%{opacity:1}}' +
    '@keyframes daxShake{25%{transform:rotate(-14deg) scale(1.2)}50%{transform:rotate(10deg) scale(1.2)}75%{transform:rotate(-6deg) scale(1.2)}}' +
    /* black hole */
    '#daxCur .dx-disk{transform-origin:20px 20px;animation:daxSpin 3s linear infinite}' +
    '#daxCur.hot .dx-hole svg{transform:scale(1.5)}' +
    '#daxCur.hot .dx-disk{animation-duration:.9s}' +
    '#daxCur.click .dx-hole svg{animation:daxSuck .45s ease-in}' +
    '@keyframes daxSpin{to{transform:rotate(360deg)}}' +
    '@keyframes daxSuck{0%{transform:scale(1.5)}50%{transform:scale(.3)}100%{transform:scale(1)}}' +
    '@media (prefers-reduced-motion: reduce){#daxCur .dx-k svg,#daxCur .dx-pupil{transition:none}#daxCur .dx-disk{animation:none}}';
  document.head.appendChild(css);

  var cur = document.createElement('div');
  cur.id = 'daxCur'; cur.setAttribute('aria-hidden', 'true'); cur.dataset.kind = PAGE;
  cur.innerHTML =
    '<div class="dx-k dx-eye"><svg width="40" height="40" viewBox="0 0 40 40"><g class="dx-lid">' +
      '<circle cx="20" cy="20" r="15" fill="#fff" stroke="#0d0d0d" stroke-width="2"/>' +
      '<g stroke="#0d0d0d" stroke-width="1" opacity=".55">' +
        '<line x1="20" y1="8" x2="20" y2="12"/><line x1="20" y1="28" x2="20" y2="32"/>' +
        '<line x1="8" y1="20" x2="12" y2="20"/><line x1="28" y1="20" x2="32" y2="20"/>' +
        '<line x1="11.5" y1="11.5" x2="14.3" y2="14.3"/><line x1="25.7" y1="25.7" x2="28.5" y2="28.5"/>' +
        '<line x1="28.5" y1="11.5" x2="25.7" y2="14.3"/><line x1="11.5" y1="28.5" x2="14.3" y2="25.7"/>' +
      '</g>' +
      '<circle class="dx-pupil" cx="20" cy="20" r="5" fill="#0d0d0d"/>' +
      '<circle cx="23" cy="16.5" r="1.6" fill="#fff"/>' +
    '</g></svg></div>' +
    (PAGE === 'gum' ?
    '<div class="dx-k dx-gum"><svg width="34" height="34" viewBox="0 0 34 34">' +
      '<circle cx="17" cy="17" r="12" fill="#F27BA8" stroke="#16110E" stroke-width="2"/>' +
      '<ellipse cx="12.5" cy="12" rx="3.2" ry="2" fill="#F2E8D7" opacity=".95" transform="rotate(-30 12.5 12)"/>' +
    '</svg></div>' : '') +
    (PAGE === 'egg' ?
    '<div class="dx-k dx-egg"><svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 36c7 0 12-5 12-13S21 2 15 2 3 15 3 23s5 13 12 13z" fill="#F2DECE" stroke="#EE3125" stroke-width="2.2"/>' +
      '<path class="dx-crack" d="M5 17l4 3 3-4 4 4 3-4 3 3 3-2" fill="none" stroke="#050505" stroke-width="1.8" stroke-linejoin="round"/>' +
    '</svg></div>' : '') +
    (PAGE === 'hole' ?
    '<div class="dx-k dx-hole"><svg width="40" height="40" viewBox="0 0 40 40"><g class="dx-disk">' +
      '<ellipse cx="20" cy="20" rx="18" ry="7" fill="none" stroke="#EE2248" stroke-width="2.5" stroke-dasharray="20 6"/>' +
      '<circle cx="20" cy="20" r="13" fill="none" stroke="#F4F4F2" stroke-width="1" opacity=".6"/>' +
      '</g><circle cx="20" cy="20" r="7" fill="#000" stroke="#F4F4F2" stroke-width="1.2"/>' +
    '</svg></div>' : '');

  function start(){
    document.body.appendChild(cur);
    document.documentElement.classList.add('dax-cc');
  }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  /* Does this element ask for a clickable / zoomable cursor in the page's own CSS?
     Read it once per element with the override briefly lifted, then remember it. */
  var nativeCache = new WeakMap();
  function nativeHot(el){
    if(nativeCache.has(el)) return nativeCache.get(el);
    var root = document.documentElement;
    root.classList.remove('dax-cc');
    var hot = !!HOT_NATIVE[getComputedStyle(el).cursor];
    root.classList.add('dax-cc');
    nativeCache.set(el, hot);
    return hot;
  }

  var x = -100, y = -100, cx = x, cy = y, last = null, seen = false;
  addEventListener('mousemove', function(e){
    x = e.clientX; y = e.clientY;
    if(!seen){ seen = true; cx = x; cy = y; }
    update(e.target);
  }, {passive:true});
  /* scrolling moves the page under a still mouse, so look again at what's beneath it */
  addEventListener('scroll', function(){
    if(seen) update(document.elementFromPoint(x, y));
  }, {passive:true, capture:true});

  function update(t){
    if(!(t instanceof Element)) return;
    if(t === last) return;
    last = t;
    var own = t.closest(OWN) && !t.closest(OWN_EXCEPT);
    var typing = t.matches('input, textarea, [contenteditable], [contenteditable] *') &&
                 !t.matches('input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], input[type=range]');
    cur.classList.toggle('on', !own && !typing);
    cur.dataset.kind = t.closest(IRIS_ZONES) ? 'eye' : PAGE;
    cur.classList.toggle('hot', !!t.closest(HOT) || nativeHot(t));
  }

  var clickTimer = 0;
  addEventListener('mousedown', function(){
    cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click');
    clearTimeout(clickTimer); clickTimer = setTimeout(function(){ cur.classList.remove('click'); }, 480);
  }, {passive:true});
  document.addEventListener('mouseleave', function(){ cur.classList.remove('on'); last = null; });
  addEventListener('blur', function(){ cur.classList.remove('on'); last = null; });

  (function tick(){
    var k = reduce ? 1 : .28;
    cx += (x - cx) * k; cy += (y - cy) * k;
    cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
    requestAnimationFrame(tick);
  })();
})();
