
// MyOwnPromise 
class MyOwnPromise {
  // 定义 Promise 的三个状态
  static PENDDING = '待定';
  static FULFILLED = '已完成';
  static REJECTED = '已拒绝';

  // 用于创建和初始化class创建的对象的特殊方法。
  // 即使用 new 关键词初始化一个实例时，会执行 constructor 方法。
  constructor(func) {
    this.status = MyOwnPromise.PENDDING;
    this.result = null;
    // 解决绑定多个回调的问题，并且多个绑定会按队列的顺序执行（即 先进先出）
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];

    // 直接将非函数作为参数，不使用 catch 去接收错误仍然会直接报错，故参数类型判断不因放在 try catch 逻辑中。
    if (!this.isFunction(func)) {
      // func 不能如实打印出来，模版字符串使用了 toString 方法.
      throw new Error(`${func} is not a function`);
    }

    try {
      func(this.resolve, this.reject);
    } catch (err) {
      this.result = err;
      this.reject(err);
    }
  }

  // 参数校验
  isFunction = (fn) => {
    // 用来判断 function 类型是可以的，其他比如 object 则不可以，例如 {} 和 [] 使用 typeof 都会输出 object。
    // return typeof fn === 'function';
    // return fn.toString() === '[object Function]';
    // 防止 toString 方法被复写了，最好直接调用原型上的方法再绑定 this。
    return Object.prototype.toString.call(fn) === '[object Function]';
  }

  resolve = (res) => {
    // 回调是在状态改变之后马上执行，而不是异步。故异步的处理应该在状态改变之前
    setTimeout(() => {
      if (this.status === MyOwnPromise.PENDDING) {
        this.status = MyOwnPromise.FULFILLED;
        this.result = res;

        // 顺序调用绑定的回调
        this.resolveCallbacks.forEach(callback => {
          callback(res);
        });
      }
    });
  }

  reject = (err) => {
    setTimeout(() => {
      if (this.status === MyOwnPromise.PENDDING) {
        this.status = MyOwnPromise.REJECTED;
        this.result = err;

        this.rejectCallbacks.forEach(callback => {
          callback(err);
        });
      }
    });
  }

  // Promise 的异步在于，then 方法中，只有达到某种条件（比如状态的改变），才会异步执行回调函数
  then(onFulfilled, onRejected) {
    // console.log('this.status', this.status);
    // 支持链式调用
    return new MyOwnPromise((resolve, reject) => {
      // 参数类型判断转换
      // onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : () => {};
      // onRejected = typeof onRejected === 'function' ? onRejected : () => {};
      onFulfilled = this.isFunction(onFulfilled) ? onFulfilled : () => {};
      onRejected = this.isFunction(onRejected) ? onRejected : () => {};

      // 问题：异步是在状态判断之前还是之后呀？？？

      // setTimeout(() => {
        // 在 then 方法里面还是存在 pendding 的状态
        // 问题：为啥 then 方法里面存在 pendding 状态呀？
        if (this.status === MyOwnPromise.PENDDING) {
          // 存储起来，等待状态改变即顺序调用
          this.resolveCallbacks.push(onFulfilled);
          this.rejectCallbacks.push(onRejected);
        }

        if (this.status === MyOwnPromise.FULFILLED) {
          // 实现异步，使用 setTimeout
          // 问题：return 在 resolve 和 reject 之前就执行了，故不能实现链式调用，那咋办？？？
          // setTimeout(() => {
            const result = onFulfilled(this.result);
            // console.log('result', result);
            resolve(result);
          // }); 
        }

        if (this.status === MyOwnPromise.REJECTED) {
          try {
            // setTimeout(() => {
              onRejected(this.result);
            // });
          } catch (err) {
            reject(err);
          }
        }
      // });
    });
  }

  catch(onRejected) {
    return new MyOwnPromise((resolve, reject) => {
      if (this.status === MyOwnPromise.REJECTED) {
        try {
          setTimeout(() => {
            onRejected(this.result);
          });
        } catch (err) {
          reject(err);
        }
      }
      resolve();
    });
  }

  finally(onSettled) {
    if (this.status !== MyOwnPromise.PENDDING) {
      onSettled();
    }
  }
}

const p = new MyOwnPromise((resolve, reject) => {
  resolve(41);
  // reject(42);
});

// const p = new MyOwnPromise({});

p.then(res => {
  console.log('res', res);
});

p.then(res => {
  console.log('res1', res);
  return res + 1;
}).then(res => {
  console.log('res2', res);
});

// p.catch(err => {
//   console.log('err', err);
//   throw new Error('第二个catch');
// }).catch(err => {
//   console.log('err', err);
// });

// p.catch(err => {
//   console.log('err', err);
// }).then(res => {
//   console.log('res', res);
// });

// p.finally(() => {
//   console.log('finally');
// });

