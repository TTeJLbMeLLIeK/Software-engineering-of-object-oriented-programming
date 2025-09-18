function getRandomDigit() {
  return Math.floor(Math.random() * 9) + 1;
}

const sampleSizes = [10**2, 10**4, 10**6, 10**8];

for (let size of sampleSizes) {
  let frequencies = {};

  for (let i = 0; i < size; i++) {
    let value = getRandomDigit();
    frequencies[value] = (frequencies[value] || 0) + 1;
  }

  const idealPercent = (100 / 9).toFixed(4);
  let deviations = {};

  for (let digit = 1; digit <= 9; digit++) {
    let percent = (frequencies[digit] / size) * 100;
    let delta = (percent - 100 / 9).toFixed(4);
    deviations[digit] = `${delta}%`;
  }

  console.log(`\nРазмер выборки: ${size}`);
  console.log(`Ожидаемая вероятность: ${idealPercent}%`);
  console.log("Отклонения по цифрам:", deviations);
  console.log("-".repeat(40));
}
