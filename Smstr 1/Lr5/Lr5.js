const fs = require('fs');
const readline = require('readline');

// task01
function task01() {
  const users = require('./json/users.json');
  const result = users
    .filter(user => user.address && user.address.geo && parseFloat(user.address.geo.lat) < 0)
    .map(user => ({ username: user.username, city: user.address.city }))
    .sort((a, b) => b.city.localeCompare(a.city));
  console.log('task01:', JSON.stringify(result, null, 4));
}

// task02
function task02() {
  const data = require('./json/clients.json');
  const clients = data.clients;
  const result = clients
    .filter(client => client.address && client.address.city === 'Кунгур')
    .sort((a, b) => {
      if (a.gender !== b.gender) return a.gender === 'female' ? -1 : 1;
      if (a.age !== b.age) return b.age - a.age;
      return a.name.localeCompare(b.name);
    });
  console.log('task02:', JSON.stringify(result, null, 2));
}

// task03
function task03() {
  const colors = require('./json/colors.json');
  const result = colors
    .map(color => Object.keys(color)[0])
    .filter(name => name.length < 6)
    .sort((a, b) => a.localeCompare(b));
  console.log('task03:', JSON.stringify(result, null, 2));
}

// task04
function task04() {
  const colors = require('./json/colors.json');
  const result = colors
    .map(color => {
      const name = Object.keys(color)[0];
      const rgb = color[name].slice(0, 3);
      return { color: name, rgb };
    })
    .sort((a, b) => a.color.localeCompare(b.color));
  console.log('task04:', JSON.stringify(result, null, 4));
}

// task05
function task05() {
  const data = require('./json/data.js');
  const { colors, argb } = data;
  const result = colors
    .map((color, i) => {
      const [r, g, b] = argb[i];
      const hex = '#' + r.toString(16).toUpperCase().padStart(2, '0') + 
                  g.toString(16).toUpperCase().padStart(2, '0') + 
                  b.toString(16).toUpperCase().padStart(2, '0');
      return { color, hex_name: hex };
    })
    .sort((a, b) => a.color.localeCompare(b.color));
  fs.writeFileSync('./hexColors.json', JSON.stringify(result, null, 2));
  console.log('task05: Saved to hexColors.json');
}
function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== Выберите задачу ===');
  console.log('1 - task01');
  console.log('2 - task02');
  console.log('3 - task03');
  console.log('4 - task04');
  console.log('5 - task05');
  console.log('q - выход');

  rl.question('Введите номер задачи: ', (answer) => {
    rl.close();

    switch (answer.toLowerCase()) {
      case '1':
        task01();
        break;
      case '2':
        task02();
        break;
      case '3':
        task03();
        break;
      case '4':
        task04();
        break;
      case '5':
        task05();
        break;
      case 'q':
        console.log('До свидания!');
        process.exit(0);
      default:
        console.log('Неверный ввод! Попробуйте снова.');
        showMenu();
        return;
    }
    setTimeout(() => showMenu(), 1000);
  });
}
showMenu();