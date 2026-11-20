export interface SubtitleSegment {
  start: number; // dalam detik
  end: number;
  text: string;
}

// Frame exact saat bunyi "Hik!" muncul di audio (dalam detik)
export const HICCUP_TIMESTAMPS = [3.75, 5.5, 106.5, 159.2, 249.5];

export const SUBTITLES: SubtitleSegment[] = [
  { start: 0.45, end: 3.75, text: 'Pernah nggak kamu lagi serius ngobrol, tiba-tiba...' },
  { start: 3.75, end: 7.09, text: 'Hik! Lalu beberapa detik kemudian... Hik! Kamu coba' },
  { start: 7.09, end: 11.21, text: 'tahan nafas, minum air, bahkan dikagetin teman. Tapi' },
  { start: 11.21, end: 15.17, text: 'cegukannya tetap datang. Sebenarnya, siapa yang menekan tombol' },
  { start: 15.17, end: 20.41, text: 'HIK di dalam tubuh kita? Dan kenapa tubuh melakukan hal ini?' },
  { start: 21.09, end: 28.49, text: 'Cegukan adalah kejadian tubuh yang paling akrab, tapi juga paling aneh.' },
  { start: 28.49, end: 34.81, text: 'Datangnya mendadak, suaranya khas, dan biasanya cuma berlangsung sebentar.' },
  { start: 34.81, end: 42.67, text: 'Untuk memahami kenapa, kita perlu kenalan dengan satu otot: Diafragma.' },
  { start: 42.67, end: 48.47, text: 'Bayangkan paru-paru kita seperti dua balon di dalam dada.' },
  { start: 48.47, end: 55.43, text: 'Ada otot berbentuk kubah di bawah paru-paru yang mengatur udara: Diafragma.' },
  { start: 55.43, end: 65.53, text: 'Saat menarik nafas, diafragma bergerak turun, ruang dada membesar & udara masuk.' },
  { start: 65.53, end: 72.31, text: 'Saat mengembuskan nafas, diafragma rileks & bergerak naik seperti lantai lift.' },
  { start: 72.63, end: 83.03, text: 'Ketika lantai turun ruang membesar, ketika naik ruang mengecil secara otomatis.' },
  { start: 83.03, end: 91.01, text: 'Otak dan saraf mengatur ritmenya bahkan saat kita ngobrol, membaca, atau tidur.' },
  { start: 91.01, end: 98.25, text: 'Cegukan terjadi ketika diafragma tiba-tiba berkontraksi tanpa direncanakan.' },
  { start: 98.25, end: 105.35, text: 'Udara tersedot cepat, dan celah di antara pita suara menutup mendadak.' },
  { start: 105.35, end: 115.67, text: 'Udara tertahan lalu muncul bunyi "Hik!" dari penutupan pita suara.' },
  { start: 116.01, end: 125.77, text: 'Kenapa diafragma berkontraksi sendiri? Pemicunya: makan terlalu cepat & menelan udara.' },
  { start: 125.77, end: 135.43, text: 'Perut mengembang cepat & merangsang saraf, atau gas dari minuman bersoda.' },
  { start: 135.43, end: 145.81, text: 'Makanan pedas, perubahan suhu mendadak, atau tertawa sambil makan juga memicu cegukan.' },
  { start: 145.81, end: 155.99, text: 'Bayangkan diafragma seperti drummer penjaga irama yang tiba-tiba salah ketuk.' },
  { start: 155.99, end: 164.01, text: 'Satu kontraksi mendadak akibat gangguan sinyal saraf... lalu Hik!' },
  { start: 164.01, end: 179.07, text: 'Ilmuwan memahami mekanisme sarafnya, namun alasan evolusionernya masih misteri.' },
  { start: 179.07, end: 193.05, text: 'Trik menghentikan cegukan: menahan nafas, minum air perlahan, atau bernafas tenang.' },
  { start: 193.05, end: 204.01, text: 'Menahan nafas meningkatkan kadar CO2 yang memengaruhi sistem pengatur pernafasan.' },
  { start: 204.01, end: 214.63, text: 'Menelan air menggerakkan otot tenggorokan untuk mengganggu rangkaian refleks cegukan.' },
  { start: 214.63, end: 229.33, text: 'Hindari cara ekstrem! Jika cegukan singkat, cukup tunggu sampai refleksnya mereda.' },
  { start: 229.33, end: 241.71, text: 'Namun jika lebih dari 48 jam dan mengganggu tidur/aktivitas, konsultasikan ke dokter.' },
  { start: 241.71, end: 257.59, text: 'Kesimpulannya: kontraksi mendadak diafragma + pita suara menutup = bunyi "Hik!"' },
  { start: 257.59, end: 282.59, text: 'Trik apa yang biasanya kamu pakai? Tulis di komentar, like, dan subscribe!' },
];
