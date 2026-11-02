const pageProfiles = new Set(["shelter", "cat", "star"]);
const activeHomePage = document.documentElement.dataset.homePage;
const pageShell = document.querySelector("#pageShell");

delete document.documentElement.dataset.homePage;

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
  setText("#pageFooter", profile.footer);
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
