//提供副作用函数的注册机制
//使用一个bucket来存储副作用函数
const bucket = new WeakMap();
const obj = {
  name: 'lx',
  age: 20
}
const track = (target, key) => {
  if(!activeEffect) return;
  //副作用函数添加到bucket中
  let depsMap = bucket.get(target);
  if(!depsMap){
    bucket.set(target, (depsMap=new Map()))
  }
  let deps = depsMap.get(key);
  if(!deps){
    depsMap.set(key, (deps=new Set()))
  }
  deps.add(activeEffect)
}
const trigger = (target,key) => {
  //从bucket中取出副作用函数执行
  const depsMap = bucket.get(target);
  if(depsMap){
    const deps = depsMap.get(key);
    if(!deps) return;
    deps&&deps.forEach(fn=>fn())
  }
}
//对对象进行代理
const proxyObj = new Proxy(obj, {
  get(target, key){
    track(target, key);
    return target[key]
  },
  set(target, key, value){
    target[key] = value;
    trigger(target, key);
    return true;
  }
})
let activeEffect;
//副作用函数注册器
function registerEffect (fn){
  activeEffect = fn;
  fn();
}
function myEffect(){
  console.log(proxyObj.name);
}
registerEffect(myEffect)  //输出lx
proxyObj.name = 'dora';  //修改后输出dora
proxyObj.gender = 0;  //也输出了dora， 这不是我们期望的
