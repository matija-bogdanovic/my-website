// Cal.com booking
// Paste your Cal.com link here, e.g. "matija/30min" (the part after cal.com/).
// While it's empty, the booking section shows an "email me" fallback instead.
const CAL_LINK = "matija-bogdanovic-2acp7l";

// Experience years
// Years are calculated from these start dates every time the page loads,
// so they keep counting up on their own. Per-skill dates live on each
// skill card in index.html as data-since="YYYY-MM".
const CAREER_START = "2022-01";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function yearsSince(ym) {
  const [y, m] = ym.split("-").map(Number);
  return (Date.now() - new Date(y, m - 1, 1)) / (365.25 * 24 * 60 * 60 * 1000);
}
const floorHalf = (v) => Math.floor(v * 2) / 2;

const careerYears = Math.max(1, Math.floor(yearsSince(CAREER_START)));
document.querySelectorAll("[data-career-years]").forEach((el) => {
  el.textContent = careerYears;
  if ("count" in el.dataset) el.dataset.count = careerYears;
});

const skillCards = [...document.querySelectorAll(".skill-card[data-since]")];
const skillYears = skillCards.map((card) => Math.max(0.5, floorHalf(yearsSince(card.dataset.since))));
const scaleMax = Math.max(4, Math.ceil(Math.max(...skillYears, careerYears)));

skillCards.forEach((card, i) => {
  const yrs = skillYears[i];
  const [y, m] = card.dataset.since.split("-").map(Number);
  const num = card.querySelector("[data-count-decimal]");
  num.dataset.countDecimal = String(yrs);
  num.textContent = yrs;

  const meter = card.querySelector(".exp-meter");
  meter.style.setProperty("--fill", `${(yrs / scaleMax) * 100}%`);
  meter.style.setProperty("--n", scaleMax);
  const labels = Array.from({ length: scaleMax }, (_, k) => `<span>${k + 1}y${k + 1 === scaleMax ? "+" : ""}</span>`).join("");
  meter.innerHTML = `
    <div class="exp-track" role="meter" aria-label="Years of experience" aria-valuemin="0" aria-valuemax="${scaleMax}" aria-valuenow="${yrs}"><span class="exp-fill"></span></div>
    <div class="exp-scale" aria-hidden="true">${labels}</div>
    <p class="exp-since">Since ${MONTHS[m - 1]} ${y}</p>`;
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// Footer year
document.getElementById("date").textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("open", open);
}

toggle.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// Hide logos that fail to load, leaving the text label
document.querySelectorAll(".logo img, .float-badge img, .service-icon img").forEach((img) => {
  img.addEventListener("error", () => img.remove());
  if (img.complete && img.naturalWidth === 0) img.remove();
});

// Highlight the nav link for the section in view
const links = [...nav.querySelectorAll('a[href^="#"]')];
const sections = links
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
// The hero matches no link, so scrolling back to the top clears the highlight
sections.push(document.querySelector(".hero"));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => navObserver.observe(s));

// Fade elements in as they scroll into view
const revealTargets = document.querySelectorAll(".section-title, .card, .panel, .service, .contact-card, .about-text");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealTargets.forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// Rotating word in the hero headline
const rotator = document.querySelector(".rotator");
const words = ["come to life.", "feel great.", "run anywhere.", "scale."];
if (rotator && !reduceMotion) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    rotator.innerHTML = `<span>${words[i]}</span>`;
  }, 2600);
}

// Count-up stats
const counters = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    if (!reduceMotion) requestAnimationFrame(step);
    setTimeout(() => (el.textContent = target), 1400); // settle even if frames are throttled
    countObserver.unobserve(el);
  });
});
counters.forEach((c) => countObserver.observe(c));

// Pointer effects (desktop only)
if (finePointer && !reduceMotion) {
  // 3D tilt on the hero photo
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });

  // Spotlight that follows the cursor on cards
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Magnetic buttons
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// Carousels (Swiper)
if (window.Swiper) {
  // Infinite, draggable logo marquees
  document.querySelectorAll(".logo-swiper").forEach((el) => {
    // Duplicate slides so the loop always has enough to fill wide screens
    const wrapper = el.querySelector(".swiper-wrapper");
    wrapper.innerHTML += wrapper.innerHTML;

    new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: 14,
      loop: true,
      speed: reduceMotion ? 0 : 5000,
      allowTouchMove: true,
      freeMode: { enabled: true, momentum: true },
      grabCursor: true,
      autoplay: reduceMotion
        ? false
        : {
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            reverseDirection: el.dataset.direction === "rtl",
          },
    });
  });

}

