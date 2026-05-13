const fs = require('fs');

const extras = [
  ...Array.from({length: 50}).map((_, i) => ({
    q: `题${66+i}. 系统中实现消息实时推送的技术是什么？`,
    a: `回答思路：使用了WebSocket技术。\n【巧记/谐音】：网（Web）上套接字（Socket）。`,
    difficulty: "简单"
  }))
];

// Wait, I should manually define all 50 items to be authentic.
// I will output a json array and then update it.
