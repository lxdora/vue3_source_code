/**
 * 在副作用函数中使用computed的值
 */
const bucket = new WeakMap();
const obj = {
  foo: 1,
  bar: 2
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
    if(!deps) return;
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
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length-1];
    return res
  })
  //存储副作用函数的依赖集合
  effect.deps=[];
  if(!options.lazy){
    effect();
  }
  effect.options = options;
  return effect;
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

function traverse(value, seen=new Set()){
  //如果读取的数据是原始值或已经被读取过了，什么也不做
  if(typeof value !== 'object' || value===null || seen.has(value)) return;
  //将value加入到已读取过的数组，防止循环引用引起死循环
  seen.add(value);
  //先不考虑value为数组等结构的情况，假设value是一个对象，使用for...in读取对象的每一个值，并调用traverse
  //递归每一个值
  for(let key in value) {
    traverse(value[key], seen);
  }
  return value;
}
function watch(source, cb, options){
  let getter;
  //如果source是函数，说明传入的是getter
  if(typeof source === 'function'){
    getter = source
  }else{
    //递归地读取
    getter = () => traverse(source)
  }
  //定义旧值和新值
  let oldValue, newValue;
  //cleanup用来存储用户注册的过期回调
  let cleanup;
  //定义onInvalidate函数
  function onInvalidate(fn){
    //将过期回调存储到cleanup中
    cleanup = fn;
  }
  function job(){
    //返回effect函数
    newValue = effect();
    //执行回调之前，先调用过期回调
    if(cleanup){
      cleanup();
    }
    //将旧值和新值作为回调函数的参数
    cb(newValue, oldValue, onInvalidate);
    oldValue = newValue;
  }
  //注册副作用函数时，开启lazy选项,并把返回值存储到effect中以便后续调用
  const effect = registerEffect(getter, {
    scheduler(){
      //如果flush为post，就将其放到微任务队列中执行
      if(options.flush==='post'){
        const p = Promise.resolve();
        p.then(job)
      }else{
        job();
      }
    },
    lazy: true,
  })
  if(options.immediate){
    job()
  }else{
    oldValue = effect();
  }
}

watch(()=>proxyObj.foo, (newv, oldv)=>{
  console.log({newv, oldv});
},{
  immediate: true,
  flush: 'post'
})

proxyObj.foo = 2  //修改时watch的回调函数执行了
proxyObj.foo = 3 //修改时watch的回调函数执行了