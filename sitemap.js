document.addEventListener('DOMContentLoaded', async function() {

    const MAX_URLS = 5000;
    const sitemapOutputElement = document.getElementById('sitemap-output');

    function generateSitemapXml(keywordList, siteUrl) {
        const today = new Date().toISOString().slice(0, 10);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        keywordList.forEach(keyword => {
            if (!keyword) return;

            // ▼▼▼ PERUBAHAN DI SINI: Menggunakan format URL baru untuk sitemap ▼▼▼
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

    async function initializeSitemap() {
        try {
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('File domain.txt tidak ditemukan.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('File domain.txt kosong.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('File keyword.txt tidak ditemukan.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            const sitemapKeywords = allKeywords.slice(0, MAX_URLS);

            if (sitemapKeywords.length > 0) {
                const sitemapXml = generateSitemapXml(sitemapKeywords, siteUrl);
                sitemapOutputElement.textContent = sitemapXml;
            } else {
                sitemapOutputElement.textContent = 'Error: Tidak ada keyword ditemukan untuk membuat sitemap.';
            }

        } catch (error) {
            console.error('Error generating sitemap:', error);
            sitemapOutputElement.textContent = `Error: ${error.message}`;
        }
    }

    initializeSitemap();
});
