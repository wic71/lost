import { getDefaultLanguage, getLanguage } from './i18n.js';

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

async function fetchLocalizedMarkdown(baseName, optional) {
  var language = getLanguage();
  var defaultLanguage = getDefaultLanguage();
  var candidates = [
    '../text/' + baseName + '_' + language + '.md',
    '../text/' + baseName + '_' + defaultLanguage + '.md',
    '../text/' + baseName + '.md'
  ];
  for (var i = 0; i < candidates.length; i++) {
    var content = await fetchOptionalText(candidates[i]);
    if (content) return content;
  }
  if (optional) return '';
  throw new Error('Could not read markdown document for ' + baseName + '.');
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
    fetchLocalizedMarkdown('council_1', false),
    fetchLocalizedMarkdown('council_2', true),
    fetchLocalizedMarkdown('council_3', true),
    fetchLocalizedMarkdown('expedition_survivor', true),
    fetchLocalizedMarkdown('expedition_survivor_map', true),
    fetchLocalizedMarkdown('expedition_normal', true),
    fetchLocalizedMarkdown('expedition_map', true),
    fetchLocalizedMarkdown('expedition_autowalk', true),
    fetchLocalizedMarkdown('article_1', true),
    fetchLocalizedMarkdown('article_2a_death', true),
    fetchLocalizedMarkdown('article_2b_all_survived', true)
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
