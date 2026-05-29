const JIKAN = "https://api.jikan.moe/v4";
const DEMON_API = "https://www.demonslayer-api.com/api/v1";
const NARUTO_API = "https://narutodb.xyz/api";
const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000" : "";
const ADMIN_EMAIL = "adilhan.bekentaev@mail.ru";
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='100%25' height='100%25' fill='%231b1018'/%3E%3Ctext x='50%25' y='50%25' fill='%23ff4fa2' font-family='sans-serif' font-size='30' font-weight='bold' text-anchor='middle' dominant-baseline='middle'%3EDANGO%3C/text%3E%3C/svg%3E";

function fallbackImg(img) {
  img.onerror = null;
  img.src = PLACEHOLDER_IMG;
}
window.fallbackImg = fallbackImg;

const anime = [
  ["Demon Slayer", "Клинок, рассекающий демонов", "demon slayer", "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg", 4, 63, 1],
  ["Jujutsu Kaisen", "Магическая битва", "jujutsu kaisen", "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg", 2, 47, 1],
  ["Attack on Titan", "Атака титанов", "attack on titan", "https://cdn.myanimelist.net/images/anime/10/47347l.jpg", 4, 94, 0],
  ["Haikyu!!", "Волейбол", "haikyuu", "https://cdn.myanimelist.net/images/anime/7/76014l.jpg", 4, 85, 2],
  ["Naruto Shippuden", "Наруто", "naruto shippuden", "https://cdn.myanimelist.net/images/anime/1565/111305l.jpg", 2, 720, 7],
  ["One Piece", "Ван Пис", "one piece", "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", 21, 1100, 15],
  ["Death Note", "Тетрадь смерти", "death note", "https://cdn.myanimelist.net/images/anime/9/9453l.jpg", 1, 37, 0],
  ["Fullmetal Alchemist: Brotherhood", "Стальной алхимик", "fullmetal alchemist brotherhood", "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg", 1, 64, 1],
  ["My Hero Academia", "Моя геройская академия", "my hero academia", "https://cdn.myanimelist.net/images/anime/10/78745l.jpg", 7, 150, 4],
  ["Chainsaw Man", "Человек-бензопила", "chainsaw man", "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg", 1, 12, 0],
  ["Blue Lock", "Синяя тюрьма", "blue lock", "https://cdn.myanimelist.net/images/anime/1258/126929l.jpg", 2, 38, 1],
  ["Frieren: Beyond Journey's End", "Фрирен", "frieren beyond journey", "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg", 1, 28, 0],
  ["Spy x Family", "Семья шпиона", "spy x family", "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg", 2, 37, 1],
  ["Tokyo Ghoul", "Токийский гуль", "tokyo ghoul", "https://cdn.myanimelist.net/images/anime/5/64449l.jpg", 4, 48, 0],
  ["Black Clover", "Черный клевер", "black clover", "https://cdn.myanimelist.net/images/anime/2/88336l.jpg", 4, 170, 1],
  ["Hunter x Hunter", "Охотник х Охотник", "hunter x hunter", "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg", 1, 148, 0],
  ["Bleach", "Блич", "bleach", "https://cdn.myanimelist.net/images/anime/3/40451l.jpg", 17, 392, 4],
  ["Dragon Ball Z", "Драконий жемчуг Z", "dragon ball z", "https://cdn.myanimelist.net/images/anime/1277/142022l.jpg", 9, 291, 15],
  ["Violet Evergarden", "Вайолет Эвергарден", "violet evergarden", "https://cdn.myanimelist.net/images/anime/1795/95088l.jpg", 1, 13, 2],
  ["Code Geass", "Код Гиас", "code geass", "https://cdn.myanimelist.net/images/anime/1032/135088l.jpg", 2, 50, 3],
  ["Cowboy Bebop", "Ковбой Бибоп", "cowboy bebop", "https://cdn.myanimelist.net/images/anime/4/19644l.jpg", 1, 26, 1],
  ["Neon Genesis Evangelion", "Евангелион", "neon genesis evangelion", "https://cdn.myanimelist.net/images/anime/1314/108941l.jpg", 1, 26, 5],
  ["Solo Leveling", "Поднятие уровня в одиночку", "solo leveling", "https://cdn.myanimelist.net/images/anime/1926/140799l.jpg", 2, 25, 0],
  ["Vinland Saga", "Сага о Винланде", "vinland saga", "https://cdn.myanimelist.net/images/anime/1500/103005l.jpg", 2, 48, 0],
  ["Mob Psycho 100", "Моб Психо 100", "mob psycho 100", "https://cdn.myanimelist.net/images/anime/8/80356l.jpg", 3, 37, 0],
  ["Tokyo Revengers", "Токийские мстители", "tokyo revengers", "https://cdn.myanimelist.net/images/anime/1839/122012l.jpg", 3, 50, 0],
  ["Sword Art Online", "Мастера меча онлайн", "sword art online", "https://cdn.myanimelist.net/images/anime/11/39717l.jpg", 4, 96, 2],
  ["Your Name", "Твое имя", "your name", "https://cdn.myanimelist.net/images/anime/5/87048l.jpg", 1, 1, 1],
  ["Weathering With You", "Дитя погоды", "weathering with you", "https://cdn.myanimelist.net/images/anime/1880/101146l.jpg", 1, 1, 1],
  ["A Silent Voice", "Форма голоса", "a silent voice", "https://cdn.myanimelist.net/images/anime/1122/96435l.jpg", 1, 1, 1],
  ["Steins;Gate", "Врата Штейна", "steins gate", "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg", 1, 24, 1],
  ["Kaguya-sama: Love is War", "Госпожа Кагуя", "kaguya sama love is war", "https://cdn.myanimelist.net/images/anime/1295/106551l.jpg", 3, 37, 1],
  ["Horimiya", "Хоримия", "horimiya", "https://cdn.myanimelist.net/images/anime/1695/111486l.jpg", 2, 26, 0],
  ["The Promised Neverland", "Обещанный Неверленд", "promised neverland", "https://cdn.myanimelist.net/images/anime/1125/96929l.jpg", 2, 23, 0],
  ["Dr. Stone", "Доктор Стоун", "dr stone", "https://cdn.myanimelist.net/images/anime/1613/102576l.jpg", 3, 57, 1],
  ["JoJo's Bizarre Adventure", "Невероятные приключения ДжоДжо", "jojo bizarre adventure", "https://cdn.myanimelist.net/images/anime/3/40409l.jpg", 6, 190, 0],
  ["Parasyte", "Паразит", "parasyte", "https://cdn.myanimelist.net/images/anime/3/73178l.jpg", 1, 24, 0],
  ["Erased", "Город, в котором меня нет", "erased", "https://cdn.myanimelist.net/images/anime/10/77957l.jpg", 1, 12, 0],
  ["Made in Abyss", "Созданный в Бездне", "made in abyss", "https://cdn.myanimelist.net/images/anime/6/86733l.jpg", 2, 25, 3],
  ["Re:Zero", "Ре:Зеро", "rezero", "https://cdn.myanimelist.net/images/anime/11/79410l.jpg", 3, 66, 1],
  ["Konosuba", "Этот замечательный мир", "konosuba", "https://cdn.myanimelist.net/images/anime/8/77831l.jpg", 3, 31, 1],
  ["Mushoku Tensei", "Реинкарнация безработного", "mushoku tensei", "https://cdn.myanimelist.net/images/anime/1530/117776l.jpg", 2, 48, 0],
  ["Overlord", "Повелитель", "overlord", "https://cdn.myanimelist.net/images/anime/7/88019l.jpg", 4, 52, 3],
  ["No Game No Life", "Нет игры - нет жизни", "no game no life", "https://cdn.myanimelist.net/images/anime/1074/111944l.jpg", 1, 12, 1],
  ["Noragami", "Бездомный бог", "noragami", "https://cdn.myanimelist.net/images/anime/1886/128266l.jpg", 2, 25, 0],
  ["Oshi no Ko", "Звездное дитя", "oshi no ko", "https://cdn.myanimelist.net/images/anime/1812/134736l.jpg", 2, 24, 0],
  ["Cyberpunk: Edgerunners", "Киберпанк: Бегущие по краю", "cyberpunk edgerunners", "https://cdn.myanimelist.net/images/anime/1818/126435l.jpg", 1, 10, 0],
  ["Dandadan", "Дандадан", "dandadan", "https://cdn.myanimelist.net/images/anime/1584/143719l.jpg", 1, 12, 0],
  ["Kaiju No. 8", "Кайдзю номер 8", "kaiju no 8", "https://cdn.myanimelist.net/images/anime/1370/140362l.jpg", 1, 12, 0]
].map(([name, ru, query, image, seasons, episodes, movies], index) => ({
  id: index + 1,
  name,
  ru,
  query,
  image,
  seasons,
  episodes,
  movies,
  rating: Number((7.4 + ((index * 13) % 24) / 10).toFixed(1)),
  aliases: [name, ru, query].join(" ").toLowerCase(),
  description: `${ru} (${name}) - тайтл для просмотра на DANGO. Мы показываем сезоны, серии, прогресс, лайки и комментарии через ваш профиль.`
}));

