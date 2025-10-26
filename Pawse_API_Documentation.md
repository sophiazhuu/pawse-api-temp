# Pawse API Documentation 🐾

**Base URL:**  
https://pawse-api-temp.onrender.com

This API provides ranked feed and leaderboard data for the Pawse mobile app.  
It is deployed via [Render](https://render.com) and powered by `json-server`.

---

## 📄 Endpoints

### 1. `/api/friends-feed`
**Description:**  
Returns a dynamically ranked list of friends’ posts based on:
- `votes_from_friends` (weighted ×2)  
- Recency (newer posts ranked higher)  
- Randomness factor to keep feed fresh  

**Method:** `GET`  
**Example Response:**
```json
[
  {
    "pet_name": "Mochi",
    "votes_from_friends": 12,
    "posted_at": "2025-10-24T15:30:00Z",
    "score": 27.32
  }
]
```

---

### 2. `/api/contest-feed`
**Description:**  
Returns ranked contest submissions using:
- `votes_from_contest` (weighted ×3)  
- Recency (recent entries boosted)  
- Randomness to ensure equal exposure  

**Method:** `GET`  
**Example Response:**
```json
[
  {
    "pet_name": "Luna",
    "votes_from_contest": 8,
    "submitted_at": "2025-10-25T11:00:00Z",
    "score": 29.84
  }
]
```

---

### 3. `/api/leaderboard`
**Description:**  
Joins `friends_feed` and `contest_feed` to produce a leaderboard of the top 3 pets based on calculated contest scores.  
Includes `owner_nickname`, `photo_url`, and `rank`.

**Method:** `GET`  
**Example Response:**
```json
{
  "contest_name": "Sleepiest Pet 💤",
  "leaderboard_updated": "2025-10-26T17:00:00Z",
  "top_entries": [
    {
      "rank": 1,
      "pet_name": "Luna",
      "owner_nickname": "alexpaws",
      "photo_url": "https://pawse.app/luna.jpg",
      "votes": 18,
      "score": 36.29
    }
  ]
}
```

---

## ⚙️ Deployment
- Hosted on **Render (Free Instance)**
- `Build Command:` `npm install`
- `Start Command:` `npm start`
- Deployed from GitHub repo `pawse-api-temp`
- May spin down after inactivity (initial load may take up to 50s)

---

**Maintainer:** Sophia Zhu  
**Updated:** October 26, 2025
