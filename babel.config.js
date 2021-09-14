// 在项目发布阶段才使用到的插件，在开发阶段是不用的
const productPlugins = []
if (process.env.NODE_ENV === 'production') {
  productPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      },
      
    ],
    // 这里需要展开，不能直接丢数组
    ...productPlugins
  ]
}
