// 状态：pendding fulfilled rejected
class MyPromise {
  // 第三步：一个 promise 实例存在三种状态
  static PENDDING = '待定';
  static FULFILLED = '完成';
  static REJECTED = '拒绝';

  // new 构造函数时，constructor 函数会被执行
  // 第一步：创建实例时传进来的函数参数会被立即执行
  constructor(func) {
    this.status = MyPromise.PENDDING;
    this.result = null;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
    try {
      // 第二步：该函数参数又接收两个函数参数
      // func(this.resolve.bind(this), this.reject.bind(this));
      func(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  // 在 resolve 和 reject 中才修改状态
  resolve = result => {
    // 此处获取不到 this 有两种方式可处理：
    // 1、改函数修改为箭头函数；
    // 2、在调用该函数处绑定this；
    // 原因是什么？
    // 该函数实际上是在外层被调用？而并非 contrusctor 内？
    setTimeout(() => {
      console.log('第四步');
      if (this.status === MyPromise.PENDDING) {
        this.status = MyPromise.FULFILLED;
        this.result = result;
        this.resolveCallbacks.forEach(callback => {
          callback(result);
        });
      }
    });
  }

  reject = result => {
    setTimeout(() => {
      console.log('第四步');
      if (this.status === MyPromise.PENDDING) {
        this.status = MyPromise.REJECTED;
        this.result = result;
        this.rejectCallbacks.forEach(callback => {
          callback(result);
        });
      }
    });
  }

  then(onFULFILLED, onREJECTED) {
  // 坑：需要判断参数是否为函数，但是使用默认值的方式，无法兼顾到非 function 类型的传参（包括 null， 不包括 undefined）这个场景
  // then(onFULFILLED = () => {}, onREJECTED) {

    return new MyPromise((resolve, reject) => {
      // 对参数重新判断赋值
      onFULFILLED = typeof onFULFILLED === 'function' ? onFULFILLED : () => {};
      onREJECTED = typeof onREJECTED === 'function' ? onREJECTED : () => {};

      // then 里面也是会存在待定状态的
      if (this.status === MyPromise.PENDDING) {
        this.resolveCallbacks.push(onFULFILLED);
        this.rejectCallbacks.push(onREJECTED);
      }

      // resolve 和 reject 执行完了之后才执行 then，因为 then 里面处理结果状态
      if (this.status === MyPromise.FULFILLED) {
        // 状态符合之后再执行异步
        setTimeout(() => {
          resolve(onFULFILLED(this.result));
        });
      }

      if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          reject(onREJECTED(this.result));
        });
      }
    });
  }
}

console.log('第一步');

const myPromise = new MyPromise((resolve, reject) => {
  console.log('第二步');
  // 构造函数需要给实例的该函数绑定 this 实例
  // setTimeout(() => {
    resolve('这次一定');
    // console.log('第四步');
  // });
  // 坑：防止此处直接错误，需要在 constructor 中捕获错误
  // throw new Error('白嫖不成功');
});

myPromise.then(
  res => console.log('res', res),
  // null,
  // undefined,
  err => console.log('err', err)
).then(
  res => console.log('第二个 then 的 res', res),
  // null,
  // undefined,
  err => console.log('第二个 then 的 err', err)
);

console.log('第三步');
