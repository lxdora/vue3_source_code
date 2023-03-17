视图层框架分为命令式(jQuery等)和声明式(Vue,React等)。
命令式在编写绝对规范的情况下(实际不可能)性能更强，声明式则可维护性更好。
# 框架类型
设计一个框架时，有三种选择：纯运行时的、运行时 + 编译时的或纯编译时的

## 纯运行时 
```js
  const obj = {
    tag: 'div',
    children: [
      {
        tag: 'span',
        children: 'hello world'
      }
    ]
  }
  function render(obj, root){
    const el = document.createElement(obj.tag);
    if(typeof obj.children === 'string'){
      const text = document.createTextNode(obj.children);
      el.append(text)
    }else if(obj.children){
      obj.chldren.forEach(child=>render(child, el))
    }
    root.appemdChild(el);
  }
  render(obj, document.getElementById('app'));
```
直接为渲染函数提供一个树形结构的数据对象，没有额外的操作，就可以渲染出内容。这就是一个纯运行时框架。
## 编译时+运行时 （如Vue,React）
纯运行时框架需要给它提供一个树形结构的数据，而页面比较复杂的话，这个数据手动构建就会非常麻烦，因此引入编译器，将html代码编译成树形结构的数据

```js
const html = `
  <div> <span>hello world </span> </div>
`
function compiler = (htmlStr) => {
  return obj
}
const obj = compiler(html);
render(obj)
```
编译时+运行时的框架，也可以直接提供树形结构的数据，使用纯运行时，也可以先进行编译，将编译后的数据交给运行时处理
## 纯编译时 （如Svelet）
从上面可以看出，编译器可以将html代码编译成树结构的数据，那么能不能直接编译成命令式的代码呢？这样就只需要一个compiler函数，不需要render函数了。这就是一个纯编译时的框架。
