import type { Translation } from "../types";

export const tr: Translation = {
  "title": "Gargantua · Kara Delik Simülasyonu",
  "subtitle": "Süper kütleli kara delik · Gerçek zamanlı rölativistik simülasyon",
  "presets": {
    "cine": "Interstellar Görünümü",
    "kerr": "Kerr Gölgesi",
    "cerca": "Yakınlaşma",
    "arriba": "Kuşbakışı",
    "plano": "Disk Düzlemi"
  },
  "hud": "Yörüngede dönmek için sürükleyin · Yakınlaştırmak için kaydırın",
  "webglUnsupported": "Tarayıcınız WebGL teknolojisini desteklemiyor",
  "buttons": {
    "info": "Ne görüyorum?",
    "hideControls": "Kontrolleri gizle",
    "showControls": "Kontroller",
    "close": "Kapat"
  },
  "controls": {
    "spin": "Dönüş (Kerr Spini)",
    "intensity": "Disk Parlaklığı",
    "diskSpeed": "Disk Hızı",
    "diskTemp": "Disk Sıcaklığı",
    "glow": "Mercek Parıltısı",
    "stars": "Yıldızlar",
    "fov": "Görüş Alanı (FOV)",
    "autoRotate": "Otomatik Döndürme",
    "accretionDisk": "Yığılma Diski"
  },
  "info": {
    "title": "ARKASINDAKİ FİZİK",
    "metricTitle": "Kerr Metriği ve Spin: ",
    "metricDesc": "rölativistik dönen bir kara deliği simüle eder. Dönüş, uzay-zaman dokusunu sürükler (Lense-Thirring etkisi / çerçeve sürüklenmesi), bize doğru dönen taraftaki gölgeyi düzleştirerek karakteristik 'D' şeklinde bir siluet oluşturur.",
    "horizonTitle": "Olay Ufku ve Ergosfer: ",
    "horizonDesc": "olay ufku spin ile r+ = M + √(M²-a²) formülüne göre büzülür. Dışında, çerçevenin sürüklenmesi nedeniyle tüm maddeyi dönüş yönünde yörüngeye zorlayan ergosfer yer alır.",
    "iscoTitle": "En İç Kararlı Dairesel Yörünge (ISCO): ",
    "iscoDesc": "Bardeen-Press-Teukolsky formülü ile hesaplanır. Spin 0.95'e çıktığında diskin iç kenarı 3.0'dan 0.97'e çekilir, gazın çok daha derine inmesine ve muazzam kütleçekimsel enerji açığa çıkarmasına olanak tanır.",
    "lensingTitle": "Kütleçekimsel Merceklenme ve Foton Halkası: ",
    "lensingDesc": "her ışın, Kerr metriğinin tam bir sıfır jeodeziği boyunca geriye doğru izlenir (Kerr-Schild koordinatları): disk gölgenin üstünde ve altında görünür, yüksek mertebeden görüntüleri ise ince foton halkasını oluşturur.",
    "dopplerTitle": "Doppler Etkisi ve Işıma (Beaming): ",
    "dopplerDesc": "gördüğümüz ışık g·T sıcaklığındaki bir kara cismin ışığıdır; g, Doppler kaymasını ve kütleçekimsel kırmızıya kaymayı birleştirir (bolometrik şiddet ∝ g⁴): bize yaklaşan taraf daha parlak ve beyaz, uzaklaşan taraf daha sönük ve kırmızı görünür."
  }
};
