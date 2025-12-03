import { NextResponse } from "next/server";

const GRANTS_GOV_URL = "https://api.grants.gov/v1/api";

export async function GET() {
  const results: Record<string, unknown> = {
    apiKeyPresent: !!process.env.GRANTS_GOV_API_KEY,
    apiKeyLength: process.env.GRANTS_GOV_API_KEY?.length || 0,
    tests: {},
  };

  // Test 1: Grants.gov without API key
  try {
    const response = await fetch(`${GRANTS_GOV_URL}/search2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: "health",
        oppStatuses: "posted",
        rows: 5,
        startRecordNum: 0,
      }),
    });

    const data = await response.json();
    results.tests = {
      ...results.tests as object,
      withoutApiKey: {
        status: response.status,
        ok: response.ok,
        totalCount: data.totalCount,
        resultsCount: data.oppHits?.length || 0,
        sampleTitle: data.oppHits?.[0]?.title || null,
        error: data.error || data.message || null,
      },
    };
  } catch (error) {
    results.tests = {
      ...results.tests as object,
      withoutApiKey: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }

  // Test 2: Grants.gov with API key
  if (process.env.GRANTS_GOV_API_KEY) {
    try {
      const response = await fetch(`${GRANTS_GOV_URL}/search2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.GRANTS_GOV_API_KEY,
        },
        body: JSON.stringify({
          keyword: "health",
          oppStatuses: "posted",
          rows: 5,
          startRecordNum: 0,
        }),
      });

      const data = await response.json();
      results.tests = {
        ...results.tests as object,
        withApiKey: {
          status: response.status,
          ok: response.ok,
          totalCount: data.totalCount,
          resultsCount: data.oppHits?.length || 0,
          sampleTitle: data.oppHits?.[0]?.title || null,
          error: data.error || data.message || null,
        },
      };
    } catch (error) {
      results.tests = {
        ...results.tests as object,
        withApiKey: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  // Test 3: Simple search without keyword
  try {
    const response = await fetch(`${GRANTS_GOV_URL}/search2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.GRANTS_GOV_API_KEY && { "X-Api-Key": process.env.GRANTS_GOV_API_KEY }),
      },
      body: JSON.stringify({
        oppStatuses: "posted",
        rows: 5,
        startRecordNum: 0,
      }),
    });

    const data = await response.json();
    results.tests = {
      ...results.tests as object,
      noKeywordSearch: {
        status: response.status,
        ok: response.ok,
        totalCount: data.totalCount,
        resultsCount: data.oppHits?.length || 0,
        sampleTitle: data.oppHits?.[0]?.title || null,
        rawResponse: data,
      },
    };
  } catch (error) {
    results.tests = {
      ...results.tests as object,
      noKeywordSearch: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }

  return NextResponse.json(results, { status: 200 });
}
