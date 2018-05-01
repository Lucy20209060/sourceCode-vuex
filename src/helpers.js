/**
 * Reduce the code which written in Vue.js for getting the state.
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} states # Object's item can be a function which accept state and getters for param, you can do something for state and getters in it.
 * @param {Object}
 */

/**
 * mapState通过扩展运算符将store.state.orderList 映射this.orderList
 * 同理，mapActions, mapMutations都是一样的道理
 */

export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  // 把要取的内容序列化成指定的格式 然后遍历执行回调 并赋值给res[key]
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      // 如果是存在命名空间 那就表示使用了模块 在模块内找内容 否则在全局$store中查找内容
      if (namespace) {
        /**
         * 根据模块名称在顶层的$store中找到模块的内容
         * 如果不存在就直接返回
         * 如果存在取出模块的state getters存储在变量state getters中
         */
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      // 如果要取得的是getters中的内容 那就表示它调用的是一个函数 直接函数并返回结果 
      // 否则就是取state中的内容 直接返回内容
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // 标记在devtools中的vuex key 将其flag调用为true
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  // 返回res的内容 因为res是引用类型 虽然申明的时候使用了const 但是还是可以为其添加内容的 毕竟我们没有改它的对象地址
  return res
})

/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept anthor params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  // 序列化好参数 将其转化为指定格式 然后 forEach 遍历
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      // 从根目录的$store上拿到commit存储到commit上
      let commit = this.$store.commit
      // 处理命名空间的情况 如果存在命名空间 则调用参数
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        commit = module.context.commit
      }
      // 如果传入的val是一个函数 那么执行这个函数 并返回结果
      // 否则就执行commit
      // 这里使用的是apply是因为apply最合适处理传入不确定数量的参数的情况
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 */
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  // 序列化好参数 将其转化为指定格式 然后 forEach 遍历
  normalizeMap(getters).forEach(({ key, val }) => {
    // thie namespace has been mutate by normalizeNamespace
    // 如果命名空间存在 那么会自动加上 如果没有 会加上 '' 这样其实没有改变
    val = namespace + val
    res[key] = function mappedGetter () {
      // 如果命名空间存在 但是没有找到 这个时候就直接返回一个undefined
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      // 如果不是线上环境 且val并不在$store的列表中 那么就报错
      if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      // 错误情况全部排除了 这个时候就可以返回指定的getters的计算内容了
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    // 标记在devtools中的vuex key 将其flag调为true
    res[key].vuex = true
  })
  return res
})

/**
 * mapActions方法 和 mapMutations很像 区别是执行的是 commit dispatch而已
 * 和mapmutations的主要区别是它可以执行异步方法
 * 其实mapMutations也可以执行异步方法 但是它为了更好地实现编程思想造成的
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})

/**
 * 把内容序列化成一个Map的形式 返回一个数组 方便调用 传入参数只能是数组或者对象
 * 序列化成 {key:keyName,val:value}的形式在数组中 这样使用filter forEach every any等方法的时候就方便了
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
function normalizeMap (map) {
  // 如果是数组 那就用map方法直接转换
  // 不是数组 就是对象 使用Object.keys()方法将其属性名整合成一个数组 在利用数组的map方法进行转换
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

/**
 * 这是一个函数式编程的经典实例 首先传入回调 并返回一个函数
 * 返回的函数我们可以存在一个新的变量中 然后执行 以后就只能传入namespace与map就可以了 fn已经常驻内存
 * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 */
function normalizeNamespace (fn) {
  return (namespace, map) => {
    // 这是调节参数 是用于处理没有传入namespace的情况的
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      // 如果namespace最后一位不是'/' 那么为了处理方便 添上'/'
      namespace += '/'
    }
    // 返回执行回调的结果 注：这里调用normalizeNamespace返回的值才返回的 此时fn已经常驻在内存中了
    return fn(namespace, map)
  }
}

/**
 * 拿到模块名对应的模块
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace (store, helper, namespace) {
  // 从store的map中找到对应的模块存储在module中 如果有内容就是一个对象 如果没有内容 那么则是 undefined
  const module = store._modulesNamespaceMap[namespace]
  // 生产环境下不报错 如果是开发环境 且module不存在 那么报错
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}
