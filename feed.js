document.addEventListener('DOMContentLoaded', async function() {

    // --- Pengaturan Feed ---
    const feedTitle = 'DecorInspire - Daily Design Ideas';
    const feedDescription = 'Fresh and inspiring decor ideas for your home, garden, and more.';
    const authorName = 'DecorInspire';

    // --- Elemen DOM ---
    const feedOutputElement = document.getElementById('feed-output');


    // --- Fungsi Bantuan ---
    function capitalizeEachWord(str) { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
    function generateSeoTitle(baseKeyword) { const hookWords = ['Best', 'Amazing', 'Cool', 'Inspiring', 'Creative', 'Awesome', 'Stunning', 'Beautiful', 'Unique', 'Ideas', 'Inspiration', 'Designs']; const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; const randomNumber = Math.floor(Math.random() * (200 - 55 + 1)) + 55; const capitalizedKeyword = capitalizeEachWord(baseKeyword); return `${randomNumber} ${randomHook} ${capitalizedKeyword}`; }
    function escapeXml(unsafe) { return unsafe.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'})[c]); }


    /**
     * ▼▼▼ FUNGSI BARU: Menghasilkan Feed dalam Format RSS 2.0 untuk Pinterest ▼▼▼
     * Menggunakan namespace Google Merchant (g:) yang dipahami dengan baik oleh Pinterest.
     * @param {Array<string>} keywordList - Daftar keyword yang akan dimasukkan.
     * @param {string} siteUrl - URL dasar website.
     * @returns {string} String XML lengkap.
     */
    function generatePinterestRss(keywordList, siteUrl) {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
        xml += `<channel>\n`;
        xml += `    <title>${escapeXml(feedTitle)}</title>\n`;
        xml += `    <link>${siteUrl}</link>\n`;
        xml += `    <description>${escapeXml(feedDescription)}</description>\n`;
        xml += `    <atom:link href="${siteUrl}/feed.html" rel="self" type="application/rss+xml" />\n\n`;

        const today = new Date();

        keywordList.forEach((keyword, index) => {
            const title = generateSeoTitle(keyword);
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const articleUrl = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}`;
            
            // Membuat tanggal hari ini dengan waktu acak
            const randomDate = new Date(today.getTime());
            randomDate.setHours(Math.floor(Math.random() * 24));
            randomDate.setMinutes(Math.floor(Math.random() * 60));
            randomDate.setSeconds(Math.floor(Math.random() * 60));
            const pubDate = randomDate.toUTCString();

            const capitalizedKeyword = capitalizeEachWord(keyword);
            const hashtag = capitalizedKeyword.replace(/\s/g, '');
            const description = `Discover one of the ${title}. Explore visual galleries and creative concepts related to ${capitalizedKeyword}. Perfect for your next project! #${hashtag} #HomeDecor #DesignInspiration`;

            xml += `    <item>\n`;
            xml += `        <g:id>${escapeXml(articleUrl)}</g:id>\n`; // ID unik untuk setiap item
            xml += `        <title>${escapeXml(title)}</title>\n`;
            xml += `        <link>${escapeXml(articleUrl)}</link>\n`;
            xml += `        <description>${escapeXml(description)}</description>\n`;
            xml += `        <g:image_link>${escapeXml(imageUrl)}</g:image_link>\n`; // Tag gambar yang disukai Pinterest
            xml += `        <g:availability>in stock</g:availability>\n`;
            xml += `        <pubDate>${pubDate}</pubDate>\n`;
            xml += `    </item>\n`;
        });

        xml += `</channel>\n</rss>`;
        return xml;
    }


    /**
     * ▼▼▼ FUNGSI UTAMA BARU: Mengatur logika harian dan pembuatan feed ▼▼▼
     */
    async function initializeAutoFeed() {
        try {
            // --- Logika untuk menentukan jumlah item harian (50-100) ---
            const todayStr = new Date().toISOString().slice(0, 10);
            const storedDate = localStorage.getItem('pinterestFeedDate');
            let itemCount;

            if (storedDate === todayStr && localStorage.getItem('pinterestItemCount')) {
                // Gunakan jumlah yang sudah disimpan untuk hari ini
                itemCount = parseInt(localStorage.getItem('pinterestItemCount'), 10);
                console.log(`Using stored item count for today: ${itemCount}`);
            } else {
                // Buat jumlah acak baru untuk hari ini
                itemCount = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
                localStorage.setItem('pinterestItemCount', itemCount);
                localStorage.setItem('pinterestFeedDate', todayStr);
                console.log(`Generated new item count for today: ${itemCount}`);
            }
            
            // --- Mengambil data dan menghasilkan feed ---
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            // Ambil keyword SECARA BERURUTAN, TANPA diacak
            const keywordSelection = allKeywords.slice(0, itemCount);

            if (keywordSelection.length > 0) {
                // Hasilkan feed XML dari keyword terpilih
                const feedXml = generatePinterestRss(keywordSelection, siteUrl);
                feedOutputElement.textContent = feedXml;
            } else {
                feedOutputElement.textContent = 'Error: No keywords found to generate feed.';
            }

        } catch (error) {
            console.error('Error generating feed:', error);
            feedOutputElement.textContent = `Error: ${error.message}`;
        }
    }

    // Jalankan semua proses
    initializeAutoFeed();
});
