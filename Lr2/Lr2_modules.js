const fs = require('fs');
const path = require('path');

function readDataCsv(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return data
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(Number);
}

function calculateStats(numbers) {
  const size = numbers.length;
  let frequencies = {};

  numbers.forEach(num => {
    frequencies[num] = (frequencies[num] || 0) + 1;
  });

  let deviations = {};
  for (let digit = 1; digit <= 9; digit++) {
    let percent = (frequencies[digit] || 0) / size * 100;
    deviations[digit] = (percent - 100 / 9).toFixed(4);
  }

  return { size, deviations };
}

function runExperiment(size) {
  const numbers = [];
  for (let i = 0; i < size; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  return calculateStats(numbers);
}

function saveResultsToCsv(results, filename = 'experiment_results.csv') {
  const lines = ['Размер выборки,Цифра1,Цифра2,Цифра3,Цифра4,Цифра5,Цифра6,Цифра7,Цифра8,Цифра9'];
  results.forEach(r => {
    const row = [r.size];
    for (let d = 1; d <= 9; d++) row.push(r.deviations[d]);
    lines.push(row.join(','));
  });

  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return filePath;
}

module.exports = {
  readDataCsv,
  calculateStats,
  runExperiment,
  saveResultsToCsv
};