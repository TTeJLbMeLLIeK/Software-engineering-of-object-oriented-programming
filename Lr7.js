const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL =
  'https://www.championat.com/football/_russiapl/tournament/6594/table/';

function csvEscape(value) {
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

(async () => {
  try {
    const response = await axios.get(URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let targetTable = null;

    $('table').each((i, table) => {
      const text = $(table).text();
      if (text.includes('№') && text.includes('Команда') && text.includes('Мячи')) {
        targetTable = table;
        return false;
      }
    });

    if (!targetTable) {
      console.error('Не удалось найти турнирную таблицу в HTML');
      return;
    }

    const teams = [];

    $(targetTable)
      .find('tr')
      .each((i, row) => {
        const cells = $(row).find('td');

        if (cells.length < 8) return;

        const position = $(cells[0]).text().trim();
        const team = $(cells[1]).text().trim();

        if (!/^\d+$/.test(position)) return;

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
          goals,
          points: Number(points),
          pointsPercent,
        });
      });

    console.log(`Спарсили ${teams.length} команд`);

    const jsonPath = path.join(__dirname, 'rpl_table.json');
    fs.writeFileSync(jsonPath, JSON.stringify(teams, null, 2), 'utf8');
    console.log(`JSON сохранён: ${jsonPath}`);

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