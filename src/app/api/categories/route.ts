import { NextResponse } from "next/server";

export async function GET() {
  const SIMPLER_GRANTS_URL = "https://api.simpler.grants.gov/v1";
  
  if (!process.env.GRANTS_GOV_API_KEY) {
    return NextResponse.json({ error: "No API key" });
  }

  const response = await fetch(`${SIMPLER_GRANTS_URL}/opportunities/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.GRANTS_GOV_API_KEY,
    },
    body: JSON.stringify({
      pagination: {
        page_size: 100,
        page_offset: 1,
      },
    }),
  });

  const json = await response.json();
  
  // Collect all unique funding categories
  const categories = new Set<string>();
  const agencies = new Set<string>();
  
  for (const opp of json.data || []) {
    if (opp.summary?.funding_categories) {
      for (const cat of opp.summary.funding_categories) {
        categories.add(cat);
      }
    }
    if (opp.agency_name) {
      agencies.add(opp.agency_name);
    }
    if (opp.top_level_agency_name) {
      agencies.add(opp.top_level_agency_name);
    }
  }
  
  return NextResponse.json({
    funding_categories: Array.from(categories).sort(),
    agencies: Array.from(agencies).sort(),
  });
}
