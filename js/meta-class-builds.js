/* AQW Companion — curated current 2026 endgame builds, not a global tier ranking.
 * Sources: linked community guides + official class wiki. No user/account data.
 * Read-only module; the current app imports this before its legacy inline script.
 */
(function(root,factory) {
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.AQWCMetaBuilds=api;
})(typeof window!=="undefined"?window:null,function() {
  "use strict";
  const curated={
  "Chrono ShadowHunter": {
    "category": "Meta DPS · calendar",
    "source": "https://www.aqwhub.com/other-guides/choosing-a-chronomancer/",
    "guide": "https://aqwwiki.wikidot.com/chrono-shadowhunter",
    "base": "Lucky",
    "modes": {
      "solo": {
        "weapon": "Ravenous",
        "helm": "Vim",
        "cape": "Lament",
        "alternative": "Valiance with Forge helm for safer / high-ping play",
        "note": "Fast single-target chrono DPS. Active shots, six-round reload and latency affect performance; dodge rotation needs practice."
      },
      "farm": {
        "weapon": "Valiance",
        "helm": "Vim",
        "cape": "Lament",
        "alternative": "Dedicated multi-target farming: Kathool Adept, ArchMage or Arcana Invoker",
        "note": "Fast for repeatedly killing individual targets, NOT a true AoE farmer. Use 3/4 and reload; avoid treating the single-target nuke as multi-target."
      },
      "group": {
        "weapon": "Arcana's Concerto",
        "helm": "Forge",
        "cape": "Penitence",
        "alternative": "Valiance if another party member already carries Arcana; Ravenous + Lament for safe damage races",
        "note": "High-risk Ultra DPS: use boss-specific survivability. Do not assume fragile Vim/Lament solo setup works on lethal Ultras."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Phantasm Chronomancer": {
    "category": "Meta solo / Ultra DPS · calendar",
    "source": "https://www.reddit.com/r/AQW/comments/1nrkvts",
    "guide": "https://aqwwiki.wikidot.com/phantom-chronomancer-class",
    "base": "Wizard",
    "modes": {
      "solo": {
        "weapon": "Ravenous",
        "helm": "Examen",
        "cape": "Lament",
        "alternative": "Valiance or Vainglory depending on boss and critical support",
        "note": "High damage with debuff/sustain utility. Skill rotation and mana management differ from ShadowHunter."
      },
      "group": {
        "weapon": "Ravenous",
        "helm": "Examen",
        "cape": "Penitence",
        "alternative": "Vainglory in a safe composition; Lament when crit chance is limiting",
        "note": "High-output Ultra DPS with defensive cape. Coordinate encounter-specific mechanics and debuffs."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Kathool Adept": {
    "category": "Meta farmer · recent",
    "source": "https://www.reddit.com/r/AQW/comments/1xe1zgv/kathool_adept_is_the_best_farming_class_in_the/",
    "guide": "https://aqwwiki.wikidot.com/kathool-adept",
    "base": "Wizard",
    "modes": {
      "solo": {
        "weapon": "Elysium",
        "helm": "Pneuma",
        "cape": "Vainglory",
        "alternative": "Valiance / Examen / Lament when your setup needs more crit or sustain",
        "note": "Madness is applied to enemies; Feeding is accumulated by the caster. Consult the official skill breakdown; this solo loadout is still untested."
      },
      "farm": {
        "weapon": "Valiance",
        "helm": "Pneuma",
        "cape": "Lament",
        "alternative": "Other cape and weapon combinations require activity-specific testing",
        "note": "October 2026 community farming example: Wizard / Valiance / Pneuma / Lament. Performance varies by mob HP and latency; not a universal best-in-slot."
      },
      "group": {
        "weapon": "Valiance",
        "helm": "Forge",
        "cape": "Penitence",
        "alternative": "Arcana's Concerto only if the party needs the debuff and none is assigned",
        "note": "Debuffs can help groups, but not a universal replacement for Legion Revenant or Lord of Order. This is a conservative group setup."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Hollowborn Vindicator": {
    "category": "Meta solo / defensive DPS",
    "source": "https://www.reddit.com/r/AQW/comments/1ttv3uq/hollowborn_vindicator/",
    "guide": "https://aqwwiki.wikidot.com/hollowborn-vindicator",
    "base": "Wizard",
    "modes": {
      "solo": {
        "weapon": "Dauntless",
        "helm": "Forge",
        "cape": "Vainglory",
        "alternative": "Valiance + Pneuma + Lament for stable solo; Ravenous + Penitence for survivability",
        "note": "Low-HP magical DPS with lifesteal and defensive effects. Focused Grace (3) consumes Grace Stolen for recovery and defense; the exact Forge combination remains under review."
      },
      "group": {
        "weapon": "Praxis",
        "helm": "Forge",
        "cape": "Vainglory",
        "alternative": "Dauntless for short fights when safe; Penitence for tanking",
        "note": "Situational group DPS/debuffs, especially long fights. Coordinate Praxis ownership; not automatically the best Ultra pick."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Necrotic Chronomancer": {
    "category": "Chrono farmer · calendar",
    "source": "https://www.youtube.com/watch?v=VH7C3yiOh2g",
    "guide": "https://aqwwiki.wikidot.com/necrotic-chronomancer",
    "base": "Lucky",
    "modes": {
      "solo": {
        "weapon": "Dauntless",
        "helm": "Forge",
        "cape": "Lament",
        "alternative": "Health Vamp if self-damage makes sustained fights unsafe",
        "note": "Can damage itself. Learn the sustain/health cycle before pushing hard bosses."
      },
      "farm": {
        "weapon": "Dauntless",
        "helm": "Anima",
        "cape": "Vainglory",
        "alternative": "Health Vamp + Forge helm + Penitence for harder-hitting rooms",
        "note": "Multi-target chrono farmer; glass-cannon setup is risky with self-damage. Use defense when necessary."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "ArchFiend": {
    "category": "Popular farmer / group debuff",
    "source": "https://solarisaqw.lol/guides/classes/archfiend",
    "guide": "https://aqwwiki.wikidot.com/archfiend",
    "base": "Lucky",
    "modes": {
      "solo": {
        "weapon": "Dauntless",
        "helm": "Forge",
        "cape": "Vainglory",
        "alternative": "Health Vamp / Penitence when sustain is insufficient",
        "note": "Fast close-range damage, but weaker sustain on hard bosses. Keep defensive alternatives ready."
      },
      "farm": {
        "weapon": "Dauntless",
        "helm": "Forge",
        "cape": "Vainglory",
        "alternative": "Health Vamp for survivability; Ravenous if a long-target fight favors it",
        "note": "Very fast two-target farmer for moderate-HP rooms. Use defensive gear if mobs are dangerous."
      },
      "group": {
        "weapon": "Ravenous",
        "helm": "Forge",
        "cape": "Penitence",
        "alternative": "Valiance or Awe Blast if target debuffs already covered",
        "note": "Provides valuable group crit buffs and damage debuffs. Prefer keeping support effects up rather than solo-only burst."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Dark Lord": {
    "category": "Popular accessible farmer",
    "source": "https://solarisaqw.lol/guides/classes/dark-lord",
    "guide": "https://aqwwiki.wikidot.com/dark-lord",
    "base": "Wizard",
    "modes": {
      "solo": {
        "weapon": "Valiance",
        "helm": "Vim",
        "cape": "Lament",
        "alternative": "Forge helm for more HP",
        "note": "Can solo routine bosses but is primarily a farmer."
      },
      "farm": {
        "weapon": "Valiance",
        "helm": "Pneuma",
        "cape": "Lament",
        "alternative": "Vim / Base Forge and Avarice for riskier speed farming",
        "note": "Affordable multi-target farming option; is not a universal best-in-slot. Avarice trades defense for haste."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Great Thief": {
    "category": "High-end DPS · Hero Points",
    "source": "https://www.reddit.com/r/AQW/comments/1tmz6d8/some_info_on_every_major_meta_dps_forgive_me_for/",
    "guide": "https://aqwwiki.wikidot.com/great-thief",
    "base": "Lucky",
    "modes": {
      "solo": {
        "weapon": "Ravenous",
        "helm": "Vim",
        "cape": "Vainglory",
        "alternative": "Valiance or Lament; Forge helm for safer general use",
        "note": "Excellent evasive single-target damage. Expensive/special class; short fights and group scaling can change ideal enhancement."
      },
      "group": {
        "weapon": "Ravenous",
        "helm": "Forge",
        "cape": "Penitence",
        "alternative": "Vim + Vainglory if boss mechanics permit an offensive setup",
        "note": "Very strong DPS in coordinated groups. Has limited team utility besides damage; be mindful of mechanics."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  },
  "Guardian": {
    "category": "Meta group DPS / sustain",
    "source": "https://vanaheim.app/guides/guardian-127033",
    "guide": "https://aqwwiki.wikidot.com/guardian",
    "base": "Lucky",
    "modes": {
      "solo": {
        "weapon": "Ravenous",
        "helm": "Vim",
        "cape": "Lament",
        "alternative": "Vainglory if crit chance is already high",
        "note": "Fast damage with frequent group-friendly heals; benefits from critical and team debuff coordination."
      },
      "group": {
        "weapon": "Ravenous",
        "helm": "Vim",
        "cape": "Penitence",
        "alternative": "Vainglory / Lament if healing and protection are already secure",
        "note": "Strong party DPS that also heals. Requires Guardian entitlement; bring a defensive cape for dangerous Ultras."
      }
    },
    "consumables": [
      "Fate Tonic",
      "Potent Battle Elixir",
      "Felicitous Philtre"
    ]
  }
};
  const aliases={
  "Chrono ShadowSlayer": "Chrono ShadowHunter",
  "Phantom Chronomancer": "Phantasm Chronomancer",
  "Nechronomancer": "Necrotic Chronomancer"
};
  const builds={},base={},alchemy={},metadata={};
  for(const [name,entry] of Object.entries(curated)){
    builds[name]=entry.modes;
    base[name]=entry.base;
    alchemy[name]=entry.consumables;
    metadata[name]={category:entry.category,guide:entry.guide,source:entry.source,canonical:name};
  }
  for(const [name,canonical] of Object.entries(aliases)){
    const original=curated[canonical];
    if(!original)throw Error("Unknown meta build alias: "+canonical);
    // Same class skills, gear and rotations; keep separate inventory item names.
    builds[name]=original.modes;
    base[name]=original.base;
    alchemy[name]=original.consumables;
    metadata[name]={category:original.category,guide:original.guide,source:original.source,canonical};
  }
  const copies=Object.freeze(Object.keys(builds));
  return Object.freeze({builds,base,alchemy,metadata,aliases,classes:copies,
    reviewedOn:"2026-11-23",get:(name)=>metadata[name]?{builds:builds[name],...metadata[name]}:null});
});
