/**
 * Created by robinxiong on 2016/9/6.
 * containerSel为必须参数，表示放入什么位置
 * 自定义模板要标记出来 省份 城市 区域 select的位置分别用  provinceFlag cityFlag districtFlag来标识
 */
define(function (require, exports, module) {
	var base = require('base/base');
    var plugin = require('base/component/pluginable');
	var api = require('base/api/article');
	var omlayer = require('layer/layer');
	var constantsObj = require('base/global/constants');
    var $=plugin.get$();
	var areaData = {};
	var areaArrayData = new Array();
	var noCity = false;
	var noDistrict = false;
	var provinceArray = new Array();
	var provinceCityArray = new Array();
	var defaultWidth = "120px";
	var defaultTmplHtml = '<label class="form-select"><select name="omProvince" style="color: #222 !important;" class="valid" provinceFlag aria-invalid="false"></select></label><label class="form-select"><select  name="omCity"  style="color: #222 !important;" class="valid" cityFlag aria-invalid="false"></select></label><label class="form-select"><select name="omDistrict" style="color: #222 !important;" class="valid" districtFlag aria-invalid="false"></select></label>';
   
	function dynamicArea(containerSel, areaWrap, errorContainer, tmplHtml, currentWidth) {
        var self=this;
		self.areaWrap = areaWrap;
		self.errorContainer = errorContainer;
		self.defaultWidth = currentWidth || defaultWidth;
        var html = tmplHtml || defaultTmplHtml;
        if(!$.fn.chosen){
            throw constantsObj.get('NOCHOSE');
        }
		
        function buildProvince() {
            var tmpArr=[];
            tmpArr.push("<option value='-1' >" + constantsObj.get('SELECTPROVINCE') + "</option>");
            for(var i = 0; i < provinceArray.length; i++ ) {
				var temp = provinceArray[i];
				if (temp && temp.name && temp.name.length >0 && temp.name != constantsObj.get('GLOBAL')) 
					tmpArr.push('<option value="{0}">{1}</option>'.format(i,temp.name));
            }
            return tmpArr.join('');
        }		
		
        function buildCity(provinceKey) {
            var tmpArr=[];
			tmpArr.push("<option value='-1' >" + constantsObj.get('SELECTCITY') + "</option>");
			var temp = provinceArray[provinceKey];
			if (temp && temp.cityList && temp.cityList.length >0) {
				noCity = false;
				var cityArray = temp.cityList;
				if (cityArray && cityArray.length > 0) {
					for(var j = 0; j< cityArray.length; j++) {
						var tempCity = cityArray[j];
						tmpArr.push('<option value="{0}">{1}</option>'.format(tempCity.code, tempCity.name));
					}
				}
			}
			else {
				noCity = true;
				tmpArr.push("<option value='0' >" + constantsObj.get('ALL') + "</option>");
			}
            return tmpArr.join('');
        }
		
        function buildDistrict(provinceKey,cityKey) {
            var tmpArr=[];
			tmpArr.push("<option value='-1' >" + constantsObj.get('SELECTCOUNTY') + "</option>");
			var temp = provinceCityArray[provinceKey + ":" + cityKey];
			if(temp && temp.countyList && temp.countyList.length >0) {
				noDistrict = false;
				var tempCountyArr = temp.countyList;
				for (var i = 0; i< tempCountyArr.length; i++) {
					var tempCounty = tempCountyArr[i];
					tmpArr.push('<option value="{0}">{1}</option>'.format(tempCounty.code, tempCounty.name));
				}
			}
            else {
				noDistrict = true;
				tmpArr.push("<option value='0' >" + constantsObj.get('ALL') + "</option>");				
			}
            return tmpArr.join('');
        }
		
        function eventBind() {
            self.$province.on("change", function(){
                var selectedProvince = self.$province.val();
                if(selectedProvince && selectedProvince != -1) {
                    self.$city.html(buildCity(selectedProvince));
                } else {
                    self.$city.html("<option value='-1' >" + constantsObj.get('SELECTCITY') + "</option>");
                }
				if (selectedProvince != -1 && noCity)
					self.$city.val(0);
				else
					self.$city.val(-1);
				self.$city.change();
				self.$city.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			    // verify value again
				var selectedCity = 	self.$city.val();
				var selectedDistrict = self.$district.val();
				verifyArea(selectedProvince, selectedCity, selectedDistrict);
            });
			
            self.$city.on("change", function(){
				var selectedProvince = self.$province.val();
				var selectedCity = 	self.$city.val();
                if(selectedCity && selectedCity != -1) {
                    self.$district.html( buildDistrict(selectedProvince,selectedCity) );
                } else {
                    self.$district.html("<option value='-1'>" + constantsObj.get('SELECTCOUNTY') + "</option>");
                }
				if (selectedCity != -1 && noDistrict)
					self.$district.val(0);
				else
					self.$district.val(-1);
				self.$district.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
				// verify value again
				var selectedDistrict = self.$district.val();
				verifyArea(selectedProvince, selectedCity, selectedDistrict);
            });
			
            self.$district.on("change", function(){
				var selectedProvince = self.$province.val();
                var selectedCity = 	self.$city.val();
				var selectedDistrict = self.$district.val();
                verifyArea(selectedProvince, selectedCity, selectedDistrict);
            });			
        }
		
		function verifyArea(selectedProvince, selectedCity, selectedDistrict) {
			var currentContainer = $(self.areaWrap);
			if (selectedProvince != -1 && selectedCity != -1 && selectedDistrict != -1) {
				var tempAreaDiv = currentContainer.find(self.errorContainer);
				tempAreaDiv.find(".help-block.error").hide();				
			}
		}
	
        function initData() {
			// 初始化数据
			initArrayData(areaArrayData);
			// after the area data fetched, then we start to init province option
			self.$province.html(buildProvince());						
			self.$province.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			self.$province.change();
        };
		
		function initArrayData(areaData) {
			if (areaData && areaData.length >0) {
				for(var i = 0; i< areaData.length; i++) {
					var tempProvince = areaData[i];
					var tempProvinceValue = {};
					tempProvinceValue.name = tempProvince.name;
					tempProvinceValue.cityList = tempProvince.citylist;
					provinceArray[tempProvince.code] = tempProvinceValue;
					var tempCityList = tempProvince.citylist;
					if(tempCityList && tempCityList.length >0) {
						for(var j = 0; j< tempCityList.length; j++) {
							var tempCity = tempCityList[j];
							var tempCityValue = {};
							tempCityValue.name = tempCity.name;
							tempCityValue.countyList = tempCity.countylist;
							provinceCityArray[tempProvince.code + ":" + tempCity.code] = tempCityValue;
						}
					}
				}
			}
		}
		
		function getDistrictFromList(tempList, tempCode) {
			var result = "";
			if (tempList && tempList.length >0) {
				for (var i = 0; i < tempList.length; i++) {
					var tempObj = tempList[i];
					if (tempObj.code == tempCode) {
						result = tempObj.name;
						break;
					}
				}
			}
			return result;
		}
	
        this.init = function() {
			self.loaded = true;
            self.$container = $(containerSel).html(html);
            self.init=function(){//保证只初始化一次
                return this;
            };
            return this;
        };
		
		this.initView = function(tempArrayData) {
			areaArrayData = tempArrayData;
			self.$province = $(self.areaWrap).find('[provinceFlag]');
            self.$city = $(self.areaWrap).find('[cityFlag]');
            self.$district = $(self.areaWrap).find('[districtFlag]');				
		    noCity = false;
	        noDistrict = false;
            eventBind();
			initData();			
		};	
		
        this.initDataByUser = function(pushData) {
			if (self.$province) {
				self.$province.val(pushData.province);
				self.$province.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}
			if (self.$city) {
				self.$city.html(buildCity(pushData.province));
				self.$city.val(pushData.city);
				self.$city.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}
			if (self.$district) {
				self.$district.html( buildDistrict(pushData.province, pushData.city) );
				self.$district.val(pushData.district);
				self.$district.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}
        };
		
		this.initDefaultValue = function() {
			self.$province = $(self.areaWrap).find('[provinceFlag]');
            self.$city = $(self.areaWrap).find('[cityFlag]');
            self.$district = $(self.areaWrap).find('[districtFlag]');
			if (self.$province) {
				self.$province.html("<option value='-1'>" + constantsObj.get('SELECTPROVINCE') + "</option>");
				self.$province.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}
			if (self.$city) {
				self.$city.html("<option value='-1'>" + constantsObj.get('SELECTCITY') + "</option>");
				self.$city.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}
			if (self.$district) {
				self.$district.html("<option value='-1'>" + constantsObj.get('SELECTCOUNTY') + "</option>");
				self.$district.chosen("destroy").chosen({width: self.defaultWidth,disable_search: true});
			}			
		};

		this.getData = function() {
			var tempProvince = -1;
			var tempCity = -1;
			var tempDistrict = -1;
			var tempProvinceText = constantsObj.get('SELECTPROVINCE');
			var tempCityText = constantsObj.get('SELECTCITY');
			var tempDistrictText = constantsObj.get('SELECTCOUNTY');
			var tempNames = "";
			if (self.$province) {
				tempProvince = self.$province.val();
				if (tempProvince != -1)
					tempProvinceText = provinceArray[tempProvince].name;
			}
			if (self.$city) {
				tempCity = self.$city.val();
				if (tempCity != -1) {
					if (provinceCityArray[tempProvince + ":" + tempCity])
						tempCityText = provinceCityArray[tempProvince + ":" + tempCity].name;
				}
			}
			if (self.$district) {
				tempDistrict = self.$district.val();
				if (tempDistrict != -1) {
					if (provinceCityArray[tempProvince + ":" + tempCity])
						tempDistrictText = getDistrictFromList(provinceCityArray[tempProvince + ":" + tempCity].countyList, tempDistrict);
				}
			}
			if (tempCity == 0 && (provinceArray[tempProvince].cityList == undefined || (provinceArray[tempProvince].cityList && provinceArray[tempProvince].cityList.length == 0)))
				tempNames = tempProvinceText;
			else if (tempDistrict == 0)
				tempNames = tempCityText;
			else 
				tempNames = tempCityText + tempDistrictText;
			return {province: tempProvince, city: tempCity, district: tempDistrict, names: tempNames};
		};
    }
    return dynamicArea;
});