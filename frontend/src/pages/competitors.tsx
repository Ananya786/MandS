import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

export default function Competitors() {
  // State for TopNav (even though we're comparing both brands)
  const [selectedBrand, setSelectedBrand] = useState("marks-spencer");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("30days");

  // Fetch both brands data for comparison
  const { data: marksSpencerBrand } = useQuery({
    queryKey: ["/api/brands", "marks-spencer"],
    queryFn: async () => {
      const response = await fetch("/api/brands/marks-spencer", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch Marks & Spencer");
      return response.json();
    },
  });

  const { data: nextRetailBrand } = useQuery({
    queryKey: ["/api/brands", "next-retail"],
    queryFn: async () => {
      const response = await fetch("/api/brands/next-retail", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch Next Retail");
      return response.json();
    },
  });

  // Fetch metrics for both brands
  const { data: marksSpencerMetrics } = useQuery({
    queryKey: ["/api/brands", marksSpencerBrand?.id, "metrics"],
    queryFn: async () => {
      if (!marksSpencerBrand?.id) return null;
      const response = await fetch(`/api/brands/${marksSpencerBrand.id}/metrics`, {
        credentials: "include"
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!marksSpencerBrand?.id,
  });

  const { data: nextRetailMetrics } = useQuery({
    queryKey: ["/api/brands", nextRetailBrand?.id, "metrics"],
    queryFn: async () => {
      if (!nextRetailBrand?.id) return null;
      const response = await fetch(`/api/brands/${nextRetailBrand.id}/metrics`, {
        credentials: "include"
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!nextRetailBrand?.id,
  });

  // Calculate metrics for comparison
  const marksData = marksSpencerMetrics?.[0] || {};
  const nextData = nextRetailMetrics?.[0] || {};

  const marksFollowers = marksData.followers || 0;
  const nextFollowers = nextData.followers || 0;
  const maxFollowers = Math.max(marksFollowers, nextFollowers);

  const marksEngagement = parseFloat(marksData.engagementScore?.replace('%', '') || '0');
  const nextEngagement = parseFloat(nextData.engagementScore?.replace('%', '') || '0');
  const maxEngagement = Math.max(marksEngagement, nextEngagement);

  const marksPostFreq = marksData.totalPosts || 0;
  const nextPostFreq = nextData.totalPosts || 0;
  const maxPosts = Math.max(marksPostFreq, nextPostFreq);

  return (
    <div className="h-screen flex bg-light-gray">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <TopNav
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
        />
        <div className="p-6 space-y-6 bg-white min-h-screen">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Competitor Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">
              Compare your social media performance with competitors to identify opportunities and threats.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Performance Comparison */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Comparison</CardTitle>
                  <CardDescription>Comparing Marks & Spencer against competitors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Followers Comparison */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Followers</span>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                          <span>Marks & Spencer</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-800 rounded-full mr-1"></div>
                          <span>Next Retail</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((marksFollowers / maxFollowers) * 100, 15)}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {(marksFollowers / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-gray-800 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(nextFollowers / maxFollowers) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {(nextFollowers / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Rate Comparison */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Engagement Rate (%)</span>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                          <span>Marks & Spencer</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-800 rounded-full mr-1"></div>
                          <span>Next Retail</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(marksEngagement / maxEngagement) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">{marksEngagement}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-gray-800 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(nextEngagement / maxEngagement) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">{nextEngagement}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Frequency Comparison */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Post Frequency (per day)</span>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                          <span>Marks & Spencer</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-800 rounded-full mr-1"></div>
                          <span>Next Retail</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(marksPostFreq / maxPosts) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {(marksPostFreq / 30).toFixed(1)}/day
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                          <div 
                            className="bg-gray-800 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(nextPostFreq / maxPosts) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {(nextPostFreq / 30).toFixed(1)}/day
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Strategy Comparison */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Content Strategy Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Post Frequency</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-orange-500 font-medium text-sm">MARKS & SPENCER</span>
                          </div>
                          <span className="text-sm text-gray-600">{(marksPostFreq / 30).toFixed(1)}/day</span>
                          <div className="w-64 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-orange-500 h-3 rounded-full"
                              style={{ width: `${(marksPostFreq / maxPosts) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-800 font-medium text-sm">NEXT RETAIL</span>
                          </div>
                          <span className="text-sm text-gray-600">{(nextPostFreq / 30).toFixed(1)}/day</span>
                          <div className="w-64 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gray-800 h-3 rounded-full"
                              style={{ width: `${(nextPostFreq / maxPosts) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Content Type Distribution</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <span className="text-sm text-gray-600">Images</span>
                          <p className="text-2xl font-bold text-gray-900">65%</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Videos</span>
                          <p className="text-2xl font-bold text-gray-900">25%</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Text</span>
                          <p className="text-2xl font-bold text-gray-900">10%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Metrics */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Marks & Spencer Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Marks & Spencer</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Followers</span>
                        <span className="font-medium">{(marksFollowers / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement Rate</span>
                        <span className="font-medium">{marksEngagement}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Post Frequency</span>
                        <span className="font-medium">{(marksPostFreq / 30).toFixed(1)}/day</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Retail Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Next Retail</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Followers</span>
                        <span className="font-medium">{(nextFollowers / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement Rate</span>
                        <span className="font-medium">{nextEngagement}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Post Frequency</span>
                        <span className="font-medium">{(nextPostFreq / 30).toFixed(1)}/day</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Overlap */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Audience Overlap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Marks & Spencer - Next Retail</span>
                    <span className="font-bold">52% Overlap</span>
                  </div>
                  <Progress value={52} className="h-3" />
                  
                  <p className="text-xs text-gray-600 mt-3">
                    Higher audience overlap indicates similar target demographics and potential for 
                    cross-promotional strategies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}