'use strict';
// Curated starter catalog; not a complete or live inventory of Character Page badges.
// Acquisition summaries are paraphrases; individual sources are attached to each entry.
(function(root){const badges=[
  {
    "id": "blod",
    "name": "Blinding Light of Destiny",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Finish the BLoD quest chain and unlock its achievement.",
    "source": "https://aqwwiki.wikidot.com/charpage:27",
    "guide": "Complete the weapon acquisition route; verify the badge on your Character Page.",
    "guideSource": "https://aqwwiki.wikidot.com/story:blinding-light-of-destiny"
  },
  {
    "id": "lr",
    "name": "Legion Revenant",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Turn in Legion Fealty 4.",
    "source": "https://aqwwiki.wikidot.com/charpage:424",
    "join": "/join revenant",
    "guide": "Meet the Evil rank requirement, complete the Fealty quests and turn in Fealty 4.",
    "guideSource": "https://aqwwiki.wikidot.com/legion-revenant-s-quests"
  },
  {
    "id": "vhl",
    "name": "Void Highlord",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete the Void Highlord Badge quest.",
    "source": "https://aqwwiki.wikidot.com/charpage:427",
    "guide": "Obtain the class and follow the separate badge quest requirements.",
    "guideSource": "https://aqwwiki.wikidot.com/tharanak-hrii-s-quests"
  },
  {
    "id": "nsod",
    "name": "Necrotic Sword of Doom",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete Braeus's separate sword badge quest.",
    "source": "https://aqwwiki.wikidot.com/charpage:426",
    "join": "/join shadowfall",
    "guide": "Bring the original Necrotic Sword of Doom and one Arcane Parchment to Braeus.",
    "guideSource": "https://aqwwiki.wikidot.com/braeus-quests"
  },
  {
    "id": "cav",
    "name": "Chaos Avenger",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Turn in the Chaos Avenger Class quest at level 80.",
    "source": "https://aqwwiki.wikidot.com/charpage:490",
    "join": "/join championdrakath",
    "guide": "Speak to Hero and collect the required amulet and fragments; use the quest page for the complete list.",
    "guideSource": "https://aqwwiki.wikidot.com/hero-s-quests"
  },
  {
    "id": "dot",
    "name": "Dragon of Time",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Finish Kro'nar's Dragon of Time quest line.",
    "source": "https://aqwwiki.wikidot.com/charpage:436",
    "join": "/join timeinn",
    "guide": "Start with Acquiring Ancient Secrets and work through Kro'nar's remaining quests.",
    "guideSource": "https://aqwwiki.wikidot.com/kro-nar-s-quests"
  },
  {
    "id": "blade-awe",
    "name": "Blade of Awe",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Assemble the Blade of Awe from its scattered pieces.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "champion-chaos",
    "name": "Champion of Chaos",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Defeat the Champion of Chaos; check the exact variant on your Character Page.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "endless-doom",
    "name": "Endless Doom",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Clear at least 100 rooms of Grimskull's dungeon.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "drakath-armor",
    "name": "Drakath’s Epic Armor",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete the Drakath armor achievement route.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges",
    "guide": "Check the dedicated character badge quest, not merely armor ownership.",
    "guideSource": "https://aqwwiki.wikidot.com/confrontation-s-quests"
  },
  {
    "id": "archfiend-doomlord",
    "name": "ArchFiend DoomLord",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Finish the ArchFiend DoomLord armor unlock.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "apotheosis",
    "name": "Apotheosis",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete the Exaltia Tower weapon challenge.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "rgow",
    "name": "Radiant Goddess Of War",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete the armor achievement route.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "arcana-invoker",
    "name": "Arcana Invoker Class",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Unlock Arcana Invoker through its class progression.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "yami",
    "name": "Yami no Ronin",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Complete the Yami no Ronin class unlock.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "hollowborn-vindicator",
    "name": "Hollowborn Vindicator",
    "category": "Epic Hero",
    "kind": "quest",
    "requirement": "Obtain the Hollowborn Vindicator class.",
    "source": "https://aqwwiki.wikidot.com/epic-hero-badges"
  },
  {
    "id": "xiang",
    "name": "2nd Chaos Lord",
    "category": "Battle",
    "kind": "quest",
    "requirement": "Defeat Chaos Lord Xiang.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "chaos-harpy",
    "name": "Chaos Harpy",
    "category": "Battle",
    "kind": "quest",
    "requirement": "Defeat the second Chaos Beast.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "desoloth",
    "name": "Desoloth Freed",
    "category": "Battle",
    "kind": "quest",
    "requirement": "Open the DragonGate to release Desoloth.",
    "source": "https://www.aq.com/lore/badges/quest"
  },
  {
    "id": "master-time",
    "name": "Master of Time",
    "category": "Legend",
    "kind": "quest",
    "requirement": "Defeat Ultra Iadoa and Ultra Kathool; membership requirements may apply.",
    "source": "https://www.aq.com/lore/badges/legend"
  },
  {
    "id": "sdka",
    "name": "Sepulchure’s Armor",
    "category": "Legend",
    "kind": "quest",
    "requirement": "Complete the legendary darkness armor quest.",
    "source": "https://www.aq.com/lore/badges/legend"
  },
  {
    "id": "avast",
    "name": "AVAST!",
    "category": "Battle",
    "kind": "seasonal",
    "requirement": "Complete Quibble's Talk Like a Pirate Day quests as a Legend.",
    "source": "https://www.aq.com/lore/badges/legend",
    "guide": "Seasonal return is not confirmed for a specific date."
  },
  {
    "id": "ptr-guild",
    "name": "PTR Guild tester",
    "category": "Legend",
    "kind": "legacy",
    "requirement": "Historical award for Guilds Phase 1 testing.",
    "source": "https://www.aq.com/lore/badges/legend"
  },
  {
    "id": "ptr-lag",
    "name": "PTR Lag Tester",
    "category": "Legend",
    "kind": "legacy",
    "requirement": "Historical award for member lag testing.",
    "source": "https://www.aq.com/lore/badges/legend"
  },
  {
    "id": "ptr",
    "name": "PTR Tester",
    "category": "Legend",
    "kind": "legacy",
    "requirement": "Historical public test realm participation award.",
    "source": "https://www.aq.com/lore/badges/legend"
  },
  {
    "id": "harvest-hunter",
    "name": "Harvest Hunter",
    "category": "Support",
    "kind": "seasonal",
    "requirement": "Purchase the full November Harvest Hunters seasonal pack, which includes a Character Page badge.",
    "source": "https://www.aq.com/gamedesignnotes/aqw-1nov24-seasonalset-9037",
    "guide": "Individual AC shop pieces do not establish badge eligibility. Confirm the offer on the official announcement.",
    "guideSource": "https://aqwwiki.wikidot.com/support-badges",
    "window": {
      "start": "2026-11-01",
      "end": "2026-11-30",
      "announced": "2026-11-01"
    },
    "paid": true
  }
];
if(typeof module==='object'&&module.exports)module.exports=badges;else root.AQWCBadgeCatalog=badges;})(typeof globalThis==='object'?globalThis:this);
