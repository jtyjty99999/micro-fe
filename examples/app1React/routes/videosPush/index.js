module.exports = {
  path: 'video',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/video'))
    })
  }
}
