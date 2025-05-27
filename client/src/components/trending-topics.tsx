import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface TrendingTopicsProps {
  selectedBrand: string;
  selectedPlatform: string;
  selectedDateRange: string;
}

export function TrendingTopics({ selectedBrand, selectedPlatform, selectedDateRange }: TrendingTopicsProps) {
  const { data: brand } = useQuery({
    queryKey: ["/api/brands", selectedBrand],
    queryFn: async () => {
      const response = await fetch(`/api/brands/${selectedBrand}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch brand");
      return response.json();
    },
  });

  const { data: brandHashtags } = useQuery({
    queryKey: ["/api/brands", brand?.id, "hashtags", selectedPlatform],
    queryFn: async () => {
      if (!brand?.id) return [];
      const params = new URLSearchParams({ limit: "5" });
      if (selectedPlatform !== "all") params.set("platform", selectedPlatform);
      
      const response = await fetch(`/api/brands/${brand.id}/hashtags?${params}`, {
        credentials: "include"
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!brand?.id,
  });

  const { data: industryHashtags } = useQuery({
    queryKey: ["/api/hashtags/industry"],
    queryFn: async () => {
      const response = await fetch("/api/hashtags/industry?limit=8", {
        credentials: "include"
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Only use authentic data from database
  const displayBrandHashtags = brandHashtags?.map((h: any) => h.tag) || [];
  const displayIndustryHashtags = industryHashtags?.map((h: any) => h.tag) || [];

  return (
    <Card className="bg-white shadow-sm border">
      <CardContent className="p-6">
        <h3 className="font-semibold text-navy mb-6">Trending Topics & Hashtags</h3>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">For Your Brand</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {displayBrandHashtags.map((tag: string) => (
                <span 
                  key={tag}
                  className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h4 className="text-sm font-medium text-gray-700 mb-4">Industry Trends</h4>
            <div className="flex flex-wrap gap-2">
              {displayIndustryHashtags.map((tag: string) => (
                <span 
                  key={tag}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Competitor Hashtags</h4>
            <div className="text-sm text-gray-600 mb-4">Topic Word Cloud</div>
            <div className="bg-gray-50 p-4 rounded-lg h-32 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="text-orange font-medium">Fashion</span>
                  <span className="text-pink-500">Collections</span>
                  <span className="text-blue-500">Wedding</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="text-gray-600">DiscountSale</span>
                  <span className="text-purple-500">Style</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="text-green-500">Trends</span>
                  <span className="text-red-500">Summer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
