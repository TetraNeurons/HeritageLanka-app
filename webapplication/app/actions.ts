"use server";

export async function getSriLankaNews() {
  try {
    const res = await fetch("http://www.adaderana.lk/rss.php", { next: { revalidate: 300 } });
    const xmlText = await res.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemContent.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemContent.match(/<description>(.*?)<\/description>/);

      let description = descMatch ? descMatch[1] : "";
      let imageUrl = "";

      // Extract Image from description HTML if it exists
      const imgMatch = description.match(/src='(.*?)'/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }

      // Clean HTML tags from description for text preview
      const cleanDesc = description.replace(/<[^>]*>/g, "").replace("MORE..", "").trim();

      if (titleMatch && items.length < 5) { // Limit to 5 items
        items.push({
          title: titleMatch[1],
          link: linkMatch ? linkMatch[1] : "#",
          date: dateMatch ? new Date(dateMatch[1]).toLocaleDateString() : "",
          image: imageUrl,
          summary: cleanDesc
        });
      }
    }
    return items;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}