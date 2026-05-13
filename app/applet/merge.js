const fs = require('fs');
const extra = require('./extra.json');

const extraText = extra.map(e => {
  return `      {\n        q: ${JSON.stringify(e.q)},\n        a: ${JSON.stringify(e.a)},\n        difficulty: ${JSON.stringify(e.difficulty)}\n      }`;
}).join(',\n');

let ts = fs.readFileSync('src/data/questions.ts', 'utf8');

// The file currently ends with the last object, closing arrays and objects.
// We will match the end of the file: `}\n    ]\n  }\n];` ignoring exact whitespace.
const endRegex = /\}[^}]*\][^}]*\}[^}]*\];\s*$/;
const match = ts.match(endRegex);

if (match) {
    // we want to replace the `}` that closes the last question object with `},`
    // Wait, endRegex matches `}\n    ]\n  }\n];`
    // So the first `}` in the match is the end of the last question!
    // We can just replace the whole match with `},\n` + extraText + `\n    ]\n  }\n];\n`
    
    ts = ts.replace(endRegex, '},\n' + extraText + '\n    ]\n  }\n];\n');
    fs.writeFileSync('src/data/questions.ts', ts);
    console.log("Successfully merged 50 questions.");
} else {
    console.log("Regex did not match the end of the file.");
}
