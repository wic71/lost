export const GAME_DATA = {
  people: { newcomerNames: [] },
  discoveries: [],
  events: {},
  council: {},
  expeditionTexts: {},
  articles: {}
};

async function fetchJson(path) {
  var url = new URL(path, import.meta.url);
  var response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Kunde inte läsa ' + path + ' (' + response.status + ')');
  return response.json();
}

async function fetchText(path) {
  var url = new URL(path, import.meta.url);
  var response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Kunde inte läsa ' + path + ' (' + response.status + ')');
  return response.text();
}

async function fetchOptionalText(path) {
  try {
    return await fetchText(path);
  } catch (error) {
    return '';
  }
}

function normalizeGameData(data) {
  GAME_DATA.people = data.people || { newcomerNames: [] };
  if (!Array.isArray(GAME_DATA.people.newcomerNames)) GAME_DATA.people.newcomerNames = [];
  GAME_DATA.discoveries = Array.isArray(data.discoveries && data.discoveries.discoveries) ? data.discoveries.discoveries : [];
  GAME_DATA.events = data.events || {};
  GAME_DATA.council = data.council || {};
  GAME_DATA.expeditionTexts = data.expeditionTexts || {};
  GAME_DATA.articles = data.articles || {};
}

export async function loadGameData() {
  var loaded = await Promise.all([
    fetchJson('../data/persons.json'),
    fetchJson('../data/discoveries.json'),
    fetchJson('../data/events.json'),
    fetchText('../text/council_1.md'),
    fetchOptionalText('../text/council_2.md'),
    fetchOptionalText('../text/council_3.md'),
    fetchOptionalText('../text/expedition_survivor.md'),
    fetchOptionalText('../text/expedition_survivor_map.md'),
    fetchOptionalText('../text/expedition_normal.md'),
    fetchOptionalText('../text/expedition_map.md'),
    fetchOptionalText('../text/expedition_autowalk.md'),
    fetchOptionalText('../text/article_1.md'),
    fetchOptionalText('../text/article_2a_death.md'),
    fetchOptionalText('../text/article_2b_all_survived.md')
  ]);

  normalizeGameData({
    people: loaded[0],
    discoveries: loaded[1],
    events: loaded[2],
    council: { explorationText: loaded[3], raftText: loaded[4], departureText: loaded[5] },
    expeditionTexts: {
      survivor: loaded[6],
      survivorMap: loaded[7],
      normal: loaded[8],
      map: loaded[9],
      autowalk: loaded[10]
    },
    articles: {
      arrival: loaded[11],
      deaths: loaded[12],
      allSurvived: loaded[13]
    }
  });
}
