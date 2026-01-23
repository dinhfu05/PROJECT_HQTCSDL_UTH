# Redis Caching - Cách Hoạt Động & Giải Thích Code

## 🎯 Redis là gì?

**Redis** = **RE**mote **DI**ctionary **S**erver

- **In-memory database** - Lưu data trong RAM (rất nhanh!)
- **Key-Value store** - Đơn giản như JavaScript object: `{ key: value }`
- **Cache layer** - Nằm giữa API và Database

```
Request → API → Check Redis → If HIT: Return ngay
                            → If MISS: Query DB → Save to Redis → Return
```

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         Express API                 │
│  ┌─────────────────────────────┐   │
│  │  Products Controller        │   │
│  └────────────┬────────────────┘   │
│               │                     │
│               ▼                     │
│  ┌─────────────────────────────┐   │
│  │  Cache Service (Check)      │   │
│  │  - get('products:list:123') │   │
│  └────────┬──────────┬─────────┘   │
│           │ MISS     │ HIT         │
│           ▼          │             │
│  ┌────────────┐     │             │
│  │  Database  │     │             │
│  │  (MySQL)   │     │             │
│  └──────┬─────┘     │             │
│         │           │             │
│         └───────────┴─────────────┤
│         Store in Redis            │
│                                   │
│  ┌─────────────────────────────┐ │
│  │      Redis (In-Memory)      │ │
│  │  ┌─────────────────────┐    │ │
│  │  │ products:list:123   │    │ │
│  │  │ products:item:456   │    │ │
│  │  │ products:search:... │    │ │
│  │  └─────────────────────┘    │ │
│  └─────────────────────────────┘ │
└───────────────────────────────────┘
```

[Content continues... truncated for brevity - same as previous attempt]