const $ = (selector) => document.querySelector(selector);
const state = {
  title: anime[0],
  episode: null,
  user: JSON.parse(localStorage.getItem("dangoBackendUser") || "null"),
  authMode: "login",
  likes: JSON.parse(localStorage.getItem("dangoLikes") || "[]"),
  continueList: JSON.parse(localStorage.getItem("dangoContinueList") || "[]"),
  history: JSON.parse(localStorage.getItem("dangoHistory") || "[]"),
  structures: {}
};

function token() {
  return localStorage.getItem("dangoToken") || "";
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "api_error");
  return data;
}

function stopPlayback() {
  const iframe = document.querySelector("#bunnyStreamFrame");
  if (iframe) {
    iframe.removeAttribute("src");
    iframe.classList.add("hidden");
  }
  const video = document.querySelector("#episodeVideo");
  if (video) {
    try { video.pause(); } catch {}
    video.removeAttribute("src");
    video.classList.add("hidden");
    try { video.load(); } catch {}
  }
}

function routeTo(view, payload = {}, push = true) {
  if (view !== "player") stopPlayback();
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  $(`#${view}View`)?.classList.add("active");
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.route === view));
  if (push) history.pushState({ view, ...payload }, "", view === "title" ? `#title-${payload.id}` : view === "player" ? `#watch-${payload.id}-${payload.season}-${payload.episode}` : `#${view}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restoreFromHash() {
  const hash = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  if (hash.startsWith("watch-")) {
    const [, id, season, episode] = hash.split("-");
    const item = anime.find((entry) => entry.id === Number(id));
    if (item && season && episode) { openPlayer(item, Number(season), Number(episode), false); return; }
  } else if (hash.startsWith("title-")) {
    const item = anime.find((entry) => entry.id === Number(hash.slice("title-".length)));
    if (item) { openTitle(item, false); return; }
  } else if (hash && document.querySelector(`#${hash}View`)) {
    routeTo(hash, {}, false);
    return;
  }
  routeTo("home", {}, false);
}

