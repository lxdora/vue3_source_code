/**
 * 调度器，限制执行次数
 */
const bucket = new WeakMap();
const obj = {
  foo: 1,
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
    const effectsToRun = new Set();
    deps.forEach(item=>{
      if(activeEffect!==item){
        effectsToRun.add(item)
      }
    })
    effectsToRun&&effectsToRun.forEach(fn=>{
      if(fn.options.scheduler){
        fn.options.scheduler(fn)
      }else{
        fn();
      }
    })
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
const effectStack = [];
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
function registerEffect (fn, options={}){
  const effect = (() => {
    //副作用函数执行前，清空依赖
    cleanup(effect);
    activeEffect = effect;
    effectStack.push(effect);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length-1];
  })
  //存储副作用函数的依赖集合
  effect.deps=[];
  effect();
  effect.options = options;
}
function effectFn1(){
  console.log(proxyObj.foo);  //打印1
}
/**
 * 根据上面的函数，数据与副作用函数见得依赖关系如下
 * data
 *   ----foo
 *      --effectFn1
 *   ----bar
 *      --effectFn2
 */
// registerEffect(effectFn1) //依次打印effectFn1执行了和effectFn2执行了
const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;
function flushJob(){
  if(isFlushing) return;
  isFlushing = true;
  p.then(()=>{
    jobQueue.forEach(fn=>fn())
  }).finally(()=>{
    isFlushing = false;
  })
}
registerEffect(effectFn1, {
  scheduler(fn){
    jobQueue.add(fn);
    flushJob();
  }
})
proxyObj.foo++  //打印2
proxyObj.foo++  //打印3
