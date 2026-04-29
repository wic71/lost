const LANGUAGE_STORAGE_KEY = 'lost_language';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'se'];

const translations = {
  en: {
    meta: {
      htmlLang: 'en',
      pageTitle: 'LOST - Survivors',
      imageMissing: 'No image'
    },
    languages: {
      en: 'English',
      se: 'Svenska'
    },
    common: {
      show: 'Show',
      hide: 'Hide',
      continue: 'Continue',
      close: 'Close',
      start: 'Start',
      pause: 'Pause',
      save: 'Save',
      load: 'Load',
      newGame: 'New game',
      none: 'None',
      unknown: 'Unknown',
      yes: 'Yes',
      no: 'No',
      camp: 'Camp',
      expedition: 'Expedition',
      raft: 'Raft',
      atSea: 'At Sea',
      unassigned: 'Unassigned',
      assignedWorker: 'Assigned worker',
      workerSelect: 'Select worker',
      hoursRemaining: '{value} h left',
      healthShort: 'HP',
      fatigueShort: 'Fatigue',
      moraleShort: 'Morale'
    },
    topBar: {
      day: 'Day',
      time: 'Time',
      threat: 'Threat',
      morale: 'Morale',
      difficultyTitle: 'Change difficulty',
      languageTitle: 'Language'
    },
    shell: {
      resources: 'Resources',
      fire: 'Fire',
      campWork: 'Camp Work',
      crafting: 'Crafting',
      village: 'Our Village',
      survivors: 'Survivors',
      expedition: 'Expedition',
      raftSite: 'Raft Construction Site',
      atSea: 'At Sea',
      log: 'Log',
      discoveries: 'Discoveries',
      arrivalEyebrow: 'New Survivor',
      councilTitle: 'Council'
    },
    views: {
      camp: 'Camp',
      expedition: 'Expedition',
      raft: 'Raft'
    },
    difficulty: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard'
    },
    fireStatus: {
      out: 'Out',
      spark: 'Spark',
      small: 'Small',
      steady: 'Steady',
      large: 'Large',
      withFuel: '{status} ({current}/{max})'
    },
    resources: {
      logs: 'Firewood',
      food: 'Food',
      water: 'Water',
      tinder: 'Tinder',
      clay: 'Clay',
      bamboo: 'Bamboo',
      stone: 'Stone',
      fiber: 'Fiber',
      rope: 'Rope',
      leather: 'Leather',
      stone_knives: 'Stone knife',
      axes: 'Axe',
      timber: 'Timber',
      spears: 'Spear',
      nets: 'Net',
      backpacks: 'Backpack',
      huts: 'Hut',
      pots: 'Pot',
      glasses: 'Glasses'
    },
    resourceSections: {
      materials: 'Materials',
      equipment: 'Equipment',
      camp: 'Camp'
    },
    skills: {
      wood: 'Wood',
      food: 'Food',
      water: 'Water',
      care: 'Care',
      build: 'Build',
      guard: 'Guard',
      explore: 'Explore',
      fish: 'Fish',
      hunt: 'Hunt',
      timber: 'Timber',
      craft: 'Craft'
    },
    jobs: {
      philosophize: 'Reflect',
      wood: 'Gather firewood',
      food: 'Gather food',
      water: 'Gather water',
      fish: 'Fish',
      hunt: 'Hunt',
      guard: 'Guard',
      make_tinder: 'Make tinder',
      feed_fire: 'Feed the fire',
      clay: 'Gather clay',
      bamboo: 'Gather bamboo',
      timber: 'Cut timber',
      stone: 'Gather stone',
      fiber: 'Gather fiber',
      rest: 'Rest',
      care: 'Care'
    },
    recipeNames: {
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
    metricLabels: {
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
    metricLabels: {
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
    },
    messages: {
      councilExploration: 'Örådet samlas. Expeditioner är nu möjliga.',
      councilRaft: 'Örådet samlas igen. Nu börjar planeringen av flotten.',
      councilDeparture: 'Flotten är färdig. Gruppen samlas för det sista örådet före avfärd.',
      projectCannotStart: 'Kan inte starta {project}: {requirements}.',
      projectStarted: 'Projekt startat: {project}.',
      projectAssigned: '{name} arbetar nu med: {project}.',
      projectFinished: '{name} färdigställer: {project}.',
      intro1: 'Du vaknar på en strand. Huvudet dunkar.',
      intro2: 'Flygplanet. Det var flygplanet som störtade...',
      intro3: 'Skriken. Människor skrek, planet bröts sönder...',
      intro4: 'Passagerarna som föll ut, ner i havet. Kan jag vara den enda överlevaren?',
      intro5: 'Du reser dig upp och börjar planlöst gå längs stranden.',
      intro6: 'Du ser lite rök från djungeln. Troligen från krashen.',
      intro7: 'Efter en halvtimmes vandring hittar du en bäck och lite torr ved.',
      intro8: 'Bra plats för ett läger. Du har dina glasögon, kanske kan du tända en eld?',
      difficultyChanged: 'Svårighetsgrad: {difficulty}.',
      discovery: 'Upptäckt: {name}!',
      survivorNotInCamp: '{name} är inte i lägret just nu.',
      survivorOnExpedition: '{name} är ute på expedition.',
      survivorCannotStart: '{name} kan inte börja: {requirements}.',
      focusJobPlayer: 'Du fokuserar nu på: {job}.',
      focusJobSurvivor: '{name} får order: {job}.',
      setSurvivorJob: '{name} fokuserar nu på: {job}.',
      tinderOut: '{name} slutar göra tändved, veden är slut.',
      fireGone: '{name} slutar mata elden, den är slocknad.',
      fireGrows: '{name} får elden att växa till nivå {level}.',
      readyProjectResume: '{name} har vilat klart och fortsätter sitt projekt.',
      readyPhilosophize: '{name} har vilat klart och filosoferar nu.',
      awayReturn: '{name} återvänder till lägret, tyst och utmattad.',
      campBreakdown: '{name} bryter ihop och kan inte fortsätta arbeta. Vila, mat, vatten, eld och skydd blir viktigare nu.',
      hasDied: '{name} har dött.',
      mustRest: '{name} måste vila.',
      noNewSurvivor: 'Ingen ny överlevare syns till just nu.',
      signalFireStrong: 'Signalelden brinner starkt, men ingen syns ännu.',
      campConflictAway: '{name} får nog av lägret och försvinner bort från de andra en stund. Gruppen skakas av splittringen.',
      campConflictFight: 'Ett hårt bråk bryter ut i lägret. {name} blir skadad och moralen faller.',
      campConflictIrritation: 'Irritation sprider sig i lägret. {name} tappar moral.',
      fireOut: 'Elden har slocknat!',
      fireDrops: 'Elden sjunker till nivå {level}.',
      needTinder: 'Du behöver tändved.',
      needWoodForFire: 'Du behöver ved för att tända elden.',
      needGlassesOrEmbers: 'Du behöver glasögon eller glöd.',
      savedWait: 'Gruppen väljer att vänta lite till och hålla flotten klar för avfärd.',
      raftNotReady: 'Flotten är inte markerad som avfärdsklar ännu.',
      raftNoLongerReady: 'Flotten är inte längre fullt redo. Fyll på stockar, segel eller proviant innan ni seglar.',
      expeditionMustReturn: 'Expeditionen måste vara tillbaka i lägret innan ni seglar.',
      raftDeparture: 'Flotten lämnar stranden. Nu finns ingen väg tillbaka.',
      landSighted: 'Land i sikte. Flotten når äntligen hamn.'
    },
    messages: {
      intro1: 'Du vaknar på en strand. Huvudet dunkar.',
      intro2: 'Flygplanet. Det var flygplanet som störtade...',
      intro3: 'Skriken. Människor skrek, planet bröts sönder...',
      intro4: 'Passagerarna som föll ut, ner i havet. Kan jag vara den enda överlevaren?',
      intro5: 'Du reser dig upp och börjar planlöst gå längs stranden.',
      intro6: 'Du ser lite rök från djungeln. Troligen från krashen.',
      intro7: 'Efter en halvtimmes vandring hittar du en bäck och lite torr ved.',
      intro8: 'Bra plats för ett läger. Du har dina glasögon, kanske kan du tända en eld?',
      difficultyChanged: 'Svårighetsgrad: {difficulty}.',
      discovery: 'Upptäckt: {name}!',
      survivorNotInCamp: '{name} är inte i lägret just nu.',
      survivorOnExpedition: '{name} är ute på expedition.',
      survivorCannotStart: '{name} kan inte börja: {requirements}.',
      focusJobPlayer: 'Du fokuserar nu på: {job}.',
      focusJobSurvivor: '{name} får order: {job}.',
      setSurvivorJob: '{name} fokuserar nu på: {job}.',
      projectCannotStart: 'Kan inte starta {project}: {requirements}.',
      projectStarted: 'Projekt startat: {project}.',
      projectAssigned: '{name} arbetar nu med: {project}.',
      projectFinished: '{name} färdigställer: {project}.',
      councilExploration: 'Örådet samlas. Expeditioner är nu möjliga.',
      councilRaft: 'Örådet samlas igen. Nu börjar planeringen av flotten.',
      councilDeparture: 'Flotten är färdig. Gruppen samlas för det sista örådet före avfärd.',
      fireOut: 'Elden har slocknat!',
      fireDrops: 'Elden sjunker till nivå {level}.',
      needTinder: 'Du behöver tändved.',
      needWoodForFire: 'Du behöver ved för att tända elden.',
      needGlassesOrEmbers: 'Du behöver glasögon eller glöd.',
      savedWait: 'Gruppen väljer att vänta lite till och hålla flotten klar för avfärd.',
      noNewSurvivor: 'Ingen ny överlevare syns till just nu.',
      signalFireStrong: 'Signalelden brinner starkt, men ingen syns ännu.',
      campBreakdown: '{name} bryter ihop och kan inte fortsätta arbeta. Vila, mat, vatten, eld och skydd blir viktigare nu.',
      mustRest: '{name} måste vila.',
      hasDied: '{name} har dött.',
      readyProjectResume: '{name} har vilat klart och fortsätter sitt projekt.',
      readyPhilosophize: '{name} har vilat klart och filosoferar nu.',
      awayReturn: '{name} återvänder till lägret, tyst och utmattad.',
      tinderOut: '{name} slutar göra tändved, veden är slut.',
      fireGone: '{name} slutar mata elden, den är slocknad.',
      fireGrows: '{name} får elden att växa till nivå {level}.',
      raftNotReady: 'Flotten är inte markerad som avfärdsklar ännu.',
      raftNoLongerReady: 'Flotten är inte längre fullt redo. Fyll på stockar, segel eller proviant innan ni seglar.',
      expeditionMustReturn: 'Expeditionen måste vara tillbaka i lägret innan ni seglar.',
      raftDeparture: 'Flotten lämnar stranden. Nu finns ingen väg tillbaka.',
      landSighted: 'Land i sikte. Flotten når äntligen hamn.',
      campConflictAway: '{name} får nog av lägret och försvinner bort från de andra en stund. Gruppen skakas av splittringen.',
      campConflictFight: 'Ett hårt bråk bryter ut i lägret. {name} blir skadad och moralen faller.',
      campConflictIrritation: 'Irritation sprider sig i lägret. {name} tappar moral.'
    },
    statuses: {
      awayCamp: 'Borta från lägret ({hours} h kvar)',
      expedition: 'Expedition',
      restTime: '{base} ({hours} h kvar)',
      careTarget: '{base} -> {target}',
      noAssignedWorker: 'Ingen tilldelad arbetare'
    },
    sailing: {
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
    },
    expedition: {
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
      waitingBadge: 'Väntande överlevare'
    },
    ui: {
      projectsIntro: 'Choose a project to begin. Materials are taken from your stockpile when the project starts. Assign people to work until it is complete.',
      ongoingProjects: 'Ongoing Projects',
      noProjects: 'No projects yet.',
      startProject: 'Start project',
      startProjectShort: 'Start',
      noSurvivors: 'No survivors...',
      health: 'Health',
      satiety: 'Satiety',
      hydration: 'Hydration',
      energy: 'Energy',
      morale: 'Morale',
      newSurvivor: 'New survivor',
      newSurvivorText: 'A new survivor has reached camp.',
      survivorAtCamp: 'Survivors',
      phase2: 'Phase 2',
      phase3: 'Phase 3',
      departure: 'Departure',
      homecoming: 'Homecoming',
      event: 'Event',
      saveSuccess: 'Game saved.',
      loadSuccess: 'Game loaded.',
      noBuildings: 'No buildings yet. Build huts and keep the fire alive to watch the village grow.',
      loadingErrorTitle: 'Could not load game data',
      loadingErrorBody: 'Make sure the page is running from a local web server and that the JSON files in <code>resources/</code> can be read.'
    },
    requirements: {
      discovery: 'Requires discovery: {id}',
      missingResource: 'Missing {amount} {resource}',
      requiresResource: 'Requires {resource}',
      noFreeTool: 'No free {resource}'
    },
    expeditionRequirements: {
      councilFirst: 'The council must be held first',
      freeSpear: 'Requires a free spear',
      freeBackpack: 'Requires a free backpack'
    },
    inventory: {
      free: 'free',
      used: 'used'
    },
    statuses: {
      awayCamp: 'Away from camp ({hours} h left)',
      expedition: 'Expedition',
      restTime: '{base} ({hours} h left)',
      careTarget: '{base} → {target}',
      noAssignedWorker: 'No assigned worker'
    },
    camp: {
      hutsTitle: 'Huts improve rest and morale and protect food during storms. Capacity: {covered}/{alive} places ({coverage}% coverage).'
    },
    sailing: {
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
    expedition: {
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
      waitingBadge: 'Waiting survivor'
    },
    raft: {
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
      noProjects: 'No raft projects yet.'
    },
    councils: {
      exploration: {
        title: 'Council',
        subtitle: 'Expeditions can be planned',
        text: 'The group gathers around the fire. Pots can carry water, backpacks can carry gear, tinder can keep fire alive on the road, and spears can keep danger away. It is time to stop merely surviving in camp and start exploring the island.',
        button: 'Open phase 2'
      },
      raft: {
        title: 'Council',
        subtitle: 'The raft must be built',
        text: 'Now the group has a map and compass. The next step is to plan a raft large enough for everyone, with sail, rigging, shelter, and supplies for a long journey.',
        button: 'Open phase 3'
      },
      departure: {
        title: 'Council',
        subtitle: 'It is time to decide',
        text: 'The raft is finished. The group must now choose whether to sail immediately or wait and try to find more survivors before departure.',
        button: 'To the raft site'
      }
    },
    backgrounds: {
      builder: { name: 'Construction worker', description: 'Experienced in construction and heavy labor.', specialEffect: 'Building projects have 10% less risk of failure.' },
      nurse: { name: 'Nurse', description: 'Medical training and experience.', specialEffect: 'Reduces the risk of illness getting worse.' },
      hunter: { name: 'Hunter', description: 'Experienced hunter and forager.', specialEffect: 'Better trap outcomes and a higher chance to spot threats.' },
      fisher: { name: 'Fisher', description: 'Used to coastal work and fishing gear.', specialEffect: 'Bonus to coastal resource gathering.' },
      mechanic: { name: 'Mechanic', description: 'Technical background and good at solving problems.', specialEffect: 'Higher chance to get extra use out of wreckage.' },
      cook: { name: 'Cook', description: 'Culinary experience and used to making ingredients stretch.', specialEffect: 'Reduces food waste and improves morale.' },
      teacher: { name: 'Teacher', description: 'Pedagogical experience and calm under pressure.', specialEffect: 'Small passive bonus to group morale.' },
      soldier: { name: 'Soldier', description: 'Military background focused on safety and discipline.', specialEffect: 'Reduces panic during attacks.' },
      office_worker: { name: 'Office worker', description: 'Careful, but not used to hard physical labor.', specialEffect: 'Lower risk of mistakes in delicate jobs.' },
      student: { name: 'Student', description: 'Young, adaptable, and quick to learn.', specialEffect: 'Learns faster, gains a small random talent bonus, and has a much easier time coming up with new ideas.' },
      parent: { name: 'Parent', description: 'Used to caring for others and staying calm.', specialEffect: 'Bonus to the group’s recovery under stress.' },
      carpenter: { name: 'Carpenter', description: 'Precision craftsperson with a feel for construction.', specialEffect: 'More efficient at smaller construction tasks.' },
      guard: { name: 'Guard', description: 'Former security guard with an eye for camp safety.', specialEffect: 'Stronger during night watch.' },
      athlete: { name: 'Athlete', description: 'Physically fit and quick.', specialEffect: 'Gets exhausted more slowly.' },
      retired_nurse: { name: 'Retired medic', description: 'Experienced but older, strong at care but weaker in heavy labor.', specialEffect: 'Extra strong in care but weaker in hard labor.' },
      tour_guide: { name: 'Tour guide', description: 'Used to navigation, leadership, and reading terrain.', specialEffect: 'Lower risk of expeditions getting lost.' },
      nature_lover: { name: 'Nature lover', description: 'Knowledge of plants, nature, and patience.', specialEffect: 'Higher chance of finding herbs.' },
      driver: { name: 'Driver', description: 'Practical and persistent, used to holding focus for a long time.', specialEffect: 'Slightly better at transport and long assignments.' },
      cleaner: { name: 'Cleaner', description: 'Service experience focused on hygiene and order.', specialEffect: 'Reduces disease pressure.' },
      none: { name: 'Economist', description: 'Careful and patient.', specialEffect: 'Small bonus on work that requires accuracy and organization.' }
    },
    traits: {
      strong: { name: 'Strong', description: 'Better at heavy tasks.' },
      brave: { name: 'Brave', description: 'Less panic during attacks.' },
      careful: { name: 'Careful', description: 'Fewer mistakes in delicate jobs.' },
      enduring: { name: 'Enduring', description: 'Fatigue builds more slowly.' },
      empathetic: { name: 'Empathetic', description: 'Bonus to the recovery of others.' },
      fast: { name: 'Quick', description: 'Reacts better to sudden events.' },
      practical: { name: 'Practical', description: 'A good all-round trait.' },
      optimistic: { name: 'Optimistic', description: 'Small morale bonus.' },
      fit: { name: 'Fit', description: 'Physically strong and resilient.' },
      calm: { name: 'Calm in crisis', description: 'Smaller penalties during disasters.' },
      nervous: { name: 'Easily stressed', description: 'Worse during night attacks and disease outbreaks.' },
      clumsy: { name: 'Clumsy', description: 'Higher risk of minor injuries and failures.' },
      lazy: { name: 'Lazy', description: 'Loses efficiency faster.' },
      fearful: { name: 'Fearful', description: 'Greater risk of panic.' },
      fragile: { name: 'Fragile', description: 'Gets injured more easily.' },
      careless: { name: 'Careless', description: 'Greater risk of failed tasks.' },
      stubborn: { name: 'Stubborn', description: 'Higher risk of internal conflict.' },
      selfish: { name: 'Selfish', description: 'Negative impact on group morale.' }
    },
    discoveries: {
      fire_building: { name: 'Fire handling' },
      clay: { name: 'Clay', logIdeas: ['{name} comes up with an idea. We can gather clay by the stream.'], logArrival: ['{name} arrives at camp with clay from the stream.'] },
      stone: { name: 'Stone', logIdeas: ['{name} has an idea. We should gather better stone for tools.'], logArrival: ['{name} shows sharp stone from the beach.'] },
      bamboo: { name: 'Bamboo', logIdeas: ['{name} has an idea. There is bamboo farther away that we can use if we have something to cut it with.'], logArrival: ['{name} talks about bamboo deeper on the island.'] },
      stone_knife: { name: 'Stone knife', logIdeas: ['{name} shows how sharp stone can be tied to a simple handle. We can make stone knives.'], logArrival: ['{name} recognizes good stone for simple knives.'] },
      rope: { name: 'Rope', logIdeas: ['{name} tests twisting fibers into rope. It holds better than expected.'], logArrival: ['{name} knows how to twist stronger rope from fibers.'] },
      spear: { name: 'Spear', logIdeas: ['{name} suggests binding sharp stone to straight branches. Spears can protect the camp.'], logArrival: ['{name} has made simple spears before.'] },
      net: { name: 'Net', logIdeas: ['{name} gets the idea to tie fibers into a simple fishing net.'], logArrival: ['{name} knows the basics of tying nets.'] },
      pots: { name: 'Pots', logIdeas: ['{name} has an idea. We can fire clay into pots.'], logArrival: ['{name} knows how to fire clay into pots.'] },
      hut_building: { name: 'Hut building', logIdeas: ['{name} has an idea. Clay and bamboo can become walls and roofs.'], logArrival: ['{name} has built simple shelters from clay and bamboo before.'] },
      axe: { name: 'Axe', logIdeas: ['{name} sketches a heavier stone tool. With an axe we can cut timber.'], logArrival: ['{name} knows how to attach a stone head to a simple axe.'] },
      backpack: { name: 'Backpack', logIdeas: ['{name} suggests that leather and rope can become simple backpacks.'], logArrival: ['{name} has repaired and sewn bags before.'] }
    },
    events: {
      spawnFromFire: {
        successLog: '{name} finds the camp thanks to the great fire.',
        waitingLog: 'The signal fire burns strong, but no one can be seen yet.'
      },
      animalAttack: {
        log: 'Wild animals attack. {name} is injured.',
        guardRepelLog: '{guards} keep the animals away from camp.'
      },
      rats: {
        log: 'Rats get into the food and eat {amount} food.'
      },
      storm: {
        log: 'A storm lashes the camp and destroys {amount} food and {water} water.',
        shelterLog: 'The huts protect some of the food and water from the storm.'
      }
    },
    messages: {
      intro1: 'You wake up on a beach. Your head is pounding.',
      intro2: 'The airplane. It was the airplane that crashed...',
      intro3: 'The screams. People were screaming, the plane broke apart...',
      intro4: 'Passengers falling out into the sea. Could I be the only survivor?',
      intro5: 'You get to your feet and begin wandering aimlessly along the beach.',
      intro6: 'You see a little smoke from the jungle. Probably from the crash.',
      intro7: 'After half an hour of walking, you find a stream and some dry wood.',
      intro8: 'A good spot for a camp. You still have your glasses. Maybe you can start a fire?',
      difficultyChanged: 'Difficulty: {difficulty}.',
      discovery: 'Discovery: {name}!',
      survivorNotInCamp: '{name} is not in camp right now.',
      survivorOnExpedition: '{name} is out on expedition.',
      survivorCannotStart: '{name} cannot begin: {requirements}.',
      focusJobPlayer: 'You now focus on: {job}.',
      focusJobSurvivor: '{name} receives orders: {job}.',
      setSurvivorJob: '{name} now focuses on: {job}.',
      projectCannotStart: 'Cannot start {project}: {requirements}.',
      projectStarted: 'Project started: {project}.',
      projectAssigned: '{name} is now working on: {project}.',
      projectFinished: '{name} completes: {project}.',
      expeditionSelectSurvivor: 'Select an available survivor for the expedition.',
      expeditionCannotStart: 'The expedition cannot start: {requirements}.',
      expeditionEnterJungle: '{name} heads into the jungle.',
      expeditionReturn: 'The expedition returns to camp.',
      rescuedReturn: '{name} is brought safely back to camp from the jungle.',
      councilExploration: 'The council gathers. Expeditions are now possible.',
      councilRaft: 'The council gathers again. Planning for the raft now begins.',
      councilDeparture: 'The raft is finished. The group gathers for the final council before departure.',
      fireOut: 'The fire has gone out!',
      fireDrops: 'The fire drops to level {level}.',
      needTinder: 'You need tinder.',
      needWoodForFire: 'You need wood to light the fire.',
      needGlassesOrEmbers: 'You need glasses or embers.',
      savedWait: 'The group chooses to wait a little longer and keep the raft ready for departure.',
      noNewSurvivor: 'No new survivor appears right now.',
      signalFireStrong: 'The signal fire burns strong, but no one is visible yet.',
      campBreakdown: '{name} breaks down and cannot keep working. Rest, food, water, fire, and shelter matter more now.',
      mustRest: '{name} must rest.',
      hasDied: '{name} has died.',
      readyProjectResume: '{name} has finished resting and continues the project.',
      readyPhilosophize: '{name} has finished resting and is now reflecting.',
      awayReturn: '{name} returns to camp, quiet and exhausted.',
      tinderOut: '{name} stops making tinder. The wood is gone.',
      fireGone: '{name} stops feeding the fire. It has gone out.',
      fireGrows: '{name} makes the fire grow to level {level}.',
      fireWave: 'A wave crashes over the raft and some food is lost at sea.',
      fireRat: 'A rat has somehow gotten aboard and gnawed into the food stores.',
      voyageDay: 'Day {day} at sea. Supplies shrink as the raft drifts onward.',
      landSighted: 'Land in sight. The raft finally reaches harbor.',
      raftNotReady: 'The raft is not marked as ready for departure yet.',
      raftNoLongerReady: 'The raft is no longer fully ready. Refill logs, sail, or provisions before sailing.',
      expeditionMustReturn: 'The expedition must be back in camp before you sail.',
      raftDeparture: 'The raft leaves the beach. There is no way back now.',
      playerHealthy: 'Healthy',
      phaseDepartureChoice: 'It is time to choose',
      expeditionReachedGoal: 'The Expedition Has Reached Its Goal',
      autowalkDone: 'Auto-walk complete',
      breakthrough: 'Breakthrough',
      expeditionReturns: 'The Expedition Returns',
      survivorReturns: 'A survivor comes back with the expedition',
      campReceivesExpedition: 'The camp receives the expedition',
      harborReached: 'You Reach Harbor',
      daysAtSeaOver: 'Thirty days at sea are over',
      everyoneSaved: 'Everyone was rescued',
      aftermath: 'Aftermath and grief'
    }
  },
  se: {
    meta: {
      htmlLang: 'sv',
      pageTitle: 'LOST - Survivors',
      imageMissing: 'Ingen bild'
    },
    languages: {
      en: 'English',
      se: 'Svenska'
    },
    common: {
      show: 'Visa',
      hide: 'Dölj',
      continue: 'Fortsätt',
      close: 'Stäng',
      start: 'Starta',
      pause: 'Pausa',
      save: 'Spara',
      load: 'Ladda',
      newGame: 'Nytt spel',
      none: 'Inga',
      unknown: 'Okänd',
      yes: 'Ja',
      no: 'Nej',
      camp: 'Läger',
      expedition: 'Expedition',
      raft: 'Flotte',
      atSea: 'Till havs',
      unassigned: 'Ingen tilldelad',
      assignedWorker: 'Tilldelad arbetare',
      workerSelect: 'Välj arbetare',
      hoursRemaining: '{value} h kvar',
      healthShort: 'H',
      fatigueShort: 'U',
      moraleShort: 'M'
    },
    topBar: {
      day: 'Dag',
      time: 'Tid',
      threat: 'Hot',
      morale: 'Moral',
      difficultyTitle: 'Byt svårighetsgrad',
      languageTitle: 'Språk'
    },
    shell: {
      resources: 'Resurser',
      fire: 'Eld',
      campWork: 'Lägrets arbete',
      crafting: 'Tillverkning',
      village: 'Vår by',
      survivors: 'Överlevare',
      expedition: 'Expedition',
      raftSite: 'Flottens Byggplats',
      atSea: 'Till Havs',
      log: 'Logg',
      discoveries: 'Upptäckter',
      arrivalEyebrow: 'Ny Överlevare',
      councilTitle: 'Öråd'
    },
    views: {
      camp: 'Läger',
      expedition: 'Expedition',
      raft: 'Flotten'
    },
    difficulty: {
      easy: 'Lätt',
      normal: 'Normal',
      hard: 'Hård'
    },
    fireStatus: {
      out: 'Slocknad',
      spark: 'Gnista',
      small: 'Liten',
      steady: 'Stadig',
      large: 'Stor',
      withFuel: '{status} ({current}/{max})'
    },
    resources: {
      logs: 'Ved',
      food: 'Mat',
      water: 'Vatten',
      tinder: 'Tändved',
      clay: 'Lera',
      bamboo: 'Bambu',
      stone: 'Sten',
      fiber: 'Fiber',
      rope: 'Rep',
      leather: 'Läder',
      stone_knives: 'Stenkniv',
      axes: 'Yxa',
      timber: 'Timmer',
      spears: 'Spjut',
      nets: 'Nät',
      backpacks: 'Ryggsäck',
      huts: 'Hus',
      pots: 'Krukor',
      glasses: 'Glasögon'
    },
    inventory: {
      free: 'ledig',
      used: 'används'
    },
    resourceSections: {
      materials: 'Basmaterial',
      equipment: 'Utrustning',
      camp: 'Läger'
    },
    skills: {
      wood: 'Ved',
      food: 'Mat',
      water: 'Vatten',
      care: 'Vård',
      build: 'Bygga',
      guard: 'Vakta',
      explore: 'Utforska',
      fish: 'Fiska',
      hunt: 'Jaga',
      timber: 'Timmer',
      craft: 'Hantverk'
    },
    jobs: {
      philosophize: 'Filosoferar',
      wood: 'Samla ved',
      food: 'Samla mat',
      water: 'Samla vatten',
      fish: 'Fiska',
      hunt: 'Jaga',
      guard: 'Vakta',
      make_tinder: 'Gör tändved',
      feed_fire: 'Lägg på ved',
      clay: 'Samla lera',
      bamboo: 'Samla bambu',
      timber: 'Hugg timmer',
      stone: 'Samla sten',
      fiber: 'Samla fibrer',
      rest: 'Vila',
      care: 'Vårda'
    },
    ui: {
      projectsIntro: 'Välj ett projekt du vill genomföra. Resurser tas från ert lager av basmaterial när projektet startas. Tilldela personer på arbetet tills det är klart.',
      ongoingProjects: 'Pågående projekt',
      noProjects: 'Inga projekt ännu.',
      startProject: 'Starta projekt',
      noSurvivors: 'Inga överlevare...',
      health: 'Hälsa',
      satiety: 'Mättnad',
      hydration: 'Vätska',
      energy: 'Energi',
      morale: 'Moral',
      newSurvivor: 'Ny överlevare',
      newSurvivorText: 'En ny överlevare har nått lägret.',
      phase2: 'Fas 2',
      phase3: 'Fas 3',
      departure: 'Avfärd',
      homecoming: 'Hemkomst',
      event: 'Händelse',
      saveSuccess: 'Spelet sparades.',
      loadSuccess: 'Spelet laddades.',
      noBuildings: 'Inga byggnader ännu. Bygg hus och håll elden vid liv för att se byn växa.',
      loadingErrorTitle: 'Kunde inte ladda speldatan',
      loadingErrorBody: 'Kontrollera att sidan körs via en lokal webbserver och att JSON-filerna i <code>resources/</code> går att läsa.'
    }
  }
};

const seMessageOverrides = {
  intro1: 'Du vaknar på en strand. Huvudet dunkar.',
  intro2: 'Flygplanet. Det var flygplanet som störtade...',
  intro3: 'Skriken. Människor skrek, planet bröts sönder...',
  intro4: 'Passagerarna som föll ut, ner i havet. Kan jag vara den enda överlevaren?',
  intro5: 'Du reser dig upp och börjar planlöst gå längs stranden.',
  intro6: 'Du ser lite rök från djungeln. Troligen från krashen.',
  intro7: 'Efter en halvtimmes vandring hittar du en bäck och lite torr ved.',
  intro8: 'Bra plats för ett läger. Du har dina glasögon, kanske kan du tända en eld?',
  difficultyChanged: 'Svårighetsgrad: {difficulty}.',
  discovery: 'Upptäckt: {name}!',
  survivorNotInCamp: '{name} är inte i lägret just nu.',
  survivorOnExpedition: '{name} är ute på expedition.',
  survivorCannotStart: '{name} kan inte börja: {requirements}.',
  focusJobPlayer: 'Du fokuserar nu på: {job}.',
  focusJobSurvivor: '{name} får order: {job}.',
  setSurvivorJob: '{name} fokuserar nu på: {job}.',
  projectCannotStart: 'Kan inte starta {project}: {requirements}.',
  projectStarted: 'Projekt startat: {project}.',
  projectAssigned: '{name} arbetar nu med: {project}.',
  projectFinished: '{name} färdigställer: {project}.',
  councilExploration: 'Örådet samlas. Expeditioner är nu möjliga.',
  councilRaft: 'Örådet samlas igen. Nu börjar planeringen av flotten.',
  councilDeparture: 'Flotten är färdig. Gruppen samlas för det sista örådet före avfärd.',
  fireOut: 'Elden har slocknat!',
  fireDrops: 'Elden sjunker till nivå {level}.',
  needTinder: 'Du behöver tändved.',
  needWoodForFire: 'Du behöver ved för att tända elden.',
  needGlassesOrEmbers: 'Du behöver glasögon eller glöd.',
  savedWait: 'Gruppen väljer att vänta lite till och hålla flotten klar för avfärd.',
  noNewSurvivor: 'Ingen ny överlevare syns till just nu.',
  signalFireStrong: 'Signalelden brinner starkt, men ingen syns ännu.',
  campBreakdown: '{name} bryter ihop och kan inte fortsätta arbeta. Vila, mat, vatten, eld och skydd blir viktigare nu.',
  mustRest: '{name} måste vila.',
  hasDied: '{name} har dött.',
  readyProjectResume: '{name} har vilat klart och fortsätter sitt projekt.',
  readyPhilosophize: '{name} har vilat klart och filosoferar nu.',
  awayReturn: '{name} återvänder till lägret, tyst och utmattad.',
  tinderOut: '{name} slutar göra tändved, veden är slut.',
  fireGone: '{name} slutar mata elden, den är slocknad.',
  fireGrows: '{name} får elden att växa till nivå {level}.',
  raftNotReady: 'Flotten är inte markerad som avfärdsklar ännu.',
  raftNoLongerReady: 'Flotten är inte längre fullt redo. Fyll på stockar, segel eller proviant innan ni seglar.',
  expeditionMustReturn: 'Expeditionen måste vara tillbaka i lägret innan ni seglar.',
  raftDeparture: 'Flotten lämnar stranden. Nu finns ingen väg tillbaka.',
  landSighted: 'Land i sikte. Flotten når äntligen hamn.',
  campConflictAway: '{name} får nog av lägret och försvinner bort från de andra en stund. Gruppen skakas av splittringen.',
  campConflictFight: 'Ett hårt bråk bryter ut i lägret. {name} blir skadad och moralen faller.',
  campConflictIrritation: 'Irritation sprider sig i lägret. {name} tappar moral.'
};

let activeLanguage = readStoredLanguage();
const listeners = [];

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.indexOf(stored) >= 0 ? stored : DEFAULT_LANGUAGE;
  } catch (error) {
    return DEFAULT_LANGUAGE;
  }
}

