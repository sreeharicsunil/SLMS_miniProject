const fs = require('fs');

const nb = JSON.parse(fs.readFileSync('src/mock/book-dataset.ipynb', 'utf8'));

function parseHtmlTable(html) {
  const rows = [];
  const trMatches = html.match(/<tr[\s\S]*?<\/tr>/g) || [];
  if (trMatches.length <= 1) return rows;
  const thMatches = trMatches[0].match(/<th[\s\S]*?<\/th>/g) || [];
  const headers = thMatches.map(th => th.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  
  for (let i = 1; i < trMatches.length; i++) {
    const tr = trMatches[i];
    const tdMatches = tr.match(/<td[\s\S]*?<\/td>/g) || [];
    if (tdMatches.length === 0) continue;
    const values = tdMatches.map(td => td.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim());
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    if (rowObj.title && rowObj.title !== '...' && !rowObj.title.includes('NaN')) {
      rows.push(rowObj);
    }
  }
  return rows;
}

const allExtracted = [];
[2, 4, 5].forEach(idx => {
  const c = nb.cells[idx];
  if (!c.outputs) return;
  c.outputs.forEach(o => {
    if (o.data && o.data['text/html']) {
      const html = Array.isArray(o.data['text/html']) ? o.data['text/html'].join('') : o.data['text/html'];
      const rows = parseHtmlTable(html);
      rows.forEach(r => {
        if (!allExtracted.some(existing => existing.book_id === r.book_id)) {
          allExtracted.push(r);
        }
      });
    }
  });
});

console.log('Total extracted unique books:', allExtracted.length);
fs.writeFileSync('src/mock/extracted_books.json', JSON.stringify(allExtracted, null, 2), 'utf8');
console.log('Saved to src/mock/extracted_books.json');
