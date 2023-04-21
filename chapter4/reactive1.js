//使用一个bucket来存储副作用函数
const bucket = new Set();
const obj = {
  name: 'lx',
  age: 20
}
//对对象进行代理
const proxyObj = new Proxy(obj, {
  get(target, key){
    //副作用函数添加到bucket中
    bucket.add(effect)
    return target[key]
  },
  set(target, key, value){
    target[key] = value;
    //从bucket中取出副作用函数执行
    bucket.forEach(fn=>fn());
    return true;
  }
})
//副作用函数中使用代理后的对象
function effect () {
  console.log(proxyObj.name)
}
effect()  //输出lx
proxyObj.name = 'dora';  //修改后输出dora
