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
        page_size: 1,
        page_offset: 1,
      },
    }),
  });

  const json = await response.json();
  
  return NextResponse.json({
    status: response.status,
    responseKeys: Object.keys(json),
    dataLength: json.data?.length,
    firstItemKeys: json.data?.[0] ? Object.keys(json.data[0]) : null,
    firstItem: json.data?.[0] || null,
    pagination: json.pagination_info,
  });
}
