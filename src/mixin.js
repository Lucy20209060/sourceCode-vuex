export default function (Vue) {
  // 取大版本号 一般Vue的版本号是 x.x.x形式的 这样就可以取到第一位的大版本号
  const version = Number(Vue.version.split('.')[0])

  // 如果大版本号大于等于2 那就表示Vue拥有了 mixin 方法
  // 这样就可以调用它 将 vuexInit 添加到 beforeCreate 钩子函数中
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    // 如果是旧版本 则没有 mixin 要使用 _init 方法来调用
    // 先把Vue.prototype._init方法 在options中添加属性内容 vuexInit
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      // 如果 options.init 之前有参数 那就将参数拼接起来
      // 如果没有参数 那就将其当今参数传入
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      // 然后执行原来的 Vue.prototype._init方法 我们可以看出
      // 这次的扩充函数其实主要就是添加了参数设置 在执行步骤上没有任何改变 
      _init.call(this, options)
    }
  }

  /**
   * 内部函数 就是使 store 在vue上 mixin的方法
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    // 先保存系统变量 存为常量 防止误修改
    const options = this.$options
    // store injection
    // 如果系统参数中存在 store 那就检查其是否为 store 对象的实例
    // 如果是的话那就将其挂载在 this.$store上
    // 如果不是 那就实例一个 store 对象并挂载在 this.$store 上
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 如果当前参数没有 store 对象 但是有 parent 对象 那就说明它依赖于其父组件
      // 那么将它的父组件的 store 挂载在 this.$store上
      this.$store = options.parent.$store
    }
  }
}
