document.addEventListener('DOMContentLoaded', function() {

    // --- Pengaturan Feed ---
    const FILENAME = 'feed.xml';

    // --- Elemen DOM ---
    const generateBtn = document.getElementById('generate-btn');
    const statusOutput = document.getElementById('status-output');
    const startIndexInput = document.getElementById('start-index');
    const endIndexInput = document.getElementById('end-index');

    // --- Fungsi Bantuan ---
    function capitalizeEachWord(str) { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
    function generateSeoTitle(baseKeyword) { const hookWords = ['Best', 'Amazing', 'Cool', 'Inspiring', 'Creative', 'Awesome', 'Stunning', 'Beautiful', 'Unique', 'Ideas', 'Inspiration', 'Designs']; const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; const randomNumber = Math.floor(Math.random() * (200 - 55 + 1)) + 55; const capitalizedKeyword = capitalizeEachWord(baseKeyword); return `${randomNumber} ${randomHook} ${capitalizedKeyword}`; }

    /**
     * ▼▼▼ FUNGSI BARU: Menghasilkan Feed dalam Format RSS 2.0 ▼▼▼
     * @param {Array<string>} keywordList - Daftar keyword yang akan dimasukkan.
     * @param {string} siteUrl - URL dasar website.
     * @returns {string} String XML lengkap dalam format RSS 2.0.
     */
    function generateRssFeed(keywordList, siteUrl) {
        // Header RSS 2.0 sesuai permintaan
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0"
            xmlns:content="http://purl.org/rss/1.0/modules/content/"
            xmlns:wfw="http://wellformedweb.org/CommentAPI/"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:atom="http://www.w3.org/2005/Atom"
            xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
            xmlns:slash="http://purl.org/rss/1.0/modules/slash/">\n`;
        xml += `<channel>\n`;
        xml += `    <title>DecorInspire Feed</title>\n`;
        xml += `    <link>${siteUrl}</link>\n`;
        xml += `    <description>Latest Design and Decor Inspirations</description>\n`;
        xml += `    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />\n\n`;

        // Loop untuk setiap keyword dan buat <item>
        keywordList.forEach(keyword => {
            const title = generateSeoTitle(keyword);
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const articleUrl = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}`;
            const pubDate = new Date().toUTCString(); // Format: Sun, 09 Jun 2024 13:38:46 GMT

            // Membuat deskripsi dengan hashtag
            const capitalizedKeyword = capitalizeEachWord(keyword);
            const hashtag = capitalizedKeyword.replace(/\s/g, '');
            const description = `Craving new ideas for ${capitalizedKeyword}? Discover amazing concepts and stunning visuals. Click to get the full inspiration now! #${hashtag} #HomeDecor #DesignIdeas`;

            xml += `    <item>\n`;
            xml += `        <title>${title}</title>\n`;
            xml += `        <link>${articleUrl}</link>\n`;
            xml += `        <description>${description}</description>\n`;
            xml += `        <pubDate>${pubDate}</pubDate>\n`;
            xml += `        <enclosure url="${imageUrl}" type="image/jpeg" />\n`;
            xml += `    </item>\n`;
        });

        xml += `</channel>\n</rss>`;
        return xml;
    }

    // --- Logika Utama Saat Tombol Diklik ---
    generateBtn.addEventListener('click', async () => {
        // Baca nilai input dari form
        const start = parseInt(startIndexInput.value, 10);
        const end = parseInt(endIndexInput.value, 10);

        // Validasi input
        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
            statusOutput.textContent = 'Error: Invalid number range. Start number must be smaller than or equal to End number.';
            statusOutput.style.color = 'red';
            return;
        }

        try {
            statusOutput.textContent = 'Status: Fetching data...';
            statusOutput.style.color = '#333';
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

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

            // Potong array keyword sesuai rentang yang dipilih pengguna (menyesuaikan dengan index array 0-based)
            const keywordSelection = allKeywords.slice(start - 1, end);
            
            statusOutput.textContent = `Status: Generating feed with ${keywordSelection.length} items (from #${start} to #${end})...`;
            
            // Hasilkan konten XML dengan format baru
            const feedXml = generateRssFeed(keywordSelection, siteUrl);

            // Buat file dan picu unduhan
            const blob = new Blob([feedXml], { type: 'application/rss+xml;charset=utf-8' });
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
            console.error('Feed Generation Error:', error);
            statusOutput.textContent = `Error: ${error.message}`;
            statusOutput.style.color = 'red';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate & Download feed.xml';
        }
    });
});
