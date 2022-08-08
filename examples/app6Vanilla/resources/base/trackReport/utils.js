define(function(require){
    var reportDomSelectors = {};
    window.OMReportTest = window.OMReportTest || {
            test:function(pageName){
                var self = this;
                if(reportDomSelectors[pageName]){
                    var losePoints = [];
                    $.each(reportDomSelectors[pageName],function(selector,evt){
                        var selectors = selector.split(" ");
                        selectors.shift();
                        selector = selectors.join(" ");
                        if(!$(selector).filter(":visible").length){
                            losePoints.push(selector);
                        }
                    })

                    if(losePoints.length){
                        console.log("下列节点没有找到："+losePoints.join("||||||||||||||||"));
                    }
                }else{
                    console.log("页面名称有误或没有此页面的测试项配置");
                }
            }
        };
    var utils = {
        listen:function(map, page, omfunction, evt){
            var self = this;
            $.each(map,function(selector,moduleName){
                var selectors = selector.split(" "),
                    evt = selectors.shift(),
                    selector = selectors.join(" ");


                $(document.body).on(evt, selector, function(){
                    moduleName = typeof moduleName == 'function' ? moduleName() : moduleName ;
                    self.report(page, omfunction, moduleName,evt||'click');
                })
            })

            return this;
        },
        addToTest:function(name, map){
            reportDomSelectors[name] = map;

            return this;
        },
        report:function(page, omfunction, moduleName, event) {
            try {
                OMReport({
                    page: page,
                    omfunction: omfunction,
                    module: moduleName,
                    event: event
                });
            } catch (e) {}
        }
    }

    return utils;
})