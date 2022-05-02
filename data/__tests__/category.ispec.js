const { getCategory } = require('../category');
describe('Category', () => {
  test('Get categories', async () => {
    const { allCategory } = await getCategory();
    const categories = allCategory;
    for (const { id, name, type } of categories) {
      expect(typeof id).toEqual('string');
      expect(typeof name).toEqual('string');
      expect(typeof type).toEqual('string');
    }
  });
});
