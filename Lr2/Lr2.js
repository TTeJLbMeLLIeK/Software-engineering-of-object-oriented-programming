const http = require('http');
const fs = require('fs');
const path = require('path');
const { readDataCsv, calculateStats, runExperiment, saveResultsToCsv } = require('./Lr2_modules');

const [ HOST, PORT ] = [ 'localhost', 3000 ];

function buildHTMLTable(statsArray) {
  let html = '<table border="1" cellpadding="5" cellspacing="0">';
  html += '<tr><th>Размер выборки</th>';
  for (let d = 1; d <= 9; d++) html += `<th>Цифра ${d} отклонение %</th>`;
  html += '</tr>';

  statsArray.forEach(stat => {
    html += `<tr><td>${stat.size}</td>`;
    for (let d = 1; d <= 9; d++) html += `<td>${stat.deviations[d]}</td>`;
    html += '</tr>';
  });

  html += '</table>';
  return html;
}

const onEvent = (req, res) => {
  if (req.url !== '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

    const files = [
      path.join(__dirname, 'Files', 'numbers_10.csv'),
      path.join(__dirname, 'Files', 'numbers_50.csv'),
      path.join(__dirname, 'Files', 'numbers_100.csv')
    ];

    let statsArray = [];

    files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const numbers = readDataCsv(filePath);
        statsArray.push(calculateStats(numbers));
      } else {
        console.warn(`Файл ${filePath} не найден`);
      }
    });

    res.write('<h2>Статистика из данных в CSV-файлах</h2>');
    res.write(buildHTMLTable(statsArray));

    const experimentSizes = [100, 1000, 10000];
    const experimentResults = experimentSizes.map(runExperiment);
    saveResultsToCsv(experimentResults, 'Files/experiment_results.csv');

    res.write('<h2>Результаты из сгенерированных данных (сохранены в experiment_results.csv)</h2>');
    res.write(buildHTMLTable(experimentResults));
  }
  res.end();
};

const server = http.createServer(onEvent);
server.listen(PORT, () => console.log(`Сервер запущен: http://${HOST}:${PORT}/`));