const fs = require('fs');
const content = fs.readFileSync('src/data/questions.ts', 'utf8');
const target = 'q: "65. 从这套茶产品销售系统中，你学到了什么？未来的职业规划是怎样的？"';
const index = content.indexOf(target);
if (index !== -1) {
    // Find the end of this object
    const endIndex = content.indexOf('difficulty: "简单"\n      }', index);
    if (endIndex !== -1) {
        const goodContent = content.substring(0, endIndex + 25) + '\n    ]\n  }\n];\n';
        fs.writeFileSync('src/data/questions.ts', goodContent);
        console.log('Fixed questions.ts');
    } else {
        console.log('endIndex not found');
    }
} else {
    console.log('target not found');
}
