(function(){
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

/* ---------- eyes that follow the cursor ---------- */
let mx = innerWidth/2, my = innerHeight/2, ticking = false;
function track(){
  ticking = false;
  document.querySelectorAll('.tracker').forEach(t=>{
    const b = t.getBoundingClientRect();
    if(b.bottom < -50 || b.top > innerHeight+50) return;
    const cx = b.left + b.width/2, cy = b.top + b.height/2;
    const a = Math.atan2(my-cy, mx-cx), r = +t.dataset.r;
    t.setAttribute('transform',`translate(${(Math.cos(a)*r).toFixed(1)} ${(Math.sin(a)*r).toFixed(1)})`);
  });
}
function onMove(e){ const p = e.touches? e.touches[0] : e; mx=p.clientX; my=p.clientY; if(!ticking){ticking=true; requestAnimationFrame(track);} }
addEventListener('pointermove', onMove, {passive:true});
addEventListener('scroll', ()=>{ if(!ticking){ticking=true; requestAnimationFrame(track);} }, {passive:true});

/* ---------- depth gauge ---------- */
const dot = document.getElementById('gaugeDot');
function gauge(){ const p = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); dot.style.left = (p*100)+'%'; }
addEventListener('scroll', gauge, {passive:true}); gauge();

/* ---------- AWAKE: the wall watches you, then you fall into her eye ---------- */
const hero = document.getElementById('hero'), scene = document.getElementById('scene'), girl = document.getElementById('girl'), wall = document.getElementById('wall');
const layers = { l1:document.getElementById('L1'), lt:document.getElementById('LT'), l2:document.getElementById('L2') };
const order = [layers.l1, layers.lt, layers.l2];
const inners = order.map(l=> l.querySelector('.inner'));
const irisSvg = document.getElementById('irisSvg'), irisG = document.getElementById('irisG'), night = document.getElementById('night'), foot = document.getElementById('heroFoot');
const nav = document.getElementById('nav'), glint = document.getElementById('glint'), about = document.getElementById('about'), closewrap = document.getElementById('closewrap'), patch = closewrap.querySelector('.patch');
(function(){ const g = document.getElementById('fibres'); let h='';
  const cols=['#1A0E08','#6B4A34','#2A170E','#7D5A40'];
  for(let i=0;i<84;i++){ const a=i/84*Math.PI*2 + (i%3)*.02, r0=.47+(i%4)*.025, r1=.9-(i%5)*.04;
    h+=`<line stroke="${cols[i%4]}" stroke-opacity=".45" stroke-width="${(.008+(i%4)*.006).toFixed(3)}" x1="${(Math.cos(a)*r0).toFixed(3)}" y1="${(Math.sin(a)*r0).toFixed(3)}" x2="${(Math.cos(a)*r1).toFixed(3)}" y2="${(Math.sin(a)*r1).toFixed(3)}"/>`; }
  g.innerHTML = h; })();
// her left iris inside 3_.png, measured from the artwork
const EYE = { x:.41931, y:.10221, r:.00795 };   // her left iris, from Girl_High_res / Closeup_High_res
const CMAX = 2600;
let eye = { vx:0, vy:0, sx:0, sy:0, r:3 }, zoomP = 0, zoomQ = 0, zoomG = 0, pan = 0, mouseX = 0, mouseY = 0;
const smooth = x => x*x*(3-2*x);
const portrait = () => matchMedia('(max-aspect-ratio: 4/5)').matches;
// scroll progress q -> camera progress p: push in to her face, hold while she says hello, then fall into her eye
function camera(q){
  if(q < .28) return q/.28*.33;
  if(q < .56) return .33 + (q-.28)/.28*.04;
  return .37 + (q-.56)/.44*.63;
}
function scrollTo(q){
  zoomQ = q;
  const tin = clamp((q-.22)/.08,0,1), tout = 1 - clamp((q-.52)/.06,0,1);
  const t1 = smooth(clamp((q-.23)/.07,0,1))*tout, t2 = smooth(clamp((q-.27)/.07,0,1))*tout;
  about.style.opacity = (smooth(tin)*tout).toFixed(3);
  about.style.setProperty('--t1', t1.toFixed(3)); about.style.setProperty('--t2', t2.toFixed(3));
  pan = portrait() ? 0 : innerWidth*.2*smooth(clamp((q-.18)/.12,0,1))*(1 - smooth(clamp((q-.52)/.08,0,1)));
  render(camera(q));
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function measure(){
  order.forEach(l=> l.style.transform='none');
  inners.forEach(n=> n.style.transform='none');
  scene.style.transform = 'translate(-50%,-50%)';
  const hr = hero.getBoundingClientRect(), sr = scene.getBoundingClientRect(), g = girl.getBoundingClientRect();
  if(!g.height) return;
  // aim at the close-up's own pupil: the eye patch is cut centred on it
  const pr = patch.getBoundingClientRect();
  const px = pr.width ? pr.left + pr.width/2 : g.left + g.width*EYE.x, py = pr.width ? pr.top + pr.height/2 : g.top + g.height*EYE.y;
  eye.vx = px - hr.left;  eye.vy = py - hr.top;
  eye.sx = px - sr.left;  eye.sy = py - sr.top;
  eye.r = pr.width ? pr.width/(2*2.4) : g.height*EYE.r;
  order.forEach(l=> l.style.transformOrigin = `${eye.sx}px ${eye.sy}px`);
  if(typeof master === 'function' && tcv) master(zoomG); else scrollTo(zoomQ);
}
function render(p){
  zoomP = p;
  const C = Math.exp(Math.log(CMAX) * Math.pow(p,1.18));
  lastC = C;
  const m = Math.max(0, 1 - p*25);
  const sway = [[.005,.003],[.009,.004],[.014,.006]];
  const scales = [Math.pow(C,.3), Math.pow(C,.55), C];
  order.forEach((l,i)=>{
    l.style.transform = `scale(${scales[i]})`;
    inners[i].style.transform = `translate(${(mouseX*sway[i][0]*innerWidth*m).toFixed(2)}px, ${(mouseY*sway[i][1]*innerHeight*m).toFixed(2)}px)`;
  });
  scene.style.transform = `translate(calc(-50% + ${pan.toFixed(1)}px), -50%)`;
  layers.lt.style.opacity = clamp(1 - p/.13, 0, 1);
  foot.style.opacity = clamp(1 - p/.07, 0, 1);
  irisSvg.style.opacity = 0;                                   // your painted close-up carries the zoom now
  closewrap.style.opacity = smooth(clamp((C-3.6)/2.6, 0, 1)).toFixed(3);
  irisG.setAttribute('transform', `translate(${(eye.vx+pan).toFixed(2)} ${eye.vy.toFixed(2)}) scale(${(eye.r*C).toFixed(3)})`);
  layers.l1.style.visibility = C > 80 ? 'hidden' : 'visible';
}

/* the wall's eyeballs follow the pointer: each sits behind its painted lids, lags a little
   differently, darts on big jumps, foreshortens toward the edge and widens when you come close */
const balls = [...wall.querySelectorAll('.ball')].map((el,i)=>({el, x:+el.dataset.x, y:+el.dataset.y, d:+el.dataset.d, rx:+el.dataset.rx, ry:+el.dataset.ry, rot:+el.dataset.rot,
  cx:0, cy:0, dil:1, lag:.05 + ((i*37)%9)/100}));
let gx = innerWidth/2, gy = innerHeight*.45, lastMove = -1e9, hadPointer = false;
function aim(x,y){ gx=x; gy=y; lastMove=performance.now(); hadPointer=true; }
addEventListener('pointermove', e=> aim(e.clientX, e.clientY), {passive:true});
addEventListener('touchstart', e=> aim(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
addEventListener('touchmove', e=> aim(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
function watch(t){
  requestAnimationFrame(watch);
  if(zoomP > .4 || document.hidden) return;
  const wr = wall.getBoundingClientRect(); if(!wr.width) return;
  const s = wr.width/2560;
  let tx = gx, ty = gy;
  if(!reduce && (!hadPointer || t - lastMove > 4000)){
    tx = innerWidth*(.5 + .38*Math.sin(t/2600)); ty = innerHeight*(.42 + .22*Math.sin(t/1900 + 1.3));
  }
  for(const p of balls){
    const ex = wr.left + p.x*s, ey = wr.top + p.y*s;
    const dx = tx-ex, dy = ty-ey, d = Math.hypot(dx,dy) || 1;
    const reach = Math.min(1, d/(innerWidth*.26));
    const ax = dx/d*reach, ay = dy/d*reach;
    const err = Math.hypot(ax-p.cx, ay-p.cy);
    const k = p.lag + Math.min(.3, err*.35);
    p.cx += (ax-p.cx)*k; p.cy += (ay-p.cy)*k;
    const near = Math.max(0, 1 - d/(innerWidth*.18));
    p.dil += (1 + near*.06 - p.dil)*.06;
    const sx = (1 - Math.abs(p.cx)*.14)*p.dil, sy = (1 - Math.abs(p.cy)*.1)*p.dil;
    p.el.style.transform = `translate(${(p.cx*p.rx/p.d*100).toFixed(2)}%, ${(p.cy*p.ry/p.d*100).toFixed(2)}%) rotate(${p.rot}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
  }
}
requestAnimationFrame(watch);

addEventListener('pointermove', e=>{
  if(zoomP>.04 || reduce) return;
  mouseX = (e.clientX/innerWidth - .5)*2; mouseY = (e.clientY/innerHeight - .5)*2;
  requestAnimationFrame(()=>render(zoomP));
}, {passive:true});

/* ---------- THE ZOOMQUILT: an endless dive built from one painting ----------
   Copies of the painting sit inside its own black centre, each TK times smaller. TK is three of the
   painting's own ring spacings, so the rings line up across every seam. One scroll = one level. */
var heroST = null;
const PHONE = matchMedia('(max-width: 900px)').matches;      // phones get lighter images and lighter drawing
const tcv = document.getElementById('tunnelCanvas'), tctx = tcv.getContext('2d');
const tWords = [...hero.querySelectorAll('.tw')];
const TK = 3.235, TWIST = 0.14, TCENTER = { x:.5128, y:.5209 };
let tSprite = null, tT = 0, tSpin = 0, tW = 0, tH = 0, tOn = false, lastC = 1;
const voidEl = document.getElementById('void'), forest = document.getElementById('forest'),
      fSky = document.getElementById('fSky'), fFg = document.getElementById('fFg'), forestFade = document.getElementById('forestFade'),
      fcv = document.getElementById('forestCv'), fctx = fcv.getContext('2d'), philo = document.getElementById('philo'),
      skyImg = fSky.querySelector('img'), fgImg = fFg.querySelector('img');
(function(){
  const img = new Image();
  img.onload = ()=>{
    const w = 2048, h = 1152, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.filter = 'brightness(1.3) saturate(1.1)'; x.drawImage(img,0,0,w,h); x.filter = 'none';
    x.globalCompositeOperation = 'destination-in';
    x.save(); x.translate(w*TCENTER.x, h*TCENTER.y); x.scale(1, h/w);
    const g = x.createRadialGradient(0,0,0, 0,0, w*.5);
    g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.66,'rgba(0,0,0,1)'); g.addColorStop(.98,'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(-w,-w,w*2,w*2); x.restore();
    tSprite = c; sizeTunnel(); drawTunnel();
  };
  img.src = PHONE ? tcv.dataset.srcM : tcv.dataset.src;
})();
function sizeTunnel(){
  const dpr = Math.min(devicePixelRatio || 1, PHONE ? 1 : 1.25);   // the tunnel is in constant motion: 1.25x looks the same and draws a third fewer pixels
  tW = hero.clientWidth; tH = hero.clientHeight;
  tcv.width = Math.round(tW*dpr); tcv.height = Math.round(tH*dpr);
  tctx.setTransform(dpr,0,0,dpr,0,0);
}
let tMask = null;
function drawTunnel(){
  if(!tSprite || !tW || !tOn) return;
  const sw = tSprite.width, sh = tSprite.height;
  const cover = Math.max(tW/sw, tH/sh);
  const lvl = Math.floor(tT), frac = tT - lvl, z = Math.pow(TK, frac);
  tctx.fillStyle = '#050309'; tctx.fillRect(0,0,tW,tH);
  for(let j=-2; j<=(PHONE ? 3 : 5); j++){
    const s = cover * z / Math.pow(TK, j);
    if(s*sw < 6) break;
    tctx.save();
    tctx.translate(tW/2, tH/2); tctx.rotate((frac - j - lvl)*TWIST + tSpin); tctx.scale(s, s);
    tctx.drawImage(tSprite, -sw*TCENTER.x, -sh*TCENTER.y);
    tctx.restore();
  }
  const v = tctx.createRadialGradient(tW/2,tH/2, Math.min(tW,tH)*.3, tW/2,tH/2, Math.hypot(tW,tH)*.62);
  v.addColorStop(0,'rgba(5,3,9,0)'); v.addColorStop(1,'rgba(5,3,9,.35)');
  tctx.fillStyle = v; tctx.fillRect(0,0,tW,tH);
  if(tMask){
    const m = tctx.createRadialGradient(tMask.cx, tMask.cy, 0, tMask.cx, tMask.cy, tMask.R);
    m.addColorStop(0,'#000'); m.addColorStop(.8,'#000'); m.addColorStop(.93,'rgba(0,0,0,.55)'); m.addColorStop(1,'rgba(0,0,0,0)');
    tctx.globalCompositeOperation = 'destination-in'; tctx.fillStyle = m; tctx.fillRect(0,0,tW,tH); tctx.globalCompositeOperation = 'source-over';
  }
}
/* one pinned scroll, in screens (vh):
   0 to 4.62   the field, her face, hello, into her eye (the quilt shows in her pupil from 2.86)
   4.62 to 8.62 four levels of the quilt, one scroll each, one service per level
   8.62 to 9.62 dive into the black centre
   9.62 to 11.1 pull back out of the black sun into the forest, then rest there */
const PIN = 9.4, P_HERO = 4.62, P_QUILT0 = 2.86, P_LEVELS = 5.62, P_DIVE = 6.62, P_OUT = 8.1;   // one quilt level
const LV0 = 1;                 // quilt level reached as the pupil fills the screen
function quiltT(v){
  if(v < P_QUILT0) return 0;
  if(v < P_HERO) return (v-P_QUILT0)/(P_HERO-P_QUILT0)*LV0;
  if(v < P_LEVELS) return LV0 + (v-P_HERO);
  return LV0 + 1 + (v-P_LEVELS)*1.4;
}
let fMx = 0, fMy = 0, fS = 1, fOn = false, heroVis = true;
// the forest animates only while the hero is on screen; further down the page it rests (and picks up again on the way back)
new IntersectionObserver(es=> es.forEach(en=> heroVis = en.isIntersecting)).observe(document.getElementById('hero'));
function master(g){
  zoomG = g;
  const v = g*PIN;
  scrollTo(Math.min(1, v/P_HERO));
  const C = lastC, R = .42*eye.r*C*.96, cx = eye.vx + pan, cy = eye.vy;
  const diag = Math.hypot(Math.max(cx, tW-cx), Math.max(cy, tH-cy));
  const show = clamp((R-14)/30, 0, 1);
  tT = quiltT(v);
  const mk = R < diag ? `radial-gradient(circle ${R.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, #000 ${(R*.8).toFixed(1)}px, rgba(0,0,0,.55) ${(R*.93).toFixed(1)}px, transparent ${R.toFixed(1)}px)` : 'none';
  tMask = R < diag ? {R, cx, cy} : null;                       // the pupil cut-out is drawn inside the canvas (a CSS mask re-made every frame is costly)
  if(tcv.style.maskImage){ tcv.style.webkitMaskImage = ''; tcv.style.maskImage = ''; }
  layers.l2.style.visibility = R < diag*1.02 ? 'visible' : 'hidden';
  // four levels: each service sits in the pill for its own scroll
  tWords.forEach((el,i)=>{
    const d = tT - (LV0 + .5 + i);
    const op = smooth(clamp((d + .5)/.22,0,1)) * (1 - smooth(clamp((d - .3)/.2,0,1)));
    el.style.opacity = op.toFixed(3);
    el.style.visibility = op > .002 ? 'visible' : 'hidden';
    el.style.transform = `translate(-50%,-50%) scale(${(1 + d*.12).toFixed(4)})`;
  });
  // the dive: black opens from the centre until it fills the screen
  const dv = clamp((v - P_LEVELS)/(P_DIVE - P_LEVELS), 0, 1);
  const half = Math.hypot(tW, tH)/2;
  voidEl.style.opacity = dv > 0 ? 1 : 0;
  voidEl.style.setProperty('--r', (Math.pow(dv,1.6)*half*1.05).toFixed(1)+'px');
  // the pull-back out of the black sun
  const ov = clamp((v - P_DIVE)/(P_OUT - P_DIVE), 0, 1);
  fOn = v >= P_DIVE;
  forest.style.opacity = fOn ? 1 : 0;
  forestFade.style.opacity = 0;                                  // the forest cuts straight into the work grid
  tOn = show > 0 && !(v > P_DIVE + .05);
  tcv.style.opacity = tOn ? show.toFixed(3) : 0;
  if(fOn){
    // start with the sun covering the screen, end at rest
    const swp = forest.offsetWidth, shp = forest.offsetHeight;
    const sunX = (tW - swp)/2 + swp*.4876, sunY = (tH - shp)/2 + shp*.2202;
    const far = Math.hypot(Math.max(sunX, tW-sunX), Math.max(sunY, tH-sunY));
    const S0 = Math.max(1, far*2.2/(swp*.0642));
    fS = Math.exp(Math.log(S0)*Math.pow(1 - ov, 2.6));   // fast out of the sun, then a long, soft glide to rest
  }
  const moving = fOn && fS > 1.001;
  // one renderer for the whole scene, pull-back and rest alike, so nothing changes hands mid-motion
  fcv.style.display = fOn ? 'block' : 'none';
  if(!fOn && insight.classList.contains('on')){ insight.classList.remove('on'); closeInsight(); iShow = false; }
  forest.style.visibility = 'hidden';
  if(fOn) drawForest();
  const ph = moving ? 0 : smooth(clamp((v - P_OUT)/.4, 0, 1));          // the words wait until the forest has settled
  philo.style.opacity = ph.toFixed(3);
  philo.style.transform = `translateY(${((1-ph)*24).toFixed(1)}px)`;
  drawTunnel();
}
function drawForest(){
  // measured fresh every frame: after a resize or full screen the pinned hero takes a moment to settle
  const dpr = Math.min(devicePixelRatio || 1, PHONE ? 1.25 : 1.5), W = hero.clientWidth || tW, H = hero.clientHeight || tH;
  if(fcv.width !== Math.round(W*dpr) || fcv.height !== Math.round(H*dpr)){ fcv.width = Math.round(W*dpr); fcv.height = Math.round(H*dpr); }
  // the scene is drawn mirrored left to right
  fctx.setTransform(-dpr,0,0,dpr,W*dpr,0);
  fctx.fillStyle = '#050309'; fctx.fillRect(0,0,W,H);
  const hr = hero.getBoundingClientRect(), b = forest.getBoundingClientRect();
  // the painting keeps its 16:9 shape and covers the screen (centred on the element, which phones shift sideways)
  const bw = Math.max(W, H*16/9), bh = bw*9/16, bcx = b.left - hr.left + b.width/2;
  const bx = bcx - bw/2, by = (H - bh)/2;
  const ox = bx + bw*.4876, oy = by + bh*.2202;
  // mouse sway eases in as the pull-back finishes, instead of switching on
  const sway = smooth(clamp((1.25 - fS)/.25, 0, 1));
  const mxs = -fMxS;                              // mirrored, so the sway still follows the mouse on screen
  const skyDx = mxs*.006*W*sway, skyDy = fMyS*.004*H*sway, fgDx = mxs*.02*W*sway, fgDy = fMyS*.01*H*sway;
  [[(typeof glReady !== 'undefined' && glReady) ? skyGL : skyImg, fS, skyDx, skyDy], [fgImg, Math.pow(fS,1.3), fgDx, fgDy]].forEach(([img, s, dx, dy])=>{
    if(img.tagName === 'IMG' && (!img.complete || !img.naturalWidth)) return;
    fctx.drawImage(img, ox - (ox-bx)*s + dx, oy - (oy-by)*s + dy, bw*s, bh*s);
  });
  // the tree pupils move with the trees
  const s2 = Math.pow(fS,1.3), x0 = ox - (ox-bx)*s2 + fgDx, y0 = oy - (oy-by)*s2 + fgDy, kx = bw*s2/4000, ky = bh*s2/2251;
  fgGeo = { x0: x0 + hr.left, y0: y0 + hr.top, kx, ky, hl: hr.left, W };
  // keep the Insight hover area on the eyeball man and the cube
  const settled = fS < 1.03;
  insight.classList.toggle('on', settled);
  if(!settled && insight.classList.contains('open')) closeInsight();
  insight.style.left = (W - (x0 + 2600*kx)).toFixed(1)+'px'; insight.style.top = (y0 + 1305*ky).toFixed(1)+'px';
  insight.style.width = (360*kx).toFixed(1)+'px'; insight.style.height = (620*ky).toFixed(1)+'px'; insight.style.setProperty('--room', Math.max(120, W - (W - (x0 + 2600*kx)) - 360*kx - 22).toFixed(0)+'px');
  insightBtn.style.left = insightBox.style.left = ((2600-2408)/360*100).toFixed(2)+'%';
  // pupils are drawn on their own layer and trimmed by the painted sockets, so they slide under the bark edge
  if(eyeCv.width !== fcv.width || eyeCv.height !== fcv.height){ eyeCv.width = fcv.width; eyeCv.height = fcv.height; }
  ectx.setTransform(1,0,0,1,0,0); ectx.globalCompositeOperation = 'source-over'; ectx.clearRect(0,0,eyeCv.width,eyeCv.height);
  ectx.setTransform(-dpr,0,0,dpr,W*dpr,0); ectx.fillStyle = '#040708';
  for(const p of fPupils){
    const r = p.d/2*kx, px = x0 + (p.x + p.cx*p.rx)*kx, py = y0 + (p.y + p.cy*p.ry)*ky;
    if(px < -r || py < -r || px > W + r || py > H + r) continue;
    ectx.beginPath(); ectx.ellipse(px, py, r*(1-Math.abs(p.cx)*.1), r*(1-Math.abs(p.cy)*.08), 0, 0, Math.PI*2); ectx.fill();
  }
  if(fMaskImg.complete && fMaskImg.naturalWidth){
    ectx.globalCompositeOperation = 'destination-in';
    ectx.drawImage(fMaskImg, x0, y0, bw*s2, bh*s2);
  }
  fctx.setTransform(1,0,0,1,0,0); fctx.drawImage(eyeCv, 0, 0);
}
const eyeCv = document.createElement('canvas'), ectx = eyeCv.getContext('2d');
const fMaskImg = new Image(); fMaskImg.src = forest.dataset.mask;
let fMxS = 0, fMyS = 0, fgGeo = null;
const insight = document.getElementById('insight'), insightBtn = document.getElementById('insightBtn'),
      insightBox = document.getElementById('insightBox'), insightX = document.getElementById('insightX');
if(matchMedia('(hover: none)').matches) insight.classList.add('touch');
function openInsight(){ insight.classList.add('open'); insightBox.hidden = false; insightBtn.setAttribute('aria-expanded','true'); }
function closeInsight(){ insight.classList.remove('open'); insightBox.hidden = true; insightBtn.setAttribute('aria-expanded','false'); }
insightBtn.addEventListener('click', e=>{ e.stopPropagation(); insight.classList.contains('open') ? closeInsight() : openInsight(); });
// the pill as the cursor: it trails the mouse over the pair, and a click anywhere there opens the note
const iCur = document.createElement('div'); iCur.className = 'insight-cursor'; iCur.setAttribute('aria-hidden','true'); iCur.textContent = 'Insight';
document.body.appendChild(iCur);
let iTx = 0, iTy = 0, iX = 0, iY = 0, iShow = false, iScale = .6;
function overBox(t){ return insightBox.contains(t); }
insight.addEventListener('pointerenter', e=>{ if(e.pointerType === 'touch') return; iX = iTx = e.clientX; iY = iTy = e.clientY; });
insight.addEventListener('pointermove', e=>{
  if(e.pointerType === 'touch') return;
  iTx = e.clientX; iTy = e.clientY; iShow = !overBox(e.target);
});
insight.addEventListener('pointerleave', ()=>{ iShow = false; });
insight.addEventListener('pointerdown', e=>{ if(!overBox(e.target)) iCur.classList.add('down'); });
addEventListener('pointerup', ()=> iCur.classList.remove('down'));
insight.addEventListener('click', e=>{
  if(overBox(e.target) || e.target === insightBtn) return;
  e.stopPropagation();
  insight.classList.contains('open') ? closeInsight() : openInsight();
});
(function followCursor(){
  requestAnimationFrame(followCursor);
  const on = iShow && insight.classList.contains('on');
  iX += (iTx - iX)*.35; iY += (iTy - iY)*.35;
  iScale += ((on ? 1 : .6) - iScale)*.25;
  iCur.classList.toggle('show', on);
  iCur.style.transform = `translate(${iX.toFixed(1)}px, ${iY.toFixed(1)}px) translate(-50%,-50%) scale(${iScale.toFixed(3)})`;
})();
insightX.addEventListener('click', e=>{ e.stopPropagation(); closeInsight(); insightBtn.focus(); });
insightBox.addEventListener('click', e=> e.stopPropagation());
addEventListener('click', ()=>{ if(insight.classList.contains('open')) closeInsight(); });
addEventListener('keydown', e=>{ if(e.key === 'Escape' && insight.classList.contains('open')){ closeInsight(); insightBtn.focus(); } });
/* the trees watch you too */
const fPupils = [...forest.querySelectorAll('.fpupil')].map((el,i)=>({el, x:+el.dataset.x, y:+el.dataset.y, d:+el.dataset.d, rx:+el.dataset.rx, ry:+el.dataset.ry,
  cx:0, cy:0, lag:.06 + ((i*41)%8)/100}));
(function treeWatch(t){
  requestAnimationFrame(treeWatch);
  if(!fOn || !heroVis || document.hidden) return;
  if(!fgGeo) return;
  const G = fgGeo;
  let tx = gx, ty = gy;
  if(!reduce && (!hadPointer || t - lastMove > 4000)){ tx = innerWidth*(.5 + .4*Math.sin(t/2300)); ty = innerHeight*(.45 + .25*Math.sin(t/1700 + .7)); }
  for(const p of fPupils){
    const ex = 2*G.hl + G.W - (G.x0 + p.x*G.kx), ey = G.y0 + p.y*G.ky;   // where the mirrored eye sits on screen
    const dx = tx-ex, dy = ty-ey, d = Math.hypot(dx,dy) || 1, reach = Math.min(1, d/(innerWidth*.25));
    const ax = -dx/d*reach, ay = dy/d*reach, err = Math.hypot(ax-p.cx, ay-p.cy), k = p.lag + Math.min(.3, err*.35);
    p.cx += (ax-p.cx)*k; p.cy += (ay-p.cy)*k;
    p.el.style.transform = `translate(${(p.cx*p.rx/p.d*100).toFixed(2)}%, ${(p.cy*p.ry/p.d*100).toFixed(2)}%) scale(${(1-Math.abs(p.cx)*.1).toFixed(3)}, ${(1-Math.abs(p.cy)*.08).toFixed(3)})`;
  }
})(0);
addEventListener('pointermove', e=>{
  if(!fOn || reduce) return;
  fMx = (e.clientX/innerWidth - .5)*2; fMy = (e.clientY/innerHeight - .5)*2;
}, {passive:true});
addEventListener('resize', ()=>{ sizeTunnel(); drawTunnel(); });
(function spin(t){ requestAnimationFrame(spin);
  if(reduce || !tOn || document.hidden) return;
  tSpin = t/1000*.035; drawTunnel(); })(0);


// the philosophy scene lives inside the pinned stretch, so its menu link jumps to that scroll point
document.getElementById('navPhilo')?.addEventListener('click', e=>{
  e.preventDefault();
  const t = (P_OUT + .6)/PIN;
  window.scrollTo({top: heroST ? heroST.start + t*(heroST.end - heroST.start) : hero.getBoundingClientRect().top + scrollY + innerHeight*(P_OUT + .6), behavior:'auto'});
});

/* ---------- the philosophy sky: the spiral turns around the black sun ----------
   A flow-map swirl: two copies of the sky, each rotated around the sun by an angle that is large
   near the centre and fades to nothing by the edges, run half a cycle apart and cross-fade, so the
   brushwork keeps flowing inward forever without ever smearing further. */
const skyGL = document.getElementById('skyGL');
let gl = null, glProg = null, glU = {}, glReady = false, swirlT = 0, swirlLast = 0;
function initSkyGL(){
  try{
    if(PHONE){ skyGL.width = 1600; skyGL.height = 900; } else { skyGL.width = 2048; skyGL.height = 1152; }   // the swirling sky is soft: 2048 wide is plenty
    gl = skyGL.getContext('webgl', {premultipliedAlpha:false, preserveDrawingBuffer:true, antialias:false});
    if(!gl || !skyImg.naturalWidth) return;
    const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`;
    const fs = `precision highp float; varying vec2 uv; uniform sampler2D tex; uniform float t; uniform vec2 sun; uniform float asp;
      vec2 swirl(vec2 q, float a){
        vec2 d = q - sun; d.x *= asp; float r = length(d);
        float k = a / (1. + pow(r/.09, 1.7)) * smoothstep(1.05, .35, r);   // strong near the sun, still at the edges
        float c = cos(k), s = sin(k); d = vec2(c*d.x - s*d.y, s*d.x + c*d.y); d.x /= asp; return sun + d; }
      void main(){
        float p1 = fract(t), p2 = fract(t + .5);
        float w = abs(1. - 2.*p1);                       // weight of the second copy
        vec4 a = texture2D(tex, swirl(uv, (p1 - .5) * -1.1));
        vec4 b = texture2D(tex, swirl(uv, (p2 - .5) * -1.1));
        gl_FragColor = mix(a, b, w); }`;
    const sh = (type, src)=>{ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; };
    glProg = gl.createProgram(); gl.attachShader(glProg, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(glProg, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(glProg);
    if(!gl.getProgramParameter(glProg, gl.LINK_STATUS)) throw 'link';
    gl.useProgram(glProg);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(glProg, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyImg);
    ['t','sun','asp','tex'].forEach(n=> glU[n] = gl.getUniformLocation(glProg, n));
    gl.uniform2f(glU.sun, .4876, .2202); gl.uniform1f(glU.asp, 4000/2251); gl.uniform1i(glU.tex, 0);
    gl.viewport(0, 0, skyGL.width, skyGL.height);
    glReady = true; renderSky(); forest.classList.add('gl');
  }catch(err){ glReady = false; }
}
function renderSky(){
  if(!glReady) return;
  gl.uniform1f(glU.t, swirlT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
if(skyImg.complete && skyImg.naturalWidth) initSkyGL(); else skyImg.addEventListener('load', initSkyGL);
(function swirl(now){
  requestAnimationFrame(swirl);
  const dt = Math.min(.05, (now - (swirlLast || now))/1000); swirlLast = now;
  if(!fOn || !heroVis || document.hidden) return;
  if(glReady && !reduce){ swirlT += dt/7; renderSky(); }   // one flow cycle every seven seconds
  fMxS += (fMx - fMxS)*.08; fMyS += (fMy - fMyS)*.08;      // the sway follows the mouse gently
  drawForest();                                             // every frame: swirl, sway and watching eyes together
})(0);

if(girl.complete) measure(); else girl.addEventListener('load', measure);
addEventListener('resize', ()=>{ sizeTunnel(); measure(); });
if(document.fonts) document.fonts.ready.then(measure);

/* ---------- WORK: a row of portrait cards ----------
   Each card carries a slot name (e.g. branding-03) so real work can be dropped in later.
   Hover scrambles the caption and rolls the info text in the corner; switching category
   folds the cards away and reveals the new set one by one. */
const gridSec = document.getElementById('grid'), gtrack = document.getElementById('gtrack'), gpanel = document.getElementById('gpanel');
const ginfo = document.getElementById('ginfo'), gcount = document.getElementById('gcount');
const gtabs = [...gridSec.querySelectorAll('[role="tab"]')];
const GCOUNT = { featured:10, branding:7, packaging:6, game:1, illustrations:8, photography:8 };
const GLABEL = { featured:'Featured', branding:'Branding', packaging:'Packaging', game:'Game design', illustrations:'Illustrations', photography:'Photography' };
const TONES = ['10%','14%','8%','18%','12%','55%','11%','16%','85%','9%'];
let gCat = 'featured', gSeen = false;

function rollTo(lines){                       // the label simply shows the current category, no roll
  ginfo.innerHTML = '<div class="ri">' + lines.map(l=>`<span>${l}</span>`).join('') + '</div>';
}
const SCR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+';
function scramble(el){
  const text = el.dataset.text; if(reduce){ el.textContent = text; return; }
  const t0 = performance.now(), dur = 420; cancelAnimationFrame(el._raf);
  (function step(now){
    const p = Math.min(1, (now - t0)/dur), keep = Math.floor(p*text.length);
    el.textContent = text.split('').map((ch,i)=> i < keep || ch === ' ' ? ch : SCR[(Math.random()*SCR.length)|0]).join('');
    if(p < 1) el._raf = requestAnimationFrame(step);
  })(t0);
}
function idleInfo(){ rollTo([GLABEL[gCat], 'Selected work']); }
/* finished projects that fill a slot: slot name -> page, caption and cover */
const POPPIN = { name:"Popp'in", href:'poppin/',
                 img:'assets/img/work-poppin.webp', w:820, h:1052,            // wheel view (portrait)
                 wide:'assets/img/work-poppin-wide.webp', ww:1400, wh:960,     // grid view (landscape)
                 alt:"Popp'in logo with Poppy, the popcorn mascot in sunglasses, on navy" };
const KARNAN = { name:'Karnan', href:'karnan/',
                 img:'assets/img/work-karnan.webp', w:820, h:1052,            // wheel view (portrait)
                 wide:'assets/img/work-karnan-wide.webp', ww:1400, wh:960,     // grid view (landscape)
                 alt:'Karnan final poster: the hero stands with a sword on a blade-shaped road between two armed crowds beneath a red sun' };
const WHISPERS = { name:'Whispers of Labyrinth', href:'whispers/',
                 img:'assets/img/work-whispers.webp', w:820, h:1052,
                 wide:'assets/img/work-whispers-wide.webp', ww:1400, wh:960,
                 alt:'Whispers of Labyrinth cover art: six hooded archetypes around the Minotaur holding a glowing maze, beneath the game logo' }

const TILLY = { name:'Tilly', href:'tilly/',
                 img:'assets/img/work-tilly.webp', w:820, h:1052,             // wheel view (portrait)
                 wide:'assets/img/work-tilly-wide.webp', ww:1400, wh:960,      // grid view (landscape)
                 alt:'Tilly experiential toy store: the Tilly wordmark among colourful pattern creatures, with Willy the panda mascot peeking up' };

const RUINS = { name:'Beautiful Ruins', href:'ruins/',
                 img:'assets/img/work-ruins.v4.webp', w:820, h:1052,             // wheel view (portrait)
                 wide:'assets/img/work-ruins-wide.v4.webp', ww:1400, wh:960,      // grid view (landscape)
                 alt:'Beautiful Ruins: a queen walks up ruined steps toward a glowing golden doorway through red smoke and prism light, with the Beautiful Ruins logo below' };

const BLACKHOLE = { name:'Black Hole', href:'blackhole/',
                 img:'assets/img/work-blackhole.v2.webp', w:820, h:1052,          // wheel view (portrait)
                 wide:'assets/img/work-blackhole-wide.v2.webp', ww:1400, wh:960,   // grid view (landscape)
                 alt:'Black Hole: a white swirling black hole cropped close, with the title BLACK HOLE stacked above it, red call-outs for the event horizon and accretion disk, and the tagline The Space Donut With No Exit' };

const ALONE = { name:'Alone', href:'alone/',
                 img:'assets/img/work-alone.webp', w:820, h:1052,             // wheel view (portrait)
                 wide:'assets/img/work-alone-wide.webp', ww:1400, wh:960,      // grid view (landscape)
                 alt:'Alone: a wicker lamp-figure sits on a deep blue sofa, its yellow shade glowing against a red tiled wall ringed by dark drifting forms' };

const PENCIL = { name:'Pencil Illustration', href:'pencil/',
                 img:'assets/img/work-pencil.webp', w:820, h:1052,
                 wide:'assets/img/work-pencil-wide.webp', ww:1400, wh:960,
                 alt:'Pencil illustrations: a chrome tap, a paint tube and a bald eagle drawn in graphite' };

const PAINTINGS = { name:'Paintings', href:'paintings/',
                 img:'assets/img/work-paintings.webp', w:820, h:1052,
                 wide:'assets/img/work-paintings-wide.webp', ww:1400, wh:960,
                 alt:'Paintings: acrylic sunflowers in a blue and gold vase, a still life of a clay jug, green pot and fruit, and a Kerala mural style Krishna and Radha' };

const EGGSTA = { name:'Eggsta', href:'eggsta/',
                 img:'assets/img/work-eggsta.webp', w:820, h:1052,             // wheel view (portrait)
                 wide:'assets/img/work-eggsta-wide.webp', ww:1400, wh:960,      // grid view (landscape)
                 alt:'Eggsta: a kraft egg carton printed with red blobs, the Eggsta wordmark and its egg mascot, with a red hen-comb handle, on a sunlit kitchen counter' };

const CHUMMA = { name:'Chumma Chew', href:'chumma/',
                 img:'assets/img/work-chumma.webp', w:820, h:1052,             // wheel view (portrait)
                 wide:'assets/img/work-chumma-wide.webp', ww:1400, wh:960,      // grid view (landscape)
                 alt:'Chumma Chew: a red, desi-maximalist strawberry gum pack standing on a green table among snacks, cassettes and sunglasses while friends scroll their phones' };

const LIVE = { 'featured-04': CHUMMA, 'packaging-01': CHUMMA, 'illustrations-01': KARNAN, 'illustrations-02': ALONE, 'illustrations-03': PENCIL, 'illustrations-04': PAINTINGS, 'featured-01': WHISPERS, 'featured-02': POPPIN, 'featured-03': KARNAN, 'featured-05': EGGSTA, 'featured-07': BLACKHOLE, 'packaging-02': EGGSTA, 'branding-02': POPPIN, 'branding-03': TILLY, 'branding-04': RUINS, 'packaging-04': POPPIN, 'game-01': WHISPERS };
function buildGrid(cat){
  let html = '';
  for(let i=1; i<=GCOUNT[cat]; i++){
    const id = String(i).padStart(2,'0'), slot = `${cat}-${id}`, live = LIVE[slot];
    const name = live ? live.name : `${GLABEL[cat]} ${id}`;
    const cover = live ? `<img class="cv-tall" src="${live.img}" alt="${live.alt}" width="${live.w}" height="${live.h}" loading="lazy" decoding="async">`
      + (live.wide ? `<img class="cv-wide" src="${live.wide}" alt="" width="${live.ww}" height="${live.wh}" loading="lazy" decoding="async">` : '') : '';
    html += `<figure class="gcard${live ? ' live' : ''}" tabindex="0" data-slot="${slot}"${live ? ` data-href="${live.href}" role="link"` : ''} aria-label="${live ? name + ', open case study' : name + ', empty slot'}">
      <figcaption class="gcap"><span class="scr" data-text="${name.toUpperCase()}">${name.toUpperCase()}</span></figcaption>
      <div class="gimg"><div class="gfill" style="--tone:${TONES[(i-1) % TONES.length]}">${cover}</div><span class="gnum">${id}</span></div></figure>`;
  }
  gtrack.innerHTML = html;
  gtrack.style.margin = GCOUNT[cat] === 1 ? '0 auto' : '';   // a lone card sits in the middle of the row
  gcount.textContent = `${String(GCOUNT[cat]).padStart(2,'0')} project${GCOUNT[cat] === 1 ? '' : 's'}`;
  gtrack.querySelectorAll('.gcard').forEach(card=>{
    const cap = card.querySelector('.scr');
    const enter = ()=>{};                        // hovering a card no longer changes the label
    card.addEventListener('pointerenter', enter); card.addEventListener('focus', enter);
    card.addEventListener('pointerleave', idleInfo); card.addEventListener('blur', idleInfo);
  });
}
function revealCards(){
  const cards = [...gtrack.querySelectorAll('.gcard')];
  cards.forEach((c,i)=>{ c.style.transitionDelay = ''; c.querySelector('.gimg').style.transitionDelay = (i*70)+'ms';
    c.querySelector('.gcap').style.transitionDelay = (120 + i*70)+'ms'; c.querySelector('.gfill').style.transitionDelay = (i*70)+'ms'; });
  requestAnimationFrame(()=> requestAnimationFrame(()=> cards.forEach(c=> c.classList.add('in'))));
}
let gridST = null;
function selectTab(btn, focus){
  gtabs.forEach(b=>{ const on = b === btn; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  gpanel.setAttribute('aria-labelledby', btn.id);
  if(focus) btn.focus();
  gCat = btn.dataset.cat; idleInfo();
  // fold the current cards away, quickly and all together
  gtrack.querySelectorAll('.gcard').forEach(c=>{ ['.gimg','.gcap','.gfill'].forEach(s=> c.querySelector(s).style.transitionDelay = '0ms'); c.classList.remove('in'); });
  setTimeout(()=>{
    buildGrid(gCat);
    gpanel.scrollLeft = 0;
    if(gridST && scrollY > gridST.start) window.scrollTo({top: gridST.start, behavior:'auto'});
    if(window.ScrollTrigger) ScrollTrigger.refresh();
    revealCards();
  }, reduce ? 0 : 650);
}
gtabs.forEach((b,i)=>{
  b.addEventListener('click', ()=>{ if(b.getAttribute('aria-selected') !== 'true') selectTab(b); });
  b.addEventListener('keydown', e=>{
    const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if(!k) return;
    e.preventDefault(); selectTab(gtabs[(i + k + gtabs.length) % gtabs.length], true);
  });
});
buildGrid('featured'); idleInfo();
// the first time the section comes into view, the cards rise in one after another
new IntersectionObserver((es, ob)=>{ if(es.some(e=>e.isIntersecting)){ revealCards(); ob.disconnect(); } }, {threshold:.35}).observe(gridSec);

/* the cards ride an arch as the row slides: highest in the middle of the screen, dipping and tilting
   toward the edges, following the same curve as the arched top of the next page */
(function(){
  const cards = ()=> gtrack.querySelectorAll('.gcard');
  let on = false;
  // the cards ride the same ellipse as the arched top of the About page below: they dip with it toward the
  // edges and tilt to follow its slope, like cards on a turning wheel
  function curve(){
    const W = innerWidth, H = innerHeight, phone = W <= 760;
    const A = H*(phone ? .08 : .46), rx = W*(phone ? 1.6 : .56);   // phones: a gentle curve, cards are nearly screen-wide
    const left = gtrack.getBoundingClientRect().left, list = cards(), w = list[0] ? list[0].offsetWidth : 0;
    if(!curve.pad || curve.W !== W){ curve.pad = parseFloat(getComputedStyle(gtrack).paddingLeft) || 8; curve.W = W; }
    const pad = curve.pad;
    if(gridSec.classList.contains('gridmode') || list.length === 1){ list.forEach(c=>{ c.style.setProperty('--cy','0px'); c.style.setProperty('--cr','0deg'); }); return; }
    const budget = parseFloat(getComputedStyle(gpanel).paddingBottom) - 6;
    list.forEach((c, i)=>{
      const cx = left + pad + i*(w + 8) + w/2, x = cx - W/2, u = Math.max(-.985, Math.min(.985, x/rx));
      const root = Math.sqrt(1 - u*u);
      let dy = A*(1 - root), slope = A*u/(rx*root);
      const beyond = Math.abs(x) - .985*rx;                 // past the ellipse's side: keep falling away along its last slope
      if(beyond > 0) dy += beyond*Math.abs(slope);
      const lim = phone ? 12 : 42, ang = Math.max(-lim, Math.min(lim, Math.atan(slope)*180/Math.PI));
      dy = Math.min(dy, Math.max(0, budget - (w/2)*Math.abs(Math.sin(ang*Math.PI/180))));   // stays inside the section
      c.style.setProperty('--cy', dy.toFixed(1) + 'px');
      c.style.setProperty('--cr', ang.toFixed(2) + 'deg');
    });
  }
  addEventListener('resize', ()=>{ curve.pad = 0; });
  new IntersectionObserver(es=> es.forEach(en=> on = en.isIntersecting)).observe(gridSec);
  (function loop(){ requestAnimationFrame(loop); if(on) curve(); })();
})();

/* Wheel / Grid toggle */
(function(){
  const btns = [...gridSec.querySelectorAll('.gview button')];
  btns.forEach(b=> b.addEventListener('click', ()=>{
    const v = b.dataset.view, grid = v === 'grid';
    if(gridSec.classList.contains('gridmode') === grid) return;
    btns.forEach(x=> x.setAttribute('aria-pressed', String(x === b)));
    gridSec.classList.toggle('gridmode', grid);
    if(window.__gridPin) window.__gridPin(!grid);
    window.scrollTo({top: gridSec.getBoundingClientRect().top + scrollY, behavior:'auto'});
  }));
})();


/* ---------- HELLO: a pile of eyeballs, thrown in and left to bounce ----------
   Matter.js does the physics. The floor follows the page's curved bottom edge, so the pile
   settles into the bowl. The cursor nudges eyeballs it passes through; grab one to throw it. */
(function(){
  const sec = document.getElementById('hello'), cv = document.getElementById('helloBalls');
  if(!sec || !cv || !window.Matter) return;
  const { Engine, Bodies, Body, Composite, Query, Vector } = Matter;
  const ctx = cv.getContext('2d'), img = new Image(); img.src = cv.dataset.src;
  const engine = Engine.create({ gravity:{ x:0, y:1 } });
  // they pile up on the left (on phones, in the bottom-left corner below the text)
  function setGravity(){ const ph = innerWidth <= 760; engine.gravity.x = ph ? -.55 : -1.1; engine.gravity.y = ph ? 1 : .32; }
  setGravity();
  let W = 0, H = 0, dpr = 1, statics = [], ceil = [], balls = [], thrown = false, visible = false, r = 40, arcNow = -1;
  function arcTop(){ const v = getComputedStyle(sec).borderTopLeftRadius.split(' '); return parseFloat(v[1] || v[0]) || 0; }
  // the ceiling: short segments following the arched top edge, rebuilt whenever the arch eases flatter
  function ceilY(x){ const a = arcNow > 0 ? arcNow : arcTop(), u = Math.min(1, Math.abs(2*x/W - 1)); return a*(1 - Math.sqrt(1 - u*u)); }
  function buildCeil(){
    const a = arcTop(); if(Math.abs(a - arcNow) < 3 && ceil.length) return; arcNow = a;
    Composite.remove(engine.world, ceil); ceil = [];
    const N = 72, top = x=>{ const u = Math.min(1, Math.abs(2*x/W - 1)); return a*(1 - Math.sqrt(1 - u*u)); };
    for(let i=0; i<N; i++){
      const x1 = W*i/N, x2 = W*(i+1)/N, y1 = top(x1), y2 = top(x2);
      const len = Math.hypot(x2-x1, y2-y1), ang = Math.atan2(y2-y1, x2-x1);
      ceil.push(Bodies.rectangle((x1+x2)/2 - Math.sin(ang)*20, (y1+y2)/2 - 20*Math.cos(ang), len + 6, 40, { isStatic:true, friction:.6, restitution:.3, angle:ang }));
    }
    Composite.add(engine.world, ceil);
  }
  function floorY(x){ return H; }                  // the bottom is a straight edge now
  function build(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = sec.clientWidth; H = sec.clientHeight;
    cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    r = W < 700 ? W*0.044 : Math.max(22, Math.min(48, W*0.028));   // smaller on phones, so more fit
    Composite.remove(engine.world, statics); statics = [];
    const opt = { isStatic:true, friction:.6, restitution:.3 };
    // the floor: short segments laid along the curved bottom edge
    const N = 72;
    for(let i=0; i<N; i++){
      const x1 = W*i/N, x2 = W*(i+1)/N, y1 = floorY(x1), y2 = floorY(x2);
      const len = Math.hypot(x2-x1, y2-y1), ang = Math.atan2(y2-y1, x2-x1);
      statics.push(Bodies.rectangle((x1+x2)/2 + Math.sin(ang)*20, (y1+y2)/2 + 20*Math.cos(ang), len + 6, 40, { ...opt, angle:ang }));
    }
    statics.push(Bodies.rectangle(-30, H/2, 60, H*3, opt), Bodies.rectangle(W+30, H/2, 60, H*3, opt));
    Composite.add(engine.world, statics); arcNow = -1; buildCeil();
    balls.forEach(b=>{ if(b.position.y > H || b.position.y < 0 || b.position.x < 0 || b.position.x > W) Body.setPosition(b, { x:W/2, y:H*.3 }); });
  }
  function throwIn(){
    if(thrown) return; thrown = true;
    const count = W < 700 ? (W < 360 ? 30 : 36) : 64;
    for(let i=0; i<count; i++){
      setTimeout(()=>{
        const side = 0;                           // flung out of the left corner, arcing right, then falling back left
        const x = r*1.4 + Math.random()*W*.04;
        const y0 = H*(.3 + Math.random()*.3);
        const y = Math.max(y0, ceilY(x) + r*1.6);        // always inside the arched top
        const s = r*(.85 + Math.random()*.3);
        const b = Bodies.circle(x, y, s, { restitution:.55, friction:.08, frictionAir:.006, density:.0016 });
        b.rr = s;
        Body.setVelocity(b, { x:14 + Math.random()*14, y:-6 - Math.random()*8 });
        Body.setAngularVelocity(b, (Math.random()-.5)*.4);
        Body.setAngle(b, Math.random()*Math.PI*2);
        balls.push(b); Composite.add(engine.world, b);
      }, reduce ? 0 : i*(count > 40 ? 32 : 60));   // a faster stream when there are many
    }
    if(reduce){ setTimeout(()=>{ for(let k=0; k<900; k++) Engine.update(engine, 1000/60); draw(); }, 50); }
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    if(!img.complete) return;
    for(const b of balls){
      const s = b.rr;
      // a soft contact shadow, then the eyeball itself
      ctx.save(); ctx.translate(b.position.x, b.position.y);
      ctx.fillStyle = 'rgba(30,6,12,.28)'; ctx.beginPath(); ctx.ellipse(s*.12, s*.18, s*1.0, s*1.0, 0, 0, Math.PI*2); ctx.fill();
      ctx.rotate(b.angle); ctx.drawImage(img, -s, -s, s*2, s*2);
      ctx.restore();
    }
  }
  // pointer: nudge eyeballs it passes through; grab one to throw it
  let acc = 0, lastStep = 0, frameN = 0;
  addEventListener('resize', setGravity);
  let grab = null, last = null, lastT = 0, vel = { x:0, y:0 }, pt = null;
  const local = e => { const b = sec.getBoundingClientRect(); return { x:e.clientX - b.left, y:e.clientY - b.top }; };
  sec.addEventListener('pointermove', e=>{
    const p = local(e), now = performance.now();
    if(last){ const dt = Math.max(1, now - lastT); vel = { x:(p.x-last.x)/dt*16, y:(p.y-last.y)/dt*16 }; }
    last = p; lastT = now; pt = p;
    if(grab) return;
    const hit = Query.point(balls, p)[0];
    sec.classList.toggle('over-ball', !!hit && e.pointerType !== 'touch');
    const showTip = !!hit && e.pointerType !== 'touch' && !grab;
    tossTip.classList.toggle('show', showTip);
    if(showTip) tossTip.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 14}px)`;
    if(e.pointerType !== 'touch' && !reduce){
      for(const b of balls){
        const d = Vector.sub(b.position, p), dist = Vector.magnitude(d), reach = b.rr*1.6;
        if(dist < reach && dist > 0.1){ const k = (1 - dist/reach)*0.0025*b.mass; Body.applyForce(b, b.position, Vector.mult(Vector.normalise(d), k)); }
      }
    }
  }, {passive:true});
  const tossTip = document.createElement('div'); tossTip.className = 'toss-cursor'; tossTip.setAttribute('aria-hidden','true'); tossTip.textContent = 'Grab and Toss'; document.body.appendChild(tossTip);
  sec.addEventListener('pointerleave', ()=>{ pt = null; sec.classList.remove('over-ball'); tossTip.classList.remove('show'); });
  sec.addEventListener('pointerdown', e=>{
    if(reduce || e.pointerType === 'touch') return;          // on phones a touch always scrolls the page
    const p = local(e), hit = Query.point(balls, p)[0];
    if(!hit) return;                                   // anything else on the page works as usual
    e.preventDefault(); grab = hit; sec.setPointerCapture(e.pointerId); sec.classList.add('grabbing'); tossTip.classList.remove('show');
    grab.grabOff = Vector.sub(hit.position, p);
  });
  const release = e=>{
    if(!grab) return;
    Body.setVelocity(grab, { x:Math.max(-40, Math.min(40, vel.x)), y:Math.max(-40, Math.min(40, vel.y)) });
    Body.setAngularVelocity(grab, vel.x*.01);
    grab = null; sec.classList.remove('grabbing');
  };
  sec.addEventListener('pointerup', release); sec.addEventListener('pointercancel', release);
  (function loop(){
    requestAnimationFrame(loop);
    if(!visible || reduce){ lastStep = 0; return; }
    // step by real elapsed time, so a slow frame doesn't put the eyeballs in slow motion
    const now = performance.now(); acc += Math.min(120, now - (lastStep || now)); lastStep = now;
    let steps = 0;
    while(acc >= 1000/60 && steps < 6){
      if(grab && pt){ const target = Vector.add(pt, grab.grabOff); Body.setVelocity(grab, Vector.mult(Vector.sub(target, grab.position), .35)); }
      Engine.update(engine, 1000/60); acc -= 1000/60; steps++;
    }
    if(steps === 6) acc = 0;
    // anything thrown clean out of the page drops back in from above
    if((frameN = (frameN + 1) % 8) === 0){ if(Math.abs(sec.clientHeight - H) > 2 || Math.abs(sec.clientWidth - W) > 2) build(); else buildCeil(); }   // the page settled to a new size: move the floor with it
    for(const b of balls){ if(b.position.y > H + 400 || b.position.y < ceilY(b.position.x) - b.rr*.5 || b.position.x < -60 || b.position.x > W + 60){ Body.setPosition(b, { x:W*(.3+Math.random()*.4), y:H*.35 }); Body.setVelocity(b, { x:0, y:0 }); } }
    draw();
  })();
  img.onload = ()=> draw();
  new IntersectionObserver(es=>{ es.forEach(en=>{ visible = en.isIntersecting; if(en.isIntersecting && en.intersectionRatio > .02) throwIn(); }); }, { threshold:[0, .25, .5] }).observe(sec);
  let rt; addEventListener('resize', ()=>{ clearTimeout(rt); rt = setTimeout(build, 150); });
  build();
})();


/* ---------- BLOOM: the camera pushes in through the ring of flowers to the painter ----------
   Drawn on a canvas each frame. Each layer ends at its own scale and offset (measured from the
   reference) and zooms geometrically toward a fixed point; the field carries the arch with it. */
const bloom = document.getElementById('bloom'), bLayers = [...bloom.querySelectorAll('.bl')], bNote = document.getElementById('bnote'),
      bFade = document.getElementById('bcfade'), bTitle = document.getElementById('bloomTitle'), bcv = document.getElementById('bcv'), bctx = bcv.getContext('2d', {alpha:false});
let bZoom = 0, bMx = 0, bMy = 0, bMxS = 0, bMyS = 0, bOn = false;
const bPhone = ()=> matchMedia('(max-aspect-ratio: 4/5)').matches;
const bEnd = l=> (l.dataset.end.split('|')[bPhone() ? 1 : 0]).split(',').map(Number);
const pct = (el, prop)=> parseFloat(el.style[prop]) / 100;
// what each layer draws, in frame units (the frame is the 16:9 box that covers the screen)
const bDraw = bLayers.map(l=>{
  const k = l.dataset.k;
  if(k === 'birds'){
    const lanes = [...l.querySelectorAll('.lane')].map(ln=>({ dur:parseFloat(ln.style.animationDuration), delay:parseFloat(ln.style.animationDelay),
      birds:[...ln.querySelectorAll('.bird')].map(b=>({ el:b, x:pct(b,'left'), y:pct(b,'top'), w:pct(b,'width'),
        dur:b.classList.contains('b1') ? 2.2 : b.classList.contains('b2') ? 3 : 2.6, delay:b.classList.contains('b1') ? -.7 : b.classList.contains('b2') ? -1.3 : 0 })) }));
    return { l, k, lanes };
  }
  return { l, k, imgs:[...l.querySelectorAll('img')].map(im=>({ el:im, x:pct(im,'left'), y:pct(im,'top'), w:pct(im,'width'), h:im.style.height === 'auto' ? null : pct(im,'height'), front:im.classList.contains('frontrows') })) };
});
// the near flower rows: the bottom quarter of the field, fading in at its top edge
let frontCv = null;
function frontRows(img){
  if(frontCv || !img.complete || !img.naturalWidth) return frontCv;
  const W = img.naturalWidth, H = img.naturalHeight, y0 = Math.round(H*.75), h = H - y0;
  const c = document.createElement('canvas'); c.width = W; c.height = h; const x = c.getContext('2d');
  x.drawImage(img, 0, y0, W, h, 0, 0, W, h);
  x.globalCompositeOperation = 'destination-in';
  const g = x.createLinearGradient(0, 0, 0, h*.24); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = g; x.fillRect(0, 0, W, h);
  return frontCv = c;
}
const bSnap = { key:'', still:0, ok:false, back:null, front:null };
function bLayer(c, d, L){
  const { bw, bh, now, ph, eRing, eRest, bOut } = L;
    const ringA = d.k === 'ring' ? 1 - smooth(clamp((eRing - .75)/.25, 0, 1)) : 1;
    if(ringA <= .001) return;                                     // the ring has faded out completely: skip it
    const ee = d.k === 'ring' ? eRing : eRest*bOut;
    const [S1, X1, Y1] = d.end && d.ph === ph ? d.end : (d.ph = ph, d.end = bEnd(d.l)), S = Math.pow(S1, ee), k = S1 === 1 ? 0 : (S - 1)/(S1 - 1), sw = +d.l.dataset.sway;
    c.save();
    c.translate(X1*k*bw + bMxS*sw*innerWidth, Y1*k*bh + bMyS*sw*innerHeight*.6); c.scale(S, S);
    c.globalAlpha = ringA;
    if(d.lanes){
      for(const ln of d.lanes){
        const lp = (((now - ln.delay)/ln.dur) % 1 + 1) % 1, tx = (-.62 + 1.24*lp)*bw;
        for(const b of ln.birds){
          if(!b.el.complete || !b.el.naturalWidth) continue;
          const ph2 = (((now - b.delay)/b.dur) % 1 + 1) % 1, q = (1 - Math.cos(ph2*Math.PI*2))/2;
          const w = b.w*bw, h = w*b.el.naturalHeight/b.el.naturalWidth;
          c.save(); c.translate(tx + b.x*bw + .04*w*q + w/2, b.y*bh - .18*h*q + h/2); c.rotate((-2 + 5*q)*Math.PI/180);
          c.drawImage(b.el, -w/2, -h/2, w, h); c.restore();
        }
      }
    } else {
      for(const im of d.imgs){
        if(!im.el.complete || !im.el.naturalWidth) continue;
        const w = im.w*bw, h = im.h === null ? w*im.el.naturalHeight/im.el.naturalWidth : im.h*bh, x = im.x*bw, y = im.y*bh;
        // the field (and its near rows) sinks as the camera pushes in, so the final shot shows only a strip of it
        const sink = (d.k === 'field' && !im.el.classList.contains('archimg')) || d.k === 'front' ? ee*(ph ? .184 : .092)*bh : 0;
        if(im.front){ const fc = frontRows(im.el); if(fc) c.drawImage(fc, x, y + sink + h*.75, w, h*.25); }
        else c.drawImage(im.el, x, y + sink, w, h);
      }
    }
    c.restore();
  }
function paintBloom(){
  const pz = clamp(bZoom*2.2, 0, 1), pc = clamp((bZoom*2.2 - 1.4)/.8, 0, 1);
  const p = pz, st1 = smooth(clamp(p/.42, 0, 1)), st2 = smooth(clamp((p - .42)/.58, 0, 1));
  const eRing = st1, eRest = .1*st1 + .9*st2, e = eRest;
  // canvas size and the cover frame
  const W = bloom.clientWidth, H = bloom.clientHeight, dpr = Math.min(devicePixelRatio || 1, bPhone() ? 1.25 : 1.5);
  if(bcv.width !== Math.round(W*dpr) || bcv.height !== Math.round(H*dpr)){ bcv.width = Math.round(W*dpr); bcv.height = Math.round(H*dpr); }
  const bw = Math.max(W, H*16/9)*1.04, bh = bw*9/16, bx = (W - bw)/2, by = (H - bh)/2;   // 16:9, covering, with a little overscan
  const ph = bPhone(), cx = ph ? .506 : .386, cy = ph ? .598 : .552, Z = Math.pow(ph ? 5.5 : 7, smooth(pc));
  // phones: the camera holds back a little and slides right, so the painter sits left and the words get the right side;
  // it eases back to the original framing as the push into her canvas begins
  const pAdj = ph ? 1 - smooth(clamp(pc/.3, 0, 1)) : 0, bOut = 1 - .42*pAdj, bPan = .04*pAdj;
  const now = performance.now()/1000;
  bctx.setTransform(dpr,0,0,dpr,0,0); bctx.fillStyle = '#000'; bctx.fillRect(0,0,W,H);
  // once the cream fade fully covers the scene, or the scene has lifted away, there is nothing visible to paint
  const coverFade = smooth(clamp((pc - .55)/.4, 0, 1)), gone0 = smooth(clamp((pc - .86)/.12, 0, 1));
  const hidden = coverFade >= .999 || gone0 >= .999;
  bctx.save();
  bctx.translate(bx + cx*bw - bPan*bw, by + cy*bh); bctx.scale(Z, Z); bctx.translate(-cx*bw, -cy*bh);       // the camera into the easel's canvas
  const L = { bw, bh, now, ph, eRing, eRest, bOut };
  if(!hidden){
    // while nothing but the birds is moving, the layers behind and in front of them are reused as-is (pixel for pixel);
    // any scroll, mouse sway or resize repaints everything exactly as before
    const loaded = bDraw.reduce((n, d)=> n + (d.imgs ? d.imgs.filter(im=> im.el.complete && im.el.naturalWidth).length : 0), 0);
    const key = [bZoom.toFixed(5), bMxS.toFixed(4), bMyS.toFixed(4), bcv.width, bcv.height, loaded].join('|');
    if(key !== bSnap.key){ bSnap.key = key; bSnap.still = 0; bSnap.ok = false; } else bSnap.still++;
    if(bSnap.ok){
      bctx.setTransform(1,0,0,1,0,0); bctx.drawImage(bSnap.back, 0, 0);
      bctx.setTransform(dpr,0,0,dpr,0,0); bctx.translate(bx + cx*bw - bPan*bw, by + cy*bh); bctx.scale(Z, Z); bctx.translate(-cx*bw, -cy*bh);
      for(const d of bDraw) if(d.lanes) bLayer(bctx, d, L);
      bctx.setTransform(1,0,0,1,0,0); bctx.drawImage(bSnap.front, 0, 0);
      bctx.setTransform(dpr,0,0,dpr,0,0); bctx.translate(bx + cx*bw - bPan*bw, by + cy*bh); bctx.scale(Z, Z); bctx.translate(-cx*bw, -cy*bh);
    } else {
      for(const d of bDraw) bLayer(bctx, d, L);
      if(bSnap.still >= 2){                                         // settled: make the snapshots once
        const mk = c=>{ if(!c || c.width !== bcv.width || c.height !== bcv.height){ c = document.createElement('canvas'); c.width = bcv.width; c.height = bcv.height; } return c; };
        bSnap.back = mk(bSnap.back); bSnap.front = mk(bSnap.front);
        const cam = c=>{ c.setTransform(dpr,0,0,dpr,0,0); c.translate(bx + cx*bw - bPan*bw, by + cy*bh); c.scale(Z, Z); c.translate(-cx*bw, -cy*bh); };
        const bk = bSnap.back.getContext('2d', {alpha:false}), fr = bSnap.front.getContext('2d');
        bk.setTransform(1,0,0,1,0,0); bk.globalAlpha = 1; bk.fillStyle = '#000'; bk.fillRect(0, 0, bcv.width, bcv.height); cam(bk);
        fr.setTransform(1,0,0,1,0,0); fr.globalAlpha = 1; fr.clearRect(0, 0, bcv.width, bcv.height); cam(fr);
        let past = false;
        for(const d of bDraw){ if(d.lanes){ past = true; continue; } bLayer(past ? fr : bk, d, L); }
        bSnap.ok = true;
      }
    }
  }
  bctx.restore();
  const n = smooth(clamp((e - .72)/.22, 0, 1)) * (1 - smooth(clamp(pc/.25, 0, 1)));
  // phones: a soft dark haze painted behind "Chennai raised…" so it reads over the flower arch; it comes and goes with the note
  if(ph && n > .01){
    const t = bTitle.getBoundingClientRect(), br = bloom.getBoundingClientRect();
    const hx = t.left - br.left + t.width/2, hy = t.top - br.top + t.height/2;
    bctx.save(); bctx.translate(hx, hy); bctx.scale(t.width*.85, t.height*1.05);
    const g = bctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(12,6,18,${(.7*n).toFixed(3)})`); g.addColorStop(.55, `rgba(12,6,18,${(.5*n).toFixed(3)})`); g.addColorStop(1, 'rgba(12,6,18,0)');
    bctx.fillStyle = g; bctx.fillRect(-1, -1, 2, 2); bctx.restore();
  }
  bFade.style.opacity = smooth(clamp((pc - .55)/.4, 0, 1)).toFixed(3);
  // at the very end the whole scene lifts away, revealing the footer already waiting underneath
  const gone = smooth(clamp((pc - .86)/.12, 0, 1));
  bloom.style.opacity = (1 - gone).toFixed(3); bloom.style.pointerEvents = gone > .5 ? 'none' : '';
  const sp = bloom.parentElement; if(sp && sp.classList.contains('pin-spacer')) sp.style.pointerEvents = gone > .5 ? 'none' : '';
  bNote.style.opacity = n.toFixed(3); bNote.style.transform = `translateY(${((1-n)*24).toFixed(1)}px)`;
}
addEventListener('pointermove', e=>{ if(!bOn || reduce) return; bMx = (e.clientX/innerWidth - .5)*2; bMy = (e.clientY/innerHeight - .5)*2; }, {passive:true});
new IntersectionObserver(es=> es.forEach(en=>{ bOn = en.isIntersecting; if(!bOn){ bSnap.back = bSnap.front = null; bSnap.ok = false; bSnap.key = ''; } })).observe(bloom);
(function bloomLoop(){
  requestAnimationFrame(bloomLoop);
  if(!bOn) return;
  bMxS += (bMx - bMxS)*.06; bMyS += (bMy - bMyS)*.06;
  paintBloom();
})();
if(reduce || !window.gsap){ bZoom = 1; }

/* on the flower garden the logo, menu and depth ruler are plain cream, not blended against the painting */
new IntersectionObserver(es=> es.forEach(en=> document.body.classList.toggle('in-bloom', en.isIntersecting && en.intersectionRatio > .5)), {threshold:[0, .5, .75, 1]}).observe(bloom);


/* ---------- FOOTER: as it fills the screen, the nav's DAXX grows into the big logo ---------- */
(function(){
  const foot = document.getElementById('foot'), navEl = document.getElementById('nav'), mark = navEl && navEl.querySelector('.mark');
  if(!foot || !mark) return;
  let g = 0, target = 0, raf = 0;
  function sizes(){
    const vw = innerWidth/100, U = Math.min(vw, 1.7778*innerHeight/100), phone = innerWidth <= 760;
    return { f0:Math.max(20, 2.33*U), f1:(phone ? 17 : 7.5)*vw, s0:96, s1:110,
             t0:Math.max(14, 2.27*U), t1:(phone ? 5 : 2.8)*vw, l0:Math.max(18, 2.19*U), l1:(phone ? 6 : 5.06)*vw };
  }
  function apply(){
    const k = g*g*(3 - 2*g), S = sizes(), L = (a,b)=> a + (b - a)*k;
    if(g <= 0){ mark.style.removeProperty('font-size'); mark.style.removeProperty('font-stretch'); navEl.style.paddingTop = navEl.style.paddingLeft = ''; return; }
    mark.style.setProperty('font-size', L(S.f0, S.f1).toFixed(2)+'px', 'important');
    mark.style.setProperty('font-stretch', L(S.s0, S.s1).toFixed(1)+'%', 'important');
    navEl.style.paddingTop = L(S.t0, S.t1).toFixed(2)+'px'; navEl.style.paddingLeft = L(S.l0, S.l1).toFixed(2)+'px';
  }
  let last = 0;
  function step(now){
    const dt = Math.min(250, now - (last || now)); last = now;
    g += Math.sign(target - g)*dt/(reduce ? 1 : 700);
    g = Math.max(0, Math.min(1, g));
    apply();
    if(g !== target) raf = requestAnimationFrame(step); else { raf = 0; last = 0; }
  }
  function check(){
    const on = scrollY + innerHeight >= document.documentElement.scrollHeight - innerHeight*.06;
    if(navEl.classList.contains('in-foot') === on) return;
    navEl.classList.toggle('in-foot', on); document.body.classList.toggle('in-foot', on);
    target = on ? 1 : 0; if(!raf) raf = requestAnimationFrame(step);
  }
  addEventListener('scroll', check, {passive:true}); addEventListener('resize', check); check();
  addEventListener('resize', apply);
})();


/* ---------- FOOTER GAME: whack-a-creature with the foot-hammer ----------
   Over the crowd the cursor reads "Click to play"; a click (or a tap on phones) starts 30 seconds of play:
   the creatures duck and pop up one at a time, and the cursor becomes the foot-hammer. Hit one while
   it's up and it drops with its eyes gone black. Their pupils always follow the pointer. */
(function(){
  const foot = document.getElementById('foot'); if(!foot) return;
  const crowds = [...foot.querySelectorAll('.crowd')], crowdNow = ()=> crowds.find(c=> c.offsetParent !== null) || crowds[0];
  const crs = [...foot.querySelectorAll('.cr')];
  const pups = crs.flatMap(cr=> [...cr.querySelectorAll('.pp')].map(el=>({cr, el, rx:+el.dataset.rx, ry:+el.dataset.ry, cx:0, cy:0, lag:.08 + Math.random()*.08})));
  const ham = document.createElement('div'); ham.className = 'hammer'; ham.setAttribute('aria-hidden','true'); document.body.appendChild(ham);
  const tip = document.createElement('div'); tip.className = 'play-cursor'; tip.setAttribute('aria-hidden','true'); tip.textContent = 'Click to play'; document.body.appendChild(tip);
  const game = document.getElementById('game'), hud = document.getElementById('ghud'), field = document.getElementById('playfield'),
        exitB = document.getElementById('gexit'), scoreP = document.getElementById('gscore'), pts = document.getElementById('gpts'), tim = document.getElementById('gtime'), timeP = document.getElementById('gtimeP');
  const touch = matchMedia('(hover: none)').matches;
  let mx = innerWidth/2, my = innerHeight*.6, hx = mx, hy = my, overCrowd = false, swingT = -1, footOn = false, actx = null;
  let playing = false, score = 0, endAt = 0, popTimer = 0, coolUntil = 0;
  const REST = 34, HIT = -6, HOT = { x:.17, y:.9 }, GAME_MS = 30000;
  function sound(){
    try{
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, g = actx.createGain(); g.connect(actx.destination);
      const o = actx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(48, t + .16);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.55, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(g); o.start(t); o.stop(t + .24);
      const n = actx.createBufferSource(), buf = actx.createBuffer(1, actx.sampleRate*.05, actx.sampleRate), d = buf.getChannelData(0);
      for(let i=0; i<d.length; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/d.length, 3);
      const ng = actx.createGain(); ng.gain.value = .22; n.buffer = buf; n.connect(ng); ng.connect(actx.destination); n.start(t);
    }catch(e){}
  }
  function showHud(){ const s = Math.max(0, Math.ceil((endAt - performance.now())/1000)); pts.textContent = score; tim.textContent = `00:${String(s).padStart(2,'0')}`; }
  function pop(){
    if(!playing) return;
    const pool = [...crowdNow().querySelectorAll('.cr:not(.up):not(.down)')];
    const cr = pool[(Math.random()*pool.length)|0];
    const stay = touch ? 1000 + Math.random()*700 : 700 + Math.random()*500;       // a little longer on phones
    if(cr){ cr.classList.add('up'); clearTimeout(cr._t); cr._t = setTimeout(()=> cr.classList.remove('up'), stay); }
    popTimer = setTimeout(pop, 380 + Math.random()*420);
  }
  function start(){
    playing = true; score = 0; endAt = performance.now() + GAME_MS;
    crowds.forEach(c=> c.classList.add('playing')); game.classList.add('playing'); foot.classList.add('gaming'); hud.hidden = true; exitB.hidden = false; scoreP.hidden = false; timeP.hidden = false; showHud(); pop();
  }
  function stop(){
    playing = false; clearTimeout(popTimer);
    crowds.forEach(c=> c.classList.remove('playing')); game.classList.remove('playing'); foot.classList.remove('gaming'); exitB.hidden = true; scoreP.hidden = true; timeP.hidden = true; ham.classList.remove('show');
    crs.forEach(cr=>{ clearTimeout(cr._t); clearTimeout(cr._up); cr.classList.remove('up','down'); });
    coolUntil = performance.now() + 1200;            // a beat before the next click can start a new round
  }
  function whack(cr){
    if(!playing || !cr.classList.contains('up') || cr.classList.contains('down')) return;
    score++; sound(); clearTimeout(cr._t);
    cr.classList.remove('up'); cr.classList.add('down');
    clearTimeout(cr._up); cr._up = setTimeout(()=> cr.classList.remove('down'), 700);
    showHud();
  }
  const inPlay = t=> !!(t.closest('.crowd') || t === field);
  // Exit Game: stops on the press itself, and the next click won't restart a round straight away
  function exitGame(e){ e.stopPropagation(); e.preventDefault(); if(playing) stop(); hud.hidden = true; coolUntil = performance.now() + 1500; }
  exitB.addEventListener('pointerdown', exitGame); exitB.addEventListener('click', exitGame);
  // over the button the hammer goes away and the normal cursor is back
  const offExit = ()=>{ overCrowd = false; ham.classList.remove('show'); tip.classList.remove('show'); };
  exitB.addEventListener('pointerenter', offExit); exitB.addEventListener('pointermove', offExit);
  foot.addEventListener('pointermove', e=>{ mx = e.clientX; my = e.clientY; overCrowd = inPlay(e.target) && e.pointerType !== 'touch'; }, {passive:true});
  foot.addEventListener('pointerleave', ()=>{ overCrowd = false; });
  foot.addEventListener('pointerdown', e=>{
    if(!inPlay(e.target)) return;
    mx = hx = e.clientX; my = hy = e.clientY;
    if(!playing){ if(performance.now() > coolUntil) start(); return; }
    swingT = performance.now();
    if(e.pointerType === 'touch'){ ham.classList.add('show'); clearTimeout(ham._h); ham._h = setTimeout(()=>{ ham.classList.remove('show'); ham._h = 0; }, 450); }
    const cr = e.target.closest('.cr'); if(cr) whack(cr);
  });
  new IntersectionObserver(es=> es.forEach(en=>{ footOn = en.isIntersecting; if(!footOn && playing) stop(); })).observe(foot);

  (function loop(now){
    requestAnimationFrame(loop);
    if(playing){ if(now >= endAt){ stop(); hud.hidden = false; hud.textContent = `You whacked ${score}! ${touch ? 'Tap' : 'Click'} to play again`; } else showHud(); }
    if(!footOn){ ham.classList.remove('show'); tip.classList.remove('show'); return; }
    hx += (mx - hx)*.45; hy += (my - hy)*.45;
    let ang = REST;
    if(swingT >= 0){ const k = (now - swingT)/260; if(k >= 1) swingT = -1; else ang = k < .35 ? REST + (HIT - REST)*(k/.35) : HIT + (REST - HIT)*((k - .35)/.65); }
    if(overCrowd && playing) ham.classList.add('show'); else if(!ham._h) ham.classList.remove('show');
    tip.classList.toggle('show', overCrowd && !playing);
    const w = ham.offsetWidth, h = ham.offsetHeight;
    ham.style.transform = `translate(${(hx - HOT.x*w).toFixed(1)}px, ${(hy - HOT.y*h).toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`;
    tip.style.transform = `translate(${(mx - tip.offsetWidth/2).toFixed(1)}px, ${(my - tip.offsetHeight/2).toFixed(1)}px)`;
    for(const p of pups){
      const er = p.el.getBoundingClientRect(), ex = er.left + er.width/2, ey = er.top + er.height/2;
      const dx = mx - ex, dy = my - ey, d = Math.hypot(dx, dy) || 1, reach = Math.min(1, d/(innerWidth*.22));
      const ax = dx/d*reach, ay = dy/d*reach;
      p.cx += (ax - p.cx)*p.lag; p.cy += (ay - p.cy)*p.lag;
      p.el.style.transform = `translate(${(p.cx*p.rx).toFixed(1)}%, ${(p.cy*p.ry).toFixed(1)}%)`;
    }
  })(0);
})();

/* "About" in the menus lands exactly on the About me page */
document.querySelectorAll('a[href="#hello"]').forEach(a=> a.addEventListener('click', e=>{
  const el = document.getElementById('hello'); if(!el) return;
  e.preventDefault(); window.scrollTo({top: el.getBoundingClientRect().top + scrollY, behavior:'auto'});
}));

/* links: Lense → the Philosophy scene, Contact → the footer at the very end, Rewind the dream → a dive
   into one creature's eye that comes back out on the landing page */
(function(){
  const foot = document.getElementById('foot');
  const black = document.createElement('div'); black.className = 'dive-black'; black.setAttribute('aria-hidden','true'); document.body.appendChild(black);
  let diving = false;
  function rewind(){
    if(diving) return; diving = true;
    const crowd = [...foot.querySelectorAll('.crowd')].find(c=> c.offsetParent !== null);
    foot.classList.add('diving');                                  // the creatures stop swaying, so the eye holds still
    requestAnimationFrame(()=>{
      const fr = foot.getBoundingClientRect(); let best = null, bd = 1e9;
      crowd.querySelectorAll('.cr:not(.down) .pp').forEach(el=>{ const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width/2 - innerWidth/2) + Math.abs(r.top - innerHeight*.75)*.6;
        if(r.top > 0 && r.bottom < innerHeight && d < bd){ bd = d; best = el; } });
      if(!best){ window.scrollTo({top:0, behavior:'auto'}); foot.classList.remove('diving'); diving = false; return; }
      const r = best.getBoundingClientRect(), ox = r.left + r.width/2 - fr.left, oy = r.top + r.height/2 - fr.top, Zmax = Math.max(60, innerWidth*1.8/r.width);
      foot.style.transformOrigin = `${ox}px ${oy}px`;
      const t0 = performance.now(), dur = reduce ? 1 : 1500;
      (function step(now){
        const k = Math.min(1, (now - t0)/dur), e = k*k*k;            // eases in, accelerating into the pupil
        foot.style.transform = `scale(${Math.pow(Zmax, e).toFixed(3)})`;
        black.style.opacity = Math.max(0, Math.min(1, (k - .62)/.3)).toFixed(3);
        if(k < 1) return requestAnimationFrame(step);
        window.scrollTo({top:0, behavior:'auto'});
        foot.style.transform = ''; foot.classList.remove('diving');
        requestAnimationFrame(()=>{ black.style.transition = 'opacity 1.1s ease'; black.style.opacity = 0;
          setTimeout(()=>{ black.style.transition = ''; diving = false; }, 1200); });
      })(t0);
    });
  }
  // caught in the capture phase, ahead of the page's general "#" link handler
  document.addEventListener('click', e=>{
    const a = e.target.closest('[data-go]'); if(!a) return;
    e.stopPropagation();
    const go = a.dataset.go;
    const pinStart = id=>{ const t = window.ScrollTrigger && ScrollTrigger.getAll().find(t=> t.trigger && t.trigger.id === id && t.pin); return t ? t.start : null; };
    if(go === 'work'){ e.preventDefault(); const y = pinStart('grid'); window.scrollTo({top: y !== null ? y : document.getElementById('grid').getBoundingClientRect().top + scrollY, behavior:'auto'}); return; }
    if(go === 'home'){ e.preventDefault(); window.scrollTo({top:0, behavior:'auto'}); return; }
    if(go === 'clock'){ e.preventDefault(); const y = pinStart('bloom'); window.scrollTo({top: y !== null ? y : document.getElementById('bloom').getBoundingClientRect().top + scrollY, behavior:'auto'}); return; }
    if(go === 'contact'){ e.preventDefault(); window.scrollTo({top: document.documentElement.scrollHeight, behavior:'auto'}); return; }
    if(go === 'top'){ e.preventDefault(); rewind(); }
  }, true);
})();

/* ---------- choreography ---------- */
if(!hasGsap || reduce){ nav.classList.remove('in-hero'); }
if(!hasGsap){ return; }
gsap.registerPlugin(ScrollTrigger);

if(reduce){ return; }

// face, eye and tunnel: one pinned stretch, so nothing scrolls away in between
const zp = {p:0};
heroST = ScrollTrigger.create({trigger:'#hero', refreshPriority:30, start:'top top', end:()=> '+=' + (PHONE ? 705 : 940) + '%', pin:true, scrub:true, invalidateOnRefresh:true,   // about a quarter shorter on phones
  onUpdate:s=>{ gsap.to(zp,{p:s.progress, duration:.5, ease:'power2.out', overwrite:true, onUpdate:()=>master(zp.p)}); },
  onLeave:()=>{ nav.classList.remove('in-hero'); }, onEnterBack:()=>nav.classList.add('in-hero')});
ScrollTrigger.addEventListener('refreshInit', ()=>{ Object.values(layers).forEach(l=> l.style.transform='none'); });
ScrollTrigger.addEventListener('refresh', measure);

// after the pinning settles on a new window size (resize, full screen), size everything again
ScrollTrigger.addEventListener('refresh', ()=>{ sizeTunnel(); drawTunnel(); });

// work: the section pins and the vertical scroll slides the row sideways; fast scrolling squeezes the cards a touch
let gridTween = null;
function makeWheel(){
  gridSec.classList.add('pinned');
  gridTween = gsap.to(gtrack, { x: ()=> -Math.max(0, gtrack.scrollWidth - gpanel.clientWidth), ease:'none',
    scrollTrigger:{ trigger:gridSec, refreshPriority:20, start:'top top', end: ()=> '+=' + Math.max(1, gtrack.scrollWidth - gpanel.clientWidth), pin:true, scrub:.8, invalidateOnRefresh:true,
      onUpdate: s=>{ sqTo(1 - Math.min(.06, Math.abs(s.getVelocity())/40000)); clearTimeout(gridSec._sq); gridSec._sq = setTimeout(()=> sqTo(1), 140); } }});
  gridST = gridTween.scrollTrigger;
}
function killWheel(){
  if(gridTween){ gridTween.scrollTrigger.kill(true); gridTween.kill(); gridTween = null; gridST = null; }
  gsap.set(gtrack, {x:0, clearProps:'transform'}); gridSec.classList.remove('pinned');
}
const sqTo = gsap.quickTo(gtrack, '--sq', {duration:.5, ease:'power3.out'});
makeWheel();
// the Wheel / Grid toggle: the wheel pins and slides sideways; the grid simply scrolls
window.__gridPin = on=>{ if(on && !gridTween) makeWheel(); if(!on) killWheel(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };

// hello: the arch at the top keeps its round shape

// bloom: pinned while the camera pushes in through the ring of flowers to the painter, then holds for the note
const bz = {z:0};
ScrollTrigger.create({trigger:'#bloom', refreshPriority:10, start:'top top', end:'+=220%', pin:true, scrub:true,
  onUpdate:s=>{ gsap.to(bz,{z:s.progress, duration:.22, ease:'power2.out', overwrite:true, onUpdate:()=>{ bZoom = bz.z; }}); }});


// parallax layers
document.querySelectorAll('section:not(#hero) [data-speed]').forEach(el=>{
  const sp = parseFloat(el.dataset.speed);
  gsap.fromTo(el,{y:()=> -sp*innerHeight*.5},{y:()=> sp*innerHeight*.5, ease:'none',
    scrollTrigger:{trigger:el.closest('section'), start:'top bottom', end:'bottom top', scrub:true, invalidateOnRefresh:true}});
});

// the sun rises as you wake

})();
