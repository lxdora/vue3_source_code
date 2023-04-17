# Vue3的设计思路
Vue支持使用模板和JavaScript对象描述UI，而使用JavaScript对象描述UI的方式就是所谓的虚拟DOM。h 函数的返回值就是一个对象，其作用是让我们编写虚拟 DOM 变得更加轻松。
## 渲染器
渲染器能够将虚拟DOM渲染为真实DOM
[渲染器](renderer.html)
## 组件的本质
组件就是一组DOM元素的封装，这组DOM元素就是组件要渲染的内容，因此我们可以定义一个函数来代表组件，函数的返回值就代表组件要渲染的内容。
[函数式组件](./functional_component.html)
组件可以是函数，但是并非必须要是函数，对象也可以用来描述组件
[对象式组件]('./object_component.html')
## 模板的工作原理
无论是手写虚拟 DOM(渲染函数)还是使用模板，都属于声明式地描述 UI，并且 Vue.js 同时支持这两种描述 UI 的方式。那么模板是如何工作的呢?
###编译器
编译器和渲染器一样，只是一段程序而已，不过它们的工作内容不同。编译器的作用其实就是将模板编译为渲染函数。
如下模板
```html
<div @click="handler">
  click me
</div>
```
编译器会将上述模板编译为渲染函数
```js
render(){
  return h('div', {onClick: handler}, 'click me')
}
```
对于一个vue文件
```html
<template>
  <div @click="handler">
    click me
  </div>
<template>
<script>
  export default {
    data(){
      return {...}
    },
    methods: {}
  }
</script>
```
编译器会将上述template中的模板编译成渲染函数，然后挂载到script标签的组件对象上
编译后
```js
 export default {
    data(){
      return {...}
    },
    methods: {},
    render(){
      return h('div', {onClick: handler}, 'click me')
    }
  }
```
> 无论是使用模板还是直接手写渲染函数，对于一个组件来说，它要渲染的内容最终都是通过渲染函数产生的，然后再把渲染函数返回的虚拟 DOM 渲染为真实 DOM，这就是模板的工作原理，也是 Vue.js 渲染页面的流程

假定有以下模版：
```html
<div id="foo" :class="cls"></div>
```
我们知道经过编译器后，最终都能生成渲染函数。
```js
render(){
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    }
  }
}
```
在以上代码中，cls是一个变量，它可能会发生变化，渲染器的作用之一就是寻找并且只更新变化的内容，所以当变量 cls 的值发生变化时，渲染器会自行寻找变更点。对于渲染器来说，这个“寻找”的过程需要花费一些力气。
那么从编译器的视角
来看，它能否知道哪些内容会发生变化呢?如果编译器有能力分析动
态内容，并在编译阶段把这些信息提取出来，然后直接交给渲染器，
这样渲染器不就不需要花费大力气去寻找变更点了吗?

拿上面的模板来说，我们一眼就能看出其中 id="foo" 是永远不会变化的，而 :class="cls"是一个 v-bind 绑定，它是可能发生变化的。所以编译器能识别出哪些是静态属性，哪些是动态属性，在生成代码的时候完全可以附带这
些信息。
```js
render(){
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    },
    patchFlag: 1 //假设数字1表示class是动态的
  }
}
```
> 如上面的代码所示，在生成的虚拟 DOM 对象中多出了一个patchFlags 属性，我们假设数字 1 代表“ class 是动态的”，这样渲染器看到这个标志时就知道:“哦，原来只有 class 属性会发生改变。”对于渲染器来说，就相当于省去了寻找变更点的工作量，性能自然就提升了

以上的例子说明编译器和渲染器之间是存在信息交流的，它们互相配合使得性能进一步提升，而它们之间交流的媒介就是虚拟 DOM 对象。在后面的学习中，我们会看到一个虚拟 DOM 对象中会包含多种数据字段，每个字段都代表一定的含义。
