const NeiTypeTool = require('../lib');

const tool = new NeiTypeTool('dd4d6bc3f732d875855a33060345b252');

// 如果想要使用 this 指代 tool，这里的回调不能使用箭头函数.
tool.init(function() {
    console.log(this.interfaces);
})