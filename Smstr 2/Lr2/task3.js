const fs = require('fs')
const data = fs.readFileSync('data.csv', 'utf8').trim().split('\n')

data.forEach((line, index) => {
	const values = line.trim().split(/\s+/).map(Number)
	const map = new Map()

	values.forEach(n => map.set(n, (map.get(n) || 0) + 1))

	const entries = [...map.entries()]
	const pairs = entries.filter(([_, c]) => c === 2)

	if (pairs.length !== 2) return
	if (!entries.every(([_, c]) => c === 1 || c === 2)) return

	const repeatedSum = pairs.reduce((s, [n]) => s + n * 2, 0)
	const uniqueSum = entries.filter(([_, c]) => c === 1).reduce((s, [n]) => s + n, 0)

	if (repeatedSum < uniqueSum) {
		console.log(`Строка ${index + 1}: ${values.join(' ')}`)
	}
})