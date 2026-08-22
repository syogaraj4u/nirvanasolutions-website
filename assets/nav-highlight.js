(() => {
  const isLocalFile = window.location.protocol === "file:";
  const header = document.querySelector(".site-header");
  if (!header) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sectionFromHref = (href = "") => {
    const cleanHref = href.split("?")[0].toLowerCase();
    if (cleanHref.includes("#services")) return "services";
    if (cleanHref.includes("#products")) return "products";
    if (cleanHref.includes("/about/")) return "about";
    if (cleanHref.includes("/contact/")) return "contact";
    return "";
  };

  const links = [...header.querySelectorAll("a[href]")].filter((link) => sectionFromHref(link.getAttribute("href") || "") !== "");

  const setActive = (target, currentValue = "location") => {
    links.forEach((link) => {
      const active = sectionFromHref(link.getAttribute("href") || "") === target;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", currentValue);
      else link.removeAttribute("aria-current");
    });
  };

  const path = window.location.pathname;
  const isHomePage = isLocalFile ? (path === "/" || path === "/index.html" || path.endsWith("/index.html")) : (path === "/" || path === "/index.html");

  if (links.length) {
    if (path.startsWith("/services/")) setActive("services", "page");
    else if (path.startsWith("/about/")) setActive("about", "page");
    else if (path.startsWith("/contact/")) setActive("contact", "page");
  }

  const progress = (() => {
    const wrap = document.createElement("div");
    const bar = document.createElement("span");
    wrap.className = "scroll-progress";
    wrap.setAttribute("aria-hidden", "true");
    wrap.appendChild(bar);
    document.body.prepend(wrap);
    return bar;
  })();

  const mobileMenu = header.querySelector(".mobile-menu");
  const menuLinks = mobileMenu ? mobileMenu.querySelectorAll("a[href]") : [];
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!mobileMenu.open) return;
      mobileMenu.open = false;
    });
  });

  const addRevealAnimations = () => {
    if (reduceMotion) return;
    const revealNodes = [...document.querySelectorAll(".reveal")];
    if (!revealNodes.length) return;
    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        node.classList.add("is-visible");
        obs.unobserve(node);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    revealNodes.forEach((node) => revealObserver.observe(node));
  };

  const addBackToTop = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = "↑";
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.append(button);
    return button;
  };

  const toTop = addBackToTop();
  const toggleBackToTop = () => {
    if (!toTop) return;
    toTop.classList.toggle("is-visible", window.scrollY > 620);
  };

  const countNodes = [...document.querySelectorAll(".count-up[data-count]")];
  const animateCount = (node) => {
    const target = Number.parseFloat(node.dataset.count || "0");
    const duration = Number.parseInt(node.dataset.duration || "900", 10);
    const decimals = Number.parseInt(node.dataset.decimals || "0", 10);
    const prefix = node.dataset.prefix || "";
    const suffix = node.dataset.suffix || "";
    const start = performance.now();
    const initial = 0;
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 2.6);
      const value = Number(initial + (target - initial) * eased);
      node.textContent = `${prefix}${formatter.format(decimals ? Number.parseFloat(value.toFixed(decimals)) : Math.round(value))}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = isLocalFile || isHomePage ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      if (node.dataset.countStarted) return;
      node.dataset.countStarted = "1";
      animateCount(node);
    });
  }, { threshold: 0.4 }) : null;

  if (observer && countNodes.length) {
    countNodes.forEach((node) => {
      observer.observe(node);
    });
  }

  addRevealAnimations();

  if (isHomePage) {
    const sections = [...document.querySelectorAll("main > section")];
    const hrefBySection = {
      services: "services",
      products: "products",
      contact: "contact",
    };

    let scheduled = false;
    const updateFromScroll = () => {
      scheduled = false;
      const activationLine = header.getBoundingClientRect().height + Math.min(160, window.innerHeight * .18);
      const section = sections.find((item) => {
        const rect = item.getBoundingClientRect();
        return rect.top <= activationLine && rect.bottom > activationLine;
      });
      setActive(section ? hrefBySection[section.id] : null);
    };

    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const pct = (window.scrollY / total) * 100;
        progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;
        header.classList.toggle("is-scrolled", window.scrollY > 8);
        toggleBackToTop();
        updateFromScroll();
      });
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    scheduleUpdate();
    return;
  }

  if (isLocalFile) {
    const localLinks = [...document.querySelectorAll("a[href]")];
    localLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http") || href.startsWith("//")) return;
      if (href.startsWith("/")) link.setAttribute("href", `.${href}`);
      if (href.startsWith("./")) link.setAttribute("href", href);
    });
  }

  if (!isHomePage) {
    const pageTarget = path.includes("/services/") ? "services" : path.includes("/about/") ? "about" : path.includes("/contact/") ? "contact" : null;

    const onScroll = () => {
      progress.style.width = "0%";
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      toggleBackToTop();
      setActive(pageTarget, "page");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  } else {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    toggleBackToTop();
  }
})();
