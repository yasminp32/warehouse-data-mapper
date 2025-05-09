import { PerformanceMonitor } from '@/utils/performanceUtils';
import { sanitizeString, formatNumber } from '@/utils/dataUtils';

/**
 * @module aiUtils
 * @description A utility module providing AI-powered functionalities for text-to-SQL conversion, chart configuration generation, and insight extraction.
 */

/**
 * @function textToSQL
 * @description Asynchronously converts natural language textInput to an SQL query string (MVP Simulation).
 * @param textInput - The natural language input string.
 * @returns A Promise that resolves with the generated SQL query string or null if generation fails.
 * @throws Error if the input is invalid or the AI service call fails.
 */
const textToSQL = async (textInput: string): Promise<string | null> => {
  const startTime = PerformanceMonitor.startMeasuring('textToSQL');
  try {
    if (!textInput || typeof textInput !== 'string') {
      console.error('textToSQL: Invalid input. Text input must be a non-empty string.');
      return null;
    }

    const sanitizedInput = sanitizeString(textInput);

    if (sanitizedInput.length > 500) {
      console.error('textToSQL: Input too long. Limit to 500 characters.');
      return null;
    }

    if (sanitizedInput.includes('sales')) {
      PerformanceMonitor.stopMeasuring(startTime);
      return 'SELECT * FROM sales LIMIT 10';
    }
    if (sanitizedInput.includes('products')) {
      PerformanceMonitor.stopMeasuring(startTime);
      return 'SELECT * FROM products LIMIT 10';
    }
    if (sanitizedInput.includes('returns')) {
      PerformanceMonitor.stopMeasuring(startTime);
      return 'SELECT * FROM returns LIMIT 10';
    }
    PerformanceMonitor.stopMeasuring(startTime);
    return null;
  } catch (e: any) {
    console.error('textToSQL: Error generating SQL query:', e);
    PerformanceMonitor.stopMeasuring(startTime);
    return null;
  }
};

/**
 * @function generateChartConfig
 * @description Asynchronously generates a Chart.js configuration object based on the provided data array (MVP Simulation).
 * @param data - The data array to base the chart configuration on.
 * @returns A Promise that resolves with the generated Chart.js configuration object or null if generation fails.
 * @throws Error if the input data is invalid or chart configuration generation fails.
 */
const generateChartConfig = async (data: any[]): Promise<any | null> => {
  const startTime = PerformanceMonitor.startMeasuring('generateChartConfig');
  try {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('generateChartConfig: Invalid input. Data must be a non-empty array.');
      return null;
    }

    if (data.every(item => typeof item !== 'object' || item === null)) {
      console.error('generateChartConfig: Data must be an array of objects.');
      return null;
    }

    let chartType = 'pie';
    const labels: string[] = data.map((_, index) => `Data Point ${index + 1}`);
    const chartData = data.map(() => 1);
    let label = 'Data Distribution';

    if (data[0].hasOwnProperty('revenue')) {
      chartType = 'bar';
      label = 'Revenue Distribution';
      chartData = data.map(item => (typeof item.revenue === 'number' ? item.revenue : 0));
    } else if (data[0].hasOwnProperty('quantity')) {
      chartType = 'line';
      label = 'Quantity Trends';
      chartData = data.map(item => (typeof item.quantity === 'number' ? item.quantity : 0));
    }

    const backgroundColor = ['#29ABE2', '#00FFCC', '#333333', '#B0BEC5'];

    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: chartData,
          backgroundColor: backgroundColor,
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
    PerformanceMonitor.stopMeasuring(startTime);
    return chartConfig;
  } catch (e: any) {
    console.error('generateChartConfig: Error generating chart configuration:', e);
    PerformanceMonitor.stopMeasuring(startTime);
    return null;
  }
};

/**
 * @function extractInsights
 * @description Asynchronously extracts key insights from the provided data array (MVP Simulation).
 * @param data - The data array to extract insights from.
 * @returns A Promise that resolves with an array of insight strings or null if extraction fails.
 * @throws Error if the input data is invalid or insight extraction fails.
 */
const extractInsights = async (data: any[]): Promise<string[] | null> => {
  const startTime = PerformanceMonitor.startMeasuring('extractInsights');
  try {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('extractInsights: Invalid input. Data must be a non-empty array.');
      return null;
    }

    if (data.every(item => typeof item !== 'object' || item === null)) {
      console.error('extractInsights: Data must be an array of objects.');
      return null;
    }

    if (data[0].hasOwnProperty('revenue')) {
      const totalRevenue = data.reduce((sum, item) => sum + (typeof item.revenue === 'number' ? item.revenue : 0), 0);
      const formattedRevenue = formatNumber(totalRevenue, { style: 'currency', currency: 'USD' });
      const insight = `Total Revenue: ${formattedRevenue ? sanitizeString(formattedRevenue) : 'N/A'}`;
      PerformanceMonitor.stopMeasuring(startTime);
      return [insight];
    }

    if (data[0].hasOwnProperty('quantity') && data[0].hasOwnProperty('price')) {
      const totalPrice = data.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : 0), 0);
      const averagePrice = data.length > 0 ? totalPrice / data.length : 0;
      const formattedPrice = formatNumber(averagePrice, { style: 'currency', currency: 'USD' });
      const insight = `Average Price: ${formattedPrice ? sanitizeString(formattedPrice) : 'N/A'}`;
      PerformanceMonitor.stopMeasuring(startTime);
      return [insight];
    }
      PerformanceMonitor.stopMeasuring(startTime);
    return ['No specific insights available.'];
  } catch (e: any) {
    console.error('extractInsights: Error extracting insights:', e);
    PerformanceMonitor.stopMeasuring(startTime);
    return null;
  }
};

