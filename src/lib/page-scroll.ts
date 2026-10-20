type LenisHandle = {
  scroll: number;
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
};

let lenis: LenisHandle | null = null;

export function bindLenis(next: LenisHandle | null) {
  lenis = next;
}

export function scrollPageBy(delta: number, immediate = true) {
  if (!delta) return;
  if (lenis) {
    lenis.scrollTo(lenis.scroll + delta, { immediate });
    return;
  }
  window.scrollBy(0, delta);
}

/**
 * Drag on an element to move the page, which is what drives
 * the cube and the sideways archive.
 */
export function bindPointerScrub(
  el: HTMLElement,
  xGain: () => number,
  yGain: () => number = () => 1,
) {
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let dragged = false;

  const finish = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    pointerId = null;
    if (dragged) {
      el.dataset.dragged = '1';
      window.setTimeout(() => {
        delete el.dataset.dragged;
      }, 180);
    }
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    if (event.pointerType !== 'mouse') return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    dragged = false;
    el.setPointerCapture(event.pointerId);
  };

  const onMove = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (!dragged && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    event.preventDefault();
    dragged = true;
    scrollPageBy(-dx * xGain() + dy * yGain());
  };

  const onClick = (event: MouseEvent) => {
    if (el.dataset.dragged !== '1') return;
    event.preventDefault();
    event.stopPropagation();
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
  el.addEventListener('click', onClick, true);

  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', finish);
    el.removeEventListener('pointercancel', finish);
    el.removeEventListener('click', onClick, true);
  };
}

/**
 * Cube only: left-right and up-down both turn the faces.
 * `onTurn` receives a signed pixel delta (down/right is positive).
 */
export function bindCubeSteer(
  el: HTMLElement,
  onTurn: (delta: number) => void,
  onEnd?: () => void,
) {
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let dragged = false;

  const finish = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    pointerId = null;
    if (dragged) {
      el.dataset.dragged = '1';
      window.setTimeout(() => {
        delete el.dataset.dragged;
      }, 180);
      onEnd?.();
    }
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    dragged = false;
    el.setPointerCapture(event.pointerId);
  };

  const onMove = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (!dragged && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    event.preventDefault();
    dragged = true;
    onTurn(-dx + dy);
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    onTurn(event.deltaY + event.deltaX);
  };

  const onClick = (event: MouseEvent) => {
    if (el.dataset.dragged !== '1') return;
    event.preventDefault();
    event.stopPropagation();
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('click', onClick, true);

  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', finish);
    el.removeEventListener('pointercancel', finish);
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('click', onClick, true);
  };
}
