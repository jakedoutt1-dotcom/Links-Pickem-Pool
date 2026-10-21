// Original LINKS case files. Fictional people, records and extensions; this module initiates no calls.
import {NIGHT_TRAIN_INVESTIGATION} from './last-alibi-night-train-investigation.js';
import {EXPEDITION_CASE} from './last-alibi-expedition.js';
export const EXTRA_QUICK_CASES={
 'night-train-investigation':NIGHT_TRAIN_INVESTIGATION,
 'sunken-observatory':EXPEDITION_CASE,
 "final-encore": {
  "title": "The Final Encore",
  "description": "A sabotaged final performance. Follow the cue sheets, not the applause.",
  "art": "last-alibi-final-encore-v1.svg",
  "time": "10:04–10:08 PM",
  "chapters": [
   {
    "title": "An Unscheduled Blackout",
    "label": "Case briefing",
    "story": "The Bellwether Theatre final has gone dark. A signed cue sheet was replaced during a four-minute blackout, changing the winning act. Six crew members had access; nobody outside this circle entered. Recover who altered the result, where they worked, and how. The director calls it an artistic choice. The electrician has other words."
   },
   {
    "title": "Everyone Takes a Bow",
    "label": "Act I",
    "story": "Fix the time window first. A photograph shows a useful detail on the old stage intercom. Ignore the loudest confession: the lighting operator is only admitting to the purple spotlight."
   },
   {
    "title": "The Wrong Kind of Encore",
    "label": "Act II",
    "story": "Witnesses can be truthful and still irrelevant. Compare the continuous recordings with the substituted cue sheet. The intercom archive keeps an independent record; find its extension and call it."
   },
   {
    "title": "Curtain Call",
    "label": "Act III",
    "story": "Five crew members now have continuous alibis for the entire blackout. Match the remaining opportunity to the paper substitution, then file your conclusion with the recorded call as proof."
   }
  ],
  "rooms": [
   {
    "id": "stage",
    "name": "Main Stage",
    "art": "music"
   },
   {
    "id": "booth",
    "name": "Lighting Booth",
    "art": "study"
   },
   {
    "id": "greenroom",
    "name": "Green Room",
    "art": "gallery"
   }
  ],
  "methods": [
   "A substituted cue sheet",
   "A failed spotlight",
   "A corrupted music track"
  ],
  "cast": [
   {
    "id": "stage-manager",
    "name": "Kit Vale",
    "title": "Stage manager",
    "intro": "Every disaster is somehow part of Kit’s schedule.",
    "secret": "Kit quietly promised the sponsor a different winner."
   },
   {
    "id": "singer",
    "name": "Ada North",
    "title": "Singer",
    "intro": "Ada denies ever asking for a sixth encore.",
    "secret": "Ada practised her acceptance speech before the final."
   },
   {
    "id": "pianist",
    "name": "Owen Reed",
    "title": "Pianist",
    "intro": "Owen can remember every note except the one about parking.",
    "secret": "Owen borrowed the rehearsal-room key without asking."
   },
   {
    "id": "electrician",
    "name": "Nell Sparks",
    "title": "Electrician",
    "intro": "Nell says darkness is usually a management issue.",
    "secret": "Nell fitted an unauthorized purple spotlight."
   },
   {
    "id": "critic",
    "name": "Jules Penn",
    "title": "Critic",
    "intro": "Jules has already written two contradictory reviews.",
    "secret": "Jules was once rejected by the lead performer."
   },
   {
    "id": "costumer",
    "name": "Bea Stitch",
    "title": "Costumer",
    "intro": "Bea can mend a hem, not a career.",
    "secret": "Bea altered a costume without clearing the expense."
   }
  ],
  "solution": {
   "killer": "stage-manager",
   "scene": "booth",
   "object": "A substituted cue sheet"
  },
  "proofRecords": [
   "encore-call"
  ],
  "evidence": [
   {
    "id": "encore-window",
    "chapter": 1,
    "room": "stage",
    "title": "The blackout window",
    "kind": "Verified record",
    "text": "The stage controller and lobby clock independently fix the blackout at 10:04–10:08 PM. The signed result sheet remained in the lighting booth until 10:04, and the altered sheet was found there at 10:08. The substitution happened in that booth during those four minutes.",
    "eliminates": []
   },
   {
    "id": "encore-stream",
    "chapter": 1,
    "room": "stage",
    "title": "The unbroken rehearsal feed",
    "kind": "Verified record",
    "text": "A wide live feed continuously shows Ada North and Owen Reed on the main stage throughout 10:04–10:08. The booth is a separate locked room; neither leaves the frame.",
    "eliminates": [
     "singer",
     "pianist"
    ]
   },
   {
    "id": "encore-photo",
    "chapter": 1,
    "room": "booth",
    "title": "Photograph: the stage intercom",
    "kind": "Verified record",
    "text": "A property photograph of the lighting desk. Zoom in and inspect the tiny service label on the intercom. Its recorded-message archive is independent of the result sheet.",
    "eliminates": [],
    "photo": {
     "asset": "./assets/last-alibi-final-encore-evidence-v1.svg",
     "caption": "The service label sits below the intercom receiver.",
     "details": [
      {
       "label": "Read the service label",
       "text": "Recorded-message extension 4216. Dial these four digits in the case phone.",
       "x": 77,
       "y": 78
      }
     ]
    }
   },
   {
    "id": "encore-worklight",
    "chapter": 2,
    "room": "greenroom",
    "title": "The green-room work light",
    "kind": "Verified record",
    "text": "A battery-backed green-room camera shows Nell Sparks and Bea Stitch continuously repairing the same costume during the blackout. Both faces and the room clock remain visible.",
    "eliminates": [
     "electrician",
     "costumer"
    ]
   },
   {
    "id": "encore-paper",
    "chapter": 2,
    "room": "booth",
    "title": "Two different papers",
    "kind": "Verified record",
    "text": "The original result is on embossed stock. The sheet recovered from the booth is ordinary rehearsal paper with copied signatures. Power and audio logs show no fault capable of changing a paper result. This was a deliberate cue-sheet substitution, not a technical failure.",
    "eliminates": []
   },
   {
    "id": "encore-critic",
    "chapter": 3,
    "room": "greenroom",
    "title": "The critic’s uninterrupted interview",
    "kind": "Verified record",
    "text": "The theatre newsletter livestream shows Jules Penn in the foyer continuously from 10:02 until 10:11. The booth is not accessible from the foyer without leaving the broadcast.",
    "eliminates": [
     "critic"
    ]
   },
   {
    "id": "encore-call",
    "chapter": 2,
    "room": "booth",
    "title": "Intercom archive: the paper delivery",
    "kind": "Verified record",
    "text": "The archive records a replacement rehearsal sheet delivered to the lighting booth at 10:06 and accepted with staff credential W-17. Its stock matches the unembossed result found after the blackout. The courier leaves without entering. Identify the holder using the independent personnel issue register.",
    "eliminates": [],
    "unlock": "phone",
    "proof": true
   },
   {
    "id": "encore-hint",
    "chapter": 2,
    "room": "stage",
    "title": "The electrician’s reminder",
    "kind": "Verified record",
    "text": "Nell: “A blackout can hide a paper swap. It cannot reach into a folder and edit a signature.” Compare the continuous recordings with the document stock.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "encore-gossip",
    "chapter": 3,
    "room": "greenroom",
    "title": "A room-service-grade alibi",
    "kind": "Verified record",
    "text": "The director wrote “Kit handled the booth” before changing the note to “the booth handled Kit.” Neither wording is a verified alibi.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "final-encore-credential",
    "chapter": 3,
    "room": "booth",
    "title": "Personnel issue register",
    "kind": "Verified cross-reference",
    "text": "Staff credential W-17 is issued only to Kit Vale. The photo-verified issue register records it in Kit’s possession before and after the blackout; it was not transferred. Stage credentials identify holders, not room locations. Cross-reference this with the independent intercom archive.",
    "eliminates": []
   }
  ],
  "contacts": [
   {
    "number": "4216",
    "chapter": 2,
    "sourceId": "encore-photo",
    "evidenceId": "encore-call",
    "name": "Stage intercom archive",
    "transcript": "Archived stage message, ten oh six PM. Replacement rehearsal sheet delivered to the lighting booth. Receipt authenticated with staff credential W seventeen. Courier departed without entering. The replacement used ordinary rehearsal stock. End of recording."
   }
  ],
  "timeline": [],
  "decoy": {
   "recordId": "encore-gossip",
   "title": "The director’s note",
   "explanation": "An opinion about Kit is not an alibi. The uninterrupted recordings, booth window, and independent delivery archive establish the case."
  },
  "endingStory": "The continuous footage clears five crew members. Kit Vale alone had access without a verified alibi. The archive ties Kit to the replacement sheet in the booth during the blackout, and the paper examination establishes the method.",
  "report": "Result restored. Blackout explained. The director is marketing it as immersive theatre."
 },
 "night-train": {
  "title": "The Night Train",
  "description": "A closed-carriage murder. Match the service records to the real time window.",
  "art": "last-alibi-night-train-v1.svg",
  "time": "11:20–11:26 PM",
  "chapters": [
   {
    "title": "Six Tickets, One Missing Passenger",
    "label": "Case briefing",
    "story": "Financier Victor Sloane is found dead in his private rail compartment. The investigator’s report confirms a deliberately tampered nightcap consumed during 11:20–11:26 PM. The carriage doors were sealed from 11:15; only six named passengers and crew were aboard. Nobody can leave before the next station. The conductor would still like everyone to rate the journey."
   },
   {
    "title": "The Sealed Carriage",
    "label": "Act I",
    "story": "Establish who remained on camera during the incident. A photograph of the carriage telephone contains the extension for the sealed service archive. The number matters; the decorative timetable does not."
   },
   {
    "title": "Service with a Secret",
    "label": "Act II",
    "story": "The drinks were prepared under observation. The tampering happened later in the private compartment, inside the incident window. A service call can distinguish an innocent delivery from the return visit."
   },
   {
    "title": "Before the Next Station",
    "label": "Act III",
    "story": "Cross-check every continuous alibi. The archive identifies the return visit, while the investigator’s report establishes the method. File the person, compartment and tampered nightcap together; a bad motive alone proves nothing."
   }
  ],
  "rooms": [
   {
    "id": "compartment",
    "name": "Private Compartment",
    "art": "study"
   },
   {
    "id": "dining-car",
    "name": "Dining Car",
    "art": "dining"
   },
   {
    "id": "observation",
    "name": "Observation Car",
    "art": "gallery"
   }
  ],
  "methods": [
   "A tampered nightcap",
   "A staged fall",
   "An attack with luggage"
  ],
  "cast": [
   {
    "id": "steward",
    "name": "Marin Bell",
    "title": "Sleeping-car steward",
    "intro": "Marin says the service is discreet. The complaints are not.",
    "secret": "Marin feared Sloane would expose falsified carriage accounts."
   },
   {
    "id": "conductor",
    "name": "Rex March",
    "title": "Conductor",
    "intro": "Rex apologizes for delays, including conversational ones.",
    "secret": "Rex had promised an unscheduled stop."
   },
   {
    "id": "writer",
    "name": "Iris Quill",
    "title": "Travel writer",
    "intro": "Iris has never met a window she could not describe as brooding.",
    "secret": "Iris sold a private interview without permission."
   },
   {
    "id": "broker",
    "name": "Lena Frost",
    "title": "Broker",
    "intro": "Lena knows the price of everything except silence.",
    "secret": "Sloane had rejected Lena’s business proposal."
   },
   {
    "id": "chef",
    "name": "Theo Salt",
    "title": "Dining-car chef",
    "intro": "Theo insists the soup was the only thing with a motive.",
    "secret": "Theo used an expensive bottle without authorization."
   },
   {
    "id": "violinist",
    "name": "Pip Arden",
    "title": "Violinist",
    "intro": "Pip travels with three cases and only one explanation.",
    "secret": "Pip hid an unpaid fare notice in the instrument case."
   }
  ],
  "solution": {
   "killer": "steward",
   "scene": "compartment",
   "object": "A tampered nightcap"
  },
  "proofRecords": [
   "train-call"
  ],
  "evidence": [
   {
    "id": "train-window",
    "chapter": 1,
    "room": "compartment",
    "title": "The investigator’s incident report",
    "kind": "Verified record",
    "text": "The investigator confirms the nightcap was deliberately tampered with in the private compartment during 11:20–11:26 PM and consumed immediately. The sealed carriage contained only the six listed people. Earlier preparation in the kitchen was continuously recorded and was not the criminal act.",
    "eliminates": []
   },
   {
    "id": "train-observation",
    "chapter": 1,
    "room": "observation",
    "title": "The observation-car recording",
    "kind": "Verified record",
    "text": "The observation-car camera continuously shows Iris Quill and Pip Arden from 11:18–11:29. Neither leaves. The private compartment is two separate doors away.",
    "eliminates": [
     "writer",
     "violinist"
    ]
   },
   {
    "id": "train-photo",
    "chapter": 1,
    "room": "compartment",
    "title": "Photograph: the carriage telephone",
    "kind": "Verified record",
    "text": "The service archive extension is printed on a small brass plate beneath the receiver. Inspect the photograph closely before dialing.",
    "eliminates": [],
    "photo": {
     "asset": "./assets/last-alibi-night-train-evidence-v1.svg",
     "caption": "A four-digit extension is engraved beneath the receiver.",
     "details": [
      {
       "label": "Read the service label",
       "text": "Recorded-message extension 6402. Dial these four digits in the case phone.",
       "x": 77,
       "y": 78
      }
     ]
    }
   },
   {
    "id": "train-dining",
    "chapter": 2,
    "room": "dining-car",
    "title": "The dining-car pass camera",
    "kind": "Verified record",
    "text": "Theo Salt and Lena Frost remain in the dining car continuously from 11:19–11:28, with a single wide camera showing both exits. Neither has access to the compartment during the incident.",
    "eliminates": [
     "chef",
     "broker"
    ]
   },
   {
    "id": "train-punch",
    "chapter": 3,
    "room": "observation",
    "title": "The sealed-door inspection",
    "kind": "Verified record",
    "text": "A continuous staff training recording shows Rex March in the guard’s vestibule throughout 11:20–11:26, demonstrating the sealed-door check. Its clock is synchronized to the investigator’s time.",
    "eliminates": [
     "conductor"
    ]
   },
   {
    "id": "train-call",
    "chapter": 2,
    "room": "compartment",
    "title": "Service archive: the return visit",
    "kind": "Verified record",
    "text": "The preserved compartment call logs a return nightcap at 11:23, authenticated by service credential T-6. The corridor log records that same credential entering and leaving, with no other entry during the incident. The crew service register identifies its holder. This is the return visit after harmless kitchen preparation.",
    "eliminates": [],
    "unlock": "phone",
    "proof": true
   },
   {
    "id": "train-hint",
    "chapter": 2,
    "room": "dining-car",
    "title": "The chef’s correction",
    "kind": "Verified record",
    "text": "Theo: “A tray leaving my kitchen is not an alibi for everything that happens to it afterward.” The tampering window is the compartment visit, not the original preparation.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "train-ticket",
    "chapter": 3,
    "room": "observation",
    "title": "A very confident timetable",
    "kind": "Verified record",
    "text": "The printed timetable says “Every journey is an experience.” It contains no passenger location data. The investigator has declined to accept it as evidence.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "night-train-credential",
    "chapter": 3,
    "room": "compartment",
    "title": "The crew service register",
    "kind": "Verified cross-reference",
    "text": "Service credential T-6 belongs to Marin Bell and remained in Marin’s possession throughout this journey. The register is checked against continuous issue-desk footage. Use it to identify the credential in the service call; possession alone does not establish a compartment visit.",
    "eliminates": []
   }
  ],
  "contacts": [
   {
    "number": "6402",
    "chapter": 2,
    "sourceId": "train-photo",
    "evidenceId": "train-call",
    "name": "Carriage service archive",
    "transcript": "Preserved service call, eleven twenty-three PM. Return nightcap requested in the private compartment. Service credential T six authenticated the delivery. Corridor log confirms one entry and departure under that credential. No other entry during the incident window."
   }
  ],
  "timeline": [],
  "decoy": {
   "recordId": "train-ticket",
   "title": "The printed timetable",
   "explanation": "The timetable describes planned travel, not where the suspects were. The synchronized continuous recordings and compartment archive establish opportunity."
  },
  "endingStory": "Five continuous alibis exclude the other passengers and crew. Marin Bell makes the only compartment visit during the confirmed tampering window. The preserved call and corridor log support the accusation; the kitchen footage does not excuse the later return visit.",
  "report": "Case closed before the next station. The journey survey remains aggressively optimistic."
 },
 "last-hand": {
  "title": "The Last Hand",
  "description": "A tournament-room switch. Inspect the seals and uncover who changed the deck.",
  "art": "last-alibi-last-hand-v1.svg",
  "time": "9:10–9:14 PM",
  "chapters": [
   {
    "title": "The Queen Nobody Invited",
    "label": "Case briefing",
    "story": "A demonstration poker final is halted when an inventory check finds a duplicate queen in the competition deck. The sealed original deck had been checked at 9:10; the altered deck was discovered at 9:14 in the dealer’s prep room. Only six people had authorized access. Nobody is being asked to wager anything. The commentator has nevertheless declared it a historic upset."
   },
   {
    "title": "Seal Before You Deal",
    "label": "Act I",
    "story": "A deck label proves which pack was inspected, not who touched it later. Find the hidden extension in the prep-room photograph and call the audit recorder after the second evidence packet opens."
   },
   {
    "title": "The Missing Four Minutes",
    "label": "Act II",
    "story": "Continuous records place four suspects elsewhere. The original seal was broken and replaced; no play at the public table could have created the duplicate. Look for the replacement-deck handover."
   },
   {
    "title": "Show Your Work",
    "label": "Act III",
    "story": "The final alibi and the recorded handover leave one person with the opportunity. Explain the replacement, name the prep room, and support the conclusion with the audit call. A confident poker face is not a verified alibi."
   }
  ],
  "rooms": [
   {
    "id": "prep",
    "name": "Dealer’s Prep Room",
    "art": "study"
   },
   {
    "id": "table",
    "name": "Demonstration Table",
    "art": "dining"
   },
   {
    "id": "lounge",
    "name": "Players’ Lounge",
    "art": "gallery"
   }
  ],
  "methods": [
   "A replacement deck",
   "A marked table surface",
   "A mistaken score entry"
  ],
  "cast": [
   {
    "id": "dealer",
    "name": "Cleo Voss",
    "title": "Dealer",
    "intro": "Cleo can deal with anything except a follow-up question.",
    "secret": "Cleo had promised to help a sponsor’s guest look impressive."
   },
   {
    "id": "commentator",
    "name": "Finn Slate",
    "title": "Commentator",
    "intro": "Finn narrates a glass of water as a comeback story.",
    "secret": "Finn rehearsed the wrong winner’s announcement."
   },
   {
    "id": "sponsor",
    "name": "Mara Gold",
    "title": "Sponsor",
    "intro": "Mara is here for brand visibility, preferably somebody else’s.",
    "secret": "Mara tried to change the seating order."
   },
   {
    "id": "player",
    "name": "Noel Pike",
    "title": "Finalist",
    "intro": "Noel claims to read faces. Receipts are apparently harder.",
    "secret": "Noel kept a lucky card sleeve against the rules."
   },
   {
    "id": "auditor",
    "name": "Sana Reed",
    "title": "Auditor",
    "intro": "Sana brought three pens and trusts none of them.",
    "secret": "Sana misplaced a draft inventory sheet earlier."
   },
   {
    "id": "photographer",
    "name": "Dex Frame",
    "title": "Photographer",
    "intro": "Dex says the camera adds ten suspicions.",
    "secret": "Dex sold a backstage photograph without permission."
   }
  ],
  "solution": {
   "killer": "dealer",
   "scene": "prep",
   "object": "A replacement deck"
  },
  "proofRecords": [
   "hand-call"
  ],
  "evidence": [
   {
    "id": "hand-window",
    "chapter": 1,
    "room": "prep",
    "title": "The checked inventory",
    "kind": "Verified record",
    "text": "The auditor’s continuous inventory recording verifies a complete original deck and intact serial seal at 9:10. At 9:14 the replacement deck with a duplicate queen is found in the prep room. The switch happened there during those four minutes; the original pack never reached the public table.",
    "eliminates": []
   },
   {
    "id": "hand-camera",
    "chapter": 1,
    "room": "table",
    "title": "The public-table wide shot",
    "kind": "Verified record",
    "text": "Finn Slate and Noel Pike remain continuously visible at the demonstration table throughout 9:10–9:14. Both exits and both people remain in frame. Neither visits the prep room.",
    "eliminates": [
     "commentator",
     "player"
    ]
   },
   {
    "id": "hand-photo",
    "chapter": 1,
    "room": "prep",
    "title": "Photograph: the seal cabinet",
    "kind": "Verified record",
    "text": "A tiny service label beside the seal drawer contains the audit-recorder extension. Inspect it rather than guessing from the large deck serial.",
    "eliminates": [],
    "photo": {
     "asset": "./assets/last-alibi-last-hand-evidence-v1.svg",
     "caption": "The small label below the seal drawer is an extension, not the deck serial.",
     "details": [
      {
       "label": "Read the service label",
       "text": "Recorded-message extension 8725. Dial these four digits in the case phone.",
       "x": 77,
       "y": 78
      }
     ]
    }
   },
   {
    "id": "hand-lounge",
    "chapter": 2,
    "room": "lounge",
    "title": "The sponsor interview",
    "kind": "Verified record",
    "text": "A continuous sponsor interview keeps Mara Gold and Dex Frame in the players’ lounge from 9:08 until 9:17. The wide recording shows they do not leave.",
    "eliminates": [
     "sponsor",
     "photographer"
    ]
   },
   {
    "id": "hand-seal",
    "chapter": 2,
    "room": "prep",
    "title": "Two seals, two inventories",
    "kind": "Verified record",
    "text": "The pack found at 9:14 has a newly issued replacement seal and a different deck serial. The public table is untouched and the score entry was correct. The irregularity was introduced by replacing the deck in the prep room.",
    "eliminates": []
   },
   {
    "id": "hand-auditor",
    "chapter": 3,
    "room": "lounge",
    "title": "The audit-room video call",
    "kind": "Verified record",
    "text": "A continuous compliance video call shows Sana Reed at a separate lounge desk from 9:09 until 9:16. The shared inventory folder stays visible; Sana does not enter the prep room.",
    "eliminates": [
     "auditor"
    ]
   },
   {
    "id": "hand-call",
    "chapter": 2,
    "room": "prep",
    "title": "Audit recorder: the replacement pack",
    "kind": "Verified record",
    "text": "The recorder logs a replacement deck accepted in the prep room at 9:12 with credential D-9. Its serial matches the altered pack and replacement seal. The checked original serial is absent after the handover. Identify the credential holder from the prep inventory, then distinguish this replacement from the unrelated score sheet.",
    "eliminates": [],
    "unlock": "phone",
    "proof": true
   },
   {
    "id": "hand-hint",
    "chapter": 2,
    "room": "table",
    "title": "The auditor’s sticky note",
    "kind": "Verified record",
    "text": "Sana: “A duplicate queen does not grow from a wrong score. Compare the pack serial and the seal.” Trace the replacement, not the players’ personalities.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "hand-bluff",
    "chapter": 3,
    "room": "lounge",
    "title": "A suspiciously photogenic sleeve",
    "kind": "Verified record",
    "text": "Noel’s lucky sleeve violates the display rules, but the original deck never reached Noel’s table. The sleeve cannot explain the prep-room replacement.",
    "eliminates": [],
    "cost": 1
   },
   {
    "id": "last-hand-credential",
    "chapter": 3,
    "room": "prep",
    "title": "The prep credential inventory",
    "kind": "Verified cross-reference",
    "text": "Prep credential D-9 is assigned only to Cleo Voss. Its issue photograph and return scan match Cleo; no transfer is recorded or permitted. A credential’s owner is not proof of a deck switch until its use is matched to the audit recorder.",
    "eliminates": []
   }
  ],
  "contacts": [
   {
    "number": "8725",
    "chapter": 2,
    "sourceId": "hand-photo",
    "evidenceId": "hand-call",
    "name": "Deck audit recorder",
    "transcript": "Deck audit recorder. Nine twelve PM. Replacement pack accepted in dealer prep, authenticated under credential D nine. Replacement seal and serial match the stopped pack. Original checked pack not returned. End of record."
   }
  ],
  "timeline": [],
  "decoy": {
   "recordId": "hand-bluff",
   "title": "The lucky sleeve",
   "explanation": "A rule-breaking accessory is suspicious, but the deck was replaced before reaching the table. The seal and recorded handover prove the relevant act."
  },
  "endingStory": "Five uninterrupted alibis exclude everyone except Cleo Voss. The serial and seal establish a deck replacement in prep, and the independent audit call ties Cleo to that exact pack at 9:12. The score and lucky sleeve are unrelated.",
  "report": "Deck replaced. Result withdrawn. Commentator still calling it the hand of the century."
 }
};
