const fs = require('fs')
const data = fs.readFileSync('data.csv', 'utf8').trim().split('\n')

data.forEach((line, index) => {
	const values = line.trim().split(/\s+/).map(Number)
	const count = {}

	values.forEach(n => (count[n] = (count[n] || 0) + 1))

	const triples = Object.entries(count).filter(([_, c]) => c === 3)
	if (triples.length !== 1) return

	const tripleNum = Number(triples[0][0])
	const otherNum = values.filter(n => n !== tripleNum)

	if (new Set(otherNum).size !== otherNum.length) return

	const avg = otherNum.reduce((a, b) => a + b, 0) / otherNum.length

	if (tripleNum > avg) {
		console.log(`Строка ${index + 1}: ${values.join(' ')}`)
	}
})