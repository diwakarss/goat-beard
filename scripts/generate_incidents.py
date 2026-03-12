#!/usr/bin/env python3
"""Generate seed incidents data for Goat Beard project."""

import json
from pathlib import Path

# Base incidents data
incidents = [
    # Kerala - Arif Mohammad Khan
    {
        "id": "inc-kl-001",
        "governor_id": "gov-arif-khan",
        "state": "KL",
        "date_start": "2023-01-15",
        "date_end": None,
        "transgression_type": "withholding_assent",
        "duration_days": 815,
        "constitutional_articles": [200, 201],
        "sc_precedents": ["nabam-rebia"],
        "escalation_level": 3,
        "sources": [
            {
                "url": "https://www.scobserver.in/cases/pendency-of-bills-before-kerala-governor/",
                "outlet": "Supreme Court Observer",
                "date_published": "2023-11-01",
                "tier": "primary",
                "credibility_score": 0.9
            }
        ],
        "verification_status": "confirmed",
        "incident_status": "contested",
        "claim_id": "claim-kl-001",
        "evidence_bundle_id": "bundle-kl-001",
        "confidence_score": 0.88,
        "data_completeness_score": 0.95,
        "last_verified_at": "2024-03-23",
        "reviewer_id": "manual-curator",
        "contradiction_flag": False,
        "severity_constitutional": 2.56,
        "severity_salience": 0.75,
        "severity_unified": 2.02,
        "duration_impact": 1.0,
        "media_visibility": 0.8,
        "recency_multiplier": 0.7,
        "heat_multiplier": 1.2,
        "era": "post_2014",
        "raj_bhavan_response": "Governor cited concerns about constitutional propriety",
        "legislative_pushback": "Kerala govt filed Supreme Court petition"
    },
]

# Write to file
output_path = Path(__file__).parent.parent / "data" / "incidents.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w') as f:
    json.dump(incidents, f, indent=2)

print(f"Generated {len(incidents)} incidents to {output_path}")
