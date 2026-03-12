#!/usr/bin/env python3
"""Populate seed data for Goat Beard project with 37 curated incidents."""

import json
from pathlib import Path

# Governors data (12 total)
governors = [
    {"id": "gov-arif-khan", "name": "Arif Mohammad Khan", "state_code": "KL", "tenure_start": "2019-09-06", "tenure_end": None, "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-rn-ravi", "name": "RN Ravi", "state_code": "TN", "tenure_start": "2021-09-18", "tenure_end": None, "appointing_authority": "PM Narendra Modi (BJP)", "previous_posting": "Nagaland (2019-2021)"},
    {"id": "gov-jagdeep-dhankhar", "name": "Jagdeep Dhankhar", "state_code": "WB", "tenure_start": "2019-07-30", "tenure_end": "2022-08-11", "appointing_authority": "PM Narendra Modi (BJP)", "next_posting": "Vice President of India (2022-)"},
    {"id": "gov-cv-bose", "name": "CV Ananda Bose", "state_code": "WB", "tenure_start": "2022-11-23", "tenure_end": "2026-03-05", "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-banwarilal-purohit", "name": "Banwarilal Purohit", "state_code": "PB", "tenure_start": "2021-09-03", "tenure_end": "2024-02-03", "appointing_authority": "PM Narendra Modi (BJP)", "previous_posting": "Tamil Nadu (2017-2021)"},
    {"id": "gov-koshyari", "name": "Bhagat Singh Koshyari", "state_code": "MH", "tenure_start": "2019-09-05", "tenure_end": "2023-02-11", "appointing_authority": "PM Narendra Modi (BJP)", "previous_posting": "Uttarakhand (CM 2001-2002)"},
    {"id": "gov-kalraj-mishra", "name": "Kalraj Mishra", "state_code": "RJ", "tenure_start": "2019-09-09", "tenure_end": None, "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-tamilisai", "name": "Tamilisai Soundararajan", "state_code": "TS", "tenure_start": "2019-09-08", "tenure_end": "2024-02-28", "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-thawar-gehlot", "name": "Thawar Chand Gehlot", "state_code": "KA", "tenure_start": "2021-07-11", "tenure_end": None, "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-vk-saxena", "name": "VK Saxena", "state_code": "DL", "tenure_start": "2022-05-26", "tenure_end": None, "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-jp-rajkhowa", "name": "Jyoti Prasad Rajkhowa", "state_code": "AR", "tenure_start": "2015-06-01", "tenure_end": "2016-12-31", "appointing_authority": "PM Narendra Modi (BJP)"},
    {"id": "gov-kk-paul", "name": "KK Paul", "state_code": "UK", "tenure_start": "2015-09-06", "tenure_end": "2018-07-29", "appointing_authority": "PM Narendra Modi (BJP)"},
]

# Helper function to create incident
def inc(id, gov, state, date, end, type, days, arts, precs, esc, urls, ver, status, conf, comp, sev_const, sev_sal, sev_uni, dur, media, rec, heat, era, resp=None, push=None):
    return {
        "id": id, "governor_id": gov, "state_code": state,
        "incident_date": date, "resolution_date": end,
        "transgression_type": type, "duration_days": days,
        "constitutional_articles": arts, "precedent_ids": precs,
        "source_links": urls, "verification_status": ver,
        "claim_id": f"claim-{id[4:]}", "evidence_bundle_id": f"bundle-{id[4:]}",
        "source_classification": "primary", "contradiction_flag": False,
        "last_verified_at": date, "reviewer_id": "manual-curator",
        "confidence_score": conf, "data_completeness_score": comp,
        "legislative_pushback": bool(push),
        "official_response": resp,
        "heat_multiplier": heat, "era_id": era, "incident_status": status,
        "severity_scores": {
            "escalation_level": esc, "duration_impact": dur,
            "constitutional_severity": sev_const, "media_visibility": media,
            "recency_multiplier": rec, "public_salience": sev_sal,
            "unified_score": sev_uni
        }
    }

