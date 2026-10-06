Race Bar Studio
One-time setup
Push this repo to GitHub, deploy the root to Vercel (Framework "Other", no build).
Put your single shared track at `assets/music.mp3` (used by every video).
Per video
In the UI: upload CSV, set title / text / thumbnail photos, copy SEO. Click "Download config.json".
Save it into the `configs/` folder with a unique name, e.g. `configs/video-02.json`. Commit.
Render
GitHub → Actions → "Render videos" → Run workflow. Leave config = `configs` to render ALL configs in one run, or type one file path (e.g. `configs/video-02.json`). Download MP4s from Artifacts (kept 7 days).
Local: `npm i \&\& node render.js configs out assets/music.mp3`
