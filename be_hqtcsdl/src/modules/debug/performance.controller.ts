// Performance Debug Controller - Endpoints for index monitoring
// Development/Testing only - DO NOT expose in production!

import { Request, Response } from 'express';
import { indexAnalyzer } from '../../infra/database';

export class PerformanceDebugController {
    /**
     * GET /api/debug/indexes/:table
     * Get all indexes for a specific table
     */
    async getTableIndexes(req: Request, res: Response) {
        try {
            const { table } = req.params;

            if (!['products', 'orders', 'order_items', 'categories', 'users'].includes(table)) {
                return res.status(400).json({
                    error: 'Invalid table name',
                    allowed: ['products', 'orders', 'order_items', 'categories', 'users'],
                });
            }

            const indexes = await indexAnalyzer.getTableIndexes(table);
            const stats = await indexAnalyzer.getIndexStats(table);
            const size = await indexAnalyzer.getTableSize(table);

            res.json({
                table,
                indexes,
                stats,
                size,
            });
        } catch (error) {
            console.error('Error fetching indexes:', error);
            res.status(500).json({ error: 'Failed to fetch indexes' });
        }
    }

    /**
     * POST /api/debug/analyze-query
     * Analyze a query with EXPLAIN
     */
    async analyzeQuery(req: Request, res: Response) {
        try {
            const { sql, params } = req.body;

            if (!sql) {
                return res.status(400).json({ error: 'SQL query is required' });
            }

            // Security: Only allow SELECT queries
            if (!sql.trim().toLowerCase().startsWith('select')) {
                return res.status(400).json({ error: 'Only SELECT queries allowed' });
            }

            const analysis = await indexAnalyzer.analyzeQuery(sql, params);
            const formatted = indexAnalyzer.formatAnalysis(analysis);

            res.json({
                analysis,
                formatted,
            });
        } catch (error) {
            console.error('Error analyzing query:', error);
            res.status(500).json({
                error: 'Failed to analyze query',
                message: (error as Error).message,
            });
        }
    }

    /**
     * POST /api/debug/analyze-query-execution
     * Run EXPLAIN ANALYZE (actually executes query)
     */
    async analyzeQueryExecution(req: Request, res: Response) {
        try {
            const { sql, params } = req.body;

            if (!sql) {
                return res.status(400).json({ error: 'SQL query is required' });
            }

            // Security: Only allow SELECT queries
            if (!sql.trim().toLowerCase().startsWith('select')) {
                return res.status(400).json({ error: 'Only SELECT queries allowed' });
            }

            const executionPlan = await indexAnalyzer.analyzeQueryWithExecution(sql, params);

            res.json({
                sql,
                executionPlan,
                note: 'This query was actually executed. Use only with safe read-only queries.',
            });
        } catch (error) {
            console.error('Error analyzing query execution:', error);
            res.status(500).json({
                error: 'Failed to analyze query execution',
                message: (error as Error).message,
            });
        }
    }

    /**
     * GET /api/debug/indexes/check/:table/:index
     * Check if a specific index exists
     */
    async checkIndexExists(req: Request, res: Response) {
        try {
            const { table, index } = req.params;

            const exists = await indexAnalyzer.indexExists(table, index);

            res.json({
                table,
                index,
                exists,
            });
        } catch (error) {
            console.error('Error checking index:', error);
            res.status(500).json({ error: 'Failed to check index' });
        }
    }

    /**
     * GET /api/debug/indexes/all
     * Get all indexes across all tables
     */
    async getAllIndexes(req: Request, res: Response) {
        try {
            const stats = await indexAnalyzer.getIndexStats();

            // Group by table
            const grouped = stats.reduce((acc, stat) => {
                if (!acc[stat.TABLE_NAME]) {
                    acc[stat.TABLE_NAME] = [];
                }
                acc[stat.TABLE_NAME].push(stat);
                return acc;
            }, {} as Record<string, typeof stats>);

            res.json({
                total: stats.length,
                byTable: grouped,
            });
        } catch (error) {
            console.error('Error fetching all indexes:', error);
            res.status(500).json({ error: 'Failed to fetch indexes' });
        }
    }
}

export const performanceDebugController = new PerformanceDebugController();
