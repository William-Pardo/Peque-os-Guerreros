const stage = document.querySelector("#stage");
const slides = Array.from(document.querySelectorAll(".slide"));
const dots = document.querySelector(".slide-dots");
const progress = document.querySelector(".progress span");
const counter = document.querySelector(".counter");
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");
const chapterLinks = Array.from(document.querySelectorAll(".chapter-nav a"))
  .filter((link) => document.querySelector(link.getAttribute("href")));

let activeIndex = 0;
let wheelLock = false;

slides.forEach((slide, index) => {
  const dot = document.createElement("a");
  dot.href = `#${slide.id}`;
  dot.setAttribute("aria-label", `Ir a diapositiva ${index + 1}`);
  dots.appendChild(dot);
});

const dotLinks = Array.from(dots.querySelectorAll("a"));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function scrollToSlide(index) {
  const nextIndex = clamp(index, 0, slides.length - 1);
  slides[nextIndex].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
}

function updateActiveState() {
  const slideWidth = stage.clientWidth || window.innerWidth;
  const exactIndex = stage.scrollLeft / slideWidth;
  const nextActive = clamp(Math.round(exactIndex), 0, slides.length - 1);
  activeIndex = nextActive;

  slides.forEach((slide, index) => {
    const offset = index - exactIndex;
    const localProgress = clamp(offset, -1, 1);
    slide.style.setProperty("--slide-progress", localProgress.toFixed(3));
    slide.style.setProperty("--active", index === activeIndex ? "1" : "0");
    slide.classList.toggle("is-active", index === activeIndex);
  });

  dotLinks.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });

  chapterLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    const targetIndex = slides.indexOf(target);
    const nextTarget = chapterLinks[chapterLinks.indexOf(link) + 1];
    const nextSlide = nextTarget ? document.querySelector(nextTarget.getAttribute("href")) : null;
    const nextIndex = nextSlide ? slides.indexOf(nextSlide) : slides.length;
    link.classList.toggle("is-active", targetIndex >= 0 && activeIndex >= targetIndex && activeIndex < nextIndex);
  });

  const percent = ((activeIndex + 1) / slides.length) * 100;
  progress.style.width = `${percent}%`;
  counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${slides.length}`;
}

function handleWheel(event) {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return;
  }

  event.preventDefault();

  if (wheelLock) {
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;
  scrollToSlide(activeIndex + direction);
  wheelLock = true;
  window.setTimeout(() => {
    wheelLock = false;
  }, 620);
}

function handleKeydown(event) {
  const nextKeys = ["ArrowRight", "PageDown", " "];
  const prevKeys = ["ArrowLeft", "PageUp"];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    scrollToSlide(activeIndex + 1);
  }

  if (prevKeys.includes(event.key)) {
    event.preventDefault();
    scrollToSlide(activeIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    scrollToSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    scrollToSlide(slides.length - 1);
  }
}

prevButton.addEventListener("click", () => scrollToSlide(activeIndex - 1));
nextButton.addEventListener("click", () => scrollToSlide(activeIndex + 1));
stage.addEventListener("scroll", updateActiveState, { passive: true });
stage.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("resize", updateActiveState);

document.querySelectorAll('a[href^="#slide-"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    const index = slides.indexOf(target);
    if (index >= 0) {
      event.preventDefault();
      scrollToSlide(index);
    }
  });
});

updateActiveState();
