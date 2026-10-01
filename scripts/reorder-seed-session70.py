#!/usr/bin/env python3
"""Session-70 (v2.30) F5: reorder prisma/data/{eat,stay,do}.json to the
live's current browse display sequences (the live's entity order changed
since the seed capture; the sets are identical, the tie order is not).

The seed assigns sortOrder = sortBase + i by FILE INDEX, and the browses
order by sortOrder — so reordering the arrays reorders the grids.

Display order keys on the live's sub_category (the card title).
"""
import json
from collections import OrderedDict

# The live's measured display sequences (session 70, agent-browser).
# The card TITLES for /eat and /do are the small sub-category labels the
# probe captured; the /stay cards key on the entity name — so each
# category maps its sequence through the matching field.
LIVE_ORDER = {
    "eat": {
        "key": "sub_category",
        "titles": [
            "Design Wine Bar", "Fire Kitchen", "Modern Bavarian",
            "Garden Supper Room", "Neo Asian Kitchen", "Plant Bistro",
            "Bavarian Bakery Grill", "Future Italian", "Midnight Ramen",
            "Coastal Plates", "Mediterranean Grill", "French Night Café",
        ],
    },
    "stay": {
        "key": "name",
        "titles": [
            "Brass & Marble", "Cloud Nine Hotel", "Garden Suite",
            "Courtyard Stay", "Maison Altstadt", "Velvet Residence",
            "Canal Hideaway", "Arcade Rooms", "River House",
            "Rooftop Atelier", "The Linen House", "Terra Boutique",
        ],
    },
    "do": {
        "key": "sub_category",
        "titles": [
            "Historic Sight", "Nature Walk", "City Sight",
            "Guided Walking Tour", "Design Museum", "Creative Workshop",
            "Art Night", "Cultural Classic", "Museum Tour",
            "Storytelling Tour", "Heritage Sight", "Nightlife Walk",
            "History Tour", "Outdoor Route", "Museum Visit",
            "Food Workshop", "Garden Escape", "Family Day",
        ],
    },
}

for cat, spec in LIVE_ORDER.items():
    path = f"prisma/data/{cat}.json"
    order, key = spec["titles"], spec["key"]
    with open(path, encoding="utf-8") as fh:
        records = json.load(fh, object_pairs_hook=OrderedDict)
    # Index the records by the field the browse grid displays through.
    by_title = {r.get(key): r for r in records}
    missing = [t for t in order if t not in by_title]
    extra = [t for t in by_title if t not in order]
    if missing or extra or len(records) != len(order):
        raise SystemExit(
            f"{cat}: set mismatch (missing={missing} extra={extra} "
            f"records={len(records)} order={len(order)})"
        )
    reordered = [by_title[t] for t in order]
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(reordered, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"{cat}: reordered {len(reordered)} records to the live's sequence")
print("done")
