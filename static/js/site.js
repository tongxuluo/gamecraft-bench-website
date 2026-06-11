const carousel = document.querySelector(".demo-carousel");
const track = document.querySelector(".demo-track");

if (carousel && track) {
  let paused = false;
  let sliding = false;

  const rotate = () => {
    if (paused || sliding || window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    const firstCard = track.querySelector(".demo-card");
    if (!firstCard) {
      return;
    }

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
    const distance = firstCard.getBoundingClientRect().width + gap;
    sliding = true;
    track.style.transform = `translate3d(-${distance}px, 0, 0)`;
    track.classList.add("is-sliding");
  };

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") {
      return;
    }

    if (track.firstElementChild) {
      track.appendChild(track.firstElementChild);
    }
    track.classList.remove("is-sliding");
    track.style.transform = "translate3d(0, 0, 0)";
    sliding = false;
  });

  carousel.addEventListener("pointerenter", () => {
    paused = true;
  });
  carousel.addEventListener("pointerleave", () => {
    paused = false;
  });
  carousel.addEventListener("focusin", () => {
    paused = true;
  });
  carousel.addEventListener("focusout", () => {
    paused = false;
  });

  window.setInterval(rotate, 3200);
}
