(() => {
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

  function applyVariant(variant, item, season, episode) {
    const { video, play, meta } = playerElements();
    const iframe = ensureIframe();
    if (!variant || !video || !play || !meta) return;

    if (variant.embed_url) {
      video.classList.add("hidden");
      video.removeAttribute("src");
      if (iframe) {
        iframe.src = variant.embed_url;
        iframe.classList.remove("hidden");
      }
      play.classList.add("hidden");
    } else if (variant.file_url) {
      iframe?.classList.add("hidden");
      if (iframe) iframe.removeAttribute("src");
      video.src = variant.file_url;
      video.classList.remove("hidden");
      play.classList.add("hidden");
    }

    const progress = typeof getSavedProgress === "function" ? getSavedProgress(item.id, season, episode) : 0;
    meta.textContent = `${variant.original_name || item.name} • ${labelVariant(variant)} • продолжить с ${progress}% просмотра.`;
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
      const data = await apiRequest(`/api/media/${item.id}/${season}/${episode}`);
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
        const result = await apiRequest("/api/admin/bunny/sync", { method: "POST" });
        uploadStatus.textContent = `Bunny готов: ${result.synced} видео привязано, ${result.skipped.length} пропущено.`;
        if (typeof currentTitle !== "undefined" && currentEpisode) {
          await loadBunnyAwareMedia(currentTitle, currentEpisode.season, currentEpisode.episode);
        }
      } catch (error) {
        uploadStatus.textContent = `Bunny ошибка: ${error.message}`;
      }
    });
  }

  function boot() {
    try {
      loadEpisodeMedia = loadBunnyAwareMedia;
    } catch {}
    installBunnySyncButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    setTimeout(boot, 0);
  }
})();
