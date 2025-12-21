================================================================================
                               UTILS FOLDER
================================================================================

MỤC ĐÍCH:
---------
Helper functions cho query performance testing.

CÁC FILES NÊN CÓ:
-----------------

1. timer.util.ts - Đo thời gian query
   
   export function startTimer() {
       const start = process.hrtime.bigint();
       return {
           end: () => {
               const end = process.hrtime.bigint();
               return Number(end - start) / 1_000_000; // ms
           }
       };
   }

2. pagination.util.ts - Pagination helpers
   
   // Offset pagination
   export function getOffsetPagination(page: number, limit: number) {
       return { offset: (page - 1) * limit, limit };
   }
   
   // Cursor pagination (RECOMMENDED cho data lớn)
   export function getCursorPagination(lastId: number, limit: number) {
       return { condition: `id > ${lastId}`, limit };
   }

3. explain.util.ts - Parse EXPLAIN output
   
   export function formatExplainResult(rows: any[]) {
       return rows.map(row => ({
           table: row.table,
           type: row.type,          // ALL = bad, ref/eq_ref = good
           possibleKeys: row.possible_keys,
           key: row.key,            // null = no index used!
           rows: row.rows,          // lower = better
           filtered: row.filtered,
       }));
   }

4. compare.util.ts - So sánh 2 queries

   export async function compareQueries(query1: string, query2: string) {
       const timer1 = startTimer();
       await db.query(query1);
       const time1 = timer1.end();
       
       const timer2 = startTimer();
       await db.query(query2);
       const time2 = timer2.end();
       
       return {
           query1: { sql: query1, time: time1 },
           query2: { sql: query2, time: time2 },
           faster: time1 < time2 ? 'query1' : 'query2',
           difference: Math.abs(time1 - time2)
       };
   }

================================================================================
