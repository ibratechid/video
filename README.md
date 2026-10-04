# Race Bar Studio — panduan langkah demi langkah

## A. Siapkan & deploy UI
1. Buat repo baru di GitHub, lalu push seluruh isi folder ini (termasuk `.github/` dan `assets/`).
2. Buka vercel.com → Add New Project → pilih repo → Framework "Other", tanpa build command → Deploy.
3. Buka URL Vercel kamu: itu adalah UI generator.

## B. Buat video di UI
1. Upload CSV (`date,A,B,C` atau `date,name,value`) atau pakai data contoh.
2. Atur judul, tema, durasi, FPS, teks tambahan. Buat thumbnail dan salin SEO.
3. Musik: pilih file musik untuk preview. Isi "Path musik di repo", contoh `assets/music.mp3`. Atur volume dan fade out.
4. Draft cepat: klik "Rekam WebM" (musik ikut terekam).

## C. Render MP4 HD di GitHub Actions
1. Klik "Unduh config.json" di UI.
2. Di repo: ganti `config.json` di root dengan file itu, dan taruh musik di `assets/music.mp3` (nama harus sama dengan field path musik; batas file Git 100 MB).
3. Commit dan push ke branch utama.
4. GitHub → tab Actions → "Render video" → Run workflow. Isi config (default `config.json`), audio (boleh kosong), dan nama output.
5. Tunggu selesai (durasi 30 detik @30fps sekitar beberapa menit). Buka run tersebut → Artifacts → unduh MP4. Artifact disimpan 7 hari.

## D. Render lokal (opsional)
`npm i && node render.js config.json out.mp4 [musik.mp3]` (butuh Node 18+ dan ffmpeg).
