const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SEARCH_QUERY = 'чехол для телефона';
const AMOUNT_PAGES = 3;

const REQUEST_DELAY_MS = 2000;

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 3000;

const WB_SEARCH_URL = 'https://search.wb.ru/exactmatch/ru/common/v18/search';

const DEST_REGION = -1257786;
const PAGE_SIZE = 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Запрос одной страницы с повторными попытками при 429
 * @param {number} numPage
 * @param {number} attempt
 * @returns {Promise<{ products: any[], total: number | null }>}
 */
async function getProducts(numPage, attempt = 1) {
  try {
    const params = {
      appType: 1,
      curr: 'rub',
      dest: DEST_REGION,
      lang: 'ru',
      page: numPage,
      query: SEARCH_QUERY,
      resultset: 'catalog',
      sort: 'pricedown',
      spp: PAGE_SIZE
    };

    const headers = {
      'Accept': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Origin': 'https://www.wildberries.ru',
      'Referer': 'https://www.wildberries.ru/'
    };

    const response = await axios.get(WB_SEARCH_URL, { params, headers });
    const data = response.data || {};

    const products =
      (data.data && Array.isArray(data.data.products) && data.data.products) ||
      (Array.isArray(data.products) && data.products) ||
      [];

    const total =
      (data.data && typeof data.data.total === 'number' && data.data.total) ||
      (typeof data.total === 'number' && data.total) ||
      (data.metadata && typeof data.metadata.total === 'number' && data.metadata.total) ||
      null;

    console.log(
      `Страница ${numPage}, попытка ${attempt}: получено товаров = ${products.length}${
        total !== null ? `, всего по запросу ≈ ${total}` : ''
      }`
    );

    return { products, total };
  } catch (error) {
    const status = error.response?.status;

    if (status === 429 && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * attempt;
      console.warn(
        `Страница ${numPage}: получен статус 429 (Too Many Requests). ` +
        `Ждём ${delay} мс и пробуем ещё раз (попытка ${attempt + 1} из ${MAX_RETRIES})...`
      );
      await sleep(delay);
      return getProducts(numPage, attempt + 1);
    }

    console.error(
      `Ошибка при запросе страницы ${numPage} (попытка ${attempt}):`,
      status || error.message
    );

    return { products: [], total: null };
  }
}

function transformProduct(p) {
  const id = p.id;

  const priceBase = typeof p.priceU === 'number' ? p.priceU / 100 : null;
  const priceCurrent = typeof p.salePriceU === 'number' ? p.salePriceU / 100 : null;

  const url = id
    ? `https://www.wildberries.ru/catalog/${id}/detail.aspx`
    : null;

  return {
    brand: p.brand || null,
    name: p.name || null,
    feedbacks: typeof p.feedbacks === 'number' ? p.feedbacks : 0,
    supplierRating:
      typeof p.supplierRating === 'number' ? p.supplierRating : null,
    url,

    priceCurrent,
    priceBase,

    characteristics: {
      rating: typeof p.rating === 'number' ? p.rating : null,
      salePercent: typeof p.sale === 'number' ? p.sale : null,
      volume: typeof p.volume === 'number' ? p.volume : null,
      totalQuantity:
        typeof p.totalQuantity === 'number' ? p.totalQuantity : null
    }
  };
}

(async () => {
  console.log(`Поисковый запрос: "${SEARCH_QUERY}"`);
  console.log(`План: собрать товары с первых ${AMOUNT_PAGES} страниц.\n`);

  let allRawProducts = [];
  let totalProductsFromApi = null;

  let numPage = 1;

  while (numPage <= AMOUNT_PAGES) {
    const { products, total } = await getProducts(numPage);

    if (total !== null && totalProductsFromApi === null) {
      totalProductsFromApi = total;
    }

    allRawProducts = allRawProducts.concat(products);

    if (numPage < AMOUNT_PAGES) {
      console.log(`Пауза ${REQUEST_DELAY_MS} мс перед следующей страницей...\n`);
      await sleep(REQUEST_DELAY_MS);
    }

    numPage++;
  }

  console.log('\nСбор данных завершён.');
  console.log(`Всего сырых товаров, собранных с 1..${AMOUNT_PAGES} страниц: ${allRawProducts.length}`);

  if (totalProductsFromApi !== null) {
    console.log(`По данным API, всего товаров по запросу: ~${totalProductsFromApi}\n`);
  } else {
    console.log('Общее количество товаров по запросу определить по ответу не удалось.\n');
  }

  const transformedProducts = allRawProducts.map(transformProduct);

  const outPath = path.join(__dirname, 'products.json');

  try {
    await fs.writeFile(outPath, JSON.stringify(transformedProducts, null, 2), 'utf-8');
    console.log('Файл products.json успешно записан по пути:', outPath);
  } catch (err) {
    console.error('Ошибка при записи файла products.json:', err.message);
  }
})();