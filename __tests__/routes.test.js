const request = require('supertest');
require('dotenv').config();
const app = require('../app');

let token;
beforeAll((done) => {
  request(app)
    .post('/login')
    .send({
      email: process.env.JEST_LOGIN_EMAIL,
      password: process.env.JEST_LOGIN_PASS,
    })
    .end((err, response) => {
      token = response.body.authToken;
      done();
    });
});

describe('GET ALL CATEGORIES', () => {
  it('should allow to get list of all categories', async () => {
    const res = await request(app).get('/categories').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('categories');
  });
});

let productId;
describe('ADD A PRODUCT', () => {
  it('should create a new product that does not exists', async () => {
    const res = await request(app).put('/products').set('Authorization', `Bearer ${token}`).send({
      barcode: '073852013337',
    });
    expect(res.body.status).toEqual('success');
    expect(res.body).toHaveProperty('productId');
    productId = res.body.productId;
  });
});

describe('GET ALL PRODUCTS', () => {
  it('should allow to get list of all products', async () => {
    const res = await request(app).get('/products').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
  });
});

describe('ADD A CUSTOM PRODUCT', () => {
  it('should create a new custom product', async () => {
    const res = await request(app)
      .put('/products/custom')
      .set('Authorization', `Bearer ${token}`)
      .send({
        barcode: '096619663712',
        name: 'Kirkland Adult Multivitamin Gummies',
        alias: 'Kirkland Vitamin Gummies',
        description: 'Kirkland Adult Multivitamin Gummies',
        brand: 'Costco',
        manufacturer: 'Costco',
        categoryId: 'c6830585-53bf-4fc5-b2b6-7e46cfaca7e1',
      });
    expect(res.body.status).toEqual('success');
    expect(res.body).toHaveProperty('product');
  });
});

describe('GET PRODUCT BY ID', () => {
  it('should allow to get product details by ID', async () => {
    const res = await request(app)
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('product');
  });
});

let itemId;
// describe('ADD AN ITEM TO A PRODUCT', () => {
const d = new Date();
let tempExpiryDate = d.setMonth(d.getMonth() + 2);
tempExpiryDate = new Date(tempExpiryDate).toISOString();
it('should add an item to a product', async () => {
  const res = await request(app)
    .post(`/products/${productId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      expirationDate: tempExpiryDate,
      quantity: 1,
      cost: 15,
    });
  expect(res.body.status).toEqual('success');
  expect(res.body).toHaveProperty('item');
  itemId = res.body.item.id;
});
// });

describe('ADD A PRODUCT THAT ALREADY EXISTS', () => {
  it('should return the above created product', async () => {
    const res = await request(app).put('/products').set('Authorization', `Bearer ${token}`).send({
      barcode: '0073852013337',
    });
    expect(res.body.status).toEqual('success');
    expect(res.body).toHaveProperty('product');
  });
});

describe('GET ALL ITEMS', () => {
  it('should allow to get list of all items', async () => {
    const res = await request(app).get('/items').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('items');
  });
});

it('should allow to get item details by ID', async () => {
  const res = await request(app).get(`/items/${itemId}`).set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('item');
});

it('should allow to delete an item', async () => {
  const res = await request(app).delete(`/items/${itemId}`).set('Authorization', `Bearer ${token}`);
  expect(res.body.status).toEqual('success');
});

let shoppingItemId;
describe('ADD AN ITEM TO SHOPPING LIST', () => {
  it('should add an item to shopping list', async () => {
    const res = await request(app).post(`/shopping`).set('Authorization', `Bearer ${token}`).send({
      productId: productId,
      quantity: 1,
      cost: 15,
    });
    expect(res.body.status).toEqual('success');
    expect(res.body).toHaveProperty('item');
    shoppingItemId = res.body.item.id;
  });
});

describe('GET ALL SHOPPING ITEMS', () => {
  it('should allow to get list of all shopping items', async () => {
    const res = await request(app).get('/shopping').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('items');
  });
});

describe('GET SHOPPING ITEM BY ID', () => {
  it('should allow to get shopping item details by ID', async () => {
    const res = await request(app)
      .get(`/shopping/${shoppingItemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('item');
  });
});

describe('UPDATE A SHOPPING ITEM', () => {
  it('should update a shopping item', async () => {
    const res = await request(app)
      .put(`/shopping/${shoppingItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        quantity: 2,
        cost: 30,
      });
    expect(res.body.status).toEqual('success');
    expect(res.body).toHaveProperty('item');
  });
});

describe('DELETE SHOPPING ITEM BY ID', () => {
  it('should allow to delete a shopping list item', async () => {
    const res = await request(app)
      .delete(`/shopping/${shoppingItemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.status).toEqual('success');
  });
});

describe('DELETE PRODUCT BY ID', () => {
  it('should allow to delete a product', async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.status).toEqual('success');
  });
});
