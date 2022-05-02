const { getCategory, getCategoryById } = require('../category');
describe('Category', () => {
  let category = null;
  test('Get categories', async () => {
    const { allCategory } = await getCategory();
    const categories = allCategory;
    for (const cat of categories) {
      const { id, name, type } = cat;
      category = cat;
      expect(typeof id).toEqual('string');
      expect(typeof name).toEqual('string');
      expect(typeof type).toEqual('string');
    }
  });
  test('Get category by id', async () => {
    const { categoryById } = await getCategoryById(category.id);
    expect(categoryById).toEqual(category);
  });
});
