const jsonServer = require('json-server');
const server = jsonServer.create();

// Now initialize the router and middlewares
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// ------------------------------------------------------------------
// ⭐ LANDING PAGE FIX (Must come before middleware) ⭐
// ------------------------------------------------------------------
server.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pawse API Documentation 🐾</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            .section { border: 1px solid #eee; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
            .nav-links a:hover { text-decoration: underline; }
            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            .formula { background-color: #e0f7fa; border-left: 5px solid #00bcd4; padding: 10px; margin-top: 10px; font-style: italic; }
        </style>
    </head>
    <body>
        <h1>Pawse API Documentation 🐾</h1>
        <p>This API provides ranked feed and leaderboard data for the Pawse mobile app.</p>
        <div class="nav-links">
            <a href="/api/friends-feed">Friends Feed</a> | 
            <a href="/api/contest-feed">Contest Feed</a> | 
            <a href="/api/leaderboard">Leaderboard</a> |
            <a href="/db/raw">View Raw Database (db.json)</a>
        </div>

        <hr>

        <h2>📄 Endpoints Explained</h2>

        <div class="section">
            <h3>1. <code>/api/friends-feed</code></h3>
            <p>Returns a dynamically ranked list of friends’ posts. This ranking prioritizes engagement and recency:</p>
            <ul>
                <li>**Engagement:** <code>votes_from_friends</code> is heavily weighted (×2).</li>
                <li>**Recency:** Newer posts are ranked higher using a time-decay factor.</li>
                <li>**Freshness:** A small <code>randomness</code> factor is added to ensure posts get equal exposure over time.</li>
            </ul>
            <h4>Formula Details</h4>
            <div class="formula">
                Score = (votes\_from\_friends &times; 2) + Recency Factor + Randomness
                <br>
                Recency Factor = MAX(0, 10 - Days Old) 
                <br>
                <small>*(The post's recency score decays after 10 days)*</small>
            </div>
        </div>

        <div class="section">
            <h3>2. <code>/api/contest-feed</code></h3>
            <p>Returns ranked contest submissions. This is a competition-focused ranking:</p>
            <ul>
                <li>**Competition:** <code>votes_from_contest</code> is highly weighted (×3).</li>
                <li>**Recency:** Recent entries receive a temporary score boost.</li>
                <li>**Fairness:** Includes a <code>randomness</code> factor to help entries move slightly within their vote tier.</li>
            </ul>
            <h4>Formula Details</h4>
            <div class="formula">
                Score = (votes\_from\_contest &times; 3) + Recency Factor + Randomness
                <br>
                Recency Factor = MAX(0, 5 - Days Old)
                <br>
                <small>*(The entry's recency score decays after 5 days)*</small>
            </div>
        </div>

        <div class="section">
            <h3>3. <code>/api/leaderboard</code></h3>
            <p>Calculates the scores for all contest entries using the **Contest Feed formula** and provides the top 3 results. This endpoint enriches the data by performing a **data join** to include the pet's photo and the owner's nickname.</p>
            <p>The leaderboard is intended to be refreshed daily (<code>everynight at 23:59</code>, as per your DB diagram notes) to reflect the day's winners.</p>
        </div>
        
        <div class="section">
            <h3>4. <code>/db/raw</code></h3>
            <p>Returns the entire contents of the in-memory database (<code>db.json</code>) as raw JSON.</p>
        </div>

        <hr>

        <h2>⚙️ Deployment & Maintainer Info</h2>
        <p><strong>Base URL:</strong> https://pawse-api-temp.onrender.com</p>
        <ul>
            <li>**Hosting:** Deployed via <a href="https://render.com">Render</a> (Free Instance).</li>
            <li>**Technology:** Powered by <code>json-server</code> (running on an Express instance).</li>
            <li>**Maintainer:** Sophia Zhu</li>
            <li>**Updated:** October 26, 2025</li>
            <li>**Note:** The free Render instance may spin down after inactivity; initial load may take up to 50 seconds.</li>
        </ul>
    </body>
    </html>
  `);
});

server.use(middlewares); 

// ------------------------------------------------------------------
// ⭐ NEW FIX: EXPLICIT RAW DB DUMP ENDPOINT ⭐
// ------------------------------------------------------------------
server.get('/db/raw', (req, res) => {
    res.json(router.db.getState());
});

// ------------------------------------------------------------------
// ⭐ REUSABLE SCORING FUNCTIONS
// ------------------------------------------------------------------

// Function for Friends Feed ranking
const calculateFriendsFeedScore = (post) => {
  const likesScore = post.votes_from_friends * 2;
  const daysOld = (Date.now() - new Date(post.posted_at)) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 10 - daysOld); 
  const randomness = Math.random();
  const score = likesScore + recencyFactor + randomness;
  return { ...post, score };
};

// Function for Contest Feed ranking (REUSED)
const calculateContestScore = (entry) => {
  const votesScore = entry.votes_from_contest * 3;
  const daysOld = (Date.now() - new Date(entry.submitted_at)) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 5 - daysOld);
  const randomness = Math.random();
  const score = votesScore + recencyFactor + randomness;
  return { ...entry, score };
};

// ------------------------------------------------------------------
// 🚀 API ENDPOINTS
// ------------------------------------------------------------------

server.get('/api/friends-feed', (req, res) => {
  const data = router.db.get('friends_feed').value();
  const ranked = data.map(calculateFriendsFeedScore).sort((a, b) => b.score - a.score);
  res.json(ranked);
});

server.get('/api/contest-feed', (req, res) => {
  const data = router.db.get('contest_feed').value();
  const ranked = data.map(calculateContestScore).sort((a, b) => b.score - a.score);
  res.json(ranked);
});

server.get('/api/leaderboard', (req, res) => {
  const contestData = router.db.get('contest_feed').value();
  const friendsData = router.db.get('friends_feed').value();

  const petDetailsMap = friendsData.reduce((map, item) => {
    map[item.pet_name] = {
      nick_name: item.nick_name,
      photo_url: item.photo_url
    };
    return map;
  }, {});
  
  const ranked = contestData
    .map(calculateContestScore) 
    .sort((a, b) => b.score - a.score);

  const topThree = ranked.slice(0, 3).map((entry, index) => {
    const details = petDetailsMap[entry.pet_name] || {}; 
    
    return {
      rank: index + 1,
      pet_name: entry.pet_name,
      owner_nickname: details.nick_name || 'N/A', 
      photo_url: details.photo_url || 'https://pawse.app/default.jpg',
      votes: entry.votes_from_contest,
      score: entry.score,
      submitted_at: entry.submitted_at
    };
  });

  res.json({
    contest_name: "Sleepiest Pet 💤",
    leaderboard_updated: new Date().toISOString(),
    top_entries: topThree
  });
});

// Since custom /api routes are handled above, we don't need to mount the JSON Server router at all
// unless you want to use its RESTful resource creation/deletion features.
// If not, leave it out. For now, it's removed for simplicity and stability.
// If you want standard JSON Server resource endpoints like /friends_feed, you would add:
// server.use(router); 

server.listen(3000, () => {
  console.log('Pawse API running on port 3000 🐾');
});