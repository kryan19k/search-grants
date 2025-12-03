// Grants API Service - Client-side module
// Calls our Next.js API route which handles Grants.gov and USAspending APIs

// ============ UNIFIED GRANT TYPE ============

export interface Grant {
  id: string;
  title: string;
  organization: string;
  description: string;
  amount: {
    min: number;
    max: number;
  };
  deadline: string;
  category: string;
  eligibility: string[];
  requirements: string[];
  applicationUrl: string;
  featured: boolean;
  matchPercentage: number;
  source: "grants.gov" | "usaspending";
  status?: string;
  postedDate?: string;
  opportunityNumber?: string;
}

// ============ API RESPONSE TYPE ============

interface SearchResponse {
  grants: Grant[];
  totalCount: number;
  hasNext: boolean;
  source: string;
  error?: string;
}

// ============ SEARCH FUNCTION ============

export async function searchAllGrants(
  keyword: string = "",
  page: number = 1,
  limit: number = 12
): Promise<{ grants: Grant[]; totalCount: number; hasNext: boolean }> {
  const response = await fetch("/api/grants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword, page, limit }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  const data: SearchResponse = await response.json();

  return {
    grants: data.grants,
    totalCount: data.totalCount,
    hasNext: data.hasNext,
  };
}