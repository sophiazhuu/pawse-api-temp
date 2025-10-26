# 🐾 Pawse Internal API Documentation

## Overview
The Pawse Internal API powers the app’s content ranking system, determining how posts and contest entries appear to users. It provides three endpoints that dynamically order posts by **votes**, **recency**, and a **randomness factor** to simulate fair and engaging feeds.

## Base URL
```
http://localhost:3000
```

## 1️⃣ /api/friends-feed
**Description:**  
Returns friend feed posts ranked by engagement and freshness.  

**Scoring formula:**  
```
score = (votes_from_contest * 2) + recencyFactor + randomness
```
- `recencyFactor`: 10 − days since posted (min 0)  
- `randomness`: random value 0–1  

**Example Request:**  
`GET /api/friends-feed`

**Example Response:**
```json
[
  {
    "username": "Rina",
    "pet_name": "Mochi",
    "votes_from_contest": 16,
    "posted_at": "2025-10-26T10:30:00Z",
    "score": 46.8
  },
  {
    "username": "Sophie",
    "pet_name": "Whiskers",
    "votes_from_contest": 19,
    "posted_at": "2025-10-26T08:50:00Z",
    "score": 46.4
  }
]
```

## 2️⃣ /api/contest-feed
**Description:**  
Ranks all contest submissions by vote count, recency, and slight randomness.  

**Scoring formula:**  
```
score = (votes * 3) + recencyFactor + randomness
```

**Example Request:**  
`GET /api/contest-feed`

**Example Response:**
```json
[
  {
    "pet_name": "Peach",
    "votes": 480,
    "submitted_at": "2025-10-25T10:00:00Z",
    "score": 1443.7
  },
  {
    "pet_name": "Whiskers",
    "votes": 485,
    "submitted_at": "2025-10-25T16:45:00Z",
    "score": 1443.1
  }
]
```

## 3️⃣ /api/leaderboard
**Description:**  
Returns the top 3 contest entries as a live leaderboard.  
**Scoring formula:** same as `/api/contest-feed`

**Example Request:**  
`GET /api/leaderboard`

**Example Response:**
```json
{
  "contest_name": "Sleepiest Pet 💤",
  "top_entries": [
    { "rank": 1, "pet_name": "Milo", "votes": 490 },
    { "rank": 2, "pet_name": "Whiskers", "votes": 485 },
    { "rank": 3, "pet_name": "Peach", "votes": 480 }
  ]
}
```

## Tech Summary
| Item | Description |
|------|--------------|
| Framework | Node.js + JSON Server |
| Database | `db.json` (mock data) |
| Port | 3000 |
| Ranking Factors | Votes, recency, randomness |
| Purpose | Demonstrates backend logic for personalized & contest-based content feeds |

## Usage
Start the server:
```bash
node server.cjs
```

Test endpoints:
```bash
curl http://localhost:3000/api/friends-feed
curl http://localhost:3000/api/contest-feed
curl http://localhost:3000/api/leaderboard
```
