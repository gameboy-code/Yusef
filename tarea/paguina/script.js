/* Círculo con imagen que reemplaza el puntero.
   - En casi toda la página: la foto principal (data-cursor-img de .visual), en tamaño chico.
   - Sobre cada tarjeta y sobre la foto principal: su imagen, en tamaño grande.
   - Sobre links y botones: el puntero normal.
   En celular (sin mouse) no se activa. */
(() => {
  'use strict';

  const root   = document.documentElement;
  const cursor = document.querySelector('.cursor');
  const face   = cursor && cursor.querySelector('.cursor-face');
  if (!cursor || !face) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const reduced = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !!(document.getElementById('menos-movimiento') || {}).checked;

  const SEL = '[data-cursor-img].cursor-ready';
  const INTERACTIVE = 'a, button, label, input';

  const main    = document.querySelector('.visual[data-cursor-img]');
  const mainSrc = main ? main.dataset.cursorImg : '';
  let mainReady = false;

  let tx = -400, ty = -400, cx = -400, cy = -400;
  let running = false, currentKey = '';

  /* Activa cada imagen solo si el archivo existe;
     si falta, se queda el puntero normal en ese sitio. */
  document.querySelectorAll('[data-cursor-img]').forEach(el => {
    const src = el.dataset.cursorImg;
    if (!src) return;
    const im = new Image();
    im.onload = () => {
      el.classList.add('cursor-ready');
      if (el === main) { mainReady = true; root.classList.add('has-cursor'); }
    };
    im.src = src;
  });

  const loop = () => {
    const k = reduced() ? 1 : 0.25;
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  };

  /* Decide qué mostrar según lo que hay bajo el mouse */
  const resolve = el => {
    if (!(el instanceof Element)) return { mode: 'off' };
    if (el.closest(INTERACTIVE)) return { mode: 'off' };            // links y botones
    const t = el.closest(SEL);
    if (t) return { mode: 'big', src: t.dataset.cursorImg };         // tarjetas y foto principal
    if (mainReady) return { mode: 'small', src: mainSrc };           // el resto de la página
    return { mode: 'off' };
  };

  const setTarget = el => {
    const r = resolve(el);
    const key = r.mode + '|' + (r.src || '');
    if (key === currentKey) return;
    currentKey = key;
    if (r.mode === 'off') {
      cursor.classList.remove('on');
    } else {
      face.style.backgroundImage = `url("${r.src}")`;
      cursor.classList.toggle('big', r.mode === 'big');
      cursor.classList.add('on');
    }
  };

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    tx = e.clientX; ty = e.clientY;
    if (!running) { running = true; cx = tx; cy = ty; requestAnimationFrame(loop); }
    setTarget(e.target);
  }, { passive: true });

  // Si haces scroll con el mouse quieto, vuelve a revisar qué hay debajo
  addEventListener('scroll', () => {
    if (running) setTarget(document.elementFromPoint(tx, ty));
  }, { passive: true });

  root.addEventListener('mouseleave', () => { currentKey = ''; cursor.classList.remove('on'); });
})();
