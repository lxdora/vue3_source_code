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
[测试effect嵌套的执行结果](./reactive9.js)
根据上面代码的运行结果，目前实现的响应式系统是不支持effect嵌套的。问题出在下面这块代码
@import "./reactive9.js" {code_block=true line_begin=65 line_end=76}
> 我们用全局变量 activeEffect 来存储通过 registerEffect 函数注册的 副作用函数，这意味着同一时刻 activeEffect 所存储的副作用函数 只能有一个。当副作用函数发生嵌套时，内层副作用函数的执行会覆 盖 activeEffect 的值，并且永远不会恢复到原来的值。这时如果再 有响应式数据进行依赖收集，即使这个响应式数据是在外层副作用函 数中读取的，它们收集到的副作用函数也都会是内层副作用函数，这 就是问题所在。为了解决这个问题，我们需要一个副作用函数栈 effectStack， 在副作用函数执行时，将当前副作用函数压入栈中，待副作用函数执 行完毕后将其从栈中弹出，并始终让 activeEffect 指向栈顶的副作 用函数。这样就能做到一个响应式数据只会收集直接读取其值的副作 用函数，而不会出现互相影响的情况，
[解决effect嵌套存在的问题](./reactive10.js)
## 避免无限递归
@import "./reactive11.js" {code_block=true line_begin=80 line_end=84}
如上所示，如果在副作用函数中使用了使用了自增操作，那么就会陷入死循环从而导致内存溢出。proxyObj.foo++相当于proxyObj.foo = proxyObj.foo+1,首先读取 foo 的值，这会触发 track 操作，将当前副作用函数收集到“桶”中，接着将其加 1 后再赋值给 foo，此时会 触发 trigger 操作，即把“桶”中的副作用函数取出并执行。但问题是该副作用函数正在执行中，还没有执行完毕，就要开始下一次的执 行。这样会导致无限递归地调用自己，于是就产生了栈溢出。
这个问题的关键在于读取和设置的操作是在同一个副作用函数中执行的，此时无论是 track 时收集的副作用函数，还是 trigger 时要触发执行的副作用函数，都是 activeEffect。解决方法就是在trigger执行时增加条件，如果正在执行的副作用函数等于activeEffect,则不执行
## 调度
可调度，指的是当 trigger 动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式
[通过调度器指定副作用函数执行时机](./reactive13.js)
不仅可以通过调度器修改执行时机，还可以限制执行的次数。
[通过调度器限制副作用函数的执行次数](./reactive14.js)

## 计算属性
[懒执行的副作用函数](./reactive15.js)
上面的代码实现了懒执行的副作用函数，但是还无法对值进行缓存，就是说即使只没有发生变化，多次访问computed的值仍然会导致副作用函数执行多次。
[缓存数据](./reactive16.js)
设置一个标志dirty，如果为true表示需要重新计算，否则就将缓存数据返回，计算后将dirty置为false，当getter中的数据发生变化时，调用调度器函数将dirty置为true
[在effect中使用计算属性的值的缺陷](./reactive17.js)
在effect中使用计算属性的值，本质上属于effect嵌套，内部的响应式数据的变化并不会触发外部effect的再次执行，解决的方法是当读取计算属性的值时，手动调用track函数进行追踪，当计算属性的响应式依赖发生变化时，手动调用trigger函数更新。
[在effect中使用计算属性的值](./reactive18.js)
## watch的实现
watch的实现本质上就是利用了effect以及options.scheduler选项
```js
effect(()=>{
  console.log(obj.foo)
}, {
  scheduler(){
    //当obj.foo的值变化时，就会执行scheduler函数
  }
})
```
[最基础的watch的实现](./reactive19.js)
上面这个代码实现了最基础的watch，但是硬编码了对source.foo的读取操作，为了让watch函数具有通用性，需要封装一个通用的读取操作。
[可以监听任意对象](./reactive20.js)
watch除了可以监听响应式对象，还可以接受一个getter函数；
```js
watch(()=>obj.foo, cb)
```
如上，传递给watch的第一个参数不是一个响应式数据，而是一个getter函数，在getter函数内部，用户可以指定该watch依赖哪些响应式数据，
只有在这些数据变化时才会触发回调函数的执行。
[watch监听getter函数](./reactive21.js)
目前的实现的watch还有一个缺陷，就是在回调函数中拿不到旧值和新值，这个问题可以通过开启lazy选项，使用懒执行的副作用函数解决
[watch回调函数拿到旧值和新值](./reactive22.js)
这个代码中，最核心的改动是使用 lazy 选项创建了一个懒执行的 effect。
@import "./reactive22.js" {code_block=true line_begin=140 line_end=154}
手动执行effect函数返回的值就是旧值，即第一次执行得到的值，当发生变化并触发scheduler调度函数执行时，会重新调用effect函数并得到新值。这样就拿到了旧值与新值，接着将他们作为参数传递给回调函数就行。需要注意更新旧值。
## 立即执行的watch与回调时机
watch的本质是对effect的二次封装，watch还有两个特性：
1.立即执行的回调函数
2.回调函数的执行时机
```js
watch(obj, ()=>{
  console.log('obj变化了')
})
```
[watch立即执行的回调函数](./reactive23.js)
除了通过immadiate参数来指定回调函数为立即执行之外，还可以通过其他参数来指定回调函数的执行时机。Vue3中使用flush来指定
```js
watch(obj, (newv, oldv)=>{
  console.log({newv, oldv})
}, {
  immediate: true,
  flush: 'pre'  //还可以指定为'post'|'sync'
})
```
flush本质是指定回调函数的执行时机。当 flush 的值为 'post' 时，代表调度函数需要将副作用函数放到一 个微任务队列中，并等待 DOM 更新结束后再执行，



