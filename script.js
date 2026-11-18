/* =========================================================================
   ANKIT THAPA — PORTFOLIO BEHAVIOUR
   Vanilla JS, no dependencies. Everything is guarded so a section can be
   removed without breaking the rest of the page.

   1. Config            5. Scroll reveal
   2. Theme toggle      6. Neural particle field
   3. Navigation        7. Architecture tabs
   4. Contact form      8. Terminal
                        9. GitHub dashboard
   ========================================================================= */

// ---------------------------------------------------------------- config
// Paste a POST URL here to receive messages straight from the page
// (Formspree, Web3Forms, your own function…). While empty, submitting
// opens the visitor's email app with the message pre-filled.
const FORM_ENDPOINT = "";

// Change this to your GitHub username to power the activity dashboard.
const GITHUB_USER = "ankitthapa";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------ theme toggle
// Dark is the default. <html class="light"> opts into the light variant;
// the inline <head> script applies a saved choice before first paint.
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

const syncThemeButton = () => {
  if (!themeToggle) return;

  const isLight = root.classList.contains("light");
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isLight ? "#f4f6f1" : "#090b0f");
};

syncThemeButton();

themeToggle?.addEventListener("click", () => {
  const isLight = root.classList.toggle("light");
  try {
    localStorage.setItem("theme", isLight ? "light" : "dark");
  } catch (error) {
    /* storage blocked (private mode) — the theme still applies this visit */
  }    syncThemeButton();

    // Particle colours are theme tokens, so refresh both fields
    fields.forEach((field) => field && field.updateTheme());
});

// -------------------------------------------------------------- navigation
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

const closeMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// Scroll-spy: highlight the section currently in view
const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const spySections = navLinks
  .map((link) => {
    const id = link.getAttribute("href");
    const section = id && id.length > 1 ? document.querySelector(id) : null;
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if (spySections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = spySections.find((item) => item.section === entry.target);
        if (!match) return;
        navLinks.forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });
        match.link.classList.add("active");
        match.link.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  spySections.forEach((item) => spy.observe(item.section));
}

// -------------------------------------------------------------- footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ------------------------------------------------------------- contact form
const form = document.getElementById("contactForm");

