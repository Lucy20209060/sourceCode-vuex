// 源码入口文件 提供store的各种module的构建安装
import { Store, install } from './store'
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}
/* 
从这里可以看出 我们可以使用vuex的方法与属性 如最基本的store
供给 Vue.use()全局挂载的install
展开内容的mapState,mapMutations,mapGetters,mapActions
创建基于命名空间的组件绑定辅助函数 createNamespacedHelpers
*/