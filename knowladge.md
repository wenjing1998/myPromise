##### 为什么js是单线程的？

javascript 作为浏览器的脚本语言，主要的用途是与用户交互，响应用户操作，操作页面的 dom 元素。如果 js 是多线程的，那会存在很多的同步问题，例如一个线程在操作 dom 的修改，但是另外一个线程在操作删除这个 dom，就会引发到底是哪个操作会生效的问题。

为了提高 js 的响应，可以利用多核 cpu 的计算能力，HMTL5 提出了 Web Worker 的标准，允许 js 创建多个线程，子线程完全受主线程的控制，且不得操作 Dom。所以这个新的标准并没有改变 js 是单线程的本质。

##### js 引擎

- 堆：内存分配发生的地方；
- 栈：函数调用时形成的栈帧；

调用栈：函数执行的时候，会生成新的执行上下文，执行上下文被推入栈中。

##### 异步执行的运行机制（浏览器的事件循环 event loop）

同步任务是指在主线程上排队执行的任务，只有前一个任务执行完成了才执行下一个任务。

异步任务是指不进入主线程，而进入任务队列的任务，只有任务队列通知主线程，某个异步任务可以执行了，该任务才会进入主线程。

（1）所有的同步任务都在主线程上执行，形成一个执行栈（execution context stack）；
（2）WebAPIs 执行异步任务，将回调函数放入任务队列（task queue）；（保存回调事件）
（3）执行栈中的所有同步任务全部执行完毕，就会去读取任务队列；
（4）以上动作不断循环；

##### 异步编程的事件机制和回调函数

##### 异步编程的核心 => 回调

```
// 同步回调函数
function syncCallback(x) {
  return x * 2;
};

// 异步回调函数
function asyncCallback(x) {
  let y = x;
  setTimeout(() => {
    y = x * 2
  });
  return y;
};

// 中间函数（库函数）
// 作用：让主程序能够登记任意的回调函数，比简单直接在主程序中调用回调函数更加灵活
// 这也是回调机制的优点所在
function middle(x, func) {
  return 100 + func(x);
};

// 主函数
function main() {
  const x = 1;

  return middle(x, syncCallback); // 102
  return middle(x, asyncCallback); // 101
};

main();
// 同步回调函数输出：102
// 异步回调函数输出：101
```

回调：函数作为参数，传入另外一个函数，并在其中被调用。

个人理解：其实 Promise 核心代码的实现还是使用回调的思想。

回调函数的执行流程：
1）主函数调用中间函数；
2）中间函数登记回调函数；
3）触发回调函数事件；
4）调用（执行）回调函数；
5）响应回调事件。

回调的类型：
1）阻塞式回调（同步回调）：回调函数的调用一定在主函数返回之前；
2）延迟式回调（异步回调）：回调函数的调用可能在主函数返回之后；

##### node 的 event loop

##### 定时任务

setTimeout(fn, delay);

setTimeout 在等待 delay 时间后，才将 fn 放入任务队列，再等待执行栈执行完所有的同步任务之后，再查看任务队列中是否存在可以执行的事件。

##### 调用栈和任务队列是同时执行的？

```
function main() {
  const start = new Date();
  setTimeout(() => {
    console.log('时间间隔：' + (new Date() - start) + 'ms');
  }, 500);
  while(new Date() - start < 1000) {}
};
main();

// 输出：时间间隔：1000ms
```

##### 任务队列（tast queue）& 微任务队列（microtask queue）

调用栈中所有的宏任务都执行完成之后，会去执行任务队列；
调用栈中一个宏任务执行完成之后，就会去执行微任务队列；

``` shell
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(41);
  }, 1000);
});

p1.then(res => {
  console.log(res);
});

// 输出： 41
// 为啥？？？
```

##### promise 链式调用 & 绑定多个回调函数 的区别

``` shell
const p1 = new Promise((resolve) => {
  resolve(41);
});

p1.then(res => {
  console.log(res); // 41
  return new Promise(resolve => { // 链式调用需要上一个回调返回一个新的 promise
    resolve(res + 1);
  });
}).then(res => { // 下一个回调才能接收到上一个返回的处理数据，否则后面回调的参数为 undefined
  console.log(res); // 42
});

p1.then(res => {
  console.log(res); // 41
});

// 输出顺序是 第63行的41 -> 第71行的41 -> 第68行的42
// 为啥？？？
```

##### 手写 Promise

问题：
  如何实现异步？
  如何实现链式调用？
  状态如何流转，在何处流转？

##### new 操作符的执行过程

1）创建一个新的对象；
2）设置原型，将新对象的原型对象 __proto__ 指向构造函数的 prototype；
3）执行构造函数的 constructor，将构造函数的 this 指向这个新对象；
4）返回值：如果构造函数没有返回对象类型（Function、Date、Error、RegExp、Object、Array），则返回创建的新对象；
class myP {
  construcotr() {
    return { a: 'lala' };
  }
}
const p = new myP();
// p -> myP {}


