console.log('第一步');

// 函数参数会被立即执行
const promise = new Promise((resolve, reject) => {
  console.log('第二步');
  // 将 resolve 也设置为异步的：得出结论 resolve 先于 then 执行
  setTimeout(() => {
    console.log('第四步');
    resolve('这次一定');
    reject(43);
  });
});

promise.then(
  res => console.log('res', res),
  // undefined,
  err => console.log('err', err.message)
).then(
  res => console.log('第二个 then 的 res', res),
  // null,
  // undefined,
  err => console.log('第二个 then 的 err', err)
);

promise.catch(err => {
  console.log('err', err);
});

console.log('第三步');
