const fs = require("fs");

const lines = fs.readFileSync("data.csv", "utf-8").trim().split("\n");
let result = [];

for (let i = 0; i < lines.length; i++) {
    const a = lines[i].trim().split(/\s+/).map(Number);

    const odd = a.every(x => x % 2 !== 0);
    const diff = new Set(a).size === a.length;
    const inc = a.every((x, j) => j === 0 || a[j - 1] < x);

    if (odd && diff && inc) result.push(i + 1);
}

console.log(result.join(" "));