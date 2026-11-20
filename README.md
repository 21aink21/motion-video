# Remotion 3D Explainer: Kenapa Kita Bisa Cegukan?

Proyek video explainer 3D (16:9, 1920x1080, 60fps) menggunakan Remotion, Three.js, React Three Fiber, Drei, dan Tailwind CSS.

## Cara Menjalankan di GitHub Codespaces (Lewat HP Android)

1. Buat repository baru di GitHub, lalu upload seluruh isi folder ini (ekstrak file ZIP terlebih dahulu).
2. Di halaman repository GitHub, klik tombol **Code** -> tab **Codespaces** -> **Create codespace on main**.
3. Tunggu instalasi otomatis (`npm install`) selesai.
4. Drag & drop dua file aset berikut ke panel Explorer di Codespaces:
   - `public/voiceover.mp3` (audio voiceover kamu)
   - `public/models/lungs.glb` (model 3D paru-paru)
5. Jalankan preview di terminal Codespaces:
   ```bash
   npm run dev
   ```
6. Buka tab **Ports**, klik ikon globe (*Open in Browser*) pada port `3000` untuk melihat preview di Chrome Android (aktifkan mode *Desktop Site*).
7. Untuk render menjadi MP4:
   ```bash
   npm run render
   ```
   File hasil render akan muncul di `out/explainer-cegukan.mp4`.
