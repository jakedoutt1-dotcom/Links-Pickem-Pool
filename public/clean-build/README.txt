LINKS CLEAN BUILD v5

Small-file architecture:
css/theme.css - shared New Build visual system
js/core.js - shared fetch/query/escape helpers
admin/index.html + admin/admin.js - commissioner UI/player loading
nfl/index.html - NFL module entry/navigation
year-standings.html - season standings view
index.html - explanatory LINKS homepage

Legacy/New Build APIs remain the data source during migration. Do not duplicate database tables or player identity. Replace one module at a time only after QA.
