define(function(require, exports, module) {
    //if-need-helper
    var template = function(page, data){
        return (require.context('./template', true, /\.html$/)('./'+page+'.html'))(data); 
    }
    return template;
})