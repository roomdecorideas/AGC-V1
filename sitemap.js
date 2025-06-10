document.addEventListener('DOMContentLoaded', function() {

    // --- Pengaturan Sitemap ---
    const MAX_URLS = 5000;
    const FILENAME = 'sitemap.xml';

    // --- Elemen DOM ---
    const generateBtn = document.getElementById('generate-btn');
    const statusOutput = document.getElementById('status-output');

    // --- Fungsi Bantuan ---
    function generateSitemapXml(keywordList, siteUrl) {
        const today = new Date().toISOString().slice(0, 10);
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        keywordList.forEach(keyword => {
            if (!keyword) return;
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const loc = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            xml += '  <url>\n';
            xml += `    <loc>${loc}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });
        xml += '</urlset>';
        return xml;
    }

    // --- Logika Utama ---
    generateBtn.addEventListener('click', async () => {
        try {
            // 1. Update status dan nonaktifkan tombol
            statusOutput.textContent = 'Status: Fetching data...';
            statusOutput.style.color = '#333';
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

            // 2. Ambil URL dari domain.txt
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            // 3. Ambil keywords dari keyword.txt
            statusOutput.textContent = 'Status: Reading keywords...';
            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            // 4. Batasi jumlah keyword
            const sitemapKeywords = allKeywords.slice(0, MAX_URLS);
            statusOutput.textContent = `Status: Found ${allKeywords.length} keywords, processing ${sitemapKeywords.length} for the sitemap...`;

            // 5. Hasilkan konten XML
            const sitemapXml = generateSitemapXml(sitemapKeywords, siteUrl);

            // 6. Buat file dan picu unduhan
            const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = FILENAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href); // Membersihkan memori

            statusOutput.textContent = `Status: Success! ${FILENAME} has been generated and download has started.`;
            statusOutput.style.color = 'green';

        } catch (error) {
            console.error('Sitemap Generation Error:', error);
            statusOutput.textContent = `Error: ${error.message}`;
            statusOutput.style.color = 'red';
        } finally {
            // 7. Aktifkan kembali tombol setelah selesai
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate & Download sitemap.xml';
        }
    });
});
