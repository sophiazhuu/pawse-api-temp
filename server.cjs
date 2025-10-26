const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
server.use(middlewares);

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

// Custom endpoint for feed ranking
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

// ---------- LEADERBOARD (Top 3 Contest Entries) - ENHANCED WITH JOIN ----------
server.get('/api/leaderboard', (req, res) => {
  const contestData = router.db.get('contest_feed').value();
  const friendsData = router.db.get('friends_feed').value();

  // 1. Create a quick lookup map for owner/photo details from friends_feed
  const petDetailsMap = friendsData.reduce((map, item) => {
    map[item.pet_name] = {
      nick_name: item.nick_name,
      photo_url: item.photo_url
    };
    return map;
  }, {});
  
  // 2. Calculate scores and join data
  const ranked = contestData
    .map(calculateContestScore) // Calculate score
    .sort((a, b) => b.score - a.score); // Sort by score

  // 3. Limit to top 3 and structure the final response
  const topThree = ranked.slice(0, 3).map((entry, index) => {
    const details = petDetailsMap[entry.pet_name] || {}; // Get linked details
    
    return {
      rank: index + 1,
      pet_name: entry.pet_name,
      // Enhanced fields from the 'join'
      owner_nickname: details.nick_name || 'N/A', 
      photo_url: details.photo_url || 'https://pawse.app/default.jpg',
      // Contest specific fields
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

// Links for convenience to each endpoint
server.get('/', (req, res) => {
  res.send(`
    <h1>🐾 Pawse API</h1>
    <p>This internal API powers feed ranking and leaderboard data for the Pawse app.</p>
    <ul>
      <li><a href="/api/friends-feed">/api/friends-feed</a> – Ranked feed for friends</li>
      <li><a href="/api/contest-feed">/api/contest-feed</a> – Ranked feed for contest entries</li>
      <li><a href="/api/leaderboard">/api/leaderboard</a> – Top 3 contest results (daily)</li>
    </ul>
    <p><em>Powered by JSON Server + Render</em></p>
  `);
});

// Make sure JSON Server router loads last
server.use('/api', router);

server.listen(3000, () => {
  console.log('Pawse API running on port 3000 🐾');
});
