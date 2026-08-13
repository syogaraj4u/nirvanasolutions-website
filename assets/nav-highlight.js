(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const links = [...header.querySelectorAll('a[href="/#services"], a[href="/#products"], a[href="/about/"], a[href="/contact/"]')];
  if (!links.length) return;

  const setActive = (href, currentValue = "location") => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === href;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", currentValue);
      else link.removeAttribute("aria-current");
    });
  };

  const path = window.location.pathname;

  if (path.startsWith("/services/")) {
    setActive("/#services", "page");
    return;
  }

  if (path.startsWith("/about/")) {
    setActive("/about/", "page");
    return;
  }

  if (path.startsWith("/contact/")) {
    setActive("/contact/", "page");
    return;
  }

  if (path !== "/" && !path.endsWith("/index.html")) {
    setActive(null);
    return;
  }

  const sections = [...document.querySelectorAll("main > section")];
  const hrefBySection = {
    services: "/#services",
    products: "/#products",
    contact: "/contact/",
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
    window.requestAnimationFrame(updateFromScroll);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  updateFromScroll();
})();
