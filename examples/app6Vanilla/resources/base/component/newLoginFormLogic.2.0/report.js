define(function (require, exports, module) {
    function report(omfunction, moduleName, event) {
        try {
            OMReport({
                page: 'sign_in',
                omfunction: omfunction,
                module: moduleName,
                event: event
            });
        } catch (e) {}
    }
    return report;
});