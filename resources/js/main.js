import { CONFIG } from './config.js';
import { GAME_DATA, loadGameData } from './data-loader.js';
import { getLanguage, getLanguageLabel, getSupportedLanguages, onLanguageChange, setLanguage, t, tArray } from './i18n.js';

var gameState = {};
var currentSpeed = 1;
var tickInterval = null;
var tickGeneration = 0;
var currentView = 'camp';
var councilOverlayCloseHandler = null;

function lowerFirst(text) { return text ? text.charAt(0).toLowerCase() + text.slice(1) : text; }
function localizeNameMap(sectionKey, key, fallback) { return t(sectionKey + '.' + key, null, fallback || key); }
function getJobName(jobId) { var job = CONFIG.jobs[jobId] || {}; return t('jobs.' + jobId, null, job.name || jobId); }
function getRecipeName(recipeId) {
  var recipe = CONFIG.recipes[recipeId] || {};
  var names = {
    en: {
      stone_knife: 'Craft stone knife',
      rope: 'Twist rope',
      net: 'Make net',
      spear: 'Craft spear',
      axe: 'Craft axe',
      pots: 'Fire pots',
      hut: 'Build hut',
      backpack: 'Craft backpack',
      raft_log: 'Build raft: 1 log',
      raft_sail: 'Weave sail: 1 m²',
      raft_rig: 'Build rigging',
      raft_hut: 'Build cabin'
    },
    se: {
      stone_knife: 'Gör stenkniv',
      rope: 'Tvinna rep',
      net: 'Gör nät',
      spear: 'Gör spjut',
      axe: 'Gör yxa',
      pots: 'Bränn krukor',
      hut: 'Bygg hus',
      backpack: 'Gör ryggsäck',
      raft_log: 'Bygg flotte: 1 stock',
      raft_sail: 'Väv segel: 1 m²',
      raft_rig: 'Bygg rigg',
      raft_hut: 'Bygg hytt'
    }
  };
  var language = getLanguage();
  return ((names[language] || names.en)[recipeId]) || recipe.name || recipeId;
}
function getDifficultyLabel(id) { return t('difficulty.' + id, null, ((CONFIG.difficulties || {})[id] || {}).label || id); }
function getRequirementText(kind, params) {
  var messages = {
    en: {
      discovery: 'Requires discovery: {id}',
      missingResource: 'Missing {amount} {resource}',
      requiresResource: 'Requires {resource}',
      noFreeTool: 'No free {resource}'
    },
    se: {
      discovery: 'Kräver upptäckt: {id}',
      missingResource: 'Saknar {amount} {resource}',
      requiresResource: 'Kräver {resource}',
      noFreeTool: 'Inget ledigt {resource}'
    }
  };
  var language = getLanguage();
  var template = ((messages[language] || messages.en)[kind]) || kind;
  return template.replace(/\{([^}]+)\}/g, function(_, key) {
    return params && params[key] !== undefined ? params[key] : '{' + key + '}';
  });
}
function fillTemplate(template, params) {
  return String(template || '').replace(/\{([^}]+)\}/g, function(_, key) {
    return params && params[key] !== undefined ? params[key] : '{' + key + '}';
  });
}
function getExpeditionLabel(key, params) {
  var labels = {
    en: {
      locked: 'Expeditions unlock after the council.',
      startTitle: 'Start Expedition',
      startRequirements: 'Requires 4 food, 4 water, glasses, a free spear, and a free backpack. Equipment is borrowed until the expedition returns.',
      selectSurvivor: 'Select survivor',
      sendOut: 'Send out',
      currentTileAlt: 'Current tile',
      findings: 'Findings: {items}',
      noFindings: 'None',
      sword: 'Sword',
      shield: 'Shield',
      escorting: 'Escorting: {name} (health {health})',
      waitingSurvivor: 'Waiting survivor: {name} / health {health} / background {background}{suffix}',
      leftBehindSuffix: ' / left behind with supplies',
      position: 'Position {x},{y}{pending}',
      nextTick: ' / Next tick: {command}',
      retreat: 'Return to camp: {ticks} ticks, no finds on the way.',
      autoWalk: 'Auto-walk: {steps} steps left',
      safeReturn: 'Safe return march: {ticks} ticks left',
      resting: 'Resting at a fire: {hours} h left',
      cockpitFound: 'Cockpit found. Return to camp.',
      north: 'North',
      west: 'West',
      south: 'South',
      east: 'East',
      restAtFire: 'Rest at fire',
      return: 'Return',
      investigateTemple: 'Investigate temple',
      careSurvivor: 'Treat survivor',
      escortToCamp: 'Escort to camp',
      waitingBadge: 'Waiting survivor',
      health: 'Health',
      energy: 'Energy'
    },
    se: {
      locked: 'Expeditioner låses upp efter rådet.',
      startTitle: 'Starta expedition',
      startRequirements: 'Kräver 4 mat, 4 vatten, glasögon, ett ledigt spjut och en ledig ryggsäck. Utrustningen lånas tills expeditionen återvänder.',
      selectSurvivor: 'Välj överlevare',
      sendOut: 'Skicka ut',
      currentTileAlt: 'Nuvarande ruta',
      findings: 'Fynd: {items}',
      noFindings: 'Inga',
      sword: 'Svärd',
      shield: 'Sköld',
      escorting: 'Eskorterar: {name} (hälsa {health})',
      waitingSurvivor: 'Väntande överlevare: {name} / hälsa {health} / bakgrund {background}{suffix}',
      leftBehindSuffix: ' / lämnad kvar med proviant',
      position: 'Position {x},{y}{pending}',
      nextTick: ' / Nästa tick: {command}',
      retreat: 'Återvänd till lägret: {ticks} ticks, inga fynd på vägen.',
      autoWalk: 'Autogång: {steps} steg kvar',
      safeReturn: 'Säker återmarsch: {ticks} ticks kvar',
      resting: 'Vilar vid eld: {hours} h kvar',
      cockpitFound: 'Cockpiten hittad. Återvänd till lägret.',
      north: 'Norr',
      west: 'Väst',
      south: 'Söder',
      east: 'Öst',
      restAtFire: 'Vila vid eld',
      return: 'Återvänd',
      investigateTemple: 'Undersök templet',
      careSurvivor: 'Vårda överlevare',
      escortToCamp: 'Eskortera till lägret',
      waitingBadge: 'Väntande överlevare',
      health: 'Hälsa',
      energy: 'Energi'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getOverlayLabel(key) {
  var labels = {
    en: {
      expeditionReachedGoal: 'The Expedition Has Reached Its Goal',
      autowalkDone: 'Auto-walk complete'
    },
    se: {
      expeditionReachedGoal: 'Expeditionen har nått sitt mål',
      autowalkDone: 'Autogång klar'
    }
  };
  var language = getLanguage();
  return ((labels[language] || labels.en)[key]) || key;
}
function getExpeditionLogLabel(key, params) {
  var labels = {
    en: {
      autoWalkStart: '{name} starts walking toward a known place. {steps} steps left.',
      autoWalkArrived: '{name} reaches the selected place.',
      movementPlanned: 'Movement planned: {command}.',
      restPlanned: 'Rest planned for next tick.',
      leaveCamp: '{name} leaves camp with food, water, spear, backpack, and glasses.',
      restFinished: '{name} has finished resting by the fire and can continue.',
      safeReturnFinished: '{name} returns from the expedition after a safe march through the jungle.',
      immediateReturn: '{name} returns from the expedition.'
    },
    se: {
      autoWalkStart: '{name} börjar gå mot en känd plats. {steps} steg kvar.',
      autoWalkArrived: '{name} når fram till den valda platsen.',
      movementPlanned: 'Rörelse planerad: {command}.',
      restPlanned: 'Vila planerad till nästa tick.',
      leaveCamp: '{name} lämnar lägret med mat, vatten, spjut, ryggsäck och glasögon.',
      restFinished: '{name} har vilat klart vid elden och kan fortsätta.',
      safeReturnFinished: '{name} återvänder från expeditionen efter säker återmarsch genom djungeln.',
      immediateReturn: '{name} återvänder från expeditionen.'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getStoryLabel(key, params) {
  var labels = {
    en: {
      arrivedEyebrow: 'Arrived',
      expeditionEyebrow: 'Expedition',
      cockpitEyebrow: 'Cockpit Find',
      expeditionReturnTitle: 'The Expedition Returns',
      breakthroughTitle: 'Breakthrough',
      campReceivesExpedition: 'The camp receives the expedition',
      survivorReturnsWithExpedition: 'A survivor comes back with the expedition',
      articleEyebrow: 'Newspaper Article',
      reachesHarborTitle: 'You Reach Harbor',
      thirtyDaysAtSeaSubtitle: 'Thirty days at sea are over',
      nextArticle: 'Next article',
      aftermathEyebrow: 'Aftermath',
      allRescuedTitle: 'Everyone Was Rescued',
      aftermathSorrowTitle: 'Aftermath and Grief',
      everyoneCameHome: 'The whole group came home',
      close: 'Close',
      deadInCampHeader: 'Died in camp or during the stay',
      neverRescuedHeader: 'Never rescued from the island',
      noLossesEndgame: 'No losses were recorded in the final outcome.',
      lossSummaryDead: '{count} dead',
      lossSummaryMissing: '{count} missing',
      everyoneCameHomeShort: 'Everyone came home.'
    },
    se: {
      arrivedEyebrow: 'Framme',
      expeditionEyebrow: 'Expeditionen',
      cockpitEyebrow: 'Cockpitfynd',
      expeditionReturnTitle: 'Expeditionen återvänder',
      breakthroughTitle: 'Genombrott',
      campReceivesExpedition: 'Lägret tar emot expeditionen',
      survivorReturnsWithExpedition: 'En överlevare följer med tillbaka',
      articleEyebrow: 'Tidningsartikel',
      reachesHarborTitle: 'Ni når hamn',
      thirtyDaysAtSeaSubtitle: 'Tretti dagar till havs är över',
      nextArticle: 'Nästa artikel',
      aftermathEyebrow: 'Efterspel',
      allRescuedTitle: 'Alla räddades',
      aftermathSorrowTitle: 'Efterspel och sorg',
      everyoneCameHome: 'Hela gruppen kom hem',
      close: 'Stäng',
      deadInCampHeader: 'Dog i lägret eller under vistelsen',
      neverRescuedHeader: 'Aldrig räddade från ön',
      noLossesEndgame: 'Ingen förlust registrerades i slutläget.',
      lossSummaryDead: '{count} döda',
      lossSummaryMissing: '{count} saknade',
      everyoneCameHomeShort: 'Alla kom hem.'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getRaftLabel(key, params) {
  var labels = {
    en: {
      locked: 'The raft unlocks after the second council.',
      title: 'Building Site on the Beach',
      completion: 'Completion: {percent}%',
      survivorsToCarry: 'Survivors to carry: {count}',
      logs: 'Logs on raft: {current} / {required}',
      sail: 'Sail: {current} m² / {required} m²',
      rig: 'Rigging: {status}',
      hut: 'Cabin: {status}',
      complete: 'Complete',
      missing: 'Missing',
      supplies: 'Supplies: food {food} / {requiredFood}, water {water} / {requiredWater}, pots {pots} / {requiredPots}',
      ready: 'The raft is basically ready to depart when you decide.',
      waitMore: 'Wait for more survivors',
      sailNow: 'Sail',
      noLongerReady: 'More survivors or lost supplies mean you are no longer fully ready to depart.',
      projectHeader: 'Raft Projects',
      noProjects: 'No raft projects yet.',
      noAssignedWorker: 'No assigned worker'
    },
    se: {
      locked: 'Flotten låses upp efter det andra örådet.',
      title: 'Flottens Byggplats',
      completion: 'Färdigställande: {percent}%',
      survivorsToCarry: 'Överlevare att ta med: {count}',
      logs: 'Stockar på flotten: {current} / {required}',
      sail: 'Segel: {current} m² / {required} m²',
      rig: 'Rigg: {status}',
      hut: 'Hytt: {status}',
      complete: 'Klart',
      missing: 'Saknas',
      supplies: 'Proviant: mat {food} / {requiredFood}, vatten {water} / {requiredWater}, krukor {pots} / {requiredPots}',
      ready: 'Flotten är i stort sett redo att avsegla när du bestämmer dig.',
      waitMore: 'Vänta på fler överlevare',
      sailNow: 'Segla',
      noLongerReady: 'Fler överlevare eller förlorad proviant betyder att ni inte längre är helt redo att avsegla.',
      projectHeader: 'Flotprojekt',
      noProjects: 'Inga flotprojekt ännu.',
      noAssignedWorker: 'Ingen tilldelad arbetare'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getSailingLabel(key, params) {
  var labels = {
    en: {
      locked: 'The voyage only begins when you choose to sail from the raft site.',
      openSea: 'Open Sea',
      daysAtSea: 'Days at sea: {elapsed} / {total}',
      daysRemaining: 'Days remaining: {days}',
      aboard: 'Aboard: {count} survivors',
      foodAboard: 'Food aboard: {amount}',
      waterAboard: 'Water aboard: {amount}',
      foodLost: 'Food lost at sea: {amount}',
      journey: 'The Journey',
      journeyText1: 'Camp life is over. No more jobs, events, or expeditions happen now. Each tick is one day at sea.',
      journeyText2: 'All that remains is to see whether your food and water last until you reach harbor.'
    },
    se: {
      locked: 'Resan börjar först när du väljer att segla från flottens byggplats.',
      openSea: 'Öppet hav',
      daysAtSea: 'Dagar till havs: {elapsed} / {total}',
      daysRemaining: 'Dagar kvar: {days}',
      aboard: 'Ombord: {count} överlevare',
      foodAboard: 'Mat ombord: {amount}',
      waterAboard: 'Vatten ombord: {amount}',
      foodLost: 'Mat förlorad till havs: {amount}',
      journey: 'Resan',
      journeyText1: 'Lägerlivet är över. Inga fler jobb, händelser eller expeditioner sker nu. Varje tick är en dag till havs.',
      journeyText2: 'Nu återstår bara att se om mat och vatten räcker tills ni når hamn.'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getFinalScoreLabel(key, params) {
  var labels = {
    en: {
      title: 'Final Score',
      rescued: 'Rescued: {rescued} / {total}',
      difficulty: 'Difficulty: {difficulty} ({factor}x)',
      totalTime: 'Total time: {days} days',
      timeFactor: 'Time factor: {factor}x',
      rule: 'Full time score up to 50 days. After that, the score drops by 2% per extra day, including hours.',
      barelyEscaped: 'Barely Escaped',
      legendary: 'Legendary',
      heroic: 'Heroic',
      survivor: 'Survivor',
      scarred: 'Scarred'
    },
    se: {
      title: 'Slutpoäng',
      rescued: 'Räddade: {rescued} / {total}',
      difficulty: 'Svårighet: {difficulty} ({factor}x)',
      totalTime: 'Total tid: {days} dagar',
      timeFactor: 'Tidsfaktor: {factor}x',
      rule: 'Full tidspoäng upp till 50 dagar. Därefter minskar poängen med 2% per extra dag inklusive timmar.',
      barelyEscaped: 'Med nöd och näppe',
      legendary: 'Legendarisk',
      heroic: 'Hjältedåd',
      survivor: 'Överlevare',
      scarred: 'Ärrad'
    }
  };
  var language = getLanguage();
  return fillTemplate(((labels[language] || labels.en)[key]) || key, params);
}
function getEventText(eventName, field, fallback) {
  var source = (((GAME_DATA.events || {})[eventName]) || {})[field];
  if (getLanguage() === 'se' && source !== undefined) return source;
  return t('events.' + eventName + '.' + field, null, source || fallback);
}
function getLanguageOptionsMarkup() {
  return getSupportedLanguages().map(function(languageCode) {
    var selected = languageCode === getLanguage() ? ' selected' : '';
    return '<option value="' + languageCode + '"' + selected + '>' + getLanguageLabel(languageCode) + '</option>';
  }).join('');
}
function getPlayerDisplayName() {
  return getLanguage() === 'se' ? 'Du' : 'You';
}
function getSurvivorDisplayName(survivor) {
  if (!survivor) return '';
  return survivor.isPlayer ? getPlayerDisplayName() : (survivor.name || '');
}
function syncPlayerDisplayName() {
  var player = getPlayerSurvivor();
  if (player) player.name = getPlayerDisplayName();
}
function getVillageMetricLabel(key) {
  var labels = {
    en: {
      fireLevel: 'Fire Level',
      shelteredPeople: 'Sheltered People',
      stormFoodProtection: 'Storm Food Protection',
      restHealthTotal: 'Rest Health Total',
      restFatigueTotal: 'Rest Fatigue Total',
      restMoraleTotal: 'Rest Morale Total',
      fromFire: 'From Fire',
      fromHuts: 'From Huts',
      passiveCampMorale: 'Passive Camp Morale',
      fromPeople: 'From People',
      conflictRisk: 'Conflict Risk',
      groupPressure: 'Event Pressure From Group Size',
      conflictProtection: 'Conflict Protection',
      personalityConflict: 'Personality Conflict',
      nightRiskNoFire: 'Night Risk Without Fire',
      active: 'Active',
      none: 'None'
    },
    se: {
      fireLevel: 'Eldnivå',
      shelteredPeople: 'Skyddade personer',
      stormFoodProtection: 'Stormskydd mat',
      restHealthTotal: 'Vila hälsa totalt',
      restFatigueTotal: 'Vila utmattning totalt',
      restMoraleTotal: 'Vila moral totalt',
      fromFire: 'Från eld',
      fromHuts: 'Från hus',
      passiveCampMorale: 'Passiv lägermoral',
      fromPeople: 'Från personer',
      conflictRisk: 'Konfliktrisk',
      groupPressure: 'Händelsetryck från gruppstorlek',
      conflictProtection: 'Skydd mot konflikt',
      personalityConflict: 'Personlighet konflikt',
      nightRiskNoFire: 'Nattrisk utan eld',
      active: 'Aktiv',
      none: 'Ingen'
    }
  };
  var language = getLanguage();
  return ((labels[language] || labels.en)[key]) || key;
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function formatNumber(val) { return (Math.round((val || 0) * 10) / 10).toFixed(1); }
function formatPreciseNumber(val) { return (Math.round((val || 0) * 100) / 100).toFixed(2); }
function signedNumber(val) { return (val || 0) >= 0 ? '+' + formatNumber(val) : formatNumber(val); }
function tickFactor() { return CONFIG.tickMinutes / 60; }
function perTick(perHour) { return perHour * tickFactor(); }
function formatTime(totalMinutes) { var h=Math.floor(totalMinutes/60)%24; var m=totalMinutes%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); }
function getDifficultyConfig() { return CONFIG.difficulties[gameState.meta.difficulty || 'normal']; }
function workMultiplier() { return getDifficultyConfig().workMultiplier; }
function scaleNegativeChance(base) { return clamp(base * getDifficultyConfig().negativeEventMultiplier, 0, 1); }
function scalePositiveChance(base) { return clamp(base * getDifficultyConfig().positiveEventMultiplier, 0, 1); }
function getFireLevel() { return gameState.camp.fireLevel || 0; }
function getAliveSurvivors() { return (gameState.survivors || []).filter(function(s){ return s.alive; }); }
function getPeopleConfig() { return GAME_DATA.people || {}; }
function getWorkBalanceConfig() { return CONFIG.workBalance || {}; }
function getAliveAssignedToJob(jobId) {
  return getAliveSurvivors().filter(function(s){ return s.assignedJob === jobId; });
}
function getShelterBalanceConfig() {
  return CONFIG.shelterBalance || {};
}
function getRaftBalanceConfig() {
  return CONFIG.raftBalance || {};
}
function getAssignedJobCount(jobId) {
  return getAliveAssignedToJob(jobId).length;
}
function isCapacityTool(key) {
  return ['stone_knives', 'axes', 'spears', 'nets', 'backpacks'].indexOf(key) >= 0;
}
function getResourceLabel(key) {
  return lowerFirst(localizeNameMap('resources', key, key));
}
function getDeadSurvivors() {
  return (gameState.survivors || []).filter(function(s) { return !s.alive; });
}
function hasResourceAmount(key) {
  return (gameState.resources && (gameState.resources[key] || 0) > 0);
}
function isRecipeDiscovered(recipe) {
  var discoveries = ((recipe || {}).requirements || {}).discoveries || [];
  if (!discoveries.length) return true;
  return discoveries.every(hasDiscovery);
}
function isResourceVisible(key) {
  var alwaysVisible = { logs: true, food: true, water: true, fiber: true, tinder: true, glasses: true };
  if (alwaysVisible[key] || hasResourceAmount(key)) return true;
  var discoveryByResource = {
    clay: 'clay',
    stone: 'stone',
    bamboo: 'bamboo',
    timber: 'axe',
    rope: 'rope',
    leather: 'spear',
    stone_knives: 'stone_knife',
    axes: 'axe',
    spears: 'spear',
    nets: 'net',
    backpacks: 'backpack',
    huts: 'hut_building',
    pots: 'pots'
  };
  return discoveryByResource[key] ? hasDiscovery(discoveryByResource[key]) : false;
}
function isJobVisible(jobId) {
  var alwaysVisible = {
    philosophize: true,
    wood: true,
    food: true,
    water: true,
    fiber: true,
    make_tinder: true,
    rest: true,
    care: true
  };
  if (alwaysVisible[jobId]) return true;
  if (jobId === 'feed_fire') return hasDiscovery('fire_building') || getFireLevel() > 0;
  if (jobId === 'clay') return hasDiscovery('clay');
  if (jobId === 'stone') return hasDiscovery('stone');
  if (jobId === 'bamboo') return hasDiscovery('bamboo');
  if (jobId === 'fish') return hasDiscovery('net') || hasResourceAmount('nets');
  if (jobId === 'hunt' || jobId === 'guard') return hasDiscovery('spear') || hasResourceAmount('spears');
  if (jobId === 'timber') return hasDiscovery('axe') || hasResourceAmount('axes') || hasResourceAmount('timber');
  return true;
}
function getJobRequirements(jobId) {
  var job = CONFIG.jobs[jobId] || {};
  var requirements = Object.assign({}, job.requirements || {});
  if (job.discovery) {
    requirements.discoveries = (requirements.discoveries || []).concat([job.discovery]);
  }
  return requirements;
}
function getCapacityToolUse(toolKey, ignoredSurvivorId) {
  var jobUse = getAliveSurvivors().filter(function(survivor) {
    if (ignoredSurvivorId && survivor.id === ignoredSurvivorId) return false;
    var required = (getJobRequirements(survivor.assignedJob).capacityTools || {})[toolKey] || 0;
    return required > 0;
  }).reduce(function(total, survivor) {
    return total + ((getJobRequirements(survivor.assignedJob).capacityTools || {})[toolKey] || 0);
  }, 0);
  var projectUse = getProjects().reduce(function(total, project) {
    if (project.status !== 'active') return total;
    var recipe = CONFIG.recipes[project.recipeId] || {};
    var required = (((recipe.requirements || {}).capacityTools || {})[toolKey]) || 0;
    return total + required;
  }, 0);
  var expeditionUse = 0;
  if (gameState.expedition && gameState.expedition.active && gameState.expedition.equipment) {
    if (toolKey === 'spears' && gameState.expedition.equipment.spear) expeditionUse += 1;
    if (toolKey === 'backpacks' && gameState.expedition.equipment.backpack) expeditionUse += 1;
  }
  return jobUse + projectUse + expeditionUse;
}
function getEquipmentStockText(key) {
  var total = gameState.resources[key] || 0;
  if (!isCapacityTool(key)) return formatNumber(total);
  var used = getCapacityToolUse(key);
  var free = Math.max(0, total - used);
  return formatNumber(free) + '/' + formatNumber(total) + ' ' + t('inventory.free') + ' (' + formatNumber(used) + ' ' + t('inventory.used') + ')';
}
function getRequirementStatus(requirements, options) {
  requirements = requirements || {};
  options = options || {};
  var missing = [];
  (requirements.discoveries || []).forEach(function(id) {
    if (!hasDiscovery(id)) missing.push(getRequirementText('discovery', { id: getDiscoveryDef(id) ? getDiscoveryDef(id).name : id }));
  });
  Object.keys(requirements.resources || {}).forEach(function(key) {
    var needed = requirements.resources[key] || 0;
    if ((gameState.resources[key] || 0) < needed) missing.push(getRequirementText('missingResource', { amount: formatNumber(needed - (gameState.resources[key] || 0)), resource: getResourceLabel(key) }));
  });
  Object.keys(requirements.tools || {}).forEach(function(key) {
    var needed = requirements.tools[key] || 0;
    if ((gameState.resources[key] || 0) < needed) missing.push(getRequirementText('requiresResource', { resource: getResourceLabel(key) }));
  });
  Object.keys(requirements.capacityTools || {}).forEach(function(key) {
    var needed = requirements.capacityTools[key] || 0;
    var available = gameState.resources[key] || 0;
    var used = getCapacityToolUse(key, options.survivorId);
    if ((available - used) < needed) {
      missing.push(available >= needed ? getRequirementText('noFreeTool', { resource: getResourceLabel(key) }) : getRequirementText('requiresResource', { resource: getResourceLabel(key) }));
    }
  });
  return { ok: missing.length === 0, missing: missing };
}
function getMissingRequirementText(requirements, options) {
  return getRequirementStatus(requirements, options).missing.join(', ');
}
function getEquipmentCapacityForJob(jobId) {
  var capacityTools = getJobRequirements(jobId).capacityTools || {};
  var keys = Object.keys(capacityTools);
  if (!keys.length) return Infinity;
  return keys.reduce(function(min, key) {
    var needed = capacityTools[key] || 1;
    return Math.min(min, Math.floor((gameState.resources[key] || 0) / needed));
  }, Infinity);
}
function hasFreeEquipmentForJob(jobId, survivorId) {
  return getRequirementStatus(getJobRequirements(jobId), { survivorId: survivorId }).ok;
}
function cloneBaseSkills() {
  var skills = {};
  var base = getPeopleConfig().baseSkills || {};
  Object.keys(base).forEach(function(key) { skills[key] = base[key]; });
  return skills;
}
function mergeSkillModifiers(target, modifiers) {
  modifiers = modifiers || {};
  Object.keys(modifiers).forEach(function(key) {
    target[key] = (target[key] || 0) + modifiers[key];
  });
}
function clampSkillMap(skills) {
  var clampConfig = (getPeopleConfig().generationRules || {}).clampSkills || {};
  var min = clampConfig.min !== undefined ? clampConfig.min : -2;
  var max = clampConfig.max !== undefined ? clampConfig.max : 5;
  Object.keys(skills).forEach(function(key) {
    skills[key] = clamp(skills[key], min, max);
  });
  return skills;
}
function buildPassiveEffects(parts) {
  var passive = {};
  (parts || []).forEach(function(part) {
    if (!part) return;
    Object.keys(part).forEach(function(key) {
      passive[key] = (passive[key] || 0) + part[key];
    });
  });
  return passive;
}
function getPortraitUrl(name) {
  return 'resources/survivors/' + encodeURIComponent(name.toLowerCase()) + '.png';
}
function getBackgroundDef(backgroundId) {
  var base = ((getPeopleConfig().backgrounds || {})[backgroundId]) || null;
  if (!base) return null;
  if (getLanguage() === 'se') return base;
  return Object.assign({}, base, {
    name: t('backgrounds.' + backgroundId + '.name', null, base.name),
    description: t('backgrounds.' + backgroundId + '.description', null, base.description),
    specialEffect: t('backgrounds.' + backgroundId + '.specialEffect', null, base.specialEffect)
  });
}
function getTraitDef(traitId) {
  var base = ((getPeopleConfig().traits || {})[traitId]) || null;
  if (!base) return null;
  if (getLanguage() === 'se') return base;
  return Object.assign({}, base, {
    name: t('traits.' + traitId + '.name', null, base.name),
    description: t('traits.' + traitId + '.description', null, base.description)
  });
}
function traitBadgeClass(trait) {
  return (trait && trait.penalties && Object.keys(trait.penalties).length) ? 'negative' : 'positive';
}
function getTopSkills(survivor, count) {
  var skills = survivor.skills || {};
  return Object.keys(skills)
    .map(function(key) { return { key: key, value: skills[key] || 0 }; })
    .sort(function(a, b) { return b.value - a.value; })
    .slice(0, count || 4);
}
function getSkillLevelForJob(survivor, jobId) {
  var skillKey = (getWorkBalanceConfig().jobSkillMap || {})[jobId] || jobId;
  var skills = survivor.skills || {};
  var level = skills[skillKey];
  return level !== undefined ? level : 1;
}
function getSkillFactor(level) {
  var map = getWorkBalanceConfig().skillFactorByLevel || {};
  var key = String(level);
  if (map[key] !== undefined) return map[key];
  if (level < -2) return map['-2'] !== undefined ? map['-2'] : 0.55;
  if (level > 5) return map['5'] !== undefined ? map['5'] : 1.5;
  return 1;
}
function getBandFactor(value, bands, compareKey) {
  var i;
  if (!bands || !bands.length) return 1;
  if (compareKey === 'min') {
    for (i = 0; i < bands.length; i++) {
      if (value >= bands[i].min) return bands[i].factor;
    }
  } else {
    for (i = 0; i < bands.length; i++) {
      if (value <= bands[i].max) return bands[i].factor;
    }
  }
  return 1;
}
function getHealthWorkFactor(survivor) {
  return getBandFactor(survivor.health || 0, getWorkBalanceConfig().healthFactorBands || [], 'min');
}
function getFatigueWorkFactor(survivor) {
  return getBandFactor(survivor.fatigue || 0, getWorkBalanceConfig().fatigueFactorBands || [], 'max');
}
function getJobPerformanceBreakdown(survivor, jobId) {
  var balance = getWorkBalanceConfig();
  var skillLevel = getSkillLevelForJob(survivor, jobId);
  var skillFactor = getSkillFactor(skillLevel);
  var healthFactor = getHealthWorkFactor(survivor);
  var fatigueFactor = getFatigueWorkFactor(survivor);
  var difficultyFactor = workMultiplier();
  var unclamped = skillFactor * healthFactor * fatigueFactor * difficultyFactor;
  var clampCfg = balance.finalFactorClamp || {};
  var finalFactor = clamp(unclamped, clampCfg.min !== undefined ? clampCfg.min : 0.35, clampCfg.max !== undefined ? clampCfg.max : 1.75);
  return {
    skillKey: (balance.jobSkillMap || {})[jobId] || jobId,
    skillLevel: skillLevel,
    skillFactor: skillFactor,
    healthFactor: healthFactor,
    fatigueFactor: fatigueFactor,
    difficultyFactor: difficultyFactor,
    unclamped: unclamped,
    finalFactor: finalFactor
  };
}
function getJobPerformanceFactor(survivor, jobId) {
  return getJobPerformanceBreakdown(survivor, jobId).finalFactor;
}
function getTotalJobPerformance(jobId) {
  return getAliveAssignedToJob(jobId).reduce(function(total, survivor) {
    return total + getJobPerformanceFactor(survivor, jobId);
  }, 0);
}
function formatSkillLabel(skillKey) {
  return localizeNameMap('skills', skillKey, skillKey);
}
function icon(name) {
  var icons = {
    wood: '&#129717;',
    food: '&#129365;',
    water: '&#128167;',
    fish: '&#127907;',
    hunt: '&#127993;',
    guard: '&#128737;&#65039;',
    tinder: '&#129718;',
    fire: '&#128293;',
    idea: '&#128173;',
    rest: '&#128564;',
    care: '&#9877;&#65039;',
    clay: '&#129704;',
    stone: '&#129704;',
    bamboo: '&#127883;',
    timber: '&#129717;',
    fiber: '&#129526;',
    rope: '&#129698;',
    leather: '&#129704;',
    knife: '&#128298;',
    axe: '&#129683;',
    spear: '&#128481;&#65039;',
    net: '&#129767;&#65039;',
    backpack: '&#127890;',
    hut: '&#127968;',
    pot: '&#127994;',
    glasses: '&#128083;',
    craft: '&#128295;',
    health: '&#9877;&#65039;',
    morale: '&#128154;',
    check: '&#10003;',
    arrow: '&rarr;'
  };
  return icons[name] || '';
}
function renderPortraitMarkup(name, className) {
  var portraitUrl = getPortraitUrl(name);
  var cls = className || 'survivor-portrait';
  return '<img class="' + cls + '" src="' + portraitUrl + '" alt="' + name + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'' + cls + ' fallback\',textContent:\'' + t('meta.imageMissing') + '\'}))">';
}
function getRecommendedJobs(survivor) {
  var candidateJobs = ['wood', 'timber', 'food', 'water', 'fish', 'hunt', 'guard', 'care', 'craft', 'explore'];
  return candidateJobs
    .map(function(jobId) {
      return { jobId: jobId, factor: getJobPerformanceBreakdown(survivor, jobId).finalFactor };
    })
    .sort(function(a, b) { return b.factor - a.factor; })
    .slice(0, 3);
}
function buildRecommendationMarkup(survivor) {
  var recommendations = getRecommendedJobs(survivor);
  if (!recommendations.length) return '';
  var strong = recommendations.filter(function(item) { return item.factor >= 1.05; });
  var items = (strong.length ? strong : recommendations.slice(0, 2)).map(function(item) {
    return formatSkillLabel(item.jobId).toLowerCase();
  });
  var text = items.length === 1
    ? 'Särskilt lämpad för ' + items[0] + '.'
    : 'Särskilt lämpad för ' + items.slice(0, -1).join(', ') + ' och ' + items[items.length - 1] + '.';
  return '<div class="recommendation-box"><div class="recommendation-title">Rekommendation</div><div class="recommendation-text">' + text + '</div></div>';
}
function buildPerformanceDebugMarkup(survivor) {
  var jobs = ['wood', 'timber', 'food', 'water', 'fish', 'hunt', 'guard', 'care', 'craft', 'explore'];
  var healthFactor = getHealthWorkFactor(survivor);
  var energyFactor = getFatigueWorkFactor(survivor);
  var baseFactor = healthFactor * energyFactor * workMultiplier();
  var html = '<div class="debug-section"><div class="debug-title">Hälsoprofil <span style="font-weight:400;color:#777;">(påverkar allt)</span></div>';
  html += '<div class="debug-row"><span>Hälsa</span><span>' + formatNumber(healthFactor) + 'x</span></div>';
  html += '<div class="debug-row"><span>Energi</span><span>' + formatNumber(energyFactor) + 'x</span></div>';
  html += '<div class="debug-row"><span>Basfaktor</span><span>' + formatNumber(baseFactor) + 'x</span></div>';
  if ((survivor.passiveEffects || {}).discoveryChanceBonus || (survivor.passiveEffects || {}).discoveryChanceMultiplier) {
    var passive = survivor.passiveEffects || {};
    html += '<div class="debug-row"><span>Idéer/upptäckt</span><span>' + formatNumber(passive.discoveryChanceMultiplier || 1) + 'x +' + formatNumber(passive.discoveryChanceBonus || 0) + '</span></div>';
  }
  html += '<div class="debug-title" style="margin-top:10px;">Arbetsprofil</div>';
  jobs.forEach(function(jobId) {
    var breakdown = getJobPerformanceBreakdown(survivor, jobId);
    html += '<div class="debug-row"><span>' + formatSkillLabel(jobId) + ' (' + formatSkillLabel(breakdown.skillKey) + ' ' + (breakdown.skillLevel > 0 ? '+' : '') + breakdown.skillLevel + ', skill ' + formatNumber(breakdown.skillFactor) + 'x)</span><span>' + formatNumber(breakdown.finalFactor) + 'x</span></div>';
  });
  html += '<div class="debug-row"><span>Svårighet</span><span>' + formatNumber(workMultiplier()) + 'x</span></div>';
  html += '</div>';
  return html;
}
function buildSurvivorHoverMarkup(survivor) {
  var background = getBackgroundDef(survivor.background);
  var traits = (survivor.traits || []).map(getTraitDef).filter(Boolean);
  var topSkills = getTopSkills(survivor, 4);
  var html = '<div class="survivor-hover-card">';
  html += renderPortraitMarkup(survivor.name, 'survivor-portrait');
  html += '<div class="survivor-hover-name">' + survivor.name + '</div>';
  if (background) html += '<div class="survivor-hover-subtitle">' + background.name + '</div>';
  if (background && background.description) html += '<div class="survivor-hover-text">' + background.description + '</div>';
  if (background && background.specialEffect) html += '<div class="survivor-hover-text">' + background.specialEffect + '</div>';
  if (traits.length) {
    html += '<div class="survivor-chip-row">';
    traits.forEach(function(trait) { html += '<span class="survivor-chip">' + trait.name + '</span>'; });
    html += '</div>';
  }
  if (topSkills.length) {
    html += '<div class="skill-grid">';
    topSkills.forEach(function(skill) {
      var cls = skill.value > 0 ? 'positive' : (skill.value < 0 ? 'negative' : '');
      html += '<div class="skill-pill"><span>' + formatSkillLabel(skill.key) + '</span><strong class="' + cls + '">' + (skill.value > 0 ? '+' : '') + skill.value + '</strong></div>';
    });
    html += '</div>';
  }
  html += buildRecommendationMarkup(survivor);
  html += buildPerformanceDebugMarkup(survivor);
  html += '</div>';
  return html;
}
function showArrivalCard(survivor) {
  var overlay = document.getElementById('arrival-overlay');
  if (!overlay || !survivor) return;
  var background = getBackgroundDef(survivor.background);
  var traits = (survivor.traits || []).map(getTraitDef).filter(Boolean);
  var topSkills = getTopSkills(survivor, 6);
  document.getElementById('arrival-media').innerHTML = renderPortraitMarkup(survivor.name, 'survivor-portrait');
  document.getElementById('arrival-title').textContent = survivor.name;
  document.getElementById('arrival-subtitle').textContent = background ? background.name : t('ui.newSurvivor');
  document.getElementById('arrival-text').textContent = background && background.description ? background.description + ' ' + (background.specialEffect || '') : t('ui.newSurvivorText');
  document.getElementById('arrival-traits').innerHTML = traits.map(function(trait) {
    return '<span class="survivor-chip">' + trait.name + '</span>';
  }).join('');
  document.getElementById('arrival-skills').innerHTML = topSkills.map(function(skill) {
    var cls = skill.value > 0 ? 'positive' : (skill.value < 0 ? 'negative' : '');
    return '<div class="skill-pill"><span>' + formatSkillLabel(skill.key) + '</span><strong class="' + cls + '">' + (skill.value > 0 ? '+' : '') + skill.value + '</strong></div>';
  }).join('');
  overlay.classList.add('visible');
}
function hideArrivalCard() {
  var overlay = document.getElementById('arrival-overlay');
  if (overlay) overlay.classList.remove('visible');
}
function getExplorationCouncilConfig() {
  return ((CONFIG.council || {}).exploration) || {};
}
function getRaftCouncilConfig() {
  return ((CONFIG.council || {}).raft) || {};
}
function getDepartureCouncilConfig() {
  return ((CONFIG.council || {}).departure) || {};
}
function isExpeditionUnlocked() {
  return (gameState.world || {}).phase === 'exploration' || !!((gameState.world || {}).raftUnlocked);
}
function escapeHtml(text) {
  return String(text || '').replace(/[&<>"']/g, function(ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
  });
}
function getCouncilSpeakerNames() {
  return getAliveSurvivors().filter(function(s) { return !s.isPlayer; }).slice(0, 4);
}
function formatCouncilText(rawText) {
  var text = rawText || '';
  var speakers = getCouncilSpeakerNames();
  for (var i = 0; i < 4; i++) {
    var name = speakers[i] ? speakers[i].name : t('common.unknown');
    text = text.replace(new RegExp('\\[person_' + (i + 1) + '\\]', 'g'), name);
  }
  return text.split(/\n\s*\n/).filter(function(paragraph) {
    return paragraph.trim().length > 0;
  }).map(function(paragraph) {
    return '<p>' + escapeHtml(paragraph.trim()).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}
function formatNamedStoryText(rawText, replacements) {
  var text = rawText || '';
  Object.keys(replacements || {}).forEach(function(key) {
    text = text.replace(new RegExp('\\[' + key + '\\]', 'g'), replacements[key] || '');
  });
  return text.split(/\n\s*\n/).filter(function(paragraph) {
    return paragraph.trim().length > 0;
  }).map(function(paragraph) {
    return '<p>' + escapeHtml(paragraph.trim()).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}
function hasExplorationCouncilRequirements() {
  var cfg = getExplorationCouncilConfig();
  if (getAliveSurvivors().length < (cfg.minSurvivors || 5)) return false;
  return (cfg.requiredDiscoveries || []).every(function(id) { return hasDiscovery(id); });
}
function showExplorationCouncilCard() {
  var overlay = document.getElementById('council-overlay');
  if (!overlay) return;
  var cfg = getExplorationCouncilConfig();
  document.getElementById('council-eyebrow').textContent = t('ui.phase2');
  document.getElementById('council-media').innerHTML = '<img src="' + (cfg.image || 'resources/ui/council.png') + '" alt="' + t('shell.councilTitle') + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'village-placeholder\',textContent:\'' + t('shell.councilTitle') + '\'}))">';
  document.getElementById('council-title').textContent = t('councils.exploration.title', null, cfg.title || t('shell.councilTitle'));
  document.getElementById('council-subtitle').textContent = t('councils.exploration.subtitle', null, cfg.subtitle);
  document.getElementById('council-text').innerHTML = formatCouncilText((GAME_DATA.council || {}).explorationText || t('councils.exploration.text', null, cfg.text));
  document.getElementById('council-close').textContent = t('councils.exploration.button', null, cfg.buttonText || t('common.continue'));
  overlay.classList.add('visible');
}
function hideExplorationCouncilCard() {
  var overlay = document.getElementById('council-overlay');
  if (overlay) overlay.classList.remove('visible');
  var handler = councilOverlayCloseHandler;
  councilOverlayCloseHandler = null;
  if (typeof handler === 'function') handler();
}
function showRaftCouncilCard() {
  var overlay = document.getElementById('council-overlay');
  if (!overlay) return;
  var cfg = getRaftCouncilConfig();
  document.getElementById('council-eyebrow').textContent = t('ui.phase3');
  document.getElementById('council-media').innerHTML = '<img src="' + (cfg.image || 'resources/ui/council.png') + '" alt="' + t('shell.councilTitle') + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'village-placeholder\',textContent:\'' + t('shell.councilTitle') + '\'}))">';
  document.getElementById('council-title').textContent = t('councils.raft.title', null, cfg.title || t('shell.councilTitle'));
  document.getElementById('council-subtitle').textContent = t('councils.raft.subtitle', null, cfg.subtitle);
  document.getElementById('council-text').innerHTML = formatCouncilText((GAME_DATA.council || {}).raftText || t('councils.raft.text', null, cfg.text));
  document.getElementById('council-close').textContent = t('councils.raft.button', null, cfg.buttonText || t('common.continue'));
  overlay.classList.add('visible');
}
function showDepartureCouncilCard() {
  var overlay = document.getElementById('council-overlay');
  if (!overlay) return;
  var cfg = getDepartureCouncilConfig();
  document.getElementById('council-eyebrow').textContent = t('ui.departure');
  document.getElementById('council-media').innerHTML = '<img src="' + (cfg.image || 'resources/ui/council.png') + '" alt="' + t('shell.councilTitle') + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'village-placeholder\',textContent:\'' + t('shell.councilTitle') + '\'}))">';
  document.getElementById('council-title').textContent = t('councils.departure.title', null, cfg.title || t('shell.councilTitle'));
  document.getElementById('council-subtitle').textContent = t('councils.departure.subtitle', null, cfg.subtitle);
  document.getElementById('council-text').innerHTML = formatCouncilText((GAME_DATA.council || {}).departureText || t('councils.departure.text', null, cfg.text));
  document.getElementById('council-close').textContent = t('councils.departure.button', null, cfg.buttonText || t('common.continue'));
  overlay.classList.add('visible');
}
function showStoryOverlay(options) {
  var overlay = document.getElementById('council-overlay');
  if (!overlay) return;
  var imageHtml = '';
  if (options.mediaHtml) {
    imageHtml = options.mediaHtml;
  } else if (options.portraitName) {
    imageHtml = renderPortraitMarkup(options.portraitName, 'survivor-portrait');
  } else {
    var image = options.image || 'resources/ui/council.png';
    imageHtml = '<img src="' + image + '" alt="' + escapeHtml(options.title || t('ui.event')) + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'village-placeholder\',textContent:\'' + t('ui.event') + '\'}))">';
  }
  document.getElementById('council-eyebrow').textContent = options.eyebrow || t('ui.homecoming');
  document.getElementById('council-media').innerHTML = imageHtml;
  document.getElementById('council-title').textContent = options.title || t('ui.event');
  document.getElementById('council-subtitle').textContent = options.subtitle || '';
  document.getElementById('council-text').innerHTML = (options.bodyHtml || formatNamedStoryText(options.text || '', options.replacements || {})) + (options.appendHtml || '');
  document.getElementById('council-close').textContent = options.buttonText || t('common.continue');
  councilOverlayCloseHandler = typeof options.onClose === 'function' ? options.onClose : null;
  overlay.classList.add('visible');
}
function getVoyageState() {
  if (!gameState.voyage) {
    gameState.voyage = {
      active: false,
      completed: false,
      passengerCount: 0,
      daysElapsed: 0,
      totalDays: getRaftBalanceConfig().travelDays || 30,
      foodLostOverboard: 0,
      articleStage: 0
    };
  }
  return gameState.voyage;
}
function isVoyageActive() {
  return !!(gameState.voyage && gameState.voyage.active);
}
function renderPortraitStrip(survivors, emptyText) {
  if (!survivors || !survivors.length) return '<div class="project-meta">' + escapeHtml(emptyText || 'Ingen att visa.') + '</div>';
  return '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;">' + survivors.map(function(survivor) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:84px;">'
      + renderPortraitMarkup(survivor.name, 'survivor-portrait')
      + '<div style="font-size:12px;color:#d6d6d6;text-align:center;">' + escapeHtml(survivor.name) + '</div>'
      + '</div>';
  }).join('') + '</div>';
}
function renderNamedPortraitStrip(names, emptyText) {
  if (!names || !names.length) return '<div class="project-meta">' + escapeHtml(emptyText || 'Ingen att visa.') + '</div>';
  return '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;">' + names.map(function(name) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:84px;">'
      + renderPortraitMarkup(name, 'survivor-portrait')
      + '<div style="font-size:12px;color:#d6d6d6;text-align:center;">' + escapeHtml(name) + '</div>'
      + '</div>';
  }).join('') + '</div>';
}
function getIslandRosterNames() {
  var people = getPeopleConfig();
  var playerName = (people.playerTemplate && people.playerTemplate.name) || 'Du';
  var newcomerNames = Array.isArray(people.newcomerNames) ? people.newcomerNames.slice() : [];
  return [playerName].concat(newcomerNames);
}
function getVoyageOutcomeSummary() {
  var roster = getIslandRosterNames();
  var alive = getAliveSurvivors();
  var dead = getDeadSurvivors();
  var aliveNames = alive.map(function(s) { return s.name; });
  var deadNames = dead.map(function(s) { return s.name; });
  var neverRescued = roster.filter(function(name) {
    return aliveNames.indexOf(name) < 0 && deadNames.indexOf(name) < 0;
  });
  return {
    roster: roster,
    alive: alive,
    dead: dead,
    deadNames: deadNames,
    neverRescuedNames: neverRescued
  };
}
function getTotalElapsedDays() {
  var day = Math.max(1, (gameState.meta && gameState.meta.day) || 1);
  var minutes = Math.max(0, (gameState.meta && gameState.meta.dayMinutes) || 0);
  return (day - 1) + (minutes / 1440);
}
function getFinalScoreSummary() {
  var outcome = getVoyageOutcomeSummary();
  var difficulty = (gameState.meta && gameState.meta.difficulty) || 'normal';
  var totalRoster = Math.max(1, outcome.roster.length);
  var rescuedCount = outcome.alive.length;
  var rescuedRatio = rescuedCount / totalRoster;
  var totalDays = getTotalElapsedDays();
  var targetDays = 50;
  var overdueDays = Math.max(0, totalDays - targetDays);
  var timeFactor = overdueDays <= 0 ? 1 : clamp(1 - (overdueDays * 0.02), 0.1, 1);
  var difficultyFactorMap = { easy: 1.0, normal: 1.2, hard: 1.5 };
  var difficultyFactor = difficultyFactorMap[difficulty] || 1.2;
  var baseScore = 1000;
  var finalScore = Math.round(baseScore * rescuedRatio * difficultyFactor * timeFactor);
  var ratingKey = 'barelyEscaped';
  if (finalScore >= 1350) ratingKey = 'legendary';
  else if (finalScore >= 1050) ratingKey = 'heroic';
  else if (finalScore >= 750) ratingKey = 'survivor';
  else if (finalScore >= 450) ratingKey = 'scarred';
  return {
    rescuedCount: rescuedCount,
    totalRoster: totalRoster,
    rescuedRatio: rescuedRatio,
    totalDays: totalDays,
    overdueDays: overdueDays,
    timeFactor: timeFactor,
    difficultyFactor: difficultyFactor,
    difficultyLabel: getDifficultyConfig().label,
    finalScore: finalScore,
    ratingKey: ratingKey
  };
}
function renderFinalScoreMarkup() {
  var score = getFinalScoreSummary();
  return '<div style="margin-top:16px;padding:14px;border:1px solid #4b4b4b;border-radius:12px;background:rgba(255,255,255,0.03);">'
    + '<div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#f1c40f;">' + getFinalScoreLabel('title') + '</div>'
    + '<div style="font-size:34px;font-weight:800;line-height:1;margin-top:6px;">' + score.finalScore + '</div>'
    + '<div style="margin-top:6px;font-size:14px;color:#f0d98a;font-weight:700;">' + escapeHtml(getFinalScoreLabel(score.ratingKey)) + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;font-size:13px;color:#d6d6d6;">'
    + '<div>' + getFinalScoreLabel('rescued', { rescued: score.rescuedCount, total: score.totalRoster }) + '</div>'
    + '<div>' + getFinalScoreLabel('difficulty', { difficulty: escapeHtml(score.difficultyLabel), factor: formatNumber(score.difficultyFactor) }) + '</div>'
    + '<div>' + getFinalScoreLabel('totalTime', { days: formatPreciseNumber(score.totalDays) }) + '</div>'
    + '<div>' + getFinalScoreLabel('timeFactor', { factor: formatNumber(score.timeFactor) }) + '</div>'
    + '</div>'
    + '<div style="margin-top:10px;font-size:12px;color:#b8b8b8;">' + getFinalScoreLabel('rule') + '</div>'
    + '</div>';
}
function getLossSummaryText(deadCount, missingCount) {
  var parts = [];
  if (deadCount > 0) parts.push(getStoryLabel('lossSummaryDead', { count: deadCount }));
  if (missingCount > 0) parts.push(getStoryLabel('lossSummaryMissing', { count: missingCount }));
  if (!parts.length) return getStoryLabel('everyoneCameHomeShort');
  return parts.join(', ');
}
function didEveryoneSurviveIsland() {
  var summary = getVoyageOutcomeSummary();
  return summary.alive.length === summary.roster.length && summary.dead.length === 0 && summary.neverRescuedNames.length === 0;
}
function showVoyageArrivalArticles() {
  var articles = GAME_DATA.articles || {};
  var outcome = getVoyageOutcomeSummary();
  var alive = outcome.alive;
  var dead = outcome.dead;
  showStoryOverlay({
    eyebrow: getStoryLabel('articleEyebrow'),
    title: getStoryLabel('reachesHarborTitle'),
    subtitle: getStoryLabel('thirtyDaysAtSeaSubtitle'),
    image: 'resources/raft/raft_sail.png',
    text: articles.arrival || 'Efter trettio dagar till havs når flotten äntligen hamn.',
    appendHtml: renderPortraitStrip(alive, 'Inga överlevande kunde visas.'),
    buttonText: getStoryLabel('nextArticle'),
    onClose: function() {
      var everyone = didEveryoneSurviveIsland();
      showStoryOverlay({
        eyebrow: getStoryLabel('aftermathEyebrow'),
        title: everyone ? getStoryLabel('allRescuedTitle') : getStoryLabel('aftermathSorrowTitle'),
        subtitle: everyone ? getStoryLabel('everyoneCameHome') : getLossSummaryText(dead.length, outcome.neverRescuedNames.length),
        mediaHtml: everyone
          ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><img src="resources/raft/primeminister.png" alt="Statsministern"><img src="resources/raft/raft_sail.png" alt="Flotten"><img src="resources/ui/hut.png" alt="Hus i lägret"><img src="resources/map/djungle_wreckage.png" alt="Cockpit i djungeln"></div>'
          : '<img src="resources/raft/primeminister.png" alt="Statsministern">',
        text: everyone ? (articles.allSurvived || 'Alla trettiotre överlevande kom hem.') : (articles.deaths || 'Alla kom inte hem.'),
        appendHtml: renderFinalScoreMarkup() + (everyone ? '' :
          ((dead.length ? '<div style="margin-top:14px;font-weight:700;color:#f0d98a;">' + getStoryLabel('deadInCampHeader') + '</div>' + renderPortraitStrip(dead, '') : '')
          + (outcome.neverRescuedNames.length ? '<div style="margin-top:18px;font-weight:700;color:#f0d98a;">' + getStoryLabel('neverRescuedHeader') + '</div>' + renderNamedPortraitStrip(outcome.neverRescuedNames, '') : '')
          + (!dead.length && !outcome.neverRescuedNames.length ? '<div class="project-meta">' + getStoryLabel('noLossesEndgame') + '</div>' : ''))),
        buttonText: getStoryLabel('close')
      });
    }
  });
}
function checkExplorationCouncilActivation() {
  if (!gameState.camp) return;
  gameState.camp.council = gameState.camp.council || {};
  if (gameState.camp.council.explorationShown) return;
  if (!hasExplorationCouncilRequirements()) return;
  gameState.camp.council.explorationShown = true;
  gameState.world.phase = 'exploration';
  addLog(t('messages.councilExploration'), 'success');
  showExplorationCouncilCard();
}
function checkRaftCouncilActivation() {
  if (!gameState.camp) return;
  gameState.camp.council = gameState.camp.council || {};
  if (gameState.camp.council.raftShown) return;
  if (!hasDiscovery('cockpit')) return;
  gameState.camp.council.raftShown = true;
  gameState.world.raftUnlocked = true;
  gameState.world.phase = 'raft';
  addLog(t('messages.councilRaft'), 'success');
  showRaftCouncilCard();
}
function checkDepartureCouncilActivation() {
  if (!gameState.camp) return;
  gameState.camp.council = gameState.camp.council || {};
  if (gameState.camp.council.departureShown) return;
  if (!((gameState.world || {}).raftUnlocked)) return;
  var summary = getRaftSummary();
  if (!summary.ready) return;
  gameState.camp.council.departureShown = true;
  gameState.world.departureReady = true;
  addLog(t('messages.councilDeparture'), 'success');
  showDepartureCouncilCard();
}
function getExpeditionConfig() {
  var difficulty = (gameState.meta && gameState.meta.difficulty) || 'normal';
  var sizeByDifficulty = {
    easy: { width: 7, jungleRows: 10, cockpitMinDistance: 5 },
    normal: { width: 8, jungleRows: 10, cockpitMinDistance: 6 },
    hard: { width: 10, jungleRows: 10, cockpitMinDistance: 8 }
  };
  var size = sizeByDifficulty[difficulty] || sizeByDifficulty.normal;
  var area = size.width * size.jungleRows;
  function scaledCount(base, min) {
    return Math.max(min || 0, Math.round(base * area / 100));
  }
  return {
    width: size.width,
    jungleRows: size.jungleRows,
    height: size.jungleRows + 2,
    camp: { x: Math.floor(size.width / 2), y: size.jungleRows },
    foodCost: 4,
    waterCost: 4,
    foodPerTick: 4 / (4 * 12),
    waterPerTick: 4 / (4 * 10),
    escortSupplyMultiplier: 1.7,
    cockpitMinDistance: size.cockpitMinDistance,
    escortMinHealth: 45,
    rescueCarePerTick: 7,
    returnFatiguePerTick: 2.5,
    strandedShareFood: 1.2,
    strandedShareWater: 1.2,
    strandedDeathChanceOnReturn: 0.2,
    hiddenSurvivorsByFeature: {
      food: scaledCount(3, 2),
      water: scaledCount(3, 2)
    },
    featureLimits: {
      food: scaledCount(12, 8),
      water: scaledCount(12, 8),
      lookout: scaledCount(4, 3),
      temple: scaledCount(2, 1),
      wreckage: 1
    }
  };
}
function getExpedition() {
  if (!gameState.expedition) gameState.expedition = createExpeditionState();
  initializeExpeditionMap(gameState.expedition);
  return gameState.expedition;
}
function tileKey(x, y) { return x + ',' + y; }
function createExpeditionState() {
  var cfg = getExpeditionConfig();
  var state = {
    active: false,
    unlocked: false,
    survivorId: null,
    position: { x: cfg.camp.x, y: cfg.camp.y },
    pendingCommand: null,
    supplies: { food: 0, water: 0 },
    equipment: { spear: false, backpack: false, glasses: false },
    gear: { sword: false, shield: false },
    map: { width: cfg.width, height: cfg.height, tiles: {}, visited: {} },
    foundCockpit: false,
    runFoundCockpit: false,
    escorting: null,
    hiddenSurvivorAssigned: { food: 0, water: 0 },
    autoWalkPath: [],
    returnPath: [],
    returnTicksRemaining: 0,
    restTicksRemaining: 0,
    log: []
  };
  initializeExpeditionMap(state);
  return state;
}
function initializeExpeditionMap(expedition) {
  var cfg = getExpeditionConfig();
  expedition.map = expedition.map || {};
  expedition.map.width = cfg.width;
  expedition.map.height = cfg.height;
  expedition.map.tiles = expedition.map.tiles || {};
  expedition.map.visited = expedition.map.visited || {};
  Object.keys(expedition.map.tiles).forEach(function(key) {
    var parts = key.split(',').map(function(part) { return parseInt(part, 10); });
    var y = parts[1];
    var tile = expedition.map.tiles[key] || {};
    if (y < cfg.height - 2 && (tile.terrain === 'waterline' || tile.terrain === 'forestline' || tile.feature === 'camp')) {
      expedition.map.tiles[key] = { terrain: 'djungel', feature: null, eventResolved: false };
      delete expedition.map.visited[key];
    }
  });
  for (var x = 0; x < cfg.width; x++) {
    setExpeditionTile(expedition, x, cfg.height - 1, { terrain: 'waterline', feature: null, eventResolved: true });
    setExpeditionTile(expedition, x, cfg.camp.y, { terrain: 'forestline', feature: null, eventResolved: true });
    expedition.map.visited[tileKey(x, cfg.height - 1)] = true;
    expedition.map.visited[tileKey(x, cfg.camp.y)] = true;
  }
  setExpeditionTile(expedition, cfg.camp.x, cfg.camp.y, { terrain: 'camp', feature: 'camp', eventResolved: true });
  expedition.map.visited[tileKey(cfg.camp.x, cfg.camp.y)] = true;
  expedition.cockpit = expedition.cockpit || pickCockpitTile();
}
function pickCockpitTile() {
  var cfg = getExpeditionConfig();
  var candidates = [];
  for (var y = 0; y < cfg.height - 2; y++) {
    for (var x = 0; x < cfg.width; x++) {
      if (Math.abs(x - cfg.camp.x) + Math.abs(y - cfg.camp.y) >= cfg.cockpitMinDistance) candidates.push({ x: x, y: y });
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)] || { x: 0, y: 0 };
}
function getExpeditionTile(expedition, x, y) {
  var key = tileKey(x, y);
  if (!expedition.map.tiles[key]) {
    expedition.map.tiles[key] = { terrain: 'djungel', feature: null, eventResolved: false };
  }
  return expedition.map.tiles[key];
}
function setExpeditionTile(expedition, x, y, data) {
  expedition.map.tiles[tileKey(x, y)] = Object.assign(getExpeditionTile(expedition, x, y), data || {});
}
function countExpeditionFeature(expedition, feature) {
  return Object.keys((expedition.map || {}).tiles || {}).reduce(function(total, key) {
    return total + (((expedition.map.tiles[key] || {}).feature === feature) ? 1 : 0);
  }, 0);
}
function canAddExpeditionFeature(expedition, feature) {
  var limits = getExpeditionConfig().featureLimits || {};
  if (limits[feature] === undefined) return true;
  return countExpeditionFeature(expedition, feature) < limits[feature];
}
function addExpeditionFeature(expedition, tile, feature) {
  if (!canAddExpeditionFeature(expedition, feature)) return false;
  tile.feature = feature;
  return true;
}
function getExpeditionStrandedSurvivors(expedition) {
  var waiting = [];
  Object.keys((expedition.map || {}).tiles || {}).forEach(function(key) {
    var tile = expedition.map.tiles[key] || {};
    if (tile.strandedSurvivor) waiting.push(tile.strandedSurvivor);
  });
  if (expedition.escorting) waiting.push(expedition.escorting);
  return waiting;
}
function getReservedExpeditionNames() {
  var used = {};
  getExistingSurvivorNames().forEach(function(name) { used[name] = true; });
  getExpeditionStrandedSurvivors(getExpedition()).forEach(function(survivor) {
    if (survivor && survivor.name) used[survivor.name] = true;
  });
  return used;
}
function existingExpeditionProfileSignatures() {
  var map = existingProfileSignatures();
  getExpeditionStrandedSurvivors(getExpedition()).forEach(function(survivor) {
    if (!survivor) return;
    map[getSurvivorProfileSignature({ background: survivor.background || 'none', traits: survivor.traits || [] })] = true;
  });
  return map;
}
function generateExpeditionRescueProfile() {
  var peopleConfig = getPeopleConfig();
  var rules = peopleConfig.generationRules || {};
  var reservedNames = getReservedExpeditionNames();
  var signatures = existingExpeditionProfileSignatures();
  var attempts = 40;
  while (attempts-- > 0) {
    var name = pickUniqueName(reservedNames);
    if (!name) return null;
    var backgroundId = weightedPick(peopleConfig.backgroundWeights || {}) || 'none';
    var traitIds = pickTraitIds(backgroundId);
    var profile = buildSurvivorProfile(backgroundId, traitIds);
    profile.name = name;
    var signature = getSurvivorProfileSignature(profile);
    if (rules.preventDuplicateExactProfile && signatures[signature]) continue;
    return profile;
  }
  return null;
}
function createStrandedSurvivor(feature) {
  var profile = generateExpeditionRescueProfile();
  if (!profile) return null;
  return {
    id: 'stranded_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
    name: profile.name,
    background: profile.background || 'none',
    traits: (profile.traits || []).slice(),
    passiveEffects: profile.passiveEffects || {},
    skills: clampSkillMap(profile.skills || cloneBaseSkills()),
    health: 26 + Math.random() * 34,
    fatigue: 72 + Math.random() * 18,
    morale: 30 + Math.random() * 20,
    featureSource: feature
  };
}
function maybeAssignHiddenSurvivor(expedition, tile, feature) {
  var cfg = getExpeditionConfig();
  expedition.hiddenSurvivorAssigned = expedition.hiddenSurvivorAssigned || { food: 0, water: 0 };
  var limit = ((cfg.hiddenSurvivorsByFeature || {})[feature]) || 0;
  if (!limit || (expedition.hiddenSurvivorAssigned[feature] || 0) >= limit || tile.strandedSurvivor) return false;
  var stranded = createStrandedSurvivor(feature);
  if (!stranded) return false;
  tile.strandedSurvivor = stranded;
  expedition.hiddenSurvivorAssigned[feature] = (expedition.hiddenSurvivorAssigned[feature] || 0) + 1;
  showArrivalCard(stranded);
  return true;
}
function getCurrentExpeditionTile() {
  var expedition = getExpedition();
  return getExpeditionTile(expedition, expedition.position.x, expedition.position.y);
}
function isVisitedExpeditionTile(expedition, x, y) {
  return !!((expedition.map || {}).visited || {})[tileKey(x, y)];
}
function buildVisitedExpeditionPath(expedition, targetX, targetY) {
  var startKey = tileKey(expedition.position.x, expedition.position.y);
  var targetKey = tileKey(targetX, targetY);
  if (startKey === targetKey) return [];
  if (!isVisitedExpeditionTile(expedition, targetX, targetY)) return null;
  var queue = [{ x: expedition.position.x, y: expedition.position.y }];
  var parents = {};
  parents[startKey] = null;
  var dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  while (queue.length) {
    var current = queue.shift();
    if (current.x === targetX && current.y === targetY) break;
    for (var i = 0; i < dirs.length; i++) {
      var nx = current.x + dirs[i][0];
      var ny = current.y + dirs[i][1];
      if (nx < 0 || nx >= expedition.map.width || ny < 0 || ny >= expedition.map.height) continue;
      var nextKey = tileKey(nx, ny);
      if (parents[nextKey] !== undefined || !isVisitedExpeditionTile(expedition, nx, ny)) continue;
      parents[nextKey] = { x: current.x, y: current.y };
      queue.push({ x: nx, y: ny });
    }
  }
  if (parents[targetKey] === undefined) return null;
  var path = [];
  var cursor = { x: targetX, y: targetY };
  while (cursor && !(cursor.x === expedition.position.x && cursor.y === expedition.position.y)) {
    path.push({ x: cursor.x, y: cursor.y });
    cursor = parents[tileKey(cursor.x, cursor.y)];
  }
  path.reverse();
  return path;
}
function showExpeditionAutowalkCard(explorer) {
  var texts = GAME_DATA.expeditionTexts || {};
  var explorerName = getSurvivorDisplayName(explorer) || 'Utforskaren';
  showStoryOverlay({
    eyebrow: getStoryLabel('arrivedEyebrow'),
    title: getOverlayLabel('expeditionReachedGoal'),
    subtitle: getOverlayLabel('autowalkDone'),
    portraitName: explorer ? explorer.name : null,
    text: texts.autowalk || '[explorer_name] når fram till den kända platsen efter en mödosam vandring genom djungeln.',
    replacements: {
      explorer_name: explorerName
    }
  });
}
function applyAutowalkTileResupply(expedition, survivor, tile) {
  if (!tile) return;
  if (tile.feature === 'food') {
    var forage = 0.35 + Math.random() * 0.45;
    expedition.supplies.food += forage;
    addExpeditionLog(survivor.name + ' fyller på provianten vid en känd matplats under autogången (+' + formatNumber(forage) + ' mat).');
    return;
  }
  if (tile.feature === 'water') {
    var refill = 0.6 + Math.random() * 0.8;
    expedition.supplies.water += refill;
    addExpeditionLog(survivor.name + ' fyller på vatten vid en känd källa under autogången (+' + formatNumber(refill) + ' vatten).');
  }
}
function getExpeditionCompanionFatigue(expedition) {
  return expedition.escorting ? (expedition.escorting.fatigue || 0) : 0;
}
function needsExpeditionAutoRest(expedition, survivor) {
  return (survivor.fatigue || 0) >= CONFIG.fatigueRestThreshold || getExpeditionCompanionFatigue(expedition) >= CONFIG.fatigueRestThreshold;
}
function applyExpeditionTravelFatigue(expedition, survivor, amount) {
  survivor.fatigue = clamp((survivor.fatigue || 0) + amount, 0, 100);
  if (expedition.escorting) expedition.escorting.fatigue = clamp((expedition.escorting.fatigue || 0) + amount, 0, 100);
}
function startExpeditionAutoWalk(targetX, targetY) {
  var expedition = getExpedition();
  var survivor = getExpeditionSurvivor();
  var survivorName = getSurvivorDisplayName(survivor);
  if (!expedition.active || !survivor || (expedition.returnTicksRemaining || 0) > 0) return false;
  if (!isVisitedExpeditionTile(expedition, targetX, targetY)) return false;
  var path = buildVisitedExpeditionPath(expedition, targetX, targetY);
  if (!path || !path.length) return false;
  expedition.pendingCommand = null;
  expedition.returnPath = [];
  expedition.autoWalkPath = path;
  addExpeditionLog(getExpeditionLogLabel('autoWalkStart', { name: survivorName, steps: path.length }));
  render();
  return true;
}
function getExpeditionTravelTicksToCamp(position) {
  var cfg = getExpeditionConfig();
  var dx = (position.x || 0) - cfg.camp.x;
  var dy = (position.y || 0) - cfg.camp.y;
  return Math.max(0, Math.ceil(Math.sqrt(dx * dx + dy * dy)));
}
function leaveStrandedSurvivorBehind(tile, expedition) {
  var cfg = getExpeditionConfig();
  if (!tile || !tile.strandedSurvivor || tile.strandedSurvivor.leftBehind) return false;
  var sharedFood = Math.min(expedition.supplies.food || 0, cfg.strandedShareFood || 1.2);
  var sharedWater = Math.min(expedition.supplies.water || 0, cfg.strandedShareWater || 1.2);
  expedition.supplies.food = Math.max(0, (expedition.supplies.food || 0) - sharedFood);
  expedition.supplies.water = Math.max(0, (expedition.supplies.water || 0) - sharedWater);
  tile.strandedSurvivor.leftBehind = true;
  tile.strandedSurvivor.sharedFood = sharedFood;
  tile.strandedSurvivor.sharedWater = sharedWater;
  tile.strandedSurvivor.returnRiskPending = true;
  addExpeditionLog(tile.strandedSurvivor.name + ' lämnas kvar. ' + formatNumber(sharedFood) + ' mat och ' + formatNumber(sharedWater) + ' vatten lämnas hos personen.');
  return true;
}
function resolveStrandedSurvivorReturnRisk(tile) {
  var cfg = getExpeditionConfig();
  if (!tile || !tile.strandedSurvivor || !tile.strandedSurvivor.returnRiskPending) return;
  tile.strandedSurvivor.returnRiskPending = false;
  if (Math.random() < (cfg.strandedDeathChanceOnReturn || 0.2)) {
    addExpeditionLog(tile.strandedSurvivor.name + ' hann inte överleva ensamheten i djungeln.');
    tile.strandedSurvivor = null;
    return;
  }
  tile.strandedSurvivor.leftBehind = false;
  addExpeditionLog(tile.strandedSurvivor.name + ' lever fortfarande och väntar kvar på hjälp.');
}
function rescueStrandedSurvivor() {
  var expedition = getExpedition();
  var tile = getCurrentExpeditionTile();
  var survivor = getExpeditionSurvivor();
  var cfg = getExpeditionConfig();
  if (!expedition.active || !survivor || !tile.strandedSurvivor) return;
  if (expedition.escorting) {
    addExpeditionLog(t('messages.expeditionAlreadyEscorting', null, 'You are already escorting a survivor back to camp.'));
    return;
  }
  if ((tile.strandedSurvivor.health || 0) < cfg.escortMinHealth) {
    addExpeditionLog(t('messages.expeditionTooWeak', { name: tile.strandedSurvivor.name }, tile.strandedSurvivor.name + ' is too weak to travel yet. Treat them first.'));
    return;
  }
  expedition.escorting = Object.assign({}, tile.strandedSurvivor);
  var rescuedName = tile.strandedSurvivor.name;
  tile.strandedSurvivor = null;
  expedition.pendingCommand = null;
  expedition.autoWalkPath = [];
  expedition.returnPath = buildVisitedExpeditionPath(expedition, cfg.camp.x, cfg.camp.y) || [];
  expedition.returnTicksRemaining = expedition.returnPath.length || getExpeditionTravelTicksToCamp(expedition.position);
  if (expedition.returnTicksRemaining <= 0) {
    addExpeditionLog(t('messages.expeditionJoinedAtCamp', { name: rescuedName }, rescuedName + ' joins the expedition and you are already back at camp.'));
    finishExpedition(t('messages.expeditionReturnWithSurvivor', { explorer: survivor.name, survivor: rescuedName }, survivor.name + ' returns to camp together with ' + rescuedName + '.'));
    return;
  }
  addExpeditionLog(t('messages.expeditionJoinedReturn', { name: rescuedName, ticks: expedition.returnTicksRemaining }, rescuedName + ' joins the expedition. A safe march back to camp begins now. ' + expedition.returnTicksRemaining + ' ticks remain.'));
  render();
}
function careForStrandedSurvivor() {
  var expedition = getExpedition();
  var tile = getCurrentExpeditionTile();
  if (!expedition.active || !tile.strandedSurvivor) return;
  expedition.pendingCommand = 'care_survivor';
  addExpeditionLog('Vård planerad för ' + tile.strandedSurvivor.name + ' till nästa tick.');
  render();
}
function bringEscortedSurvivorToCamp(expedition) {
  if (!expedition.escorting) return null;
  var escorted = expedition.escorting;
  var rescued = createSurvivor('rescued_' + Date.now() + '_' + Math.floor(Math.random() * 10000), escorted.name, false, escorted);
  rescued.health = clamp(escorted.health || 55, 1, 100);
  rescued.morale = clamp(escorted.morale || 45, 0, 100);
  rescued.hunger = 35;
  rescued.thirst = 35;
  rescued.fatigue = 92;
  gameState.survivors.push(rescued);
  expedition.escorting = null;
  return rescued;
}
function showExpeditionReturnCard(explorer, rescued, foundMapThisRun) {
  var texts = GAME_DATA.expeditionTexts || {};
  var explorerName = getSurvivorDisplayName(explorer) || 'Utforskaren';
  var withSurvivor = !!rescued;
  var withMap = !!foundMapThisRun;
  var key = withSurvivor ? (withMap ? 'survivorMap' : 'survivor') : (withMap ? 'map' : 'normal');
  var fallbackText = {
    survivor: '[explorer_name] och [survivor_name] välkomnas tillbaka till lägret. Gruppen delar mat, vatten och en liten fest i kvällselden.',
    survivorMap: '[explorer_name] återvänder med [survivor_name], och i packningen finns karta och kompass från cockpit. Lägret samlas i upphetsning runt fynden.',
    normal: '[explorer_name] återvänder ensam från expeditionen. Gruppen lyssnar spänt på berättelsen från djungeln.',
    map: '[explorer_name] återvänder med karta och kompass från cockpit. Gruppen samlas direkt för att förstå vad fyndet betyder.'
  };
  showStoryOverlay({
    eyebrow: withMap ? getStoryLabel('cockpitEyebrow') : getStoryLabel('expeditionEyebrow'),
    title: withMap ? getStoryLabel('breakthroughTitle') : getStoryLabel('expeditionReturnTitle'),
    subtitle: withSurvivor ? getStoryLabel('survivorReturnsWithExpedition') : getStoryLabel('campReceivesExpedition'),
    image: withMap ? 'resources/ui/map_success.png' : 'resources/ui/council.png',
    portraitName: (!withSurvivor && !withMap && explorer) ? explorer.name : null,
    text: texts[key] || fallbackText[key],
    replacements: {
      explorer_name: explorerName,
      survivor_name: rescued ? rescued.name : 'den räddade överlevaren'
    }
  });
}
function addExpeditionLog(text) {
  var expedition = getExpedition();
  expedition.log.unshift({ time: gameState.meta.day + 'd ' + formatTime(gameState.meta.dayMinutes), text: text });
  if (expedition.log.length > 30) expedition.log.pop();
}
function getExpeditionTileImage(tile, visited, options) {
  options = options || {};
  if (!visited) return '';
  if (!options.ignoreSurvivorMarker && tile.strandedSurvivor && tile.strandedSurvivor.leftBehind) return 'resources/map/survivor.png';
  if (tile.feature === 'camp') return 'resources/map/camp.png';
  if (tile.feature === 'food') return 'resources/map/djungle_food.png';
  if (tile.feature === 'water') return 'resources/map/djungle_water.png';
  if (tile.feature === 'wreckage') return 'resources/map/djungle_wreckage.png';
  if (tile.feature === 'temple') return 'resources/map/temple.png';
  if (tile.feature === 'lookout') return 'resources/map/lookout.png';
  if (tile.terrain === 'waterline') return 'resources/map/waterline.png';
  if (tile.terrain === 'forestline') return 'resources/map/forestline.png';
  return 'resources/map/djungel.png';
}
function getExpeditionSurvivor() {
  var expedition = getExpedition();
  return getAliveSurvivors().find(function(s) { return s.id === expedition.survivorId; }) || null;
}
function getExpeditionRequirementStatus() {
  var cfg = getExpeditionConfig();
  var missing = [];
  if (!isExpeditionUnlocked()) missing.push(t('expeditionRequirements.councilFirst'));
  if (getResourceTotalFood() < cfg.foodCost) missing.push(t('requirements.missingResource', { amount: formatNumber(cfg.foodCost - getResourceTotalFood()), resource: getResourceLabel('food') }));
  if ((gameState.resources.water || 0) < cfg.waterCost) missing.push(t('requirements.missingResource', { amount: formatNumber(cfg.waterCost - (gameState.resources.water || 0)), resource: getResourceLabel('water') }));
  if ((gameState.resources.glasses || 0) < 1) missing.push(t('requirements.requiresResource', { resource: getResourceLabel('glasses') }));
  if ((gameState.resources.spears || 0) - getCapacityToolUse('spears') < 1) missing.push(t('expeditionRequirements.freeSpear'));
  if ((gameState.resources.backpacks || 0) - getCapacityToolUse('backpacks') < 1) missing.push(t('expeditionRequirements.freeBackpack'));
  return { ok: missing.length === 0, missing: missing };
}
function startExpedition(survivorId) {
  var survivor = getAliveSurvivors().find(function(s) { return s.id === survivorId; });
  var survivorName = getSurvivorDisplayName(survivor);
  var expedition = getExpedition();
  var cfg = getExpeditionConfig();
  var status = getExpeditionRequirementStatus();
  if (expedition.active) return false;
  if (!survivor || survivor.state === 'rest' || survivor.state === 'away' || survivor.activeProjectId) {
    addLog('Välj en tillgänglig överlevare för expeditionen.', 'warning');
    return false;
  }
  if (!status.ok) {
    addLog(t('messages.expeditionCannotStart', { requirements: status.missing.join(', ') }, 'The expedition cannot start: ' + status.missing.join(', ') + '.'), 'warning');
    return false;
  }
  gameState.resources.food -= cfg.foodCost;
  gameState.resources.water -= cfg.waterCost;
  initializeExpeditionMap(expedition);
  expedition.active = true;
  expedition.unlocked = true;
  expedition.survivorId = survivor.id;
  expedition.position = { x: cfg.camp.x, y: cfg.camp.y };
  expedition.pendingCommand = null;
  expedition.autoWalkPath = [];
  expedition.returnPath = [];
  expedition.returnTicksRemaining = 0;
  expedition.restTicksRemaining = 0;
  expedition.supplies.food = cfg.foodCost;
  expedition.supplies.water = cfg.waterCost;
  expedition.equipment = { spear: true, backpack: true, glasses: true };
  expedition.gear = expedition.gear || { sword: false, shield: false };
  expedition.runFoundCockpit = false;
  survivor.assignedJob = 'expedition';
  survivor.state = 'expedition';
  addLog(survivorName + ' ger sig in i djungeln.', 'info');
  addExpeditionLog(getExpeditionLogLabel('leaveCamp', { name: survivorName }));
  return true;
}
function finishExpedition(reason) {
  var expedition = getExpedition();
  var survivor = getExpeditionSurvivor();
  var rescued = null;
  var foundMapThisRun = !!expedition.runFoundCockpit;
  if (!expedition.active) return;
  if (survivor) {
    survivor.assignedJob = 'philosophize';
    survivor.state = 'philosophize';
    survivor.fatigue = clamp(Math.max(survivor.fatigue || 0, 92), 0, 100);
  }
  rescued = bringEscortedSurvivorToCamp(expedition);
  gameState.resources.food += Math.max(0, expedition.supplies.food || 0);
  gameState.resources.water += Math.max(0, expedition.supplies.water || 0);
  expedition.active = false;
  expedition.pendingCommand = null;
  expedition.autoWalkPath = [];
  expedition.returnPath = [];
  expedition.returnTicksRemaining = 0;
  expedition.restTicksRemaining = 0;
  expedition.survivorId = null;
  expedition.runFoundCockpit = false;
  expedition.position = { x: getExpeditionConfig().camp.x, y: getExpeditionConfig().camp.y };
  addLog(reason || t('messages.expeditionReturn', null, 'The expedition returns to camp.'), 'success');
  addExpeditionLog(reason || t('messages.expeditionReturn', null, 'The expedition returns to camp.'));
  if (rescued) {
    addLog(t('messages.rescuedReturn', { name: rescued.name }, rescued.name + ' is brought safely back to camp from the jungle.'), 'success');
    addExpeditionLog(t('messages.rescuedAtCamp', { name: rescued.name }, rescued.name + ' is now in camp.'));
  }
  showExpeditionReturnCard(survivor, rescued, foundMapThisRun);
}
function queueExpeditionCommand(command) {
  var expedition = getExpedition();
  if (!expedition.active) return;
  var survivor = getExpeditionSurvivor();
  var movementCommands = { north: true, south: true, west: true, east: true };
  if (survivor && movementCommands[command] && (survivor.fatigue || 0) >= CONFIG.fatigueRestThreshold) {
    addExpeditionLog(survivor.name + ' är för utmattad för att fortsätta. Vila vid eld krävs.');
    return;
  }
  if ((expedition.returnTicksRemaining || 0) > 0) return;
  expedition.autoWalkPath = [];
  expedition.pendingCommand = command;
  addExpeditionLog(command === 'rest' ? getExpeditionLogLabel('restPlanned') : getExpeditionLogLabel('movementPlanned', { command: command }));
  render();
}
function revealNearestUnknownInDirection(expedition, dx, dy) {
  var x = expedition.position.x + dx;
  var y = expedition.position.y + dy;
  while (x >= 0 && x < expedition.map.width && y >= 0 && y < expedition.map.height) {
    var key = tileKey(x, y);
    if (!expedition.map.visited[key]) {
      expedition.map.visited[key] = true;
      getExpeditionTile(expedition, x, y);
      return true;
    }
    x += dx;
    y += dy;
  }
  return false;
}
function useLookout(expedition) {
  if (expedition.lookoutUsed && expedition.lookoutUsed[tileKey(expedition.position.x, expedition.position.y)]) {
    addExpeditionLog('Utkikspunkten har redan använts.');
    return;
  }
  expedition.lookoutUsed = expedition.lookoutUsed || {};
  expedition.lookoutUsed[tileKey(expedition.position.x, expedition.position.y)] = true;
  var revealed = 0;
  [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(function(dir) {
    var x = expedition.position.x + dir[0];
    var y = expedition.position.y + dir[1];
    if (x < 0 || x >= expedition.map.width || y < 0 || y >= expedition.map.height) return;
    var key = tileKey(x, y);
    if (!expedition.map.visited[key]) {
      expedition.map.visited[key] = true;
      var previousPosition = { x: expedition.position.x, y: expedition.position.y };
      expedition.position = { x: x, y: y };
      generateExpeditionTileContent(expedition, getExpeditionTile(expedition, x, y), getExpeditionSurvivor(), { silent: true });
      expedition.position = previousPosition;
      revealed += 1;
    }
  });
  addExpeditionLog('Från utkikspunkten syns hela närområdet bättre. ' + revealed + ' rutor avslöjas.');
}
function investigateTemple() {
  var expedition = getExpedition();
  var survivor = getExpeditionSurvivor();
  if (!expedition.active || !survivor) return;
  var tile = getExpeditionTile(expedition, expedition.position.x, expedition.position.y);
  if (tile.feature !== 'temple') return;
  if (tile.templeExplored) {
    addExpeditionLog('Templet är redan genomsökt.');
    return;
  }
  tile.templeExplored = true;
  var roll = Math.random();
  if (roll < 0.30) {
    var damage = (expedition.gear || {}).shield ? 0 : ((expedition.gear || {}).sword ? 2 : 8);
    survivor.health = clamp((survivor.health || 0) - damage, 0, 100);
    addExpeditionLog(damage > 0 ? 'Apor kastar sig fram ur templet. ' + survivor.name + ' skadas (' + formatNumber(damage) + ' hälsa).' : 'Apor anfaller, men skölden tar smällen.');
  } else if (roll < 0.52) {
    expedition.gear = expedition.gear || {};
    expedition.gear.sword = true;
    addExpeditionLog(survivor.name + ' hittar ett gammalt svärd bland stenarna. Det ger bättre skydd vid överfall.');
  } else if (roll < 0.72) {
    expedition.gear = expedition.gear || {};
    expedition.gear.shield = true;
    addExpeditionLog(survivor.name + ' hittar en gammal sköld. Den kan blockera överfall.');
  } else {
    var food = 0.6 + Math.random() * 0.8;
    expedition.supplies.food += food;
    addExpeditionLog('Templet innehåller torra frökapslar och ätliga rötter (+' + formatNumber(food) + ' mat).');
  }
  render();
}
function generateExpeditionTileContent(expedition, tile, survivor, options) {
  options = options || {};
  if (!tile || tile.eventResolved) return { generated: false, foundCockpit: false };
  var cfg = getExpeditionConfig();
  var isCockpit = expedition.cockpit && expedition.position.x === expedition.cockpit.x && expedition.position.y === expedition.cockpit.y;
  tile.eventResolved = true;
  if (isCockpit && Math.abs(expedition.position.x - cfg.camp.x) + Math.abs(expedition.position.y - cfg.camp.y) >= cfg.cockpitMinDistance) {
    addExpeditionFeature(expedition, tile, 'wreckage');
    expedition.foundCockpit = true;
    expedition.runFoundCockpit = true;
    if (!options.silent) {
      discover('cockpit', 'Cockpit hittas djupt inne i djungeln.');
      addExpeditionLog('Mellan träden ligger flygplansdelar. Cockpit är hittad.');
    }
    return { generated: true, foundCockpit: true };
  }
  var roll = Math.random();
  if (roll < 0.16 && addExpeditionFeature(expedition, tile, 'food')) {
    if (maybeAssignHiddenSurvivor(expedition, tile, 'food')) tile.strandedSurvivor.leftBehind = true;
    if (!options.silent) {
      var food = 0.8 + Math.random() * 0.8;
      expedition.supplies.food += food;
      addExpeditionLog(survivor.name + ' hittar en bra matplats med ätliga frukter (+' + formatNumber(food) + ' mat). Platsen går att återvända till.' + (tile.strandedSurvivor ? ' Någon gömmer sig här.' : ''));
    }
  } else if (roll < 0.30 && addExpeditionFeature(expedition, tile, 'water')) {
    if (maybeAssignHiddenSurvivor(expedition, tile, 'water')) tile.strandedSurvivor.leftBehind = true;
    if (!options.silent) {
      var water = 1.0 + Math.random() * 1.4;
      expedition.supplies.water += water;
      addExpeditionLog(survivor.name + ' hittar en liten vattenkälla (+' + formatNumber(water) + ' vatten). Platsen går att återvända till.' + (tile.strandedSurvivor ? ' En överlevare håller sig gömd här.' : ''));
    }
  } else if (roll < 0.38 && addExpeditionFeature(expedition, tile, 'lookout')) {
    if (!options.silent) {
      addExpeditionLog(survivor.name + ' hittar en hög utkikspunkt.');
      useLookout(expedition);
    }
  } else if (roll < 0.48 && addExpeditionFeature(expedition, tile, 'temple')) {
    if (!options.silent) addExpeditionLog(survivor.name + ' hittar ett övervuxet stentempel.');
  } else if (!options.silent && roll < 0.60) {
    var loss = (expedition.gear || {}).shield ? 0 : ((expedition.gear || {}).sword ? 2 : (expedition.equipment.spear ? 4 : 10));
    survivor.health = clamp((survivor.health || 0) - loss, 0, 100);
    addExpeditionLog(loss > 0 ? 'Något rör sig i undervegetationen. ' + survivor.name + ' skadas (' + formatNumber(loss) + ' hälsa).' : 'Något anfaller ur undervegetationen, men skölden stoppar överfallet.');
  } else if (!options.silent) {
    addExpeditionLog('Djungeln är tät och tyst. Inget särskilt händer.');
  }
  return { generated: true, foundCockpit: false };
}
function resolveExpeditionTileEvent(expedition, survivor, tile) {
  resolveStrandedSurvivorReturnRisk(tile);
  if (tile.feature === 'food') {
    var forage = 0.35 + Math.random() * 0.45;
    expedition.supplies.food += forage;
    addExpeditionLog(survivor.name + ' provianterar vid en känd matplats (+' + formatNumber(forage) + ' mat).');
    if (tile.strandedSurvivor) addExpeditionLog(tile.strandedSurvivor.name + ' gömmer sig i närheten och behöver hjälp för att kunna lämna platsen.');
    return;
  }
  if (tile.feature === 'water') {
    var refill = 0.6 + Math.random() * 0.8;
    expedition.supplies.water += refill;
    addExpeditionLog(survivor.name + ' fyller på vatten vid en känd källa (+' + formatNumber(refill) + ' vatten).');
    if (tile.strandedSurvivor) addExpeditionLog(tile.strandedSurvivor.name + ' finns kvar vid vattenhålet och väntar på eskort.');
    return;
  }
  if (tile.feature === 'lookout') {
    useLookout(expedition);
    return;
  }
  if (tile.feature === 'temple') {
    addExpeditionLog('Ett övervuxet stentempel reser sig mellan träden. Det kan undersökas från sidopanelen.');
    return;
  }
  generateExpeditionTileContent(expedition, tile, survivor, { silent: false });
}
function processExpeditionTick() {
  var expedition = getExpedition();
  if (!expedition.active) return;
  var survivor = getExpeditionSurvivor();
  var survivorName = getSurvivorDisplayName(survivor);
  if (!survivor || !survivor.alive) {
    expedition.active = false;
    addExpeditionLog(t('messages.expeditionCancelled', null, 'The expedition is cancelled.'));
    return;
  }
  var cfg = getExpeditionConfig();
  var supplyMultiplier = expedition.escorting ? (cfg.escortSupplyMultiplier || 1.7) : 1;
  expedition.supplies.food = Math.max(0, (expedition.supplies.food || 0) - cfg.foodPerTick * supplyMultiplier);
  expedition.supplies.water = Math.max(0, (expedition.supplies.water || 0) - cfg.waterPerTick * supplyMultiplier);
  if (expedition.supplies.food <= 0) survivor.hunger = clamp((survivor.hunger || 0) + 6, 0, 100);
  if (expedition.supplies.water <= 0) survivor.thirst = clamp((survivor.thirst || 0) + 8, 0, 100);
  if ((expedition.restTicksRemaining || 0) > 0) {
    expedition.restTicksRemaining = Math.max(0, expedition.restTicksRemaining - 1);
    survivor.fatigue = clamp((survivor.fatigue || 0) - perTick(CONFIG.rates.restFatigueRecoveryPerHourByFireLevel[2] || 18), 0, 100);
    if (expedition.escorting) expedition.escorting.fatigue = clamp((expedition.escorting.fatigue || 0) - perTick(CONFIG.rates.restFatigueRecoveryPerHourByFireLevel[2] || 18), 0, 100);
    survivor.morale = clamp((survivor.morale || 0) + perTick(CONFIG.rates.restMoralePerHourByFireLevel[2] || 0), 0, 100);
    if (expedition.restTicksRemaining <= 0) addExpeditionLog(getExpeditionLogLabel('restFinished', { name: survivorName }));
    return;
  }
  if ((expedition.returnTicksRemaining || 0) > 0) {
    if (needsExpeditionAutoRest(expedition, survivor)) {
      expedition.restTicksRemaining = Math.ceil(CONFIG.restDurationHours / tickFactor());
      addExpeditionLog((expedition.escorting && (expedition.escorting.fatigue || 0) >= CONFIG.fatigueRestThreshold ? expedition.escorting.name : survivor.name) + ' är utmattad under återtåget och gruppen stannar för att vila vid eld.');
      return;
    }
    expedition.returnTicksRemaining = Math.max(0, expedition.returnTicksRemaining - 1);
    applyExpeditionTravelFatigue(expedition, survivor, cfg.returnFatiguePerTick || 2.5);
    if ((expedition.returnPath || []).length > 0) {
      var returnStep = expedition.returnPath.shift();
      expedition.position = { x: returnStep.x, y: returnStep.y };
      applyAutowalkTileResupply(expedition, survivor, getExpeditionTile(expedition, returnStep.x, returnStep.y));
    }
    if (expedition.returnTicksRemaining <= 0) {
      expedition.position = { x: cfg.camp.x, y: cfg.camp.y };
      finishExpedition(getExpeditionLogLabel('safeReturnFinished', { name: survivorName }));
    }
    return;
  }
  if ((expedition.autoWalkPath || []).length > 0) {
    if (needsExpeditionAutoRest(expedition, survivor)) {
      expedition.restTicksRemaining = Math.ceil(CONFIG.restDurationHours / tickFactor());
      addExpeditionLog((expedition.escorting && (expedition.escorting.fatigue || 0) >= CONFIG.fatigueRestThreshold ? expedition.escorting.name : survivor.name) + ' är utmattad under autogång och gruppen stannar för att vila vid eld.');
      return;
    }
    var nextStep = expedition.autoWalkPath.shift();
    applyExpeditionTravelFatigue(expedition, survivor, 4);
    expedition.position = { x: nextStep.x, y: nextStep.y };
    applyAutowalkTileResupply(expedition, survivor, getExpeditionTile(expedition, nextStep.x, nextStep.y));
    if ((expedition.autoWalkPath || []).length <= 0) {
      addExpeditionLog(getExpeditionLogLabel('autoWalkArrived', { name: survivorName }));
      showExpeditionAutowalkCard(survivor);
    }
    return;
  }
  var command = expedition.pendingCommand;
  expedition.pendingCommand = null;
  if (command === 'return') {
    var tileBeforeReturn = getCurrentExpeditionTile();
    if (tileBeforeReturn && tileBeforeReturn.strandedSurvivor && !expedition.escorting) leaveStrandedSurvivorBehind(tileBeforeReturn, expedition);
    expedition.returnPath = buildVisitedExpeditionPath(expedition, cfg.camp.x, cfg.camp.y) || [];
    expedition.returnTicksRemaining = expedition.returnPath.length || getExpeditionTravelTicksToCamp(expedition.position);
    if (expedition.returnTicksRemaining <= 0) {
      finishExpedition(getExpeditionLogLabel('immediateReturn', { name: survivorName }));
    } else {
      addExpeditionLog(t('messages.expeditionSafeMarch', { name: survivorName, ticks: expedition.returnTicksRemaining }, survivorName + ' begins a safe march back to camp. ' + expedition.returnTicksRemaining + ' ticks remain.'));
    }
    return;
  }
  if (command === 'rest') {
    expedition.restTicksRemaining = Math.ceil(CONFIG.restDurationHours / tickFactor());
    addExpeditionLog(survivor.name + ' tänder en liten eld och vilar i ' + CONFIG.restDurationHours + ' timmar.');
    return;
  }
  if (command === 'care_survivor') {
    var currentTile = getCurrentExpeditionTile();
    if (!currentTile.strandedSurvivor) {
      addExpeditionLog('Det finns ingen skadad överlevare här att vårda.');
      return;
    }
    currentTile.strandedSurvivor.health = clamp((currentTile.strandedSurvivor.health || 0) + (cfg.rescueCarePerTick || 7), 0, 100);
    survivor.fatigue = clamp((survivor.fatigue || 0) + 2, 0, 100);
    addExpeditionLog(survivor.name + ' vårdar ' + currentTile.strandedSurvivor.name + '. Hälsan är nu ' + formatNumber(currentTile.strandedSurvivor.health) + '.');
    return;
  }
  var moves = { north: { x: 0, y: -1 }, south: { x: 0, y: 1 }, west: { x: -1, y: 0 }, east: { x: 1, y: 0 } };
  if (moves[command]) {
    if ((survivor.fatigue || 0) >= CONFIG.fatigueRestThreshold) {
      addExpeditionLog(survivor.name + ' är för utmattad för att gå vidare och måste vila.');
      return;
    }
    var tileBeforeMove = getCurrentExpeditionTile();
    if (tileBeforeMove && tileBeforeMove.strandedSurvivor && !expedition.escorting) leaveStrandedSurvivorBehind(tileBeforeMove, expedition);
    survivor.fatigue = clamp((survivor.fatigue || 0) + 4, 0, 100);
    var nextX = clamp(expedition.position.x + moves[command].x, 0, expedition.map.width - 1);
    var nextY = clamp(expedition.position.y + moves[command].y, 0, expedition.map.height - 1);
    expedition.position = { x: nextX, y: nextY };
    expedition.map.visited[tileKey(nextX, nextY)] = true;
    var tile = getExpeditionTile(expedition, nextX, nextY);
    resolveExpeditionTileEvent(expedition, survivor, tile);
  }
}
function getExistingSurvivorNames() {
  return (gameState.survivors || []).map(function(s) { return s.name; });
}
function pickUniqueName(extraUsed) {
  var peopleConfig = getPeopleConfig();
  var names = (peopleConfig.newcomerNames || []).slice();
  var rules = peopleConfig.generationRules || {};
  if (!rules.preventDuplicateNames) return names.length ? names[Math.floor(Math.random() * names.length)] : null;
  var used = Object.assign({}, extraUsed || {});
  getExistingSurvivorNames().forEach(function(name) { used[name] = true; });
  var available = names.filter(function(name) { return !used[name]; });
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}
function weightedPick(weightMap) {
  var keys = Object.keys(weightMap || {}).filter(function(key) { return (weightMap[key] || 0) > 0; });
  if (!keys.length) return null;
  var total = 0;
  keys.forEach(function(key) { total += weightMap[key]; });
  var roll = Math.random() * total;
  var running = 0;
  for (var i = 0; i < keys.length; i++) {
    running += weightMap[keys[i]];
    if (roll < running) return keys[i];
  }
  return keys[0];
}
function pickRandomFromPool(ids, excluded) {
  var blocked = excluded || {};
  var available = (ids || []).filter(function(id) { return !blocked[id]; });
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}
function applyStudentBonus(skills) {
  var keys = ['explore', 'craft', 'food', 'water', 'wood', 'care'];
  var chosen = keys[Math.floor(Math.random() * keys.length)];
  skills[chosen] = (skills[chosen] || 0) + 1;
}
function buildSurvivorProfile(backgroundId, traitIds) {
  var peopleConfig = getPeopleConfig();
  var backgrounds = peopleConfig.backgrounds || {};
  var traits = peopleConfig.traits || {};
  var background = backgrounds[backgroundId] || backgrounds.none || { id: 'none', name: 'Vanlig person', bonuses: {}, penalties: {} };
  var skills = cloneBaseSkills();
  mergeSkillModifiers(skills, background.bonuses);
  mergeSkillModifiers(skills, background.penalties);
  (traitIds || []).forEach(function(traitId) {
    var trait = traits[traitId];
    if (!trait) return;
    mergeSkillModifiers(skills, trait.bonuses);
    mergeSkillModifiers(skills, trait.penalties);
  });
  if (background.id === 'student') applyStudentBonus(skills);
  clampSkillMap(skills);
  return {
    background: background.id || 'none',
    traits: (traitIds || []).slice(),
    skills: skills,
    passiveEffects: buildPassiveEffects([(background || {}).passiveEffect].concat((traitIds || []).map(function(id) {
      return traits[id] ? traits[id].passiveEffect : null;
    })))
  };
}
function getSurvivorProfileSignature(profile) {
  var traitIds = (profile.traits || []).slice().sort();
  return (profile.background || 'none') + '|' + traitIds.join(',');
}
function existingProfileSignatures() {
  var map = {};
  (gameState.survivors || []).forEach(function(s) {
    map[getSurvivorProfileSignature({ background: s.background || 'none', traits: s.traits || [] })] = true;
  });
  return map;
}
function pickTraitIds(backgroundId) {
  var peopleConfig = getPeopleConfig();
  var rules = peopleConfig.generationRules || {};
  var pools = peopleConfig.traitPools || {};
  var min = rules.traitsPerSurvivorMin !== undefined ? rules.traitsPerSurvivorMin : 1;
  var max = rules.traitsPerSurvivorMax !== undefined ? rules.traitsPerSurvivorMax : 2;
  var target = min + Math.floor(Math.random() * (Math.max(min, max) - min + 1));
  if (backgroundId === 'none') target += rules.noneBackgroundExtraTraits || 0;
  var picked = [];
  var blocked = {};
  while (picked.length < target) {
    var wantNegative = picked.length > 0 && Math.random() < (rules.negativeTraitChance || 0);
    var pool = wantNegative ? pools.negative : pools.positive;
    if (!pool || !pool.length) pool = pools.positive || pools.negative || [];
    if (!pool.length) break;
    var id = pickRandomFromPool(pool, blocked);
    if (!id) {
      var fallback = pickRandomFromPool((pools.positive || []).concat(pools.negative || []), blocked);
      if (!fallback) break;
      id = fallback;
    }
    blocked[id] = true;
    picked.push(id);
  }
  return picked;
}
function generateNewcomerProfile() {
  var peopleConfig = getPeopleConfig();
  var rules = peopleConfig.generationRules || {};
  var signatures = existingProfileSignatures();
  var attempts = 40;
  while (attempts-- > 0) {
    var name = pickUniqueName();
    if (!name) return null;
    var backgroundId = weightedPick(peopleConfig.backgroundWeights || {}) || 'none';
    var traitIds = pickTraitIds(backgroundId);
    var profile = buildSurvivorProfile(backgroundId, traitIds);
    profile.name = name;
    var signature = getSurvivorProfileSignature(profile);
    if (rules.preventDuplicateExactProfile && signatures[signature]) continue;
    return profile;
  }
  return null;
}
function syncFireLevelFromWood() {
  var wood = gameState.camp.fireWood || 0;
  var prev = gameState.camp.fireLevel || 0;
  var next = 0;
  if (wood > 0) next = 1;
  if (wood >= 1.5) next = 2;
  if (wood >= 2.5) next = 3;
  if (wood >= 3.5) next = 4;
  gameState.camp.fireLevel = next;
  return { previous: prev, current: next };
}
function isNight() { var h=Math.floor((gameState.meta.dayMinutes || 0)/60); return h < 6 || h >= 20; }
function getStateProfile(stateName) { return CONFIG.stateProfiles[stateName] || CONFIG.stateProfiles.work; }
function getHealthEfficiency(survivor) {
  if (survivor.health >= 75) return 1;
  if (survivor.health >= 50) return 0.85;
  if (survivor.health >= 25) return 0.6;
  return 0.35;
}
function getCareTarget() {
  var alive = getAliveSurvivors().filter(function(s){ return s.health < 85; });
  if (!alive.length) return null;
  alive.sort(function(a,b){ return a.health - b.health; });
  return alive[0];
}
function getResourceTotalFood() { return (gameState.resources.food || 0); }
function getHutCapacity() {
  return Math.floor((gameState.resources.huts || 0) * (getShelterBalanceConfig().capacityPerHut || 4));
}
function getShelterCoverage() {
  var aliveCount = getAliveSurvivors().length;
  if (!aliveCount) return 0;
  return clamp(getHutCapacity() / aliveCount, 0, 1);
}
function getShelterSummary() {
  var aliveCount = getAliveSurvivors().length;
  var capacity = getHutCapacity();
  var coverage = getShelterCoverage();
  return {
    capacity: capacity,
    aliveCount: aliveCount,
    covered: Math.min(capacity, aliveCount),
    uncovered: Math.max(0, aliveCount - capacity),
    coverage: coverage,
    coveragePercent: Math.round(coverage * 100)
  };
}
function getCampPassiveEffects() {
  var totals = {};
  getAliveSurvivors().forEach(function(survivor) {
    var effects = survivor.passiveEffects || {};
    Object.keys(effects).forEach(function(key) {
      totals[key] = (totals[key] || 0) + effects[key];
    });
  });
  return totals;
}
function getConflictBalanceConfig() {
  return CONFIG.conflictBalance || {};
}
function getNeedPressure() {
  var alive = getAliveSurvivors();
  if (!alive.length) return 0;
  var total = 0;
  alive.forEach(function(s) {
    total += Math.max(s.hunger || 0, s.thirst || 0);
  });
  return clamp(total / alive.length, 0, 100);
}
function getFatiguePressure() {
  var alive = getAliveSurvivors();
  if (!alive.length) return 0;
  var total = 0;
  alive.forEach(function(s) { total += s.fatigue || 0; });
  return clamp(total / alive.length, 0, 100);
}
function getLowMoralePressure() {
  var alive = getAliveSurvivors();
  if (!alive.length) return 0;
  var total = 0;
  alive.forEach(function(s) {
    total += clamp((45 - (s.morale || 0)) / 45 * 100, 0, 100);
  });
  return clamp(total / alive.length, 0, 100);
}
function getCampStabilitySummary() {
  var cfg = getConflictBalanceConfig();
  var aliveCount = Math.max(1, getAliveSurvivors().length);
  var passiveEffects = getCampPassiveEffects();
  var foodCoverage = clamp((getResourceTotalFood() || 0) / (aliveCount * (cfg.foodSafetyPerPerson || 1.2)), 0, 1);
  var waterCoverage = clamp((gameState.resources.water || 0) / (aliveCount * (cfg.waterSafetyPerPerson || 1.2)), 0, 1);
  var shelterCoverage = getShelterCoverage();
  var fireProtection = getFireLevel() * (cfg.fireProtectionPerLevel || 0);
  var careProtection = getTotalJobPerformance('care') * (cfg.careProtectionPerFactor || 0);
  var guardProtection = getTotalJobPerformance('guard') * (cfg.guardProtectionPerFactor || 0);
  var moralePressure = clamp(100 - (gameState.camp.morale || 50), 0, 100);
  var lowMoralePressure = getLowMoralePressure();
  var needPressure = getNeedPressure();
  var fatiguePressure = getFatiguePressure();
  var threatPressure = clamp(gameState.world.threat || 0, 0, 100);
  var raw =
    moralePressure * (cfg.moralePressureWeight || 0.45) +
    lowMoralePressure * (cfg.personalLowMoraleWeight || 0.22) +
    needPressure * (cfg.unmetNeedsWeight || 0.18) +
    fatiguePressure * (cfg.fatiguePressureWeight || 0.08) +
    threatPressure * (cfg.threatWeight || 0.07);
  var protection =
    foodCoverage * (cfg.foodProtection || 0) +
    waterCoverage * (cfg.waterProtection || 0) +
    shelterCoverage * (cfg.shelterProtection || 0) +
    fireProtection +
    careProtection +
    guardProtection -
    ((passiveEffects.conflictRisk || 0) * 100) +
    ((passiveEffects.conflictRiskReduction || 0) * 100);
  var risk = clamp(raw - protection, 0, 100);
  return {
    risk: risk,
    chance: clamp((cfg.baseChancePerTick || 0) + risk * (cfg.chancePerRiskPoint || 0), 0, 0.2),
    moralePressure: moralePressure,
    lowMoralePressure: lowMoralePressure,
    needPressure: needPressure,
    fatiguePressure: fatiguePressure,
    foodCoverage: foodCoverage,
    waterCoverage: waterCoverage,
    shelterCoverage: shelterCoverage,
    fireProtection: fireProtection,
    careProtection: careProtection,
    guardProtection: guardProtection,
    traitModifier: ((passiveEffects.conflictRisk || 0) - (passiveEffects.conflictRiskReduction || 0)) * 100
  };
}

function hasResources(costs) {
  costs = costs || {};
  for (var key in costs) {
    if ((gameState.resources[key] || 0) < costs[key]) return false;
  }
  return true;
}
function consumeResourceCosts(costs) {
  costs = costs || {};
  for (var key in costs) {
    gameState.resources[key] = Math.max(0, (gameState.resources[key] || 0) - costs[key]);
  }
}
function applyRecipeYields(yields) {
  yields = yields || {};
  for (var key in yields) {
    if (key.indexOf('raft_') === 0) {
      gameState.raft = gameState.raft || {};
      gameState.raft[key] = (gameState.raft[key] || 0) + yields[key];
    } else {
      gameState.resources[key] = (gameState.resources[key] || 0) + yields[key];
    }
  }
}
function getProjects() {
  if (!gameState.camp.projects) gameState.camp.projects = [];
  return gameState.camp.projects;
}
function getProjectsByWorkspace(workspace) {
  return getProjects().filter(function(project) {
    var recipe = CONFIG.recipes[project.recipeId] || {};
    return (recipe.workspace || 'camp') === (workspace || 'camp');
  });
}
function getProject(projectId) {
  return getProjects().find(function(project) { return project.id === projectId; }) || null;
}
function getProjectWorker(projectId) {
  return getAliveSurvivors().find(function(survivor) { return survivor.activeProjectId === projectId; }) || null;
}
function getRecipeCostText(recipe) {
  var costs = recipe.costs || {};
  var parts = [];
  Object.keys(costs).forEach(function(key) { parts.push(formatNumber(costs[key]) + ' ' + getResourceLabel(key)); });
  return parts.length ? parts.join(', ') : (getLanguage() === 'se' ? 'Inga resurser' : 'No resources');
}
function getRecipeRequirements(recipe) {
  var requirements = Object.assign({}, recipe.requirements || {});
  requirements.resources = Object.assign({}, requirements.resources || {}, recipe.costs || {});
  if (recipe.requiresFire && getFireLevel() < recipe.requiresFire) {
    requirements.custom = (requirements.custom || []).concat([t('messages.requiresFireLevel', { level: recipe.requiresFire }, 'Requires fire level ' + recipe.requiresFire)]);
  }
  if ((recipe.workspace || 'camp') === 'raft' && !((gameState.world || {}).raftUnlocked)) {
    requirements.custom = (requirements.custom || []).concat([t('messages.requiresPhase3Council', null, 'Requires the phase 3 council')]);
  }
  return requirements;
}
function getRecipeRequirementStatus(recipe) {
  var requirements = getRecipeRequirements(recipe);
  var status = getRequirementStatus(requirements);
  (requirements.custom || []).forEach(function(text) { status.missing.push(text); });
  status.ok = status.missing.length === 0;
  return status;
}
function canCraftRecipe(recipeId) {
  var recipe = CONFIG.recipes[recipeId];
  if (!recipe) return false;
  return getRecipeRequirementStatus(recipe).ok;
}
function startProject(recipeId) {
  var recipe = CONFIG.recipes[recipeId];
  if (!recipe) return false;
  var requirementStatus = getRecipeRequirementStatus(recipe);
  if (!requirementStatus.ok) {
    addLog(t('messages.projectCannotStart', { project: lowerFirst(getRecipeName(recipeId)), requirements: requirementStatus.missing.join(', ') }), 'warning');
    return false;
  }
  consumeResourceCosts(recipe.costs);
  getProjects().push({
    id: 'project_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    recipeId: recipeId,
    name: getRecipeName(recipeId),
    workspace: recipe.workspace || 'camp',
    progressHours: 0,
    requiredHours: recipe.timeHours,
    assignedSurvivorId: null,
    status: 'paused'
  });
  addLog(t('messages.projectStarted', { project: lowerFirst(getRecipeName(recipeId)) }), 'info');
  return true;
}
function pauseActiveProject(survivor, remember) {
  if (!survivor || !survivor.activeProjectId) return;
  var project = getProject(survivor.activeProjectId);
  if (project) {
    project.assignedSurvivorId = null;
    project.status = 'paused';
  }
  if (remember) survivor.resumeProjectId = survivor.activeProjectId;
  survivor.activeProjectId = null;
}
function assignProject(projectId, survivorId) {
  var project = getProject(projectId);
  var survivor = getAliveSurvivors().find(function(s) { return s.id === survivorId; });
  if (!project || !survivor || project.status === 'done') return false;
  var currentWorker = getProjectWorker(projectId);
  if (currentWorker && currentWorker.id !== survivor.id) pauseActiveProject(currentWorker, false);
  pauseActiveProject(survivor, false);
  project.assignedSurvivorId = survivor.id;
  project.status = 'active';
  survivor.assignedJob = 'craft';
  survivor.state = 'work';
  survivor.activeTask = null;
  survivor.activeProjectId = project.id;
  survivor.restTicksRemaining = 0;
  addLog(t('messages.projectAssigned', { name: survivor.name, project: lowerFirst(project.name) }), 'info');
  return true;
}
function finishProject(project, survivor) {
  var recipe = CONFIG.recipes[project.recipeId];
  if (!recipe) return;
  applyRecipeYields(recipe.yields);
  project.status = 'done';
  project.assignedSurvivorId = null;
  if (survivor) {
    survivor.activeProjectId = null;
    survivor.resumeProjectId = null;
    survivor.assignedJob = 'philosophize';
    survivor.state = 'philosophize';
  }
  gameState.camp.projects = getProjects().filter(function(item) { return item.id !== project.id; });
  addLog(t('messages.projectFinished', { name: survivor ? survivor.name : t('common.camp'), project: lowerFirst(getRecipeName(project.recipeId)) }), 'success');
}
function workOnProject(survivor) {
  var project = getProject(survivor.activeProjectId);
  if (!project) {
    survivor.activeProjectId = null;
    survivor.assignedJob = 'philosophize';
    survivor.state = 'philosophize';
    return;
  }
  var efficiency = getJobPerformanceFactor(survivor, 'craft');
  project.progressHours = Math.min(project.requiredHours, (project.progressHours || 0) + perTick(efficiency));
  project.assignedSurvivorId = survivor.id;
  project.status = 'active';
  if (project.progressHours >= project.requiredHours) finishProject(project, survivor);
}
function tryResumeProjectAfterRest(survivor) {
  if (!survivor.resumeProjectId) return false;
  var project = getProject(survivor.resumeProjectId);
  if (!project || getProjectWorker(project.id)) {
    survivor.resumeProjectId = null;
    return false;
  }
  return assignProject(project.id, survivor.id);
}
function getAvailableProjectWorkers() {
  return getAliveSurvivors().filter(function(survivor) {
    return survivor.state !== 'rest' && survivor.state !== 'away' && survivor.state !== 'expedition' && survivor.assignedJob !== 'care';
  });
}
function projectProgressPercent(project) {
  if (!project.requiredHours) return 0;
  return clamp((project.progressHours || 0) / project.requiredHours * 100, 0, 100);
}
function getRaftSummary() {
  gameState.raft = gameState.raft || { raft_logs: 0, raft_sail: 0, raft_rig: 0, raft_hut: 0 };
  var aliveCount = getAliveSurvivors().length;
  var cfg = getRaftBalanceConfig();
  var requiredLogs = Math.max(1, aliveCount);
  var requiredSail = Math.max(1, aliveCount);
  var requiredFood = aliveCount * (cfg.travelDays || 30) * (cfg.dailyFoodPerPerson || 1);
  var requiredWater = aliveCount * (cfg.travelDays || 30) * (cfg.dailyWaterPerPerson || 1);
  var requiredPots = cfg.minPots || 30;
  var logsRatio = clamp((gameState.raft.raft_logs || 0) / requiredLogs, 0, 1);
  var sailRatio = clamp((gameState.raft.raft_sail || 0) / requiredSail, 0, 1);
  var rigRatio = clamp((gameState.raft.raft_rig || 0), 0, 1);
  var hutRatio = clamp((gameState.raft.raft_hut || 0), 0, 1);
  var foodRatio = clamp((gameState.resources.food || 0) / requiredFood, 0, 1);
  var waterRatio = clamp((gameState.resources.water || 0) / requiredWater, 0, 1);
  var potsRatio = clamp((gameState.resources.pots || 0) / requiredPots, 0, 1);
  var percent = ((logsRatio + sailRatio + rigRatio + hutRatio + foodRatio + waterRatio + potsRatio) / 7) * 100;
  return {
    aliveCount: aliveCount,
    requiredLogs: requiredLogs,
    requiredSail: requiredSail,
    requiredFood: requiredFood,
    requiredWater: requiredWater,
    requiredPots: requiredPots,
    currentLogs: gameState.raft.raft_logs || 0,
    currentSail: gameState.raft.raft_sail || 0,
    currentRig: gameState.raft.raft_rig || 0,
    currentHut: gameState.raft.raft_hut || 0,
    currentFood: gameState.resources.food || 0,
    currentWater: gameState.resources.water || 0,
    currentPots: gameState.resources.pots || 0,
    percent: percent,
    ready: logsRatio >= 1 && sailRatio >= 1 && rigRatio >= 1 && hutRatio >= 1 && foodRatio >= 1 && waterRatio >= 1 && potsRatio >= 1
  };
}
function startVoyage() {
  var summary = getRaftSummary();
  var expedition = getExpedition();
  if (!((gameState.world || {}).departureReady)) {
    addLog(t('messages.raftNotReady'), 'warning');
    return false;
  }
  if (!summary.ready) {
    addLog(t('messages.raftNoLongerReady'), 'warning');
    return false;
  }
  if (expedition.active) {
    addLog(t('messages.expeditionMustReturn'), 'warning');
    return false;
  }
  var voyage = getVoyageState();
  voyage.active = true;
  voyage.completed = false;
  voyage.passengerCount = getAliveSurvivors().length;
  voyage.daysElapsed = 0;
  voyage.totalDays = getRaftBalanceConfig().travelDays || 30;
  voyage.foodLostOverboard = 0;
  voyage.articleStage = 0;
  getAliveSurvivors().forEach(function(survivor) {
    survivor.assignedJob = 'philosophize';
    survivor.state = 'philosophize';
    survivor.activeTask = null;
    survivor.activeProjectId = null;
    survivor.resumeProjectId = null;
  });
  if (gameState.camp) {
    gameState.camp.fireWood = 0;
    gameState.camp.fireLevel = 0;
  }
  gameState.world.phase = 'sailing';
  currentView = 'sail';
  addLog(t('messages.raftDeparture'), 'success');
  render();
  return true;
}
function processVoyageTick() {
  var voyage = getVoyageState();
  if (!voyage.active) return;
  var cfg = getRaftBalanceConfig();
  var foodNeed = (cfg.dailyFoodPerPerson || 1) * (voyage.passengerCount || getAliveSurvivors().length || 1);
  var waterNeed = (cfg.dailyWaterPerPerson || 1) * (voyage.passengerCount || getAliveSurvivors().length || 1);
  gameState.resources.food = Math.max(0, (gameState.resources.food || 0) - foodNeed);
  gameState.resources.water = Math.max(0, (gameState.resources.water || 0) - waterNeed);
  voyage.daysElapsed += 1;
  if (Math.random() < 0.16) {
    var extraLoss = Math.min(gameState.resources.food || 0, 1 + Math.random() * 2);
    if (extraLoss > 0.05) {
      gameState.resources.food = Math.max(0, (gameState.resources.food || 0) - extraLoss);
      voyage.foodLostOverboard += extraLoss;
      addLog(Math.random() < 0.5 ? 'En våg slår över flotten och en del mat försvinner i havet.' : 'En råtta visar sig ha tagit sig ombord och gnagt på matförrådet.', 'warning');
    }
  }
  addLog('Dag ' + voyage.daysElapsed + ' till havs. Förråden minskar medan flotten driver vidare.', 'info');
  if (voyage.daysElapsed >= (voyage.totalDays || 30)) {
    voyage.active = false;
    voyage.completed = true;
    gameState.world.phase = 'rescued';
    currentView = 'sail';
    addLog(t('messages.landSighted'), 'success');
    showVoyageArrivalArticles();
  }
}
function renderAsset(src, className, fallback) {
  return '<img class="' + className + '" src="' + src + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'' + className + ' village-placeholder\',innerHTML:\'' + fallback + '\'}))">';
}
function getVillageEffectSummary() {
  var shelter = getShelterSummary();
  var shelterCfg = getShelterBalanceConfig();
  var fireLevel = getFireLevel();
  var rates = CONFIG.rates || {};
  var fireFatigue = (rates.restFatigueRecoveryPerHourByFireLevel || {})[fireLevel] || 0;
  var fireHealth = (rates.restHealthRecoveryPerHourByFireLevel || {})[fireLevel] || 0;
  var fireMorale = (rates.restMoralePerHourByFireLevel || {})[fireLevel] || 0;
  var shelterHealth = (shelterCfg.restHealthBonusPerCoverage || 0) * shelter.coverage;
  var shelterFatigue = (shelterCfg.restFatigueBonusPerCoverage || 0) * shelter.coverage;
  var shelterMorale = (shelterCfg.restMoraleBonusPerCoverage || 0) * shelter.coverage;
  var passiveEffects = getCampPassiveEffects();
  var stability = getCampStabilitySummary();
  var eventPressure = getPopulationEventMultiplier((GAME_DATA.events || {}).animalAttack || {});
  var shelterCampMorale = (shelterCfg.passiveMoraleBonusPerCoverage || 0) * shelter.coverage;
  var traitMorale = (passiveEffects.moraleBonus || 0) + (passiveEffects.groupMorale || 0);
  var coldRisk = fireLevel <= 0 && isNight();
  return [
    { label: getVillageMetricLabel('fireLevel'), value: fireLevel + '/4' },
    { label: getVillageMetricLabel('shelteredPeople'), value: shelter.covered + '/' + shelter.aliveCount },
    { label: getVillageMetricLabel('stormFoodProtection'), value: shelter.coveragePercent + '%' },
    { label: getVillageMetricLabel('restHealthTotal'), value: signedNumber(fireHealth + shelterHealth) + '/h' },
    { label: getVillageMetricLabel('restFatigueTotal'), value: '+' + formatNumber(fireFatigue + shelterFatigue) + '/h' },
    { label: getVillageMetricLabel('restMoraleTotal'), value: signedNumber(fireMorale + shelterMorale) + '/h' },
    { label: getVillageMetricLabel('fromFire'), value: t('common.healthShort') + ' ' + signedNumber(fireHealth) + ' / ' + t('common.fatigueShort') + ' +' + formatNumber(fireFatigue) + ' / ' + t('common.moraleShort') + ' ' + signedNumber(fireMorale) },
    { label: getVillageMetricLabel('fromHuts'), value: t('common.healthShort') + ' ' + signedNumber(shelterHealth) + ' / ' + t('common.fatigueShort') + ' +' + formatNumber(shelterFatigue) + ' / ' + t('common.moraleShort') + ' ' + signedNumber(shelterMorale) },
    { label: getVillageMetricLabel('passiveCampMorale'), value: signedNumber(shelterCampMorale + traitMorale) },
    { label: getVillageMetricLabel('fromPeople'), value: signedNumber(traitMorale) },
    { label: getVillageMetricLabel('conflictRisk'), value: formatNumber(stability.risk) + '%' },
    { label: getVillageMetricLabel('groupPressure'), value: formatNumber(eventPressure) + 'x' },
    { label: getVillageMetricLabel('conflictProtection'), value: localizeNameMap('resources', 'food') + ' ' + Math.round(stability.foodCoverage * 100) + '% / ' + localizeNameMap('resources', 'water') + ' ' + Math.round(stability.waterCoverage * 100) + '% / ' + localizeNameMap('resources', 'huts') + ' ' + Math.round(stability.shelterCoverage * 100) + '%' },
    { label: getVillageMetricLabel('personalityConflict'), value: signedNumber(stability.traitModifier) + '%' },
    { label: getVillageMetricLabel('nightRiskNoFire'), value: coldRisk ? getVillageMetricLabel('active') : getVillageMetricLabel('none') }
  ];
}

function normalizeResourceInventory() {
  if (!gameState.resources) return;
  Object.keys(gameState.resources).forEach(function(key) {
    var value = gameState.resources[key];
    if (typeof value !== 'number' || !isFinite(value)) gameState.resources[key] = 0;
    else gameState.resources[key] = Math.max(0, value);
  });
  if (!gameState.camp) return;
  gameState.camp.fireWood = clamp(gameState.camp.fireWood || 0, 0, CONFIG.fireMaxWood);
  syncFireLevelFromWood();
}

function addLog(text, level) {
  level = level || 'info';
  gameState.logs.unshift({ time: gameState.meta.day + 'd ' + formatTime(gameState.meta.dayMinutes), text: text, level: level });
  if (gameState.logs.length > CONFIG.maxLogs) gameState.logs.pop();
  renderLogs();
}

function saveGame() {
  localStorage.setItem('lost_save', JSON.stringify(gameState));
  addLog(t('ui.saveSuccess'), 'success');
  renderNowAndSoon();
}

function normalizeLoadedState() {
  if (!gameState.meta) gameState.meta = { day:1, dayMinutes:360, tickCount:0, difficulty:'normal' };
  if (!gameState.meta.dayMinutes && gameState.meta.hour !== undefined) gameState.meta.dayMinutes = gameState.meta.hour * 60;
  if (!gameState.meta.tickCount) gameState.meta.tickCount = 0;
  if (!gameState.meta.difficulty) gameState.meta.difficulty = 'normal';
  if (!gameState.world) gameState.world = { weather:'clear', phase:'survival', threat:20 };
  if (gameState.world.raftUnlocked === undefined) gameState.world.raftUnlocked = false;
  if (gameState.world.departureReady === undefined) gameState.world.departureReady = false;
  if (!gameState.camp) gameState.camp = { fireLevel:0, fireWood:0, morale:50, lastLevel4CheckTick:-999 };
  if (gameState.camp.lastLevel4CheckTick === undefined) gameState.camp.lastLevel4CheckTick = -999;
  if (gameState.camp.conflictRisk === undefined) gameState.camp.conflictRisk = 0;
  if (gameState.camp.conflictChance === undefined) gameState.camp.conflictChance = 0;
  if (gameState.camp.conflictCooldownTicks === undefined) gameState.camp.conflictCooldownTicks = 0;
  if (!gameState.camp.council) gameState.camp.council = {};
  if (!Array.isArray(gameState.camp.projects)) gameState.camp.projects = [];
  if (!gameState.resources) gameState.resources = {};
  if (!gameState.raft) gameState.raft = { raft_logs: 0, raft_sail: 0, raft_rig: 0, raft_hut: 0 };
  if (!gameState.voyage) gameState.voyage = { active: false, completed: false, passengerCount: 0, daysElapsed: 0, totalDays: getRaftBalanceConfig().travelDays || 30, foodLostOverboard: 0, articleStage: 0 };
  var defaults = { logs:2, food:1, water:2, tinder:1, glasses:1, clay:0, bamboo:0, timber:0, stone:0, fiber:0, rope:0, leather:0, stone_knives:0, axes:0, spears:0, nets:0, backpacks:0, huts:0, pots:0 };
  for (var k in defaults) if (gameState.resources[k] === undefined) gameState.resources[k] = defaults[k];
  if (!gameState.discoveries) gameState.discoveries = [];
  if (!gameState.logs) gameState.logs = [];
  if (!gameState.survivors) gameState.survivors = [];
  if (!gameState.expedition) gameState.expedition = createExpeditionState();
  initializeExpeditionMap(gameState.expedition);
  if (!Array.isArray(gameState.expedition.log)) gameState.expedition.log = [];
  gameState.expedition.gear = gameState.expedition.gear || { sword: false, shield: false };
  gameState.expedition.escorting = gameState.expedition.escorting || null;
  gameState.expedition.hiddenSurvivorAssigned = gameState.expedition.hiddenSurvivorAssigned || { food: 0, water: 0 };
  gameState.expedition.autoWalkPath = Array.isArray(gameState.expedition.autoWalkPath) ? gameState.expedition.autoWalkPath : [];
  gameState.expedition.returnPath = Array.isArray(gameState.expedition.returnPath) ? gameState.expedition.returnPath : [];
  gameState.expedition.runFoundCockpit = !!gameState.expedition.runFoundCockpit;
  gameState.expedition.returnTicksRemaining = gameState.expedition.returnTicksRemaining || 0;
  gameState.expedition.restTicksRemaining = gameState.expedition.restTicksRemaining || 0;
  gameState.voyage.totalDays = gameState.voyage.totalDays || getRaftBalanceConfig().travelDays || 30;
  if (gameState.voyage.active) {
    gameState.world.phase = 'sailing';
    currentView = 'sail';
  } else if (currentView === 'sail') {
    currentView = ((gameState.world || {}).raftUnlocked) ? 'raft' : 'camp';
  }
  gameState.survivors.forEach(function(s, i){
    var peopleConfig = getPeopleConfig();
    s.isPlayer = !!s.isPlayer || i === 0;
    s.background = (s.background || 'none').toLowerCase();
    s.traits = Array.isArray(s.traits) ? s.traits : [];
    s.passiveEffects = s.passiveEffects || {};
    s.skills = s.skills || cloneBaseSkills();
    Object.keys(peopleConfig.baseSkills || {}).forEach(function(key) {
      if (s.skills[key] === undefined) s.skills[key] = peopleConfig.baseSkills[key];
    });
    clampSkillMap(s.skills);
    s.assignedJob = s.assignedJob || 'philosophize';
    s.state = s.state || 'philosophize';
    if (s.assignedJob === 'sleep' || s.state === 'sleep') { s.assignedJob = 'rest'; s.state = 'rest'; }
    if (s.state === 'expedition') s.assignedJob = 'expedition';
    s.restTicksRemaining = s.restTicksRemaining || 0;
    s.awayTicksRemaining = s.awayTicksRemaining || 0;
    s.breakdownCooldownTicks = s.breakdownCooldownTicks || 0;
    s.ticksSinceMeal = s.ticksSinceMeal || 0;
    s.ticksSinceDrink = s.ticksSinceDrink || 0;
    s.activeTask = s.activeTask || null;
    s.activeProjectId = s.activeProjectId || null;
    s.resumeProjectId = s.resumeProjectId || null;
  });
  syncPlayerDisplayName();
  gameState.camp.projects.forEach(function(project) {
    if (!project.id) project.id = 'project_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    project.progressHours = project.progressHours || 0;
    project.requiredHours = project.requiredHours || ((CONFIG.recipes[project.recipeId] || {}).timeHours || 1);
    project.status = project.assignedSurvivorId ? 'active' : (project.status || 'paused');
  });
}

function loadGame() {
  var saved = localStorage.getItem('lost_save');
  if (!saved) return;
  gameState = JSON.parse(saved);
  normalizeLoadedState();
  addLog(t('ui.loadSuccess'), 'success');
  renderStaticShell();
  render();
  processTickFrame();
  if (currentSpeed > 0) setSpeed(currentSpeed);
}

function createSurvivor(id, name, isPlayer, profile) {
  var peopleConfig = GAME_DATA.people || {};
  var baseStats = isPlayer ? (peopleConfig.playerTemplate || {}) : (peopleConfig.survivorDefaults || {});
  var survivorProfile = profile || {};
  return {
    id: id,
    name: name || survivorProfile.name || baseStats.name || t('common.unknown'),
    isPlayer: !!isPlayer,
    background: survivorProfile.background || 'none',
    traits: (survivorProfile.traits || []).slice(),
    passiveEffects: survivorProfile.passiveEffects || {},
    skills: clampSkillMap(survivorProfile.skills || cloneBaseSkills()),
    health: baseStats.health !== undefined ? baseStats.health : (isPlayer ? 80 : 100),
    hunger: baseStats.hunger !== undefined ? baseStats.hunger : (isPlayer ? 35 : 25),
    thirst: baseStats.thirst !== undefined ? baseStats.thirst : (isPlayer ? 30 : 25),
    fatigue: baseStats.fatigue !== undefined ? baseStats.fatigue : 30,
    morale: baseStats.morale !== undefined ? baseStats.morale : 70,
    condition: 'healthy',
    alive: true,
    assignedJob: 'philosophize',
    state: 'philosophize',
    activeTask: null,
    restTicksRemaining: 0,
    awayTicksRemaining: 0,
    breakdownCooldownTicks: 0,
    careTargetId: null,
    activeTask: null,
    ticksSinceMeal: 0,
    ticksSinceDrink: 0
  };
}

function newGame() {
  currentView = 'camp';
  gameState = {
    meta: { seed: Date.now(), version: '3.0', day: 1, dayMinutes: 360, tickCount: 0, difficulty: 'normal' },
    world: { weather: 'clear', phase: 'survival', threat: 20, raftUnlocked: false, departureReady: false },
    camp: { fireLevel: 0, fireWood: 0, morale: 50, conflictRisk: 0, conflictChance: 0, conflictCooldownTicks: 0, council: {}, lastLevel4CheckTick: -999, projects: [] },
    resources: { logs: 2, food: 1, water: 2, tinder: 1, glasses: 1, clay: 0, bamboo: 0, timber: 0, stone: 0, fiber: 0, rope: 0, leather: 0, stone_knives: 0, axes: 0, spears: 0, nets: 0, backpacks: 0, huts: 0, pots: 0 },
    raft: { raft_logs: 0, raft_sail: 0, raft_rig: 0, raft_hut: 0 },
    voyage: { active: false, completed: false, passengerCount: 0, daysElapsed: 0, totalDays: getRaftBalanceConfig().travelDays || 30, foodLostOverboard: 0, articleStage: 0 },
    survivors: [createSurvivor('player_1', getPlayerDisplayName(), true)],
    expedition: createExpeditionState(),
    discoveries: [],
    logs: []
  };
  addLog(t('messages.intro1'), 'info');
  addLog(t('messages.intro2'), 'info');
  addLog(t('messages.intro3'), 'info');
  addLog(t('messages.intro4'), 'info');
  addLog(t('messages.intro5'), 'info');
  addLog(t('messages.intro6'), 'info');
  addLog(t('messages.intro7'), 'info');
  addLog(t('messages.intro8'), 'info');
  normalizeResourceInventory();
  render();
}

function advanceTime() {
  if (isVoyageActive()) {
    gameState.meta.tickCount += 1;
    gameState.meta.day += 1;
    gameState.meta.dayMinutes = 720;
    return;
  }
  gameState.meta.dayMinutes += CONFIG.tickMinutes;
  gameState.meta.tickCount += 1;
  while (gameState.meta.dayMinutes >= 1440) {
    gameState.meta.dayMinutes -= 1440;
    gameState.meta.day += 1;
  }
}

function cycleDifficulty() {
  var order = ['easy', 'normal', 'hard'];
  var idx = order.indexOf(gameState.meta.difficulty || 'normal');
  gameState.meta.difficulty = order[(idx + 1) % order.length];
  addLog(t('messages.difficultyChanged', { difficulty: getDifficultyLabel(gameState.meta.difficulty || 'normal') }), 'info');
  render();
}

function hasDiscovery(id) { return gameState.discoveries.indexOf(id) >= 0; }
function discover(id, logText) {
  if (hasDiscovery(id)) return false;
  gameState.discoveries.push(id);
  if (id === 'pots') gameState.resources.pots = Math.max(1, gameState.resources.pots || 0);
  addLog(logText || t('messages.discovery', { name: getDiscoveryDef(id).name }), 'success');
  return true;
}
function getDiscoveryDef(id) {
  var base = GAME_DATA.discoveries.find(function(discovery) { return discovery.id === id; });
  if (!base) return null;
  if (getLanguage() === 'se') return base;
  return Object.assign({}, base, {
    name: t('discoveries.' + id + '.name', null, base.name),
    logIdeas: tArray('discoveries.' + id + '.logIdeas', base.logIdeas || []),
    logArrival: tArray('discoveries.' + id + '.logArrival', base.logArrival || [])
  });
}
function getEligibleDiscoveries(source) {
  return GAME_DATA.discoveries.filter(function(d) {
    if (hasDiscovery(d.id)) return false;
    if (source === 'idea' && !d.byIdeas) return false;
    if (source === 'arrival' && !d.byArrival) return false;
    return (d.prerequisites || []).every(function(req){ return hasDiscovery(req); });
  }).sort(function(a,b){ return a.priority - b.priority; });
}
function rollDiscoveryFromIdea(survivor) {
  var options = getEligibleDiscoveries('idea');
  if (!options.length) return false;
  var pick = options[0];
  var logs = pick.logIdeas || ['{name} comes to you with a new idea. We can make something new.'];
  var msg = logs[Math.floor(Math.random() * logs.length)].replace('{name}', survivor.name);
  return discover(pick.id, msg);
}
function rollDiscoveryFromArrival(survivor) {
  if (Math.random() >= scalePositiveChance(0.75)) return false;
  var options = getEligibleDiscoveries('arrival');
  if (!options.length) return false;
  var pick = options[0];
  var logs = pick.logArrival || ['{name} arrives with new knowledge.'];
  var msg = logs[Math.floor(Math.random() * logs.length)].replace('{name}', survivor.name);
  return discover(pick.id, msg);
}

function setAssignedJob(survivor, jobId) {
  if (!survivor || !survivor.alive) return;
  if (survivor.state === 'away') {
    addLog(t('messages.survivorNotInCamp', { name: survivor.name }), 'warning');
    return;
  }
  if (survivor.state === 'expedition') {
    addLog(t('messages.survivorOnExpedition', { name: survivor.name }), 'warning');
    return;
  }
  var requirementStatus = getRequirementStatus(getJobRequirements(jobId), { survivorId: survivor.id });
  if (!requirementStatus.ok) {
    addLog(t('messages.survivorCannotStart', { name: survivor.name, requirements: requirementStatus.missing.join(', ') }), 'warning');
    return;
  }
  if (jobId !== 'craft') pauseActiveProject(survivor, false);
  survivor.assignedJob = jobId || 'philosophize';
  survivor.restTicksRemaining = 0;
  survivor.careTargetId = null;
  var cfg = CONFIG.jobs[survivor.assignedJob];
  survivor.state = cfg ? cfg.state : 'philosophize';
  if (survivor.state === 'rest') survivor.restTicksRemaining = Math.ceil(CONFIG.restDurationHours / tickFactor());
  if (survivor.state === 'care') {
    var target = getCareTarget();
    survivor.careTargetId = target ? target.id : null;
    if (!target) {
      survivor.assignedJob = 'philosophize';
      survivor.state = 'philosophize';
    }
  }
}
function setPlayerJob(jobId) {
  var player = gameState.survivors[0];
  if (!player || !player.alive) return;
  setAssignedJob(player, jobId);
  addLog(t('messages.focusJobPlayer', { job: lowerFirst(getJobName(player.assignedJob)) }), 'info');
  render();
}
function cycleJob(survivorId) {
  var survivor = getAliveSurvivors().find(function(s){ return s.id === survivorId; });
  if (!survivor) return;
  var order = getAssignableJobActions().map(function(action) { return action.id; });
  var idx = order.indexOf(survivor.assignedJob);
  setAssignedJob(survivor, order[(idx + 1) % order.length]);
  if (!survivor.isPlayer) addLog(t('messages.focusJobSurvivor', { name: survivor.name, job: lowerFirst(getJobName(survivor.assignedJob)) }), 'info');
  render();
}

function getRationNeedForState(stateName) { return perTick(getStateProfile(stateName).rationNeedPerHour); }
function getWaterNeedForState(stateName) { return perTick(getStateProfile(stateName).waterNeedPerHour); }
function canEatAndDrink(survivor) {
  return survivor.state !== 'rest';
}
function canRecoverHealth(survivor) {
  var threshold = CONFIG.rates.severeNeedRecoveryBlockThreshold || 70;
  return (survivor.hunger || 0) < threshold && (survivor.thirst || 0) < threshold;
}
function applyNeedsAndCondition(survivor) {
  var profile = getStateProfile(survivor.state);
  survivor.hunger = clamp(survivor.hunger + perTick(profile.hungerPerHour), 0, 100);
  survivor.thirst = clamp(survivor.thirst + perTick(profile.thirstPerHour), 0, 100);
  survivor.ticksSinceMeal += 1;
  survivor.ticksSinceDrink += 1;

  if (canEatAndDrink(survivor) && getResourceTotalFood() > 0 && survivor.hunger > (CONFIG.rates.eatWhenHungerAbove || 20)) {
    var hungerReliefPerFood = CONFIG.rates.foodHungerReductionPerUnit || 65;
    var targetHunger = CONFIG.rates.eatUntilHunger !== undefined ? CONFIG.rates.eatUntilHunger : 5;
    var wantedFood = Math.max(0, survivor.hunger - targetHunger) / hungerReliefPerFood;
    var rationNeed = getRationNeedForState(survivor.state);
    var maxFood = perTick(CONFIG.rates.awakeFoodMaxPerHour || 0.5);
    var eaten = Math.min(Math.max(wantedFood, rationNeed), maxFood, getResourceTotalFood());
    gameState.resources.food = Math.max(0, (gameState.resources.food || 0) - eaten);
    if (eaten > 0) {
      survivor.hunger = clamp(survivor.hunger - eaten * hungerReliefPerFood, 0, 100);
      survivor.ticksSinceMeal = 0;
    }
  }

  if (canEatAndDrink(survivor) && (gameState.resources.water || 0) > 0 && survivor.thirst > (CONFIG.rates.drinkWhenThirstAbove || 20)) {
    var thirstReliefPerWater = CONFIG.rates.waterThirstReductionPerUnit || 80;
    var targetThirst = CONFIG.rates.drinkUntilThirst !== undefined ? CONFIG.rates.drinkUntilThirst : 5;
    var wantedWater = Math.max(0, survivor.thirst - targetThirst) / thirstReliefPerWater;
    var waterNeed = getWaterNeedForState(survivor.state);
    var maxWater = perTick(CONFIG.rates.awakeWaterMaxPerHour || 0.65);
    var drank = Math.min(Math.max(wantedWater, waterNeed), maxWater, gameState.resources.water || 0);
    gameState.resources.water = Math.max(0, (gameState.resources.water || 0) - drank);
    if (drank > 0) {
      survivor.thirst = clamp(survivor.thirst - drank * thirstReliefPerWater, 0, 100);
      survivor.ticksSinceDrink = 0;
    }
  }

  if (survivor.hunger > 70) survivor.morale = clamp(survivor.morale - perTick(CONFIG.rates.hungryMoraleLossPerHour), 0, 100);
  if (survivor.thirst > 70) survivor.morale = clamp(survivor.morale - perTick(CONFIG.rates.thirstyMoraleLossPerHour), 0, 100);
  if (survivor.hunger > 90) survivor.health = clamp(survivor.health - perTick(CONFIG.rates.starvationHealthLossPerHour), 0, 100);
  if (survivor.thirst > 90) survivor.health = clamp(survivor.health - perTick(CONFIG.rates.dehydrationHealthLossPerHour), 0, 100);
}

function processWorkJob(survivor) {
  var efficiency = getJobPerformanceFactor(survivor, survivor.assignedJob);
  switch (survivor.assignedJob) {
    case 'wood':
      gameState.resources.logs += perTick(CONFIG.rates.woodPerHour * efficiency);
      break;
    case 'food':
      var found = perTick(CONFIG.rates.foodPerHour * efficiency);
      gameState.resources.food += found;
      break;
    case 'water':
      gameState.resources.water += perTick(CONFIG.rates.waterPerHour * efficiency);
      break;
    case 'fish':
      gameState.resources.food += perTick(CONFIG.rates.fishFoodPerHour * efficiency);
      break;
    case 'hunt':
      gameState.resources.food += perTick(CONFIG.rates.huntFoodPerHour * efficiency);
      gameState.resources.leather += perTick(CONFIG.rates.huntLeatherPerHour * efficiency);
      break;
    case 'guard':
      break;
    case 'make_tinder':
      var woodCost = perTick(CONFIG.rates.tinderWoodCostPerHour);
      if ((gameState.resources.logs || 0) >= woodCost) {
        gameState.resources.logs -= woodCost;
        gameState.resources.tinder += perTick(CONFIG.rates.tenderWoodPerHour * efficiency);
      } else {
        survivor.assignedJob = 'philosophize'; survivor.state = 'philosophize';
        addLog(t('messages.tinderOut', { name: survivor.name }), 'warning');
      }
      break;
    case 'feed_fire':
      if (getFireLevel() <= 0) { survivor.assignedJob = 'philosophize'; survivor.state = 'philosophize'; addLog(t('messages.fireGone', { name: survivor.name }), 'warning'); break; }
      var feed = perTick(CONFIG.rates.feedFireWoodPerHour * efficiency);
      if ((gameState.resources.logs || 0) > 0 && (gameState.camp.fireWood || 0) < CONFIG.fireMaxWood) {
        var beforeLevel = getFireLevel();
        var used = Math.min(feed, gameState.resources.logs, CONFIG.fireMaxWood - (gameState.camp.fireWood || 0));
        gameState.resources.logs -= used;
        gameState.camp.fireWood += used;
        var synced = syncFireLevelFromWood();
        if (synced.current > beforeLevel) addLog(t('messages.fireGrows', { name: survivor.name, level: synced.current }), 'success');
      } else if ((gameState.resources.logs || 0) <= 0 || (gameState.camp.fireWood || 0) >= CONFIG.fireMaxWood) {
        survivor.assignedJob = 'philosophize'; survivor.state = 'philosophize';
      }
      break;
    case 'clay':
      gameState.resources.clay += perTick(CONFIG.rates.clayPerHour * efficiency);
      break;
    case 'stone':
      gameState.resources.stone += perTick(CONFIG.rates.stonePerHour * efficiency);
      break;
    case 'bamboo':
      gameState.resources.bamboo += perTick(CONFIG.rates.bambooPerHour * efficiency);
      break;
    case 'timber':
      gameState.resources.timber += perTick(CONFIG.rates.timberPerHour * efficiency);
      break;
    case 'fiber':
      gameState.resources.fiber += perTick(CONFIG.rates.fiberPerHour * efficiency);
      break;
    case 'craft':
      workOnProject(survivor);
      break;
  }
  survivor.fatigue = clamp(survivor.fatigue + perTick(getStateProfile('work').fatiguePerHour), 0, 100);
  survivor.morale = clamp(survivor.morale + perTick(getStateProfile('work').moralePerHour), 0, 100);
}

function processPhilosophizing(survivor) {
  var profile = getStateProfile('philosophize');
  survivor.fatigue = clamp(survivor.fatigue + perTick(profile.fatiguePerHour), 0, 100);
  survivor.morale = clamp(survivor.morale + perTick(profile.moralePerHour), 0, 100);
  if (survivor.health < 100 && canRecoverHealth(survivor)) survivor.health = clamp(survivor.health + perTick(profile.healthPerHour), 0, 100);
}

function processRest(survivor) {
  var lvl = getFireLevel();
  var shelterCfg = getShelterBalanceConfig();
  var shelterCoverage = getShelterCoverage();
  var healthRecoveryAllowed = canRecoverHealth(survivor);
  survivor.fatigue = clamp(survivor.fatigue - perTick(CONFIG.rates.restFatigueRecoveryPerHourByFireLevel[lvl] || 0), 0, 100);
  if (healthRecoveryAllowed) survivor.health = clamp(survivor.health + perTick(CONFIG.rates.restHealthRecoveryPerHourByFireLevel[lvl] || 0), 0, 100);
  survivor.morale = clamp(survivor.morale + perTick(CONFIG.rates.restMoralePerHourByFireLevel[lvl] || 0), 0, 100);
  survivor.fatigue = clamp(survivor.fatigue - perTick((shelterCfg.restFatigueBonusPerCoverage || 0) * shelterCoverage), 0, 100);
  if (healthRecoveryAllowed) survivor.health = clamp(survivor.health + perTick((shelterCfg.restHealthBonusPerCoverage || 0) * shelterCoverage), 0, 100);
  survivor.morale = clamp(survivor.morale + perTick((shelterCfg.restMoraleBonusPerCoverage || 0) * shelterCoverage), 0, 100);
  if (lvl === 0 && isNight()) {
    survivor.health = clamp(survivor.health - perTick(CONFIG.rates.coldNightHealthLossPerHourNoFire), 0, 100);
    survivor.morale = clamp(survivor.morale - perTick(CONFIG.rates.coldNightMoraleLossPerHourNoFire), 0, 100);
  }
  survivor.restTicksRemaining = Math.max(0, (survivor.restTicksRemaining || 0) - 1);
  if (survivor.restTicksRemaining <= 0) {
    if (tryResumeProjectAfterRest(survivor)) {
      addLog(t('messages.readyProjectResume', { name: survivor.name }), 'info');
    } else {
      survivor.assignedJob = 'philosophize';
      survivor.state = 'philosophize';
      addLog(t('messages.readyPhilosophize', { name: survivor.name }), 'info');
    }
  }
}


function processCare(survivor) {
  var target = getAliveSurvivors().find(function(s){ return s.id === survivor.careTargetId; });
  if (!target || target.id === survivor.id || target.health >= 95) {
    target = getCareTarget();
    survivor.careTargetId = target ? target.id : null;
  }
  if (!target) {
    survivor.assignedJob = 'philosophize'; survivor.state = 'philosophize';
    return;
  }
  if (canRecoverHealth(target)) target.health = clamp(target.health + perTick(CONFIG.rates.careHealPerHour), 0, 100);
  target.morale = clamp(target.morale + perTick(CONFIG.rates.careMoralePerHour), 0, 100);
  if (target.fatigue > 0) target.fatigue = clamp(target.fatigue - perTick(4), 0, 100);
  survivor.fatigue = clamp(survivor.fatigue + perTick(getStateProfile('care').fatiguePerHour), 0, 100);
}

function processAway(survivor) {
  survivor.awayTicksRemaining = Math.max(0, (survivor.awayTicksRemaining || 0) - 1);
  survivor.hunger = clamp(survivor.hunger + perTick(getStateProfile('away').hungerPerHour), 0, 100);
  survivor.thirst = clamp(survivor.thirst + perTick(getStateProfile('away').thirstPerHour), 0, 100);
  survivor.fatigue = clamp(survivor.fatigue + perTick(getStateProfile('away').fatiguePerHour), 0, 100);
  survivor.morale = clamp(survivor.morale + perTick(getStateProfile('away').moralePerHour), 0, 100);
  if (survivor.awayTicksRemaining <= 0) {
    survivor.state = 'philosophize';
    survivor.assignedJob = 'philosophize';
    addLog(t('messages.awayReturn', { name: survivor.name }), 'warning');
  }
}
function processMoraleBreakdown(survivor) {
  var cfg = getConflictBalanceConfig();
  if ((survivor.breakdownCooldownTicks || 0) > 0) return;
  if ((survivor.morale || 0) > (cfg.breakdownMorale || 8)) return;
  pauseActiveProject(survivor, true);
  survivor.breakdownCooldownTicks = cfg.breakdownCooldownTicks || 12;
  survivor.morale = clamp((survivor.morale || 0) + 8, 0, 100);
  setAssignedJob(survivor, 'rest');
  addLog(t('messages.campBreakdown', { name: survivor.name }), 'danger');
}
function processSurvivorState(survivor) {
  if ((survivor.breakdownCooldownTicks || 0) > 0) survivor.breakdownCooldownTicks = Math.max(0, survivor.breakdownCooldownTicks - 1);
  if (survivor.state === 'away') {
    processAway(survivor);
    return;
  }
  if (survivor.state === 'expedition') return;
  applyNeedsAndCondition(survivor);
  if (survivor.health <= 0) {
    survivor.alive = false;
    addLog(t('messages.hasDied', { name: survivor.name }), 'danger');
    return;
  }
  if (survivor.state === 'work' && survivor.fatigue >= CONFIG.fatigueRestThreshold) {
    pauseActiveProject(survivor, true);
    setAssignedJob(survivor, 'rest');
    addLog(t('messages.mustRest', { name: survivor.name }), 'warning');
  }
  switch (survivor.state) {
    case 'work': processWorkJob(survivor); break;
    case 'philosophize': processPhilosophizing(survivor); break;
    case 'rest': processRest(survivor); break;
    case 'care': processCare(survivor); break;
  }
  processMoraleBreakdown(survivor);
}

function processDiscoveriesFromSurvivors() {
  var alive = getAliveSurvivors().slice();
  for (var i = 0; i < alive.length; i++) {
    var s = alive[i];
    var passive = s.passiveEffects || {};
    var chance = (getStateProfile(s.state).discoveryChance || 0) * (passive.discoveryChanceMultiplier || 1) + (passive.discoveryChanceBonus || 0);
    if (chance > 0 && Math.random() < scalePositiveChance(chance)) {
      if (rollDiscoveryFromIdea(s)) return;
    }
  }
}

function maybeSpawnSurvivorFromFire() {
  var eventConfig = GAME_DATA.events.spawnFromFire || {};
  var minFireLevel = eventConfig.minFireLevel || 4;
  var intervalTicks = eventConfig.intervalTicks || 4;
  var chance = eventConfig.baseChance || 0.15;
  var names = GAME_DATA.people.newcomerNames || [];
  if (getFireLevel() < minFireLevel || !names.length) return;
  if ((gameState.meta.tickCount - (gameState.camp.lastLevel4CheckTick || -999)) < intervalTicks) return;
  gameState.camp.lastLevel4CheckTick = gameState.meta.tickCount;
  if (Math.random() < scalePositiveChance(chance)) {
    var profile = generateNewcomerProfile();
    if (!profile) {
      addLog(t('messages.noNewSurvivor'), 'info');
      return;
    }
    var newcomer = createSurvivor('survivor_' + Date.now(), profile.name, false, profile);
    gameState.survivors.push(newcomer);
    addLog((getEventText('spawnFromFire', 'successLog', '{name} finds the camp thanks to the great fire.')).replace('{name}', profile.name), 'success');
    showArrivalCard(newcomer);
    rollDiscoveryFromArrival(newcomer);
  } else {
    addLog(getEventText('spawnFromFire', 'waitingLog', t('messages.signalFireStrong')), 'info');
  }
}

function pickConflictTarget() {
  var alive = getAliveSurvivors().filter(function(s) { return s.state !== 'away'; });
  if (!alive.length) return null;
  var weighted = alive.map(function(s) {
    var passive = s.passiveEffects || {};
    var weight = 1 + clamp((45 - (s.morale || 0)) / 15, 0, 4) + (passive.conflictRisk || 0) * 4;
    return { survivor: s, weight: Math.max(0.2, weight) };
  });
  var total = weighted.reduce(function(sum, item) { return sum + item.weight; }, 0);
  var roll = Math.random() * total;
  for (var i = 0; i < weighted.length; i++) {
    roll -= weighted[i].weight;
    if (roll <= 0) return weighted[i].survivor;
  }
  return weighted[0].survivor;
}
function applyConflictEvent(summary) {
  var cfg = getConflictBalanceConfig();
  var target = pickConflictTarget();
  if (!target) return;
  var risk = summary.risk || 0;
  var level = risk >= (cfg.severeRisk || 72) ? 'severe' : (risk >= (cfg.moderateRisk || 45) ? 'moderate' : 'mild');
  if (level === 'severe' && getAliveSurvivors().length > 1 && Math.random() < 0.25) {
    pauseActiveProject(target, true);
    target.assignedJob = 'away';
    target.state = 'away';
    target.awayTicksRemaining = cfg.awayTicks || 8;
    target.morale = clamp((target.morale || 0) + 6, 0, 100);
    getAliveSurvivors().forEach(function(s) {
      if (s.id !== target.id) s.morale = clamp((s.morale || 0) - 4, 0, 100);
    });
    addLog(t('messages.campConflictAway', { name: target.name }, target.name + ' has had enough of camp and disappears for a while. The group is shaken by the split.'), 'danger');
    return;
  }
  if (level === 'severe') {
    target.health = clamp((target.health || 0) - 6, 0, 100);
    target.morale = clamp((target.morale || 0) - 8, 0, 100);
    getAliveSurvivors().forEach(function(s) { if (s.id !== target.id) s.morale = clamp((s.morale || 0) - 3, 0, 100); });
    addLog(t('messages.campConflictFight', { name: target.name }, 'A harsh fight breaks out in camp. ' + target.name + ' is injured and morale falls.'), 'danger');
    return;
  }
  if (level === 'moderate') {
    pauseActiveProject(target, true);
    target.morale = clamp((target.morale || 0) - 6, 0, 100);
    setAssignedJob(target, 'rest');
    addLog(target.name + ' hamnar i konflikt med gruppen och lämnar arbetet för att lugna ner sig.', 'warning');
    return;
  }
  target.morale = clamp((target.morale || 0) - 4, 0, 100);
  addLog(t('messages.campConflictIrritation', { name: target.name }, 'Irritation spreads through camp. ' + target.name + ' loses morale.'), 'warning');
}
function processConflictEvents() {
  if ((gameState.camp.conflictCooldownTicks || 0) > 0) {
    gameState.camp.conflictCooldownTicks = Math.max(0, gameState.camp.conflictCooldownTicks - 1);
    return;
  }
  var summary = getCampStabilitySummary();
  gameState.camp.conflictRisk = summary.risk;
  gameState.camp.conflictChance = summary.chance;
  if (summary.risk < (getConflictBalanceConfig().mildRisk || 22)) return;
  if (Math.random() < scaleNegativeChance(summary.chance)) {
    applyConflictEvent(summary);
    gameState.camp.conflictCooldownTicks = getConflictBalanceConfig().cooldownTicks || 6;
  }
}

function getPopulationEventMultiplier(eventConfig) {
  var population = Math.max(1, getAliveSurvivors().length);
  var cfg = (eventConfig || {}).populationRisk || {};
  var solo = cfg.soloMultiplier !== undefined ? cfg.soloMultiplier : 0.65;
  var perExtra = cfg.perExtraSurvivor !== undefined ? cfg.perExtraSurvivor : 0.2;
  var max = cfg.maxMultiplier !== undefined ? cfg.maxMultiplier : 2.5;
  return clamp(solo + Math.max(0, population - 1) * perExtra, solo, max);
}
function getPopulationPressureTier(eventConfig) {
  var population = Math.max(1, getAliveSurvivors().length);
  var tiers = (eventConfig || {}).populationThresholds || {};
  if (population >= 15) return tiers.fifteenPlus || null;
  if (population >= 6) return tiers.sixPlus || null;
  return null;
}

function processEvents() {
  var animalAttack = GAME_DATA.events.animalAttack || {};
  var rats = GAME_DATA.events.rats || {};
  var storm = GAME_DATA.events.storm || {};
  var guardFactor = getTotalJobPerformance('guard');
  var guardNames = getAliveAssignedToJob('guard').map(function(s){ return s.name; }).join(', ');
  var shelterCoverage = getShelterCoverage();
  maybeSpawnSurvivorFromFire();
  var animalTier = getPopulationPressureTier(animalAttack) || {};
  var ratTier = getPopulationPressureTier(rats) || {};
  var stormTier = getPopulationPressureTier(storm) || {};
  var animalGuardNeed = animalTier.guardExpectation || 0;
  var animalGuardShortage = Math.max(0, animalGuardNeed - guardFactor);
  var animalChance = (animalAttack.baseChance || 0.005) *
    getPopulationEventMultiplier(animalAttack) *
    (animalTier.chanceMultiplier || 1) *
    (1 + animalGuardShortage * (animalAttack.guardShortageChanceMultiplierPerFactor || 0)) *
    Math.max(0.08, 1 - guardFactor * (animalAttack.guardChanceReductionPerFactor || 0));
  if (getFireLevel() < (animalAttack.maxFireLevelExclusive || 2) && Math.random() < scaleNegativeChance(animalChance)) {
    var alive = getAliveSurvivors();
    if (alive.length) {
      if (guardFactor > 0 && Math.random() < Math.min(0.75, guardFactor * (animalAttack.guardRepelChancePerFactor || 0))) {
        addLog((getEventText('animalAttack', 'guardRepelLog', '{guards} keep the animals away from camp.')).replace('{guards}', guardNames || t('jobs.guard')), 'success');
        if (guardFactor >= 1.35) {
          gameState.resources.food += animalAttack.guardRewardFood || 0;
          gameState.resources.leather += animalAttack.guardRewardLeather || 0;
        }
        return;
      }
      var target = alive[Math.floor(Math.random() * alive.length)];
      var healthLoss = (animalAttack.healthLoss || 10) *
        (animalTier.damageMultiplier || 1) *
        (1 + animalGuardShortage * (animalAttack.guardShortageDamageMultiplierPerFactor || 0)) *
        Math.max(0.3, 1 - guardFactor * (animalAttack.guardDamageReductionPerFactor || 0));
      target.health = clamp(target.health - healthLoss, 0, 100);
      target.morale = clamp(target.morale - (animalAttack.moraleLoss || 5) * (animalTier.moraleMultiplier || 1), 0, 100);
      addLog((getEventText('animalAttack', 'log', 'Wild animals attack. {name} is injured.')).replace('{name}', target.name), 'danger');
    }
  }
  var ratGuardNeed = ratTier.guardExpectation || 0;
  var ratGuardShortage = Math.max(0, ratGuardNeed - guardFactor);
  var ratChance = (rats.baseChance || 0.01) *
    getPopulationEventMultiplier(rats) *
    (ratTier.chanceMultiplier || 1) *
    (1 + ratGuardShortage * (rats.guardShortageChanceMultiplierPerFactor || 0)) *
    Math.max(0.08, 1 - guardFactor * (rats.guardChanceReductionPerFactor || 0));
  if (getResourceTotalFood() > (rats.minFood || 5) && getFireLevel() < (rats.maxFireLevelExclusive || 2) && Math.random() < scaleNegativeChance(ratChance)) {
    var loss = Math.min(getResourceTotalFood(), ((rats.minLoss || 1) + Math.random() * (rats.maxExtraLoss || 1.5)) * (ratTier.lossMultiplier || 1));
    gameState.resources.food = Math.max(0, (gameState.resources.food || 0) - loss);
    addLog((getEventText('rats', 'log', 'Rats get into the food and eat {amount} food.')).replace('{amount}', formatNumber(loss)), 'warning');
  }
  var shelterNeed = stormTier.shelterExpectation || 0;
  var shelterShortage = Math.max(0, shelterNeed - shelterCoverage);
  var stormChance = (storm.baseChance || 0.008) *
    getPopulationEventMultiplier(storm) *
    (stormTier.chanceMultiplier || 1) *
    (1 + shelterShortage * (storm.shelterShortageChanceMultiplierPerCoverage || 0)) *
    Math.max(0.15, 1 - shelterCoverage * (storm.shelterChanceReductionPerCoverage || 0));
  if (getResourceTotalFood() > (storm.minFood || 3) && Math.random() < scaleNegativeChance(stormChance)) {
    var rawLoss = ((storm.minLoss || 1) + Math.random() * (storm.maxExtraLoss || 2)) * (stormTier.lossMultiplier || 1);
    var protectedMultiplier = Math.max(0.08, 1 - shelterCoverage * (storm.foodProtectionPerCoverage || 0.75));
    var stormLoss = Math.min(getResourceTotalFood(), rawLoss * protectedMultiplier);
    gameState.resources.food = Math.max(0, (gameState.resources.food || 0) - stormLoss);
    var rawWaterLoss = ((storm.waterMinLoss || 0.6) + Math.random() * (storm.waterMaxExtraLoss || 1.2)) * (stormTier.waterLossMultiplier || stormTier.lossMultiplier || 1);
    var waterProtectedMultiplier = Math.max(0.08, 1 - shelterCoverage * (storm.waterProtectionPerCoverage || storm.foodProtectionPerCoverage || 0.75));
    var stormWaterLoss = Math.min(gameState.resources.water || 0, rawWaterLoss * waterProtectedMultiplier);
    gameState.resources.water = Math.max(0, (gameState.resources.water || 0) - stormWaterLoss);
    getAliveSurvivors().forEach(function(survivor) {
      survivor.morale = clamp(survivor.morale - (storm.moraleLoss || 0) * (stormTier.moraleMultiplier || 1), 0, 100);
      if (isNight() && shelterCoverage < 1) {
        survivor.health = clamp(survivor.health - (1 - shelterCoverage) * (storm.healthLossNoShelterAtNight || 0) * (stormTier.healthMultiplier || 1), 0, 100);
      }
    });
    addLog(getEventText('storm', 'log', 'A storm lashes the camp and destroys {amount} food and {water} water.')
      .replace('{amount}', formatNumber(stormLoss))
      .replace('{water}', formatNumber(stormWaterLoss)), 'warning');
    if (shelterCoverage > 0) addLog(getEventText('storm', 'shelterLog', 'The huts protect some of the food from the storm.'), 'info');
  }
}

function consumeFire() {
  var lvl = getFireLevel();
  if (lvl <= 0) return;
  gameState.camp.fireWood = clamp((gameState.camp.fireWood || 0) - perTick(CONFIG.rates.fireConsumptionPerHourPerLevel * lvl), 0, CONFIG.fireMaxWood);
  var result = syncFireLevelFromWood();
  if (result.current === 0 && result.previous > 0) {
    addLog(t('messages.fireOut'), 'danger');
  } else if (result.current < result.previous) {
    addLog(t('messages.fireDrops', { level: result.current }), 'warning');
  }
}

function updateCampMorale() {
  var alive = getAliveSurvivors();
  if (!alive.length) { gameState.camp.morale = 0; return; }
  var total = 0; alive.forEach(function(s){ total += s.morale || 0; });
  var passiveEffects = getCampPassiveEffects();
  var shelterMorale = (getShelterBalanceConfig().passiveMoraleBonusPerCoverage || 0) * getShelterCoverage();
  var traitMorale = (passiveEffects.moraleBonus || 0) + (passiveEffects.groupMorale || 0);
  gameState.camp.morale = clamp((total / alive.length) + shelterMorale + traitMorale, 0, 100);
  var stability = getCampStabilitySummary();
  gameState.camp.conflictRisk = stability.risk;
  gameState.camp.conflictChance = stability.chance;
}

function simulateTick() {
  advanceTime();
  if (isVoyageActive()) {
    processVoyageTick();
    normalizeResourceInventory();
    return;
  }
  processEvents();
  consumeFire();
  getAliveSurvivors().forEach(processSurvivorState);
  processExpeditionTick();
  processDiscoveriesFromSurvivors();
  normalizeResourceInventory();
  updateCampMorale();
  processConflictEvents();
  updateCampMorale();
}

function processTickFrame() {
  simulateTick();
  render();
}

function executeDirectAction(actionId) {
  var player = gameState.survivors[0];
  if (!player || !player.alive) return;
  switch (actionId) {
    case 'light_fire':
      if ((gameState.resources.tinder || 0) < 1) { addLog(t('messages.needTinder'), 'warning'); break; }
      if ((gameState.resources.logs || 0) < 1) { addLog(t('messages.needWoodForFire'), 'warning'); break; }
      if ((gameState.resources.glasses || 0) <= 0 && getFireLevel() <= 0) { addLog(t('messages.needGlassesOrEmbers'), 'warning'); break; }
      gameState.resources.logs -= 1; gameState.resources.tinder -= 1; gameState.camp.fireWood = clamp(Math.max(1, (gameState.camp.fireWood || 0) + 1), 0, CONFIG.fireMaxWood); syncFireLevelFromWood(); discover('fire_building', t('discoveries.fire_building.name'));
      break;
  }
  normalizeResourceInventory();
  render();
}

function getAvailableActions() {
  var actions = [
    { id: 'wood', name: getJobName('wood'), icon: icon('wood'), mode: 'job' },
    { id: 'timber', name: getJobName('timber'), icon: icon('timber'), mode: 'job' },
    { id: 'food', name: getJobName('food'), icon: icon('food'), mode: 'job' },
    { id: 'water', name: getJobName('water'), icon: icon('water'), mode: 'job' },
    { id: 'fiber', name: getJobName('fiber'), icon: icon('fiber'), mode: 'job' },
    { id: 'fish', name: getJobName('fish'), icon: icon('fish'), mode: 'job' },
    { id: 'hunt', name: getJobName('hunt'), icon: icon('hunt'), mode: 'job' },
    { id: 'guard', name: getJobName('guard'), icon: icon('guard'), mode: 'job' },
    { id: 'make_tinder', name: getJobName('make_tinder'), icon: icon('tinder'), mode: 'job' },
    { id: 'feed_fire', name: getJobName('feed_fire'), icon: icon('fire'), mode: 'job' },
    { id: 'philosophize', name: getJobName('philosophize'), icon: icon('idea'), mode: 'job' },
    { id: 'rest', name: getJobName('rest'), icon: icon('rest'), mode: 'job' },
    { id: 'care', name: getJobName('care'), icon: icon('care'), mode: 'job' }
  ];
  actions.push({ id: 'clay', name: getJobName('clay'), icon: icon('clay'), mode: 'job' });
  actions.push({ id: 'stone', name: getJobName('stone'), icon: icon('stone'), mode: 'job' });
  actions.push({ id: 'bamboo', name: getJobName('bamboo'), icon: icon('bamboo'), mode: 'job' });
  if ((gameState.resources.logs || 0) > 0 && (gameState.resources.tinder || 0) > 0 && ((gameState.resources.glasses || 0) > 0 || getFireLevel() > 0)) actions.push({ id: 'light_fire', name: t('shell.fire'), icon: icon('fire'), mode: 'direct' });
  return actions.filter(function(action) { return action.mode === 'direct' || isJobVisible(action.id); });
}

function isActionAvailable(action) {
  if (action.mode === 'direct') {
    if (action.id === 'light_fire') return (gameState.resources.logs || 0) > 0 && (gameState.resources.tinder || 0) > 0 && ((gameState.resources.glasses || 0) > 0 || getFireLevel() > 0);
  } else {
    if (action.id === 'make_tinder') return (gameState.resources.logs || 0) > 0;
    if (action.id === 'feed_fire') return getFireLevel() > 0 && (gameState.resources.logs || 0) > 0 && (gameState.camp.fireWood || 0) < CONFIG.fireMaxWood;
    if (action.id === 'care') return !!getCareTarget();
    return getRequirementStatus(getJobRequirements(action.id)).ok;
  }
  return true;
}

function getAssignableJobActions() {
  var actions = [
    { id: 'wood', name: localizeNameMap('resources', 'logs'), icon: icon('wood'), mode: 'job' },
    { id: 'timber', name: localizeNameMap('resources', 'timber'), icon: icon('timber'), mode: 'job' },
    { id: 'food', name: localizeNameMap('resources', 'food'), icon: icon('food'), mode: 'job' },
    { id: 'water', name: localizeNameMap('resources', 'water'), icon: icon('water'), mode: 'job' },
    { id: 'fiber', name: localizeNameMap('resources', 'fiber'), icon: icon('fiber'), mode: 'job' },
    { id: 'fish', name: getJobName('fish'), icon: icon('fish'), mode: 'job' },
    { id: 'hunt', name: getJobName('hunt'), icon: icon('hunt'), mode: 'job' },
    { id: 'guard', name: getJobName('guard'), icon: icon('guard'), mode: 'job' },
    { id: 'make_tinder', name: localizeNameMap('resources', 'tinder'), icon: icon('tinder'), mode: 'job' },
    { id: 'feed_fire', name: t('shell.fire'), icon: icon('fire'), mode: 'job' },
    { id: 'philosophize', name: getJobName('philosophize'), icon: icon('idea'), mode: 'job' },
    { id: 'rest', name: getJobName('rest'), icon: icon('rest'), mode: 'job' },
    { id: 'care', name: getJobName('care'), icon: icon('care'), mode: 'job' }
  ];
  actions.push({ id: 'clay', name: localizeNameMap('resources', 'clay'), icon: icon('clay'), mode: 'job', discovery:'clay' });
  actions.push({ id: 'stone', name: localizeNameMap('resources', 'stone'), icon: icon('stone'), mode: 'job', discovery:'stone' });
  actions.push({ id: 'bamboo', name: localizeNameMap('resources', 'bamboo'), icon: icon('bamboo'), mode: 'job', discovery:'bamboo' });
  return actions.filter(function(action) { return isJobVisible(action.id); });
}

function setSurvivorJob(survivorId, jobId) {
  var survivor = getAliveSurvivors().find(function(s){ return s.id === survivorId; });
  if (!survivor) return;
  setAssignedJob(survivor, jobId);
  addLog(t('messages.setSurvivorJob', { name: survivor.name, job: lowerFirst(getJobName(jobId)) }), 'info');
  render();
}

function getJobAssignmentCounts() {
  var counts = {};
  getAliveSurvivors().forEach(function(s){
    var key = s.assignedJob || 'philosophize';
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function renderJobMetrics() {
  var container = document.getElementById('job-metrics');
  if (!container) return;
  var counts = getJobAssignmentCounts();
  var jobDefs = {
    wood: { name: localizeNameMap('resources', 'logs'), icon: icon('wood') },
    timber: { name: localizeNameMap('resources', 'timber'), icon: icon('timber') },
    food: { name: localizeNameMap('resources', 'food'), icon: icon('food') },
    water: { name: localizeNameMap('resources', 'water'), icon: icon('water') },
    fiber: { name: localizeNameMap('resources', 'fiber'), icon: icon('fiber') },
    fish: { name: getJobName('fish'), icon: icon('fish') },
    hunt: { name: getJobName('hunt'), icon: icon('hunt') },
    guard: { name: getJobName('guard'), icon: icon('guard') },
    make_tinder: { name: localizeNameMap('resources', 'tinder'), icon: icon('tinder') },
    feed_fire: { name: t('shell.fire'), icon: icon('fire') },
    clay: { name: localizeNameMap('resources', 'clay'), icon: icon('clay') },
    stone: { name: localizeNameMap('resources', 'stone'), icon: icon('stone') },
    bamboo: { name: localizeNameMap('resources', 'bamboo'), icon: icon('bamboo') },
    care: { name: getJobName('care'), icon: icon('care') },
    rest: { name: getJobName('rest'), icon: icon('rest') },
    philosophize: { name: getJobName('philosophize'), icon: icon('idea') },
    expedition: { name: t('shell.expedition'), icon: icon('explore') }
  };
  var order = ['wood', 'timber', 'food', 'water', 'fiber', 'fish', 'hunt', 'guard', 'clay', 'stone', 'bamboo', 'make_tinder', 'feed_fire', 'care', 'rest', 'philosophize', 'expedition'];
  var active = order.filter(function(jobId) { return (counts[jobId] || 0) > 0; });
  if (!active.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = active.map(function(jobId) {
    var def = jobDefs[jobId] || { name: jobId, icon: '' };
    return '<div class="job-badge" title="' + def.name + ': ' + counts[jobId] + '"><span>' + def.icon + '</span><span class="job-badge-count">' + counts[jobId] + '</span></div>';
  }).join('');
}

function renderTopBar() {
  document.getElementById('day').textContent = gameState.meta.day;
  document.getElementById('time').textContent = formatTime(gameState.meta.dayMinutes);
  document.getElementById('threat').textContent = formatNumber(gameState.world.threat) + '%';
  document.getElementById('morale').textContent = formatNumber(gameState.camp.morale) + '%';
  document.getElementById('difficulty-label').textContent = getDifficultyLabel(gameState.meta.difficulty || 'normal');
  renderJobMetrics();
}
function renderFire() {
  var pips = document.querySelectorAll('.fire-pip');
  var lvl = getFireLevel();
  for (var i = 0; i < pips.length; i++) pips[i].classList.toggle('active', i < lvl && lvl > 0);
  var status = t('fireStatus.out');
  if (lvl === 1) status = t('fireStatus.spark'); else if (lvl === 2) status = t('fireStatus.small'); else if (lvl === 3) status = t('fireStatus.steady'); else if (lvl >= 4) status = t('fireStatus.large');
  if (lvl > 0 || (gameState.camp.fireWood || 0) > 0) status = t('fireStatus.withFuel', { status: status, current: formatNumber(gameState.camp.fireWood || 0), max: formatNumber(CONFIG.fireMaxWood) });
  document.getElementById('fire-status').textContent = status;
}
function renderResources() {
  var r = gameState.resources, el = document.getElementById('resources');
  var shelter = getShelterSummary();
  var hutTitle = t('camp.hutsTitle', { covered: shelter.covered, alive: shelter.aliveCount, coverage: shelter.coveragePercent });
  var items = [
    { key: 'logs', icon: 'wood', label: localizeNameMap('resources', 'logs') },
    { key: 'food', icon: 'food', label: localizeNameMap('resources', 'food') },
    { key: 'water', icon: 'water', label: localizeNameMap('resources', 'water') },
    { key: 'tinder', icon: 'tinder', label: localizeNameMap('resources', 'tinder') },
    { key: 'fiber', icon: 'fiber', label: localizeNameMap('resources', 'fiber') },
    { key: 'clay', icon: 'clay', label: localizeNameMap('resources', 'clay') },
    { key: 'stone', icon: 'stone', label: localizeNameMap('resources', 'stone') },
    { key: 'bamboo', icon: 'bamboo', label: localizeNameMap('resources', 'bamboo') },
    { key: 'timber', icon: 'timber', label: localizeNameMap('resources', 'timber') },
    { key: 'rope', icon: 'rope', label: localizeNameMap('resources', 'rope') },
    { key: 'leather', icon: 'leather', label: localizeNameMap('resources', 'leather') },
    { key: 'stone_knives', icon: 'knife', label: localizeNameMap('resources', 'stone_knives') },
    { key: 'axes', icon: 'axe', label: localizeNameMap('resources', 'axes') },
    { key: 'spears', icon: 'spear', label: localizeNameMap('resources', 'spears') },
    { key: 'nets', icon: 'net', label: localizeNameMap('resources', 'nets') },
    { key: 'backpacks', icon: 'backpack', label: localizeNameMap('resources', 'backpacks') },
    { key: 'huts', icon: 'hut', label: localizeNameMap('resources', 'huts'), title: hutTitle, value: formatNumber(r.huts) + ' (' + shelter.covered + '/' + shelter.aliveCount + ')' },
    { key: 'pots', icon: 'pot', label: localizeNameMap('resources', 'pots') },
    { key: 'glasses', icon: 'glasses', label: localizeNameMap('resources', 'glasses') }
  ];
  var sections = [
    { title: t('resourceSections.materials'), className: 'materials', keys: ['logs', 'food', 'water', 'tinder', 'fiber', 'clay', 'stone', 'bamboo', 'timber', 'rope', 'leather'] },
    { title: t('resourceSections.equipment'), className: 'equipment', keys: ['stone_knives', 'axes', 'spears', 'nets', 'backpacks', 'pots', 'glasses'] },
    { title: t('resourceSections.camp'), className: 'camp', keys: ['huts'] }
  ];
  var itemByKey = {};
  items.forEach(function(item) { itemByKey[item.key] = item; });
  el.innerHTML = sections.map(function(section) {
    var visibleItems = section.keys.map(function(key) { return itemByKey[key]; }).filter(function(item) {
      return item && isResourceVisible(item.key);
    });
    if (!visibleItems.length) return '';
    var html = '<div class="resource-section ' + section.className + '"><div class="resource-section-title">' + section.title + '</div>';
    html += visibleItems.map(function(item) {
    var title = item.title ? ' title="' + item.title + '"' : '';
    var value = item.value || getEquipmentStockText(item.key);
    return '<div class="resource-item"' + title + '><span>' + icon(item.icon) + ' ' + item.label + '</span><span class="resource-value">' + value + '</span></div>';
    }).join('');
    html += '</div>';
    return html;
  }).join('');
}
function renderActions() {
  var container = document.getElementById('actions-list');
  var html = '';
  if ((gameState.resources.logs || 0) > 0 && (gameState.resources.tinder || 0) > 0 && ((gameState.resources.glasses || 0) > 0 || getFireLevel() > 0)) {
    html += '<button class="project-btn" data-action="light_fire">' + icon('fire') + ' ' + t('shell.fire') + '</button>';
  }
  html += '<div class="project-meta" style="margin:8px 0;">' + t('ui.projectsIntro') + '</div>';
  Object.keys(CONFIG.recipes).forEach(function(recipeId) {
    var recipe = CONFIG.recipes[recipeId];
    if ((recipe.workspace || 'camp') !== 'camp') return;
    if (!isRecipeDiscovered(recipe)) return;
    var requirementStatus = getRecipeRequirementStatus(recipe);
    var available = requirementStatus.ok;
    var missingText = requirementStatus.missing.join(', ');
    html += '<div class="project-card">';
    html += '<div class="project-head"><div><div class="project-name">' + icon('craft') + ' ' + getRecipeName(recipeId) + '</div><div class="project-meta">' + getRecipeCostText(recipe) + ' &bull; ' + formatNumber(recipe.timeHours) + ' h</div></div>';
    html += '<button class="project-btn" data-start-project="' + recipeId + '" title="' + (missingText || t('ui.startProject')) + '" ' + (!available ? 'disabled' : '') + '>' + t('common.start') + '</button></div>';
    if (missingText) html += '<div class="project-meta" style="margin-top:6px;color:#f39c12;">' + missingText + '</div>';
    html += '</div>';
  });
  var projects = getProjectsByWorkspace('camp');
  html += '<div class="camp-column-title" style="margin-top:14px;">' + t('ui.ongoingProjects') + '</div>';
  if (!projects.length) {
    html += '<div class="project-meta">' + t('ui.noProjects') + '</div>';
  }
  projects.forEach(function(project) {
    var worker = getProjectWorker(project.id);
    var percent = projectProgressPercent(project);
    var remaining = Math.max(0, (project.requiredHours || 0) - (project.progressHours || 0));
    html += '<div class="project-card">';
    html += '<div class="project-head"><div><div class="project-name">' + project.name + '</div><div class="project-meta">' + formatNumber(project.progressHours) + '/' + formatNumber(project.requiredHours) + ' h &bull; ' + (worker ? worker.name : t('statuses.noAssignedWorker')) + '</div></div><div class="project-meta">' + t('common.hoursRemaining', { value: formatNumber(remaining) }) + '</div></div>';
    html += '<div class="project-progress"><div class="project-progress-fill" style="width:' + percent + '%"></div></div>';
    html += '<div class="project-actions"><select class="project-select" data-project-worker="' + project.id + '"><option value="">' + t('common.workerSelect') + '</option>';
    getAvailableProjectWorkers().forEach(function(survivor) {
      var selected = worker && worker.id === survivor.id ? ' selected' : '';
      html += '<option value="' + survivor.id + '"' + selected + '>' + survivor.name + '</option>';
    });
    html += '</select>';
    if (worker) html += '<button class="project-btn" data-pause-project="' + worker.id + '">' + t('common.pause') + '</button>';
    html += '</div></div>';
  });
  container.innerHTML = html;
  Array.prototype.forEach.call(container.querySelectorAll('[data-action="light_fire"]'), function(btn) {
    btn.onclick = function() {
      executeDirectAction('light_fire');
    };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-start-project]'), function(btn) {
    btn.onclick = function() {
      if (startProject(btn.getAttribute('data-start-project'))) render();
    };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-project-worker]'), function(select) {
    select.onchange = function() {
      if (this.value && assignProject(this.getAttribute('data-project-worker'), this.value)) render();
    };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-pause-project]'), function(btn) {
    btn.onclick = function() {
      var survivor = getAliveSurvivors().find(function(s) { return s.id === btn.getAttribute('data-pause-project'); });
      if (survivor) {
        pauseActiveProject(survivor, false);
        survivor.assignedJob = 'philosophize';
        survivor.state = 'philosophize';
        render();
      }
    };
  });
}

function renderPlayerStatus() {
  var container = document.getElementById('player-status');
  var html = '';
  var jobActions = getAssignableJobActions();
  getAliveSurvivors().forEach(function(s, index) {
    var background = getBackgroundDef(s.background);
    var traits = (s.traits || []).map(getTraitDef).filter(Boolean);
    var stateLabel = CONFIG.jobs[s.assignedJob] ? getJobName(s.assignedJob) : s.state;
    if (s.state === 'away') stateLabel = t('statuses.awayCamp', { hours: formatNumber((s.awayTicksRemaining || 0) * tickFactor()) });
    if (s.state === 'expedition') stateLabel = t('statuses.expedition');
    if (s.activeProjectId) {
      var project = getProject(s.activeProjectId);
      if (project) stateLabel = project.name + ' (' + t('common.hoursRemaining', { value: formatNumber(Math.max(0, project.requiredHours - project.progressHours)) }) + ')';
    }
    if (s.activeTask) stateLabel = s.activeTask.name + ' (' + t('common.hoursRemaining', { value: formatNumber(s.activeTask.ticksRemaining * tickFactor()) }) + ')';
    if (s.state === 'rest') stateLabel = t('statuses.restTime', { base: stateLabel, hours: formatNumber(s.restTicksRemaining * tickFactor()) });
    if (s.state === 'care' && s.careTargetId) {
      var target = getAliveSurvivors().find(function(t){ return t.id === s.careTargetId; });
      if (target) stateLabel = t('statuses.careTarget', { base: stateLabel, target: target.name });
    }
    html += '<div class="survivor-card" data-id="' + s.id + '" style="margin-bottom:6px; padding:6px; background:#2d2d2d; border-radius:4px; border-left:3px solid ' + (index === 0 ? '#e67e22' : '#27ae60') + ';">';
    html += '<div class="survivor-action-row">';
    jobActions.forEach(function(action){
      var requirementStatus = getRequirementStatus(getJobRequirements(action.id), { survivorId: s.id });
      var available = s.state !== 'away' && s.state !== 'expedition' && isActionAvailable(action) && requirementStatus.ok;
      var active = s.assignedJob === action.id && !s.activeTask;
      var missingText = requirementStatus.missing.join(', ');
      var title = action.name + (missingText ? ' - ' + missingText : '');
      html += '<button class="survivor-action-btn ' + (active ? 'active' : '') + '" data-id="' + s.id + '" data-job="' + action.id + '" title="' + title + '" ' + (!available ? 'disabled' : '') + '>' + action.icon + '</button>';
    });
    html += '</div>';
    html += '<div style="display:flex; justify-content:space-between; align-items:center;"><strong>' + s.name + '</strong><span style="font-size:10px; padding:2px 6px; background:#333; border-radius:3px; color:#aaa;">' + stateLabel + '</span></div>';
    if (background) html += '<div style="margin-top:4px; font-size:11px; color:#cfcfcf;">' + background.name + '</div>';
    if (traits.length) {
      html += '<div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:5px;">';
      traits.forEach(function(trait) {
        html += '<span class="survivor-chip ' + traitBadgeClass(trait) + '">' + trait.name + '</span>';
      });
      html += '</div>';
    }
    html += '<div style="display:flex; gap:6px; margin-top:4px; font-size:11px; flex-wrap:wrap;">';
    html += '<span title="' + t('ui.health') + '">' + icon('health') + formatNumber(s.health) + '</span><span title="' + t('ui.satiety') + '">' + icon('food') + formatNumber(100 - s.hunger) + '</span><span title="' + t('ui.hydration') + '">' + icon('water') + formatNumber(100 - s.thirst) + '</span><span title="' + t('ui.energy') + '">' + icon('rest') + t('ui.energy') + ' ' + formatNumber(100 - s.fatigue) + '</span><span title="' + t('ui.morale') + '">' + icon('morale') + formatNumber(s.morale) + '</span>';
    html += '</div>';
    html += buildSurvivorHoverMarkup(s);
    html += '</div>';
  });
  if (!html) html = '<div>' + t('ui.noSurvivors') + '</div>';
  container.innerHTML = html;
  Array.prototype.forEach.call(container.querySelectorAll('.survivor-action-btn'), function(btn) {
    btn.onclick = function(event) {
      event.stopPropagation();
      setSurvivorJob(this.getAttribute('data-id'), this.getAttribute('data-job'));
    };
  });
  initSurvivorCards(container);
}

function positionSurvivorHoverCard(card) {
  if (!card) return;
  var hoverCard = card.querySelector('.survivor-hover-card');
  if (!hoverCard) return;
  var rect = card.getBoundingClientRect();
  var width = hoverCard.offsetWidth || 240;
  var gap = 12;
  var left = rect.right + gap;
  if (left + width > window.innerWidth - gap) left = Math.max(gap, rect.left - width - gap);
  var top = Math.min(Math.max(gap, rect.top), Math.max(gap, window.innerHeight - hoverCard.offsetHeight - gap));
  hoverCard.style.setProperty('--hover-left', left + 'px');
  hoverCard.style.setProperty('--hover-top', top + 'px');
}

function closeOpenSurvivorCards(container) {
  Array.prototype.forEach.call(container.querySelectorAll('.survivor-card.survivor-open'), function(openCard) {
    openCard.classList.remove('survivor-open');
  });
}

function initSurvivorCards(container) {
  if (!container) return;
  Array.prototype.forEach.call(container.querySelectorAll('.survivor-card'), function(card) {
    card.addEventListener('click', function(event) {
      if (event.target.closest('.survivor-action-btn')) return;
      var clickedHoverCard = !!event.target.closest('.survivor-hover-card');
      if (clickedHoverCard && window.innerWidth > 900) return;
      var willOpen = !card.classList.contains('survivor-open');
      closeOpenSurvivorCards(container);
      if (willOpen) {
        positionSurvivorHoverCard(card);
        card.classList.add('survivor-open');
        event.stopPropagation();
      }
    });
  });
  if (!container.dataset.survivorCardCloseBound) {
    document.addEventListener('click', function(event) {
      if (event.target.closest('#player-status .survivor-card')) return;
      closeOpenSurvivorCards(container);
    });
    window.addEventListener('resize', function() {
      var openCard = container.querySelector('.survivor-card.survivor-open');
      if (openCard) positionSurvivorHoverCard(openCard);
    });
    window.addEventListener('scroll', function() {
      var openCard = container.querySelector('.survivor-card.survivor-open');
      if (openCard) positionSurvivorHoverCard(openCard);
    }, true);
    container.dataset.survivorCardCloseBound = 'true';
  }
}

function renderDiscoveries() {
  document.getElementById('discoveries-list').innerHTML = (gameState.discoveries || []).map(function(id) {
    var def = getDiscoveryDef(id); var name = def ? def.name : id; return '<div class="log-entry info"><div class="log-text">' + icon('check') + ' ' + name + '</div></div>';
  }).join('');
}
function renderTabs() {
  if (isVoyageActive() && currentView !== 'sail') currentView = 'sail';
  Array.prototype.forEach.call(document.querySelectorAll('[data-view-tab]'), function(btn) {
    var tabView = btn.getAttribute('data-view-tab');
    btn.textContent = t('views.' + tabView, null, btn.textContent);
    btn.classList.toggle('hidden', isVoyageActive());
    btn.classList.toggle('active', tabView === currentView);
  });
  var camp = document.getElementById('camp-view');
  var expedition = document.getElementById('expedition-view');
  var raft = document.getElementById('raft-view');
  var sail = document.getElementById('sail-view');
  if (camp) camp.classList.toggle('hidden', currentView !== 'camp');
  if (expedition) expedition.classList.toggle('hidden', currentView !== 'expedition');
  if (raft) raft.classList.toggle('hidden', currentView !== 'raft');
  if (sail) sail.classList.toggle('hidden', currentView !== 'sail');
}
function renderStaticShell() {
  document.title = t('meta.pageTitle');
  document.getElementById('resources-heading').textContent = t('shell.resources');
  document.getElementById('fire-label').textContent = t('shell.fire') + ':';
  document.getElementById('camp-work-heading').textContent = t('shell.campWork');
  document.getElementById('crafting-heading').textContent = t('shell.crafting');
  document.getElementById('village-heading').textContent = t('shell.village');
  document.getElementById('survivors-heading').textContent = t('shell.survivors');
  document.getElementById('expedition-heading').textContent = t('shell.expedition');
  document.getElementById('raft-heading').textContent = t('shell.raftSite');
  document.getElementById('sail-heading').textContent = t('shell.atSea');
  document.getElementById('log-heading').textContent = t('shell.log');
  document.getElementById('discoveries-heading').textContent = t('shell.discoveries');
  document.getElementById('arrival-eyebrow').textContent = t('shell.arrivalEyebrow');
  document.getElementById('arrival-close').textContent = t('common.continue');
  document.getElementById('council-close').textContent = t('common.continue');
  document.getElementById('difficulty-toggle').title = t('topBar.difficultyTitle');
  document.getElementById('language-label').title = t('topBar.languageTitle');
  document.getElementById('save-btn').title = t('common.save');
  document.getElementById('load-btn').title = t('common.load');
  document.getElementById('new-btn').title = t('common.newGame');
  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-panel]'), function(btn) {
    btn.textContent = btn.closest('.panel-collapsible') && btn.closest('.panel-collapsible').classList.contains('is-collapsed') ? t('common.show') : t('common.hide');
  });
  var select = document.getElementById('language-select');
  if (select) {
    select.innerHTML = getLanguageOptionsMarkup();
    select.value = getLanguage();
  }
}
function renderSailingView() {
  var container = document.getElementById('sail-root');
  if (!container) return;
  var voyage = getVoyageState();
  if (!voyage.active && !voyage.completed) {
    container.innerHTML = '<div class="project-meta">' + getSailingLabel('locked') + '</div>';
    return;
  }
  var totalDays = voyage.totalDays || 30;
  var daysElapsed = voyage.daysElapsed || 0;
  var daysRemaining = Math.max(0, totalDays - daysElapsed);
  var percent = clamp((daysElapsed / Math.max(1, totalDays)) * 100, 0, 100);
  var html = '<div class="expedition-layout"><div class="expedition-card">';
  html += '<img class="expedition-hero" src="resources/raft/raft_sail.png" alt="' + t('shell.atSea') + '">';
  html += '<div class="project-name">' + getSailingLabel('openSea') + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('daysAtSea', { elapsed: daysElapsed, total: totalDays }) + '</div>';
  html += '<div class="project-progress"><div class="project-progress-fill" style="width:' + percent + '%"></div></div>';
  html += '<div class="project-meta">' + getSailingLabel('daysRemaining', { days: daysRemaining }) + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('aboard', { count: voyage.passengerCount || getAliveSurvivors().length }) + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('foodAboard', { amount: formatNumber(gameState.resources.food || 0) }) + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('waterAboard', { amount: formatNumber(gameState.resources.water || 0) }) + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('foodLost', { amount: formatNumber(voyage.foodLostOverboard || 0) }) + '</div>';
  html += '</div><div class="expedition-card">';
  html += '<div class="camp-column-title">' + getSailingLabel('journey') + '</div>';
  html += '<div class="project-meta">' + getSailingLabel('journeyText1') + '</div>';
  html += '<div class="project-meta" style="margin-top:10px;">' + getSailingLabel('journeyText2') + '</div>';
  html += '</div></div>';
  container.innerHTML = html;
}
function renderExpedition() {
  var container = document.getElementById('expedition-root');
  if (!container) return;
  var expedition = getExpedition();
  var status = getExpeditionRequirementStatus();
  var survivor = getExpeditionSurvivor();
  var html = '';
  if (!isExpeditionUnlocked()) {
    container.innerHTML = '<div class="project-meta">' + getExpeditionLabel('locked') + '</div>';
    return;
  }
  if (!expedition.active) {
    html += '<div class="expedition-card"><div class="project-name">' + getExpeditionLabel('startTitle') + '</div>';
    html += '<div class="project-meta">' + getExpeditionLabel('startRequirements') + '</div>';
    if (!status.ok) html += '<div class="project-meta" style="color:#f39c12;margin-top:8px;">' + status.missing.join(', ') + '</div>';
    html += '<div class="project-actions"><select class="project-select" id="expedition-survivor-select"><option value="">' + getExpeditionLabel('selectSurvivor') + '</option>';
    getAliveSurvivors().filter(function(s) {
      return s.state !== 'rest' && s.state !== 'away' && !s.activeProjectId;
    }).forEach(function(s) {
      html += '<option value="' + s.id + '">' + s.name + '</option>';
    });
    html += '</select><button class="project-btn" id="start-expedition-btn" ' + (!status.ok ? 'disabled' : '') + '>' + getExpeditionLabel('sendOut') + '</button></div></div>';
    container.innerHTML = html;
    var startBtn = document.getElementById('start-expedition-btn');
    if (startBtn) startBtn.onclick = function() {
      var select = document.getElementById('expedition-survivor-select');
      if (select && startExpedition(select.value)) render();
    };
    return;
  }
  var currentTile = getExpeditionTile(expedition, expedition.position.x, expedition.position.y);
  var image = getExpeditionTileImage(currentTile, true, { ignoreSurvivorMarker: true });
  var survivorName = getSurvivorDisplayName(survivor);
  html += '<div class="expedition-layout"><div class="expedition-card">';
  html += '<div class="expedition-map" style="grid-template-columns:repeat(' + expedition.map.width + ', 1fr);">';
  for (var y = 0; y < expedition.map.height; y++) {
    for (var x = 0; x < expedition.map.width; x++) {
      var visited = !!expedition.map.visited[tileKey(x, y)];
      var tile = getExpeditionTile(expedition, x, y);
      var tilePosKey = tileKey(x, y);
      var onAutoPath = (expedition.autoWalkPath || []).some(function(step) { return tileKey(step.x, step.y) === tilePosKey; });
      var onReturnPath = (expedition.returnPath || []).some(function(step) { return tileKey(step.x, step.y) === tilePosKey; });
      var clickableVisited = visited && !(x === expedition.position.x && y === expedition.position.y) && (expedition.returnTicksRemaining || 0) <= 0;
      var cls = 'map-tile' + (visited ? '' : ' unknown') + (x === expedition.position.x && y === expedition.position.y ? ' current' : '') + (clickableVisited ? ' clickable' : '') + ((onAutoPath || onReturnPath) ? ' route' : '');
      var bg = visited ? ' style="background-image:url(' + getExpeditionTileImage(tile, visited, { ignoreSurvivorMarker: x === expedition.position.x && y === expedition.position.y }) + ')"' : '';
      var badge = '';
      if (visited && tile.strandedSurvivor && !tile.leftBehind) badge = '<span class="map-tile-badge" title="' + getExpeditionLabel('waitingBadge') + '">!</span>';
      html += '<div class="' + cls + '"' + bg + (clickableVisited ? ' data-autowalk-x="' + x + '" data-autowalk-y="' + y + '"' : '') + '>' + badge + '</div>';
    }
  }
  html += '</div></div><div class="expedition-card">';
  html += '<img class="expedition-hero" src="' + image + '" alt="' + getExpeditionLabel('currentTileAlt') + '">';
  html += '<div class="project-name">' + (survivor ? survivorName : t('shell.expedition')) + '</div>';
  html += '<div class="project-meta">' + localizeNameMap('resources', 'food') + ' ' + formatPreciseNumber(expedition.supplies.food) + ' / ' + localizeNameMap('resources', 'water') + ' ' + formatPreciseNumber(expedition.supplies.water) + ' / ' + getExpeditionLabel('health') + ' ' + (survivor ? formatNumber(survivor.health) : '-') + ' / ' + getExpeditionLabel('energy') + ' ' + (survivor ? formatNumber(100 - survivor.fatigue) : '-') + '</div>';
  html += '<div class="project-meta">' + getExpeditionLabel('findings', { items: ((expedition.gear || {}).sword ? getExpeditionLabel('sword') + ' ' : '') + ((expedition.gear || {}).shield ? getExpeditionLabel('shield') : '') + (!((expedition.gear || {}).sword || (expedition.gear || {}).shield) ? getExpeditionLabel('noFindings') : '') }) + '</div>';
  if (expedition.escorting) html += '<div class="project-meta" style="color:#8ee08e;">' + getExpeditionLabel('escorting', { name: expedition.escorting.name, health: formatNumber(expedition.escorting.health) }) + '</div>';
  if (currentTile.strandedSurvivor) {
    html += '<div class="project-meta" style="color:#f1c40f;">' + getExpeditionLabel('waitingSurvivor', { name: currentTile.strandedSurvivor.name, health: formatNumber(currentTile.strandedSurvivor.health), background: ((getBackgroundDef(currentTile.strandedSurvivor.background) || {}).name || t('common.unknown')), suffix: currentTile.strandedSurvivor.leftBehind ? getExpeditionLabel('leftBehindSuffix') : '' }) + '</div>';
  }
  html += '<div class="project-meta">' + getExpeditionLabel('position', { x: expedition.position.x, y: expedition.position.y, pending: expedition.pendingCommand ? getExpeditionLabel('nextTick', { command: expedition.pendingCommand }) : '' }) + '</div>';
  html += '<div class="project-meta">' + getExpeditionLabel('retreat', { ticks: getExpeditionTravelTicksToCamp(expedition.position) }) + '</div>';
  if ((expedition.autoWalkPath || []).length > 0) html += '<div class="project-meta" style="color:#8ee08e;">' + getExpeditionLabel('autoWalk', { steps: expedition.autoWalkPath.length }) + '</div>';
  if ((expedition.returnTicksRemaining || 0) > 0) html += '<div class="project-meta" style="color:#8ee08e;">' + getExpeditionLabel('safeReturn', { ticks: expedition.returnTicksRemaining }) + '</div>';
  if ((expedition.restTicksRemaining || 0) > 0) html += '<div class="project-meta" style="color:#f1c40f;">' + getExpeditionLabel('resting', { hours: formatNumber(expedition.restTicksRemaining * tickFactor()) }) + '</div>';
  var movementDisabled = !survivor || (survivor.fatigue || 0) >= CONFIG.fatigueRestThreshold || (expedition.restTicksRemaining || 0) > 0 || (expedition.returnTicksRemaining || 0) > 0;
  var restDisabled = (expedition.restTicksRemaining || 0) > 0 || (expedition.returnTicksRemaining || 0) > 0;
  var disabledMove = movementDisabled ? ' disabled' : '';
  var disabledRest = restDisabled ? ' disabled' : '';
  if (expedition.foundCockpit) html += '<div class="project-meta" style="color:#8ee08e;">' + getExpeditionLabel('cockpitFound') + '</div>';
  html += '<div class="expedition-controls">';
  html += '<button class="project-btn" data-expedition-command="north"' + disabledMove + '>' + getExpeditionLabel('north') + '</button>';
  html += '<button class="project-btn" data-expedition-command="west"' + disabledMove + '>' + getExpeditionLabel('west') + '</button>';
  html += '<button class="project-btn" data-expedition-command="south"' + disabledMove + '>' + getExpeditionLabel('south') + '</button>';
  html += '<button class="project-btn" data-expedition-command="east"' + disabledMove + '>' + getExpeditionLabel('east') + '</button>';
  html += '</div><div class="project-actions">';
  html += '<button class="project-btn" data-expedition-command="rest"' + disabledRest + '>' + getExpeditionLabel('restAtFire') + '</button>';
  html += '<button class="project-btn" data-expedition-command="return">' + getExpeditionLabel('return') + '</button>';
  if (currentTile.feature === 'temple') html += '<button class="project-btn" id="investigate-temple-btn"' + (currentTile.templeExplored ? ' disabled' : '') + '>' + getExpeditionLabel('investigateTemple') + '</button>';
  if (currentTile.strandedSurvivor) {
    html += '<button class="project-btn" id="care-rescue-btn"' + ((expedition.restTicksRemaining || 0) > 0 ? ' disabled' : '') + '>' + getExpeditionLabel('careSurvivor') + '</button>';
    html += '<button class="project-btn" id="escort-rescue-btn"' + (((currentTile.strandedSurvivor.health || 0) < (getExpeditionConfig().escortMinHealth || 45) || expedition.escorting) ? ' disabled' : '') + '>' + getExpeditionLabel('escortToCamp') + '</button>';
  }
  html += '</div><div class="expedition-log">';
  (expedition.log || []).slice(0, 12).forEach(function(entry) {
    html += '<div class="log-entry info"><span class="log-time">' + entry.time + '</span><div class="log-text">' + entry.text + '</div></div>';
  });
  html += '</div></div></div>';
  container.innerHTML = html;
  Array.prototype.forEach.call(container.querySelectorAll('[data-expedition-command]'), function(btn) {
    btn.onclick = function() { queueExpeditionCommand(btn.getAttribute('data-expedition-command')); };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-autowalk-x]'), function(tileEl) {
    tileEl.onclick = function() {
      startExpeditionAutoWalk(parseInt(tileEl.getAttribute('data-autowalk-x'), 10), parseInt(tileEl.getAttribute('data-autowalk-y'), 10));
    };
  });
  var templeBtn = document.getElementById('investigate-temple-btn');
  if (templeBtn) templeBtn.onclick = investigateTemple;
  var careBtn = document.getElementById('care-rescue-btn');
  if (careBtn) careBtn.onclick = careForStrandedSurvivor;
  var escortBtn = document.getElementById('escort-rescue-btn');
  if (escortBtn) escortBtn.onclick = rescueStrandedSurvivor;
}
function renderRaftView() {
  var container = document.getElementById('raft-root');
  if (!container) return;
  if (!((gameState.world || {}).raftUnlocked)) {
    container.innerHTML = '<div class="project-meta">' + getRaftLabel('locked') + '</div>';
    return;
  }
  var summary = getRaftSummary();
  var departureReady = !!((gameState.world || {}).departureReady);
  var html = '<div class="expedition-layout"><div class="expedition-card">';
  html += '<img class="expedition-hero" src="' + (departureReady ? 'resources/raft/raft_departure.png' : 'resources/raft/raft_build.png') + '" alt="' + getRaftLabel('title') + '">';
  html += '<div class="project-name">' + getRaftLabel('title') + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('completion', { percent: formatNumber(summary.percent) }) + '</div>';
  html += '<div class="project-progress"><div class="project-progress-fill" style="width:' + clamp(summary.percent, 0, 100) + '%"></div></div>';
  html += '<div class="project-meta">' + getRaftLabel('survivorsToCarry', { count: summary.aliveCount }) + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('logs', { current: formatNumber(summary.currentLogs), required: formatNumber(summary.requiredLogs) }) + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('sail', { current: formatNumber(summary.currentSail), required: formatNumber(summary.requiredSail) }) + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('rig', { status: summary.currentRig >= 1 ? getRaftLabel('complete') : getRaftLabel('missing') }) + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('hut', { status: summary.currentHut >= 1 ? getRaftLabel('complete') : getRaftLabel('missing') }) + '</div>';
  html += '<div class="project-meta">' + getRaftLabel('supplies', { food: formatNumber(summary.currentFood), requiredFood: formatNumber(summary.requiredFood), water: formatNumber(summary.currentWater), requiredWater: formatNumber(summary.requiredWater), pots: formatNumber(summary.currentPots), requiredPots: formatNumber(summary.requiredPots) }) + '</div>';
  if (summary.ready) html += '<div class="project-meta" style="color:#8ee08e;">' + getRaftLabel('ready') + '</div>';
  if (departureReady) {
    html += '<div class="project-actions">';
    html += '<button class="project-btn" id="raft-wait-btn">' + getRaftLabel('waitMore') + '</button>';
    html += '<button class="project-btn" id="raft-sail-btn"' + (!summary.ready ? ' disabled' : '') + '>' + getRaftLabel('sailNow') + '</button>';
    html += '</div>';
    if (!summary.ready) html += '<div class="project-meta" style="margin-top:8px;color:#f39c12;">' + getRaftLabel('noLongerReady') + '</div>';
  }
  html += '</div><div class="expedition-card">';
  html += '<div class="camp-column-title">' + getRaftLabel('projectHeader') + '</div>';
  Object.keys(CONFIG.recipes).forEach(function(recipeId) {
    var recipe = CONFIG.recipes[recipeId];
    if ((recipe.workspace || 'camp') !== 'raft') return;
    var requirementStatus = getRecipeRequirementStatus(recipe);
    var available = requirementStatus.ok;
    var missingText = requirementStatus.missing.join(', ');
    html += '<div class="project-card">';
    html += '<div class="project-head"><div><div class="project-name">' + icon('craft') + ' ' + getRecipeName(recipeId) + '</div><div class="project-meta">' + getRecipeCostText(recipe) + ' &bull; ' + formatNumber(recipe.timeHours) + ' h</div></div>';
    html += '<button class="project-btn" data-start-raft-project="' + recipeId + '" title="' + (missingText || t('ui.startProject')) + '" ' + (!available ? 'disabled' : '') + '>' + t('common.start') + '</button></div>';
    if (missingText) html += '<div class="project-meta" style="margin-top:6px;color:#f39c12;">' + missingText + '</div>';
    html += '</div>';
  });
  var projects = getProjectsByWorkspace('raft');
  if (!projects.length) html += '<div class="project-meta">' + getRaftLabel('noProjects') + '</div>';
  projects.forEach(function(project) {
    var worker = getProjectWorker(project.id);
    var percent = projectProgressPercent(project);
    var remaining = Math.max(0, (project.requiredHours || 0) - (project.progressHours || 0));
    html += '<div class="project-card">';
    html += '<div class="project-head"><div><div class="project-name">' + project.name + '</div><div class="project-meta">' + formatNumber(project.progressHours) + '/' + formatNumber(project.requiredHours) + ' h &bull; ' + (worker ? worker.name : getRaftLabel('noAssignedWorker')) + '</div></div><div class="project-meta">' + t('common.hoursRemaining', { value: formatNumber(remaining) }) + '</div></div>';
    html += '<div class="project-progress"><div class="project-progress-fill" style="width:' + percent + '%"></div></div>';
    html += '<div class="project-actions"><select class="project-select" data-raft-project-worker="' + project.id + '"><option value="">' + t('common.workerSelect') + '</option>';
    getAvailableProjectWorkers().forEach(function(survivor) {
      var selected = worker && worker.id === survivor.id ? ' selected' : '';
      html += '<option value="' + survivor.id + '"' + selected + '>' + survivor.name + '</option>';
    });
    html += '</select>';
    if (worker) html += '<button class="project-btn" data-pause-raft-project="' + worker.id + '">' + t('common.pause') + '</button>';
    html += '</div></div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
  Array.prototype.forEach.call(container.querySelectorAll('[data-start-raft-project]'), function(btn) {
    btn.onclick = function() { if (startProject(btn.getAttribute('data-start-raft-project'))) render(); };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-raft-project-worker]'), function(select) {
    select.onchange = function() { if (this.value && assignProject(this.getAttribute('data-raft-project-worker'), this.value)) render(); };
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-pause-raft-project]'), function(btn) {
    btn.onclick = function() {
      var survivor = getAliveSurvivors().find(function(s) { return s.id === btn.getAttribute('data-pause-raft-project'); });
      if (survivor) {
        pauseActiveProject(survivor, false);
        survivor.assignedJob = 'philosophize';
        survivor.state = 'philosophize';
        render();
      }
    };
  });
  var waitBtn = document.getElementById('raft-wait-btn');
  if (waitBtn) waitBtn.onclick = function() {
    addLog(t('messages.savedWait'), 'info');
    render();
  };
  var sailBtn = document.getElementById('raft-sail-btn');
  if (sailBtn) sailBtn.onclick = function() {
    startVoyage();
  };
}
function renderVillage() {
  var container = document.getElementById('village-view');
  if (!container) return;
  var huts = Math.floor(gameState.resources.huts || 0);
  var fireLevel = getFireLevel();
  var effects = getVillageEffectSummary();
  var html = '<div class="village-scene">';
  html += '<div class="village-assets">';
  if (fireLevel > 0) html += renderAsset('resources/ui/fire_' + fireLevel + '.png', 'village-asset fire', icon('fire'));
  for (var i = 0; i < huts; i++) html += renderAsset('resources/ui/hut.png', 'village-asset', icon('hut'));
  if (fireLevel <= 0 && huts <= 0) html += '<div class="project-meta">' + t('ui.noBuildings') + '</div>';
  html += '</div>';
  html += '<div class="village-effects">';
  effects.forEach(function(effect) {
    html += '<div class="village-effect">' + effect.label + '<strong>' + effect.value + '</strong></div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}
function renderLogs() {
  document.getElementById('event-log').innerHTML = (gameState.logs || []).slice(0, 15).map(function(log) {
    return '<div class="log-entry ' + log.level + '"><span class="log-time">' + log.time + '</span><div class="log-text">' + log.text + '</div></div>';
  }).join('');
}
function render() { renderStaticShell(); renderTabs(); renderTopBar(); renderFire(); renderResources(); renderActions(); renderVillage(); renderPlayerStatus(); renderDiscoveries(); renderExpedition(); renderRaftView(); renderSailingView(); renderLogs(); checkExplorationCouncilActivation(); checkRaftCouncilActivation(); checkDepartureCouncilActivation(); }

function clearTimer() { if (tickInterval) { clearInterval(tickInterval); tickInterval = null; } }
function invalidateTickQueue() { tickGeneration += 1; clearTimer(); }
function renderNowAndSoon() {
  render();
}
function forceTickRefresh() {
  simulateTick();
  render();
}
function scheduleTickLoop(generation) {
  if (currentSpeed <= 0) return;
  tickInterval = setTimeout(function() {
    if (generation !== tickGeneration || currentSpeed <= 0) return;
    simulateTick();
    if (generation !== tickGeneration || currentSpeed <= 0) return;
    render();
    scheduleTickLoop(generation);
  }, CONFIG.speeds[currentSpeed]);
}
function togglePanel(panelId, button) {
  var panel = document.getElementById(panelId);
  if (!panel) return;
  var collapsed = panel.classList.toggle('is-collapsed');
  if (button) {
    button.textContent = collapsed ? t('common.show') : t('common.hide');
    button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}
function setSpeed(speed) {
  currentSpeed = speed;
  Array.prototype.forEach.call(document.querySelectorAll('.speed-btn'), function(btn){ btn.classList.toggle('active', parseInt(btn.dataset.speed, 10) === speed); });
  clearTimer();
  if (speed > 0) tickInterval = setInterval(processTickFrame, CONFIG.speeds[speed]);
}

async function init() {
  await loadGameData();
  newGame();
  renderStaticShell();
  var languageSelect = document.getElementById('language-select');
  if (languageSelect) {
      languageSelect.innerHTML = getLanguageOptionsMarkup();
      languageSelect.value = getLanguage();
      languageSelect.addEventListener('change', async function() {
        setLanguage(languageSelect.value);
        await loadGameData();
        syncPlayerDisplayName();
        renderStaticShell();
        render();
        processTickFrame();
        if (currentSpeed > 0) setSpeed(currentSpeed);
      });
    }
  document.getElementById('tick-btn').addEventListener('click', function(){ setSpeed(currentSpeed === 0 ? 1 : 0); });
  document.getElementById('save-btn').addEventListener('click', saveGame);
  document.getElementById('load-btn').addEventListener('click', loadGame);
  document.getElementById('new-btn').addEventListener('click', function(){ newGame(); setSpeed(1); });
  document.getElementById('arrival-close').addEventListener('click', hideArrivalCard);
  document.getElementById('arrival-overlay').addEventListener('click', function(event) {
    if (event.target === this) hideArrivalCard();
  });
  document.getElementById('council-close').addEventListener('click', hideExplorationCouncilCard);
  document.getElementById('council-overlay').addEventListener('click', function(event) {
    if (event.target === this) hideExplorationCouncilCard();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-panel]'), function(btn) {
    btn.addEventListener('click', function() {
      togglePanel(btn.getAttribute('data-toggle-panel'), btn);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-view-tab]'), function(btn) {
    btn.addEventListener('click', function() {
      if (isVoyageActive()) {
        currentView = 'sail';
        render();
        return;
      }
      currentView = btn.getAttribute('data-view-tab') || 'camp';
      render();
    });
  });
  document.getElementById('difficulty-toggle').addEventListener('click', cycleDifficulty);
  Array.prototype.forEach.call(document.querySelectorAll('.speed-btn'), function(btn){ btn.addEventListener('click', function(){ setSpeed(parseInt(btn.dataset.speed, 10)); }); });
  onLanguageChange(function() {
    renderStaticShell();
  });
  setSpeed(1);
}

init().catch(function(error) {
  console.error(error);
  var app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<main class="main-content"><section class="panel"><h2 class="panel-header">' + t('ui.loadingErrorTitle') + '</h2><p>' + t('ui.loadingErrorBody') + '</p></section></main>';
  }
});
