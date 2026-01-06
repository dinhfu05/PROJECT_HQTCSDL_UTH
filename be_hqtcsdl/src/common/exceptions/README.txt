================================================================================
                            EXCEPTIONS FOLDER
================================================================================

MỤC ĐÍCH:
---------
Custom exception classes cho error handling.

FILES:
------
http.exception.ts - HTTP error exceptions
index.ts          - Exports

VÍ DỤ SỬ DỤNG:
--------------
throw new HttpException(404, 'Product not found');
throw new HttpException(400, 'Invalid query parameters');

================================================================================
