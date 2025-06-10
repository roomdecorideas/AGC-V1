document.addEventListener('DOMContentLoaded', async function() {

    // --- Pengaturan Sitemap Otomatis ---
    const MAX_URLS = 5000;

    // --- Elemen DOM ---
    const sitemapOutputElement = document.getElementById('sitemap-output');

    // --- Fungsi Bantuan ---
    function capitalizeEachWord(str) { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
    function generateSeoTitle(baseKeyword) { const hookWords = ['Best', 'Amazing', 'Cool', 'Inspiring', 'Creative', 'Awesome', 'Stunning', 'Beautiful', 'Unique', 'Ideas', 'Inspiration', 'Designs']; const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; const randomNumber = Math.floor(Math.random() * (200 - 55 + 1)) + 55; const capitalizedKeyword = capitalizeEachWord(baseKeyword); return `${randomNumber} ${randomHook} ${capitalizedKeyword}`; }
    function escapeXml(unsafe) { return unsafe.replace(/[<>&'"]/g, function (c) { switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '\'': return '&apos;'; case '"': return '&quot;'; } }); }

    /**
     * Menghasilkan sitemap dalam format XML standar dengan ekstensi gambar.
     * @param {Array<string>} keywordList - Daftar keyword yang akan dimasukkan ke sitemap.
     * @param {string} siteUrl - URL dasar website.
     * @returns {string} String XML yang lengkap.
     */
    function generateSitemapXml(keywordList, siteUrl) {
        // Menggunakan tanggal dan waktu saat ini untuk semua entri
        const lastmod = new Date().toISOString();

        // Header dari Sitemap XML, dengan namespace untuk gambar
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

        // Loop untuk setiap keyword dan buat blok <url>
        keywordList.forEach(keyword => {
            if (!keyword) return;

            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const pageUrl = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            
            // Siapkan data untuk blok gambar
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}`;
            const imageTitle = generateSeoTitle(keyword);

            xml += '  <url>\n';
            xml += `    <loc>${pageUrl}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`; // Tanggal hari ini
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '    <image:image>\n';
            xml += `        <image:loc>${imageUrl}</image:loc>\n`;
            xml += `        <image:title>${escapeXml(imageTitle)}</image:title>\n`;
            xml += '    </image:image>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }

    /**
     * Fungsi inisialisasi yang berjalan otomatis saat halaman dimuat.
     */
    async function initializeAutomaticSitemap() {
        try {
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            // Ambil hingga 5000 keyword pertama secara berurutan
            const sitemapKeywords = allKeywords.slice(0, MAX_URLS);

            if (sitemapKeywords.length > 0) {
                const sitemapXml = generateSitemapXml(sitemapKeywords, siteUrl);
                sitemapOutputElement.textContent = sitemapXml;
            } else {
                sitemapOutputElement.textContent = 'Error: No keywords found to generate sitemap.';
            }

        } catch (error) {
            console.error('Sitemap Generation Error:', error);
            sitemapOutputElement.textContent = `Error: ${error.message}`;
        }
    }

    // Jalankan semua proses secara otomatis
    initializeAutomaticSitemap();
});
