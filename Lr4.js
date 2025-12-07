const express = require('express');
const { HOST, PORT } = { "HOST": "localhost", "PORT": 3000 };

const app = express();
app.use(express.static('css'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const head = `
    <head>
        <meta charset="UTF-8">
        <title>Конвертер</title>
        <link rel="stylesheet" type="text/css" href="style.css" />
    </head>`;

const formConverter = `
    <form method="POST" action="/">
        <label>Число:</label>
        <input type="text" name="inputNumber" size="16" required /><br><br>
        <label>Основание системы счисления (2-16):</label>
        <select name="base" required>
            <option value="2">2</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="16">16</option>
        </select><br><br>
        <button type="submit" class="btn-style">Перевести</button>
    </form>`;

const getHtml = (result = '') => {
    return `
        <!DOCTYPE html>
        <html lang="ru">
            ${head}
            <body>
                ${formConverter}<br>
                <div id="output">${result}</div>
            </body>
        </html>`;
}

app.post('/', (req, res) => {
    let num = +req.body.inputNumber.trim();
    let base = +req.body.base;
    if (Number.isNaN(num) || Number.isNaN(base) || base < 2 || base > 16 || !Number.isInteger(num)) { 
        res.send( getHtml("некорректные данные") );
        return;
    }
    let converted = num.toString(base).toUpperCase();
    let resultText = `${num}(10) => ${converted}(${base})`;
    res.send( getHtml(resultText) );
});

app.get('/', (req, res) => {
    res.send( getHtml() );
});

app.listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}/`));