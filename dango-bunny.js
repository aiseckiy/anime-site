(() => {
  const apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";

  function playerElements() {
    return {
      shell: document.querySelector(".fake-player"),
      video: document.querySelector("#episodeVideo"),
      play: document.querySelector("#playerPlay"),
      meta: document.querySelector("#playerMeta"),
      dubSelect: document.querySelector("#dubSelect"),
      uploadForm: document.querySelector("#mediaUploadForm"),
      uploadStatus: document.querySelector("#mediaUploadStatus")
    };
  }

  function ensureIframe() {
    const { shell } = playerElements();
    if (!shell) return null;
    let iframe = document.querySelector("#bunnyStreamFrame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "bunnyStreamFrame";
      iframe.className = "episode-video hidden bunny-frame";
      iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      shell.appendChild(iframe);
    }
    return iframe;
  }

  function labelVariant(variant) {
    const parts = [variant.dub, variant.quality].filter(Boolean);
    return parts.length ? parts.join(" • ") : "Видео";
  }

  function qualityElements() {
    return {
      label: document.querySelector("#qualityLabel"),
      select: document.querySelector("#qualitySelect")
    };
  }

  function clearHls(video) {
    if (video && video._hls) {
      try { video._hls.destroy(); } catch {}
      video._hls = null;
    }
    qualityElements().label?.classList.add("hidden");
  }

  function buildQualityMenu(hls) {
    const { label, select } = qualityElements();
    if (!label || !select) return;
    const levels = hls.levels || [];
    if (levels.length <= 1) { label.classList.add("hidden"); return; }
    select.innerHTML = `<option value="-1">Авто</option>` + levels.map((level, index) => {
      const name = level.height ? `${level.height}p` : `${Math.round((level.bitrate || 0) / 1000)}k`;
      return `<option value="${index}">${name}</option>`;
    }).join("");
    select.value = "-1";
    select.onchange = () => { hls.currentLevel = Number(select.value); };
    label.classList.remove("hidden");
  }

  // Play a direct video URL in our own <video>: .m3u8 via hls.js (adaptive +
  // quality menu), other formats natively.
  function attachHls(video, url) {
    clearHls(video);
    video.preload = "metadata";
    const isM3u8 = /\.m3u8(\?|$)/i.test(url);
    if (isM3u8 && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      video._hls = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => buildQualityMenu(hls));
    } else {
      video.src = url;
    }
  }

  async function bunnyRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = localStorage.getItem("dangoToken") || "";
    if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(`${apiBase}${path}`, { ...options, headers });
    } catch {
      throw new Error("сервер не отвечает");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "api_error");
    return data;
  }

  function savedProgress(item, season, episode) {
    try {
      if (typeof getSavedProgress === "function") return getSavedProgress(item.id, season, episode);
    } catch {}

    const list = JSON.parse(localStorage.getItem("dangoContinueList") || "[]");
    const saved = Array.isArray(list)
      ? list.find((entry) => entry.id === item.id && entry.season === season && entry.episode === episode)
      : null;
    return saved?.progress || 0;
  }

  // The two timed overlay buttons are driven by per-anime timecodes saved in
  // the title structure (state.structures[id].skip). Each button is visible for
  // a 15s window starting at its configured timecode.
  const SKIP_WINDOW = 15;
  let activeSkip = null;
  let activeMode = null;        // "bunny" | "local"
  let activeBunnyPlayer = null;
  let activeVideoEl = null;
  let pollTimer = null;
  let pollTicks = 0;
  let gotTime = false;

  function ensureBunnyPlayer(iframe) {
    if (!window.playerjs || !iframe) return null;
    if (!iframe._pjs) {
      try { iframe._pjs = new window.playerjs.Player(iframe); } catch { return null; }
      iframe._pjs.on("timeupdate", (data) => { if (data) handleTime(data.seconds); });
    }
    return iframe._pjs;
  }

  function seekTo(seconds) {
    if (seconds == null) return;
    if (activeMode === "bunny") {
      const player = activeBunnyPlayer || ensureBunnyPlayer(ensureIframe());
      try { player && player.setCurrentTime(seconds); } catch {}
    } else if (activeMode === "local" && activeVideoEl) {
      try { activeVideoEl.currentTime = seconds; } catch {}
    }
  }

  function showButton(el, visible) {
    if (el) el.classList.toggle("hidden", !visible);
  }

  // Show each button for a 15s window from its timecode. If we can't read the
  // player time (Bunny/Player.js not reporting), fall back to showing the
  // configured buttons permanently so they are still usable.
  function handleTime(seconds, forceShow) {
    const t = Number(seconds) || 0;
    const skip = activeSkip || {};
    const openBtn = document.querySelector("#skipIntroButton");
    const nextBtn = document.querySelector("#nextEpiOverlay");
    const openConfigured = skip.openingEnd != null;
    const nextConfigured = skip.nextStart != null;
    if (forceShow) {
      showButton(openBtn, openConfigured);
      showButton(nextBtn, nextConfigured);
      return;
    }
    const os = skip.openingStart;
    showButton(openBtn, openConfigured && os != null && t >= os && t < os + SKIP_WINDOW);
    showButton(nextBtn, nextConfigured && t >= skip.nextStart && t < skip.nextStart + SKIP_WINDOW);
  }

  function stopTimePolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function startTimePolling() {
    stopTimePolling();
    pollTicks = 0;
    gotTime = false;
    pollTimer = setInterval(() => {
      const playerView = document.querySelector("#playerView");
      if (!playerView || !playerView.classList.contains("active")) {
        stopTimePolling();
        showButton(document.querySelector("#skipIntroButton"), false);
        showButton(document.querySelector("#nextEpiOverlay"), false);
        return;
      }
      pollTicks += 1;
      const player = activeBunnyPlayer || (activeBunnyPlayer = ensureBunnyPlayer(ensureIframe()));
      if (player) {
        try {
          player.getCurrentTime((value) => {
            if (typeof value === "number" && !Number.isNaN(value)) {
              gotTime = true;
              handleTime(value);
            }
          });
        } catch {}
      }
      // Fallback: Player.js never reported a time -> just reveal the buttons.
      if (!gotTime && pollTicks >= 8) handleTime(0, true);
    }, 800);
  }

  function ensureOverlayButtons() {
    const { shell } = playerElements();
    if (!shell) return;
    if (!document.querySelector("#skipIntroButton")) {
      const button = document.createElement("button");
      button.id = "skipIntroButton";
      button.type = "button";
      button.className = "skip-intro-button hidden";
      button.textContent = "Пропустить опенинг ⏭";
      button.onclick = () => seekTo(activeSkip && activeSkip.openingEnd);
      shell.appendChild(button);
    }
    if (!document.querySelector("#nextEpiOverlay")) {
      const button = document.createElement("button");
      button.id = "nextEpiOverlay";
      button.type = "button";
      button.className = "next-epi-overlay hidden";
      button.textContent = "Следующая серия →";
      button.onclick = () => document.querySelector("#nextEpisode")?.click();
      shell.appendChild(button);
    }
  }

  function applyVariant(variant, item, season, episode) {
    const { video, play, meta } = playerElements();
    const iframe = ensureIframe();
    if (!variant || !video || !meta) return;

    // Show a preview frame (poster) instead of a black screen. Nothing
    // autoplays — the user starts playback with the built-in play button.
    play?.classList.add("hidden");
    clearHls(video);

    const isBunnyEmbed = !!variant.embed_url && /mediadelivery\.net/i.test(variant.embed_url);

    if (variant.embed_url && iframe) {
      video.classList.add("hidden");
      video.removeAttribute("src");
      let src = variant.embed_url;
      if (isBunnyEmbed) {
        const url = new URL(src);
        url.searchParams.set("autoplay", "false");
        url.searchParams.set("preview", "true");
        src = url.toString();
      }
      iframe.src = src;
      iframe.classList.remove("hidden");
    } else if (variant.file_url) {
      iframe?.classList.add("hidden");
      if (iframe) iframe.removeAttribute("src");
      attachHls(video, variant.file_url);
      video.classList.remove("hidden");
    }

    ensureOverlayButtons();
    document.querySelector("#skipIntroButton")?.classList.add("hidden");
    document.querySelector("#nextEpiOverlay")?.classList.add("hidden");
    activeSkip = (typeof state !== "undefined" && state.structures && state.structures[item.id] && state.structures[item.id].skip) || null;

    if (isBunnyEmbed && iframe) {
      activeMode = "bunny";
      activeVideoEl = null;
      activeBunnyPlayer = ensureBunnyPlayer(iframe);
      startTimePolling();
    } else if (!variant.embed_url && variant.file_url) {
      activeMode = "local";
      activeVideoEl = video;
      activeBunnyPlayer = null;
      stopTimePolling();
      if (!video._skipBound) {
        video.addEventListener("timeupdate", () => handleTime(video.currentTime));
        video._skipBound = true;
      }
    } else {
      // External embed (Sibnet etc.) — no programmatic seek control.
      activeMode = "external";
      activeVideoEl = null;
      activeBunnyPlayer = null;
      stopTimePolling();
    }

    const progress = savedProgress(item, season, episode);
    meta.textContent = `${labelVariant(variant)} • продолжить с ${progress}% просмотра.`;
  }

  function renderVariants(variants, item, season, episode) {
    const { dubSelect } = playerElements();
    if (!dubSelect || !variants.length) return;

    dubSelect.innerHTML = variants.map((variant, index) => (
      `<option value="${index}">${labelVariant(variant)}</option>`
    )).join("");

    dubSelect.onchange = () => {
      const variant = variants[Number(dubSelect.value)] || variants[0];
      applyVariant(variant, item, season, episode);
    };
  }

  async function loadBunnyAwareMedia(item, season, episode) {
    const { video, play } = playerElements();
    const iframe = ensureIframe();
    if (video) {
      video.classList.add("hidden");
      video.removeAttribute("src");
    }
    if (iframe) {
      iframe.classList.add("hidden");
      iframe.removeAttribute("src");
    }
    stopTimePolling();
    document.querySelector("#skipIntroButton")?.classList.add("hidden");
    document.querySelector("#nextEpiOverlay")?.classList.add("hidden");
    play?.classList.remove("hidden");

    try {
      const data = await bunnyRequest(`/api/media/${item.id}/${season}/${episode}`);
      const variants = Array.isArray(data.variants) && data.variants.length
        ? data.variants
        : data.media
          ? [data.media]
          : [];
      if (!variants.length) return;
      renderVariants(variants, item, season, episode);
      applyVariant(variants[0], item, season, episode);
    } catch {
      // Keep the styled placeholder when media has not been linked yet.
    }
  }

  function installBunnySyncButton() {
    const { uploadForm, uploadStatus } = playerElements();
    if (!uploadForm || document.querySelector("#syncBunnyButton")) return;

    const button = document.createElement("button");
    button.id = "syncBunnyButton";
    button.type = "button";
    button.textContent = "Синхронизировать Bunny Stream";
    uploadForm.appendChild(button);

    button.addEventListener("click", async () => {
      if (!uploadStatus) return;
      uploadStatus.textContent = "Сканирую Bunny Stream и сортирую видео...";
      try {
        const result = await bunnyRequest("/api/admin/bunny/sync", { method: "POST" });
        uploadStatus.textContent = `Bunny готов: ${result.synced} видео привязано, ${result.skipped.length} пропущено, коллекций-сезонов найдено: ${result.collectionsFound ?? 0}.`;
        try {
          if (typeof state !== "undefined" && state.title && state.episode) {
            await loadBunnyAwareMedia(state.title, state.episode.season, state.episode.episode);
          }
        } catch {}
      } catch (error) {
        uploadStatus.textContent = `Bunny ошибка: ${error.message}`;
      }
    });
  }

  function boot() {
    try {
      loadMedia = loadBunnyAwareMedia;
    } catch {}
    installBunnySyncButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    setTimeout(boot, 0);
  }
})();
