const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { performance } = require('perf_hooks');

chai.use(chaiHttp);

suite('Functional Tests', function() { 
  this.timeout(10000);

  test('Viewing one stock: GET request to /api/stock-prices/', async function() {
    const startTime = performance.now();
    
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' });

    const endTime = performance.now();
    console.log(`Viewing one stock request completed in ${endTime - startTime}ms`);

    chai.assert.equal(res.status, 200);
    chai.assert.isDefined(res.body.stockData);
    chai.assert.equal(res.body.stockData.stock, 'GOOG');
    chai.assert.property(res.body.stockData, 'price');
    chai.assert.property(res.body.stockData, 'likes');
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', async function() {
    const startTime = performance.now();

    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: 'true' });

    const endTime = performance.now();
    console.log(`Viewing one stock and liking it request completed in ${endTime - startTime}ms`);

    chai.assert.equal(res.status, 200);
    chai.assert.isDefined(res.body.stockData);
    chai.assert.equal(res.body.stockData.stock, 'GOOG');
    chai.assert.property(res.body.stockData, 'price');
    chai.assert.isNumber(res.body.stockData.likes);
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', async function() {
    const startTime = performance.now();

    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: 'true' });

    const endTime = performance.now();
    console.log(`Viewing the same stock and liking it again request completed in ${endTime - startTime}ms`);

    chai.assert.equal(res.status, 200);
    chai.assert.isDefined(res.body.stockData);
    chai.assert.isNumber(res.body.stockData.likes);
  });

  test('Viewing two stocks: GET request to /api/stock-prices/', async function() {
    const startTime = performance.now();

    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] });

    const endTime = performance.now();
    console.log(`Viewing two stocks request completed in ${endTime - startTime}ms`);

    chai.assert.equal(res.status, 200);
    chai.assert.isArray(res.body.stockData);
    chai.assert.equal(res.body.stockData.length, 2);
    chai.assert.equal(res.body.stockData[0].stock, 'GOOG');
    chai.assert.equal(res.body.stockData[1].stock, 'MSFT');
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', async function() {
    const startTime = performance.now();

    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: 'true' });

    const endTime = performance.now();
    console.log(`Viewing two stocks and liking them request completed in ${endTime - startTime}ms`);

    chai.assert.equal(res.status, 200);
    chai.assert.isArray(res.body.stockData);
    chai.assert.equal(res.body.stockData.length, 2);
    chai.assert.property(res.body.stockData[0], 'rel_likes');
    chai.assert.property(res.body.stockData[1], 'rel_likes');
  });
});