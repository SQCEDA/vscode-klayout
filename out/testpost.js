'use strict';
const post = require('./post').post;

post(
  'http://172.25.128.1:12082/exec',
  {
      code: 'print(321123);1/0'
  },
  (data, err) => {
      if (err) {
          console.error('HTTP请求失败:', err.message);
          return;
      }
      console.log('HTTP请求成功!');
      console.log('响应:', data && data.json ? data.json : data);
  }
);
/*
// 使用示例
console.log('=== HTTP 示例 ===');
post(
  'http://httpbin.org/post',
  {
    message: 'HTTP测试',
    timestamp: new Date().toISOString()
  },
  (data, err) => {
    if (err) {
      console.error('HTTP请求失败:', err.message);
      return;
    }
    console.log('HTTP请求成功!');
    console.log('响应:', data && data.json ? data.json : data);
  }
);

console.log('\n=== HTTPS 示例 ===');
post(
  'https://httpbin.org/post',
  {
    message: 'HTTPS测试',
    timestamp: new Date().toISOString()
  },
  (data, err) => {
    if (err) {
      console.error('HTTPS请求失败:', err.message);
      return;
    }
    console.log('HTTPS请求成功!');
    console.log('响应:', data && data.json ? data.json : data);
  }
);

console.log('\n=== 带选项的示例 ===');
post(
  'https://httpbin.org/post',
  {
    message: '带选项的测试',
    number: 123
  },
  (data, err) => {
    if (err) {
      console.error('请求失败:', err.message);
      return;
    }
    console.log('带选项请求成功!');
    console.log('URL:', data && data.url ? data.url : '未知');
  },
  {
    timeout: 15000,
    headers: {
      'User-Agent': 'CustomNodeClient/1.0',
      'X-Custom-Header': 'MyValue'
    },
    followRedirect: true // 启用重定向跟随
  }
);
*/