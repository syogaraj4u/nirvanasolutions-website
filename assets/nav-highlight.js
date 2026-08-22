(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const precisePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const isHomePage = Boolean(document.querySelector("main .hero"));

  const sectionFromHref = (href = "") => {
    const cleanHref = href.split("?")[0].toLowerCase();
    if (cleanHref.includes("#services")) return "services";
    if (cleanHref.includes("#work")) return "work";
    if (cleanHref.includes("#products")) return "products";
    if (cleanHref.includes("#contact") || cleanHref.includes("/contact/"))
      return "contact";
    if (cleanHref.includes("/about/")) return "about";
    return "";
  };

  const navLinks = [...header.querySelectorAll("a[href]")].filter((link) =>
    sectionFromHref(link.getAttribute("href")),
  );
  const setActive = (target, currentValue = "location") => {
    navLinks.forEach((link) => {
      const active = sectionFromHref(link.getAttribute("href")) === target;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", currentValue);
      else link.removeAttribute("aria-current");
    });
  };

  const progressWrap = document.createElement("div");
  const progressBar = document.createElement("span");
  progressWrap.className = "scroll-progress";
  progressWrap.setAttribute("aria-hidden", "true");
  progressWrap.append(progressBar);
  document.body.prepend(progressWrap);

  const mobileMenu = header.querySelector(".mobile-menu");
  mobileMenu?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.open = false;
    });
  });

  const addRevealAnimations = () => {
    const revealNodes = [...document.querySelectorAll(".reveal")];
    if (!revealNodes.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  };

  const addBackToTop = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "↑";
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    document.body.append(button);
    return button;
  };

  const toTop = addBackToTop();

  const animateCount = (node) => {
    const target = Number.parseFloat(node.dataset.count || "0");
    const duration = Number.parseInt(node.dataset.duration || "900", 10);
    const decimals = Number.parseInt(node.dataset.decimals || "0", 10);
    const prefix = node.dataset.prefix || "";
    const suffix = node.dataset.suffix || "";
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const render = (value) => {
      const rounded = decimals
        ? Number.parseFloat(value.toFixed(decimals))
        : Math.round(value);
      node.textContent = `${prefix}${formatter.format(rounded)}${suffix}`;
    };

    if (reduceMotion) {
      render(target);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      render(target * (1 - Math.pow(1 - progress, 2.6)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const setupCounters = () => {
    const nodes = [...document.querySelectorAll(".count-up[data-count]")];
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(animateCount);
      return;
    }
    const observer = new IntersectionObserver(
      (entries, countObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.countStarted)
            return;
          entry.target.dataset.countStarted = "true";
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.45 },
    );
    nodes.forEach((node) => observer.observe(node));
  };

  const setupHeroModes = () => {
    const panel = document.querySelector(".hero-mode-panel");
    const buttons = [...document.querySelectorAll("[data-hero-mode]")];
    if (!panel || !buttons.length) return;

    const modeContent = {
      web: {
        kicker: "Conversion-led web experiences",
        title: "Fast, clear and built to earn attention.",
        tags: ["Responsive", "Accessible", "SEO-ready"],
        label: "Website experience",
      },
      software: {
        kicker: "Software shaped around the work",
        title: "Reliable systems that simplify complex operations.",
        tags: ["Custom workflows", "Integrations", "Scalable"],
        label: "Business platform",
      },
      mobile: {
        kicker: "Mobile products people enjoy",
        title: "Focused app experiences from prototype to launch.",
        tags: ["iOS", "Android", "Cross-platform"],
        label: "Mobile product",
      },
      ai: {
        kicker: "Practical intelligence, thoughtfully applied",
        title: "AI automation grounded in a valuable use case.",
        tags: ["Automation", "Knowledge", "Assistants"],
        label: "Intelligent workflow",
      },
    };

    const kicker = panel.querySelector("[data-hero-kicker]");
    const title = panel.querySelector("[data-hero-title]");
    const tags = panel.querySelector("[data-hero-tags]");
    const label = panel.querySelector("[data-studio-label]");

    const selectMode = (button, focus = false) => {
      const mode = button.dataset.heroMode;
      const content = modeContent[mode];
      if (!content) return;
      buttons.forEach((item) =>
        item.setAttribute("aria-selected", String(item === button)),
      );
      panel.className = `hero-mode-panel mode-${mode}`;
      panel.setAttribute("aria-labelledby", button.id);
      kicker.textContent = content.kicker;
      title.textContent = content.title;
      label.textContent = content.label;
      tags.replaceChildren(
        ...content.tags.map((item) => {
          const span = document.createElement("span");
          span.textContent = item;
          return span;
        }),
      );
      if (focus) button.focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => selectMode(button));
      button.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight")
          nextIndex = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft")
          nextIndex = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = buttons.length - 1;
        else return;
        event.preventDefault();
        selectMode(buttons[nextIndex], true);
      });
    });
  };

  const setupPointerGlow = () => {
    if (reduceMotion || !precisePointer) return;
    document.querySelectorAll("[data-glow]").forEach((item) => {
      item.addEventListener(
        "pointermove",
        (event) => {
          const rect = item.getBoundingClientRect();
          item.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
          item.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
        },
        { passive: true },
      );
      item.addEventListener(
        "pointerleave",
        () => {
          item.style.setProperty("--glow-x", "50%");
          item.style.setProperty("--glow-y", "50%");
        },
        { passive: true },
      );
    });
  };

  const setupProjectForm = () => {
    const form = document.querySelector("#project-enquiry");
    const status = document.querySelector("#form-status");
    if (!form || !status) return;

    form.addEventListener("input", (event) => {
      event.target.removeAttribute?.("aria-invalid");
      status.textContent = "";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form
        .querySelectorAll("[aria-invalid]")
        .forEach((field) => field.removeAttribute("aria-invalid"));

      if (!form.checkValidity()) {
        const invalid = form.querySelector(":invalid");
        invalid?.setAttribute("aria-invalid", "true");
        invalid?.focus();
        status.textContent =
          "Please complete the highlighted fields before continuing.";
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const company = String(data.get("company") || "").trim();
      const service = String(data.get("service") || "").trim();
      const budget = String(data.get("budget") || "").trim();
      const timeline = String(data.get("timeline") || "").trim();
      const details = String(data.get("details") || "").trim();
      const message = [
        "Hello Nirvana Solutions, I would like to discuss a project.",
        "",
        `Name: ${name}`,
        company ? `Company: ${company}` : "",
        `Project type: ${service}`,
        `Estimated budget: ${budget}`,
        `Preferred timeline: ${timeline}`,
        details ? `Goal: ${details}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const whatsappUrl = `https://wa.me/918686839018?text=${encodeURIComponent(message)}`;
      status.textContent =
        "Opening WhatsApp with your enquiry ready for review…";
      const conversation = window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!conversation) window.location.assign(whatsappUrl);
    });
  };

  const currentPath = window.location.pathname.toLowerCase();
  const pageTarget = currentPath.includes("/services/")
    ? "services"
    : currentPath.includes("/about/")
      ? "about"
      : currentPath.includes("/contact/")
        ? "contact"
        : /\/(gst-calci|barcode-scanner|anydigit-calculator|calculate-smart)\//.test(
              currentPath,
            )
          ? "products"
          : null;

  const homeSections = isHomePage
    ? [...document.querySelectorAll("main > section[id]")]
    : [];
  const sectionTargets = {
    services: "services",
    work: "work",
    products: "products",
    contact: "contact",
  };
  let scrollScheduled = false;

  const updateScrollState = () => {
    scrollScheduled = false;
    const total = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    progressBar.style.width = `${Math.max(0, Math.min(100, (window.scrollY / total) * 100))}%`;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    toTop.classList.toggle("is-visible", window.scrollY > 620);

    if (!isHomePage) {
      setActive(pageTarget, "page");
      return;
    }

    const activationLine =
      header.getBoundingClientRect().height +
      Math.min(160, window.innerHeight * 0.18);
    const activeSection = homeSections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= activationLine && rect.bottom > activationLine;
    });
    setActive(activeSection ? sectionTargets[activeSection.id] : null);
  };

  const scheduleScrollUpdate = () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScrollState);
  };

  addRevealAnimations();
  setupCounters();
  setupHeroModes();
  setupPointerGlow();
  setupProjectForm();
  updateScrollState();
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("hashchange", scheduleScrollUpdate);
})();
