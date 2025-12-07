// scrape_rpl_table.js
// Парсинг турнирной таблицы РПЛ с championat.com, сохранение в JSON и CSV

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL =
  'https://www.championat.com/football/_russiapl/tournament/6594/table/';

// небольшая функция для CSV-экранирования
function csvEscape(value) {
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

(async () => {
  try {
    // 1. Загружаем HTML
    const response = await axios.get(URL, {
      headers: {
        // маскируемся под обычный браузер
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Ищем таблицу с заголовком "№ Команда И ..."
    let targetTable = null;

    $('table').each((i, table) => {
      const text = $(table).text();
      if (text.includes('№') && text.includes('Команда') && text.includes('Мячи')) {
        targetTable = table;
        return false; // break
      }
    });

    if (!targetTable) {
      console.error('Не удалось найти турнирную таблицу в HTML');
      return;
    }

    const teams = [];

    // 3. Проходим по строкам таблицы "Общая"
    // Предполагаем, что первая часть таблицы — общая (до "Стыковая зона")
    $(targetTable)
      .find('tr')
      .each((i, row) => {
        const cells = $(row).find('td');

        // Пропускаем строки без ячеек или служебные строки
        if (cells.length < 8) return;

        const position = $(cells[0]).text().trim();
        const team = $(cells[1]).text().trim();

        // иногда в таблице могут быть служебные строки,
        // у которых в первом столбце не номер
        if (!/^\d+$/.test(position)) return;

        // Индексы колонок:
        // 0 - №
        // 1 - Команда
        // 2 - И (матчи)
        // 3 - В (победы)
        // 4 - Н (ничьи)
        // 5 - П (поражения)
        // 6 - Мячи (например "34-12")
        // 7 - О (очки)
        // 8 - % очков (может быть)
        const matches = $(cells[2]).text().trim();
        const wins = $(cells[3]).text().trim();
        const draws = $(cells[4]).text().trim();
        const losses = $(cells[5]).text().trim();
        const goals = $(cells[6]).text().trim();
        const points = $(cells[7]).text().trim();
        const pointsPercent = cells[8] ? $(cells[8]).text().trim() : '';

        teams.push({
          position: Number(position),
          team,
          matches: Number(matches),
          wins: Number(wins),
          draws: Number(draws),
          losses: Number(losses),
          goals, // можно оставить строкой "34-12"
          points: Number(points),
          pointsPercent,
        });
      });

    console.log(`Спарсили ${teams.length} команд`);

    // 4. Сохраняем JSON
    const jsonPath = path.join(__dirname, 'rpl_table.json');
    fs.writeFileSync(jsonPath, JSON.stringify(teams, null, 2), 'utf8');
    console.log(`JSON сохранён: ${jsonPath}`);

    // 5. Сохраняем CSV (не менее 4 столбцов)
    const csvHeader = [
      'position',
      'team',
      'matches',
      'wins',
      'draws',
      'losses',
      'goals',
      'points',
      'pointsPercent',
    ];

    const csvLines = [
      csvHeader.map(csvEscape).join(','),

      ...teams.map((t) =>
        [
          t.position,
          t.team,
          t.matches,
          t.wins,
          t.draws,
          t.losses,
          t.goals,
          t.points,
          t.pointsPercent,
        ]
          .map(csvEscape)
          .join(',')
      ),
    ];

    const csvPath = path.join(__dirname, 'rpl_table.csv');
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    console.log(`CSV сохранён: ${csvPath}`);
  } catch (err) {
    console.error('Ошибка при загрузке или парсинге:', err.message);
  }
})();