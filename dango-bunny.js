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

  function applyVariant(variant, item, season, episode) {
    const { video, play, meta } = playerElements();
    const iframe = ensureIframe();
    if (!variant || !video || !play || !meta) return;

    // Show a preview frame (poster) instead of a black screen. Nothing
    // autoplays — the user starts playback with the built-in play button.
    play.classList.add("hidden");

    if (variant.embed_url && iframe) {
      video.classList.add("hidden");
      video.removeAttribute("src");
      const url = new URL(variant.embed_url);
      url.searchParams.set("autoplay", "false");
      url.searchParams.set("preview", "true");
      iframe.src = url.toString();
      iframe.classList.remove("hidden");
    } else if (variant.file_url) {
      iframe?.classList.add("hidden");
      if (iframe) iframe.removeAttribute("src");
      video.preload = "metadata";
      video.src = variant.file_url;
      video.classList.remove("hidden");
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
        uploadStatus.textContent = `Bunny готов: ${result.synced} видео привязано, ${result.skipped.length} пропущено.`;
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
