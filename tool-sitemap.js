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

    // --- Logika Utama Saat Tombol Diklik ---
    generateBtn.addEventListener('click', async () => {
        // Baca nilai input dari form
        let start = parseInt(startIndexInput.value, 10);
        let end = parseInt(endIndexInput.value, 10);

        // Validasi input
        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
            statusOutput.textContent = 'Error: Invalid number range. Start number must be smaller than or equal to End number.';
            statusOutput.style.color = 'red';
            return;
        }

        // Terapkan batas maksimum 5000
        if (end > MAX_URLS_LIMIT) {
            end = MAX_URLS_LIMIT;
            endIndexInput.value = end; // Update tampilan di input box
            statusOutput.textContent = `Warning: End number was capped at the maximum limit of ${MAX_URLS_LIMIT}.`;
            statusOutput.style.color = 'orange';
        } else {
             statusOutput.textContent = 'Status: Waiting for action...';
             statusOutput.style.color = '#333';
        }

        try {
            // Update status dan nonaktifkan tombol
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            statusOutput.textContent = 'Status: Fetching data...';

            // Ambil URL dari domain.txt
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            // Ambil keywords dari keyword.txt
            statusOutput.textContent = 'Status: Reading keywords...';
            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');
            
            if (start > allKeywords.length) {
                throw new Error(`Start number (${start}) is greater than the total number of keywords (${allKeywords.length}).`);
            }

            // Potong array keyword sesuai rentang yang dipilih pengguna
            const keywordSelection = allKeywords.slice(start - 1, end);
            statusOutput.textContent = `Status: Generating sitemap with ${keywordSelection.length} URLs (from #${start} to #${end})...`;

            // Hasilkan konten XML
            const sitemapXml = generateSitemapXml(keywordSelection, siteUrl);

            // Buat file dan picu unduhan
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
            // Aktifkan kembali tombol setelah selesai
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate & Download sitemap.xml';
        }
    });
});
