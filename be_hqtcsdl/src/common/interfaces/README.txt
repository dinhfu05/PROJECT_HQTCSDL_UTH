================================================================================
                            INTERFACES FOLDER
================================================================================

MỤC ĐÍCH:
---------
Shared TypeScript interfaces dùng chung trong project.

FILES:
------
api-response.interface.ts - Standard API response format
index.ts                  - Exports

RESPONSE FORMAT CHUẨN:
----------------------
{
  "success": true,
  "data": { ... },
  "perf": {
    "db_ms": 45.23,
    "total_ms": 52.10
  }
}

ERROR FORMAT:
-------------
{
  "success": false,
  "error": "Error message",
  "code": 400
}

================================================================================
