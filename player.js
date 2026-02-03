const audio = document.getElementById("audio");
const cover = document.querySelector('[data-page="cover"]');
const poems = document.querySelector('[data-page="poems"]');

function getTracks() {
  const raw = audio?.dataset?.tracks || "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

let tracks = getTracks();
let track = 0;

function setCurrentTrack() {
  document.querySelectorAll(".track").forEach((btn, i) => btn.classList.toggle("is-current", i === track));
}

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

function skip() {
  ensureSrc();
  if (!audio || tracks.length < 2) return;
  track = (track + 1) % tracks.length;
  audio.src = tracks[track];
  audio.play().catch(() => {});
  setCurrentTrack();
}

function goToNextTrack() {
  if (!audio || tracks.length < 2) return;
  track = (track + 1) % tracks.length;
  audio.src = tracks[track];
  setCurrentTrack();
  audio.play().catch(() => {});
}

function setAudioUI(playing) {
  document.querySelectorAll("[data-action='toggle-audio']").forEach((btn) => {
    const icon = btn.querySelector("[data-audio-icon]");
    if (icon) icon.textContent = playing ? "⏸" : "▶︎";
  });
}

function toggleAudio() {
  if (!audio) return;
  ensureSrc();
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function playTrack(index) {
  if (!audio || index < 0 || index >= tracks.length) return;
  track = index;
  audio.src = tracks[track];
  setCurrentTrack();
  const onCanPlay = () => {
    audio.removeEventListener("canplay", onCanPlay);
    audio.play().catch(() => {});
  };
  audio.addEventListener("canplay", onCanPlay);
  audio.load();
}

document.addEventListener("click", (e) => {
  const trackBtn = e.target.closest(".track[data-track-index]");
  if (trackBtn) {
    playTrack(parseInt(trackBtn.dataset.trackIndex, 10));
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  switch (el.dataset.action) {
    case "to-poems": fadeTo("poems"); break;
    case "toggle-audio": toggleAudio(); break;
    case "skip": skip(); break;
    case "back": fadeTo("cover"); break;
  }
});

poems.hidden = true;
cover.hidden = false;
ensureSrc();
setAudioUI(!audio?.paused);
setCurrentTrack();

audio?.addEventListener("play", () => setAudioUI(true));
audio?.addEventListener("pause", () => setAudioUI(false));
audio?.addEventListener("ended", () => {
  setAudioUI(false);
  goToNextTrack();
});

if (location.hash === "#poems") fadeTo("poems");
window.addEventListener("hashchange", () => fadeTo(location.hash === "#poems" ? "poems" : "cover"));
