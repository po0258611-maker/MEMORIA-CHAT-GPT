export interface AnalysisResult {
  id: string;
  date: string;
  videoName: string;
  thumbnailBase64: string;
  viralScore: number;
  factors: {
    hook: number;
    audioEnergy: number;
    pacing: number;
    facialExpression: number;
    curiosity: number;
  };
  recommendedCuts: {
    start: string;
    end: string;
    duration: string;
    reason: string;
  }[];
  hashtags: {
    shorts: string[];
    reach: string[];
    niche: string[];
  };
  titles: string[];
  retentionData: { time: number; retention: number }[];
}
