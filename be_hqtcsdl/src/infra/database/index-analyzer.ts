// Index Analyzer - Monitor and analyze database index usage
// Purpose: Debug query performance and verify index effectiveness

import { database } from './database';

// ================================================================================
// Types
// ================================================================================

// Define RowDataPacket as a record type for compatibility
type RowDataPacket = Record<string, any>;

interface IndexInfo {
    Table: string;
    Non_unique: number;
    Key_name: string;
    Seq_in_index: number;
    Column_name: string;
    Collation: string;
    Cardinality: number;
    Index_type: string;
}

interface ExplainResult {
    id: number;
    select_type: string;
    table: string;
    type: string;
    possible_keys: string | null;
    key: string | null;
    key_len: string | null;
    ref: string | null;
    rows: number;
    Extra: string | null;
}

interface QueryAnalysis {
    query: string;
    explain: ExplainResult[];
    analysis: {
        usesIndex: boolean;
        indexUsed: string | null;
        scanType: string;
        estimatedRows: number;
        warnings: string[];
        suggestions: string[];
    };
}

interface IndexStats {
    TABLE_NAME: string;
    INDEX_NAME: string;
    COLUMN_NAME: string;
    SEQ_IN_INDEX: number;
    CARDINALITY: number;
    INDEX_TYPE: string;
}

// ================================================================================
// Index Analyzer Class
// ================================================================================

export class IndexAnalyzer {
    /**
     * Analyze a query and return detailed performance information
     */
    async analyzeQuery(sql: string, params?: unknown[]): Promise<QueryAnalysis> {
        const explainSql = `EXPLAIN ${sql}`;
        const explain = await database.query<ExplainResult[]>(explainSql, params);

        const analysis = this.interpretExplain(explain);

        return {
            query: sql,
            explain,
            analysis,
        };
    }

    /**
     * Run EXPLAIN ANALYZE for actual execution metrics
     * Note: This EXECUTES the query, use with caution on mutations
     */
    async analyzeQueryWithExecution(sql: string, params?: unknown[]): Promise<string> {
        const analyzeSql = `EXPLAIN ANALYZE ${sql}`;
        const result = await database.query<RowDataPacket[]>(analyzeSql, params);

        // EXPLAIN ANALYZE returns a single row with execution plan
        return result[0]?.EXPLAIN || 'No execution plan available';
    }

    /**
     * Get all indexes for a table
     */
    async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
        const sql = `SHOW INDEX FROM ${tableName}`;
        return database.query<IndexInfo[]>(sql);
    }

    /**
     * Get index statistics from information_schema
     */
    async getIndexStats(tableName?: string): Promise<IndexStats[]> {
        let sql = `
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        SEQ_IN_INDEX,
        CARDINALITY,
        INDEX_TYPE
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
    `;

        const params: unknown[] = [];
        if (tableName) {
            sql += ' AND TABLE_NAME = ?';
            params.push(tableName);
        }

        sql += ' ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX';

        return database.query<IndexStats[]>(sql, params);
    }

    /**
     * Check if a specific index exists
     */
    async indexExists(tableName: string, indexName: string): Promise<boolean> {
        const sql = `
      SELECT COUNT(*) as count
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
    `;

        const [result] = await database.query<RowDataPacket[]>(sql, [tableName, indexName]);
        return (result?.count || 0) > 0;
    }

    /**
     * Get table and index size information
     */
    async getTableSize(tableName: string) {
        const sql = `
      SELECT 
        TABLE_NAME,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS total_size_mb,
        ROUND((DATA_LENGTH / 1024 / 1024), 2) AS data_size_mb,
        ROUND((INDEX_LENGTH / 1024 / 1024), 2) AS index_size_mb,
        TABLE_ROWS as estimated_rows,
        ROUND((INDEX_LENGTH / DATA_LENGTH * 100), 2) AS index_ratio_percent
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `;

        const [result] = await database.query<RowDataPacket[]>(sql, [tableName]);
        return result || null;
    }

    /**
     * Format query analysis for logging
     */
    formatAnalysis(analysis: QueryAnalysis): string {
        const lines: string[] = [];

        lines.push('='.repeat(80));
        lines.push('QUERY ANALYSIS');
        lines.push('='.repeat(80));
        lines.push(`Query: ${analysis.query}`);
        lines.push('');

        // EXPLAIN output
        lines.push('EXPLAIN Output:');
        analysis.explain.forEach((row) => {
            lines.push(`  Table: ${row.table}`);
            lines.push(`  Type: ${row.type}`);
            lines.push(`  Possible Keys: ${row.possible_keys || 'None'}`);
            lines.push(`  Key Used: ${row.key || 'None'}`);
            lines.push(`  Rows Examined: ${row.rows}`);
            lines.push(`  Extra: ${row.Extra || 'None'}`);
            lines.push('');
        });

        // Analysis
        lines.push('Analysis:');
        lines.push(`  Uses Index: ${analysis.analysis.usesIndex ? 'YES ✓' : 'NO ✗'}`);
        lines.push(`  Index Used: ${analysis.analysis.indexUsed || 'None'}`);
        lines.push(`  Scan Type: ${analysis.analysis.scanType}`);
        lines.push(`  Estimated Rows: ${analysis.analysis.estimatedRows}`);
        lines.push('');

        if (analysis.analysis.warnings.length > 0) {
            lines.push('⚠️  Warnings:');
            analysis.analysis.warnings.forEach((w) => lines.push(`  - ${w}`));
            lines.push('');
        }

        if (analysis.analysis.suggestions.length > 0) {
            lines.push('💡 Suggestions:');
            analysis.analysis.suggestions.forEach((s) => lines.push(`  - ${s}`));
            lines.push('');
        }

        lines.push('='.repeat(80));
        return lines.join('\n');
    }

    // ================================================================================
    // Private Methods
    // ================================================================================

    private interpretExplain(explain: ExplainResult[]) {
        const warnings: string[] = [];
        const suggestions: string[] = [];

        // Get first row (main table)
        const mainRow = explain[0];

        const usesIndex = mainRow.key !== null;
        const indexUsed = mainRow.key;
        const scanType = mainRow.type;
        const estimatedRows = mainRow.rows;

        // Check for performance issues
        if (scanType === 'ALL') {
            warnings.push('Full table scan detected - no index used');
            suggestions.push('Consider adding an index on columns in WHERE/JOIN/ORDER BY clauses');
        }

        if (scanType === 'index') {
            warnings.push('Full index scan - reading entire index');
            suggestions.push('Try to add more specific WHERE conditions');
        }

        if (mainRow.Extra?.includes('Using filesort')) {
            warnings.push('Using filesort - sorting in memory/disk (slow)');
            suggestions.push('Add index matching ORDER BY columns');
        }

        if (mainRow.Extra?.includes('Using temporary')) {
            warnings.push('Using temporary table (slow)');
            suggestions.push('Optimize query structure or add covering index');
        }

        if (estimatedRows > 100000 && !usesIndex) {
            warnings.push(`High row scan count (${estimatedRows}) without index`);
            suggestions.push('This query will be extremely slow on large datasets');
        }

        if (mainRow.possible_keys && !indexUsed) {
            warnings.push('Indexes available but not used by optimizer');
            suggestions.push('Query may need restructuring or index hints');
        }

        return {
            usesIndex,
            indexUsed,
            scanType,
            estimatedRows,
            warnings,
            suggestions,
        };
    }
}

// ================================================================================
// Singleton Export
// ================================================================================

export const indexAnalyzer = new IndexAnalyzer();