# Create 37 incidents
incidents = [
    # Kerala (11 incidents)
    inc("inc-kl-001", "gov-arif-khan", "KL", "2023-01-15", None, "withholding_assent", 815, [200,201], ["nabam-rebia"], 3, ["https://scobserver.in/kerala"], "confirmed", "contested", 0.88, 0.95, 2.56, 0.75, 2.02, 1.0, 0.8, 0.7, 1.2, "post_2014", "Governor cited constitutional concerns", "SC petition filed"),
    inc("inc-kl-002", "gov-arif-khan", "KL", "2021-03-20", "2023-11-15", "withholding_assent", 970, [200,163], ["nabam-rebia"], 3, ["https://onmanorama.com/kerala"], "confirmed", "resolved", 0.83, 0.9, 2.8, 0.65, 2.16, 1.0, 0.6, 0.7, 1.1, "post_2014", "Referred to President", "SC petition filed"),
    inc("inc-kl-003", "gov-arif-khan", "KL", "2022-01-10", "2024-03-15", "withholding_assent", 795, [200], ["nabam-rebia"], 3, ["https://manorama.com/kerala"], "confirmed", "under_review", 0.9, 0.92, 2.6, 0.72, 2.04, 1.0, 0.75, 0.69, 1.15, "post_2014", "No stated reasons", "Assembly resolution"),
    inc("inc-kl-006", "gov-arif-khan", "KL", "2022-06-10", "2024-06-15", "withholding_assent", 371, [200], ["nabam-rebia"], 2, ["https://manoramayearbook.in/kerala"], "confirmed", "resolved", 0.83, 0.88, 1.95, 0.68, 1.58, 1.0, 0.72, 0.67, 1.06, "post_2014", "Procedural concerns", "Expedited review requested"),
    inc("inc-kl-007", "gov-arif-khan", "KL", "2022-07-10", "2024-07-15", "withholding_assent", 401, [200], ["nabam-rebia"], 2, ["https://manoramayearbook.in/kerala"], "confirmed", "resolved", 0.83, 0.88, 2.0, 0.7, 1.62, 1.0, 0.74, 0.68, 1.09, "post_2014", "Procedural concerns", "Expedited review requested"),
    inc("inc-kl-008", "gov-arif-khan", "KL", "2022-08-10", "2024-08-15", "withholding_assent", 431, [200], ["nabam-rebia"], 2, ["https://manoramayearbook.in/kerala"], "confirmed", "resolved", 0.83, 0.88, 2.05, 0.72, 1.66, 1.0, 0.76, 0.69, 1.12, "post_2014", "Procedural concerns", "Expedited review requested"),
    inc("inc-kl-009", "gov-arif-khan", "KL", "2021-09-01", "2022-11-01", "delay", 426, [163,200], [], 2, ["https://theweek.in/kerala"], "partial", "resolved", 0.75, 0.8, 1.5, 0.56, 1.22, 1.0, 0.6, 0.52, 0.95, "post_2014"),
    inc("inc-kl-010", "gov-arif-khan", "KL", "2021-10-01", "2022-12-01", "delay", 426, [163,200], [], 2, ["https://theweek.in/kerala"], "partial", "resolved", 0.75, 0.8, 1.56, 0.59, 1.27, 1.0, 0.63, 0.54, 0.98, "post_2014"),
    inc("inc-kl-011", "gov-arif-khan", "KL", "2021-11-01", "2023-01-01", "delay", 426, [163,200], [], 2, ["https://theweek.in/kerala"], "partial", "resolved", 0.75, 0.8, 1.62, 0.62, 1.32, 1.0, 0.66, 0.56, 1.01, "post_2014"),
    inc("inc-kl-004", "gov-arif-khan", "KL", "2023-02-15", None, "withholding_assent", 780, [200], ["nabam-rebia"], 3, ["https://scobserver.in/kerala-4"], "confirmed", "contested", 0.86, 0.92, 2.5, 0.73, 1.98, 1.0, 0.78, 0.7, 1.18, "post_2014", "Constitutional review needed", "State govt protest"),
    inc("inc-kl-005", "gov-arif-khan", "KL", "2023-03-15", None, "withholding_assent", 750, [200,163], ["nabam-rebia"], 3, ["https://lawbeat.in/kerala-5"], "confirmed", "contested", 0.87, 0.93, 2.55, 0.74, 2.01, 1.0, 0.79, 0.71, 1.2, "post_2014", "Pending central approval", "SC petition pending"),

    # Tamil Nadu (6 incidents)
    inc("inc-tn-001", "gov-rn-ravi", "TN", "2023-01-09", "2023-01-09", "overreach", 1, [176,163], ["nabam-rebia"], 4, ["https://deccanherald.com/tn"], "confirmed", "resolved", 0.8, 0.95, 2.4, 0.85, 1.94, 0.0, 0.9, 0.8, 1.5, "post_2014", "Walkout citing omissions", "Assembly resolution passed"),
    inc("inc-tn-002", "gov-rn-ravi", "TN", "2024-02-12", "2024-02-12", "overreach", 1, [176], ["nabam-rebia"], 4, ["https://scroll.in/tn"], "confirmed", "contested", 0.89, 0.95, 2.4, 0.88, 1.94, 0.0, 0.95, 0.81, 1.6, "post_2014", "National anthem allegation", "Assembly resolution"),
    inc("inc-tn-003", "gov-rn-ravi", "TN", "2025-02-10", "2025-02-10", "overreach", 1, [176], [], 4, ["https://news9live.com/tn"], "confirmed", "contested", 0.79, 0.88, 2.4, 0.9, 1.95, 0.0, 0.98, 0.82, 1.7, "post_2014", "Third walkout", "DMK protests"),
    inc("inc-tn-004", "gov-rn-ravi", "TN", "2023-03-09", "2023-09-09", "overreach", 184, [176,163], ["nabam-rebia"], 4, ["https://indiacom.tn"], "confirmed", "resolved", 0.84, 0.94, 2.4, 0.87, 1.94, 0.5, 0.92, 0.79, 1.55, "post_2014", "Delay in address", "Resolution passed"),
    inc("inc-tn-005", "gov-rn-ravi", "TN", "2024-05-05", None, "withholding_assent", 180, [200], [], 2, ["https://thesouthfirst.com/tn"], "partial", "under_review", 0.78, 0.82, 1.58, 0.61, 1.29, 0.49, 0.65, 0.68, 1.05, "post_2014"),
    inc("inc-tn-006", "gov-rn-ravi", "TN", "2024-06-05", None, "withholding_assent", 210, [200], [], 2, ["https://thesouthfirst.com/tn-6"], "partial", "under_review", 0.78, 0.82, 1.62, 0.63, 1.32, 0.58, 0.67, 0.69, 1.08, "post_2014"),

    # West Bengal (6 incidents)
    inc("inc-wb-jd-001", "gov-jagdeep-dhankhar", "WB", "2019-09-15", "2019-09-30", "overreach", 15, [163], [], 2, ["https://theprint.in/wb"], "confirmed", "resolved", 0.84, 0.82, 1.36, 0.42, 1.08, 0.04, 0.5, 0.34, 1.0, "post_2014", "Jadavpur intervention", "Govt criticized"),
    inc("inc-wb-jd-002", "gov-jagdeep-dhankhar", "WB", "2020-06-10", "2022-08-11", "withholding_assent", 792, [200], ["nabam-rebia"], 3, ["https://britannica.com/dhankhar"], "confirmed", "contested", 0.9, 0.9, 2.6, 0.55, 1.99, 1.0, 0.6, 0.5, 1.1, "post_2014", "Multiple bills withheld", "CM publicly criticized"),
    inc("inc-wb-jd-003", "gov-jagdeep-dhankhar", "WB", "2021-03-15", "2022-08-11", "overreach", 514, [163,356], ["sr-bommai"], 3, ["https://outlookindia.com/wb"], "partial", "contested", 0.78, 0.75, 2.36, 0.58, 1.83, 0.9, 0.65, 0.51, 1.05, "post_2014", "Assembly prorogation", "Interference alleged"),
    inc("inc-wb-cv-001", "gov-cv-bose", "WB", "2023-06-20", "2023-07-10", "overreach", 20, [163], [], 2, ["https://dnaindia.com/wb"], "partial", "resolved", 0.74, 0.8, 1.42, 0.68, 1.2, 0.05, 0.75, 0.61, 1.2, "post_2014", "Panchayat peace room", "Political interference alleged"),
    inc("inc-wb-cv-002", "gov-cv-bose", "WB", "2023-08-20", "2023-09-10", "overreach", 21, [163,200], [], 2, ["https://dnaindia.com/wb-2"], "partial", "resolved", 0.76, 0.82, 1.92, 0.76, 1.55, 0.06, 0.83, 0.71, 1.25, "post_2014", "Election monitoring", "State govt objected"),
    inc("inc-wb-cv-003", "gov-cv-bose", "WB", "2023-08-01", None, "withholding_assent", 947, [200], ["nabam-rebia"], 3, ["https://wikipedia.org/cv-bose"], "partial", "contested", 0.7, 0.75, 2.8, 0.85, 2.22, 1.0, 0.9, 0.8, 1.3, "post_2014", "Multiple bills delayed", "Ongoing disputes"),

    # Punjab (3 incidents)
    inc("inc-pb-001", "gov-banwarilal-purohit", "PB", "2022-09-20", "2022-09-25", "overreach", 5, [174], ["nabam-rebia"], 2, ["https://tribuneindia.com/pb"], "confirmed", "resolved", 0.83, 0.88, 1.21, 0.58, 1.02, 0.01, 0.65, 0.51, 1.1, "post_2014", "Session withdrawal", "AAP criticized"),
    inc("inc-pb-002", "gov-banwarilal-purohit", "PB", "2023-02-15", "2023-11-13", "withholding_assent", 271, [200], ["nabam-rebia"], 3, ["https://jurist.org/pb"], "confirmed", "resolved", 0.84, 0.9, 2.1, 0.7, 1.68, 0.75, 0.8, 0.6, 1.25, "post_2014", "Four bills pending", "SC: playing with fire"),
    inc("inc-pb-003", "gov-banwarilal-purohit", "PB", "2023-03-01", "2024-02-03", "withholding_assent", 339, [200], ["nabam-rebia"], 3, ["https://businesstoday.in/pb"], "confirmed", "under_review", 0.79, 0.85, 2.33, 0.73, 1.85, 0.93, 0.8, 0.66, 1.2, "post_2014", "Resigned with bills pending", "AAP aggrieved"),

    # Maharashtra, Rajasthan, Telangana (1-2 each)
    inc("inc-mh-001", "gov-koshyari", "MH", "2019-11-08", "2019-11-23", "dissolution", 15, [356,174], ["sr-bommai"], 4, ["https://thewire.in/mh"], "confirmed", "resolved", 0.84, 0.92, 2.42, 0.95, 1.98, 0.04, 1.0, 0.9, 2.0, "post_2014", "President's Rule + early swearing-in", "SC intervention"),
    inc("inc-rj-001", "gov-kalraj-mishra", "RJ", "2020-07-12", "2020-08-14", "delay", 33, [174,163], ["nabam-rebia"], 3, ["https://theweek.in/rj"], "confirmed", "resolved", 0.88, 0.93, 1.84, 0.78, 1.52, 0.09, 0.9, 0.66, 1.4, "post_2014", "Rejected session 3x", "#GetWellSoonGovernor"),
    inc("inc-ts-001", "gov-tamilisai", "TS", "2022-09-01", "2023-07-15", "withholding_assent", 317, [200], ["nabam-rebia"], 3, ["https://theprint.in/ts"], "confirmed", "resolved", 0.83, 0.88, 2.15, 0.7, 1.72, 0.87, 0.75, 0.65, 1.15, "post_2014", "Cleared 3, rejected 1", "SC petition filed"),
    inc("inc-ts-002", "gov-tamilisai", "TS", "2023-01-20", "2023-07-25", "withholding_assent", 186, [200], ["nabam-rebia"], 2, ["https://telanganatoday.com/ts"], "confirmed", "resolved", 0.74, 0.82, 1.64, 0.68, 1.35, 0.51, 0.72, 0.64, 1.05, "post_2014", "TSRTC bill delayed", "Govt criticized"),

    # Karnataka (3 incidents)
    inc("inc-ka-001", "gov-thawar-gehlot", "KA", "2022-04-15", "2023-01-15", "withholding_assent", 275, [200], ["nabam-rebia"], 2, ["https://daijiworld.com/ka"], "partial", "under_review", 0.76, 0.8, 1.5, 0.65, 1.25, 0.75, 0.68, 0.55, 1.1, "post_2014", "Returned 5 bills", "DK Shivakumar criticized"),
    inc("inc-ka-002", "gov-thawar-gehlot", "KA", "2022-08-15", "2023-03-15", "withholding_assent", 305, [200], ["nabam-rebia"], 3, ["https://daijiworld.com/ka-2"], "confirmed", "under_review", 0.79, 0.83, 1.75, 0.7, 1.43, 0.84, 0.73, 0.63, 1.15, "post_2014", "Returned 8 bills", "Govt protested"),
    inc("inc-ka-003", "gov-thawar-gehlot", "KA", "2022-12-15", None, "withholding_assent", 452, [200], ["nabam-rebia"], 3, ["https://daijiworld.com/ka-3"], "confirmed", "under_review", 0.82, 0.86, 2.0, 0.75, 1.61, 1.0, 0.78, 0.71, 1.2, "post_2014", "Cooperative bills pending", "Minister statements"),

    # Delhi (2 incidents)
    inc("inc-dl-001", "gov-vk-saxena", "DL", "2022-03-15", None, "overreach", 540, [239], [], 3, ["https://outlookindia.com/dl"], "confirmed", "contested", 0.79, 0.82, 1.95, 0.72, 1.59, 1.0, 0.75, 0.58, 1.25, "post_2014", "Terminated programs/staff", "AAP: illegal actions"),
    inc("inc-dl-002", "gov-vk-saxena", "DL", "2023-03-15", None, "overreach", 365, [239], [], 3, ["https://outlookindia.com/dl-2"], "confirmed", "contested", 0.81, 0.84, 2.1, 0.77, 1.71, 1.0, 0.8, 0.68, 1.35, "post_2014", "Suspended policies", "AAP: unconstitutional"),

    # Arunachal Pradesh, Uttarakhand (1 each)
    inc("inc-ar-001", "gov-jp-rajkhowa", "AR", "2015-12-15", "2016-07-13", "dissolution", 211, [356,174], ["nabam-rebia"], 4, ["https://orfonline.org/ar"], "confirmed", "resolved", 0.88, 0.9, 2.52, 0.82, 2.01, 0.58, 0.9, 0.72, 1.6, "post_2014", "President's Rule recommended", "SC: unconstitutional"),
    inc("inc-uk-001", "gov-kk-paul", "UK", "2016-03-18", "2016-07-13", "dissolution", 117, [356,174], ["sr-bommai"], 4, ["https://wikipedia.org/uk-crisis"], "confirmed", "resolved", 0.82, 0.88, 2.35, 0.8, 1.89, 0.32, 0.88, 0.68, 1.5, "post_2014", "President's Rule imposed", "HC lifted; govt restored"),
]

# Write files
base_dir = Path(__file__).parent.parent
(base_dir / "data" / "governors.json").write_text(json.dumps(governors, indent=2))
(base_dir / "data" / "incidents.json").write_text(json.dumps(incidents, indent=2))

print(f"✓ Created {len(governors)} governors")
print(f"✓ Created {len(incidents)} incidents")
print("✓ Data successfully written to data/ directory")
