(() => {
  const narutoFallback = [
    ["Naruto Uzumaki", "Шиноби, который никогда не сдаётся и идёт к мечте стать Хокаге.", "https://cdn.myanimelist.net/images/characters/2/284121.jpg"],
    ["Sasuke Uchiha", "Наследник Учиха, разрывающийся между местью, силой и связями.", "https://cdn.myanimelist.net/images/characters/9/131317.jpg"],
    ["Sakura Haruno", "Медик-ниндзя с огромной физической силой и упорством.", "https://cdn.myanimelist.net/images/characters/9/69275.jpg"],
    ["Kakashi Hatake", "Спокойный наставник команды 7 и один из самых узнаваемых шиноби.", "https://cdn.myanimelist.net/images/characters/7/284129.jpg"]
  ];

  const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  function selectedNaruto() {
    const select = document.querySelector("#characterTitleSelect");
    const text = select?.selectedOptions?.[0]?.textContent || "";
    return /naruto/i.test(text);
  }

  function summarize(character) {
    const personal = character.personal || {};
    const debut = character.debut || {};
    const details = [
      personal.clan ? `клан: ${personal.clan}` : "",
      personal.affiliation ? `деревня: ${Array.isArray(personal.affiliation) ? personal.affiliation.join(", ") : personal.affiliation}` : "",
      character.jutsu?.length ? `дзюцу: ${character.jutsu.slice(0, 3).join(", ")}` : "",
      debut.appearsIn ? `появляется в: ${debut.appearsIn}` : ""
    ].filter(Boolean);
    return details.join(" • ") || "Персонаж вселенной Naruto из NarutoDB.";
  }

  function fallback() {
    return narutoFallback.map(([name, about, img]) => ({ name, about, img, anime: "Naruto", source: "fallback" }));
  }

  async function loadNarutoCharacters() {
    if (!selectedNaruto()) return;
    const grid = document.querySelector("#demonCharacters");
    if (!grid) return;
    grid.dataset.narutodbLoaded = "loading";
    grid.innerHTML = '<p class="api-status">Загружаем NarutoDB...</p>';

    try {
      const base = window.location.protocol === "file:" ? "http://localhost:3000" : "";
      const response = await fetch(`${base}/api/naruto/characters`);
      if (!response.ok) throw new Error("narutodb_unavailable");
      const payload = await response.json();
      const characters = Array.isArray(payload.characters) ? payload.characters : [];
      const items = characters
        .filter((character) => character?.name && character?.images?.[0])
        .slice(0, 60)
        .map((character) => ({
          name: character.name,
          anime: "Naruto",
          about: summarize(character),
          img: character.images[0],
          source: "NarutoDB",
          raw: character
        }));
      render(items.length ? items : fallback());
    } catch {
      render(fallback());
    }
  }

  function render(items) {
    const grid = document.querySelector("#demonCharacters");
    if (!grid || !selectedNaruto()) return;
    window.dangoCharacterDetails = items;
    grid.dataset.narutodbLoaded = "true";
    grid.innerHTML = items.map((item, index) => `
      <button class="demon-card demon-card-button" type="button" data-naruto-character="${index}">
        <img src="${escapeText(item.img)}" alt="${escapeText(item.name)}" loading="lazy">
        <h3>${escapeText(item.name)}</h3>
        <p>${escapeText(item.about)}</p>
      </button>
    `).join("");
    grid.querySelectorAll("[data-naruto-character]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = window.dangoCharacterDetails?.[Number(button.dataset.narutoCharacter)];
        if (item && typeof openCharacterModal === "function") openCharacterModal(item, "NarutoDB");
      });
    });
  }

  function install() {
    const select = document.querySelector("#characterTitleSelect");
    const grid = document.querySelector("#demonCharacters");
    const reload = document.querySelector("#reloadDemonApi");
    if (!select || !grid) return;

    const schedule = () => {
      if (!selectedNaruto()) return;
      window.clearTimeout(window.dangoNarutoTimer);
      window.dangoNarutoTimer = window.setTimeout(loadNarutoCharacters, 450);
    };

    select.addEventListener("change", schedule);
    reload?.addEventListener("click", schedule);

    const observer = new MutationObserver(() => {
      if (selectedNaruto() && grid.dataset.narutodbLoaded !== "true" && grid.dataset.narutodbLoaded !== "loading") {
        schedule();
      }
    });
    observer.observe(grid, { childList: true });
    schedule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    setTimeout(install, 0);
  }
})();