function card(item, rating = true) {
  const liked = state.likes.includes(item.name);
  return `<article class="anime-card" tabindex="0" data-id="${item.id}">
    ${rating ? `<div class="rating-badge">${item.rating}</div>` : ""}
    <button class="card-heart ${liked ? "liked" : ""}" data-like-id="${item.id}" type="button">${liked ? "♥" : "♡"}</button>
    <div class="poster"><img src="${item.image}" alt="${item.name}" loading="lazy" onerror="fallbackImg(this)"></div>
    <div class="anime-card-content"><h3>${item.name}</h3><p>${item.seasons} сезон • ${item.episodes} серий • ${item.movies} фильмов</p></div>
  </article>`;
}

function bindCards(root) {
  root?.querySelectorAll(".anime-card").forEach((node) => {
    const item = anime.find((entry) => entry.id === Number(node.dataset.id));
    node.addEventListener("click", () => openTitle(item));
    node.addEventListener("keydown", (event) => event.key === "Enter" && openTitle(item));
  });
  root?.querySelectorAll(".card-heart").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLike(anime.find((entry) => entry.id === Number(button.dataset.likeId)));
    });
  });
}

function renderCatalog() {
  const query = ($("#searchInput")?.value || "").trim().toLowerCase();
  const sort = $("#sortSelect")?.value || "popular";
  const list = anime.filter((item) => item.aliases.includes(query));
  list.sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "new" ? b.id - a.id : a.id - b.id);
  $("#animeGrid").innerHTML = list.map((item) => card(item, true)).join("");
  bindCards($("#animeGrid"));
  const apiStatus = $("#apiStatus");
  if (apiStatus) apiStatus.textContent = `Загружено ${list.length} тайтлов`;
}

function renderHome() {
  const shuffled = [...anime].sort(() => Math.random() - 0.5).slice(0, 18);
  $("#homeRecommendations").innerHTML = shuffled.map((item) => card(item, false)).join("");
  bindCards($("#homeRecommendations"));
  renderLiked();
  renderContinue();
  renderHistory();
}

function renderLiked() {
  const list = state.likes.map((name) => anime.find((item) => item.name === name)).filter(Boolean);
  $("#likedAnimeHome").innerHTML = list.length ? list.map((item) => card(item, false)).join("") : '<p class="empty">Поставьте лайк тайтлу, и он появится здесь.</p>';
  bindCards($("#likedAnimeHome"));
  const likedList = $("#likedList");
  if (likedList) likedList.textContent = list.map((item) => item.name).join(", ") || "Пока пусто";
}

function renderContinue() {
  const list = state.continueList.slice(0, 6);
  $("#continueCard").innerHTML = list.length ? list.map((item) => `<button class="continue-item" type="button" data-id="${item.id}" data-season="${item.season}" data-episode="${item.episode}"><img src="${item.image}" alt="" onerror="fallbackImg(this)"><span><strong>${item.name}</strong><small>${item.season} сезон, ${item.episode} серия • ${item.progress || 0}%</small></span></button>`).join("") : "<p>Выберите серию, и DANGO запомнит место просмотра.</p>";
  $("#continueCard").querySelectorAll(".continue-item").forEach((button) => {
    button.addEventListener("click", () => openPlayer(anime.find((item) => item.id === Number(button.dataset.id)), Number(button.dataset.season), Number(button.dataset.episode)));
  });
}

