document.addEventListener('DOMContentLoaded', function() {

    // --- Pengaturan Sitemap ---
    const MAX_URLS_LIMIT = 5000;
    const FILENAME = 'sitemap.xml';

    // --- Elemen DOM ---
    const generateBtn = document.getElementById('generate-btn');
    const statusOutput = document.getElementById('status-output');
    const startIndexInput = document.getElementById('start-index');
    const endIndexInput = document.getElementById('end-index');

    // --- Fungsi Bantuan ---

    function capitalizeEachWord(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function generateSeoTitle(baseKeyword) {
        const hookWords = ['Best', 'Amazing', 'Cool', 'Inspiring', 'Creative', 'Awesome', 'Stunning', 'Beautiful', 'Unique', 'Ideas', 'Inspiration', 'Designs'];
        const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)];
        const randomNumber = Math.floor(Math.random() * (200 - 55 + 1)) + 55;
        const capitalizedKeyword = capitalizeEachWord(baseKeyword);
        return `${randomNumber} ${randomHook} ${capitalizedKeyword}`;
    }
    
    // ▼▼▼ FUNGSI BANTUAN BARU: Untuk menghindari error pada karakter spesial di XML ▼▼▼
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }


    /**
     * ▼▼▼ FUNGSI UTAMA GENERATOR SITEMAP (DIMODIFIKASI) ▼▼▼
     * Menghasilkan sitemap dalam format XML standar dengan tambahan ekstensi gambar.
     * @param {Array<string>} keywordList - Daftar keyword yang akan dimasukkan ke sitemap.
     * @param {string} siteUrl - URL dasar website.
     * @returns {string} String XML yang lengkap.
     */
    function generateSitemapXml(keywordList, siteUrl) {
        const today = new Date().toISOString().slice(0, 10);

        // Header dari Sitemap XML, dengan tambahan namespace untuk gambar (xmlns:image)
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
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            
            // ▼▼▼ BLOK GAMBAR BARU DITAMBAHKAN DI SINI ▼▼▼
            xml += '    <image:image>\n';
            xml += `        <image:loc>${imageUrl}</image:loc>\n`;
            xml += `        <image:title>${escapeXml(imageTitle)}</image:title>\n`;
            xml += '    </image:image>\n';
            
            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }

    // --- Logika Utama Saat Tombol Diklik (Tidak ada perubahan di sini) ---
    generateBtn.addEventListener('click', async () => {
        let start = parseInt(startIndexInput.value, 10);
        let end = parseInt(endIndexInput.value, 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
            statusOutput.textContent = 'Error: Invalid number range. Start number must be smaller than or equal to End number.';
            statusOutput.style.color = 'red';
            return;
        }

        if (end > MAX_URLS_LIMIT) {
            end = MAX_URLS_LIMIT;
            endIndexInput.value = end;
            statusOutput.textContent = `Warning: End number was capped at the maximum limit of ${MAX_URLS_LIMIT}.`;
            statusOutput.style.color = 'orange';
        } else {
             statusOutput.textContent = 'Status: Waiting for action...';
             statusOutput.style.color = '#333';
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            statusOutput.textContent = 'Status: Fetching data...';

            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');
            
            if (start > allKeywords.length) {
                throw new Error(`Start number (${start}) is greater than the total number of keywords (${allKeywords.length}).`);
            }

            const keywordSelection = allKeywords.slice(start - 1, end);
            statusOutput.textContent = `Status: Generating sitemap with ${keywordSelection.length} URLs and images...`;

            const sitemapXml = generateSitemapXml(keywordSelection, siteUrl);

            const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = FILENAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            statusOutput.textContent = `Status: Success! ${FILENAME} has been generated and download has started.`;
            statusOutput.style.color = 'green';

        } catch (error) {
            console.error('Sitemap Generation Error:', error);
            statusOutput.textContent = `Error: ${error.message}`;
            statusOutput.style.color = 'red';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate & Download sitemap.xml';
        }
    });
});
