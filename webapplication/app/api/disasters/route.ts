import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface DisasterEvent {
  title: string
  description: string
  eventType: string
  alertLevel: string
  country: string
  link: string
}

export async function GET() {
  try {
    // Fetch GDACS RSS feed
    const response = await fetch("https://www.gdacs.org/xml/rss.xml", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch GDACS feed")
    }

    const xmlText = await response.text()

    // Parse XML to find Sri Lanka disasters
    const disasters: DisasterEvent[] = []

    // Split by <item> tags
    const items = xmlText.split("<item>").slice(1) // Skip first split (before first item)

    for (const item of items) {
      // Extract country
      const countryMatch = item.match(/<gdacs:country>(.*?)<\/gdacs:country>/)
      const country = countryMatch ? countryMatch[1] : ""

      // Check if Sri Lanka is mentioned
      if (country.toLowerCase().includes("sri lanka")) {
        // Extract other fields
        const titleMatch = item.match(/<title>(.*?)<\/title>/)
        const descMatch = item.match(/<description>(.*?)<\/description>/)
        const eventTypeMatch = item.match(/<gdacs:eventtype>(.*?)<\/gdacs:eventtype>/)
        const alertLevelMatch = item.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/)
        const linkMatch = item.match(/<link>(.*?)<\/link>/)

        const title = titleMatch ? titleMatch[1] : ""
        const description = descMatch ? descMatch[1] : ""
        const eventType = eventTypeMatch ? eventTypeMatch[1] : ""
        const alertLevel = alertLevelMatch ? alertLevelMatch[1] : ""
        const link = linkMatch ? linkMatch[1].replace(/&amp;/g, "&") : ""

        // Only include significant alerts (Orange or Red, or any flood/cyclone)
        const isSignificant =
          alertLevel === "Orange" ||
          alertLevel === "Red" ||
          eventType === "FL" ||
          eventType === "TC"

        if (isSignificant) {
          disasters.push({
            title,
            description,
            eventType,
            alertLevel,
            country,
            link,
          })
        }
      }
    }

    return NextResponse.json({ disasters })
  } catch (error) {
    console.error("Error fetching disasters:", error)
    return NextResponse.json({ disasters: [] }, { status: 500 })
  }
}