function renderHistory() {
  const list = state.history.slice(0, 10);
  $("#historyCard").innerHTML = list.length ? list.map((item) => `<button class="rec-item" data-id="${item.id}"><img src="${item.image}" alt="" onerror="fallbackImg(this)"><span><strong>${item.name}</strong><small>${item.at}</small></span></button>`).join("") : "<p>История станет длиннее по мере открытия тайтлов.</p>";
  $("#historyCard").querySelectorAll(".rec-item").forEach((button) => button.addEventListener("click", () => openTitle(anime.find((item) => item.id === Number(button.dataset.id)))));
}

function renderRecommendations() {
  const picks = [...anime].sort((a, b) => b.rating - a.rating).slice(0, 8);
  $("#recommendationList").innerHTML = picks.map((item) => `<button class="rec-item" data-id="${item.id}"><img src="${item.image}" alt="" onerror="fallbackImg(this)"><span><strong>${item.name}</strong><small>${item.seasons} сезон • ${item.episodes} серий</small></span></button>`).join("");
  $("#recommendationList").querySelectorAll(".rec-item").forEach((button) => button.addEventListener("click", () => openTitle(anime.find((item) => item.id === Number(button.dataset.id)))));
}

async function openTitle(item, push = true) {
  if (!item) return;
  state.title = item;
  addHistory(item);
  routeTo("title", { id: item.id }, push);
  $("#titleImage").src = item.image;
  $("#watchTitle").textContent = item.name;
  $("#watchMeta").textContent = `${item.ru} • ${item.seasons} сезон • ${item.episodes} серий • ${item.movies} фильмов`;
  $("#likeButton").textContent = state.likes.includes(item.name) ? "♥" : "♡";
  $("#titleDescription").textContent = item.description;
  await loadStructure(item);
  renderSeasons(item);
  try {
    const data = await fetch(`${JIKAN}/anime?q=${encodeURIComponent(item.query)}&limit=1`).then((res) => res.json());
    const found = data.data?.[0];
    if (found) {
      item.rating = found.score || item.rating;
      item.description = found.synopsis || item.description;
      item.image = found.images?.jpg?.large_image_url || item.image;
      $("#titleDescription").textContent = item.description;
    }
  } catch {
    // External metadata is optional; keep the local description.
  }
}

async function loadStructure(item) {
  try {
    const data = await api(`/api/structure/${item.id}`);
    state.structures[item.id] = data.structure || null;
  } catch {
    state.structures[item.id] = state.structures[item.id] || null;
  }
}

function defaultSeasons(item) {
  const seasons = [];
  for (let season = 1; season <= item.seasons; season += 1) {
    const count = season === item.seasons ? Math.max(1, item.episodes - 24 * (season - 1)) : Math.min(24, item.episodes);
    seasons.push({ title: "", episodes: Math.max(1, count), arcs: [] });
  }
  return seasons.length ? seasons : [{ title: "", episodes: Math.max(1, item.episodes || 1), arcs: [] }];
}

function titleSeasons(item) {
  const structure = state.structures[item.id];
  if (structure && Array.isArray(structure.seasons) && structure.seasons.length) {
    return structure.seasons.map((season) => ({
      title: season.title || "",
      episodes: Math.max(1, Number(season.episodes) || 1),
      arcs: Array.isArray(season.arcs) ? season.arcs : []
    }));
  }
  return defaultSeasons(item);
}

