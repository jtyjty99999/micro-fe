module.exports = {
    path: 'images',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('./components/images'))
      })
    }
}