export const testTextToSQL = () => {
    console.log("Testing textToSQL:");

    const testCases = [
        { input: "", expected: null, description: "Empty string" },
        { input: "   ", expected: null, description: "Whitespace only" },
        { input: "This is a very long query to test length limits. ".repeat(20), expected: null, description: "Exceeds length limit" },
        { input: "<script>alert('XSS')</script> sales", expected: "SELECT * FROM sales LIMIT 10", description: "XSS attempt" },
        { input: "Get me the sales data", expected: "SELECT * FROM sales LIMIT 10", description: "Sales data" },
        { input: "Show products", expected: "SELECT * FROM products LIMIT 10", description: "Product data" },
        { input: "List all returns", expected: "SELECT * FROM returns LIMIT 10", description: "Returns data" },
        { input: "unsupported", expected: null, description: "unsupported input" }
    ];

    testCases.forEach(async (testCase) => {
        const result = await textToSQL(testCase.input);
        console.assert(result === testCase.expected, `Test Failed: ${testCase.description}`);
        console.log(`Input: ${testCase.input}, Expected: ${testCase.expected}, Result: ${result}, Description: ${testCase.description}`);
    });
};

export const testGenerateChartConfig = () => {
    console.log("Testing generateChartConfig:");

    const testCases = [
        { input: [], expected: null, description: "Empty array" },
        { input: [1, 2, 3], expected: null, description: "Non-object array" },
        { input: [{}, {}], hasValidProps: true, description: "Valid array but no dataset-specific props" },
        { input: [{ revenue: 10 }, { revenue: 20 }], hasValidProps: true, description: "Has revenue prop" },
        { input: [{ quantity: 5 }, { quantity: 10 }], hasValidProps: true, description: "Has quantity prop" },
        { input: [{ quantity: 5, revenue: 10 }, { quantity: 10, revenue: 20 }], hasValidProps: true, description: "Has quantity and revenue props" },
    ];

    testCases.forEach(async (testCase) => {
        const result = await generateChartConfig(testCase.input);
        if(testCase.expected === null) {
            console.assert(result === null, `Test Failed: ${testCase.description}`);
        } else {
            console.assert(result !== null, `Test Failed: ${testCase.description}`);
        }
        console.log(`Input: ${JSON.stringify(testCase.input)}, Result: ${result !== null}, Description: ${testCase.description}`);
    });
};

export const testExtractInsights = () => {
    console.log("Testing extractInsights:");

    const testCases = [
        { input: [], expected: null, description: "Empty array" },
        { input: [1, 2, 3], expected: null, description: "Non-object array" },
        { input: [{}], expectedMessage: "No specific insights available.", description: "Valid array but no data" },
        { input: [{ revenue: 10 }, { revenue: 20 }], hasValidProps: true, expectedRevenue: 30, description: "Has revenue prop" },
        { input: [{ quantity: 5, price: 2 }, { quantity: 10, price: 3 }], hasValidProps: true, expectedPrice: 2.5, description: "Has quantity and price props" },
    ];

    testCases.forEach(async (testCase) => {
        const result = await extractInsights(testCase.input);
        if(testCase.expected === null) {
            console.assert(result === null, `Test Failed: ${testCase.description}`);
        } else {
            if(testCase.expectedMessage) {
                console.assert(result !== null && result[0] === testCase.expectedMessage, `Test Failed: ${testCase.description}`);
            } else if(testCase.expectedRevenue) {
                const expectedRevenue = formatNumber(testCase.expectedRevenue, { style: 'currency', currency: 'USD' });
                console.assert(result !== null && result[0] === `Total Revenue: ${expectedRevenue}`, `Test Failed: ${testCase.description}`);
            }
             else if(testCase.expectedPrice) {
                 const expectedPrice = formatNumber(testCase.expectedPrice, { style: 'currency', currency: 'USD' });
                 console.assert(result !== null && result[0] === `Average Price: ${expectedPrice}`, `Test Failed: ${testCase.description}`);
             }
        }
        console.log(`Input: ${JSON.stringify(testCase.input)}, Result: ${result !== null ? result[0] : null}, Description: ${testCase.description}`);
    });
};

export { textToSQL, generateChartConfig, extractInsights };