(() => {
  // Admin editor for season/arc structure. Relies on globals from script.js:
  // state, api, isAdmin, renderSeasons, titleSeasons.

  function cloneSeasons(item) {
    return titleSeasons(item).map((season) => ({
      title: season.title || "",
      episodes: Math.max(1, Number(season.episodes) || 1),
      arcs: (Array.isArray(season.arcs) ? season.arcs : []).map((arc) => ({
        name: arc.name || "",
        from: Math.max(1, Number(arc.from) || 1),
        to: Math.max(1, Number(arc.to) || 1)
      }))
    }));
  }

  function field(labelText, input) {
    const label = document.createElement("label");
    label.className = "se-field";
    label.append(document.createTextNode(labelText), input);
    return label;
  }

  function numberInput(value, min = 1) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(min);
    input.value = String(value);
    return input;
  }

  // Timecodes accept either "m:ss" or plain seconds; stored as seconds.
  function parseTime(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return null;
    if (raw.includes(":")) {
      const [m, s] = raw.split(":");
      const total = (Number(m) || 0) * 60 + (Number(s) || 0);
      return Number.isFinite(total) && total >= 0 ? Math.floor(total) : null;
    }
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  function formatTime(seconds) {
    if (seconds == null || seconds === "") return "";
    const n = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  }

  function timeInput(seconds, placeholder) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.value = formatTime(seconds);
    return input;
  }

  function readModel(listNode) {
    return [...listNode.querySelectorAll(".se-season")].map((seasonNode) => {
      const episodes = Math.max(1, Number(seasonNode.querySelector(".se-eps").value) || 1);
      return {
        title: seasonNode.querySelector(".se-title").value,
        episodes,
        arcs: [...seasonNode.querySelectorAll(".se-arc")].map((arcNode) => ({
          name: arcNode.querySelector(".se-arc-name").value,
          from: Math.max(1, Number(arcNode.querySelector(".se-arc-from").value) || 1),
          to: Math.max(1, Number(arcNode.querySelector(".se-arc-to").value) || 1)
        }))
      };
    });
  }

  function buildArcRow(arc) {
    const row = document.createElement("div");
    row.className = "se-arc";

    const name = document.createElement("input");
    name.type = "text";
    name.className = "se-arc-name";
    name.placeholder = "Название арки";
    name.value = arc.name || "";

    const from = numberInput(arc.from || 1);
    from.className = "se-arc-from";
    const to = numberInput(arc.to || 1);
    to.className = "se-arc-to";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "se-remove-arc";
    remove.textContent = "×";
    remove.title = "Удалить арку";
    remove.addEventListener("click", () => row.remove());

    row.append(name, field("с ", from), field("по ", to), remove);
    return row;
  }

  function buildSeasonCard(season, index, renderList) {
    const card = document.createElement("div");
    card.className = "se-season";

    const head = document.createElement("div");
    head.className = "se-season-head";

    const title = document.createElement("input");
    title.type = "text";
    title.className = "se-title";
    title.placeholder = `Название сезона (по умолчанию «${index + 1} сезон»)`;
    title.value = season.title || "";

    const eps = numberInput(season.episodes || 1);
    eps.className = "se-eps";

    const removeSeason = document.createElement("button");
    removeSeason.type = "button";
    removeSeason.className = "se-remove-season";
    removeSeason.textContent = "Удалить сезон";
    removeSeason.addEventListener("click", () => {
      card.remove();
    });

    head.append(title, field("Серий: ", eps), removeSeason);

    const arcs = document.createElement("div");
    arcs.className = "se-arcs";
    (season.arcs || []).forEach((arc) => arcs.append(buildArcRow(arc)));

    const addArc = document.createElement("button");
    addArc.type = "button";
    addArc.className = "se-add-arc";
    addArc.textContent = "+ Добавить арку";
    addArc.addEventListener("click", () => arcs.append(buildArcRow({ name: "", from: 1, to: 1 })));

    card.append(head, arcs, addArc);
    return card;
  }

  // One custom-button row: label + show-at + action (seek/next) + seek-to.
  function buildMarkerRow(marker = {}) {
    const row = document.createElement("div");
    row.className = "se-marker";

    const label = document.createElement("input");
    label.type = "text";
    label.className = "se-marker-label";
    label.placeholder = "Текст кнопки (напр. Пропустить заставку)";
    label.value = marker.label || "";

    const showAt = timeInput(marker.showAt, "показать с, напр. 0:30");
    showAt.className = "se-marker-show";

    const action = document.createElement("select");
    action.className = "se-marker-action";
    action.innerHTML = `<option value="seek">Перемотать до…</option><option value="next">Следующая серия</option>`;
    action.value = marker.action === "next" ? "next" : "seek";

    const seekTo = timeInput(marker.seekTo, "до, напр. 1:30");
    seekTo.className = "se-marker-seek";
    const syncSeek = () => { seekTo.style.display = action.value === "next" ? "none" : ""; };
    action.addEventListener("change", syncSeek);
    syncSeek();

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "se-remove-arc";
    remove.textContent = "×";
    remove.title = "Удалить кнопку";
    remove.addEventListener("click", () => row.remove());

    row.append(label, field("⏱ ", showAt), action, seekTo, remove);
    return row;
  }

  // Reusable "buttons in the player" editor (skip timecodes + custom buttons).
  // Returns the DOM node plus a read() that yields the skip object.
  function buildSkipSection(currentSkip = {}) {
    const box = document.createElement("div");
    box.className = "se-skip";

    const skipTitle = document.createElement("h3");
    skipTitle.textContent = "Кнопки в плеере (таймкоды, формат м:сс)";
    const openStartInput = timeInput(currentSkip.openingStart, "напр. 1:25");
    const openEndInput = timeInput(currentSkip.openingEnd, "напр. 2:55");
    const nextStartInput = timeInput(currentSkip.nextStart, "напр. 22:30");
    box.append(
      skipTitle,
      field("«Пропустить опенинг» — показать с ", openStartInput),
      field("…и перемотать до ", openEndInput),
      field("«Следующая серия» — показать с ", nextStartInput)
    );

    const markersWrap = document.createElement("div");
    markersWrap.className = "se-markers";
    (Array.isArray(currentSkip.markers) ? currentSkip.markers : []).forEach((marker) => markersWrap.append(buildMarkerRow(marker)));

    const markersTitle = document.createElement("h3");
    markersTitle.textContent = "Доп. кнопки (можно добавлять свои)";
    const addMarker = document.createElement("button");
    addMarker.type = "button";
    addMarker.className = "se-add-arc";
    addMarker.textContent = "+ Добавить кнопку";
    addMarker.addEventListener("click", () => markersWrap.append(buildMarkerRow()));
    box.append(markersTitle, markersWrap, addMarker);

    const read = () => ({
      openingStart: parseTime(openStartInput.value),
      openingEnd: parseTime(openEndInput.value),
      nextStart: parseTime(nextStartInput.value),
      markers: [...markersWrap.querySelectorAll(".se-marker")].map((row) => {
        const action = row.querySelector(".se-marker-action").value === "next" ? "next" : "seek";
        return {
          label: row.querySelector(".se-marker-label").value,
          showAt: parseTime(row.querySelector(".se-marker-show").value),
          action,
          seekTo: action === "seek" ? parseTime(row.querySelector(".se-marker-seek").value) : null
        };
      }).filter((marker) => marker.showAt != null)
    });

    return { node: box, read };
  }

  // Focused editor opened from the player: edits ONLY the buttons for the
  // currently open episode (no season/arc structure).
  window.openPlayerButtonsEditor = function openPlayerButtonsEditor(item, season, episode) {
    if (!isAdmin() || !item) return;
    document.querySelector(".se-overlay")?.remove();

    const structure = state.structures[item.id] || {};
    const key = `s${season}e${episode}`;
    const currentSkip = (structure.episodeSkips && structure.episodeSkips[key]) || {};

    const overlay = document.createElement("div");
    overlay.className = "se-overlay";
    const panel = document.createElement("div");
    panel.className = "se-panel";
    panel.addEventListener("click", (event) => event.stopPropagation());

    const heading = document.createElement("h2");
    heading.textContent = `Кнопки плеера — ${season} сезон, ${episode} серия`;
    const hint = document.createElement("p");
    hint.className = "se-status";
    hint.textContent = `${item.name}. Настройки действуют только для этой серии.`;

    const skip = buildSkipSection(currentSkip);

    const status = document.createElement("p");
    status.className = "se-status";

    const actions = document.createElement("div");
    actions.className = "se-actions";

    const save = document.createElement("button");
    save.type = "button";
    save.className = "se-save";
    save.textContent = "Сохранить";
    save.addEventListener("click", async () => {
      status.textContent = "Сохраняю...";
      try {
        const data = await api(`/api/admin/episode-skip/${item.id}/${season}/${episode}`, {
          method: "PUT",
          body: JSON.stringify({ skip: skip.read() })
        });
        if (data.structure) state.structures[item.id] = data.structure;
        overlay.remove();
      } catch (error) {
        status.textContent = `Ошибка: ${error.message}`;
      }
    });

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "se-reset";
    reset.textContent = "Очистить для этой серии";
    reset.addEventListener("click", async () => {
      status.textContent = "Очищаю...";
      try {
        const data = await api(`/api/admin/episode-skip/${item.id}/${season}/${episode}`, {
          method: "PUT",
          body: JSON.stringify({ skip: { openingStart: null, openingEnd: null, nextStart: null, markers: [] } })
        });
        if (data.structure) state.structures[item.id] = data.structure;
        overlay.remove();
      } catch (error) {
        status.textContent = `Ошибка: ${error.message}`;
      }
    });

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "se-cancel";
    cancel.textContent = "Отмена";
    cancel.addEventListener("click", () => overlay.remove());

    actions.append(save, reset, cancel);
    panel.append(heading, hint, skip.node, status, actions);
    overlay.append(panel);
    overlay.addEventListener("click", () => overlay.remove());
    document.body.append(overlay);
  };

  window.openStructureEditor = function openStructureEditor(item) {
    if (!isAdmin()) return;
    document.querySelector(".se-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "se-overlay";

    const panel = document.createElement("div");
    panel.className = "se-panel";
    panel.addEventListener("click", (event) => event.stopPropagation());

    const heading = document.createElement("h2");
    heading.textContent = `Структура: ${item.name}`;

    const list = document.createElement("div");
    list.className = "se-list";

    const renderList = (model) => {
      list.innerHTML = "";
      model.forEach((season, index) => list.append(buildSeasonCard(season, index, renderList)));
    };
    renderList(cloneSeasons(item));

    const addSeason = document.createElement("button");
    addSeason.type = "button";
    addSeason.className = "se-add-season";
    addSeason.textContent = "+ Добавить сезон";
    addSeason.addEventListener("click", () => {
      list.append(buildSeasonCard({ title: "", episodes: 12, arcs: [] }, list.children.length, renderList));
    });

    const currentSkip = (state.structures[item.id] && state.structures[item.id].skip) || {};
    const skip = buildSkipSection(currentSkip);
    const skipBox = skip.node;

    const status = document.createElement("p");
    status.className = "se-status";

    const actions = document.createElement("div");
    actions.className = "se-actions";

    const save = document.createElement("button");
    save.type = "button";
    save.className = "se-save";
    save.textContent = "Сохранить";
    save.addEventListener("click", async () => {
      const seasons = readModel(list);
      const skipData = skip.read();
      const episodeSkips = (state.structures[item.id] && state.structures[item.id].episodeSkips) || {};
      status.textContent = "Сохраняю...";
      try {
        const data = await api(`/api/admin/structure/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ seasons, skip: skipData, episodeSkips })
        });
        state.structures[item.id] = data.structure || { seasons, skip: skipData, episodeSkips };
        overlay.remove();
        renderSeasons(item);
      } catch (error) {
        status.textContent = `Ошибка: ${error.message}`;
      }
    });

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "se-reset";
    reset.textContent = "Сбросить к стандарту";
    reset.addEventListener("click", async () => {
      status.textContent = "Сбрасываю...";
      try {
        await api(`/api/admin/structure/${item.id}`, { method: "DELETE" });
        state.structures[item.id] = null;
        overlay.remove();
        renderSeasons(item);
      } catch (error) {
        status.textContent = `Ошибка: ${error.message}`;
      }
    });

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "se-cancel";
    cancel.textContent = "Отмена";
    cancel.addEventListener("click", () => overlay.remove());

    actions.append(save, reset, cancel);
    panel.append(heading, list, addSeason, skipBox, status, actions);
    overlay.append(panel);
    overlay.addEventListener("click", () => overlay.remove());
    document.body.append(overlay);
  };
})();