```
const p = new Promise(() => {});

// 分析：实现 new 关键字的执行过程
// 定义一个方法，参数为 构造函数 & 其余参数

// 知识补充：Object.create(proto) 可以创建一个指定新对象的原型对象的对象。

// constructor: 指定新势力对象类型的类或者函数
// arguments: 被 constructor 调用的参数列表
function newNew(constructor, ...restParameters) {
  <!-- const newObject = {}; -->
  <!-- newObject.__proto__ = constructor.prototype; -->

  // 参数校验
  if (typeof constructor !== 'function') {
    console.error(new Error(`${constructor} is not a constructor`));
    return;
  }

  // 1）创建一个新的对象
  let newObject = null;
  // 2）将新对象的 __propto __ 链接到构造函数的原型对象 prototype;
  newObject = Object.create(constructor.prototype);
  // 3）将新对象作为 this 的上下文（将 this 绑定到新对象上），并执行这个构造函数；
  const result = constructor.apply(newObject, restParameters);
  // 4）返回值：如果构造函数没有返回对象，则返回创建的新对象；
  return result || newObject;
};

const myP = new(class myPromise {}, () => {});
```

##### 手动实现 ajax

``` shell
const url = 'https://xxx.com/';

const xhr = new XMLHttpRequest();
xhr.open("GET", url);
xhr.responseType = 'arraybuffer';
xhr.send();
```

##### 手动实现 call

``` shell
// func.call(newThis, 参数1, 参数2 ...);
// 观察：call 处于 Function.prototype 上；call 函数内部的 this 指向 func，因为是 func 调用的 call；
// 且可能存在多个函数参数；需要立即调用，并返回函数返回值；
// 输出：需要将 func 的 this 指向新的 newThis，若不存在新的 this 则指向 window

// 核心：在新的上下文中调用调用函数，即使用 newContext.func()，而不是直接 func() 即可。
// 剩余参数 rest
Function.prototype.myCall = function(context, ...restParams) {
  // 确定调用者是 函数
  if (typeof this !== 'function') {
    throw new Error(`${this} is not a function`);
    return;
  }

  // 若无 context 则指定 window 作为新的上下文
  context = context || window;

  // 为了不影响新上下文的其他属性，需要使用独一无二的符号值作为新的属性名
  const fn = Symbol();
  context[fn] = this;

  // 调用该函数
  // 扩展运算符
  const result = context[fn](...restParams);

  // 在新的上下文中删除该函数
  delete context[fn];
  
  // 返回函数返回值
  return result;
}
```

##### 原型 & 原型链

啊？！
原型 指的是 __proto__！
原型对象 指的是 prototype！

const promise = new Promise();

实例对象：promise；
构造函数：Promise；

new 关键字所做的处理：
- 将实例对象的原型 __proto__ 链接到构造函数的原型对象 prototype；
- 执行构造函数的 constructor，并将 this 指向实例对象；
- 返回 this；
                    Object.prototype -------------> null
                     ^            ^    __proto__
                    /              \ 
         __proto__ /                \ __proto__
                  /                  \
               原型对象        Function.prototype
             ^       ^ \              ^        
            /         \ \constructor /
 __proto__ /  prototype\ \          / __proto__
          /     new     \ ^        /
    实例对象 <-------------  构造函数
            ------------->
             constructor

##### 继承

**注意：**
  与 new 一个构造函数创造一个实例对象 不同！

**概念：**
  子类继承父类的属性、方法，修改这些属性和方法时不会改变父类的，也可以添加新的属性和方法。

**ES6 继承**

extends 关键字做了两个事情:
- 将子类构造函数的 __proto__ 指向父类构造函数 Parent；
- 将子类构造函数的原型对象的原型 Child.prototype.__proto__ 指向父类构造函数的原型对象 Parent.prototype；

子类使用 super 继承父类的方法。

```shell
class Child extends Parent {
  constructor(props) {
    super(props); // 调用 父对象/父类 的构造函数；该关键字用于访问和调用一个对象的父对象上的函数；
  }
}
```

**设置__proto__的方式**
- 1.new;

- 2.Object.create(proto);（ES5）
  - 创建一个新的对象（构造函数？）；
  - 将这个新对象的原型链接到传入的参数上；
  - 返回这个新对象的实例对象（为啥返回实例呀？）；

``` shell
if (typeof Object.create !== 'function') {
  // Object.create 做了什么
  Object.create = function(proto) {
    function F() {}
    F.__proto__ = proto;
    return new F();
  }
}
```

- 3.Object.setPrototypeOf(object, proto);（ES6）
存在浏览器兼容性：仅适用于 Chrome 和 FireFox，在 IE 中不工作。

设置一个指定对象的原型对象。

``` shell
Object.setPrototypeOf = Object.setPrototypeOf || function(object, proto) {
  object.__proto__ = proto;
  return object;
}
```

**ES5 手动实现继承**

- 1、原型链继承：将子类的原型对象 prototype 链接在父类的实例对象上
  问题：
    - 引用类型的属性值会被所有实例共享；
    - 创建子类型的实例时，不能向超类型的构造函数传递参数。

```shell
Child.prototype = new Parent();
```

- 2、构造函数继承：在子类构造函数的内部调用父类的构造函数
  问题：
    - 函数复用存在问题？

