const { default: axios } = require('axios');
// Time module to know how much time the request is taking.
const responseTime = require('response-time');
// Redis module to do the connection
const redis = require('redis');
const express = require('express');
// Sync promise to Async
const { promisify } = require('util');

const app = express();

//Redis
const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

const ASYNC_GET = promisify(client.get).bind(client);
const ASYNC_SET = promisify(client.set).bind(client);

//Middlewares
app.use(responseTime());

//Route 1
try {
  app.get('/characters', async (req, res) => {
    const reply = await ASYNC_GET('characters');
    if (reply) return res.json(JSON.parse(reply));
    const response = await axios.get(
      'https://rickandmortyapi.com/api/character'
    );
    await ASYNC_SET('characters', JSON.stringify(response.data));
    res.json(response.data);
  });
} catch (error) {
  return res
    .status(error.response.status)
    .json({ message: error.response.data.error });
}

// Route 2
app.get('/characters/:id', async (req, res) => {
  try {
    const reply = await ASYNC_GET(`${req.params.id}`);
    if (reply) return res.json(JSON.parse(reply));
    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/${req.params.id}`
    );
    await ASYNC_SET(`${req.params.id}`, JSON.stringify(response.data));
    res.json(response.data);
  } catch (error) {
    return res
      .status(error.response.status)
      .json({ message: error.response.data.error });
  }
});

app.listen(3000);
console.log('Server on port 3000');
