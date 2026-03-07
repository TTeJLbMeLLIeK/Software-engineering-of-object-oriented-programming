import axios from "axios";
import fs from "fs/promises";

const headers = {
    "User-Agent": "Mozilla/5.0",
    accept: "*/*",
};

async function getProducts(page) {
    const url = `https://search.wb.ru/exactmatch/ru/common/v5/search?query=планшет&sort=price_desc&page=${page}&resultset=catalog&appType=1&curr=rub&dest=-1257786`;

    try {
        const res = await axios.get(url, { headers });
        const data = res.data;
        if (page === 1) {
            console.log("Всего найдено товаров:", data.metadata?.total);
        }
        return data.data?.products || [];
    } catch (err) {
        console.log("Ошибка при загрузке страницы", page, err.message);
        return [];
    }
}

async function main() {
    const pages = 3;
    let all = [];

    for (let i = 1; i <= pages; i++) {
        console.log("Загружается страница", i);
        const products = await getProducts(i);
        console.log("Товаров на странице:", products.length);
        all = all.concat(products);
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log("Всего собрано товаров:", all.length);

    const result = all.map(p => ({
        brand: p.brand,
        name: p.name,
        feedbacks: p.feedbacks,
        supplierRating: p.supplierRating,
        link: `https://www.wildberries.ru/catalog/${p.id}/detail.aspx`,
        price: (p.sizes?.[0]?.price?.product || 0) / 100,
        basePrice: (p.sizes?.[0]?.price?.basic || 0) / 100,
        characteristics: {
            color: p.colors?.[0]?.name || "нет данных",
            category: p.subjectName || "нет данных",
            quantity: p.totalQuantity || "нет данных",
            volume: p.volume || "нет данных"
        }
    }));

    try {
        await fs.writeFile("products.json", JSON.stringify(result, null, 2));
        console.log("Файл products.json сохранён");
    } catch (e) {
        console.log("Ошибка при записи файла:", e.message);
    }
}

main();