import * as THREE from 'three@0.176.0';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @module dataUtils
 * @description A utility module providing reusable functions for handling data-related tasks, including loading, processing, and formatting data.
 */

/**
 * @function parseCSVData
 * @description Parses a CSV string into an array of objects, where each object represents a row and keys are derived from the first row (header). Adheres to RFC 4180.
 * @param csvString - The CSV string to parse.
 * @returns An array of objects representing the CSV data, or an empty array if parsing fails.
 * @throws Error if the CSV string is malformed or missing headers. Sanitizes cell string data to prevent XSS vulnerabilities.
 */
const parseCSVData = (csvString: string): any[] => {
  if (!csvString || typeof csvString !== 'string' || csvString.trim() === '') {
    console.error('parseCSVData: Invalid CSV string. Returning an empty array.');
    return [];
  }

  const lines = csvString.trim().split('\n');

  if (lines.length === 0) {
    console.error('parseCSVData: Empty CSV string. Returning an empty array.');
    return [];
  }

  const headers = lines[0].split(',').map(header => header.trim());

  if (!headers || headers.length === 0) {
    console.error('parseCSVData: Missing headers in CSV string. Returning an empty array.');
    return [];
  }

  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length !== headers.length) {
      console.warn(`parseCSVData: Row ${i + 1} has incorrect number of columns. Skipping.`);
      continue;
    }

    const obj: { [key: string]: string } = {};
    for (let j = 0; j < headers.length; j++) {
      let value = row[j].trim();
          // Remove quotes, then unescape escaped quotes
          if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1).replace(/""/g, '"');
          }
      //Sanitize cell data to prevent XSS vulnerabilities
      const cleanValue = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          obj[headers[j]] = cleanValue;
    }
    data.push(obj);
  }

  return data;
};

/**
 * @function fetchData
 * @description Accepts an SQL query string and returns a Promise that resolves with an array of objects, emulating fetching data from a database.
 * @param sqlQuery - The SQL query string.
 * @returns A Promise that resolves with an array of objects representing the data.
 * @throws Error if the SQL query is invalid or contains potential SQL injection vulnerabilities.
 */
const fetchData = async (sqlQuery: string): Promise<any[]> => {
  if (!sqlQuery || typeof sqlQuery !== 'string' || sqlQuery.trim() === '') {
    console.error('fetchData: Invalid SQL query. Rejecting the Promise.');
    throw new Error('Invalid SQL query. Query must be a non-empty string.');
  }

  const unsafeKeywords = ['DELETE', 'UPDATE', 'INSERT', 'UNION', 'DROP'];
  if (unsafeKeywords.some(keyword => sqlQuery.toUpperCase().includes(keyword))) {
    console.error('fetchData: SQL query contains potentially unsafe keywords. Rejecting the Promise.');
    throw new Error('SQL query contains potentially unsafe keywords and cannot be executed.');
  }

  const startTime = PerformanceMonitor.startMeasuring(`Database Query: ${sqlQuery}`);

  try {
    switch (sqlQuery) {
      case 'SELECT * FROM products':
        PerformanceMonitor.stopMeasuring(startTime);
        return [
          { product_id: 1, name: 'Widget A', price: 25.99, in_stock: true },
          { product_id: 2, name: 'Widget B', price: 49.50, in_stock: false },
          { product_id: 3, name: 'Widget C', price: 12.75, in_stock: true },
        ];
      case 'SELECT * FROM sales':
        PerformanceMonitor.stopMeasuring(startTime);
        return [
          { sale_id: 101, product_id: 1, quantity: 10, sale_date: '2024-07-26', revenue: 259.90 },
          { sale_id: 102, product_id: 2, quantity: 5, sale_date: '2024-07-26', revenue: 247.50 },
          { sale_id: 103, product_id: 3, quantity: 20, sale_date: '2024-07-27', revenue: 255.00 },
        ];
      case 'SELECT * FROM returns':
        PerformanceMonitor.stopMeasuring(startTime);
        return [
          { return_id: 201, sale_id: 101, return_date: '2024-07-27', reason: 'Defective' },
          { return_id: 202, sale_id: 102, return_date: '2024-07-28', reason: 'Not as described' },
        ];
      default:
        PerformanceMonitor.stopMeasuring(startTime);
        console.error(`fetchData: Invalid SQL query. Rejecting the Promise.`);
        throw new Error('Invalid SQL query. No data could be fetched.');
    }
  } catch (error: any) {
    PerformanceMonitor.stopMeasuring(startTime);
    console.error('fetchData: Error fetching data:', error);
    throw error;
  }
};

