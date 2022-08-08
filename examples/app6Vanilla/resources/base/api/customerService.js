
define(function (require, exports, module) {
    let customerService = {};
    customerService.getInfo = function (param) {
        return $.ajax({
            type: 'get',
            url: '/account/MediaInfo?relogin=1',
            data: param,
            dataType: 'json'
        });
    };
    return customerService;

});