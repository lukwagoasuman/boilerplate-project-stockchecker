const { Router } = require('express');
const request = require('request');
const crypto = require('crypto');
const Stock = require('../models/Stock'); // Mongoose model

const router = Router();

router.get('/api/stock-prices', async (req, res) => {
  if (!req.query.stock) {
    return res.status(400).json({ error: 'stock is required' });
  }

  let stock = req.query.stock;
  let like = req.query.like === 'true';
  let ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');

  stock = Array.isArray(stock) ? stock.slice(0, 2) : [stock];

  try {
    let stockData = [];

    const fetchStockData = (symbol) => {
      return new Promise((resolve, reject) => {
        request(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`, (error, response, body) => {
          if (error) return reject(error);
          let stockInfo = JSON.parse(body);
          let price = stockInfo.latestPrice || 0;
          resolve(price);
        });
      });
    };

    const processStock = async (symbol) => {
      let updateObj = { $setOnInsert: { stock: symbol } };
      
      // Add to likes only if the like parameter is true
      if (like) {
        const existingStock = await Stock.findOne({ stock: symbol });
        
        if (!existingStock || !existingStock.likes.includes(ipHash)) {
          updateObj.$addToSet = { likes: ipHash };
        }
      }

      const result = await Stock.findOneAndUpdate(
        { stock: symbol },
        updateObj,
        { upsert: true, new: true }
      );

      let likes = result.likes.length;

      let price = await fetchStockData(symbol);
      return { stock: symbol, price, likes };
    };

    const results = await Promise.all(stock.map(symbol => processStock(symbol.toUpperCase())));

    if (results.length === 1) {
      res.json({ stockData: results[0] });
    } else {
      let rel_likes1 = results[0].likes - results[1].likes;
      let rel_likes2 = results[1].likes - results[0].likes;

      results[0].rel_likes = rel_likes1;
      results[1].rel_likes = rel_likes2;

      res.json({ stockData: results });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

module.exports = router;