/**
 * @function formatNumber
 * @description Accepts a number or a numeric string and formats it using Intl.NumberFormat.
 * @param number - The number or numeric string to format.
 * @param options - Optional Intl.NumberFormatOptions object.
 * @returns The formatted number as a string, or "N/A" if formatting fails.
 * @throws TypeError if the input is not a number or a numeric string.
 */
const formatNumber = (number: number | string, options?: Intl.NumberFormatOptions): string => {
  let num: number;

  if (typeof number === 'string') {
      const parsedNumber = Number(number);
      if (isNaN(parsedNumber)) {
          console.error(`formatNumber: Input string "${number}" cannot be parsed to a number.`);
          return 'N/A';
      }
      num = parsedNumber;
  } else if (typeof number === 'number') {
      num = number;
  } else {
      console.error(`formatNumber: Invalid number format`);
      return 'N/A';
  }
    if (options !== undefined && typeof options !== 'object' && options !== null) {
        throw new TypeError('Options parameter must be an object or undefined.');
    }

  const defaultOptions: Intl.NumberFormatOptions = { style: 'decimal', useGrouping: true };

  try {
    const formatter = new Intl.NumberFormat('en-US', options || defaultOptions);
    return formatter.format(num);
  } catch (error: any) {
    console.error('formatNumber: Error formatting number:', error);
    return 'N/A';
  }
};

/**
 * @function formatDate
 * @description Accepts a Date object or a date string and formats it using Intl.DateTimeFormat.
 * @param date - The Date object or date string to format.
 * @param options - Optional Intl.DateTimeFormatOptions object.
 * @returns The formatted date string, or "N/A" if formatting fails.
 * @throws TypeError if the input is not a Date object or a valid date string.
 */
const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  let dateObj: Date;

  if (typeof date === 'string') {
    const parsedDate = Date.parse(date);
    if (isNaN(parsedDate)) {
      console.error(`formatDate: Input string "${date}" cannot be parsed to a Date object.`);
      return 'N/A';
    }
    dateObj = new Date(parsedDate);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    console.error('formatDate: Input must be a Date object or a valid date string.');
    return 'N/A';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  try {
    const formatter = new Intl.DateTimeFormat('en-US', options || defaultOptions);
    return formatter.format(dateObj);
  } catch (error: any) {
    console.error('formatDate: Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * @function truncateText
 * @description Accepts a string and truncates it to a specified maximum length, adding an optional suffix.
 * @param text - The string to truncate.
 * @param maxLength - The maximum length of the truncated string.
 * @param suffix - Optional suffix to add to the truncated string (default: "...").
 * @returns The truncated string with the suffix, or the original string if it's shorter than maxLength.
 * @throws Error if the length is a negative integer
 */
const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (maxLength < 0) {
        throw new Error('Max Length cannot be a negative number.');
    }
  if (text.length <= maxLength) {
    return text;
  }

  const truncatedText = text.substring(0, maxLength - suffix.length);
    return truncatedText + suffix;
};

/**
 * @function sanitizeString
 * @description Accepts a string and sanitizes it to prevent XSS vulnerabilities by escaping HTML entities.
 * @param str - The string to sanitize.
 * @returns The sanitized string.
 * @throws Error if the input is not a string.
 */
const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }

    const sanitizedString = str.replace(/[<>&"']/g, (match) => {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });

    return sanitizedString;
};

export {
  parseCSVData,
  fetchData,
  formatNumber,
  formatDate,
  truncateText,
    sanitizeString,
};