/**
 * 使用该组件页面上需要引入<script type="text/javascript" src="//om.gtimg.cn/om/om_2.0/libs/area/simpleArea.min.2016.11.21.js"></script>
 * containerSel为必须参数，表示放入什么位置
 * 自定义模板要标记出来 国家 城市 地域 select的位置分别用  stateFlag provinceFlag cityFlag
 */
define(function (require, exports, module) {
    var plugin=require('base/component/pluginable');
    var constantVar=require('base/component/constantVar');
    var areaData=constantVar.getArea();
    var $=plugin.get$();
    var defaultTmplHtml='<label class="form-select"><select class="valid" stateFlag aria-invalid="false"></select></label><label class="form-select"><select class="valid" provinceFlag aria-invalid="false"></select></label><label class="form-select"><select class="valid" cityFlag aria-invalid="false"></select></label>';
    function area(containerSel,tmplHtml){
        var self=this;
        var html=tmplHtml||defaultTmplHtml;
        if(!$.fn.chosen){
            throw '缺少chosen插件';
        }
        function buildProvince(){
            var tmpArr=[];
            tmpArr.push("<option value='-1' >省份/直辖市</option>");
            for(var key in areaData){
                tmpArr.push('<option value="{0}">{1}</option>'.format(key,areaData[key]["n"]));
            }
            return tmpArr.join('');
        }
        function buildCity(provinceKey){
            var tmpArr=[];
            for( var key in areaData[provinceKey]["l"])
            {
                tmpArr.push('<option value="{0}">{1}</option>'.format(key,areaData[provinceKey]["l"][key]["n"]));
            }
            return tmpArr.join('');
        }
        function eventBind(){
            self.$state.on("change",function(){
                var selectedState = self.$state.find("option:selected").attr("value");
                if(selectedState=="1"){
                    self.$province.html(buildProvince());
                }else{
                    self.$province.html("<option value='-1' >省份/直辖市</option>");
                }
                self.$province.change();
                $('[provinceFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
            });
            self.$province.on("change",function(){
                var selectedProvince = 	self.$province.find("option:selected").attr("value");
                if(selectedProvince&&selectedProvince!="-1"){
                    self.$city.html(buildCity(selectedProvince));
                }else{
                    self.$city.html("<option value='-1'>市/区</option>");
                }
                $('[cityFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
            });
        }
        this.init=function(){
            self.$container=$(containerSel).html(html);
            self.$state=self.$container.find('[stateFlag]');
            self.$province=self.$container.find('[provinceFlag]');
            self.$city=self.$container.find('[cityFlag]');
            eventBind();
            this.$state.html("<option  value='1'>中国</option>");
            self.$state.change();
            $('[stateFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
            self.init=function(){//保证只初始化一次
                return this;
            };
            return this;
        };
    }
    return area;
});