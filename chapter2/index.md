# 框架设计的核心要素
## 框架要提供友好的警告信息
## 需要控制体积。
   控制代码体积的方法：比如在Vue中，警告信息会放到一个if判断中，
  ```js
    if(__dev__){
      warn('you meet some warning')
    }
  ```
   Vue使用rollup进行构建，这个__dev__就是在rollup中定义的，在开发环境为true，而在生产环境为false。这样就能实现在开发环境提供友好的警告信息，而在生产环境去除这些代码，减小产物的体积。

## 要做到良好的Tree-Shaking
   Tree-Shaking 指的就是消除那些永远不会被执行的代码，也就是排除 dead code，现在无论是 rollup.js 还是 webpack，都支持Tree-Shaking。想要实现 Tree-Shaking，必须满足一个条件，即模块必须是ESM(ES Module)，因为 Tree-Shaking 依赖 ESM 的静态结构。
   rollup或者webpack，它们怎么知道
