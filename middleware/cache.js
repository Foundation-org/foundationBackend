const cache = require("memory-cache");

// Cache responses for 8 minutes (480 seconds)
module.exports = function (req, res, next) {
  const key = "__express__" + req.originalUrl || req.url;
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    // Parse the cached response as JSON
    const parsedResponse = JSON.parse(cachedResponse);
    res.json(parsedResponse);
  } else {
    const sendJson = res.json.bind(res);
    res.json = (body) => {
      // Serialize the response as JSON when caching
      const jsonBody = JSON.stringify(body);
      cache.put(key, jsonBody, 480 * 1000); // Cache for 8 minutes
      sendJson(body);
    };
    next();
  }
};
