import type { Translation } from "../types";

export const id: Translation = {
  "title": "Gargantua · Simulasi Lubang Hitam",
  "subtitle": "Lubang hitam supermasif · Simulasi relativistik waktu nyata",
  "presets": {
    "cine": "Tampilan Interstellar",
    "kerr": "Bayangan Kerr",
    "cerca": "Pendekatan Dekat",
    "arriba": "Tampak Atas",
    "plano": "Bidang Piringan"
  },
  "hud": "Tarik untuk mengorbit · Gulir untuk memperbesar",
  "webglUnsupported": "Peramban Anda tidak mendukung WebGL",
  "buttons": {
    "info": "Apa yang saya lihat?",
    "hideControls": "Sembunyikan kontrol",
    "showControls": "Kontrol",
    "close": "Tutup"
  },
  "controls": {
    "quality": "Kualitas",
    "qualityLevels": [
      "Rendah",
      "Sedang",
      "Tinggi"
    ],
    "spin": "Rotasi (Spin Kerr)",
    "intensity": "Kecerahan Piringan",
    "diskSpeed": "Kecepatan Piringan",
    "diskTemp": "Suhu Piringan",
    "glow": "Cincin Foton",
    "stars": "Bintang-bintang",
    "fov": "Zoom Lensa",
    "autoRotate": "Rotasi Otomatis",
    "accretionDisk": "Piringan Akresi"
  },
  "info": {
    "title": "FISIKA DI BALIKNYA",
    "metricTitle": "Metrik Kerr dan Spin: ",
    "metricDesc": "mensimulasikan lubang hitam dengan rotasi relativistik. Putaran menyeret struktur ruang-waktu (efek Lense-Thirring / frame dragging), meratakan bayangan di sisi yang berputar ke arah kita menjadi siluet berbentuk \"D\" yang khas.",
    "horizonTitle": "Cakrawala Peristiwa dan Ergosfer: ",
    "horizonDesc": "cakrawala peristiwa menyusut seiring bertambahnya spin sesuai r+ = M + √(M²-a²). Di luarnya terdapat ergosfer, di mana efek seretan memaksa semua materi mengorbit searah putaran.",
    "iscoTitle": "Orbit Melingkar Stabil Terdalam (ISCO): ",
    "iscoDesc": "dihitung dengan rumus Bardeen-Press-Teukolsky. Saat spin naik menjadi 0.95, tepi dalam piringan menyusut dari 3.0 ke 0.95, memungkinkan gas menukik jauh lebih dalam dan melepaskan energi gravitasi dahsyat.",
    "lensingTitle": "Lensa Gravitasi & Cincin Foton: ",
    "lensingDesc": "setiap sinar cahaya mengikuti geodesik nol yang diintegrasikan dengan Verlet simplektik tingkat ke-2 dengan memperhitungkan percepatan gravitomagnetik.",
    "dopplerTitle": "Efek Doppler dan Beaming Relativistik: ",
    "dopplerDesc": "gas prograde yang bergerak ke arah pengamat mengalami pergeseran biru yang intens dan penguatan cahaya kuartik (δ⁴)."
  }
};
