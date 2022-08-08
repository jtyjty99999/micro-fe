/**
 * Created by xiabingwu on 2016/4/26.
 */
define(function (require, exports, module) {
    var regExCase=require('base/component/regExCase');
    var plugin = require('base/component/pluginable');
    var user = require('base/user/user');
    var $ = plugin.get$();
    //对jQuery Validate扩展
    if($.validator){
        $.extend($.validator.messages, {
            required: "这是必填字段",
            remote: "请修正此字段",
            email: "请输入有效的电子邮件地址",
            url: "请输入有效的网址",
            date: "请输入有效的日期",
            dateISO: "请输入有效的日期 (YYYY-MM-DD)",
            number: "请输入有效的数字",
            digits: "只能输入数字",
            creditcard: "请输入有效的信用卡号码",
            equalTo: "你的输入不相同",
            extension: "请输入有效的后缀",
            maxlength: $.validator.format("最多可以输入 {0} 个字符"),
            minlength: $.validator.format("最少要输入 {0} 个字符"),
            rangelength: $.validator.format("请输入长度在 {0} 到 {1} 之间的字符串"),
            range: $.validator.format("请输入范围在 {0} 到 {1} 之间的数值"),
            max: $.validator.format("请输入不大于 {0} 的数值"),
            min: $.validator.format("请输入不小于 {0} 的数值")
        });
        $.validator.addMethod("urlFormat",function(value, domElement){//注意这里不验证首尾是否有空白
            if(new RegExp("[a-zA-z]+://[^s]*").test($.trim(value)) == false){
                return false;
            }
            return true;
        },"链接格式不正确");
        $.validator.addMethod("email",function(value, domElement){//注意这里不验证首尾是否有空白
            return regExCase.email.test($.trim(value));
        },"请输入正确邮箱");
        //对邮箱或者手机号进行验证
        $.validator.addMethod("accountId",function(value,domElement){
            var val=$.trim(value);
            return (regExCase.email.test(val) || regExCase.phone.test(val));
        },"请输入正确帐号");
        $.validator.addMethod("passwordStrength",function(value, domElement){
            return /^(?![a-zA-Z]{6,}$)(?!\d{6,}$)[a-zA-Z\d]{6,}$/.test(value);
        },"密码必须包含数字、字母，且不包含特殊字符");
        
        $.validator.addMethod("regularQQ",function(value, domElement){
            return /^[1-9][0-9]{4,14}$/.test(value);
        },"请输入正确的QQ号码");

        $.validator.addMethod("mobilephone",function(value, domElement){//注意这里不验证首尾是否有空白
            if(/^1{1}[0-9]{10}$/.test($.trim(value)) == false){
                return false;
            }
            return true;
        },"手机格式不正确");

        $.validator.addMethod("identityCard",function(value, domElement){//注意这里不验证首尾是否有空白
            if(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/i.test($.trim(value)) == false){
                return false;
            }
            return true;
        },"身份证号码格式不正确");

        $.validator.addMethod("notEqual-1",function(value, domElement,params){
            if(value==-1){
                return false;
            }
            return true;
        },'不能为-1');

        $.validator.addMethod("identityCardLtAge18",function(value, domElement){//身份证小于18岁 注意这里不验证首尾是否有空白
            var result=user.checkIsOver18Age(value);
            return result;
        },"18岁以下未成年人不允许注册企鹅号");

        $.validator.addMethod("enterpriseLicense",function(value, domElement){//注意这里不验证首尾是否有空白
            if(/(^[a-zA-Z0-9]{15}$)|(^[a-zA-Z0-9]{18}$)/i.test($.trim(value)) == false){
                return false;
            }
            return true;
        }, "企业营业执照注册号不正确");

        $.validator.addMethod("organizationCode",function(value, domElement){//注意这里不验证首尾是否有空白
            if(/^[a-zA-Z0-9-]{1,}$/i.test($.trim(value)) == false){
                return false;
            }
            return true;
        }, "组织机构代码不正确");

        $.validator.addMethod("licenseSpecCode",function(value, domElement){//注意这里不验证首尾是否有空白
            if(/^[^IOZSV]+$/i.test($.trim(value)) == false){
                return false;
            }
            return true;
        }, "主体证件号不可以包含“I、O、Z、S、V”");
   
        // 长度（中文算两个字符）
        $.validator.addMethod("charsMaxLength", function(value, element, param) {
            var length = value.replace(/[^\x00-\xFF]/g,'aa').length;
            return this.optional(element) || ( length <= param*2 );
        }, $.validator.format("不能超过{0}个字符"));

        // Accept a value from a file input based on a required mimetype
        $.validator.addMethod( "accept", function( value, element, param ) {

            // Split mime on commas in case we have multiple types we can accept
            var typeParam = typeof param === "string" ? param.replace( /\s/g, "" ) : "image/*",
                optionalValue = this.optional( element ),
                i, file, regex;

            // Element is optional
            if ( optionalValue ) {
                return optionalValue;
            }

            if ( $( element ).attr( "type" ) === "file" ) {

                // Escape string to be used in the regex
                // see: http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
                // Escape also "/*" as "/.*" as a wildcard
                typeParam = typeParam.replace( /[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&" ).replace( /,/g, "|" ).replace( "\/*", "/.*" );

                // Check if the element has a FileList before checking each file
                if ( element.files && element.files.length ) {
                    regex = new RegExp( ".?(" + typeParam + ")$", "i" );
                    for ( i = 0; i < element.files.length; i++ ) {
                        file = element.files[ i ];

                        // Grab the mimetype from the loaded file, verify it matches
                        if ( !file.type.match( regex ) ) {
                            return false;
                        }
                    }
                }
            }

            // Either return true because we've validated each file, or because the
            // browser does not support element.files and the FileList feature
            return true;
        }, "请上传有效文件");
        $.validator.addMethod( "require_from_group", function( value, element, options ) {
            var $fields = $( options[ 1 ], element.form ),
                $fieldsFirst = $fields.eq( 0 ),
                validator = $fieldsFirst.data( "valid_req_grp" ) ? $fieldsFirst.data( "valid_req_grp" ) : $.extend( {}, this ),
                isValid = $fields.filter( function() {
                    return validator.elementValue( this );
                } ).length >= options[ 0 ];

            // Store the cloned validator for future validation
            $fieldsFirst.data( "valid_req_grp", validator );

            // If element isn't being validated, run each require_from_group field's validation rules
            if ( !$( element ).data( "being_validated" ) ) {
                $fields.data( "being_validated", true );
                $fields.each( function() {
                    validator.element( this );
                } );
                $fields.data( "being_validated", false );
            }
            return isValid;
        }, $.validator.format( "Please fill at least {0} of these fields." ) );

        $.validator.customCharMinLength=function(num,customMethodName){
            var charNum=num*2;
            var methodName=customMethodName||"minLengthCheck";
            $.validator.addMethod(methodName,function(value, domElement,params){
                return $.trim(value).getCharLength(false) >= num;
            },'最少要输入'+num+'个字，'+charNum+'个字符');
        };
        $.validator.customCharMaxLength=function(num,customMethodName){
            var charNum=num*2;
            var methodName=customMethodName||"maxLengthCheck";
            $.validator.addMethod(methodName, function(value, domElement, params) {
                return $.trim(value).getCharLength(false) <= num;
            }, '最多不能超过'+num+'个字，'+charNum+'个字符');
        };
    }
});