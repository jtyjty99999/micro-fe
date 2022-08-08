define(function(require, exports, module) {
    var videoapi = require('base/api/video');

    var PLACEHOLDER = '请选择分类';


    function VideoCategory(option) {
        this.option = option || {};

        this.id = this.option.id || generateID();

        this.init();
    }

    VideoCategory.prototype = {
        init:function(){
            var self = this;
            self.clear().fetch().done(function(resp){
                self.appendToPage(self.buildSelect(resp.data)).chosen();
                if(self.data){
                    self.setValue(self.data);
                }
            })
        },
        fetch:function(){
            var self = this;

            return $.Deferred(function(dfd){
                videoapi.getVideoCategory().then(function(resp) {
                    if (resp.response.code != 0) return;
                    dfd.resolve(resp);
                });
            })
        },
        clear:function(){
            this.data = null;

            return this;
        },
        buildSelect:function(data){
            var html = "";

            for (var i = 0, ci; ci = data[i++];) {
                html += '<optgroup label="' + ci.cat + '">';
                for (var j = 0, cj; cj = ci.subcats[j++];) {
                    html += '<option value="' + ci.cat + '-' + cj + '">' + cj + '</option>';
                }
                html += '</dl></optgroup>';
            }

            return '<select data-placeholder='+ PLACEHOLDER +' id="'+ this.id +'">' + html + '</selec>';
        },
        appendToPage:function(selectHtml){
            var self = this;
            if(selectHtml && self.option.$wrap){
                self.option.$wrap.html(selectHtml);
            }

            return this;
        },
        chosen:function(){
            var self = this;
            var choseOption = this.option.chosen || {};
            if(self.option.$wrap){
                self._querySelectEL().chosen(choseOption);
                self._querySelectEL().val(PLACEHOLDER).trigger('chosen:updated');
                if(choseOption.onchange){
                    self._querySelectEL().on("change",function(e){
                        choseOption.onchange(e);
                    })
                }
            }
        },
        setValue:function(value){
            var $select = this._querySelectEL();
            this.data = value;
            $select.val(value || PLACEHOLDER).trigger('chosen:updated');
        },
        getValue:function(){
            var $select = this._querySelectEL();

            if($select.length){
                var val = $select.val() || '';
                if(!val || val == PLACEHOLDER){
                    return [];
                }else{
                    return val.split('-');
                }
            }else{
                return [];
            }
        },
        enable:function(){
            this.option.$wrap.removeClass('disabled');
        },
        disable:function(){
            this.option.$wrap.addClass('disabled');
        },
        _querySelectEL:function(){
            var $select = $("#"+ this.id);

            if(!$select.length){
                $select = this.option.$wrap.find('select');
            }
            return $select;
        }
    };


    function generateID(){
        function g(){
            return ((Math.random()+1)*0x100000|0).toString(16).substring(1);
        }
        return g()+g()+g();
    }


    module.exports = function(option){
        return new VideoCategory(option);
    };
});