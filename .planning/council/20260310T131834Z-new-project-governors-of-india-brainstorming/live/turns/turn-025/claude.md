Got it—archives only, no RTI. That actually simplifies the pipeline significantly. For a 3-5 day launch, I'd recommend we lock the scope hard: focus Phase 0 on *one year chunk* (maybe 2010–2020, high-impact recent incidents) with robust archive coverage, verify the schema works at scale, and ship. We can backfill historical data in phases after launch.

The UI stays the same—timeline-matrix, evidence drawers, heat-map tiles—but the data payload is tighter. We lose the cross-corroboration with court judgments that would've strengthened verification, so lean harder on source-credibility tiers and timestamp-based clustering to catch when multiple outlets report the same incident. That gives us synthetic corroboration without needing RTI docs.

One question: Are we scraping English-language archives only, or multilingual (regional language outlets + archives)? That'll shape entity resolution complexity—if we're just English, deduping is easier, but we miss state-specific reporting. For 3 days, I'd say English-first, regional as phase 2 backfill.

Let's strip Phase 0 down to: archive selection, dedup/entity resolution, severity calibration on the 2010–2020 chunk, then UI goes live with that seed dataset. We'll be live faster and can expand depth iteratively. Sound right?
