document.addEventListener('DOMContentLoaded', function() {

    // --- Pengaturan Feed ---
    const FEED_ITEMS = 50;
    const FILENAME = 'feed.xml';
    const feedTitle = 'DecorInspire - Latest Design Inspirations';
    const authorName = 'DecorInspire Team';

    // --- Elemen DOM ---
    const generateBtn = document.getElementById('generate-btn');
    const statusOutput = document.getElementById('status-output');

    // --- Fungsi Bantuan ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
    function capitalizeEachWord(str) { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
    function generateSeoTitle(baseKeyword) { const hookWords = ['Best', 'Amazing', 'Cool', 'Inspiring', 'Creative', 'Awesome', 'Stunning', 'Beautiful', 'Unique', 'Ideas', 'Inspiration', 'Designs']; const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; const randomNumber = Math.floor(Math.random() * (200 - 55 + 1)) + 55; const capitalizedKeyword = capitalizeEachWord(baseKeyword); return `${randomNumber} ${randomHook} ${capitalizedKeyword}`; }

    // --- Fungsi Utama Pembuatan Feed ---
    function generateAtomFeed(keywordList, siteUrl) {
        const now = new Date();
        const updatedTime = now.toISOString();
        let xml = `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n`;
        xml += `  <title>${feedTitle}</title>\n<link href="${siteUrl}/feed.html" rel="self"/>\n<link href="${siteUrl}/"/>\n`;
        xml += `<updated>${updatedTime}</updated>\n<id>${siteUrl}/</id>\n<author>\n<name>${authorName}</name>\n</author>\n\n`;
        keywordList.forEach(keyword => {
            const title = generateSeoTitle(keyword);
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const articleUrl = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}`;
            const description = `Discover one of the ${title}. Explore visual galleries related to ${capitalizeEachWord(keyword)}.`;
            xml += `  <entry>\n<title>${title}</title>\n<link href="${articleUrl}"/>\n<id>${articleUrl}</id>\n`;
            xml += `<updated>${updatedTime}</updated>\n<summary type="html"><![CDATA[${description}]]></summary>\n`;
            xml += `<content type="html"><![CDATA[<img src="${imageUrl}" alt="${title}" /><br/>${description}]]></content>\n</entry>\n\n`;
        });
        xml += `</feed>`;
        return xml;
    }

    // --- Logika Utama ---
    generateBtn.addEventListener('click', async () => {
        try {
            statusOutput.textContent = 'Status: Fetching data...';
            statusOutput.style.color = '#333';
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            statusOutput.textContent = 'Status: Reading and shuffling keywords...';
            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            shuffleArray(allKeywords);
            const keywordSelection = allKeywords.slice(0, FEED_ITEMS);
            
            statusOutput.textContent = `Status: Generating feed with ${keywordSelection.length} random items...`;
            const feedXml = generateAtomFeed(keywordSelection, siteUrl);

            const blob = new Blob([feedXml], { type: 'application/xml;charset=utf-8' });
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
