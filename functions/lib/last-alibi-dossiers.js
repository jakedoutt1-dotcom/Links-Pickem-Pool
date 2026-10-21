// Original long-form LINKS case expansions. All clue text and deductions are authored here.
const record=(id,chapter,title,text,kind='Recovered document')=>({id,chapter,title,text,kind,eliminates:[]});
const task=(title,prompt,answers,evidence,hints)=>({title,prompt,answers,evidence,hints});
export const DOSSIERS={
 'midnight-desk':{
 art:'last-alibi-midnight-desk-v1.png',
 chapters:[
 ['The Service Corridor','The manager has handed over a floor plan, a porter’s schedule and a damaged delivery docket. None is a complete account. Reconstruct which route the docket describes before requesting the next archive packet. The most direct path on the plan may not have been open.'],
 ['The Collector’s Address','A private collector used a nickname instead of an address. The correspondence and dispatch index use different conventions. Recover the destination by connecting them. The letter is evidence of an intended delivery, not proof that a parcel actually left.'],
 ['After Midnight','Two timestamps appear to place a movement after the courier arrived. They came from the same uncorrected scanner. Establish which clock is trustworthy before drawing a timeline. A neat printed receipt can be wrong without being forged.']],
 records:[
 record('hotel-route-plan',2,'Service plan — level two','NORTH PASSAGE: desk to lounge, no luggage access. WEST SERVICE: desk to luggage through stair S2, delivery channel C. EAST LIFT: desk to luggage through lift L1, channel A. On the plan, double doors are staff-controlled; dotted lines are proposed alterations, not existing routes.'),
 record('hotel-porter-book',2,'Porter’s duty book','23:40–00:10: channel A suspended for engineering isolation. Channel C remains open for hand-carried parcels. Channel B is guest laundry only and cannot reach the luggage office. Entries are signed by the duty engineer, not the bell captain.'),
 record('hotel-torn-docket',2,'The torn movement docket','The destination half is missing. Remaining fields: ORIGIN: reception. ROUTE: WEST SERVICE. HANDLING: hand-carried. DO NOT USE PROPOSED CONNECTOR. The token after CHANNEL has torn away. Restore the stair identifier and delivery channel from independent records.'),
 record('hotel-carpet',2,'Housekeeping complaint','A guest reported muddy shoe marks beside the proposed connector. Housekeeping photographed them at 22:10, before the theft. The complaint proves somebody stood by a wall; it does not establish a working corridor or a movement during the incident.'),
 record('hotel-letter',4,'An unsigned instruction card','The card reads: “Remember all vouchers end nightly.” Beneath it: “An initial introduction is sufficient. Use the dispatch index, not the guest register.” The handwriting is not identified. Preserve its exact wording and compare it with the index convention.'),
 record('hotel-dispatch-index',4,'Collectors’ dispatch index','Entries: CEDAR — Dock 2; RAVEN — Dock 4; ORCHID — Dock 6; AMBER — Dock 1. The index maps account aliases to collection points. The hotel log records intentions separately from completed exports. An account alias is not a person’s name.'),
 record('hotel-export-totals',4,'Export reconciliation','Tonight: three planned collections, two cancelled, one held at reception. Completed external exports after 23:45: zero. The held charity parcel remains sealed. An intended destination cannot be used as evidence that the sapphire reached a collector.'),
 record('hotel-red-envelope',4,'The red envelope','“Please return my blue umbrella.” No dispatch reference, no parcel number. Its stamp is yesterday’s. It resembles the collector’s stationery but cannot be linked to tonight’s movement by appearance alone.'),
 record('hotel-scanner-test',5,'Scanner calibration — simultaneous test','At network time 23:54 the luggage scanner displayed 23:57. The scanner was not reset before 00:10. Its offset stayed constant across midnight. The reception clock and network server agree.'),
 record('hotel-hold-ticket',5,'Held-parcel scan','The held parcel was rescanned at scanner time 00:01. The scanner identifier matches the calibration sheet. A clerk annotated “after midnight — surely too late,” but annotations do not correct device clocks. Determine the network time of this rescan.'),
 record('hotel-shift-handover',5,'Shift handover sheet','The incoming clerk signs at network time 23:59. Outgoing clerk reports the parcel already held at reception. Neither clerk claims to have watched the original packing. The handover gives a latest custody bound, not the identity of the packer.'),
 record('hotel-spare-badge',5,'A spare badge photograph','A decorative staff pin lies in the lost-property drawer. It has no electronic credential or personal code. It resembles a service badge in a blurred photograph. Physical resemblance is not authenticated access.')],
 tasks:[
 task('Reconstruct the service route','Give the stair identifier and delivery channel used by the torn docket.',['s2 c'],['hotel-route-plan','hotel-porter-book'],['A proposed corridor is not an existing route.','Match WEST SERVICE on the plan with the channel that remained open.']),
 task('Recover the collection point','Give the collector account alias and its dock number.',['raven dock4','raven dock 4'],['hotel-letter','hotel-dispatch-index'],['The card tells you how to introduce its words.','Read their initials, then consult a different document for the destination.']),
 task('Correct the held-parcel scan','Give the network time of the 00:01 scan and the scanner’s offset in minutes.',['23:58 3'],['hotel-scanner-test','hotel-hold-ticket'],['Use simultaneous readings, not the clerk’s annotation.','Carry the clock correction across midnight.'])]},
 'final-encore':{
 art:'last-alibi-final-encore-cinematic-v2.png',
 chapters:[
 ['The Route Behind the Curtain','Theatre staff call several different passages “backstage.” Reconstruct the route to the lighting booth from an old plan and the current closure sheet. A photograph of an open doorway does not tell you where the passage ends.'],
 ['The Misordered Cue Reel','A four-line technical insert has been filed out of order. The stage manager’s numbering convention predates the printed sheet. Reassemble the instruction and use the stores register to identify which cage should be inspected.'],
 ['Frames Without a Clock','The work camera has no trustworthy wall-clock display. A continuous recording can still be timed if you establish its frame rate and starting event. Test the claimed duration without accepting the operator’s handwritten estimate.']],
 records:[
 record('encore-floorplan',2,'Backstage route survey','BOOTH ACCESS: north stair N3 from west passage. FLY ACCESS: ladder F2 from east passage. ORCHESTRA ACCESS: stair O1 from foyer. There is no internal door between the fly gallery and lighting booth. The dashed crossover is an unbuilt alteration.'),
 record('encore-closures',2,'Tonight’s closure sheet','East passage closed before the show; north stair remains open to authorized staff. The public foyer connects only to orchestra stair O1. The booth can be reached from west passage without crossing the camera view on the main stage.'),
 record('encore-door-photo',2,'Doorway survey notes','A photograph shows a door marked N beside a folded scenic flat. The photographer’s reverse note says: “West passage, looking toward the foot of the north stair.” The letter is a route marker, not a person’s initial.'),
 record('encore-prop-list',2,'The understudy’s prop request','“One ladder, one moon, no actual rain.” The requested ladder remained in the prop store. A request is not a record of collection or access to the booth.'),
 record('encore-cue-fragment',4,'Detached four-line insert','Printed lines, top to bottom: 1 A; 2 L; 3 R; 4 I. A pencilled instruction reads “Follow the running order on the rehearsal slate. This is a location instruction, not dialogue.” No name appears.'),
 record('encore-rehearsal-slate',4,'Rehearsal running order','For the detached insert only, the agreed running order is 3, 1, 4, 2. The printed top-to-bottom sequence is a compositor’s layout and was never used by the stage crew.'),
 record('encore-stores',4,'Scenic stores register','RAIL equipment — cage C6. ROPE equipment — cage B4. LIGHT spares — cage A2. MUSIC folios — cage D1. The cage describes where the related delivery sleeve was stored; it does not identify who collected it.'),
 record('encore-applause-meter',4,'Audience response printout','The loudest applause came during the blackout. The meter has no voice identification and measures the public auditorium. It cannot place a particular staff member in the lighting booth.'),
 record('encore-camera-spec',5,'Work camera specification','Constant recording rate: 25 frames each second. No dropped frames in the preserved segment. The segment begins at the blackout start, independently fixed at 22:04:00. The camera’s decorative clock overlay was disabled.'),
 record('encore-reel-count',5,'Preserved reel count','The delivery sleeve enters view exactly 3,000 frames after the start marker. Frame numbering begins at zero; the marker itself is the reference instant. The operator wrote “about five minutes” from memory. Compute the actual elapsed seconds and arrival time.'),
 record('encore-light-test',5,'Emergency lighting report','Emergency lamps stayed lit throughout the blackout. The work camera image did not cut out. A power interruption to the stage controller did not erase the camera’s continuous count.'),
 record('encore-review-draft',5,'An unfinished review','“A five-minute descent into darkness.” The writer admits the phrase was drafted before rehearsal. It is literary description, not a measured interval.')],
 tasks:[
 task('Find the viable booth approach','Give the stair identifier and the passage from which it is reached.',['n3 west passage'],['encore-floorplan','encore-closures'],['Treat dashed alterations and real doorways differently.','The public foyer does not lead to the lighting booth.']),
 task('Reassemble the technical insert','Give the decoded equipment word and its stores cage.',['rail c6'],['encore-cue-fragment','encore-rehearsal-slate','encore-stores'],['The printed line order is not the running order.','Use the slate’s sequence first; the stores register supplies the second half.']),
 task('Time the sleeve’s arrival','Give the elapsed seconds and the arrival time in 24-hour format.',['120 22:06','120 22:06:00'],['encore-camera-spec','encore-reel-count'],['Convert frames to seconds before adding them to a clock.','A remembered estimate does not override a continuous recording.'])]},
 'night-train':{
 art:'last-alibi-night-train-cinematic-v2.png',
 chapters:[
 ['The Carriage That Changed Its Numbers','A replacement carriage was coupled on before departure. The printed ticket and current door plates use different designations. Establish which compartment the service request actually named before blaming a passenger who occupied yesterday’s berth number.'],
 ['The Reversed Dispatch','A discarded telegram looks like a name but follows a railway copying convention. Decode the account key, then connect it to the dispatch book. The account belongs to the investigation, not automatically to the killer.'],
 ['A Return Visit Out of Time','A service printer and a station clock disagree. A later correction was never applied to the printed ticket. Establish the true time of a return visit and distinguish that visit from the harmless original tray preparation.']],
 records:[
 record('train-carriage-map',2,'Replacement carriage plan','Current private compartments: C2 corresponds to old berth 1; C4 corresponds to old berth 3; C6 corresponds to old berth 5. The observation car uses A-designations and the dining car D-designations. Door C4 opens onto the sealed service corridor.'),
 record('train-ticket-stub',2,'The passenger’s retained ticket','Service request written at 23:07: “Return tray to old berth 3, not dining.” The stub predates the replacement carriage. A second hand wrote “update from plan before service.” Neither inscription identifies the staff member who later carried the tray.'),
 record('train-coupling-book',2,'Coupling and numbering notice','The replacement private carriage was attached before any passenger boarded. Its C-designations remained unchanged for the whole journey. Old berth numbers survive only on tickets printed before the substitution.'),
 record('train-luggage-claim',2,'A luggage complaint','A passenger reports a red case beside C6 at 22:50. The complaint predates the tampering window and does not describe any tray. Similar-looking cases were issued by the travel company.'),
 record('train-telegram',4,'Carbon telegram — KRAL','The carbon reads: “KRAL / consult dispatch entry, keep the original.” The station stamp is genuine, but no personal name or destination is written. The short key may follow the copying rules in the telegraph office circular.'),
 record('train-copying-rule',4,'Telegraph office circular','For four-letter account keys copied onto the reverse carbon, read the letters from right to left. Do not reverse the digits in the dispatch book. This convention applies to account keys, not ordinary passenger names.'),
 record('train-dispatch-book',4,'Dispatch account ledger','Account LARK — entry 17, sealed correspondence. Account WREN — entry 42, lost property. Account TERN — entry 26, catering. Entry numbers identify folders, not compartment numbers. The LARK folder contains an interview request, not a confession.'),
 record('train-newspaper',4,'A station newspaper','The headline refers to a scandal in another city. A pencilled circle surrounds a bird illustration. Nobody has authenticated the pencil mark. It is not enough to select a dispatch entry.'),
 record('train-printer-test',5,'Service printer synchronization test','At station reference time 23:20, the service printer showed 23:24. Both readings were photographed at the same instant. No reset occurred before midnight. The printer’s time is ahead; the station reference is correct.'),
 record('train-return-ticket',5,'Return-service ticket','Printer time 23:27: private-compartment return tray acknowledged. The printer serial matches the synchronization test. The kitchen preparation log concerns an earlier visit and cannot supply an alibi for this return.'),
 record('train-platform-check',5,'Platform marshal’s note','The service printer had shown the same offset at departure. The marshal did not see who made the return visit. This note corroborates clock behaviour but cannot identify the carrier.'),
 record('train-old-menu',5,'Last month’s dinner menu','A hand-written “23:30” appears beside coffee. The menu predates this journey. A reused piece of stationery is not a synchronized service record.')],
 tasks:[
 task('Find the requested compartment','Give the current compartment code and the old berth number on the request.',['c4 3'],['train-carriage-map','train-ticket-stub'],['A ticket number and a current door plate need not match.','Use the replacement-carriage mapping, not a nearby luggage complaint.']),
 task('Find the dispatch folder','Give the decoded account key and the dispatch entry number.',['lark 17'],['train-telegram','train-copying-rule','train-dispatch-book'],['Check which part of a message the copying rule applies to.','Decode the letters before consulting the ledger; leave its numbers alone.']),
 task('Reconstruct the return time','Give the return visit’s reference time and the printer offset in minutes.',['23:23 4'],['train-printer-test','train-return-ticket'],['The original kitchen visit and later compartment visit are different events.','A fast printer clock must be corrected backwards.'])]},
 'last-hand':{
 art:'last-alibi-last-hand-cinematic-v2.png',
 chapters:[
 ['Two Packs, One Sleeve','The dealer’s preparation sleeve has been reused. Match the original pack with its issue record rather than trusting the sleeve’s printed title. The checksum is a clerical consistency check, not proof of who held the pack.'],
 ['The Queen in the Contact Sheet','A cropped card photograph omits the suit corner. The inspection contact sheet preserves the full frame elsewhere. Reconcile the matching marks and identify which card was duplicated. Do not assume all queens are interchangeable.'],
 ['The Delayed Recorder','A camera display is late and an audit receipt is on reference time. Establish when the sealed replacement reached the preparation desk. The same correction cannot be applied twice just because two documents show a clock.']],
 records:[
 record('hand-pack-issue',2,'Pack issue ledger','Original demonstration pack: G482, seal R6, digit checksum 14. Spare pack: G483, seal R9, digit checksum 15. A checksum here is the sum of the three serial digits. Both packs have the same decorative outer sleeve.'),
 record('hand-sleeve-photo',2,'Sleeve inventory photograph','The retained original-issue label has serial G482 but the discarded sleeve is stamped R9. Sleeves can be moved between packs. Identify the original pack and its registered seal from the independent ledger, not the sleeve alone.'),
 record('hand-stock-policy',2,'Demonstration stock policy','The original pack is checked before use. Replacement packs require a separate acceptance record and a new seal. A reused outer sleeve carries no authenticated chain of custody.'),
 record('hand-score-draft',2,'A corrected score draft','A pencilled 18 was changed to 19 before the demonstration. The change is countersigned by the auditor. A score correction does not establish a physical deck substitution.'),
 record('hand-card-crop',4,'Card photograph — cropped corner','The crop shows a queen with a small printing mark shaped like a diamond beside the border. The suit itself is missing from the crop. This mark is a printer reference, not the suit symbol.'),
 record('hand-contact-sheet',4,'Printer contact-sheet index','Border reference DIAMOND maps to frame 12; CIRCLE to frame 7; TRIANGLE to frame 3. Frame numbers are photographic indices, not card ranks. Compare the border mark before opening a frame.'),
 record('hand-full-frame',4,'Full-frame annotations','Frame 12: queen of hearts. Frame 7: queen of clubs. Frame 3: queen of spades. Each frame retains the same border reference as its crop. The stopped replacement deck contains two copies of the card in frame 12.'),
 record('hand-table-banter',4,'Commentator’s rehearsal card','“Every queen has a secret.” The line was written before the pack was opened. It does not identify a suit or a substitution method.'),
 record('hand-recorder-test',5,'Prep recorder offset test','At reference time 21:10 the prep recorder displayed 21:12. The recorder remained two minutes fast. The independent audit receipt uses reference time and must not be corrected.'),
 record('hand-delivery-frame',5,'Sealed-pack delivery frame','The sealed replacement crosses the prep threshold at recorder time 21:14. The recorder serial matches the offset test. The delivery itself is visible, but the carrier’s face is outside the frame. Establish the reference time before comparing the audit receipt.'),
 record('hand-issue-return',5,'Credential issue and return','The dealer-prep credential was issued at reference time 21:08 and returned at 21:16. The clerk recorded possession at both ends; the final inventory will identify its holder. This sheet bounds possession, not the deck’s movements.'),
 record('hand-lucky-token',5,'A player’s lucky token','A small heart-shaped token is found at the public table. It was visible in the pre-show photograph. Its shape resembles a suit symbol, but it cannot identify the duplicated card in a pack that never reached the table.')],
 tasks:[
 task('Reconstruct the original pack','Give the original pack serial and its registered seal.',['g482 r6'],['hand-pack-issue','hand-sleeve-photo'],['An outer sleeve is transferable.','Use the issue ledger to distinguish the original pack from its later packaging.']),
 task('Identify the duplicated card','Give the card rank, suit and contact-sheet frame number.',['queen hearts 12','queen of hearts 12'],['hand-card-crop','hand-contact-sheet','hand-full-frame'],['A printer’s border mark is not a card’s suit.','Follow the crop to the index and then to the full frame.']),
 task('Align the delivery and audit','Give the delivery’s reference time and the recorder offset in minutes.',['21:12 2'],['hand-recorder-test','hand-delivery-frame'],['Only the camera display needs correction.','Keep the reference-time audit receipt unchanged.'])]},
 'sunken-observatory':{
 art:'last-alibi-observatory-cinematic-v2.png',
 chapters:[
 ['The Route Above the Tide','An old site map includes a causeway that is not always passable. The crate handling limits and tide measurements matter more than the map’s thickest line. Reconstruct which internal route could carry a survey crate during the incident.'],
 ['Three Stars, One Sequence','A field notebook lists three constellations without coordinates. The observatory plate supplies those coordinates, but a later catalogue uses a different naming order. Reconstruct the original sequence rather than sorting the stars alphabetically.'],
 ['The Hour That Wasn’t Missing','The vault ledger is on island time and the marine radio is on UTC. A missing hour appears only if you compare them as though they used the same clock. Align the records before interpreting a transfer as an unexplained second movement.']],
 records:[
 record('obs-site-plan',2,'Island service plan','Internal vault routes: NORTH BRIDGE is an elevated covered walkway; SOUTH CAUSEWAY crosses a tidal channel; WEST LADDER permits personnel only. The launch jetty is outside the locked expedition boundary. Routes marked in grey were abandoned during restoration.'),
 record('obs-tide-table',2,'Measured tide levels','18:10 channel depth 0.8 m; 18:15 depth 1.4 m; 18:20 depth 1.8 m. The causeway deck floods above 1.0 m. Measurements are actual, not a prediction, and the incident transfer occurred at 18:15.'),
 record('obs-handling-note',2,'Survey crate handling limits','SC-8 requires a level wheeled route. It cannot be carried on a personnel ladder. The covered north bridge remains level and dry at all measured tides. No lift, boat or improvised pulley was used.'),
 record('obs-old-postcard',2,'An old island postcard','A dry causeway appears beneath a bright sky. The image is dated twelve years earlier and has no tide reading. A historical photograph is not tonight’s access record.'),
 record('obs-notebook',4,'Astronomer’s field sequence','Observe ORION, then LYRA, then CYGNUS. Write each plate coordinate in that order; do not substitute the later catalogue’s alphabetical ordering. The sequence refers to marked plate positions, not the real constellations’ changing positions in the sky.'),
 record('obs-star-plate',4,'Instrument plate index','ORION — B2. CYGNUS — C1. LYRA — D4. DRACO — A3. The engraved grid is a local instrument index, not latitude and longitude. Preserve both letter and digit for each position.'),
 record('obs-catalogue',4,'Revised alphabetical catalogue','Catalogue entries are alphabetized for storage only. Its introduction warns that an observation sequence in a field notebook must be preserved. Alphabetical order would identify the same positions in the wrong sequence.'),
 record('obs-meteor-note',4,'A visitor’s meteor sketch','A bright streak is drawn above the dome with no measured bearing or timestamp. A dramatic sky does not establish a crate movement or a person’s location.'),
 record('obs-time-convention',5,'Island and marine clock convention','Throughout the expedition, island reference time is UTC plus one hour. No daylight-saving adjustment occurs that night. The radio log labels every entry UTC; the vault ledger labels entries ISLAND.'),
 record('obs-radio-log',5,'Marine custody transmission','17:15 UTC: survey crate SC-8 held at the internal vault exit. No departure authorization issued. The radio operator repeats the UTC label on the signed transcript. Compare the convention before matching the vault transfer.'),
 record('obs-vault-time',5,'Vault ledger time key','The SC-8 transfer is recorded at 18:15 ISLAND. The signature confirms the same crate serial as the marine transmission. One event appears in two time conventions; the records do not imply two separate transfers.'),
 record('obs-lost-watch',5,'An unwound wristwatch','A visitor’s watch stopped at 16:42 two days earlier. Its owner disclosed the fault at arrival. An uncalibrated personal watch cannot establish the incident timeline.')],
 tasks:[
 task('Find the crate’s viable route','Give the usable route and the measured channel depth at the transfer time.',['north bridge 1.4','northbridge 1.4'],['obs-site-plan','obs-tide-table','obs-handling-note'],['A personnel route may not carry a wheeled crate.','Test the causeway against the measured tide, then compare the handling limits.']),
 task('Reconstruct the star sequence','Enter the three plate coordinates in the original observation order.',['b2 d4 c1'],['obs-notebook','obs-star-plate'],['The catalogue’s order is not the observation order.','Preserve the field notebook’s sequence and look up each coordinate separately.']),
 task('Align the custody transmission','Give the radio entry’s island time and the number of minutes added to UTC.',['18:15 60'],['obs-time-convention','obs-radio-log'],['Both records state their time convention.','One hour is a conversion, not an unexplained interval.'])]}
};
export const packetCount=s=>s.dossierVersion>=2?6:3;
export function expandDossier(s){
 const d=DOSSIERS[s.caseId];if(!(s.dossierVersion>=2)||!d||!s.case)return;
 const remap=n=>({1:1,2:3,3:6}[n]||n);
 for(const e of s.case.evidence)e.chapter=remap(e.chapter);
 for(const c of s.case.contacts||[])c.chapter=remap(c.chapter);
 for(const p of s.case.puzzles||[])p.chapter=remap(p.chapter);
 const rooms=s.case.scene.id;
 for(const r of d.records){const e={...r,room:rooms,inspect:[{label:'Read the recovered document',text:r.text},{label:'Record provenance',text:'An original case-file exhibit. Compare its source, date and limits against other evidence; inclusion is not a claim that every detail is relevant.'}]};s.case.evidence.push(e)}
}
export function dossierChapters(base,s){if(!(s.dossierVersion>=2))return base;const d=DOSSIERS[s.caseId];return [base[0],base[1],{title:d.chapters[0][0],label:'Packet 2',story:d.chapters[0][1]},base[2],{title:d.chapters[1][0],label:'Packet 4',story:d.chapters[1][1]},{title:d.chapters[2][0],label:'Packet 5',story:d.chapters[2][1]},base[3]]}

