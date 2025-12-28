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


// スライダー
document.querySelectorAll(".slider-wrapper").forEach(wrapper => {
  const slides = wrapper.querySelector(".slides");
  let slideImages = wrapper.querySelectorAll(".slide");
  const prev = wrapper.querySelector(".prev");
  const next = wrapper.querySelector(".next");
  const dots = wrapper.parentElement.querySelectorAll(".dot");

  const size = 300;
  let index = 1;
  slides.style.transform = `translateX(${-size * index}px)`;

  function moveToSlide(i) {
    index = i;
    slides.style.transition = 'transform 0.5s ease';
    slides.style.transform = `translateX(${-size * index}px)`;
    updateDots();
  }

  function updateDots() {
    let dotIndex = (index - 1 + 5) % 5;
    dots.forEach(d => d.classList.remove("active"));
    dots[dotIndex].classList.add("active");
  }

  next.addEventListener("click", () => { moveToSlide(index + 1);  });
  prev.addEventListener("click", () => { moveToSlide(index - 1);  });

  dots.forEach(dot => {
    dot.addEventListener("click", e => {
      let targetIndex = Number(e.target.dataset.index) + 1;
      moveToSlide(targetIndex);
      resetTimer();
    });
  });

  slides.addEventListener('transitionend', () => {
    slideImages = wrapper.querySelectorAll(".slide");
    if (slideImages[index].querySelector('img').classList.contains('clone-first')) {
      slides.style.transition = 'none';
      index = 1;
      slides.style.transform = `translateX(${-size * index}px)`;
    }
    if (slideImages[index].querySelector('img').classList.contains('clone-last')) {
      slides.style.transition = 'none';
      index = slideImages.length - 2;
      slides.style.transform = `translateX(${-size * index}px)`;
    }
  });
  updateDots();
});