我的问题：Child 和 Parent 必须为 function，但是 Class.call() 会报错呀，报构造函数只能使用 new 关键字调用？

```shell
function Child() {
  Parent.call(this);
}
```

- 3、组合继承（组合 原型链继承 和 构造函数 继承）
  组合：
    - 原型链继承实现了对原型的属性和方法的继承；
    - 构造函数继承实现了对实例的属性的继承；

```
function Parent(name) {
  this.name = name;
}

function Child(name, age) {
  // 属性继承
  Parent.call(this, name);

  this.age = age;
}

// 方法继承
Child.prototype = new Parent();
```

- 4、原型式继承
  问题：（同原型链继承）
    - 引用类型的属性值会被所有实例共享；
    - 无法向父类构造函数传参；

``` shell
Object.create(proto);

function myObjectCreate(proto) {
  function F() {};
  F.__proto__ = proto;
  return new F();
}
```

- 5、寄生式继承
  问题：（同构造函数继承）
    - 无法函数复用？

``` shell
// 使用一个中间函数专门做继承的事情，然后用某些方式增强对象

function createAnother(Parent) {
  const clone = myObjectCreate(Parent);

  clone.sayHi = function() {};

  return clone;
}

const Child = createAnother(Parent);
```

- 6、寄生组合式继承

```shell

```

**深浅拷贝**

``` shell

// 浅拷贝
function shallowCopy(resource) {
  // 基本数据类型深浅拷贝无区别，直接复制

  // 只要是对象类型都可以吧？
  // if (Object.prototype.toString.call(resource).slice(8, -1) !== 'Object' ||
  //   Object.prototype.toString.call(resource).slice(8, -1) !== 'Array' ) {
  if (!resource || typeof resource !== 'object') {
    return;
  }

  const target = Array.isArray(resource) ? [] : {};

  // 对象 和 数组 都可以用 for 循环做处理
  // for 循环适用于数组和对象，比 forEach 更适用
  for (let key in resource) {
    if (Object.hasOwnProperty(key)) {
      target[key] = resource[key];
    }
  }

  // Object.keys(resource).forEach(key => {
  //   if (Object.hasOwnProperty(key)) {
  //     target[key] = resource[key];
  //   }
  // });

  return target;
}

// 深拷贝
// 基础版本
function deepClone(resource) {
  // 基本数据类型直接赋值，引用类型递归调用，直到底部都是基本数据类型

  if (resource === null || typeof resource !== 'object') {
    return resource;
  }

  const target = Array.isArray(resource) ? [] : {};

  for (const key in resource) {
    // if (Object.hasOwnProperty(key)) {
      target[key] = 
        (typeof resource[key] === 'object' && resource[key] !== null)
          ? deepClone(resource[key])
          : resource[key];
    // }
  }

  return target;
}

// 优化后
function newDeepClone(resource, hash = new WeakMap()) {
  // 基本数据类型直接返回
  // null
  if (resource === null || typeof resource !== 'object') {
    // Symbol
    // if (typeof resource === 'symbol') { 
    // }

    // Function
    // if (typeof resource === 'function') {
    // }

    // Number String Boolean Undefined
    return resource;
  }

  // Date
  if (resource instanceof Date) {
    return new Date(resource);
  }

  // Error
  if (resource instanceof Error) {
    return new Error(resource);
  }

  // RegExp
  if (resource instanceof RegExp) {
    return new RegExp(resource);
  }

  // 如果循环引用,就用 weakMap 来解决 (??? 还没有了解过)
  if (hash.has(resource)){
  	return hash.get(resource);
  }

  // 继承属性？？？
  // 获取对象所有自身属性的描述
  const allDesc = Object.getOwnPropertyDescriptors(resource);
  // 遍历传入参数所有键的特性
  const target = Object.create(Object.getPrototypeOf(resource), allDesc);

  hash.set(resource, target);

  // Array Object
  // const target = Array.isArray(resource) ? [] : {};

  for (const key in resource) {
  // Reflect.ownKeys() 方法会返回一个由目标对象自身的属性键组成的数组。
  // for (const key in Reflect.ownKeys(resource))
    target[key] =
      (resource[key] && typeof resource[key] === 'object')
        ? newDeepClone(resource[key], hash)
        : resource[key];
  }

  return target;
}

```

##### Set & Map



##### 防抖 & 节流



##### 网络

###### http 应用层协议

###### tcp udp 传输层协议

tcp 三次握手 四次挥手

- 第一次握手：
  客户端发送网络报，服务端接收到。
  服务端得出结论：客户端的发送能力、服务端的接收能力是正常的。

- 第二次握手：
  服务端发包，客户端接收到。
  客户端得出结论：客户端的发送能力和接收能力、服务端的接收能力和发送能力是正常的。

- 第三次握手：
  客户端再次发包，服务端接收到。
  服务端得出结论：客户端的接收能力、服务端的发送能力是正常的。

三次握手之后，客户端和服务端都能确认双方的发送和接收能力都是正常的，即可以进行正常的通信了。（建立连接）
另外一个目的：利用数据包的选项来传输特殊的信息，交换初始的序列号。（协商序列号？）



















