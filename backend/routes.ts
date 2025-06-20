import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Topics routes - authentic data from your datasets (placed first to avoid conflicts)
  app.get("/api/brands/:brandId/topics", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      
      const brandId = parseInt(req.params.brandId);
      const { platform, dateRange } = req.query;
      
      let query = `
        SELECT topic, platform, mention_count, sentiment_score
        FROM topics_analysis 
        WHERE brand_id = $1
      `;
      
      const params = [brandId];
      
      if (platform && platform !== 'all') {
        query += ` AND platform = $2`;
        params.push(platform as string);
      }
      
      // Add date range filtering based on created_at
      if (dateRange && dateRange !== 'all') {
        let daysBack = 30; // default
        if (dateRange === '7days') daysBack = 7;
        if (dateRange === '30days') daysBack = 30;
        if (dateRange === '90days') daysBack = 90;
        
        query += ` AND created_at >= NOW() - INTERVAL '${daysBack} days'`;
      }
      
      query += ` ORDER BY mention_count DESC LIMIT 10`;
      
      const { pool } = await import("./db");
      console.log('Topics query executing:', query);
      console.log('Query params:', params);
      
      const result = await pool.query(query, params);
      console.log('Topics found:', result.rows?.length || 0);
      
      if (result.rows && result.rows.length > 0) {
        console.log('Returning topics:', result.rows.map((r: any) => r.topic));
        return res.json(result.rows);
      } else {
        console.log('No topics found for platform:', platform);
        return res.json([]);
      }
    } catch (error: any) {
      console.error("Topics API error:", error);
      return res.status(500).json({ message: "Failed to fetch topics data" });
    }
  });

  // Brand routes
  app.get("/api/brands", isAuthenticated, async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:slug", isAuthenticated, async (req, res) => {
    try {
      const brand = await storage.getBrandBySlug(req.params.slug);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });

  // Social metrics routes
  app.get("/api/brands/:brandId/metrics", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const { startDate, endDate, platform } = req.query;
      
      // Set cache-busting headers to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const metrics = await storage.getSocialMetrics(
        brandId,
        startDate as string,
        endDate as string,
        platform as string
      );
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/brands/:brandId/metrics/latest", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const metrics = await storage.getLatestMetrics(brandId);
      
      if (!metrics) {
        return res.status(404).json({ message: "No metrics found" });
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching latest metrics:", error);
      res.status(500).json({ message: "Failed to fetch latest metrics" });
    }
  });

  // Content routes
  app.get("/api/brands/:brandId/content", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const limit = parseInt(req.query.limit as string) || 10;
      const { platform } = req.query;
      
      // Set cache-busting headers to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const content = await storage.getTopContent(brandId, limit, platform as string);
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Hashtag routes
  app.get("/api/brands/:brandId/hashtags", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const limit = parseInt(req.query.limit as string) || 10;
      const { platform } = req.query;
      
      const hashtags = await storage.getBrandHashtags(brandId, limit, platform as string);
      res.json(hashtags);
    } catch (error) {
      console.error("Error fetching brand hashtags:", error);
      res.status(500).json({ message: "Failed to fetch brand hashtags" });
    }
  });

  app.get("/api/hashtags/industry", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const hashtags = await storage.getIndustryHashtags(limit);
      res.json(hashtags);
    } catch (error) {
      console.error("Error fetching industry hashtags:", error);
      res.status(500).json({ message: "Failed to fetch industry hashtags" });
    }
  });

  // Demographics routes
  app.get("/api/brands/:brandId/demographics", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const { date } = req.query;
      
      const demographics = await storage.getAudienceDemographics(brandId, date as string);
      res.json(demographics);
    } catch (error) {
      console.error("Error fetching demographics:", error);
      res.status(500).json({ message: "Failed to fetch demographics" });
    }
  });

  // Sentiment routes
  app.get("/api/brands/:brandId/sentiment", isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const { startDate, endDate, platform, dateRange } = req.query;
      
      console.log('Sentiment API called with platform:', platform, 'dateRange:', dateRange);
      
      const sentiment = await storage.getSentimentData(
        brandId,
        startDate as string,
        endDate as string,
        platform as string
      );
      
      console.log('Retrieved', sentiment.length, 'sentiment records for platform:', platform);
      res.json(sentiment);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      res.status(500).json({ message: "Failed to fetch sentiment data" });
    }
  });



  // Trigger sentiment analysis extraction
  app.post("/api/brands/:brandId/sentiment/extract", isAuthenticated, async (req, res) => {
    try {
      const { extractAndAnalyzeSentiments } = await import("./sentiment-analyzer");
      const result = await extractAndAnalyzeSentiments();
      res.json(result);
    } catch (error) {
      console.error("Error extracting sentiment data:", error);
      res.status(500).json({ message: "Failed to extract sentiment data", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
