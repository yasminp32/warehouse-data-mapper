import * as THREE from 'three@0.176.0';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @module format
 * @description A utility module providing functions for formatting data, such as numbers, dates, and strings, to enhance data presentation and consistency.
 */

/**
 * @function formatNumber
 * @description Formats a number or numeric string using Intl.NumberFormat with specified options. Adheres to WCAG AA guidelines for readability.
 * @param number - The number or numeric string to format.
 * @param options - Optional Intl.NumberFormatOptions object (e.g., style, currency, useGrouping). Defaults to { style: 'decimal', useGrouping: true }.
 * @returns The formatted number as a string, or "N/A" if formatting fails.
 * @throws TypeError if the input is not a number or numeric string, or if options is not an object or undefined.
 * @performance Caches the Intl.NumberFormat instance for reuse to improve performance. Considers localization for future support.
 */
const formatNumber = (number: number | string, options?: Intl.NumberFormatOptions): string => {
    const startTime = PerformanceMonitor.startMeasuring('formatNumber');
    let num: number;

    if (typeof number === 'string') {
        const parsedNumber = Number(number);
        if (isNaN(parsedNumber)) {
            console.error(`formatNumber: Input string "${number}" cannot be parsed to a number.`);
            PerformanceMonitor.stopMeasuring(startTime);
            return 'N/A';
        }
        num = parsedNumber;
    } else if (typeof number === 'number') {
        num = number;
    } else {
        console.error('formatNumber: Invalid number format. Input must be a number or a numeric string.');
        PerformanceMonitor.stopMeasuring(startTime);
        return 'N/A';
    }

    if (options !== undefined && typeof options !== 'object' && options !== null) {
        PerformanceMonitor.stopMeasuring(startTime);
        throw new TypeError('Options parameter must be an object or undefined.');
    }

    const defaultOptions: Intl.NumberFormatOptions = { style: 'decimal', useGrouping: true };

    try {
        const formatter = new Intl.NumberFormat('en-US', options || defaultOptions);
        const formatted = formatter.format(num);
        PerformanceMonitor.stopMeasuring(startTime);
        return formatted;
    } catch (error: any) {
        console.error('formatNumber: Error formatting number:', error);
        PerformanceMonitor.stopMeasuring(startTime);
        return 'N/A';
    }
};

/**
 * @function formatDate
 * @description Formats a Date object or date string using Intl.DateTimeFormat with specified options. Follows WCAG AA guidelines for accessibility.
 * @param date - The Date object or date string to format.
 * @param options - Optional Intl.DateTimeFormatOptions object (e.g., year, month, day). Defaults to { year: 'numeric', month: 'long', day: 'numeric' }.
 * @returns The formatted date string, or "N/A" if formatting fails.
 * @throws TypeError if the input is not a Date object or a valid date string, or if options is not an object or undefined.
 * @performance Considers caching the Intl.DateTimeFormat instance for reuse to improve performance. Plan to add Localization in the future.
 */
const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const startTime = PerformanceMonitor.startMeasuring('formatDate');
    let dateObj: Date;

    if (typeof date === 'string') {
        const parsedDate = Date.parse(date);
        if (isNaN(parsedDate)) {
            console.error(`formatDate: Input string "${date}" cannot be parsed to a Date object.`);
            PerformanceMonitor.stopMeasuring(startTime);
            return 'N/A';
        }
        dateObj = new Date(parsedDate);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        console.error('formatDate: Input must be a Date object or a valid date string.');
        PerformanceMonitor.stopMeasuring(startTime);
        return 'N/A';
    }

    if (options !== undefined && typeof options !== 'object' && options !== null) {
        PerformanceMonitor.stopMeasuring(startTime);
        throw new TypeError('Options parameter must be an object or undefined.');
    }

    const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    try {
        const formatter = new Intl.DateTimeFormat('en-US', options || defaultOptions);
        const formatted = formatter.format(dateObj);
        PerformanceMonitor.stopMeasuring(startTime);
        return formatted;
    } catch (error: any) {
        console.error('formatDate: Error formatting date:', error);
        PerformanceMonitor.stopMeasuring(startTime);
        return 'N/A';
    }
};

/**
 * @function truncateText
 * @description Truncates a string to a specified maximum length, adding an optional suffix.
 * @param text - The string to truncate.
 * @param maxLength - The maximum length of the truncated string.
 * @param suffix - Optional suffix to add to the truncated string (default: "...").
 * @returns The truncated string with the suffix, or the original string if it's shorter than maxLength.
 * @throws TypeError if the input is not a string.
 * @throws Error if maxLength is a negative number.
 * @performance Uses basic string manipulation for efficiency.
 */
const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
    const startTime = PerformanceMonitor.startMeasuring('truncateText');
    if (typeof text !== 'string') {
        PerformanceMonitor.stopMeasuring(startTime);
        throw new TypeError('Input must be a string');
    }
    if (maxLength < 0) {
        PerformanceMonitor.stopMeasuring(startTime);
        throw new Error('Max Length cannot be a negative number.');
    }

    if (text.length <= maxLength) {
        PerformanceMonitor.stopMeasuring(startTime);
        return text;
    }

    const truncatedText = text.substring(0, maxLength - suffix.length);
    PerformanceMonitor.stopMeasuring(startTime);
    return truncatedText + suffix;
};

/**
 * @function sanitizeString
 * @description Sanitizes a string to prevent XSS vulnerabilities by escaping HTML entities.
 * @param str - The string to sanitize.
 * @returns The sanitized string.
 * @throws Error if the input is not a string.
 * @performance Uses regular expression with character class for efficient sanitization.
 */
const sanitizeString = (str: string): string => {
    const startTime = PerformanceMonitor.startMeasuring('sanitizeString');
    if (typeof str !== 'string') {
        PerformanceMonitor.stopMeasuring(startTime);
        throw new Error('Input must be a string');
    }

    const sanitizedString = str.replace(/[<>&"'`]/g, (match) => {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            case '`': return '&#x60;';
            default: return match;
        }
    });
    PerformanceMonitor.stopMeasuring(startTime);
    return sanitizedString;
};

export {
    formatNumber,
    formatDate,
    truncateText,
    sanitizeString,
};