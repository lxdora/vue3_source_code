/**
 * 目前我们实现的响应式系统是不支持effect嵌套的，测试一下
 */
const bucket = new WeakMap();
const obj = {
  flag: true,
  text: 'a'
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
  //deps就是当前副作用函数的依赖集合
  deps.add(activeEffect)
  //收集依赖
  activeEffect.deps.push(deps);
}
const trigger = (target,key) => {
  //从bucket中取出副作用函数执行
  const depsMap = bucket.get(target);
  if(depsMap){
    const deps = depsMap.get(key);
    const effectsToRun = new Set(deps);
    effectsToRun&&effectsToRun.forEach(fn=>fn())
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

/**
 * @params effect :副作用函数
 * 接收副作用函数作为参数，遍历副作用函数的effect.deps数组，数组的每一项
 * 都是一个依赖集合，然后就该副作用函数从依赖集合中删除，最后重置
 * deps数组
*/

function cleanup (effect) {
  for(let i=0;i<effect.deps.length;i++){
    //deps是副作用函数的依赖集合
    const deps = effect.deps[i]
    //将副作用函数从依赖集合中删除
    deps.delete(effect);
  }
  //清空副作用函数的deps属性
  effect.deps.length = 0;
}
//副作用函数注册器,重新设计副作用函数注册器
function registerEffect (fn){
  const effect = () => {
    activeEffect = effect;
    //副作用函数执行前，清空依赖
    cleanup(effect);
    fn();
  }
  //存储副作用函数的依赖集合
  effect.deps=[];
  effect();
}
function myEffect(){
  console.log('执行了');
  proxyObj.flag?document.body.innerHTML=proxyObj.text:document.body.innerHTML='not'
}
registerEffect(myEffect)  //innerHtml为a
proxyObj.flag = false;  //innnerHtml为not
proxyObj.text = 'b'  //这次没有再执行了