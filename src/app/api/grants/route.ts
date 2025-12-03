import { NextRequest, NextResponse } from "next/server";

const SIMPLER_GRANTS_URL = "https://api.simpler.grants.gov/v1";
const USA_SPENDING_URL = "https://api.usaspending.gov/api/v2";

// ============ SIMPLER GRANTS.GOV SEARCH ============

interface SearchFilters {
  keyword?: string;
  categories?: string[];
  agencies?: string[];
}

async function searchSimplerGrants(
  pageSize: number,
  pageOffset: number,
  filters: SearchFilters = {}
) {
  const body: Record<string, unknown> = {
    pagination: {
      page_size: pageSize,
      page_offset: pageOffset,
      sort_order: [
        {
          order_by: "post_date",
          sort_direction: "descending"
        }
      ]
    },
    filters: {
      opportunity_status: {
        one_of: ["posted", "forecasted"]
      }
    }
  };

  // Add keyword/query filter
  if (filters.keyword && filters.keyword.trim()) {
    body.query = filters.keyword.trim();
  }

  // Add agency filter if provided
  if (filters.agencies && filters.agencies.length > 0) {
    (body.filters as Record<string, unknown>).agency = {
      one_of: filters.agencies
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key - required for Simpler Grants API
  if (process.env.GRANTS_GOV_API_KEY) {
    headers["X-Api-Key"] = process.env.GRANTS_GOV_API_KEY;
  } else {
    console.error("GRANTS_GOV_API_KEY not found in environment");
    throw new Error("API key not configured");
  }

  console.log("Calling Simpler Grants API with body:", JSON.stringify(body, null, 2));

  const response = await fetch(`${SIMPLER_GRANTS_URL}/opportunities/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Simpler Grants API Error:", response.status, errorText);
    throw new Error(`Simpler Grants API Error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  console.log("Simpler Grants response keys:", Object.keys(json));
  console.log("First item keys:", json.data?.[0] ? Object.keys(json.data[0]) : "no data");
  
  return json;
}

// ============ USA SPENDING SEARCH (FALLBACK) ============

async function searchUSASpending(keywords: string[], page: number, limit: number) {
  const currentYear = new Date().getFullYear();

  const payload: Record<string, unknown> = {
    filters: {
      award_type_codes: ["02", "03", "04", "05"],
      time_period: [
        {
          start_date: `${currentYear - 2}-01-01`,
          end_date: `${currentYear}-12-31`,
        },
      ],
    },
    fields: [
      "Award ID",
      "Recipient Name",
      "Award Amount",
      "Description",
      "Start Date",
      "End Date",
      "Awarding Agency",
      "generated_internal_id",
    ],
    page,
    limit,
    sort: "Award Amount",
    order: "desc",
  };

  if (keywords.length > 0) {
    (payload.filters as Record<string, unknown>).keywords = keywords;
  }

  const response = await fetch(`${USA_SPENDING_URL}/search/spending_by_award/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("USAspending API Error:", response.status, errorText);
    throw new Error(`USAspending API Error: ${response.status}`);
  }

  return response.json();
}

// ============ CATEGORY MAPPING ============

const GRANTS_GOV_CATEGORIES: Record<string, string> = {
  AG: "Agriculture",
  AR: "Arts & Culture",
  BC: "Small Business",
  CD: "Social Services",
  CP: "Social Services",
  DPR: "Defense",
  ED: "Education",
  ELT: "Social Services",
  EN: "Environment",
  FN: "Social Services",
  HL: "Healthcare",
  HO: "Social Services",
  HU: "Social Services",
  ISS: "Research",
  IS: "Infrastructure",
  LJL: "Social Services",
  NR: "Environment",
  O: "Other",
  RA: "Research",
  RD: "Research",
  ST: "Research",
  T: "Infrastructure",
};

const AGENCY_CATEGORIES: Record<string, string> = {
  "Department of Health and Human Services": "Healthcare",
  HHS: "Healthcare",
  "Department of Education": "Education",
  ED: "Education",
  "Environmental Protection Agency": "Environment",
  EPA: "Environment",
  "National Science Foundation": "Research",
  NSF: "Research",
  "Department of Energy": "Environment",
  DOE: "Environment",
  "Department of Defense": "Defense",
  DOD: "Defense",
  "Department of Agriculture": "Agriculture",
  USDA: "Agriculture",
  "Small Business Administration": "Small Business",
  SBA: "Small Business",
  NASA: "Research",
  "Department of Housing and Urban Development": "Social Services",
  HUD: "Social Services",
  "Department of Transportation": "Infrastructure",
  DOT: "Infrastructure",
};

function getCategoryFromAgency(agency: string): string {
  const upperAgency = agency.toUpperCase();
  for (const [key, value] of Object.entries(AGENCY_CATEGORIES)) {
    if (upperAgency.includes(key.toUpperCase())) {
      return value;
    }
  }
  return "Other";
}

function getCategoryFromCode(code: string): string {
  return GRANTS_GOV_CATEGORIES[code] || "Other";
}

// ============ TRANSFORM FUNCTIONS ============

// Simpler Grants API response types
interface SimplerGrantsSummary {
  award_ceiling: number | null;
  award_floor: number | null;
  close_date: string | null;
  post_date: string | null;
  estimated_total_program_funding: number | null;
  summary_description: string | null;
  close_date_description: string | null;
  funding_instruments: string[] | null;
  funding_categories: string[] | null;
}

interface SimplerGrantsOpp {
  opportunity_id: string;
  opportunity_number: string;
  opportunity_title: string;
  agency_name: string;
  agency_code: string;
  opportunity_status: string;
  category: string | null;
  category_explanation: string | null;
  top_level_agency_name: string;
  summary: SimplerGrantsSummary;
}

interface SimplerGrantsResponse {
  data: SimplerGrantsOpp[];
  pagination_info: {
    total_records: number;
    total_pages: number;
  };
}

function transformSimplerGrantsResults(response: SimplerGrantsResponse) {
  const opportunities = response.data || [];
  console.log("Transforming", opportunities.length, "grants from Simpler Grants API");
  
  const grants = opportunities.map((opp, index) => {
    const summary = opp.summary || {};
    const category = getCategoryFromAgency(opp.agency_name || opp.top_level_agency_name || "");

    // Get funding amount - use award_ceiling, or estimated_total_program_funding as fallback
    const awardCeiling = summary.award_ceiling || summary.estimated_total_program_funding || 0;
    const awardFloor = summary.award_floor || 0;

    const matchBase = 70;
    const hasHighCeiling = awardCeiling > 500000 ? 10 : 0;
    const isOpen = opp.opportunity_status === "posted" ? 10 : 0;
    const idStr = String(opp.opportunity_id || index);
    const randomVariance = parseInt(idStr.slice(-2) || "0", 10) % 10;
    const matchPercentage = Math.min(99, matchBase + hasHighCeiling + isOpen + randomVariance);

    // Format deadline
    let deadline = "Open";
    if (summary.close_date) {
      deadline = summary.close_date;
    } else if (summary.close_date_description) {
      deadline = summary.close_date_description;
    }

    return {
      id: String(opp.opportunity_id || `simpler-grants-${index}`),
      title: opp.opportunity_title || "Untitled Opportunity",
      organization: opp.agency_name || opp.top_level_agency_name || "Federal Agency",
      description: summary.summary_description || `Federal grant opportunity. Opportunity Number: ${opp.opportunity_number}`,
      amount: {
        min: awardFloor,
        max: awardCeiling,
      },
      deadline,
      category,
      eligibility: ["See opportunity details on Grants.gov"],
      requirements: [
        "Federal registration (SAM.gov)",
        "Grants.gov registration",
        "Application submission via Grants.gov",
      ],
      applicationUrl: `https://www.grants.gov/search-grants?oppNum=${opp.opportunity_number}`,
      featured: awardCeiling > 1000000,
      matchPercentage,
      source: "grants.gov",
      status: opp.opportunity_status,
      postedDate: summary.post_date,
      opportunityNumber: opp.opportunity_number,
    };
  });

  console.log("Transformed grants count:", grants.length);

  return {
    grants,
    totalCount: response.pagination_info?.total_records || 0,
  };
}

interface USASpendingAward {
  "Award ID": string;
  "Recipient Name": string;
  "Award Amount": number;
  Description: string;
  "Start Date": string;
  "End Date": string;
  "Awarding Agency": string;
  generated_internal_id: string;
}

function transformUSASpendingResults(data: {
  results?: USASpendingAward[];
  page_metadata?: { total: number; hasNext: boolean };
}) {
  const grants = (data.results || []).map((award, index) => {
    const category = getCategoryFromAgency(award["Awarding Agency"] || "");
    const matchPercentage = 70 + (parseInt(award.generated_internal_id?.slice(-2) || "0", 16) % 25);

    return {
      id: award.generated_internal_id || `usa-spending-${index}`,
      title: award.Description?.slice(0, 150) || "Federal Award",
      organization: award["Awarding Agency"] || "Federal Agency",
      description: award.Description || "Federal grant award",
      amount: {
        min: Math.max(0, (award["Award Amount"] || 0) * 0.8),
        max: award["Award Amount"] || 0,
      },
      deadline: award["End Date"] || "",
      category,
      eligibility: ["Various eligible entities"],
      requirements: ["Federal compliance requirements"],
      applicationUrl: `https://www.usaspending.gov/award/${award.generated_internal_id}`,
      featured: (award["Award Amount"] || 0) > 5000000,
      matchPercentage,
      source: "usaspending",
    };
  });

  return {
    grants,
    totalCount: data.page_metadata?.total || 0,
    hasNext: data.page_metadata?.hasNext || false,
  };
}

// ============ API ROUTE HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword = "", page = 1, limit = 12, categories = [], agencies = [] } = body;

    // Try Simpler Grants API first (requires API key)
    try {
      const simplerGrantsData = await searchSimplerGrants(limit, page, {
        keyword,
        categories,
        agencies,
      });
      const result = transformSimplerGrantsResults(simplerGrantsData);

      return NextResponse.json({
        grants: result.grants,
        totalCount: result.totalCount,
        hasNext: page * limit < result.totalCount,
        source: "simpler.grants.gov",
      });
    } catch (simplerGrantsError) {
      console.error("Simpler Grants API failed, trying USAspending:", simplerGrantsError);

      // Fallback to USAspending
      const keywords = keyword ? keyword.split(/\s+/).filter((k: string) => k.length > 0) : [];
      const usaSpendingData = await searchUSASpending(keywords, page, limit);
      const result = transformUSASpendingResults(usaSpendingData);

      return NextResponse.json({
        grants: result.grants,
        totalCount: result.totalCount,
        hasNext: result.hasNext,
        source: "usaspending",
      });
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch grants" },
      { status: 500 }
    );
  }
}
