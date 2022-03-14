
// 同步
// 执行完上一个任务才执行下一个任务

// 阻塞
// 上一个任务执行结束之前，后面的都需要等待

// 事件机制

// 回调函数

// 问题：resolve 和 then 的关系？

// resolve 和 reject 将 promise 从 未决议（pendding） 状态变为 已决议（Fulfilled & Rejected） 状态；
// 当 promise 已决议，则执行 then 回调；当 promise 状态为 Rejected ，则执行 catch；
// 已决议状态才会执行 finally，但是获取不到任何的结果或者错误信息。

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
