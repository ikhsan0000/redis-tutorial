const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const redisClient = redis.createClient();
redisClient.connect(); //connect to redis client

app.listen(3000);

app.get('/photos', async (req, res) => {
  const albumId = req.query.albumId;
  const redisKeyExists = await redisClient.exists(`photo-albumId:${albumId}`); //check if the key already exist

  if (redisKeyExists == 1) {
    //if key exist then use redis cache
    const photos = await redisClient.get(`photo-albumId:${albumId}`);
    console.log('Redis Cache Hit');
    res.json(JSON.parse(photos));
  } else {
    const { data: photos } = await axios
      .get('https://jsonplaceholder.typicode.com/photos', {
        params: { albumId },
      })
      .then((response) => response);

    redisClient.setEx(`photo-albumId:${albumId}`, 30, JSON.stringify(photos));
    res.json(photos);
  }
});
