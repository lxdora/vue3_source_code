# Vue3的设计思路
Vue支持使用模板和JavaScript对象描述UI，而使用JavaScript对象描述UI的方式就是所谓的虚拟DOM。h 函数的返回值就是一个对象，其作用是让我们编写虚拟 DOM 变得更加轻松。
## 渲染器
渲染器能够将虚拟DOM渲染为真实DOM