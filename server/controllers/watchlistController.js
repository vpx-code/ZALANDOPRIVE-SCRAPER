const Watchlist = require('../models/Watchlist');
const brandController = require('./brandController');
const categoryController = require('./categoryController');
const dockerController = require('./dockerController');

exports.encodeURL = async (watchlist) => {
  const multi_option_char = "%7C";
  let payload = [];

  if (watchlist.url) {
    console.log('URL already exists for this watchlist.');
    return watchlist.url;
  }

  let category = await categoryController.getCategory(watchlist.category, watchlist.gender);
  if (!category.response) {
    console.log('No matching category found.');
    return;
  }

  let categoryCriterion = "category_ids=";
  let categoryId = category.response.categoryId;
  if (categoryId) {
    categoryCriterion = categoryCriterion.concat(categoryId);
    payload.push(categoryCriterion);
  }

  let brandCriterion = "brand_codes=";
  let brands = watchlist.brands;
  if (brands) {
    let brandCodePromises = brands.map((b) => brandController.getBrandCode(b));
    const resolvedBrandCodes = await Promise.all(brandCodePromises);

    resolvedBrandCodes.forEach((code, i) => {
      brandCriterion = brandCriterion.concat(code);
      if (i < resolvedBrandCodes.length - 1) {
        brandCriterion = brandCriterion.concat(multi_option_char);
      }
    });
    payload.push(brandCriterion);
  }

  let sizeTagsCriterion = "sizes.";
  let sizeTag = category.response.filterName;
  let watchlistSizes = watchlist.sizes;

  if (sizeTag && watchlistSizes) {
    sizeTagsCriterion = sizeTagsCriterion.concat(sizeTag, "=");
    watchlistSizes.forEach((s, i) => {
      sizeTagsCriterion = sizeTagsCriterion.concat(s);
      if (i < watchlistSizes.length - 1) {
        sizeTagsCriterion = sizeTagsCriterion.concat(multi_option_char);
      }
    });
    payload.push(sizeTagsCriterion);
  }

  let encodedPayload = payload.join("&");
  let completeURL = `https://www.zalando-prive.es/api/phoenix/search/ccf/articles?${encodedPayload}&size=60&sort=availability_female&no_soldout=1`;
  console.log(completeURL);

  watchlist.url = completeURL;
  await watchlist.save();

  return completeURL;
};

exports.startAllServices = async () => {
  try {
    const watchlists = await Watchlist.find();
    for (const watchlist of watchlists) {
      const payload = await this.encodeURL(watchlist);
      await dockerController.createOrUpdateService(watchlist.name, payload);
    }
    console.log('All services started successfully');
  } catch (err) {
    console.error('Error starting services', err.message);
  }
};