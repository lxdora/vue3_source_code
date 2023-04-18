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