// Cal.com inline embed (only loads once CAL_LINK is set, and only when
// the booking section is close to the screen, so it doesn't slow down the page)
function loadCal() {
  (function (C, A, L) {
    const p = (a, ar) => a.q.push(ar);
    const d = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal;
      const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#4f5bd5";
  Cal("init", "book", { origin: "https://cal.com" });
  Cal.ns.book("inline", {
    elementOrSelector: "#cal-inline",
    calLink: CAL_LINK,
    config: { layout: "month_view" },
  });
  Cal.ns.book("ui", {
    hideEventTypeDetails: false,
    layout: "month_view",
    cssVarsPerTheme: {
      light: { "cal-brand": "#4f5bd5" },
      dark: { "cal-brand": accent },
    },
  });
  document.querySelector(".book-embed").classList.add("is-live");
}
if (CAL_LINK) {
  const bookSection = document.getElementById("book");
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    loadCal();
  }, { rootMargin: "800px 0px" }).observe(bookSection);
}

// Journey timeline: the line fills and the dot follows the scroll position
const scrollTimelines = [...document.querySelectorAll("[data-scroll-timeline]")];
function updateTimelines() {
  const anchor = window.innerHeight * 0.55; // the point on screen the dot tracks
  scrollTimelines.forEach((tl) => {
    const r = tl.getBoundingClientRect();
    const progress = Math.min(Math.max((anchor - r.top) / r.height, 0), 1);
    tl.style.setProperty("--progress", progress.toFixed(4));

    const runnerY = r.top + 8 + (r.height - 16) * progress;
    const cards = [...tl.querySelectorAll(".card")];
    let current = null;
    cards.forEach((card) => {
      const dotY = card.getBoundingClientRect().top + 30;
      const reached = runnerY >= dotY;
      card.classList.toggle("is-reached", reached);
      if (reached) current = card;
    });
    cards.forEach((card) => card.classList.toggle("is-current", card === current && progress < 1));
  });
}
let timelineTicking = false;
window.addEventListener("scroll", () => {
  if (timelineTicking) return;
  timelineTicking = true;
  requestAnimationFrame(() => {
    updateTimelines();
    timelineTicking = false;
  });
}, { passive: true });
window.addEventListener("resize", updateTimelines);
updateTimelines();

// Skill cards: fill the meter segments and count up the years when they scroll into view
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    card.classList.add("in-view");
    const num = card.querySelector("[data-count-decimal]");
    if (num && !reduceMotion) {
      const target = parseFloat(num.dataset.countDecimal);
      const decimals = num.dataset.countDecimal.includes(".") ? 1 : 0;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 1000, 1);
        num.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => (num.textContent = num.dataset.countDecimal), 1200);
    }
    skillObserver.unobserve(card);
  });
}, { threshold: 0.4 });
document.querySelectorAll(".skill-card").forEach((c) => skillObserver.observe(c));

// Signature: draw each stroke in order when it scrolls into view
const signature = document.querySelector(".signature-svg");
if (signature && !reduceMotion) {
  const paths = [...signature.querySelectorAll("path")];
  const lengths = paths.map((p) => p.getTotalLength());
  const total = lengths.reduce((a, b) => a + b, 0);
  const duration = 2.4; // seconds for the whole signature
  let delay = 0;
  paths.forEach((p, i) => {
    const dur = (lengths[i] / total) * duration;
    p.style.strokeDasharray = lengths[i];
    p.style.strokeDashoffset = lengths[i];
    p.style.setProperty("--dur", `${dur}s`);
    p.style.setProperty("--delay", `${delay}s`);
    delay += dur + 0.06; // tiny pause as if lifting the pen
  });
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    paths.forEach((p) => (p.style.strokeDashoffset = 0));
    obs.disconnect();
  }, { threshold: 0.6 }).observe(signature);
}

// Contact card: play the hand-drawn sequence once it's in view
const sketch = document.querySelector("[data-sketch]");
if (sketch) {
  const motion = sketch.querySelector(".sk-motion");
  const play = () => {
    sketch.classList.add("is-drawn");
    if (motion && !reduceMotion) setTimeout(() => motion.beginElement(), 1700);
  };
  if (reduceMotion) {
    play();
    motion?.setAttribute("dur", "0.01s");
    motion?.beginElement();
  } else {
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      play();
    }, { threshold: 0.45 }).observe(sketch);
  }
}

