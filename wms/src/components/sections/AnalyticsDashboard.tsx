import React, { useState, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { dataUtils } from '@/utils/dataUtils';
import { aiUtils } from '@/utils/aiUtils';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import '@/styles/components/analytics-dashboard.css';
import { PerformanceMonitor } from '@/utils/performanceUtils';

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

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      //  Mock Implementation:
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
    const analyticsDashboardTimingId = PerformanceMonitor.startMeasuring('AnalyticsDashboard Render');

    fetchData();

    return () => {
      PerformanceMonitor.stopMeasuring(analyticsDashboardTimingId);
    };
  }, [fetchData]);

  const handleQuerySubmit = async () => {
    setLoading(true);
    try {
      // Mock Implementation:
      const mockGenerateSQL = async (text: string): Promise<string> => {
        // Input validation
        if (!text || text.trim() === '') {
          throw new Error('Query text cannot be empty.');
        }

        // Sanitize the text for HTML content or XSS
        const cleanText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        return `SELECT * FROM sales WHERE product_name LIKE '%${cleanText}%'`;
      };

      const sqlQuery = await mockGenerateSQL(query);
      console.log('Generated SQL Query:', sqlQuery);

      // Process the SQL query (Placeholder)
      // Implement logic to fetch and process data based on the SQL query
      // and update dashboardData. setDashboardData(newData);
      // After data processing
      setError(null);
    } catch (e: any) {
      console.error('Error generating SQL or processing data:', e);
      setError(`Failed to generate SQL or process data: ${e.message}`);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const ChartComponent = React.memo(function ChartRender() {
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
            color: '#333333',
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            font: {
              family: 'Open Sans',
            },
            color: '#333333',
          },
        },
      },
      font: {
        family: 'Open Sans',
      },
    };
    return <Bar data={dashboardData} options={options} />;
  });

  return (
    <section className="w-full py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">
          Warehouse Analytics Dashboard
        </h2>
        <FadeIn>
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  placeholder="Enter your query..."
                  className="w-full p-2 border rounded text-darkGray font-open-sans"
                  value={query}
                  onChange={(e) => {
                    // Input validation
                    const inputText = e.target.value;
                    const sanitizedText = inputText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    setQuery(sanitizedText);
                  }}
                />
                <button
                  onClick={handleQuerySubmit}
                  className="ml-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition-colors duration-300 font-roboto"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Generate Insights'}
                </button>
              </div>
              {error && (
                <div className="text-red-500 font-open-sans text-center">{`Error: ${error}`}</div>
              )}
              <div className="flex items-center justify-center">
                {dashboardData ? (
                  <ChartComponent />
                ) : loading ? (
                  <p className="text-gray-500 font-open-sans">Loading data...</p>
                ) : (
                  <p className="text-gray-500 font-open-sans">No data to display.</p>
                )}
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;