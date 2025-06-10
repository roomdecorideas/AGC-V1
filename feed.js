document.addEventListener('DOMContentLoaded', async function() {

    const feedTitle = 'DecorInspire - Latest Design Inspirations';
    const authorName = 'DecorInspire Team';
    const feedOutputElement = document.getElementById('feed-output');

    function shuffleArray(array) { /* ... (fungsi sama seperti di atas) ... */ }
    function capitalizeEachWord(str) { /* ... (fungsi sama seperti di atas) ... */ }
    function generateSeoTitle(baseKeyword) { /* ... (fungsi sama seperti di atas) ... */ }
    
    // (Salin 3 fungsi bantuan dari script.js jika perlu)
    function shuffleArray(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]]}}
    function capitalizeEachWord(str){if(!str)return"";return str.toLowerCase().split(" ").map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ")}
    function generateSeoTitle(baseKeyword){const hookWords=["Best","Amazing","Cool","Inspiring","Creative","Awesome","Stunning","Beautiful","Unique","Ideas","Inspiration","Designs"];const randomHook=hookWords[Math.floor(Math.random()*hookWords.length)];const randomNumber=Math.floor(Math.random()*(200-55+1))+55;const capitalizedKeyword=capitalizeEachWord(baseKeyword);return`${randomNumber} ${randomHook} ${capitalizedKeyword}`}

    function generateAtomFeed(keywordList, siteUrl) {
        const now = new Date();
        const updatedTime = now.toISOString();

        let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
        xml += `<feed xmlns="http://www.w3.org/2005/Atom">\n`;
        xml += `  <title>${feedTitle}</title>\n`;
        xml += `  <link href="${siteUrl}/feed.html" rel="self"/>\n`;
        xml += `  <link href="${siteUrl}/"/>\n`;
        xml += `  <updated>${updatedTime}</updated>\n`;
        xml += `  <id>${siteUrl}/</id>\n`;
        xml += `  <author>\n<name>${authorName}</name>\n</author>\n\n`;

        keywordList.forEach(keyword => {
            const title = generateSeoTitle(keyword);
            const encodedKeywordForUrl = encodeURIComponent(keyword.replace(/\s/g, '-').toLowerCase());
            
            // ▼▼▼ PERUBAHAN DI SINI: Menggunakan URL Hash (#) untuk link artikel ▼▼▼
            const articleUrl = `${siteUrl}/detail.html#${encodedKeywordForUrl}`;
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}`;
            
            const description = `Discover one of the ${title}. Explore visual galleries and creative concepts related to ${capitalizeEachWord(keyword)}. Perfect for your next home or garden project.`;

            xml += `  <entry>\n`;
            xml += `    <title>${title}</title>\n`;
            xml += `    <link href="${articleUrl}"/>\n`;
            xml += `    <id>${articleUrl}</id>\n`;
            xml += `    <updated>${updatedTime}</updated>\n`;
            xml += `    <summary type="html"><![CDATA[${description}]]></summary>\n`;
            xml += `    <content type="html"><![CDATA[<img src="${imageUrl}" alt="${title}" /><br/>${description}]]></content>\n`;
            xml += `  </entry>\n\n`;
        });

        xml += `</feed>`;
        return xml;
    }

    async function initializeFeed() {
        try {
            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('File domain.txt tidak ditemukan.');
            const siteUrl = (await domainResponse.text()).trim();
            if (!siteUrl) throw new Error('File domain.txt kosong.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('File keyword.txt tidak ditemukan.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            shuffleArray(allKeywords);
            const keywordSelection = allKeywords.slice(0, 50);

            if (keywordSelection.length > 0) {
                const feedXml = generateAtomFeed(keywordSelection, siteUrl);
                feedOutputElement.textContent = feedXml;
            } else {
                feedOutputElement.textContent = 'Error: Tidak ada keyword ditemukan untuk membuat feed.';
            }

        } catch (error) {
            console.error('Error generating feed:', error);
            feedOutputElement.textContent = `Error: ${error.message}`;
        }
    }

    initializeFeed();
});
