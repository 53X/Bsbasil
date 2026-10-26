import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { whenAwake } from '@/lib/page-scroll';

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const SUBHEADS = 'p.italic-accent, [data-subhead], [data-hero-sub]';

/**
 * Words in every headline and the line under it slide in from opposite
 * sides once that line is on screen. Offer photos do the same.
 */
export default function HeadlineMotion() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.getElementById('content');
    if (!root) return;
    if (pathname === '/about' || pathname === '/contact') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let stop = () => {};
    const cancel = whenAwake(() => {
      const done = mount(root);
      if (typeof done === 'function') stop = done;
    });
    return () => {
      cancel();
      stop();
    };

    function mount(root: HTMLElement): () => void {
    const armed: HTMLElement[] = [];
    const offerButtons: HTMLElement[] = [];

    const splitWords = (el: HTMLElement) => {
      if (el.dataset.words === '1') return;
      if (el.closest('[data-still-name], [data-about-reveal]')) return;
      if (el.hasAttribute('data-about-reveal')) return;
      const raw = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!raw) return;
      el.dataset.raw = raw;
      el.dataset.words = '1';
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent || parent.classList.contains('word-in') || parent.closest('[data-still-name]')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes: Text[] = [];
      let current = walker.nextNode();
      while (current) {
        nodes.push(current as Text);
        current = walker.nextNode();
      }
      let count = el.previousElementSibling?.matches(HEADINGS) ? 1 : 0;
      nodes.forEach((node) => {
        const parts = node.textContent?.split(/(\s+)/) ?? [];
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const word = document.createElement('span');
          word.className = 'word-in';
          word.dataset.dir = count % 2 === 0 ? 'left' : 'right';
          word.textContent = part;
          frag.appendChild(word);
          count += 1;
        });
        node.parentNode?.replaceChild(frag, node);
      });
    };

    const piecesOf = (el: HTMLElement) => {
      const words = [...el.querySelectorAll<HTMLElement>(':scope .word-in')];
      return words.length ? words : el.hasAttribute('data-shop-photo') ? [el] : [];
    };

    const play = (el: HTMLElement) => {
      const pieces = piecesOf(el);
      if (!pieces.length || el.dataset.played === '1') return;
      el.dataset.played = '1';
      pieces.forEach((piece, index) => {
        const dir = piece.dataset.dir === 'right' || (el.hasAttribute('data-shop-photo') && index === 0 && piece.dataset.side === 'right')
          ? 'right'
          : piece.dataset.dir === 'left'
            ? 'left'
            : index % 2 === 0
              ? 'left'
              : 'right';
        const from = el.hasAttribute('data-shop-photo')
          ? (el.dataset.side === 'right' ? 'right' : 'left')
          : dir;
        piece.style.animation = '';
        piece.style.opacity = '';
        piece.style.transform = '';
        piece.style.animationDelay = `${Math.min(index, 8) * 0.11}s`;
        piece.classList.remove('slide-left-out', 'slide-right-out');
        piece.classList.add(from === 'right' ? 'slide-right' : 'slide-left');
      });
    };

    const hide = (el: HTMLElement) => {
      if (el.dataset.played !== '1') return;
      delete el.dataset.played;
      piecesOf(el).forEach((piece) => {
        const outgoing = piece.classList.contains('slide-right') ? 'slide-right-out' : 'slide-left-out';
        piece.classList.remove('slide-left', 'slide-right');
        piece.style.animation = '';
        piece.style.animationDelay = '0s';
        piece.classList.add(outgoing);
      });
      const card = el.closest('article');
      card?.querySelectorAll<HTMLElement>('[data-offer-cta]').forEach((btn) => {
        delete btn.dataset.played;
        delete btn.dataset.held;
        delete btn.dataset.heldAt;
        btn.style.animation = '';
        btn.style.opacity = '';
        btn.style.transform = '';
        btn.classList.remove('slide-right');
      });
    };

    const consider = (el: HTMLElement) => {
      if (!piecesOf(el).length) return;
      const box = el.getBoundingClientRect();
      if (box.height < 2) return;
      if (document.querySelector('[data-silk-intro]') && box.top < window.innerHeight && box.bottom > 0) return;
      const vh = window.innerHeight;
      const inView = box.top < vh * 0.96 && box.bottom > vh * 0.1;
      if (inView) {
        play(el);
        return;
      }
      if (el.dataset.played === '1' && box.top > vh * 0.96) hide(el);
    };

    let initial = true;
    const watch = (el: HTMLElement) => {
      if (initial) {
        const box = el.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) {
          el.dataset.played = '1';
          return;
        }
      }
      splitWords(el);
      if (!piecesOf(el).length) return;
      if (!armed.includes(el)) armed.push(el);
      consider(el);
    };

    const scan = () => {
      root.querySelectorAll<HTMLElement>(HEADINGS).forEach((heading) => {
        if (heading.closest('[data-silk-intro]')) return;
        watch(heading);
        const next = heading.nextElementSibling;
        if (next instanceof HTMLElement && next.matches('p')) watch(next);
      });
      root.querySelectorAll<HTMLElement>(SUBHEADS).forEach((sub) => {
        if (sub.closest('[data-silk-intro]')) return;
        watch(sub);
      });
      root.querySelectorAll<HTMLElement>('[data-offer-cta]').forEach((btn) => {
        if (!offerButtons.includes(btn)) offerButtons.push(btn);
      });
      root.querySelectorAll<HTMLElement>('[data-shop-photo]').forEach((photo, index) => {
        photo.dataset.side = index % 2 === 0 ? 'right' : 'left';
        photo.dataset.dir = photo.dataset.side;
        if (!armed.includes(photo)) armed.push(photo);
        consider(photo);
      });
    };

    const releaseButton = (btn: HTMLElement) => {
      if (btn.dataset.played === '1') return;
      btn.dataset.played = '1';
      btn.style.opacity = '';
      btn.style.transform = '';
      btn.classList.add('slide-right');
    };

    const syncOfferButton = (btn: HTMLElement) => {
      if (btn.dataset.played === '1') return;
      const card = btn.closest('article');
      const heading = card?.querySelector('h3');
      const sub = card?.querySelector('p.italic-accent');
      if (!(heading instanceof HTMLElement) || heading.dataset.played !== '1') return;
      if (btn.dataset.held !== '1') {
        btn.dataset.held = '1';
        btn.dataset.heldAt = String(performance.now());
        btn.style.opacity = '0';
        btn.style.transform = 'translate3d(3.75rem, 0, 0)';
      }
      if (sub instanceof HTMLElement && sub.dataset.played !== '1') return;
      const words = [
        ...heading.querySelectorAll<HTMLElement>('.word-in'),
        ...(sub instanceof HTMLElement ? [...sub.querySelectorAll<HTMLElement>('.word-in')] : []),
      ];
      const running = words.flatMap((word) => [...word.getAnimations()]);
      const linesFinished = running.length > 0 && running.every((anim) => anim.playState === 'finished');
      const snapped = running.length === 0 && heading.dataset.played === '1';
      const waited = performance.now() - Number(btn.dataset.heldAt);
      if (snapped) {
        btn.dataset.played = '1';
        btn.style.animation = 'none';
        btn.style.opacity = '1';
        btn.style.transform = 'none';
        return;
      }
      if (linesFinished || waited > 2400) releaseButton(btn);
    };

    let frame = 0;
    const tick = () => {
      armed.forEach(consider);
      offerButtons.forEach(syncOfferButton);
      frame = 0;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(tick);
    };

    scan();
    initial = false;
    frame = window.requestAnimationFrame(tick);
    const changes = new MutationObserver(scan);
    changes.observe(root, { childList: true, subtree: true });
    root.addEventListener('bs-line-change', scan);
    window.addEventListener('bs-motion-refresh', scan);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      changes.disconnect();
      root.removeEventListener('bs-line-change', scan);
      window.removeEventListener('bs-motion-refresh', scan);
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      armed.forEach((el) => {
        delete el.dataset.played;
      });
    };
    }
  }, [pathname]);

  return null;
}
