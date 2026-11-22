/* Picks the white or black DAX logo file depending on how light the logo's colour is. */
(function(){
  function light(c){
    var m=c.match(/[\d.]+/g); if(!m) return false;
    return (0.2126*m[0]+0.7152*m[1]+0.0722*m[2])/255 > 0.55;
  }
  function update(){ document.querySelectorAll('.dax-logo').forEach(function(el){ el.classList.toggle('is-light', light(getComputedStyle(el).color)); }); }
  var queued=false;
  function soon(){ if(queued) return; queued=true; requestAnimationFrame(function(){ queued=false; update(); }); }
  function settle(){ soon(); setTimeout(soon,250); setTimeout(soon,700); }
  update();
  addEventListener('scroll',soon,{passive:true});
  addEventListener('resize',soon);
  addEventListener('load',settle);
  document.addEventListener('transitionend',soon,true);
  new MutationObserver(settle).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class','style']});
})();