// Dashed arrow from the paper note to the "Book a call" button.
// Measured from the real layout so it always lands on the button.
function drawPointer() {
  const card = document.querySelector("[data-sketch]");
  const svg = card?.querySelector(".sk-pointer");
  const note = card?.querySelector(".sk-note");
  const btn = card?.querySelector("[data-pointer-target]");
  if (!svg || !note || !btn) return;

  // offset* values ignore CSS transforms, so this works before the note pops in
  const pos = (el) => {
    let x = 0, y = 0, n = el;
    while (n && n !== card) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const n = pos(note), b = pos(btn);
  svg.setAttribute("viewBox", `0 0 ${card.offsetWidth} ${card.offsetHeight}`);

  let start, end, c1, c2;
  if (n.y > b.y + b.h) {
    // note sits below the button (phones): curve up to the button's underside
    start = { x: n.x + n.w * 0.72, y: n.y + 6 };
    end = { x: b.x + b.w * 0.62, y: b.y + b.h + 12 };
    c1 = { x: start.x + 40, y: start.y - 10 };
    c2 = { x: end.x + 30, y: end.y + 28 };
  } else {
    // note sits to the left: swoop right into the button's left edge
    start = { x: n.x + n.w - 8, y: n.y + 34 };
    end = { x: b.x - 12, y: b.y + b.h / 2 };
    c1 = { x: start.x + 45, y: start.y + 18 };
    c2 = { x: end.x - 50, y: end.y + 26 };
  }
  const d = `M${start.x},${start.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`;
  svg.querySelector(".sk-pointer-line").setAttribute("d", d);
  svg.querySelector(".sk-pointer-reveal").setAttribute("d", d);

  // arrowhead follows the curve's direction at the tip
  const ang = Math.atan2(end.y - c2.y, end.x - c2.x);
  const len = 13, spread = Math.PI / 6;
  const a1 = { x: end.x - len * Math.cos(ang - spread), y: end.y - len * Math.sin(ang - spread) };
  const a2 = { x: end.x - len * Math.cos(ang + spread), y: end.y - len * Math.sin(ang + spread) };
  svg.querySelector(".sk-pointer-head").setAttribute("d", `M${a1.x},${a1.y} L${end.x},${end.y} L${a2.x},${a2.y}`);
}
drawPointer();
window.addEventListener("resize", drawPointer);
document.fonts?.ready.then(drawPointer);

// Certifications: native scroll carousel (trackpad, swipe, drag, arrows, keys)
// that gently advances on its own and loops, pausing while you interact.
(function certCarousel() {
  const track = document.querySelector(".cert-track");
  if (!track) return;
  const prev = document.querySelector(".cert-prev");
  const next = document.querySelector(".cert-next");
  const step = () => {
    const slide = track.querySelector(".cert-slide");
    return slide ? slide.getBoundingClientRect().width + 20 : 340;
  };
  const max = () => track.scrollWidth - track.clientWidth;
  const go = (dir) => {
    const atEnd = track.scrollLeft >= max() - 4;
    const atStart = track.scrollLeft <= 4;
    const left = dir > 0 && atEnd ? 0 : dir < 0 && atStart ? max() : track.scrollLeft + dir * step();
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const update = () => {
    track.classList.toggle("fade-left", track.scrollLeft > 4);
    track.classList.toggle("fade-right", track.scrollLeft < max() - 4);
  };
  prev.addEventListener("click", () => { go(-1); pause(); });
  next.addEventListener("click", () => { go(1); pause(); });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); pause(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); pause(); }
  });

  // Mouse drag; a drag doesn't count as a click on the certificate link
  let down = false, moved = false, startX = 0, startScroll = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add("dragging"); }
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    track.classList.remove("dragging");
    if (moved) {
      const s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduceMotion ? "auto" : "smooth" });
      pause();
    }
  });
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);

  // Gentle auto-advance; any interaction pauses it for a while
  let timer = null, resumeAt = 0, hovering = false;
  const pause = (ms = 6000) => { resumeAt = Date.now() + ms; };
  track.addEventListener("pointerenter", () => (hovering = true));
  track.addEventListener("pointerleave", () => (hovering = false));
  track.addEventListener("focusin", () => pause(10000));
  track.addEventListener("wheel", () => pause(), { passive: true });
  track.addEventListener("touchstart", () => pause(), { passive: true });
  if (!reduceMotion) {
    timer = setInterval(() => {
      if (hovering || Date.now() < resumeAt || document.hidden) return;
      const r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return; // only while on screen
      go(1);
    }, 3500);
  }
  update();
})();
