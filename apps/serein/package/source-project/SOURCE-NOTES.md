# Serein 5.1.1 source
Read README.md and docs/v5.1/RASTER-UPDATE.md. Run npm ci on first setup, then npm run build, npm run check and npm test. Node 24.19.0 and Python 3.12.14 were used. Ordinary builds use prebuilt image assets and need only Python standard libraries; scripts/optimise-infographics.py additionally needs Pillow when preparing reviewed replacement artwork.
Original generated PNGs live in artwork/infographics; prompt/hash metadata is in infographics-raster.json. Never substitute SVG/code-drawn posters for these raster images. Keep the data source and original PNGs with the project.
The English extraction script relies on Node's private bundled Acorn API; check before upgrading Node. Older phase tools, source-content.json and asset-map.json are historical snapshots, not the current build inputs.
No node_modules, Git history, credentials or original Sites binding is included. Test records/passphrases are synthetic fixtures.
