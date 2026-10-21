# Last Alibi dedicated clue phone setup

Status: provider-ready code and local tests only. No live phone number has been obtained or activated. The owner chose a new dedicated number and has not yet approved/provided a funded phone-service account. Never use the owner's personal feedback phone as the clue line.

## Proposed service

Twilio Programmable Voice can answer a real incoming call, gather keypad input, and play a hosted recording. One owned number serves all cases. Players enter an eight-digit private case access code, then the hidden four-digit extension from an evidence image. Successful access adds the transcript to that player's private notebook.

Official references:

- https://www.twilio.com/en-us/voice/pricing/us (reviewed October 20, 2026): US local number listed at $1.15/month plus $0.0085/minute for incoming local calls, before applicable taxes, fees or optional features. Confirm current account charges before purchasing. Games remain free; these are operator phone-service costs.
- https://www.twilio.com/docs/voice/twiml/gather
- https://www.twilio.com/docs/voice/twiml/play
- https://www.twilio.com/docs/usage/security

## Connection steps after account/number approval

1. Create/fund an account controlled by the site owner and obtain one voice-capable dedicated number. Do not purchase without explicit approval for the service and recurring cost.
2. In private hosting settings set LAST_ALIBI_CLUE_PHONE to the owned E.164 number, TWILIO_AUTH_TOKEN to its account auth token, and TWILIO_ACCOUNT_SID to the matching account SID. Do not paste these secrets into chat, the repository, or public JavaScript.
3. Configure the number's incoming Voice webhook to POST https://linkspickempools.com/new-build/api/mystery-phone . The exact HTTPS URL and parameters are signed and checked; do not rewrite it through an unrelated redirect.
4. Upload original recorded MP3/WAV clue messages to the site's own audio path. LAST_ALIBI_CLUE_RECORDINGS is an optional JSON map such as {"midnight-desk:7314":"/new-build/audio/midnight-desk-7314.mp3"}. Only HTTPS URLs on this site's origin ending in MP3/WAV are played. Without a recording, the connector reads the authored script using the provider's voice; this is a real incoming call, but not a human-recorded MP3.
5. Set provider spending/usage alerts and protect the account. Then make an expressly authorized live test call, verify the correct private clue arrives, and confirm wrong/expired/other-player access is rejected. No live calls are placed by the local test suite.

## Security and privacy

The webhook verifies Twilio HMAC-SHA1, destination number, and account SID when configured. Codes map to one room and private seat, expire with the room, and are not available to anonymous users or TV screens. Clues remain chapter/source gated and cannot be unlocked by the browser preview endpoint in configured mode. A version-checked room update preserves concurrent gameplay. Caller phone numbers are neither stored nor exposed by this application; the phone provider may retain its own call logs. Calls are not recorded by this implementation.

The page exposes a tel link only after private service configuration is complete. Before activation it clearly says the line is not connected and provides a testing preview. Keep this distinction explicit when demonstrating or advertising the feature.

Tests: tests/last-alibi-phone.mjs and tests/last-alibi-phone-access.mjs validate locally with synthetic requests and credentials; they do not prove that a purchased real number is connected.
