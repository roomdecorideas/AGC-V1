// File: detect-adblock.js

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi variabel global. Jika ads.js terblokir, nilainya tidak akan berubah.
    window.canRunAds = false;

    // Fungsi untuk menampilkan pesan peringatan
    function showAdBlockWarning() {
        const overlay = document.getElementById('adblock-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            // Menonaktifkan scroll di background
            document.body.style.overflow = 'hidden';
        }

        const reloadBtn = document.getElementById('reload-page-btn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', function() {
                // Saat tombol diklik, paksa refresh dari server (bukan cache)
                window.location.reload(true);
            });
        }
    }

    // Fungsi utama untuk memeriksa AdBlock
    function checkAdBlock() {
        // Umpan 1: Memuat skrip 'ads.js'
        const adScript = document.createElement('script');
        adScript.src = 'ads.js';
        adScript.onerror = function() {
            // Jika skrip gagal dimuat (error), berarti diblokir.
            window.canRunAds = false;
        };
        document.body.appendChild(adScript);

        // Umpan 2: Membuat elemen div dengan class yang sering diblokir
        const baitElement = document.createElement('div');
        baitElement.className = 'adsbox ad-container text-ad banner_ad'; // Nama class yang umum jadi target
        baitElement.style.position = 'absolute';
        baitElement.style.left = '-9999px';
        baitElement.style.height = '1px';
        baitElement.style.width = '1px';
        document.body.appendChild(baitElement);
        
        // Beri waktu bagi AdBlocker untuk bereaksi (150 milidetik)
        setTimeout(function() {
            // Periksa kedua umpan
            const adBlockerIsActive = (window.canRunAds === false) || (baitElement.offsetHeight === 0);
            
            // Hapus elemen umpan setelah pengecekan selesai
            document.body.removeChild(baitElement);
            
            if (adBlockerIsActive) {
                console.warn('AdBlocker detected!');
                showAdBlockWarning();
            } else {
                console.log('AdBlocker not detected.');
            }
        }, 150);
    }

    // Jalankan pengecekan
    checkAdBlock();
});
