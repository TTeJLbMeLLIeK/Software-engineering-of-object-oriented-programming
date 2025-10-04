const http = require('http');
const [ HOST, PORT ] = [ 'localhost', 3000 ];

function getRandomDigit() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateRNDStats() {
  const sampleSizes = [10 ** 2, 10 ** 4, 10 ** 6, 10 ** 8];
  let rows = [];

  for (let size of sampleSizes) {
    let frequencies = {};
    for (let i = 0; i < size; i++) {
      let value = getRandomDigit();
      frequencies[value] = (frequencies[value] || 0) + 1;
    }

    let row = { size, deviations: {} };
    for (let digit = 1; digit <= 9; digit++) {
      let percent = (frequencies[digit] / size) * 100;
      let delta = (percent - 100 / 9).toFixed(4);
      row.deviations[digit] = delta;
    }
    rows.push(row);
  }

  return rows;
}

function buildHTMLTable(rndStats) {
  let html = '<table border="1" cellpadding="5" cellspacing="0">';
  html += '<tr><th>Размер выборки</th>';
  for (let d = 1; d <= 9; d++) html += `<th>Цифра ${d} отклонение %</th>`;
  html += '</tr>';

  rndStats.forEach(stat => {
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
    const rndStats = generateRNDStats();
    res.write(buildHTMLTable(rndStats));
  }
  res.end();
}

const server = http.createServer(onEvent);
server.listen(PORT, () => console.log(`Сервер запущен: http://${HOST}:${PORT}/`));