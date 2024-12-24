const fs = require('fs')
console.log('111')
const PluginCommon = require('./plugin/common.js')
console.log('222')
const PluginJjencode = require('./plugin/jjencode.js')
console.log('333')
// const PluginSojson = require('./plugin/sojson.js')
console.log('444')
const PluginSojsonV7 = require('./plugin/sojsonv7.js')
console.log('555')
// const PluginObfuscator = require('./plugin/obfuscator.js')
console.log('666')
// const PluginAwsc = require('./plugin/awsc.js')
console.log('777')

// 读取参数
let encodeFile = 'input.js'
let decodeFile = 'output.js'
for (let i = 2; i < process.argv.length; i += 2) {
  if (process.argv[i] === '-i') {
    encodeFile = process.argv[i + 1]
  }
  if (process.argv[i] === '-o') {
    decodeFile = process.argv[i + 1]
  }
}
console.log(`输入: ${encodeFile}`)
console.log(`输出: ${decodeFile}`)

// 读取源代码
let sourceCode;
try {
  sourceCode = fs.readFileSync(encodeFile, { encoding: 'utf-8' });
  if (!sourceCode) {
    console.error('读取文件失败：文件内容为空');
    process.exit(1);
  }
} catch (error) {
  console.error(`读取文件失败：${error.message}`);
  process.exit(1);
}

let processedCode = sourceCode;
let pluginUsed = '';

// 循环尝试不同的插件，直到源代码与处理后的代码不一致
const plugins = [
  // { name: 'obfuscator', plugin: PluginObfuscator },
  { name: 'sojsonv7', plugin: PluginSojsonV7 },
  // { name: 'sojson', plugin: PluginSojson },

  // { name: 'awsc', plugin: PluginAwsc },
  // { name: 'jjencode', plugin: PluginJjencode },
    { name: 'common', plugin: PluginCommon },// 最后一次使用通用插件
];

for (let plugin of plugins) {
  if (sourceCode.indexOf("smEcV") != -1) {
    console.log('检测到特殊标记 smEcV，停止处理');
    break;
  }
  
  console.log(`尝试使用插件: ${plugin.name}`);
  try {
    const code = plugin.plugin(sourceCode);
    if (!code) {
      console.log(`插件 ${plugin.name} 返回空结果，跳过`);
      continue;
    }
    if (code !== processedCode) {
      processedCode = code;
      pluginUsed = plugin.name;
      console.log(`插件 ${plugin.name} 成功处理代码`);
      break;
    }
  } catch (error) {
    console.error(`插件 ${plugin.name} 处理时发生错误: ${error.message}`);
    console.error(error.stack); // 打印完整的错误堆栈
    continue;
  }
}

// 写入文件时也增加错误处理
let time = new Date();
if (processedCode !== sourceCode) {
  try {
    fs.writeFileSync(
      decodeFile, 
      `//${time}\n//Base:https://github.com/echo094/decode-js\n//Modify:https://github.com/smallfawn/decode_action\n${processedCode}`
    );
    console.log(`使用插件 ${pluginUsed} 成功处理并写入文件 ${decodeFile}`);
  } catch (error) {
    console.error(`写入文件失败：${error.message}`);
    process.exit(1);
  }
} else {
  console.log(`所有插件处理后的代码与原代码一致，未写入文件。`);
}

