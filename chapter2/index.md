# 框架设计的核心要素
## 框架要提供友好的警告信息
## 需要控制体积。
   控制代码体积的方法：比如在Vue中，警告信息会放到一个if判断中，
  ```js
    if(__DEV__){
      warn('you meet some warning')
    }
  ```
   Vue使用rollup进行构建，这个__DEV__就是在rollup中定义的，在开发环境为true，而在生产环境为false。这样就能实现在开发环境提供友好的警告信息，而在生产环境去除这些代码，减小产物的体积。

## 要做到良好的Tree-Shaking
   Tree-Shaking 指的就是消除那些永远不会被执行的代码，也就是排除 dead code，现在无论是 rollup.js 还是 webpack，都支持Tree-Shaking。想要实现 Tree-Shaking，必须满足一个条件，即模块必须是ESM(ES Module)，因为 Tree-Shaking 依赖 ESM 的静态结构。
   rollup或者webpack，它们怎么知道哪些代码可以删除，哪些不能删除呢？
   > Tree-Shaking 中的第二个关键点——副作用。如果一个 函数调用会产生副作用，那么就不能将其移除。什么是副作用?简单 地说，副作用就是，当调用函数的时候会对外部产生影响，例如修改 了全局变量。这时你可能会说，上面的代码明显是读取对象的值，怎 么会产生副作用呢?其实是有可能的，试想一下，如果 obj 对象是一 个通过 Proxy 创建的代理对象，那么当我们读取对象属性时，就会触 发代理对象的 get 夹子(trap)，在 get 夹子中是可能产生副作用 的，例如我们在 get 夹子中修改了某个全局变量。而到底会不会产生 副作用，只有代码真正运行的时候才能知道，JavaScript 本身是动态语 言，因此想要静态地分析哪些代码是 dead code 很有难度
  
  因为单纯静态分析无法识别所有的dead code，因此我们可以使用注释代码`/*#__PURE__*/`, 凡是有该代码的地方，rollup或webpack就知道，这些代码可以通过Tree-Shaking删除。这个注释代码可以用在任何语句上。
## 框架应该输出怎样的构建产物
Vue为开发环境提供了vue.global.js, 为生产环境提供了vue.global.prod.js,除了根据环境提供不同的产物，还可以根据场景用途提供对应的产物。例如如果想直接通过script标签引入框架，就需要提供IIFE（Immediately Invoked Function Expression，立即调用的函数表达式）格式的资源。
```js
(function(){
  ...
}())
```
在rollup或webpack中，可以通过配置`format: 'iife'`来生成这种格式的资源
```js
const config = {
  output: {
    format: 'iife',
    file: 'output.js'
  }
}
```
目前，主流浏览器基本都已支持直接引入ESM格式的资源，所以也可以直接生成ESM格式的资源。
```js
const config = {
  output: {
    format: 'esm',
    file: 'output.js'
  }
}
```
引入时：
```js
<script type="module" src="vue.esm-browser.js"></script>
```
注意到资源中有一个-browser,vue还会生成一个vue.esm-bundler.js,他们有什么区别呢？查看vue源码中package.js可以看到
```js
  "main": "index.js",
  "module": "dist/vue.runtime.esm-bundler.js",
```
对于rollup和webpack，在寻找资源时， 如果 package.json 中存在 module 字段，那么会优先使用 module 字 段指向的资源来代替 main 字段指向的资源。因此，带-bundler的是给rollup和webpack使用的，而带-browser的是给浏览器直接引入的。
那么他们之间用什么区别呢？
>当构建用于script标签的 ESM 资源时，如果是用于开发环境，那么   \_\_DEV\_\_ 会设置为 true;如果是用于生产环境，那么 \_\_DEV\_\_ 常量 会设置为 false，从而被 Tree-Shaking 移除。但是当我们构建提供给 打包工具的 ESM 格式的资源时，不能直接把 \_\_DEV\_\_ 设置为 true或false，而要使用(process.env.NODE_ENV !== 'production') 替换 \_\_DEV__ 常量。
```js
//对于提供给script标签的esm产物
if(__DEV__){  //如果是开发环境，则为true，生产环境则为false
  warn('you meet some warning')
}
//对于提供给roll或webpack使用的esm产物
if((process.env.NODE_ENV!=='production')){
  warn('you meet some warning')
}
```
除了上面的场景，还希望在Node环境中能够通过require直接引入vue
```js 
const vue = require('vue')
```
为什么需要这种需求呢？是用在服务端渲染时
> 当进行服务端渲 染时，Vue.js 的代码是在 Node.js 环境中运行的，而非浏览器环境。在 Node.js 环境中，资源的模块格式应该是 CommonJS，简称 cjs。
```js
const config = {
  output: {
    format: 'cjs',
    file: 'output.js'
  }
}
```
## 特性开关
设计框架时，我们可以提供A，B，C三个特性，同时提供a,b,c三个开关，根据开关状态判断是否启用某个特性，如果

