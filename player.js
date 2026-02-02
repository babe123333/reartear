const audio = document.getElementById("audio");
const cover = document.querySelector('[data-page="cover"]');
const poems = document.querySelector('[data-page="poems"]');

function getTracks() {
  const raw = audio?.dataset?.tracks || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

let tracks = getTracks();
let track = 0;

function ensureSrc() {
  if (!audio) return;
  if (!tracks.length) tracks = ["./assets/track.mp3"];
  if (!audio.src) audio.src = tracks[track];
}

function fadeTo(which) {
  const next = which === "poems" ? poems : cover;
  const prev = which === "poems" ? cover : poems;
  if (!next || !prev || next === prev) return;

  prev.classList.add("is-fading");
  setTimeout(() => {
    prev.hidden = true;
    prev.classList.remove("is-fading");
    next.hidden = false;
    next.classList.add("is-fading");
    requestAnimationFrame(() => next.classList.remove("is-fading"));
  }, 220);

  history.replaceState(null, "", which === "poems" ? "#poems" : "#cover");
}

function play() {
  ensureSrc();
  return audio?.play().catch(() => {});
}

function pause() {
  audio?.pause();
}

function skip() {
  ensureSrc();
  if (!audio || tracks.length < 2) return;
  track = (track + 1) % tracks.length;
  audio.src = tracks[track];
  audio.play().catch(() => {});
}

function back() {
  fadeTo("cover");
}

function toPoems() {
  fadeTo("poems");
}

function setAudioUI(isPlaying) {
  document.querySelectorAll("[data-action='toggle-audio']").forEach((btn) => {
    const icon = btn.querySelector("[data-audio-icon]");
    if (icon) icon.textContent = isPlaying ? "⏸" : "▶︎";
    btn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  });
}

function toggleAudio() {
  if (!audio) return;
  ensureSrc();

  if (audio.paused) {
    play();
  } else {
    pause();
  }
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  switch (el.dataset.action) {
    case "to-poems":
      toPoems();
      break;
    case "toggle-audio":
      toggleAudio();
      break;
    case "skip":
      skip();
      break;
    case "back":
      back();
      break;
  }
});

// Start state + browser back/forward support
poems.hidden = true;
cover.hidden = false;
ensureSrc();
setAudioUI(!(audio?.paused ?? true));
audio?.addEventListener("play", () => setAudioUI(true));
audio?.addEventListener("pause", () => setAudioUI(false));
audio?.addEventListener("ended", () => setAudioUI(false));
if (location.hash === "#poems") fadeTo("poems");
window.addEventListener("hashchange", () => fadeTo(location.hash === "#poems" ? "poems" : "cover"));
