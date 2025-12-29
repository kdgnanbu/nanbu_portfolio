    // レーダーチャート
    function animateRadar(svg) {
      try {
        const maxRadius = 120;
        const numPoints = 5;
        const levels = [0.2, 0.4, 0.6, 0.8, 1];
        const maxSkill = 4;
        const speed = Number(svg.dataset.speed) || 0.08;

        const angles = Array.from({ length: numPoints }, (_, i) =>
          -Math.PI / 2 + (i * 2 * Math.PI) / numPoints
        );

        const gridPoints = levels.map(level =>
          angles.map(a => [
            level * maxRadius * Math.cos(a),
            level * maxRadius * Math.sin(a)
          ])
        );

        function getVertexPoint(pointIndex, value) {
          const scaled = (value / maxSkill) * (gridPoints.length - 1);
          const lower = Math.floor(scaled);
          const upper = Math.min(Math.ceil(scaled), gridPoints.length - 1);
          const t = scaled - lower;
          const [x1, y1] = gridPoints[lower][pointIndex];
          const [x2, y2] = gridPoints[upper][pointIndex];
          return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
        }

        function getFillPoints(values) {
          return values.map((v, i) => getVertexPoint(i, v).join(',')).join(' ');
        }

        let grids = svg.querySelectorAll('.grid');
        if (grids.length < gridPoints.length) {
          for (let i = grids.length; i < gridPoints.length; i++) {
            const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            poly.classList.add('grid');
            svg.appendChild(poly);
          }
          grids = svg.querySelectorAll('.grid');
        }

        grids.forEach((poly, i) => {
          const str = gridPoints[i].map(p => p.join(',')).join(' ');
          poly.setAttribute('points', str);
        });

        let fillPolygon = svg.querySelector('.fill-area');
        if (!fillPolygon) {
          fillPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          fillPolygon.classList.add('fill-area');
          svg.appendChild(fillPolygon);
        }

        const raw = svg.dataset.values || '';
        const skillValues = raw.split(',').map(s => {
          const n = Number(s);
          return Number.isFinite(n) ? n : 0;
        });

        while (skillValues.length < numPoints) skillValues.push(0);
        let currentValues = Array(numPoints).fill(0);
        function animate() {
          let done = true;
          currentValues = currentValues.map((v, i) => {
            if (v < skillValues[i]) {
              v += speed;
              if (v > skillValues[i]) v = skillValues[i];
              done = false;
            }
            return v;
          });
          fillPolygon.setAttribute('points', getFillPoints(currentValues));
          if (!done) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      } catch (err) {
        console.error('animateRadar error:', err);
      }
    }
    // ハンバーガー
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
      });
      navMenu.querySelectorAll('li').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.classList.remove('no-scroll');
        });
      });
    }

    // フェードイン
    document.addEventListener('DOMContentLoaded', () => {
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('show');
          else entry.target.classList.remove('show');
        });
      }, { threshold: 0, rootMargin: '0px 0px -150px 0px' });

      document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

      // レーダーチャートフェードイン対応
      const rendered = new WeakSet();
      const graphObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            if (target.classList && target.classList.contains('radar-chart')) {
              if (!rendered.has(target)) {
                animateRadar(target);
                rendered.add(target);
              }
            }
          }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -100px 0px' });
      document.querySelectorAll('.radar-chart').forEach(svg => graphObserver.observe(svg));
    });

    document.addEventListener('scroll', () => {
      const hint = document.getElementById('scroll-hint');
      if (!hint) return;
      if (window.scrollY > 100) hint.classList.add('hide');
      else hint.classList.remove('hide');
    });

document.querySelectorAll('.img-cell').forEach(cell => {

  const slides = cell.querySelector('.slides');
  const slideItems = cell.querySelectorAll('.slide');
  const prev = cell.querySelector('.prev');
  const next = cell.querySelector('.next');
  const dots = cell.querySelectorAll('.dot');
  const zoomBtn = cell.querySelector('.zoom-icon');

  if (!slides || slideItems.length === 0) return;

  const slideWidth = slideItems[0].clientWidth;
  let index = 1;
  let lock = false;

  /* 初期位置 */
  slides.style.transform = `translateX(${-slideWidth * index}px)`;

  function updateDots(i) {
    dots.forEach(d => d.classList.remove('active'));
    dots[i]?.classList.add('active');
  }

  /* next */
  next.addEventListener('click', () => {
    if (lock) return;
    lock = true;
    index++;
    slides.style.transition = '.5s';
    slides.style.transform = `translateX(${-slideWidth * index}px)`;
  });

  /* prev */
  prev.addEventListener('click', () => {
    if (lock) return;
    lock = true;
    index--;
    slides.style.transition = '.5s';
    slides.style.transform = `translateX(${-slideWidth * index}px)`;
  });

  /* infinite loop */
  slides.addEventListener('transitionend', () => {
    slides.style.transition = 'none';

    if (slideItems[index].classList.contains('clone-first')) {
      index = 1;
      slides.style.transform = `translateX(${-slideWidth * index}px)`;
    }

    if (slideItems[index].classList.contains('clone-last')) {
      index = slideItems.length - 2;
      slides.style.transform = `translateX(${-slideWidth * index}px)`;
    }

    updateDots(index - 1);
    lock = false;
  });

  /* dots */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      if (lock) return;
      lock = true;
      index = Number(dot.dataset.index) + 1;
      slides.style.transition = '.5s';
      slides.style.transform = `translateX(${-slideWidth * index}px)`;
      updateDots(dot.dataset.index);
    });
  });

  /* lightbox（共通1個） */
  if (zoomBtn) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    zoomBtn.addEventListener('click', () => {
      const img = slideItems[index].querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
    });

    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

});




