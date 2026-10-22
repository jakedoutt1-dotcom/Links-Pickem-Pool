# Venue self-service

Public setup page: `/new-build/venue-manager.html`.

Managers create an existing LINKS identity account and verify their email through the existing signup flow. Each account owns one newly created venue. There is no owner approval step. Venue ownership is assigned on the server; posted partner IDs cannot claim or edit other listings. Existing address matches require use of the existing account or an administrator-assisted connection; legacy venues are never claimed by name alone.

The first publish records the manager’s authorization and agreement to display LINKS flyers, then adds an active venue to the existing `links_partners` feed. Updating a venue preserves its admin-controlled house pool and private details. Managers can pause their public listing.

Logo recommendation: 1200 x 600 transparent PNG, artwork filling the image without oversized blank margins. Square artwork also works. One upload is optimized to at most 512 KiB, retaining aspect ratio; existing displays use `object-fit: contain`. There are wide and compact previews. No upload can guarantee tiny lettering stays legible on every small screen.

GPS setup requires visiting the venue or entering its coordinates, plus checking the map. The street address is not automatically geocoded. Offers show automatically in existing placements when location is permitted; uncertain matches remain labelled as nearby until confirmed. The browser checks again every minute while visible and enabled. Nearby venue browsing includes venues within about 3 km. No background geofencing or tracking occurs while LINKS is closed.

Signup QR: available in LINKS Admin’s venue presentation sharing area and on the public manager page, plus the end of the venue presentation. A printable SVG is in `/partner-kit/LINKS-Venue-Signup-QR.svg`. Use this signup code for managers; guests should continue using the appropriate game or venue play code.
