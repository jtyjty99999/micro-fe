define(function(require, exports, module) {
    window.psLib && window.psLib.define("optimize", function() {
        var _self = this;
        //image data class
        var TYPEMAP = {
            "r": 1,
            "g": 2,
            "b": 3,
            "a": 4,
            "rgb": -1,
            "rgba": -2
        };

        function imgData(srcData, width, height) {
            this.data = srcData.data;
            this.width = width;
            this.height = height;
        }

        imgData.prototype.getData = function(x, y, type) {
            var typeOffset = TYPEMAP[type] || 1;
            var startPos = ((y - 1) * this.width + x - 1) * 4 - 1; //数组下标从0开始
            if (typeOffset > 0) { //r OR g OR b OR a
                var offset = startPos + typeOffset;
                return this.data[offset];
            } else if (typeOffset == -1) { //rgb
                var result = [];
                for (var i = startPos + 1; i <= startPos + 3; i++) {
                    result.push(this.data[i]);
                }
                return result;
            } else { //rgba
                var result = [];
                for (var i = startPos + 1; i <= startPos + 4; i++) {
                    result.push(this.data[i]);
                }
                return result;
            }
        };

        var _srcImgData = new imgData(this.imgData, this.width, this.height);

        function _traversePixel(callback) {
            for (var x = 1; x <= _self.width; x++) {
                for (var y = 1; y <= _self.height; y++) {
                    callback && callback(_srcImgData.getData(x, y, "rgb"), x, y);
                }
            }
        }
        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h, s, and l in the set [0, 1].
         *
         * @param     Number    r             The red color value
         * @param     Number    g             The green color value
         * @param     Number    b             The blue color value
         * @return    Array                   The HSL representation
         */

        // HSL 为 色相，饱和度，亮度，
        function rgbToHsl(rgbArr) {
            var r, g, b;
            r = rgbArr[0] / 255;
            g = rgbArr[1] / 255;
            b = rgbArr[2] / 255;

            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }

                h /= 6;
            }

            return [h, s, l];
        }

        /**
         * Converts an HSL color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes h, s, and l are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         *
         * @param   Number  h       The hue
         * @param   Number  s       The saturation
         * @param   Number  l       The lightness
         * @return  Array           The RGB representation
         */
        function hslToRgb(hslArr) {
            var h, s, l, r, g, b;
            h = hslArr[0];
            s = hslArr[1];
            l = hslArr[2];

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;

                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [r * 255, g * 255, b * 255];
        }
        maxGray = 0;
        minGray = 0;
        sumGray = 0;
        avGray = 0;

        // HSB 为 色相，饱和度，明度，
        // HSL 为 色相，饱和度，亮度，
        // HSV 为色相，饱和度，明度
        var avL = 0,
            maxL = 0,
            minL = 0,
            sumL = 0;

        _traversePixel(function(rgb, x, y) {
            var hls = rgbToHsl(rgb);
            maxL = Math.max(maxL, hls[2]);
            minL = Math.min(minL, hls[2]);
            sumL += hls[2];
        });
        avL = sumL / (this.width * this.height);

        console.log(avL);
        if (avL > 0.5) {
            // 亮度，对比度
            this.act("brightness", 0, 2);
            // 色相，饱和度，明度，是否着色模式(可选) 
            this.act("setHSI", 0, 2, 0, !true);
        } else if (avL < 0.3) {
            // 亮度，对比度
            this.act("brightness", 7, 7);
            // 色相，饱和度，明度，是否着色模式(可选) 
            this.act("setHSI", 0, 4, 0, !true);
        } else {
            // 亮度，对比度
            this.act("brightness", 5, 5);
            // 色相，饱和度，明度，是否着色模式(可选) 
            this.act("setHSI", 0, 4, 0, !true);
        }
        return this;
    });

    var supportCanvas = !!document.createElement('canvas').getContext;
    var origin, opzpic;
    exports.check = function() {
        return supportCanvas;
    };

    exports.trans = function(img) {
        var picTranseObj;
        if (img.naturalWidth > 640) {
            picTranseObj = psLib(img, 640, parseInt(640 / img.naturalWidth * img.naturalHeight));
        } else {
            picTranseObj = psLib(img, img.naturalWidth, img.naturalHeight);
        }

        origin = picTranseObj.clone(); //克隆原始对象做为原始副本
        opzpic = picTranseObj.ps("optimize");

        opzpic.replace(img);
    };

    exports.reset = function(img) {
        origin.replace(img);
    };
});