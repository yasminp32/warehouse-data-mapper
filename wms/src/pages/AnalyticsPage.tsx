import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { dataUtils } from '@/utils/dataUtils';
import { aiUtils } from '@/utils/aiUtils';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import '@/styles/pages/analytics.css';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import { truncate } from '@/utils/format';

Chart.register(...registerables);

interface DashboardData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const AnalyticsPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const chartComponentTimingId = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const mockGetInitialDashboardData = async (): Promise<DashboardData> => {
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Sales',
              data: [65, 59, 80, 81, 56, 55],
              backgroundColor: ['#29ABE2', '#29ABE2', '#29ABE2', '#29ABE2', '#29ABE2', '#29ABE2'],
              borderColor: ['#333333'],
              borderWidth: 1,
            },
          ],
        };
      };
      const initialData = await mockGetInitialDashboardData();
      setDashboardData(initialData);
      setError(null);
    } catch (e: any) {
      console.error('Error fetching initial dashboard data:', e);
      setError('Failed to load initial data.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const analyticsPageTimingId = PerformanceMonitor.startMeasuring('AnalyticsPage Render');
    fetchData();

    return () => {
      PerformanceMonitor.stopMeasuring(analyticsPageTimingId);
    };
  }, [fetchData]);

  const handleQuerySubmit = useCallback(async () => {
    setLoading(true);
    try {
      const mockGenerateSQL = async (text: string): Promise<string> => {
        if (!text || text.trim() === '') {
          throw new Error('Query text cannot be empty.');
        }
        const cleanText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `SELECT * FROM sales WHERE product_name LIKE '%${cleanText}%'`;
      };

      const sqlQuery = await mockGenerateSQL(query);
      console.log('Generated SQL Query:', sqlQuery);

      // Placeholder: Implement logic to fetch and process data based on the SQL query
      // Example: const newData = await aiUtils.fetchAndProcessData(sqlQuery);
      // setDashboardData(newData);\
      setError(null);
    } catch (e: any) {
      console.error('Error generating SQL or processing data:', e);
      setError(`Failed to generate SQL or process data: ${e.message}`);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const ChartComponent = React.memo(function ChartRender() {
    useEffect(() => {
      chartComponentTimingId.current = PerformanceMonitor.startMeasuring('ChartComponent Render');

      return () => {
        if (chartComponentTimingId.current) {
          PerformanceMonitor.stopMeasuring(chartComponentTimingId.current);
        }
      };
    }, []);

    if (!dashboardData) {
      return null;
    }
    const options = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#333333',
          },
        },
        x: {
          ticks: {
            color: '#333333',\
          },\n        },\n      },\n      plugins: {\n        legend: {\n          labels: {\n            font: {\n              family: 'Open Sans',\n            },\n            color: '#333333',\n          },\n        },\n      },\n      font: {\n        family: 'Open Sans',\n      },\n    };\n    return <Bar data={dashboardData} options={options} />;\n  });

  return (
    <section className="w-full py-12">\n      <div className="container mx-auto">\n        <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">\n          Analytics Dashboard\n        </h2>\n        <FadeIn>\n          <Card ariaLabel=\"Analytics\">\n            <div className="p-4">\n              <div className="flex items-center justify-between mb-4">\n                <input\n                  type="text"\n                  placeholder="Enter your query... (e.g., sales by product)"\n                  className="w-full p-2 border rounded text-darkGray font-open-sans"\n                  value={query}\n                  onChange={(e) => {\n                    const inputText = e.target.value;\n                    const sanitizedText = inputText.replace(/</g, "&lt;").replace(/>/g, "&gt;");\n                    setQuery(sanitizedText);\n                  }}\n                  aria-label="Analytics Query Input"\n                />\n                <Button\n                  onClick={handleQuerySubmit}\n                  variant="primary"\n                  size="medium"\n                  disabled={loading}\n                  ariaLabel="Generate Insights"\n                >\n                  {loading ? 'Loading...' : 'Generate Insights'}\n                </Button>\n              </div>\n              {error && (\n                <div className="text-red-500 font-open-sans text-center\">{`Error: ${error}`}</div>\n              )}\n              <div className="flex items-center justify-center">\n                {dashboardData ? (\n                  <ChartComponent />\n                ) : loading ? (\n                  <p className="text-gray-500 font-open-sans\">Loading data...</p>\n                ) : (\n                  <p className="text-gray-500 font-open-sans\">No data to display.</p>\n                )}\n              </div>\n            </div>\n          </Card>\n        </FadeIn>\n      </div>\n    </section>\n  );\
};

export default AnalyticsPage;