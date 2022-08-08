define(function(require, exports, module) {
    require.context('./template/config', false, /.js$/)('./template-helper.js')
    var template = function(page, data){
        return (require.context('./template', true, /\.html$/)('./'+page+'.html'))(data); 
    }
    return template;
})