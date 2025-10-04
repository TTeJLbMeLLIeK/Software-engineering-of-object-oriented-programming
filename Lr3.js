const request = require('sync-request');

// Задание 1
function task1() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-1.txt');
    const text = res.getBody('utf8');
    const numbers = text.split(/\s+/).map(Number);

    const maxTwoDigit = Math.max(...numbers.filter(n => n >= 10 && n <= 99));
    console.log("Задание 1:", maxTwoDigit);
}

// Задание 2
function task2() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-2.txt');
    const lines = res.getBody('utf8').trim().split('\n');

    let count = 0;
    lines.forEach(line => {
        const nums = line.trim().split(/\s+/).map(Number);
        if (nums.every(n => n % 2 !== 0)) count++;
    });

    console.log("Задание 2:", count);
}

// Задание 3
function task3() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-2.txt');
    const lines = res.getBody('utf8').trim().split('\n');

    let maxSum = -Infinity;
    let maxIndex = -1;

    lines.forEach((line, idx) => {
        const nums = line.trim().split(/\s+/).map(Number);
        const sumOdd = nums.filter(n => n % 2 !== 0).reduce((a, b) => a + b, 0);
        if (sumOdd > maxSum) {
            maxSum = sumOdd;
            maxIndex = idx;
        }
    });

    console.log("Задание 3:", maxIndex);
}

// Задание 4
function task4() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-3.txt');
    const lines = res.getBody('utf8').trim().split('\n');

    const langs = lines.map(line => line.split(';')[1]);

    langs.sort((a, b) => a.localeCompare(b));

    console.log("Задание 4:");
    langs.forEach(lang => console.log(lang));
}

// Задание 5
function task5() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-3.txt');
    const lines = res.getBody('utf8').trim().split('\n');

    const data = lines.map(line => {
        const [ratingStr, lang] = line.split(';');
        const rating = parseFloat(ratingStr.replace(',', '.').replace('%', ''));
        return { lang, rating };
    });

    data.sort((a, b) => b.rating - a.rating);

    console.log("Задание 5:");
    data.forEach(d => console.log(`${d.rating.toFixed(2)} ${d.lang}`));
}

// Задание 6
function task6() {
    const res = request('GET', 'http://pcoding-ru.1gb.ru/json/abiturs.json');
    const abiturs = JSON.parse(res.getBody('utf8'));

    abiturs.sort((a, b) => {
        if (a.city === b.city) {
            return Number(b.rating) - Number(a.rating);
        }
        return a.city.localeCompare(b.city);
    });

    console.log("Задание 6:");
    abiturs.forEach(ab => console.log(`${ab.city} ${ab.rating} ${ab.lastName}`));
}

// Вывод
task1();
task2();
task3();
task4();
task5();
task6();