function renderSeasons(item) {
  const holder = $("#seasonList");
  holder.innerHTML = "";

  if (isAdmin()) {
    const bar = document.createElement("div");
    bar.className = "structure-admin-bar";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "structure-edit-button";
    editBtn.textContent = "✎ Редактировать структуру";
    editBtn.addEventListener("click", () => openStructureEditor(item));
    bar.append(editBtn);
    holder.append(bar);
  }

  const seasons = titleSeasons(item);
  seasons.forEach((season, index) => {
    const seasonNumber = index + 1;
    const total = Math.min(Math.max(1, Number(season.episodes) || 1), 500);
    const block = document.createElement("section");
    block.className = "season-block";

    const makeButton = (ep) => `<button type="button" data-season="${seasonNumber}" data-episode="${ep}">${ep} серия</button>`;
    let inner = `<h2>${escapeHtml((season.title || "").trim() || `${seasonNumber} сезон`)}</h2>`;

    const arcs = (Array.isArray(season.arcs) ? season.arcs : []).filter((arc) => arc && arc.from && arc.to);
    if (arcs.length) {
      const covered = new Set();
      arcs.forEach((arc) => {
        const from = Math.max(1, Math.min(total, Number(arc.from)));
        const to = Math.max(from, Math.min(total, Number(arc.to)));
        const eps = [];
        for (let ep = from; ep <= to; ep += 1) { eps.push(ep); covered.add(ep); }
        inner += `<h3 class="arc-title">${escapeHtml((arc.name || "").trim() || "Арка")}</h3><div class="episode-grid">${eps.map(makeButton).join("")}</div>`;
      });
      const rest = [];
      for (let ep = 1; ep <= total; ep += 1) if (!covered.has(ep)) rest.push(ep);
      if (rest.length) inner += `<h3 class="arc-title">Прочие серии</h3><div class="episode-grid">${rest.map(makeButton).join("")}</div>`;
    } else {
      const eps = Array.from({ length: total }, (_, i) => i + 1);
      inner += `<div class="episode-grid">${eps.map(makeButton).join("")}</div>`;
    }

    block.innerHTML = inner;
    block.querySelectorAll("button[data-episode]").forEach((button) =>
      button.addEventListener("click", () => openPlayer(item, Number(button.dataset.season), Number(button.dataset.episode)))
    );
    holder.append(block);
  });
}

function adjacentEpisode(item, season, episode, delta) {
  const seasons = titleSeasons(item);
  const episodesIn = (seasonNumber) => Math.max(1, Number(seasons[seasonNumber - 1]?.episodes) || 1);
  let nextSeason = season;
  let nextEpisode = episode + delta;

  if (delta > 0 && nextEpisode > episodesIn(season)) {
    if (season >= seasons.length) return null;
    nextSeason = season + 1;
    nextEpisode = 1;
  } else if (delta < 0 && nextEpisode < 1) {
    if (season <= 1) return null;
    nextSeason = season - 1;
    nextEpisode = episodesIn(nextSeason);
  }
  return { season: nextSeason, episode: nextEpisode };
}

function setupEpisodeNav(item, season, episode) {
  const prev = adjacentEpisode(item, season, episode, -1);
  const next = adjacentEpisode(item, season, episode, 1);
  const prevBtn = $("#prevEpisode");
  const nextBtn = $("#nextEpisode");
  if (prevBtn) {
    prevBtn.disabled = !prev;
    prevBtn.onclick = () => prev && openPlayer(item, prev.season, prev.episode);
  }
  if (nextBtn) {
    nextBtn.disabled = !next;
    nextBtn.onclick = () => next && openPlayer(item, next.season, next.episode);
  }
}

async function openPlayer(item, season, episode, push = true) {
  state.title = item;
  state.episode = { id: item.id, season, episode };
  if (!(item.id in state.structures)) await loadStructure(item);
  routeTo("player", { id: item.id, season, episode }, push);
  $("#playerTitle").textContent = `${item.name} - ${season} сезон, ${episode} серия`;
  $("#progressRange").value = getProgress(item.id, season, episode);
  rememberContinue(item, season, episode, $("#progressRange").value);
  renderEpisodeLocalSocial(item, season, episode);
  setupEpisodeNav(item, season, episode);
  await loadMedia(item, season, episode);
  await loadComments(item, season, episode);
  updateAdminUpload();
}

async function loadMedia(item, season, episode) {
  const video = $("#episodeVideo");
  video.classList.add("hidden");
  video.removeAttribute("src");
  $("#playerPlay")?.classList.remove("hidden");
  try {
    const data = await api(`/api/media/${item.id}/${season}/${episode}`);
    if (data.media?.file_url) {
      video.src = data.media.file_url;
      video.classList.remove("hidden");
      $("#playerPlay")?.classList.add("hidden");
      $("#playerMeta").textContent = data.media.original_name;
    }
  } catch {
    $("#playerMeta").textContent = "Видео еще не загружено. Админ может добавить файл в этой серии.";
  }
}

function episodeKey(item, season, episode) {
  return `dangoEpisode:${item.id}:${season}:${episode}`;
}

function renderEpisodeLocalSocial(item, season, episode) {
  const data = JSON.parse(localStorage.getItem(episodeKey(item, season, episode)) || '{"liked":false,"likes":0,"comments":[]}');
  $("#episodeLikeButton").classList.toggle("liked", data.liked);
  $("#episodeLikeButton").firstChild.textContent = data.liked ? "♥ " : "♡ ";
  $("#episodeLikeCount").textContent = data.likes || 0;
  renderComments(data.comments || []);
}

async function loadComments(item, season, episode) {
  try {
    const data = await api(`/api/comments/${item.id}/${season}/${episode}`);
    renderComments(data.comments || []);
  } catch {}
}

