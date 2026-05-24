const progressBar = document.querySelector("#readProgress");
const readingTime = document.querySelector("#readingTime");
const sections = [...document.querySelectorAll("[data-section-nav], .article-section[id]")];
const navLinks = [...document.querySelectorAll(".top-nav a, .toc a")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const methodCards = [...document.querySelectorAll(".method-card")];
const methodsPagination = document.querySelector(".methods-pagination");
const methodsPageNumbers = document.querySelector(".methods-page-numbers");
const methodsNextPage = document.querySelector(".methods-page-next");
const storyPlot = document.querySelector(".storyline-plot");
const storyNodes = [...document.querySelectorAll(".story-node")];
const storyPreview = document.querySelector("#storyPreview");
const storyDetail = document.querySelector("#storyDetail");
const lazyVideos = [...document.querySelectorAll(".lazy-video")];
const methodsPageSize = 5;
let currentFilter = "all";
let currentPage = 1;

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  progressBar.style.width = `${progress * 100}%`;
}

function updateReadingTime() {
  const articleText = document.querySelector(".article")?.innerText || "";
  const words = articleText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 210));
  readingTime.textContent = `${minutes} min`;
}

function setActiveSection(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      setActiveSection(visible.target.id);
    }
  },
  {
    rootMargin: "-25% 0px -55% 0px",
    threshold: [0.08, 0.2, 0.4],
  }
);

sections.forEach((section) => sectionObserver.observe(section));

function updateStoryPreview(node) {
  if (!storyPreview) return;
  storyPreview.textContent = node.dataset.summary;
}

function updateStoryDetail(node) {
  if (!storyDetail) return;

  storyNodes.forEach((item) => {
    const isActive = item === node;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  const era = storyDetail.querySelector(".story-era");
  const title = storyDetail.querySelector("h3");
  const paragraphs = storyDetail.querySelectorAll("p");
  const listItems = storyDetail.querySelectorAll("li");
  const link = storyDetail.querySelector("a");

  era.textContent = node.dataset.era;
  title.textContent = node.dataset.title;
  paragraphs[1].textContent = node.dataset.detail;
  listItems[0].textContent = `Representative: ${node.dataset.papers}`;
  listItems[1].textContent = node.dataset.shift;
  link.href = node.dataset.link;
  link.textContent = node.dataset.linkLabel;
}

function showLinkedMethod(event) {
  event.preventDefault();
  const targetId = event.currentTarget.hash?.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;

  if (!target?.classList.contains("method-card")) return;

  currentFilter = "all";
  setFilterButtonState(currentFilter);

  const allCards = getFilteredMethodCards("all");
  const targetIndex = allCards.indexOf(target);
  currentPage = targetIndex >= 0 ? Math.floor(targetIndex / methodsPageSize) + 1 : 1;

  renderMethods();

  methodCards.forEach((card) => card.classList.remove("method-highlight"));
  target.classList.add("method-highlight");
  target.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => target.classList.remove("method-highlight"), 1800);
}

function getFilteredMethodCards(filter = currentFilter) {
  return methodCards.filter((card) => {
    const families = (card.dataset.family || "").split(/\s+/);
    return filter === "all" || families.includes(filter);
  });
}

function setFilterButtonState(filter) {
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
}

function renderMethodPagination(totalPages) {
  if (!methodsPagination || !methodsPageNumbers || !methodsNextPage) return;

  methodsPageNumbers.innerHTML = "";

  if (totalPages <= 1) {
    methodsPagination.hidden = true;
    methodsNextPage.disabled = true;
    return;
  }

  methodsPagination.hidden = false;

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "methods-page-button";
    pageButton.textContent = String(page);
    pageButton.classList.toggle("active", page === currentPage);
    if (page === currentPage) {
      pageButton.setAttribute("aria-current", "page");
    }

    pageButton.addEventListener("click", () => {
      if (currentPage === page) return;
      currentPage = page;
      renderMethods();
    });

    methodsPageNumbers.append(pageButton);
  }

  methodsNextPage.disabled = currentPage >= totalPages;
}

function renderMethods() {
  const filteredCards = getFilteredMethodCards();
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / methodsPageSize));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * methodsPageSize;
  const endIndex = startIndex + methodsPageSize;
  const visibleCards = new Set(filteredCards.slice(startIndex, endIndex));

  methodCards.forEach((card) => {
    const isVisible = visibleCards.has(card);
    card.classList.toggle("is-hidden", !isVisible);
    if (!isVisible) {
      card.querySelectorAll(".lazy-video").forEach((video) => video.pause());
    }
  });

  renderMethodPagination(totalPages);
}

function loadLazyVideo(video) {
  if (video.dataset.loaded === "true") return;

  video.querySelectorAll("source[data-src]").forEach((source) => {
    source.src = source.dataset.src;
    source.removeAttribute("data-src");
  });

  video.dataset.loaded = "true";
  video.load();
}

function playLazyVideo(video) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  loadLazyVideo(video);
  video.play().catch(() => {});
}

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          playLazyVideo(video);
        } else {
          video.pause();
        }
      });
    },
    {
      rootMargin: "260px 0px",
      threshold: 0.18,
    }
  );

  lazyVideos.forEach((video) => videoObserver.observe(video));
} else {
  lazyVideos.forEach(loadLazyVideo);
}

storyNodes.forEach((node) => {
  node.addEventListener("pointerenter", () => updateStoryPreview(node));
  node.addEventListener("focus", () => updateStoryPreview(node));
  node.addEventListener("click", () => {
    updateStoryPreview(node);
    updateStoryDetail(node);
    storyPlot?.classList.add("has-interacted");
  });
});

storyNodes.forEach((node) => {
  node.setAttribute("aria-pressed", String(node.classList.contains("active")));
});

storyDetail?.querySelector("a")?.addEventListener("click", showLinkedMethod);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter || "all";
    currentPage = 1;
    setFilterButtonState(currentFilter);
    renderMethods();
  });
});

methodsNextPage?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredMethodCards().length / methodsPageSize));
  if (currentPage >= totalPages) return;
  currentPage += 1;
  renderMethods();
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

updateReadingTime();
updateProgress();
setFilterButtonState(currentFilter);
renderMethods();
