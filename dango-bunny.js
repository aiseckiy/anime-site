(() => {
  const apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";

  // Minimalist monochrome volume icons (inherit currentColor).
  const VOL_ON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>`;
  const VOL_OFF = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 9l5 6M21 9l-5 6"/></svg>`;
  // Proper monochrome play / pause / quality icons (no emoji) for every device.
  const PLAY_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`;
  const GEAR_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7 7 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.74 8.86a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>`;
  const PIP_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02zM18 11h-7v6h7v-6z"/></svg>`;

  // Human-friendly name for an HLS audio track (Japanese / Russian / English).
  function audioName(track) {
    const raw = String((track && (track.name || track.lang)) || "").trim();
    const probe = `${raw} ${(track && track.lang) || ""}`.toLowerCase();
    if (/(^|[^a-z])(jp|jpn|ja|jap|japan)|япон/.test(probe)) return "Японский";
    if (/(^|[^a-z])(ru|rus|russ)|рус/.test(probe)) return "Русский";
    if (/(^|[^a-z])(en|eng|english)|англ/.test(probe)) return "English";
    return raw || "Дорожка";
  }

  function setActiveItem(menu, attr, button) {
    menu.querySelectorAll(`[data-${attr}]`).forEach((node) => node.classList.remove("active"));
    button.classList.add("active");
  }

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

  function fmtTime(value) {
    const total = Math.max(0, Math.floor(value || 0));
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // Build our own control bar (timeline, play/mute, time, in-video quality
  // gear, fullscreen) once per <video>. Native controls are off so this is the
  // only UI for the HLS/mp4 path.
  function ensureCustomControls(video) {
    if (video._dc) return video._dc;
    const { shell } = playerElements();
    if (!shell) return null;

    const bar = document.createElement("div");
    bar.className = "dango-controls hidden";
    bar.innerHTML = `
      <div class="dc-timeline" data-role="timeline">
        <div class="dc-buffered" data-role="buffered"></div>
        <div class="dc-progress" data-role="progress"><span class="dc-thumb"></span></div>
      </div>
      <div class="dc-row">
        <div class="dc-left">
          <button class="dc-btn dc-play" data-role="play" type="button" aria-label="Воспроизвести">${PLAY_ICON}</button>
          <div class="dc-volume" data-role="volume">
            <button class="dc-btn dc-mute" data-role="mute" type="button" aria-label="Звук">${VOL_ON}</button>
            <input class="dc-vol-range" data-role="vol" type="range" min="0" max="1" step="0.01" value="1" aria-label="Громкость" />
          </div>
          <span class="dc-time"><span data-role="cur">0:00</span> / <span data-role="dur">0:00</span></span>
        </div>
        <div class="dc-right">
          <div class="dc-quality hidden" data-role="quality">
            <span class="dc-quality-tip" data-role="qlabel">Авто</span>
            <button class="dc-btn dc-gear" data-role="gear" type="button" aria-label="Настройки">${GEAR_ICON}</button>
            <div class="dc-quality-menu hidden" data-role="qmenu"></div>
          </div>
          <button class="dc-btn dc-pip hidden" data-role="pip" type="button" aria-label="Картинка в картинке">${PIP_ICON}</button>
          <button class="dc-btn" data-role="full" type="button" aria-label="Полный экран">⛶</button>
        </div>
      </div>`;
    shell.appendChild(bar);

    const pick = (role) => bar.querySelector(`[data-role="${role}"]`);
    const dc = {
      bar, timeline: pick("timeline"), progress: pick("progress"), buffered: pick("buffered"),
      play: pick("play"), mute: pick("mute"), vol: pick("vol"),
      cur: pick("cur"), dur: pick("dur"),
      quality: pick("quality"), gear: pick("gear"), qlabel: pick("qlabel"), qmenu: pick("qmenu"),
      pip: pick("pip"), full: pick("full")
    };
    video._dc = dc;

    const togglePlay = () => { if (video.paused) video.play(); else video.pause(); };
    dc.play.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", () => {
      // First play leaves the preview frame and starts the episode from the top.
      if (video._previewPending) {
        try { if (video.currentTime > 1) video.currentTime = 0; } catch {}
        exitPreview(video);
      }
      dc.play.innerHTML = PAUSE_ICON;
      bar.classList.remove("dc-paused");
    });
    video.addEventListener("pause", () => { dc.play.innerHTML = PLAY_ICON; bar.classList.add("dc-paused"); });

    // Volume: the slider only unfurls while the cursor is over the speaker
    // (CSS :hover) and tucks back away when the cursor leaves.
    const syncVolumeIcon = () => {
      const silent = video.muted || video.volume === 0;
      dc.mute.innerHTML = silent ? VOL_OFF : VOL_ON;
    };
    dc.mute.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 1;
    });
    dc.vol.addEventListener("input", () => {
      video.volume = Number(dc.vol.value);
      video.muted = video.volume === 0;
    });
    video.addEventListener("volumechange", () => {
      dc.vol.value = video.muted ? 0 : video.volume;
      syncVolumeIcon();
    });

    video.addEventListener("loadedmetadata", () => { dc.dur.textContent = fmtTime(video.duration); });
    video.addEventListener("timeupdate", () => {
      const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      dc.progress.style.width = `${pct}%`;
      dc.cur.textContent = fmtTime(video.currentTime);
    });
    video.addEventListener("progress", () => {
      try {
        if (video.buffered.length && video.duration) {
          const end = video.buffered.end(video.buffered.length - 1);
          dc.buffered.style.width = `${(end / video.duration) * 100}%`;
        }
      } catch {}
    });

    const seekFromEvent = (event) => {
      const rect = dc.timeline.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      video._previewPending = false; // deliberate seek cancels the preview reset
      if (video.duration) video.currentTime = ratio * video.duration;
    };
    let scrubbing = false;
    dc.timeline.addEventListener("mousedown", (event) => { scrubbing = true; seekFromEvent(event); });
    document.addEventListener("mousemove", (event) => { if (scrubbing) seekFromEvent(event); });
    document.addEventListener("mouseup", () => { scrubbing = false; });

    dc.full.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else shell.requestFullscreen?.().catch(() => {});
    });

    // Picture-in-Picture (only when the browser supports it on the <video>).
    if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
      dc.pip.classList.remove("hidden");
      dc.pip.addEventListener("click", async () => {
        try {
          if (document.pictureInPictureElement) await document.exitPictureInPicture();
          else await video.requestPictureInPicture();
        } catch {}
      });
    }

    // Hover the gear -> tooltip with the current quality; click -> open menu.
    dc.gear.addEventListener("click", (event) => {
      event.stopPropagation();
      const hidden = dc.qmenu.classList.toggle("hidden");
      dc.quality.classList.toggle("menu-open", !hidden);
    });
    document.addEventListener("click", () => {
      dc.qmenu.classList.add("hidden");
      dc.quality.classList.remove("menu-open");
    });

    // Auto-hide: after 5s without mouse movement the whole control bar slides
    // down out of the way so it doesn't cover the picture. Any movement (or a
    // pause) brings it straight back.
    let idleTimer = null;
    const hideControls = () => {
      if (video.paused) return; // keep controls up while paused
      shell.classList.add("dc-idle");
      shell.classList.remove("dc-active");
    };
    const showControls = () => {
      shell.classList.add("dc-active");
      shell.classList.remove("dc-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(hideControls, 5000);
    };
    shell.addEventListener("mousemove", showControls);
    shell.addEventListener("mouseleave", () => { clearTimeout(idleTimer); hideControls(); });
    video.addEventListener("pause", showControls);
    video.addEventListener("play", showControls);

    // Arrow keys jump 5 seconds back/forward while the local player is on screen.
    document.addEventListener("keydown", (event) => {
      if (video.classList.contains("hidden")) return;
      const playerView = document.querySelector("#playerView");
      if (!playerView || !playerView.classList.contains("active")) return;
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!video.duration) return;
      event.preventDefault();
      video._previewPending = false; // an explicit seek cancels the preview reset
      const delta = event.key === "ArrowLeft" ? -5 : 5;
      video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + delta));
      showControls();
    });

    return dc;
  }

  function clearHls(video) {
    if (video && video._hls) {
      try { video._hls.destroy(); } catch {}
      video._hls = null;
    }
    if (video && video._dc) {
      video._dc.bar.classList.add("hidden");
      video._dc.qmenu.classList.add("hidden");
      video._dc.quality.classList.add("hidden");
    }
    if (video && video._centerPlay) video._centerPlay.classList.add("hidden");
  }

  // Populate the in-video gear menu: quality (1080p → … → Авто) and, if the HLS
  // stream carries more than one audio track, an «Озвучка» switch (JP / RU).
  function buildQualityMenu(hls, video) {
    const dc = video._dc;
    if (!dc) return;
    const levels = hls.levels || [];
    const audioTracks = hls.audioTracks || [];
    const hasQuality = levels.length > 1;
    const hasAudio = audioTracks.length > 1;
    dc.quality.classList.toggle("hidden", !hasQuality && !hasAudio);
    if (!hasQuality && !hasAudio) return;

    const item = (text, attr, value, active) =>
      `<button class="dc-q-item${active ? " active" : ""}" type="button" data-${attr}="${value}">${text}</button>`;

    let html = "";
    if (hasQuality) {
      const ordered = levels
        .map((level, index) => ({ index, level }))
        .sort((a, b) => (b.level.height || b.level.bitrate || 0) - (a.level.height || a.level.bitrate || 0));
      html += `<div class="dc-q-group">Качество</div>`;
      html += ordered.map(({ index, level }) => {
        const name = level.height ? `${level.height}p` : `${Math.round((level.bitrate || 0) / 1000)}k`;
        return item(name, "level", index, !hls.autoLevelEnabled && hls.currentLevel === index);
      }).join("");
      html += item("Авто", "level", -1, hls.autoLevelEnabled);
    }
    if (hasAudio) {
      html += `<div class="dc-q-group">Озвучка</div>`;
      html += audioTracks.map((track, index) =>
        item(audioName(track), "audio", index, hls.audioTrack === index)
      ).join("");
    }
    dc.qmenu.innerHTML = html;

    dc.qmenu.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        hls.currentLevel = Number(button.dataset.level);
        setActiveItem(dc.qmenu, "level", button);
        dc.qmenu.classList.add("hidden");
        dc.quality.classList.remove("menu-open");
      });
    });
    dc.qmenu.querySelectorAll("[data-audio]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        hls.audioTrack = Number(button.dataset.audio);
        setActiveItem(dc.qmenu, "audio", button);
        dc.qmenu.classList.add("hidden");
        dc.quality.classList.remove("menu-open");
      });
    });
  }

  // Estimate the viewer's bandwidth so hls.js picks a sensible starting
  // quality. Fast connections start at 1080p; slow ones start lower. After
  // that hls.js ABR keeps adapting — it drops quality if segments stall
  // (YouTube-style) and climbs back up when bandwidth allows.
  function bandwidthEstimateBps() {
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    const downlink = conn && Number(conn.downlink) ? Number(conn.downlink) : 0;     // Mbps
    const is4g = !conn || conn.effectiveType === "4g" || conn.effectiveType === undefined;
    // Lean towards HD when we have no signal or a good one; be cautious on slow links.
    const mbps = downlink ? Math.max(downlink, is4g ? 8 : 1.5) : 8;
    return Math.round(mbps * 1_000_000);
  }

  // Big centered play button shown over the still preview frame.
  function ensureCenterPlay(video) {
    if (video._centerPlay) return video._centerPlay;
    const { shell } = playerElements();
    if (!shell) return null;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dango-center-play hidden";
    button.setAttribute("aria-label", "Смотреть");
    button.innerHTML = `<svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    button.addEventListener("click", (event) => { event.stopPropagation(); video.play(); });
    shell.appendChild(button);
    video._centerPlay = button;
    return button;
  }

  // Preview state: a still frame (no timeline, no controls) that looks like a
  // loaded thumbnail, with a big play button. Press play -> start from 0.
  function enterPreview(video) {
    video._previewPending = true;
    video._dc?.bar.classList.add("hidden");
    ensureCenterPlay(video)?.classList.remove("hidden");
  }

  function exitPreview(video) {
    video._previewPending = false;
    video._centerPlay?.classList.add("hidden");
    video._dc?.bar.classList.remove("hidden");
  }

  // Use the exact middle of the episode as the still preview frame.
  function setMiddlePreview(video) {
    enterPreview(video);
    const jump = () => {
      if (!video._previewPending) return;
      const d = video.duration;
      if (!d || !isFinite(d) || d < 4) return;
      try { video.currentTime = d * 0.5; } catch {}
    };
    if (video.duration && isFinite(video.duration)) jump();
    else video.addEventListener("loadedmetadata", jump, { once: true });
  }

  // Fallback when an HLS URL fails (e.g. wrong CDN host, 404, token-protected):
  // switch to the Bunny iframe embed if we have one, otherwise show a message.
  function fallbackToEmbed(video, embedUrl, reason) {
    const { meta } = playerElements();
    const iframe = ensureIframe();
    clearHls(video);
    video.classList.add("hidden");
    video.removeAttribute("src");
    if (embedUrl && iframe) {
      let src = embedUrl;
      if (/mediadelivery\.net/i.test(src)) {
        try { const url = new URL(src); url.searchParams.set("autoplay", "false"); src = url.toString(); } catch {}
      }
      iframe.src = src;
      iframe.classList.remove("hidden");
      if (meta) meta.textContent = "HLS-ссылка недоступна — включён встроенный плеер Bunny.";
    } else if (meta) {
      meta.textContent = `Видео не загрузилось${reason ? ` (${reason})` : ""}. Проверьте Bunny: CDN-хост, токен-защиту и готовность кодирования.`;
    }
  }

  // Play a direct video URL in our own <video>: .m3u8 via hls.js (adaptive +
  // in-video quality menu), other formats natively. Custom controls always on.
  // `embedFallback` is an optional Bunny iframe URL used if HLS playback fails.
  function attachHls(video, url, embedFallback) {
    clearHls(video);
    video.preload = "metadata";
    video.controls = false;
    video._embedFallback = embedFallback || null;
    const dc = ensureCustomControls(video);
    dc?.bar.classList.remove("hidden");

    const isM3u8 = /\.m3u8(\?|$)/i.test(url);
    if (isM3u8 && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        abrEwmaDefaultEstimate: bandwidthEstimateBps(),
        startLevel: -1
      });
      video._hls = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => buildQualityMenu(hls, video));
      hls.on(window.Hls.Events.AUDIO_TRACKS_UPDATED, () => buildQualityMenu(hls, video));
      hls.on(window.Hls.Events.AUDIO_TRACK_SWITCHED, () => buildQualityMenu(hls, video));
      hls.on(window.Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (!dc) return;
        const level = hls.levels[data.level];
        const q = level && level.height ? `${level.height}p` : "";
        // Tooltip always reflects what is actually playing now.
        dc.qlabel.textContent = hls.autoLevelEnabled ? (q ? `Авто (${q})` : "Авто") : (q || "Авто");
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        // A 404 / network manifest error is fatal and unrecoverable here.
        if (data && data.fatal) {
          const code = (data.response && data.response.code) || data.details || data.type;
          console.warn("[DANGO] HLS error", code, "url:", url, data);
          fallbackToEmbed(video, video._embedFallback, code);
        }
      });
    } else if (isM3u8 && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS: native HLS.
      video.src = url;
      video.addEventListener("error", () => fallbackToEmbed(video, video._embedFallback, "404"), { once: true });
    } else {
      video.src = url;
      video.addEventListener("error", () => fallbackToEmbed(video, video._embedFallback, "404"), { once: true });
    }
    setMiddlePreview(video);
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
    const markerBtns = document.querySelectorAll("#skipMarkers .skip-marker-button");
    if (forceShow) {
      showButton(openBtn, openConfigured);
      showButton(nextBtn, nextConfigured);
      markerBtns.forEach((button) => showButton(button, true));
      return;
    }
    const os = skip.openingStart;
    showButton(openBtn, openConfigured && os != null && t >= os && t < os + SKIP_WINDOW);
    showButton(nextBtn, nextConfigured && t >= skip.nextStart && t < skip.nextStart + SKIP_WINDOW);
    markerBtns.forEach((button) => {
      const at = Number(button.dataset.showAt);
      const win = Number(button.dataset.window) || SKIP_WINDOW;
      showButton(button, t >= at && t < at + win);
    });
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
    if (!document.querySelector("#skipMarkers")) {
      const wrap = document.createElement("div");
      wrap.id = "skipMarkers";
      shell.appendChild(wrap);
    }
  }

  // Admin-defined custom buttons. Each marker appears in a timed window and
  // either seeks (skip recap/ending) or jumps to the next episode.
  function buildMarkerButtons(skip) {
    const wrap = document.querySelector("#skipMarkers");
    if (!wrap) return;
    wrap.innerHTML = "";
    const markers = skip && Array.isArray(skip.markers) ? skip.markers : [];
    markers.forEach((marker, index) => {
      if (marker.showAt == null) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skip-marker-button hidden";
      button.style.bottom = `${154 + index * 46}px`;
      button.textContent = marker.label || "Пропустить";
      button.dataset.showAt = marker.showAt;
      button.dataset.window = marker.hideAfter != null ? marker.hideAfter : SKIP_WINDOW;
      button.onclick = () => {
        if (marker.action === "next") document.querySelector("#nextEpisode")?.click();
        else if (marker.seekTo != null) seekTo(marker.seekTo);
      };
      wrap.appendChild(button);
    });
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
      attachHls(video, variant.file_url, variant.embed_fallback);
      video.classList.remove("hidden");
    }

    ensureOverlayButtons();
    document.querySelector("#skipIntroButton")?.classList.add("hidden");
    document.querySelector("#nextEpiOverlay")?.classList.add("hidden");
    const structure = (typeof state !== "undefined" && state.structures && state.structures[item.id]) || null;
    const epKey = `s${season}e${episode}`;
    activeSkip = (structure && structure.episodeSkips && structure.episodeSkips[epKey])
      || (structure && structure.skip) || null;
    buildMarkerButtons(activeSkip);

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

    meta.textContent = "";
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
    document.querySelector("#skipMarkers")?.replaceChildren();
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
    // The admin form in index.html is #sibnetForm (the old #mediaUploadForm id
    // never existed, which is why the button never showed up). Put a clear
    // auto-import block at the top of that admin-only form.
    const form = document.querySelector("#sibnetForm");
    if (!form || document.querySelector("#syncBunnyButton")) return;

    const box = document.createElement("div");
    box.className = "bunny-sync-box";

    const heading = document.createElement("h3");
    heading.className = "bunny-sync-title";
    heading.textContent = "Авто-загрузка из Bunny Stream";

    const hint = document.createElement("p");
    hint.className = "bunny-sync-hint";
    hint.textContent = "Просканирует всю библиотеку Bunny и сам разложит видео по аниме, сезонам и сериям.";

    const button = document.createElement("button");
    button.id = "syncBunnyButton";
    button.type = "button";
    button.className = "bunny-sync-button";
    button.textContent = "🔄 Синхронизировать Bunny Stream";

    const status = document.createElement("p");
    status.id = "syncBunnyStatus";
    status.className = "bunny-sync-status";

    box.append(heading, hint, button, status);
    form.prepend(box);

    button.addEventListener("click", async () => {
      button.disabled = true;
      status.textContent = "Сканирую Bunny Stream и сортирую видео...";
      try {
        const result = await bunnyRequest("/api/admin/bunny/sync", { method: "POST" });
        status.textContent = `Готово: ${result.synced} видео привязано, ${result.skipped.length} пропущено (из ${result.total ?? "?"}), коллекций-сезонов: ${result.collectionsFound ?? 0}.`;
        try {
          if (typeof state !== "undefined" && state.title && state.episode) {
            await loadBunnyAwareMedia(state.title, state.episode.season, state.episode.episode);
          }
        } catch {}
      } catch (error) {
        status.textContent = `Ошибка Bunny: ${error.message}. Проверьте Library ID и API-ключ.`;
      } finally {
        button.disabled = false;
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