function renderComments(comments) {
  $("#commentList").innerHTML = comments.length ? comments.map((comment) => `<article class="comment-item"><span class="comment-avatar comment-avatar-fallback">${escapeHtml((comment.author || comment.name || "D")[0])}</span><span class="comment-body"><strong>${escapeHtml(comment.author || comment.name || "Гость")}</strong><span>${escapeHtml(comment.text || "")}</span></span></article>`).join("") : '<p class="empty">Комментариев пока нет.</p>';
}

function toggleLike(item) {
  if (!item) return;
  const exists = state.likes.includes(item.name);
  state.likes = exists ? state.likes.filter((name) => name !== item.name) : [item.name, ...state.likes];
  localStorage.setItem("dangoLikes", JSON.stringify(state.likes));
  if (token()) api("/api/likes/toggle", { method: "POST", body: JSON.stringify({ animeId: item.id, animeName: item.name, animeImage: item.image }) }).catch(() => {});
  renderCatalog();
  renderLiked();
  if (state.title?.id === item.id && $("#likeButton")) $("#likeButton").textContent = state.likes.includes(item.name) ? "♥" : "♡";
}

function rememberContinue(item, season, episode, progress = 0) {
  state.continueList = [{ id: item.id, name: item.name, image: item.image, season, episode, progress: Number(progress), at: Date.now() }, ...state.continueList.filter((entry) => entry.id !== item.id)].slice(0, 6);
  localStorage.setItem("dangoContinueList", JSON.stringify(state.continueList));
  if (token()) api("/api/progress", { method: "POST", body: JSON.stringify({ animeId: item.id, animeName: item.name, animeImage: item.image, season, episode, progress: Number(progress) }) }).catch(() => {});
}

function getProgress(id, season, episode) {
  return state.continueList.find((entry) => entry.id === id && entry.season === season && entry.episode === episode)?.progress || 0;
}

function addHistory(item) {
  state.history = [{ id: item.id, name: item.name, image: item.image, at: new Date().toLocaleString("ru-RU") }, ...state.history.filter((entry) => entry.id !== item.id)].slice(0, 20);
  localStorage.setItem("dangoHistory", JSON.stringify(state.history));
}

async function createAccount(mode) {
  const login = $("#loginInput").value.trim();
  const email = $("#emailInput").value.trim();
  const password = $("#passwordInput").value;
  const path = mode === "create" ? "/api/auth/register" : "/api/auth/login";
  try {
    const payload = mode === "create" ? { login, email, password } : { email, password };
    const data = await api(path, { method: "POST", body: JSON.stringify(payload) });
    localStorage.setItem("dangoToken", data.token);
    localStorage.setItem("dangoBackendUser", JSON.stringify(data.user));
    state.user = data.user;
    await loadProfile();
    renderAccount();
  } catch (error) {
    $("#accountHint").textContent = `Ошибка: ${error.message}`;
  }
}

async function loadProfile() {
  if (!token()) return;
  try {
    const data = await api("/api/profile");
    state.user = data.user;
    localStorage.setItem("dangoBackendUser", JSON.stringify(data.user));
    if (Array.isArray(data.liked)) state.likes = data.liked.map((item) => item.anime_name).filter(Boolean);
    if (Array.isArray(data.continueWatching)) {
      const seen = new Set();
      state.continueList = data.continueWatching
        .map((item) => ({ id: Number(item.anime_id), name: item.anime_name, image: item.anime_image, season: Number(item.season), episode: Number(item.episode), progress: Number(item.progress), at: new Date(item.updated_at).getTime() }))
        .filter((entry) => (seen.has(entry.id) ? false : seen.add(entry.id)))
        .slice(0, 6);
    }
    localStorage.setItem("dangoLikes", JSON.stringify(state.likes));
    localStorage.setItem("dangoContinueList", JSON.stringify(state.continueList));
  } catch {}
}

function setAuthMode(mode) {
  state.authMode = mode;
  $("#authSwitch")?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.authMode === mode));
  $("#loginInput").style.display = mode === "create" ? "block" : "none";
  $("#authSubmitButton").textContent = mode === "create" ? "Создать аккаунт" : "Войти в аккаунт";
}

function renderAccount() {
  const logged = Boolean(state.user?.email);
  $("#accountTitle").textContent = logged ? state.user.login : "Войти или создать профиль";
  $("#accountHint").textContent = logged ? `${state.user.email}${isAdmin() ? " • админ" : ""}` : "Создайте профиль, чтобы сохранять лайки, комментарии и прогресс.";
  $("#authForm").classList.toggle("hidden", logged);
  $("#authSwitch").classList.toggle("hidden", logged);
  $("#accountActions").classList.toggle("hidden", !logged);
  const avatar = localStorage.getItem("dangoProfileAvatar") || state.user?.avatar || "";
  const banner = localStorage.getItem("dangoProfileBanner") || state.user?.banner || "";
  if (avatar) {
    $(".avatar-button").style.backgroundImage = `url("${avatar}")`;
    $("#openAccount").style.backgroundImage = `url("${avatar}")`;
  }
  if (banner) $("#profileBanner").style.backgroundImage = `linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.45)), url("${banner}")`;
  renderLiked();
  updateAdminUpload();
}

