import { db } from "./db";
import { storage } from "./storage";

// Simple sentiment analysis function based on keyword matching
function analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative', score: number } {
  if (!text) return { sentiment: 'neutral', score: 0 };
  
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'amazing', 'awesome', 'beautiful', 'best', 'brilliant', 'excellent', 'fantastic', 
    'gorgeous', 'great', 'incredible', 'love', 'lovely', 'perfect', 'stunning', 
    'wonderful', 'good', 'nice', 'happy', 'excited', 'favorite', 'delicious',
    'unreal', 'standout', 'fab', 'fabulous', 'adorable', 'cute', 'stylish'
  ];
  
  // Negative keywords
  const negativeWords = [
    'awful', 'bad', 'disappointing', 'hate', 'horrible', 'poor', 'terrible', 
    'worst', 'ugly', 'boring', 'expensive', 'overpriced', 'cheap', 'disgusting',
    'uncomfortable', 'useless', 'annoying', 'frustrating', 'disappointing'
  ];
  
  // Neutral keywords that might indicate commentary rather than sentiment
  const neutralWords = [
    'review', 'haul', 'collection', 'featuring', 'check', 'test', 'discussion',
    'architecture', 'taking', 'pictures', 'discussing'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveScore += matches.length;
  });
  
  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length;
  });
  
  // Count neutral indicators
  neutralWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) neutralScore += matches.length;
  });
  
  // Determine sentiment based on scores
  if (positiveScore > negativeScore && positiveScore > 0) {
    return { sentiment: 'positive', score: positiveScore };
  } else if (negativeScore > positiveScore && negativeScore > 0) {
    return { sentiment: 'negative', score: negativeScore };
  } else {
    return { sentiment: 'neutral', score: Math.max(neutralScore, 1) };
  }
}

export async function extractAndAnalyzeSentiments() {
  console.log('Starting sentiment analysis extraction...');
  
  try {
    // Get Instagram data
    const instagramData = await db.execute(`
      SELECT id, caption, hashtags, created_at 
      FROM mark_spencers_dataset_instagram 
      WHERE caption IS NOT NULL AND caption != ''
    `);
    
    console.log(`Processing ${instagramData.rows.length} Instagram posts...`);
    
    // Process Instagram data
    for (const row of instagramData.rows) {
      const textContent = `${row.caption} ${row.hashtags || ''}`;
      const analysis = analyzeSentiment(textContent);
      
      await storage.createSentimentData({
        brandId: 1, // Marks & Spencer brand ID
        platform: 'instagram',
        sentiment: analysis.sentiment,
        mentionCount: 1,
        score: analysis.score.toString(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    // Get TikTok data
    const tiktokData = await db.execute(`
      SELECT id, video_description, hashtags, create_time_iso, created_at
      FROM mark_spencers_dataset_tiktok 
      WHERE video_description IS NOT NULL AND video_description != ''
    `);
    
    console.log(`Processing ${tiktokData.rows.length} TikTok videos...`);
    
    // Process TikTok data
    for (const row of tiktokData.rows) {
      const textContent = `${row.video_description} ${row.hashtags || ''}`;
      const analysis = analyzeSentiment(textContent);
      
      await storage.createSentimentData({
        brandId: 1,
        platform: 'tiktok',
        sentiment: analysis.sentiment,
        mentionCount: 1,
        score: analysis.score.toString(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    // Get YouTube data
    const youtubeData = await db.execute(`
      SELECT id, video_description, channel_name
      FROM mark_spencers_dataset_youtube 
      WHERE video_description IS NOT NULL AND video_description != ''
    `);
    
    console.log(`Processing ${youtubeData.rows.length} YouTube videos...`);
    
    // Process YouTube data
    for (const row of youtubeData.rows) {
      const textContent = `${row.video_description} ${row.channel_name || ''}`;
      const analysis = analyzeSentiment(textContent);
      
      await storage.createSentimentData({
        brandId: 1,
        platform: 'youtube',
        sentiment: analysis.sentiment,
        mentionCount: 1,
        score: analysis.score.toString(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    console.log('Sentiment analysis extraction completed successfully!');
    
    // Return summary statistics
    const stats = await db.execute(`
      SELECT 
        platform,
        sentiment,
        COUNT(*) as count
      FROM sentiment_data 
      WHERE brand_id = 1
      GROUP BY platform, sentiment
      ORDER BY platform, sentiment
    `);
    
    return {
      success: true,
      message: 'Sentiment analysis completed',
      stats: stats.rows
    };
    
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    throw error;
  }
}