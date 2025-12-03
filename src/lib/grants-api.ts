// Grants API Service - Client-side API module for grants search
// Uses our Next.js API route which handles Grants.gov and USAspending APIs

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
  source: string;
  status?: string;
  postedDate?: string;
  opportunityNumber?: string;
}

export interface SearchFilters {
  keyword?: string;
  categories?: string[];
  agencies?: string[];
}

export interface SearchResponse {
  grants: Grant[];
  totalCount: number;
  hasNext: boolean;
  source: string;
  error?: string;
}

export async function searchAllGrants(
  page: number = 1,
  limit: number = 12,
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const response = await fetch("/api/grants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword: filters.keyword || "",
      page,
      limit,
      categories: filters.categories || [],
      agencies: filters.agencies || [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  const data: SearchResponse = await response.json();

  return data;
}