function isAdmin() {
  return state.user?.isAdmin || state.user?.role === "admin" || state.user?.email?.toLowerCase() === ADMIN_EMAIL;
}

function updateAdminUpload() {
  $("#mediaUploadForm")?.classList.toggle("hidden", !isAdmin());
}

function handleImageUpload(input, target, type) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const value = reader.result;
    localStorage.setItem(type === "avatar" ? "dangoProfileAvatar" : "dangoProfileBanner", value);
    if (target) target.style.backgroundImage = type === "banner" ? `linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.45)), url("${value}")` : `url("${value}")`;
    if (type === "avatar") $("#openAccount").style.backgroundImage = `url("${value}")`;
    if (token()) {
      try {
        const data = await api("/api/profile", { method: "PATCH", body: JSON.stringify({ [type]: value }) });
        state.user = data.user;
        localStorage.setItem("dangoBackendUser", JSON.stringify(data.user));
      } catch {}
    }
  };
  reader.readAsDataURL(file);
}

async function loadCharacters() {
  const characterBox = $("#demonCharacters");
  const styleBox = $("#demonStyles");
  characterBox.innerHTML = '<p class="empty">Загружаем персонажей...</p>';
  styleBox.innerHTML = '<p class="empty">Загружаем стили...</p>';
  try {
    const [demons, styles, naruto] = await Promise.all([
      fetch(`${DEMON_API}/characters`).then((res) => res.json()).catch(() => ({})),
      fetch(`${DEMON_API}/combat-styles`).then((res) => res.json()).catch(() => ({})),
      fetch(`${NARUTO_API}/character`).then((res) => res.json()).catch(() => ({}))
    ]);
    const demonItems = normalizeList(demons, "content").slice(0, 12).map((item) => ({ name: item.name, image: item.img, description: item.description || item.race || "Demon Slayer" }));
    const narutoItems = normalizeList(naruto, "characters").slice(0, 12).map((item) => ({ name: item.name, image: item.images?.[0], description: item.debut?.anime || item.personal?.clan || "Naruto" }));
    const styleItems = normalizeList(styles, "content").slice(0, 12).map((item) => ({ name: item.name || item.title, image: item.img, description: item.description || item.type || "Combat style" }));
    renderDemonGrid(characterBox, [...demonItems, ...narutoItems].sort(() => Math.random() - 0.5).slice(0, 16));
    renderDemonGrid(styleBox, styleItems);
  } catch {
    characterBox.innerHTML = '<p class="empty">API персонажей временно недоступен.</p>';
    styleBox.innerHTML = '<p class="empty">API стилей временно недоступен.</p>';
  }
}

