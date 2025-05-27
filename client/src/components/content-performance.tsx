import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Shirt, Gift, Heart } from "lucide-react";

interface ContentPerformanceProps {
  selectedBrand: string;
  selectedPlatform: string;
  selectedDateRange: string;
}

export function ContentPerformance({ selectedBrand, selectedPlatform, selectedDateRange }: ContentPerformanceProps) {
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

  const { data: content } = useQuery({
    queryKey: ["/api/brands", brand?.id, "content", selectedPlatform],
    queryFn: async () => {
      if (!brand?.id) return [];
      const params = new URLSearchParams({ limit: "3" });
      if (selectedPlatform !== "all") params.set("platform", selectedPlatform);
      
      const response = await fetch(`/api/brands/${brand.id}/content?${params}`, {
        credentials: "include"
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!brand?.id,
  });

  // Only use authentic content from database
  const displayContent = content || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  return (
    <Card className="bg-white shadow-sm border mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-navy mb-1">Top Performing Content</h3>
            <p className="text-sm text-gray-600">Showing Twitter content</p>
          </div>
          <Select defaultValue="engagement">
            <SelectTrigger className="bg-gray-100 border-none text-sm w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Sort by engagement</SelectItem>
              <SelectItem value="reach">Sort by reach</SelectItem>
              <SelectItem value="date">Sort by date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-left py-3 px-4 font-medium text-gray-700">Content</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-700">Source</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-700">Date</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-700">Engagement</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayContent.map((item: any) => {
                const IconComponent = item.icon || Shirt;
                return (
                  <TableRow key={item.id} className="border-b border-gray-100">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                          <IconComponent size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.content}</p>
                          <p className="text-xs text-gray-500">
                            {item.likes} likes, {item.shares} reposts
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-600">
                      {item.platform}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(item.publishedAt)}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="text-sm font-medium">
                        {formatViews(item.views)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <ExternalLink size={16} className="text-orange cursor-pointer hover:text-orange/80" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-600">Showing 3 of 10 posts</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm">Previous</button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm">Next</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
