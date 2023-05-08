[toc]
# 响应系统的作用与实现
## 响应式数据与副作用函数
副作用函数指的是会产生副作用的函数
```js
let a = 0;
function effect () {
  a = 1
}
function print(){
  console.log(a)
}
print()  //0
effect()
print()  //1
```
从以上代码可以看到，effect函数的执行修改了变量a，而print函数中读取了变量a，且两次读取的结果不一样，也就是说effect函数的执行直接或间接地影响了print函数的执行，这时我们就说effect函数产生了副作用。

那么什么是响应式数据呢？
```js
const obj = {
  name: 'lx'
}
function effect() {
  console.log(obj.name)
}
```
如上代码所示，effect函数读取了obj.name，当obj.name变化时，我们希望effect函数自动重新执行，如果能实现这一点，obj对象就是响应式数据。
通过观察可以发现：
1.当副作用函数执行时，会触发字段obj.name的读取操作
2.当修改obj.name的值时，会触发obj.name字段的设置操作
那么如果能拦截属性的读取和设置操作，当读取时存储副作用函数，当设置时就执行存储的副作用函数，实现响应式就成为了可能。
关键在于如何拦截属性的读取和设置操作，es2015之前使用Object.defineProperty,之后则使用Proxy
[一个能够实现最简单的响应式的例子](reactive1.js)
上面这个代码能够实现响应式，但是有很明显的缺陷，就是写死了副作用函数的名称effect，实际中的副作用函数可能是任意一个函数。
[提供了副作用函数的注册机](reactive2.js)
上面这个代码提供了一个副作用函数的注册机，这样我们可以使用任意的副作用函数。但是又发现如果在对象上添加了一个不存在的属性，副作用函数也重新执行了，我们本意是只在修改指定属性的时候执行副作用函数。为了解决这个问题，需要重新设计数据结构，将对象属性和副作用函数绑定起来。
[设计全新的桶结构](reactive3.js)
上面这个代码重新设计了数据桶的结构
![数据结构](./images/bucket%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.svg)

<details> 
    <summary>拓展：Map与WeakMap</summary>
  WeakMap与Map的区别：
  WeakMap 对 key 是弱引用，不影响垃圾回收器的工
  作。据这个特性可知，一旦 key 被垃圾回收器回收，那么对应的键和
  值就访问不到了。所以 WeakMap 经常用于存储那些只有当 key 所引
  用的对象存在时(没有被回收)才有价值的信息，例如上面的场景
  中，如果 target 对象没有任何引用了，说明用户侧不再需要它了，
  这时垃圾回收器会完成回收任务。但如果使用 Map 来代替 WeakMap，
  那么即使用户侧的代码对 target 没有任何引用，这个 target 也不
  会被回收，最终可能导致内存溢出

  Map 对象有以下属性与方法：
  - 属性：
    - `size`：返回 Map 中键值对的数量。
    
  - 方法：
    - `set(key, value)`：向 Map 中添加或更新一个键值对。如果该键已存在，则会更新其对应的值为新的值；如果不存在则会添加新的键值对。
    - `get(key)`：获取指定键对应的值，如果该键不存在则返回 undefined。
    - `has(key)`：判断 Map 中是否包含指定的键，存在返回 true，否则返回 false。
    - `delete(key)`：从 Map 中删除指定键及其对应的值，并返回一个布尔值，表示操作是否成功。
    - `clear()`：清空 Map 中所有的键值对。
    - `entries()`：返回一个 Iterator 对象，用于遍历 Map 中所有的键值对。每个迭代器对象都是形如[key, value]的数组。
    - `forEach(callbackFn[, thisArg])`：遍历 Map 中所有的键值对，对每个键值对调用一次回调函数 callbackFn。可以通过第二个参数 thisArg 指定回调函数中的 this 对象。
    - `keys()`：返回一个 Iterator 对象，用于遍历 Map 中所有的键。
    - `values()`：返回一个 Iterator 对象，用于遍历 Map 中所有的值。

  注意：Map 是 ES6 新增的数据结构，所以在低版本的浏览器和 Node.js 中可能不支持或部分支持。
  WeakMap 对象相比 Map 具有以下区别：
  - WeakMap 中的键必须是对象，而非基本数据类型。
  - 弱引用，即如果某个键不再被其他对象所引用，则垃圾回收机制可能会自动清除该键所对应的值。

  WeakMap 对象具有的属性和方法如下：
  - 属性：WeakMap 没有 size 属性，也没有任何公开的属性。

  - 方法：
    - `set(key, value)`：向 WeakMap 中添加或更新一个键值对。如果该键已存在，则会更新其对应的值为新的值；如果不存在则会添加新的键值对。
    - `get(key)`：获取指定键对应的值，如果该键不存在则返回 undefined。
    - `has(key)`：判断 WeakMap 中是否包含指定的键，存在返回 true，否则返回 false。
    - `delete(key)`：从 WeakMap 中删除指定键及其对应的值，并返回一个布尔值，表示操作是否成功。

  注意：由于 WeakMap 对象中的键必须是对象，因此使用时需要特别注意传递的参数类型。同时，在使用 WeakMap 的过程中因为弱引用的特性，很容易造成内存泄漏或程序运行出错等问题。
</details>

[封装track和trigger函数](reactive4.js)
## 分支切换
分支切换的含义如下：
[分支切换](reactive5.html)
```js
/**
 * 分支切换的含义如下：
 * 当flag为true时，innerHTML跟随text属性值变化，而当flag为false时，这时text属性值变化不应该在触发副作用函数执行了，但是实际上却执行了
 */
function myEffect(){
  console.log('执行了');
  proxyObj.flag?document.body.innerHTML=proxyObj.text:document.body.innerHTML='not'
}
```
第一次执行时，flag为true， 这时候flag和text都会与副作用函数建立联系
@import "./images/属性与副作用函数建立联系.svg"
后面修改text属性的值时，由于text属性依然与副作用函数绑定，因此仍然会执行副作用函数。
解决这个问题的思路是：在副作用函数执行前，先将其从依赖的副作用函数集合中移除，执行完成后，再重新建立联系，新的联系中就不包含遗留的副作用函数
[修改副作用函数注册器，实现在副作用函数执行前删除依赖](reactive7.html)
上面的代码执行后会陷入死循环，原因在trigger执行过程中
@import "./reactive7.html" {code_block=true line_begin=33 line_end=41}
在trigger函数中，遍历了副作用函数并执行，在副作用函数执行之前从依赖集合中删除了副作用函数，但是副作用函数的继续执行触发了track，再次将该副作用函数收集到依赖集合中，导致陷入了死循环。类似于下面这种情况
```js
const set = new Set([1]);
set.forEach(item=>{
  set.delete(1)
  set.add(1)
  console.log('遍历中')
})
```
解决方法也很简单，另外构造一个集合遍历
```js
const set = new Set([1])
const newSet = new Set(set)
newSet.forEach(item=>{
  set.delete(1)
  set.add(1)
  console.log('遍历中')
})
```
[解决死循环问题](reactive8.html)
## effect嵌套
effect应当是支持嵌套的，Vue组件的渲染函数就是在一个effect中执行的，因此当发生组件嵌套时实际上就发生了effect的嵌套
```jsx
class Foo {
  render(){
    return <Bar />
  }
}
class Bar {
  render(){
    return '<div>bar</div>'
  }
}
```
相当于
```js
effect(()=>{
  Foo.render()
  effect(()=>{
    Bar.render()
  })
})
```