if (form) {
  const status = document.getElementById("cf-status");
  const submitBtn = document.getElementById("cf-submit");
  const sentAt = document.getElementById("cf-sentAt");
  const fields = [
    { el: document.getElementById("cf-name"), valid: (v) => v.trim().length > 1 },
    { el: document.getElementById("cf-email"), valid: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { el: document.getElementById("cf-message"), valid: (v) => v.trim().length > 5 },
  ].filter((field) => field.el);

  if (sentAt) sentAt.value = String(Date.now());

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  // force = true marks every invalid field, empty ones included (on submit);
  // on blur only fields the visitor has actually typed in are marked.
  const markValidity = (force = false) =>
    fields.forEach(({ el, valid }) => {
      if (!force && el.value === "") el.removeAttribute("aria-invalid");
      else el.setAttribute("aria-invalid", String(!valid(el.value)));
    });

  fields.forEach(({ el }) => el.addEventListener("blur", () => markValidity()));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    markValidity(true);

    // Honeypot: a real person never fills this field
    if (form.elements.company && form.elements.company.value !== "") return;

    const invalid = fields.filter(({ el, valid }) => !valid(el.value));
    if (invalid.length) {
      setStatus("Please fill in your name, a valid email, and a message.", "error");
      invalid[0].el.focus();
      return;
    }

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    // No endpoint configured: hand off to the visitor's email client
    if (!FORM_ENDPOINT) {
      const to = form.dataset.email;
      const subject = encodeURIComponent(`Website enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus("Opening your email app — press send there to deliver the message.");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    setStatus("");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message, sentAt: sentAt ? sentAt.value : "" }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      form.reset();
      if (sentAt) sentAt.value = String(Date.now());
      fields.forEach(({ el }) => el.removeAttribute("aria-invalid"));
      setStatus("Thanks — your message is on its way. I'll reply soon.", "success");
    } catch (error) {
      setStatus("Sorry, the message could not be sent. Please email me directly instead.", "error");
      console.error(error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    }
  });
}

// ------------------------------------------------------------ scroll reveal
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// ---------------------------------------------- project card pointer glow
// Sets --mx / --my so the radial highlight follows the cursor.
document.querySelectorAll(".project").forEach((card) => {
  if (reducedMotion) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

// ------------------------------------------------ neural particle field
// One small engine, two canvases: a page-wide ambient field and the
// interactive hero core. Pauses when offscreen or when the tab is hidden.

// Canvas needs RGB triplets, which CSS custom properties can hold. Reading
// them here (instead of hardcoding lime/cyan) keeps the field legible in
// both themes: the light theme uses darker particles.
function readFieldColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: (styles.getPropertyValue("--field-accent") || "198, 255, 77").trim(),
    accent2: (styles.getPropertyValue("--field-accent-2") || "66, 217, 255").trim(),
  };
}

function createNeuralField(canvas, options = {}) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const config = {
    density: 22000,
    maxParticles: 90,
    minParticles: 14,
    linkDistance: 130,
    linkAlpha: 0.3,
    speed: 0.18,
    radius: 1.7,
    pointerRadius: 150,
    pointerPull: 0.008,
    accent: "198, 255, 77",
    accent2: "66, 217, 255",
    onStats: null,
    ...options,
  };

  // CSS tokens win over the defaults above
  const palette = readFieldColors();
  config.accent = palette.accent;
  config.accent2 = palette.accent2;

  let width = 0;
  let height = 0;
  let particles = [];
  let frame = null;
  let visible = false;
  let lastTime = 0;

  const pointer = { x: -9999, y: -9999, active: false };

  const makeParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * config.speed,
    vy: (Math.random() - 0.5) * config.speed,
    r: config.radius * (0.6 + Math.random() * 0.9),
    cyan: Math.random() > 0.72,
  });

  const build = () => {
    const count = Math.max(
      config.minParticles,
      Math.min(config.maxParticles, Math.round((width * height) / config.density))
    );

    // Jittered grid: even coverage, still organic. Pure random leaves holes
    // and clumps at low particle counts.
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
    const rows = Math.max(1, Math.ceil(count / cols));

    particles = Array.from({ length: count }, (unused, index) => {
      const particle = makeParticle();
      const col = index % cols;
      const row = Math.floor(index / cols);
      particle.x =
        ((col + 0.5) / cols) * width + (Math.random() - 0.5) * (width / cols) * 0.85;
      particle.y =
        ((row + 0.5) / rows) * height + (Math.random() - 0.5) * (height / rows) * 0.85;
      return particle;
    });
  };

  // Measures the canvas, sizes its backing store and paints one frame.
  // clientWidth/Height is used first because it is reliable before the
  // first layout settles; zero sizes are retried instead of silently
  // leaving an empty canvas.
  const resize = (attempt = 0) => {
    let cssWidth = canvas.clientWidth;
    let cssHeight = canvas.clientHeight;

    if (!cssWidth || !cssHeight) {
      const rect = canvas.getBoundingClientRect();
      cssWidth = cssWidth || rect.width || canvas.parentElement?.clientWidth || 0;
      cssHeight = cssHeight || rect.height || 0;
    }

    if ((!cssWidth || !cssHeight) && attempt < 30) {
      requestAnimationFrame(() => resize(attempt + 1));
      return;
    }

    if (!cssWidth || !cssHeight) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = cssWidth;
    height = cssHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();

    // Always paint once after sizing, so the frame is never blank even if
    // the animation loop is paused, offscreen or disabled.
    draw(0);
  };

  function draw(delta) {
    ctx.clearRect(0, 0, width, height);

    let edges = 0;
    const step = Math.min(delta, 32);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (!reducedMotion) {
        p.x += p.vx * step * 0.06;
        p.y += p.vy * step * 0.06;

        // gentle drift toward the pointer
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < config.pointerRadius && dist > 0.5) {
            const force = (1 - dist / config.pointerRadius) * config.pointerPull;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // keep velocity sane
        const speed = Math.hypot(p.vx, p.vy);
        const limit = config.speed * 3;
        if (speed > limit) {
          p.vx = (p.vx / speed) * limit;
          p.vy = (p.vy / speed) * limit;
        } else if (speed < 0.02) {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        // wrap around the edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // links first, so nodes sit on top
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > config.linkDistance * config.linkDistance) continue;

        const dist = Math.sqrt(distSq);
        const alpha = (1 - dist / config.linkDistance) * config.linkAlpha;
        edges++;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${config.accent}, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      const color = p.cyan ? config.accent2 : config.accent;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${p.cyan ? 0.9 : 0.75})`;
      ctx.shadowColor = `rgba(${color}, 0.6)`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // the pointer behaves like an extra node with its own connections
    if (pointer.active) {
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist > config.pointerRadius) continue;

        const alpha = (1 - dist / config.pointerRadius) * 0.45;
        edges++;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${config.accent2}, ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${config.accent2}, 0.9)`;
      ctx.shadowColor = `rgba(${config.accent2}, 0.8)`;
      ctx.shadowBlur = 12;
      ctx.arc(pointer.x, pointer.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (config.onStats) config.onStats(particles.length, edges);
  }

  const loop = (time) => {
    frame = requestAnimationFrame(loop);
    const delta = lastTime ? time - lastTime : 16;
    lastTime = time;
    draw(delta);
  };

  const start = () => {
    if (frame !== null || reducedMotion) return;
    lastTime = 0;
    frame = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (frame === null) return;
    cancelAnimationFrame(frame);
    frame = null;
  };

  // Only animate while the canvas is on screen and the tab is visible
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    ).observe(canvas);
  } else {
    visible = true;
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  // Pointer Events cover mouse, pen and touch drags in one handler.
  const trackPointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    pointer.active = inside;
    if (inside) {
      pointer.x = x;
      pointer.y = y;
    }
  };

  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("pointerdown", trackPointer, { passive: true });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  // On touch devices the finger "leaves" on release, not on pointerleave
  window.addEventListener(
    "pointerup",
    () => {
      if (window.matchMedia("(pointer: coarse)").matches) pointer.active = false;
    },
    { passive: true }
  );

  // ResizeObserver catches layout changes, not just window resizes
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => resize()).observe(canvas);
  }

  window.addEventListener("resize", () => resize());

  // Re-read the tokens after a theme switch and repaint immediately.
  const updateTheme = () => {
    const next = readFieldColors();
    config.accent = next.accent;
    config.accent2 = next.accent2;
    draw(0);
  };

  resize();

  return { resize, updateTheme, canvas };
}

const nodeEl = document.getElementById("nodeCount");
const edgeEl = document.getElementById("edgeCount");

const fields = [];

function initNeuralFields() {
  fields.push(
    createNeuralField(document.getElementById("neuralBg"), {
      density: 34000,
      maxParticles: 64,
      minParticles: 12,
      linkDistance: 140,
      linkAlpha: 0.26,
      speed: 0.12,
      radius: 1.3,
    })
  );

  fields.push(
    createNeuralField(document.getElementById("neuralHero"), {
      density: 5200,
      maxParticles: 64,
      minParticles: 22,
      linkDistance: 132,
      linkAlpha: 0.38,
      speed: 0.16,
      radius: 2.1,
      pointerRadius: 170,
      pointerPull: 0.014,
      onStats: (nodes, edges) => {
        if (nodeEl) nodeEl.textContent = String(nodes);
        if (edgeEl) edgeEl.textContent = String(edges);
      },
    })
  );
}

// The script tag sits at the end of <body>, but this also covers being
// loaded earlier (defer / module / moved into <head>).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNeuralFields, { once: true });
} else {
  initNeuralFields();
}

// Web fonts and aspect-ratio settle after first paint on some browsers —
// re-measure once everything has loaded so the canvas can't stay 0×0.
window.addEventListener("load", () => {
  fields.forEach((field) => field && field.resize());
});



// ------------------------------------------------ architecture walkthrough
// Tab lists inside each project card. Clicking a step swaps the panel.
document.querySelectorAll("[data-pipeline]").forEach((pipeline) => {
  const tabs = Array.from(pipeline.querySelectorAll('[role="tab"]'));
  const panels = Array.from(pipeline.querySelectorAll('[role="tabpanel"]'));
  if (!tabs.length) return;

  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (panels[i]) panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        select(index === last ? 0 : index + 1, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        select(index === 0 ? last : index - 1, true);
      } else if (event.key === "Home") {
        event.preventDefault();
        select(0, true);
      } else if (event.key === "End") {
        event.preventDefault();
        select(last, true);
      }
    });
  });

  select(0);
});

// -------------------------------------------------------------- terminal
const termForm = document.getElementById("termForm");
const termInput = document.getElementById("termInput");
const termOutput = document.getElementById("termOutput");
const termWindow = document.getElementById("terminalWindow");

if (termForm && termInput && termOutput) {
  // Content mirrors the page, so the terminal never tells a different story.
  const TERM_DATA = {
    name: "Er. Ankit Thapa",
    role: "AI Engineer | ML Enthusiast",
    location: "Kathmandu, Nepal (UTC+5:45)",
    availability: "open to internships and junior roles",
    skills: [
      ["programming", "Python, SQL basics"],
      ["machine learning", "scikit-learn, feature engineering, model evaluation"],
      ["deep learning", "PyTorch, CNNs, training loops"],
      ["generative ai", "LLM APIs, prompt design, retrieval (RAG)"],
      ["data science", "NumPy, pandas, Matplotlib"],
      ["tools", "Git & GitHub, Jupyter Notebook, VS Code"],
      ["deployment", "Streamlit (and learning the rest)"],
    ],
    projects: [
      ["AI Study Assistant", "2025", "Python, LLM APIs, Streamlit — retrieval-augmented Q&A over personal notes"],
      ["Movie Recommendation System", "2025", "pandas, scikit-learn, Streamlit — content-based recommender"],
      ["Handwritten Digit Classifier", "2024", "PyTorch, NumPy, Matplotlib — CNN trained on MNIST"],
    ],
    research: [
      "A Lightweight Hardware Architecture for Energy-Efficient Edge AI Inference",
      "Performance and Energy Optimization of RISC-V Processors for Edge AI Applications",
      "Reducing Data Movement in Edge AI Through Compute-in-Memory Architecture",
    ],
    contact: {
      email: "ankitthapa83.dev@gmail.com",
      github: "https://github.com/ankitthapa",
      linkedin: "https://www.linkedin.com/in/ankitthapa",
      x: "https://x.com/ankitthapa",
    },
  };

  const prompt = "ankit@neural:~$";

  const addLine = (text = "", className = "term-line") => {
    const line = document.createElement("p");
    line.className = className;
    line.textContent = text;
    termOutput.appendChild(line);
    return line;
  };

  const addRich = (parts) => {
    const line = document.createElement("p");
    line.className = "term-line";
    parts.forEach(([text, cls]) => {
      const span = document.createElement("span");
      span.textContent = text;
      if (cls) span.className = cls;
      line.appendChild(span);
    });
    termOutput.appendChild(line);
    return line;
  };

  const scrollToBottom = () => {
    termOutput.scrollTop = termOutput.scrollHeight;
  };

  const commands = {
    help() {
      addLine("available commands", "term-line term-key");
      [
        ["help", "this list"],
        ["about", "who I am and what I'm doing"],
        ["skills", "stack, grouped"],
        ["projects", "the three projects on this page"],
        ["research", "reading-log categories"],
        ["contact", "email and profiles"],
        ["clear", "wipe the screen"],
      ].forEach(([cmd, desc]) => {
        addRich([["  " + cmd.padEnd(10), "term-ok"], [desc, "term-dim"]]);
      });
      addLine("tip: ↑ / ↓ recalls earlier commands", "term-line term-dim");
    },

    about() {
      addLine(TERM_DATA.name, "term-line term-ok");
      addLine(TERM_DATA.role, "term-line term-key");
      addLine(TERM_DATA.location, "term-line term-dim");
      addLine("", "term-line term-gap");
      addLine(
        "Aspiring AI engineer working in Python across machine learning, deep learning",
        "term-line"
      );
      addLine(
        "and generative AI. Learns by building small systems and explaining how they work.",
        "term-line"
      );
      addLine("status: " + TERM_DATA.availability, "term-line term-dim");
    },

    skills() {
      addLine("stack --grouped", "term-line term-key");
      TERM_DATA.skills.forEach(([group, list]) => {
        addRich([["  " + group.padEnd(18), "term-ok"], [list, "term-dim"]]);
      });
    },

    projects() {
      addLine("projects --all", "term-line term-key");
      TERM_DATA.projects.forEach(([name, year, detail], index) => {
        addRich([["  " + String(index + 1).padStart(2, "0") + "  ", "term-dim"], [name, "term-ok"]]);
        addLine("      " + year + " · " + detail, "term-line term-dim");
      });
      addLine("repositories: " + TERM_DATA.contact.github, "term-line term-dim");
    },

    research() {
      addLine("research --edge-ai", "term-line term-key");
      TERM_DATA.research.forEach((paper, index) => {
        addRich([["  " + String(index + 1).padStart(2, "0") + "  ", "term-dim"], [paper, "term-line"]]);
      });
      addLine("summaries and personal notes are still to be written on the page.", "term-line term-dim");
    },

    contact() {
      addLine("contact --open", "term-line term-key");
      addRich([["  email    ", "term-dim"], [TERM_DATA.contact.email, "term-ok"]]);
      addRich([["  github   ", "term-dim"], [TERM_DATA.contact.github, "term-dim"]]);
      addRich([["  linkedin ", "term-dim"], [TERM_DATA.contact.linkedin, "term-dim"]]);
      addRich([["  x        ", "term-dim"], [TERM_DATA.contact.x, "term-dim"]]);
      addLine("scroll to #contact for the form.", "term-line term-dim");
    },

    clear() {
      termOutput.textContent = "";
    },
  };

  const history = [];
  let historyIndex = -1;

  const runCommand = (raw) => {
    const input = raw.trim();

    addRich([[prompt + " ", "term-key"], [input, "term-cmd"]]);

    if (!input) {
      scrollToBottom();
      return;
    }

    history.push(input);
    historyIndex = history.length;

    const command = input.split(/\s+/)[0].toLowerCase();

    if (command === "clear") {
      commands.clear();
      return;
    }

    if (Object.prototype.hasOwnProperty.call(commands, command)) {
      commands[command]();
    } else if (command === "ls") {
      addLine("about  skills  projects  research  contact", "term-line term-dim");
      addLine("try `help` for the documented commands", "term-line term-dim");
    } else {
      addLine("command not found: " + command, "term-line term-err");
      addLine("type `help` to see what this shell accepts", "term-line term-dim");
    }

    addLine("", "term-line term-gap");
    scrollToBottom();
  };

  termForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runCommand(termInput.value);
    termInput.value = "";
  });

  termInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      termInput.value = history[historyIndex] || "";
    } else if (event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      termInput.value = history[historyIndex] || "";
    }
  });

  termWindow?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) return;
    if (window.getSelection()?.toString()) return;
    termInput.focus();
  });
}

// ------------------------------------------------------ GitHub dashboard
// Public API, no token. Fails quietly: the section still shows a link out.
const ghRepoList = document.getElementById("ghRepoList");

if (ghRepoList) {
  const ghStatus = document.getElementById("ghReposStatus");
  const ghProfileLink = document.getElementById("ghProfileLink");
  const profileUrl = `https://github.com/${GITHUB_USER}`;

  const setStatus = (message) => {
    if (ghStatus) ghStatus.textContent = message;
  };

  const skeleton = () => {
    ghRepoList.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const block = document.createElement("div");
      block.className = "gh-skeleton";
      block.setAttribute("aria-hidden", "true");
      ghRepoList.appendChild(block);
    }
  };

  const showState = (html, message) => {
    ghRepoList.innerHTML = "";
    const state = document.createElement("p");
    state.className = "gh-state";
    state.innerHTML = html;
    ghRepoList.appendChild(state);
    setStatus(message);
  };

  // Keeps the profile card honest when the API can't be read.
  const profileUnavailable = (message) => {
    const bioEl = document.getElementById("ghBio");
    if (bioEl) bioEl.textContent = message;
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  };

  const renderRepos = (repos) => {
    ghRepoList.innerHTML = "";

    repos.forEach((repo) => {
      const card = document.createElement("a");
      card.className = "gh-repo";
      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener";

      const name = document.createElement("span");
      name.className = "gh-repo-name";
      name.textContent = repo.name;
      card.appendChild(name);

      if (repo.description) {
        const desc = document.createElement("span");
        desc.className = "gh-repo-desc";
        desc.textContent = repo.description;
        card.appendChild(desc);
      }

      const meta = document.createElement("span");
      meta.className = "gh-repo-meta";

      if (repo.language) {
        const lang = document.createElement("span");
        lang.className = "gh-lang";
        const dot = document.createElement("i");
        lang.append(dot, document.createTextNode(repo.language));
        meta.appendChild(lang);
      }

      if (typeof repo.stargazers_count === "number") {
        const stars = document.createElement("span");
        stars.textContent = `★ ${repo.stargazers_count}`;
        meta.appendChild(stars);
      }

      const updated = document.createElement("span");
      updated.textContent = "updated " + formatDate(repo.updated_at);
      meta.appendChild(updated);

      card.appendChild(meta);
      ghRepoList.appendChild(card);
    });
  };

  const applyProfile = (user) => {
    const nameEl = document.getElementById("ghName");
    const loginEl = document.getElementById("ghLogin");
    const bioEl = document.getElementById("ghBio");
    const avatar = document.getElementById("ghAvatar");
    const avatarWrap = document.getElementById("ghAvatarWrap");
    const reposEl = document.getElementById("ghRepos");
    const followersEl = document.getElementById("ghFollowers");
    const followingEl = document.getElementById("ghFollowing");

    if (nameEl) nameEl.textContent = user.name || user.login;
    if (loginEl) {
      loginEl.textContent = "@" + user.login;
      loginEl.href = user.html_url || profileUrl;
    }
    if (bioEl) bioEl.textContent = user.bio || "No bio on GitHub yet.";
    if (reposEl) reposEl.textContent = String(user.public_repos ?? "—");
    if (followersEl) followersEl.textContent = String(user.followers ?? "—");
    if (followingEl) followingEl.textContent = String(user.following ?? "—");

    if (avatar && user.avatar_url) {
      avatar.src = user.avatar_url;
      avatar.hidden = false;
      avatar.alt = `${user.login} on GitHub`;
      avatar.addEventListener("load", () => {
        if (avatarWrap) avatarWrap.classList.add("has-image");
      });
      avatar.addEventListener("error", () => {
        avatar.hidden = true;
      });
    }

    if (ghProfileLink) ghProfileLink.href = user.html_url || profileUrl;
  };

  const loadGitHub = async () => {
    skeleton();
    setStatus("Loading…");

    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USER}`, {
          headers: { Accept: "application/vnd.github+json" },
        }),
        fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6&type=owner`,
          { headers: { Accept: "application/vnd.github+json" } }
        ),
      ]);

      if (userResponse.status === 404) {
        profileUnavailable("No public GitHub profile found for this username.");
        showState(
          `No public GitHub account found for <b>@${GITHUB_USER}</b>. Set <code>GITHUB_USER</code> in script.js to your username.`,
          "Unavailable"
        );
        return;
      }

      if (userResponse.status === 403 || reposResponse.status === 403) {
        profileUnavailable("Live profile data is rate limited right now — the link below still works.");
        showState(
          `The GitHub API rate limit was reached. <a href="${profileUrl}" target="_blank" rel="noopener">Open the profile</a> to browse repositories directly.`,
          "Rate limited"
        );
        return;
      }

      if (!userResponse.ok || !reposResponse.ok) {
        throw new Error(`GitHub responded ${userResponse.status}/${reposResponse.status}`);
      }

      const [user, repos] = await Promise.all([userResponse.json(), reposResponse.json()]);
      applyProfile(user);

      const visible = Array.isArray(repos) ? repos.slice(0, 6) : [];

      if (!visible.length) {
        showState(
          `No public repositories returned for <b>@${GITHUB_USER}</b> yet. <a href="${profileUrl}" target="_blank" rel="noopener">View the profile</a>.`,
          "No repositories"
        );
        return;
      }

      renderRepos(visible);
      setStatus(`Updated from GitHub`);
    } catch (error) {
      console.warn("GitHub dashboard unavailable:", error);
      profileUnavailable("Live GitHub data is unavailable right now.");
      showState(
        `Live GitHub data is unavailable right now. <a href="${profileUrl}" target="_blank" rel="noopener">Open the profile on GitHub</a>.`,
        "Offline"
      );
    }
  };

  if ("IntersectionObserver" in window) {
    const ghObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        ghObserver.disconnect();
        loadGitHub();
      },
      { rootMargin: "200px" }
    );
    ghObserver.observe(ghRepoList);
  } else {
    loadGitHub();
  }
}

