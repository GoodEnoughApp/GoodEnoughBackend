const { getUserProductById, getUserProducts } = require('../products');

describe.skip('Product', () => {
  let product = null;
  const userId = '85de1e0b-14ce-4b61-9fb2-377f8cd2cb36';
  test('Get products', async () => {
    const { allUserProducts } = await getUserProducts(userId);
    const products = allUserProducts;
    products.forEach((prod) => {
      const {
        id,
        barcode,
        name,
        alias,
        description,
        brand,
        manufacturer,
        type,
        barcodeType,
        category,
      } = prod;
      product = prod;
      product.userId = userId;
      expect(typeof id).toEqual('string');
      expect(typeof barcode).toEqual('string');
      expect(typeof name).toEqual('string');
      expect(typeof alias).toEqual('string');
      expect(typeof description).toEqual('string');
      expect(typeof brand).toEqual('string');
      expect(typeof manufacturer).toEqual('string');
      expect(typeof type).toEqual('string');
      expect(typeof barcodeType).toEqual('string');
      expect(typeof category.id).toEqual('string');
      expect(typeof category.name).toEqual('string');
      expect(typeof category.type).toEqual('string');
    });
  });
  test('Get product by id', async () => {
    const { productById } = await getUserProductById(product.id, userId);
    expect(productById).toEqual(product);
  });
});
