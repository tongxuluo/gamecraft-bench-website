document.querySelectorAll(".demo-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".demo-track");
  if (!track) {
    return;
  }

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
});

document.querySelectorAll("[data-citation-copy]").forEach((btn) => {
  const box = btn.closest(".citation-box");
  const code = box ? box.querySelector("pre code") : null;
  if (!code) return;

  let resetTimer = null;
  btn.addEventListener("click", async () => {
    const text = code.textContent || "";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      btn.textContent = "Copied";
      btn.classList.add("is-copied");
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("is-copied");
      }, 2000);
    } catch (err) {
      btn.textContent = "Copy failed";
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        btn.textContent = "Copy";
      }, 2000);
    }
  });
});