// Exact, accessible document tables: generated scene art never supplies a required digit.
const TABLES={
 'hotel-route-plan':[['Route','Connection','Identifier','Channel'],[['North passage','Desk → lounge','—','—'],['West service','Desk → luggage','S2','C'],['East lift','Desk → luggage','L1','A']]],
 'hotel-dispatch-index':[['Account','Collection point'],[['CEDAR','Dock 2'],['RAVEN','Dock 4'],['ORCHID','Dock 6'],['AMBER','Dock 1']]],
 'encore-floorplan':[['Destination','Approach','Access'],[['Lighting booth','West passage','North stair N3'],['Fly gallery','East passage','Ladder F2'],['Orchestra','Public foyer','Stair O1']]],
 'encore-cue-fragment':[['Printed line','Mark'],[['1','A'],['2','L'],['3','R'],['4','I']]],
 'encore-stores':[['Equipment','Cage'],[['RAIL','C6'],['ROPE','B4'],['LIGHT','A2'],['MUSIC','D1']]],
 'train-carriage-map':[['Current compartment','Old berth'],[['C2','1'],['C4','3'],['C6','5']]],
 'train-dispatch-book':[['Account','Entry','Folder'],[['LARK','17','Sealed correspondence'],['WREN','42','Lost property'],['TERN','26','Catering']]],
 'hand-pack-issue':[['Pack','Serial','Seal','Checksum'],[['Original','G482','R6','14'],['Spare','G483','R9','15']]],
 'hand-contact-sheet':[['Border reference','Frame'],[['DIAMOND','12'],['CIRCLE','7'],['TRIANGLE','3']]],
 'hand-full-frame':[['Frame','Full card'],[['12','Queen of hearts'],['7','Queen of clubs'],['3','Queen of spades']]],
 'obs-tide-table':[['Island time','Measured depth'],[['18:10','0.8 m'],['18:15','1.4 m'],['18:20','1.8 m']]],
 'obs-star-plate':[['Constellation mark','Plate coordinate'],[['ORION','B2'],['CYGNUS','C1'],['LYRA','D4'],['DRACO','A3']]]
};
for(const d of Object.values(DOSSIERS))for(const r of d.records)if(TABLES[r.id])r.exhibit={columns:TABLES[r.id][0],rows:TABLES[r.id][1]};
