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
      status.textContent = "Сохраняю...";
      try {
        const data = await api(`/api/admin/structure/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ seasons })
        });
        state.structures[item.id] = data.structure || { seasons };
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
    panel.append(heading, list, addSeason, status, actions);
    overlay.append(panel);
    overlay.addEventListener("click", () => overlay.remove());
    document.body.append(overlay);
  };
})();
