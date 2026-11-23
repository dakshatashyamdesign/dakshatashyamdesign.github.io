/* music.js: background music with an on/off switch, shared by every page.
   - Off by default. On desktop the switch sits at the end of the top nav (four small bars that dance
     while it plays); on phones, or a page with no nav, it is a small round button in the bottom-right corner.
   - The choice is remembered, and the track carries on from where it was when you open another page.
     If the browser blocks sound on a new page, it starts on the visitor's first click or key press.
   - Pauses while the tab is hidden. Fades in and out.
   To change the track, replace the file in assets/audio and update TRACK. */
(function(){
  'use strict';
  var TRACK = 'daydream.9ddf7b81.mp3';
  var VOLUME = 0.35;
  var KEY = 'dax:music', TKEY = 'dax:music-t';

  var me = document.currentScript;
  var src = new URL('../audio/' + TRACK, me ? me.src : location.href).href;

  function get(store, k){ try{ return window[store].getItem(k); }catch(e){ return null; } }
  function set(store, k, v){ try{ window[store].setItem(k, v); }catch(e){} }

  var on = get('localStorage', KEY) === 'on';
  var audio = null, fadeT = 0, waiting = false;

  function ensure(){
    if(audio) return audio;
    audio = new Audio(src);
    audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
    var t = parseFloat(get('sessionStorage', TKEY));
    if(t > 0) audio.addEventListener('loadedmetadata', function once(){
      audio.removeEventListener('loadedmetadata', once);
      try{ audio.currentTime = t % (audio.duration || Infinity); }catch(e){}
    });
    audio.addEventListener('playing', paint);
    audio.addEventListener('pause', paint);
    return audio;
  }
  function fade(to, ms, done){
    cancelAnimationFrame(fadeT);
    var a = ensure(), from = a.volume, t0 = performance.now();
    (function step(now){
      var k = Math.min(1, Math.max(0, (now - t0) / ms));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if(k < 1) fadeT = requestAnimationFrame(step); else if(done) done();
    })(t0);
  }
  function play(){
    var a = ensure();
    var p = a.play();
    if(p && p.then) p.then(function(){ fade(VOLUME, 1500); }, waitForGesture);
    else fade(VOLUME, 1500);
  }
  function stop(){
    if(!audio) return;
    fade(0, 500, function(){ if(!on) audio.pause(); });
  }
  /* a fresh page may not be allowed to make sound until the visitor does something */
  function waitForGesture(){
    if(waiting) return;
    waiting = true; paint();
    var go = function(e){
      if(e && e.target && e.target.closest && e.target.closest('#daxMusic')) return; // the switch handles itself
      removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true);
      waiting = false;
      if(on) play();
    };
    addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
  }

  /* ---------- the switch ---------- */
  var css = document.createElement('style');
  css.textContent =
    '#daxMusic{all:unset;box-sizing:border-box;cursor:pointer;pointer-events:auto;display:inline-flex;align-items:center;gap:8px;' +
      'min-height:32px;padding:2px 0;color:inherit;font:inherit;font-size:.95rem;line-height:1.6;white-space:nowrap}' +
    '#daxMusic:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:4px}' +
    '#daxMusic .bars{display:inline-flex;align-items:flex-end;gap:2px;height:13px}' +
    '#daxMusic .bars i{display:block;width:2px;height:4px;background:currentColor;border-radius:1px;transition:height .3s}' +
    '#daxMusic[aria-pressed=true] .bars i{animation:daxEq 1s ease-in-out infinite}' +
    '#daxMusic[aria-pressed=true] .bars i:nth-child(2){animation-delay:-.4s}' +
    '#daxMusic[aria-pressed=true] .bars i:nth-child(3){animation-delay:-.7s}' +
    '#daxMusic[aria-pressed=true] .bars i:nth-child(4){animation-delay:-.2s}' +
    '#daxMusic.wait .bars i{animation-play-state:paused}' +
    '@keyframes daxEq{0%,100%{height:3px}50%{height:13px}}' +
    '#daxMusic:hover .lbl{text-decoration:underline;text-underline-offset:5px}' +
    '#daxMusicLi{margin:0!important;padding:0!important;list-style:none!important;display:flex!important;align-items:center}' +
    '#daxMusicFloat{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 44px);z-index:9991;' +
      'mix-blend-mode:difference;color:#F3EADB}' +
    '#daxMusicFloat #daxMusic{width:44px;height:44px;justify-content:center;padding:0;border:1.5px solid currentColor;border-radius:50%}' +
    '#daxMusicFloat #daxMusic .lbl{display:none}' +
    '@media (prefers-reduced-motion: reduce){#daxMusic .bars i{animation:none!important}#daxMusic[aria-pressed=true] .bars i{height:9px}}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'daxMusic';
  btn.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Sound off</span>';

  function paint(){
    var playing = on && audio && !audio.paused;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Background music is on. Turn it off' : 'Background music is off. Turn it on');
    btn.title = on ? 'Music on' : 'Music off';
    btn.querySelector('.lbl').textContent = on ? 'Sound on' : 'Sound off';
    btn.classList.toggle('wait', !!(on && !playing));
  }
  btn.addEventListener('click', function(){
    on = !on;
    set('localStorage', KEY, on ? 'on' : 'off');
    if(on) play(); else stop();
    paint();
  });

  var small = matchMedia('(max-width:640px)');
  var li = document.createElement('li'); li.id = 'daxMusicLi';
  var wrap = document.createElement('div'); wrap.id = 'daxMusicFloat';
  function place(){
    var ul = document.querySelector('#daxxNav ul') || document.querySelector('html[data-page=home] #nav ul');
    if(ul && !small.matches){
      li.appendChild(btn);
      if(li.parentNode !== ul) ul.appendChild(li);
      if(wrap.parentNode) wrap.parentNode.removeChild(wrap);
    } else {
      wrap.appendChild(btn);
      if(!wrap.parentNode) document.body.appendChild(wrap);
      if(li.parentNode) li.parentNode.removeChild(li);
    }
    paint();
    return !!ul;
  }
  function mount(tries){
    if(!place() && tries < 20) setTimeout(function(){ mount(tries + 1); }, 100);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ mount(0); });
  else mount(0);
  if(small.addEventListener) small.addEventListener('change', place);

  if(on) play();

  addEventListener('pagehide', function(){
    if(audio && !audio.paused) set('sessionStorage', TKEY, String(audio.currentTime));
  });
  document.addEventListener('visibilitychange', function(){
    if(!audio || !on) return;
    if(document.hidden) audio.pause(); else play();
  });
})();