function getFromObject(object, path) {
  return String(path || '').split('.').reduce(function(result, key) {
    return result && result[key] !== undefined ? result[key] : undefined;
  }, object);
}

function interpolate(template, params) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{([^}]+)\}/g, function(_, key) {
    return params && params[key] !== undefined ? params[key] : '{' + key + '}';
  });
}

export function getLanguage() {
  return activeLanguage;
}

export function getDefaultLanguage() {
  return DEFAULT_LANGUAGE;
}

export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES.slice();
}

export function getLanguageLabel(languageCode) {
  return t('languages.' + languageCode, null, languageCode);
}

export function t(path, params, fallback) {
  let value = getFromObject(translations[activeLanguage], path);
  if (value === undefined && activeLanguage === 'se' && String(path || '').indexOf('messages.') === 0) {
    value = seMessageOverrides[String(path).slice('messages.'.length)];
  }
  if (value === undefined) value = getFromObject(translations[DEFAULT_LANGUAGE], path);
  if (value === undefined) value = fallback !== undefined ? fallback : path;
  return typeof value === 'string' ? interpolate(value, params) : value;
}

export function tArray(path, fallback) {
  let value = getFromObject(translations[activeLanguage], path);
  if (!Array.isArray(value)) value = getFromObject(translations[DEFAULT_LANGUAGE], path);
  if (Array.isArray(value)) return value.slice();
  return Array.isArray(fallback) ? fallback.slice() : [];
}

export function setLanguage(languageCode) {
  const nextLanguage = SUPPORTED_LANGUAGES.indexOf(languageCode) >= 0 ? languageCode : DEFAULT_LANGUAGE;
  activeLanguage = nextLanguage;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  } catch (error) {
    // Ignore storage failures.
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = t('meta.htmlLang', null, nextLanguage);
  }
  listeners.slice().forEach(function(listener) { listener(nextLanguage); });
}

export function onLanguageChange(listener) {
  listeners.push(listener);
  return function() {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}

if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.lang = t('meta.htmlLang', null, activeLanguage);
}
