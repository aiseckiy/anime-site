(() => {
  const canonicalMeta = {
    "Demon Slayer": { seasons: 4, episodes: 63, movies: 1 },
    "Jujutsu Kaisen": { seasons: 2, episodes: 47, movies: 1 },
    "Blue Lock": { seasons: 2, episodes: 38, movies: 1 },
    "Frieren: Beyond Journey's End": { seasons: 1, episodes: 28, movies: 0 },
    "Haikyu!!": { seasons: 4, episodes: 85, movies: 2 },
    "Spy x Family": { seasons: 2, episodes: 37, movies: 1 },
    "Chainsaw Man": { seasons: 1, episodes: 12, movies: 1 },
    "Bocchi the Rock!": { seasons: 1, episodes: 12, movies: 0 },
    "Attack on Titan": { seasons: 4, episodes: 94, movies: 0 },
    "One Piece": { seasons: 21, episodes: 1100, movies: 15 },
    "Naruto Shippuden": { seasons: 2, episodes: 720, movies: 7 },
    "Death Note": { seasons: 1, episodes: 37, movies: 0 },
    "Fullmetal Alchemist: Brotherhood": { seasons: 1, episodes: 64, movies: 1 },
    "My Hero Academia": { seasons: 7, episodes: 150, movies: 4 },
    "Solo Leveling": { seasons: 2, episodes: 25, movies: 0 },
    "Vinland Saga": { seasons: 2, episodes: 48, movies: 0 },
    "Mob Psycho 100": { seasons: 3, episodes: 37, movies: 0 },
    "Hunter x Hunter": { seasons: 1, episodes: 148, movies: 2 },
    "Tokyo Revengers": { seasons: 3, episodes: 50, movies: 0 },
    "Sword Art Online": { seasons: 4, episodes: 97, movies: 3 },
    "Your Name": { seasons: 0, episodes: 0, movies: 1 },
    "Weathering With You": { seasons: 0, episodes: 0, movies: 1 },
    "A Silent Voice": { seasons: 0, episodes: 0, movies: 1 },
    "Steins;Gate": { seasons: 2, episodes: 47, movies: 1 },
    "Code Geass": { seasons: 2, episodes: 50, movies: 4 },
    "Cowboy Bebop": { seasons: 1, episodes: 26, movies: 1 },
    "Neon Genesis Evangelion": { seasons: 1, episodes: 26, movies: 5 },
    "Violet Evergarden": { seasons: 1, episodes: 13, movies: 2 },
    "Kaguya-sama: Love is War": { seasons: 3, episodes: 37, movies: 1 },
    "Horimiya": { seasons: 2, episodes: 26, movies: 0 },
    "The Promised Neverland": { seasons: 2, episodes: 23, movies: 0 },
    "Black Clover": { seasons: 4, episodes: 170, movies: 1 },
    "Dr. Stone": { seasons: 4, episodes: 58, movies: 0 },
    "Bleach": { seasons: 17, episodes: 392, movies: 4 },
    "Dragon Ball Z": { seasons: 1, episodes: 291, movies: 15 },
    "Dragon Ball Super": { seasons: 1, episodes: 131, movies: 2 },
    "JoJo's Bizarre Adventure": { seasons: 6, episodes: 190, movies: 0 },
    "Tokyo Ghoul": { seasons: 4, episodes: 48, movies: 0 },
    "Parasyte": { seasons: 1, episodes: 24, movies: 0 },
    "Erased": { seasons: 1, episodes: 12, movies: 0 },
    "Made in Abyss": { seasons: 2, episodes: 25, movies: 3 },
    "Re:Zero": { seasons: 3, episodes: 66, movies: 2 },
    "Konosuba": { seasons: 3, episodes: 31, movies: 1 },
    "Mushoku Tensei": { seasons: 2, episodes: 48, movies: 0 },
    "That Time I Got Reincarnated as a Slime": { seasons: 3, episodes: 72, movies: 1 },
    "Overlord": { seasons: 4, episodes: 52, movies: 2 },
    "The Rising of the Shield Hero": { seasons: 3, episodes: 50, movies: 0 },
    "No Game No Life": { seasons: 1, episodes: 12, movies: 1 },
    "Noragami": { seasons: 2, episodes: 25, movies: 0 },
    "Assassination Classroom": { seasons: 2, episodes: 47, movies: 1 },
    "Classroom of the Elite": { seasons: 3, episodes: 38, movies: 0 },
    "Oshi no Ko": { seasons: 2, episodes: 24, movies: 0 },
    "Cyberpunk: Edgerunners": { seasons: 1, episodes: 10, movies: 0 },
    "Trigun Stampede": { seasons: 1, episodes: 12, movies: 0 },
    "Samurai Champloo": { seasons: 1, episodes: 26, movies: 0 },
    "Gintama": { seasons: 10, episodes: 367, movies: 3 },
    "Food Wars!": { seasons: 5, episodes: 86, movies: 0 },
    "Fairy Tail": { seasons: 9, episodes: 328, movies: 2 },
    "Fire Force": { seasons: 2, episodes: 48, movies: 0 },
    "Hell's Paradise": { seasons: 1, episodes: 13, movies: 0 },
    "Mashle": { seasons: 2, episodes: 24, movies: 0 },
    "Dandadan": { seasons: 1, episodes: 12, movies: 0 },
    "The Apothecary Diaries": { seasons: 2, episodes: 48, movies: 0 },
    "Delicious in Dungeon": { seasons: 1, episodes: 24, movies: 0 },
    "Kaiju No. 8": { seasons: 1, episodes: 12, movies: 0 },
    "Wind Breaker": { seasons: 1, episodes: 13, movies: 0 },
    "Wistoria": { seasons: 1, episodes: 12, movies: 0 },
    "Alya Sometimes Hides Her Feelings in Russian": { seasons: 1, episodes: 12, movies: 0 },
    "The Angel Next Door Spoils Me Rotten": { seasons: 1, episodes: 12, movies: 0 },
    "Clannad": { seasons: 2, episodes: 47, movies: 1 },
    "Toradora!": { seasons: 1, episodes: 25, movies: 0 },
    "Your Lie in April": { seasons: 1, episodes: 22, movies: 0 },
    "March Comes in Like a Lion": { seasons: 2, episodes: 44, movies: 0 },
    "Monster": { seasons: 1, episodes: 74, movies: 0 },
    "Psycho-Pass": { seasons: 3, episodes: 41, movies: 5 },
    "Hellsing Ultimate": { seasons: 1, episodes: 10, movies: 0 },
    "Berserk": { seasons: 3, episodes: 49, movies: 3 },
    "Fate/Zero": { seasons: 2, episodes: 25, movies: 0 },
    "Fate/stay night: Unlimited Blade Works": { seasons: 2, episodes: 26, movies: 0 },
    "The Eminence in Shadow": { seasons: 2, episodes: 32, movies: 0 },
    "Lycoris Recoil": { seasons: 1, episodes: 13, movies: 0 },
    "86 Eighty-Six": { seasons: 2, episodes: 23, movies: 0 },
    "Gurren Lagann": { seasons: 1, episodes: 27, movies: 2 }
  };

  const fallbackCharacters = {
    "Demon Slayer": [
      ["Tanjiro Kamado", "Demon Slayer", "Истребитель демонов с мягким сердцем и сильной волей.", "https://cdn.myanimelist.net/images/characters/6/386735.jpg"],
      ["Nezuko Kamado", "Demon Slayer", "Девушка-демон, которая держится за человечность и семью.", "https://cdn.myanimelist.net/images/characters/10/468285.jpg"],
      ["Zenitsu Agatsuma", "Demon Slayer", "Тревожный, шумный и невероятно быстрый мечник грома.", "https://cdn.myanimelist.net/images/characters/9/422894.jpg"],
      ["Inosuke Hashibira", "Demon Slayer", "Дикий боец, который превращает любой бой в испытание характера.", "https://cdn.myanimelist.net/images/characters/10/422893.jpg"]
    ],
    "Naruto Shippuden": [
      ["Naruto Uzumaki", "Naruto", "Шиноби, который никогда не сдаётся и идёт к мечте стать Хокаге.", "https://cdn.myanimelist.net/images/characters/2/284121.jpg"],
      ["Sasuke Uchiha", "Naruto", "Наследник Учиха, разрывающийся между местью, силой и связями.", "https://cdn.myanimelist.net/images/characters/9/131317.jpg"],
      ["Sakura Haruno", "Naruto", "Медик-ниндзя с огромной физической силой и упорством.", "https://cdn.myanimelist.net/images/characters/9/69275.jpg"],
      ["Kakashi Hatake", "Naruto", "Спокойный наставник команды 7 и один из самых узнаваемых шиноби.", "https://cdn.myanimelist.net/images/characters/7/284129.jpg"]
    ],
    "Jujutsu Kaisen": [
      ["Yuji Itadori", "Jujutsu Kaisen", "Добрый и прямой ученик, оказавшийся сосудом Сукуны.", "https://cdn.myanimelist.net/images/characters/14/422877.jpg"],
      ["Megumi Fushiguro", "Jujutsu Kaisen", "Сдержанный шаман с техникой теней и сильным чувством справедливости.", "https://cdn.myanimelist.net/images/characters/5/422876.jpg"],
      ["Nobara Kugisaki", "Jujutsu Kaisen", "Резкая, стильная и уверенная шаманка с техникой соломенной куклы.", "https://cdn.myanimelist.net/images/characters/16/422875.jpg"],
      ["Satoru Gojo", "Jujutsu Kaisen", "Самый сильный шаман современности и харизматичный наставник.", "https://cdn.myanimelist.net/images/characters/15/422874.jpg"]
    ],
    "Attack on Titan": [
      ["Eren Yeager", "Attack on Titan", "Герой, чья жажда свободы меняет судьбу всего мира.", "https://cdn.myanimelist.net/images/characters/10/216895.jpg"],
      ["Mikasa Ackerman", "Attack on Titan", "Одна из сильнейших бойцов разведкорпуса.", "https://cdn.myanimelist.net/images/characters/9/215563.jpg"],
      ["Armin Arlert", "Attack on Titan", "Стратег, чья сила чаще всего в голове, а не в кулаках.", "https://cdn.myanimelist.net/images/characters/14/216895.jpg"],
      ["Levi Ackerman", "Attack on Titan", "Капитан разведкорпуса и символ холодной эффективности.", "https://cdn.myanimelist.net/images/characters/2/241413.jpg"]
    ],
    "Haikyu!!": [
      ["Shoyo Hinata", "Haikyu!!", "Низкий, взрывной и невероятно энергичный волейболист.", "https://cdn.myanimelist.net/images/characters/9/239871.jpg"],
      ["Tobio Kageyama", "Haikyu!!", "Гениальный связующий, который учится играть вместе с командой.", "https://cdn.myanimelist.net/images/characters/12/239873.jpg"],
      ["Kei Tsukishima", "Haikyu!!", "Ироничный блокирующий с холодной головой и точным чтением игры.", "https://cdn.myanimelist.net/images/characters/11/243093.jpg"],
      ["Tetsuro Kuroo", "Haikyu!!", "Капитан Некомы, мастер блоков и психологической игры.", "https://cdn.myanimelist.net/images/characters/16/246153.jpg"]
    ],
    "One Piece": [
      ["Monkey D. Luffy", "One Piece", "Капитан Соломенной Шляпы, который ищет свободу и One Piece.", "https://cdn.myanimelist.net/images/characters/9/310307.jpg"],
      ["Roronoa Zoro", "One Piece", "Мечник трёх мечей и правая рука Луффи.", "https://cdn.myanimelist.net/images/characters/3/100534.jpg"],
      ["Nami", "One Piece", "Навигатор команды, без которой море быстро становится ловушкой.", "https://cdn.myanimelist.net/images/characters/2/263249.jpg"],
      ["Sanji", "One Piece", "Повар, джентльмен и мастер боя ногами.", "https://cdn.myanimelist.net/images/characters/5/136769.jpg"]
    ]
  };

  const todayQuotes = [
    "Ты сегодня много трудился. Продолжай в том же духе.",
    "Даже маленький шаг считается, если он двигает тебя вперёд.",
    "Сохрани свой темп: сильные арки не раскрываются за одну серию.",
    "Сегодня хороший день, чтобы выбрать себя и не бросить начатое.",
    "Спокойно. У главного героя тоже бывают серии перед рывком."
  ];

  const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  const compactText = (value, max = 110) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  };

  function formatCounts(item) {
    const meta = canonicalMeta[item?.name] || item || {};
    const chunks = [];
    if (meta.seasons > 0) chunks.push(`${meta.seasons} сезон${meta.seasons === 1 ? "" : "а"}`);
    if (meta.episodes > 0) chunks.push(`${meta.episodes} серий`);
    if (meta.movies > 0) chunks.push(`${meta.movies} фильм${meta.movies === 1 ? "" : "а"}`);
    return chunks.join(" • ") || "1 фильм";
  }

  function applyCanonicalMeta() {
    if (typeof knownMeta !== "undefined") Object.assign(knownMeta, canonicalMeta);
    if (typeof titles !== "undefined") {
      titles.forEach((item) => Object.assign(item, canonicalMeta[item.name] || {}));
    }
    try {
      getCountInfo = formatCounts;
    } catch {}
  }

  function installCompactHistory() {
    try {
      renderHistory = function renderHistory() {
        const target = document.querySelector("#historyCard");
        if (!target) return;
        const history = JSON.parse(localStorage.getItem("dangoHistory") || "[]");
        if (!history.length) {
          target.innerHTML = "<p>История станет длиннее по мере открытия тайтлов.</p>";
          return;
        }
        target.innerHTML = history.map((entry) => `
          <button class="history-row" data-id="${entry.id}">
            <img src="${escapeText(entry.image || "")}" alt="">
            <span>${escapeText(entry.name)}</span>
          </button>
        `).join("");
        target.querySelectorAll(".history-row").forEach((row) => {
          row.addEventListener("click", () => {
            const item = typeof titles !== "undefined"
              ? titles.find((title) => title.id === Number(row.dataset.id))
              : null;
            if (item && typeof openTitle === "function") openTitle(item);
          });
        });
        const watchedList = document.querySelector("#watchedList");
        if (watchedList) watchedList.textContent = history.map((entry) => entry.name).join(", ");
      };
    } catch {}
  }

  function fallbackFor(item) {
    const source = fallbackCharacters[item?.name] || [
      [item?.name || "Anime Hero", item?.name || "Anime", "Главный персонаж выбранного тайтла.", item?.image],
      [`${item?.name || "Anime"} character`, item?.name || "Anime", "Важный герой истории, который раскрывает атмосферу тайтла.", item?.image]
    ];
    return source.map(([name, anime, about, img]) => ({ name, anime, about, img: img || item?.image }));
  }

  async function fetchCharactersFor(item) {
    if (!item) return [];
    let api = item.api;
    if ((!api || !api.mal_id) && typeof fetchAnimeData === "function") {
      api = await fetchAnimeData(item);
    }
    if (!api?.mal_id) return fallbackFor(item);
    const response = await fetch(`${JIKAN}/anime/${api.mal_id}/characters`);
    if (!response.ok) throw new Error("characters_not_loaded");
    const payload = await response.json();
    const loaded = (payload.data || []).slice(0, 24).map((entry) => ({
      name: entry.character?.name || "Character",
      anime: item.name,
      about: entry.role ? `${entry.role} персонаж тайтла ${item.name}.` : `Персонаж тайтла ${item.name}.`,
      img: entry.character?.images?.jpg?.image_url || item.image,
      url: entry.character?.url || ""
    }));
    return loaded.length ? loaded : fallbackFor(item);
  }

  function fillCharacterSelect() {
    const select = document.querySelector("#characterTitleSelect");
    if (!select || typeof titles === "undefined") return;
    select.innerHTML = titles.map((item) => `<option value="${item.id}">${escapeText(item.name)}</option>`).join("");
  }

  function renderCharacters(items) {
    const grid = document.querySelector("#demonCharacters");
    if (!grid) return;
    window.dangoCharacterDetails = items;
    grid.innerHTML = items.map((item, index) => `
      <button class="demon-card demon-card-button" type="button" data-character-index="${index}">
        <img src="${escapeText(item.img || item.image || "")}" alt="${escapeText(item.name)}" loading="lazy">
        <h3>${escapeText(item.name)}</h3>
        <p>${escapeText(compactText(item.about || item.anime || "Персонаж выбранного тайтла.", 96))}</p>
      </button>
    `).join("");
    grid.querySelectorAll("[data-character-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = window.dangoCharacterDetails[Number(button.dataset.characterIndex)];
        if (typeof openCharacterModal === "function") openCharacterModal(item, item?.anime || "Персонаж");
      });
    });
  }

  function renderToday(items) {
    const panel = document.querySelector("#todayCharacter");
    if (!panel) return;
    const pool = items?.length ? items : Object.values(fallbackCharacters).flat().map(([name, anime, about, img]) => ({ name, anime, about, img }));
    const character = pool[Math.floor(Math.random() * pool.length)];
    const quote = todayQuotes[Math.floor(Math.random() * todayQuotes.length)];
    panel.innerHTML = `
      <article class="today-card">
        <img src="${escapeText(character.img || character.image || "")}" alt="${escapeText(character.name)}" loading="lazy">
        <div>
          <p class="eyebrow">Today's character</p>
          <h2>${escapeText(character.name)}</h2>
          <p>${escapeText(character.anime || "")}</p>
          <blockquote>${escapeText(quote)}</blockquote>
        </div>
      </article>
    `;
  }

  async function loadSelectedCharacters() {
    const select = document.querySelector("#characterTitleSelect");
    const grid = document.querySelector("#demonCharacters");
    if (!select || typeof titles === "undefined") return;
    const item = titles.find((title) => String(title.id) === String(select.value)) || titles[0];
    if (grid) grid.innerHTML = '<p class="api-status">Загружаем персонажей...</p>';
    try {
      const items = await fetchCharactersFor(item);
      renderCharacters(items);
      renderToday(items);
    } catch {
      const items = fallbackFor(item);
      renderCharacters(items);
      renderToday(items);
    }
  }

  function installCharacterUi() {
    const stylesBlock = document.querySelector("#demonStyles");
    if (stylesBlock) stylesBlock.remove();

    const tabs = document.querySelector(".demon-tabs");
    const characters = document.querySelector("#demonCharacters");
    const today = document.querySelector("#todayCharacter");
    if (tabs) {
      tabs.innerHTML = `
        <button class="active" data-demon-tab="characters" type="button">Персонажи</button>
        <button data-demon-tab="today" type="button">Today's character</button>
      `;
      tabs.querySelectorAll("[data-demon-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          tabs.querySelectorAll("button").forEach((tab) => tab.classList.remove("active"));
          button.classList.add("active");
          characters?.classList.toggle("active", button.dataset.demonTab === "characters");
          today?.classList.toggle("active", button.dataset.demonTab === "today");
        });
      });
    }

    const select = document.querySelector("#characterTitleSelect");
    select?.addEventListener("change", loadSelectedCharacters);

    const reload = document.querySelector("#reloadDemonApi");
    if (reload) {
      const freshReload = reload.cloneNode(true);
      reload.replaceWith(freshReload);
      freshReload.addEventListener("click", loadSelectedCharacters);
    }

    try {
      loadDemonSlayerApi = loadSelectedCharacters;
    } catch {}
  }

  function refreshRenderedLists() {
    ["renderCatalog", "renderHome", "renderRecommendations", "renderHistory"].forEach((name) => {
      if (typeof window[name] === "function") window[name]();
      try {
        if (typeof eval(name) === "function") eval(name)();
      } catch {}
    });
  }

  function boot() {
    applyCanonicalMeta();
    installCompactHistory();
    fillCharacterSelect();
    installCharacterUi();
    refreshRenderedLists();
    loadSelectedCharacters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    setTimeout(boot, 0);
  }
})();
