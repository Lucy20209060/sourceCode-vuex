Vuex是一个专为Vue服务 用于管理页面数据状态 提供统一数据操作的生态系统
它集中与MVC模式中的Model层 规定所有的数据必须通过action-mutation-state change的流程来进行
再结合Vue的数据视图双向绑定特性来实现页面的展示更新
统一的页面状态管理以及操作处理 可以让复杂的组件交互变得简单清晰 
同时可在调试模式下进行时光机般的倒退前进操作 查看数据改变过程 使code debug更加方便

针对性的抛出几个问题

1.使用Vuex只需执行Vue.use(Vuex) 并在Vue的配置中传入一个store对象的实例 store是如何实现注入的？

2.state内部是如何实现支持模块配置和模块嵌套？

3.在执行dispatch触发action（commit同理）的时候 只需传入（type,payload）,action执行函数中的第一个参数store从哪里获取的？

4.如何区分state是外部直接修改 还是通过mutation方法修改的？

5.调试时的“时空穿梭”功能是如何实现的？