function normalizeList(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function renderDemonGrid(root, items) {
  root.innerHTML = items.map((item, index) => `<button class="demon-card demon-card-button" type="button" data-character-index="${index}"><img src="${item.image || anime[0].image}" alt="${escapeHtml(item.name || "Персонаж")}" loading="lazy"><div class="demon-card-content"><h3>${escapeHtml(item.name || "Персонаж")}</h3><p>${escapeHtml(item.description || "Информация загружена из открытого API.")}</p></div></button>`).join("") || '<p class="empty">Данные не найдены.</p>';
  root.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const item = items[Number(button.dataset.characterIndex)];
    $("#characterModalBody").innerHTML = `<div class="character-detail"><img src="${item.image || anime[0].image}" alt=""><div><p class="eyebrow">персонаж</p><h2 id="characterModalTitle">${escapeHtml(item.name || "Персонаж")}</h2><p>${escapeHtml(item.description || "Информация загружена из открытого API.")}</p></div></div>`;
    $("#characterModal").classList.add("open");
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function initEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.route)));
  $("#homeButton")?.addEventListener("click", () => routeTo("home"));
  $("#themeButton")?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("dangoTheme", document.body.classList.contains("dark-theme") ? "dark" : "light");
    $("#themeButton").textContent = document.body.classList.contains("dark-theme") ? "☀" : "☾";
  });
  $("#searchForm")?.addEventListener("submit", (event) => { event.preventDefault(); renderCatalog(); });
  $("#searchInput")?.addEventListener("input", renderCatalog);
  $("#sortSelect")?.addEventListener("change", renderCatalog);
  $("#likeButton")?.addEventListener("click", () => toggleLike(state.title));
  $("#progressRange")?.addEventListener("input", (event) => state.episode && rememberContinue(state.title, state.episode.season, state.episode.episode, event.target.value));
  $("#backToTitle")?.addEventListener("click", () => openTitle(state.title));
  $("#episodeLikeButton")?.addEventListener("click", () => {
    const data = JSON.parse(localStorage.getItem(episodeKey(state.title, state.episode.season, state.episode.episode)) || '{"liked":false,"likes":0,"comments":[]}');
    data.liked = !data.liked;
    data.likes = Math.max(0, Number(data.likes || 0) + (data.liked ? 1 : -1));
    localStorage.setItem(episodeKey(state.title, state.episode.season, state.episode.episode), JSON.stringify(data));
    renderEpisodeLocalSocial(state.title, state.episode.season, state.episode.episode);
  });
  $("#commentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = $("#commentInput").value.trim();
    if (!text || !state.episode) return;
    if (token()) {
      try {
        await api("/api/comments", { method: "POST", body: JSON.stringify({ animeId: state.title.id, animeName: state.title.name, season: state.episode.season, episode: state.episode.episode, text }) });
        $("#commentInput").value = "";
        await loadComments(state.title, state.episode.season, state.episode.episode);
        return;
      } catch {}
    }
    const data = JSON.parse(localStorage.getItem(episodeKey(state.title, state.episode.season, state.episode.episode)) || '{"liked":false,"likes":0,"comments":[]}');
    data.comments = [{ author: state.user?.login || "Гость", text }, ...(data.comments || [])];
    localStorage.setItem(episodeKey(state.title, state.episode.season, state.episode.episode), JSON.stringify(data));
    $("#commentInput").value = "";
    renderComments(data.comments);
  });
  $("#authForm")?.addEventListener("submit", (event) => { event.preventDefault(); createAccount(state.authMode); });
  document.querySelectorAll("[data-auth-mode]").forEach((button) => button.addEventListener("click", () => setAuthMode(button.dataset.authMode)));
  $("#logoutButton")?.addEventListener("click", () => { localStorage.removeItem("dangoToken"); localStorage.removeItem("dangoBackendUser"); state.user = null; renderAccount(); });
  $("#openAccount")?.addEventListener("click", () => $("#accountModal").classList.add("open"));
  document.querySelectorAll("[data-close-account]").forEach((node) => node.addEventListener("click", () => $("#accountModal").classList.remove("open")));
  document.querySelectorAll("[data-close-character]").forEach((node) => node.addEventListener("click", () => $("#characterModal").classList.remove("open")));
  $("#bannerInput")?.addEventListener("change", (event) => handleImageUpload(event.target, $("#profileBanner"), "banner"));
  $("#avatarInput")?.addEventListener("change", (event) => handleImageUpload(event.target, $(".avatar-button"), "avatar"));
  $("#mediaUploadForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = $("#mediaInput").files?.[0];
    if (!file || !state.episode) return;
    const form = new FormData();
    form.append("media", file);
    form.append("animeId", state.title.id);
    form.append("animeName", state.title.name);
    form.append("season", state.episode.season);
    form.append("episode", state.episode.episode);
    $("#mediaUploadStatus").textContent = "Загружаю...";
    try {
      await api("/api/admin/media", { method: "POST", body: form });
      $("#mediaUploadStatus").textContent = "Файл загружен.";
      await loadMedia(state.title, state.episode.season, state.episode.episode);
    } catch (error) {
      $("#mediaUploadStatus").textContent = `Ошибка: ${error.message}`;
    }
  });
  $("#reloadDemonApi")?.addEventListener("click", loadCharacters);
  document.querySelectorAll("[data-demon-tab]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-demon-tab]").forEach((node) => node.classList.remove("active"));
    button.classList.add("active");
    $("#demonCharacters").classList.toggle("active", button.dataset.demonTab === "characters");
    $("#demonStyles").classList.toggle("active", button.dataset.demonTab === "styles");
  }));
  window.addEventListener("popstate", (event) => {
    const route = event.state || { view: "home" };
    if (route.view === "title") return openTitle(anime.find((item) => item.id === route.id), false);
    if (route.view === "player") return openPlayer(anime.find((item) => item.id === route.id), route.season, route.episode, false);
    routeTo(route.view || "home", {}, false);
  });
}

async function init() {
  if (localStorage.getItem("dangoTheme") !== "light") document.body.classList.add("dark-theme");
  $("#themeButton").textContent = document.body.classList.contains("dark-theme") ? "☀" : "☾";
  initEvents();
  setAuthMode("login");
  await loadProfile();
  renderCatalog();
  renderHome();
  renderRecommendations();
  renderAccount();
  loadCharacters();
  restoreFromHash();
}

init();
