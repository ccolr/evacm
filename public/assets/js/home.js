const pageProfiles = new Set(["shelter", "cat", "star"]);
const pageByHostname = Object.freeze({
  "she.eva.cm": "shelter",
  "cat.eva.cm": "cat",
  "star.eva.cm": "star",
});
const localHostnames = new Set(["127.0.0.1", "localhost"]);
const sites = Object.freeze([
  {
    key: "cat",
    label: "猫の恩返し · The Cat Returns",
    url: "https://cat.eva.cm/",
  },
  {
    key: "shelter",
    label: "避难所 · Shelter",
    url: "https://she.eva.cm/",
  },
  {
    key: "star",
    label: "星之声 · ほしのこえ",
    url: "https://star.eva.cm/",
  },
]);
const pageShell = document.querySelector("#pageShell");

function resolveActiveHomePage() {
  const hostname = window.location.hostname.toLowerCase();
  const productionPage = pageByHostname[hostname];
  if (productionPage) return productionPage;

  if (localHostnames.has(hostname)) {
    const previewPage = new URLSearchParams(window.location.search).get("page");
    return pageProfiles.has(previewPage) ? previewPage : "shelter";
  }

  throw new Error(`Unsupported hostname: ${hostname}`);
}

const activeHomePage = resolveActiveHomePage();

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Missing page element: ${selector}`);
  element.textContent = value;
}

function validatePageProfile(profile) {
  const requiredFields = [
    "documentTitle",
    "pageTitle",
    "videoHeading",
    "sectionTitle",
    "description",
    "footer",
    "poster",
    "streamSource",
  ];

  if (!requiredFields.every((field) => typeof profile[field] === "string")) {
    throw new Error("The selected page profile is incomplete.");
  }
}

function renderSiteSwitcher(currentLabel) {
  const siteSwitcher = document.querySelector("#siteSwitcher");
  const currentSite = sites.find((site) => site.key === activeHomePage);
  const linkedSites = sites.filter((site) => site.key !== activeHomePage);
  if (!siteSwitcher || !currentSite || linkedSites.length !== 2) {
    throw new Error("Unable to build the site switcher.");
  }

  const orderedSites = [linkedSites[0], currentSite, linkedSites[1]];
  orderedSites.forEach((site, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = "site-switcher-separator";
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "/";
      siteSwitcher.append(separator);
    }

    if (site.key === activeHomePage) {
      const current = document.createElement("span");
      current.className = "site-switcher-current";
      current.setAttribute("aria-current", "page");
      current.textContent = currentLabel;
      siteSwitcher.append(current);
      return;
    }

    const link = document.createElement("a");
    link.className = "site-switcher-link";
    link.href = site.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = site.label;
    siteSwitcher.append(link);
  });
}

async function loadHomePage() {
  if (!pageProfiles.has(activeHomePage)) {
    throw new Error(`Unknown home page: ${activeHomePage}`);
  }

  const response = await fetch(`./content/${activeHomePage}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load home page: ${response.status}`);
  }

  const profile = await response.json();
  validatePageProfile(profile);

  const videoElement = document.querySelector("#video");
  if (!videoElement) throw new Error("Missing video element.");

  document.title = profile.documentTitle;
  setText("#pageTitle", profile.pageTitle);
  setText("#videoHeading", profile.videoHeading);
  setText("#reflectionTitle", profile.sectionTitle);
  setText("#pageDescription", profile.description);
  renderSiteSwitcher(profile.footer);
  videoElement.poster = profile.poster;
  videoElement.dataset.streamSource = profile.streamSource;

  await import("./player.js");
}

loadHomePage().catch((error) => {
  console.error(error);
  setText("#pageTitle", "页面加载失败");
  setText("#reflectionTitle", "无法加载内容");
  setText("#pageDescription", "请刷新页面或检查站点配置。");
  pageShell.classList.remove("is-metadata-pending");
  pageShell.removeAttribute("aria-busy");
});
