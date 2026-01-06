================================================================================
                              PAGINATION FOLDER
================================================================================

MỤC ĐÍCH:
---------
Cursor-based pagination utilities cho listing với 1 triệu records.

FILES:
------
cursor.ts - Encode/decode cursor cho pagination

TẠI SAO CURSOR PAGINATION:
--------------------------
1. OFFSET pagination: Chậm với offset lớn
   - Page 1: OFFSET 0      → 5ms
   - Page 1000: OFFSET 20000 → 2500ms (RẤT CHẬM!)

2. CURSOR pagination: Luôn nhanh
   - WHERE id > last_id ORDER BY id LIMIT 20 → 5ms
   - Không phụ thuộc vào page number

VÍ DỤ:
------
// Encode cursor
const cursor = Cursor.encode({ id: 1000, sortValue: '2024-01-01' });
// → "eyJpZCI6MTAwMCwic29ydFZhbHVlIjoiMjAyNC0wMS0wMSJ9"

// Decode cursor
const data = Cursor.decode(cursor);
// → { id: 1000, sortValue: '2024-01-01' }

================================================================================
