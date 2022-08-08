/**
 * Created by Jonahnzhang on 2016/8/10.
 */
define(function (require, exports, module) {

    var base=require('base/base');
    var componentTemplate=require('base/component/template');
    var $ = window.jQuery;

    var defaultOption = {
        data:{text:'', loadingText:''},
        offset:{top:0, left:0}
    }

    var confirm = {
        $wrap:null,
        init:function($btn, option){
            var self = this;

            self.dfd = null;

            self.$btn = $btn;
            self.option = $.extend(true, defaultOption, option);

            return this;

        },
        confirm:function(){
            var self = this;

            self.append().position();

            if(self.$btn && self.$btn.length){
                return $.Deferred(function(dfd){
                    self.dfd = dfd;
                }).promise()
            }else{
                return $.Deferred(function(dfd){
                    dfd.reject();
                }).promise()
            }
        },
        append:function(option){
            var self = this;

            if(self.$wrap && self.$wrap.length){
                self.$wrap.remove();
            }

            self.$wrap = $(componentTemplate('tooltipConfirm', self.option.data));
            self.$yesBtn = $("#confirmYes", self.$wrap);
            self.$noBtn = $("#confirmNo", self.$wrap);
            self.$loadingBtn = $("#confirmLoading", self.$wrap);
            self.$arrow = $(".tooltip-arrow", self.$wrap);

            $(document.body).append(self.$wrap.show());

            return this;
        },
        close:function(){
            this.$wrap.remove();
        },
        position:function(){
            var btnOffset = this.$btn.offset(),
                btnW = this.$btn.width(),
                btnH = this.$btn.height(),
                confirmWrapW = this.$wrap.width(),
                confirmWrapH = this.$wrap.height();

            this.$wrap.css({
                top:btnOffset.top + btnH + this.option.offset.top,
                left:btnOffset.left + btnW/2 - confirmWrapW/2 + this.option.offset.left
            })

            this.$arrow.css({
                left:confirmWrapW/2 - this.option.offset.left
            })

            return this;
        },
        setState:function(state){
            var self = this;
            switch(state){
                case 'loading':
                    self.$loadingBtn.show();
                    self.$yesBtn.hide();
                    break;
                case 'initial':
                    self.$loadingBtn.hide();
                    self.$yesBtn.show();
                    break;
            }

            return this;
        }
    }

    $(document.body).on('click', '#confirmYes', function(){
        confirm.dfd.resolve(true);
    })
    $(document.body).on('click', '#confirmNo', function(){
        confirm.dfd.resolve(false);
        confirm.close();
    })

    module.exports = confirm;
});

