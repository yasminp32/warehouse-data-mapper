import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { dataUtils } from '@/utils/dataUtils';
import { aiUtils } from '@/utils/aiUtils';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import { sanitizeURL } from '@/hooks/useDataFetching';

interface AIAnalysisResult {
  sqlQuery: string | null;
  chartConfig: any | null;
  insights: string[];
}

interface AIAnalysisHook {
  generateSqlQuery: (textInput: string) => Promise<void>;
  fetchDataAndGenerateChart: (sqlQuery: string) => Promise<void>;
  extractInsights: (data: any) => Promise<void>;
  sqlQuery: string | null;
  chartConfig: any | null;
  insights: string[];
  isLoading: boolean;
  error: string | null;
}

const useAIAnalysis = (): AIAnalysisHook => {
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<any | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateSqlQuery = useCallback(async (textInput: string) => {
    setIsLoading(true);
    setError(null);
    setSqlQuery(null);
    setChartConfig(null);
    setInsights([]);

    const sanitizedInput = textInput.replace(/<[^>]*>/g, '');

    const generateSqlQueryTimingId = PerformanceMonitor.startMeasuring('Generate SQL Query');
    try {
      const generatedQuery = await aiUtils.textToSQL(sanitizedInput);
      if (generatedQuery) {
        setSqlQuery(generatedQuery);
        PerformanceMonitor.stopMeasuring(generateSqlQueryTimingId);
        await fetchDataAndGenerateChart(generatedQuery);
      } else {
        const errorMessage = 'Failed to generate SQL query.';
        setError(errorMessage);
        console.error(`useAIAnalysis: ${errorMessage}`);
        PerformanceMonitor.stopMeasuring(generateSqlQueryTimingId);
      }
    } catch (e: any) {
      const errorMessage = `Error generating SQL query: ${e.message}`;
      setError(errorMessage);
      console.error(`useAIAnalysis: ${errorMessage}`);
      PerformanceMonitor.stopMeasuring(generateSqlQueryTimingId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDataAndGenerateChart = useCallback(async (sqlQuery: string) => {
    setIsLoading(true);
    setError(null);
    setChartConfig(null);
    setInsights([]);

    const fetchDataAndGenerateChartTimingId = PerformanceMonitor.startMeasuring('Fetch Data and Generate Chart');
    try {
      const data = await dataUtils.fetchData(sqlQuery);
      if (data && Array.isArray(data)) {
        try {
          const generatedChartConfig = await aiUtils.generateChartConfig(data);
          if (generatedChartConfig) {
            setChartConfig(generatedChartConfig);
              PerformanceMonitor.stopMeasuring(fetchDataAndGenerateChartTimingId);
              await extractInsights(data);
          } else {
            const errorMessage = 'Failed to generate chart configuration.';
            setError(errorMessage);
            console.error(`useAIAnalysis: ${errorMessage}`);
            PerformanceMonitor.stopMeasuring(fetchDataAndGenerateChartTimingId);
          }
        } catch (chartError: any) {
          const errorMessage = `Error generating chart configuration: ${chartError.message}`;
          setError(errorMessage);
          console.error(`useAIAnalysis: ${errorMessage}`);
          PerformanceMonitor.stopMeasuring(fetchDataAndGenerateChartTimingId);
        }
      }
      else {
           const errorMessage = 'Data is not an array.';
           setError(errorMessage);
           console.error(`useAIAnalysis: ${errorMessage}`);
           PerformanceMonitor.stopMeasuring(fetchDataAndGenerateChartTimingId);
      }
    } catch (fetchError: any) {
      const errorMessage = `Error fetching data: ${fetchError.message}`;
      setError(errorMessage);
      console.error(`useAIAnalysis: ${errorMessage}`);
      PerformanceMonitor.stopMeasuring(fetchDataAndGenerateChartTimingId);
    } finally {
      setIsLoading(false);
    }
  }, []);

    const extractInsights = useCallback(async (data: any) => {
        setIsLoading(true);
        setError(null);
        setInsights([]);

        const extractInsightsTimingId = PerformanceMonitor.startMeasuring('Extract Insights');
        try {
            if (data && Array.isArray(data)) {
                const generatedInsights = await aiUtils.extractInsights(data);
                if (generatedInsights && Array.isArray(generatedInsights)) {
                    setInsights(generatedInsights);
                    PerformanceMonitor.stopMeasuring(extractInsightsTimingId);
                } else {
                    const errorMessage = 'Failed to extract insights.';
                    setError(errorMessage);
                    console.error(`useAIAnalysis: ${errorMessage}`);
                    PerformanceMonitor.stopMeasuring(extractInsightsTimingId);
                }
            } else {
                const errorMessage = 'Data for insight extraction is not an array.';
                setError(errorMessage);
                console.error(`useAIAnalysis: ${errorMessage}`);
                PerformanceMonitor.stopMeasuring(extractInsightsTimingId);
            }
        } catch (insightError: any) {
            const errorMessage = `Error extracting insights: ${insightError.message}`;
            setError(errorMessage);
            console.error(`useAIAnalysis: ${errorMessage}`);
            PerformanceMonitor.stopMeasuring(extractInsightsTimingId);
        } finally {
            setIsLoading(false);
        }
    }, []);

  return {
    generateSqlQuery,
    fetchDataAndGenerateChart,
      extractInsights,
    sqlQuery,
    chartConfig,
    insights,
    isLoading,
    error,
  };
};

export { useAIAnalysis };