/**
 * ������ж�ģ��
 * @file
 * @since 1.2.6.1
 * Created by coreywang on 2017/1/17.
 */
define(function(require, module, exports){
    var browser = function() {
        var agent = navigator.userAgent.toLowerCase(),
            opera = window.opera,
            browser = {
                /**
                 * @property {boolean} ie ��⵱ǰ������Ƿ�ΪIE
                 * @example
                 * ```javascript
                 * if ( browser.ie ) {
                 *     console.log( '��ǰ�������IE' );
                 * }
                 * ```
                 */
                ie: /(msie\s|trident.*rv:)([\w.]+)/.test(agent),

                /**
                 * @property {boolean} opera ��⵱ǰ������Ƿ�ΪOpera
                 * @example
                 * ```javascript
                 * if ( browser.opera ) {
                 *     console.log( '��ǰ�������Opera' );
                 * }
                 * ```
                 */
                opera: (!!opera && opera.version),

                /**
                 * @property {boolean} webkit ��⵱ǰ������Ƿ���webkit�ں˵������
                 * @example
                 * ```javascript
                 * if ( browser.webkit ) {
                 *     console.log( '��ǰ�������webkit�ں������' );
                 * }
                 * ```
                 */
                webkit: (agent.indexOf(' applewebkit/') > -1),

                /**
                 * @property {boolean} mac ��⵱ǰ������Ƿ���������macƽ̨��
                 * @example
                 * ```javascript
                 * if ( browser.mac ) {
                 *     console.log( '��ǰ�����������macƽ̨��' );
                 * }
                 * ```
                 */
                mac: (agent.indexOf('macintosh') > -1),

                /**
                 * @property {boolean} quirks ��⵱ǰ������Ƿ��ڡ�����ģʽ����
                 * @example
                 * ```javascript
                 * if ( browser.quirks ) {
                 *     console.log( '��ǰ��������д��ڡ�����ģʽ��' );
                 * }
                 * ```
                 */
                quirks: (document.compatMode == 'BackCompat')
            };

        var version = 0;

        // Internet Explorer 6.0+
        if (browser.ie) {

            var v1 = agent.match(/(?:msie\s([\w.]+))/);
            var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
            if (v1 && v2 && v1[1] && v2[1]) {
                version = Math.max(v1[1] * 1, v2[1] * 1);
            } else if (v1 && v1[1]) {
                version = v1[1] * 1;
            } else if (v2 && v2[1]) {
                version = v2[1] * 1;
            } else {
                version = 0;
            }

            browser.ie11Compat = document.documentMode == 11;
            /**
             * @property { boolean } ie9Compat ��������ģʽ�Ƿ�Ϊ IE9 ����ģʽ
             * @warning ������������IE�� ���ֵΪundefined
             * @example
             * ```javascript
             * if ( browser.ie9Compat ) {
             *     console.log( '��ǰ�����������IE9����ģʽ��' );
             * }
             * ```
             */
            browser.ie9Compat = document.documentMode == 9;

            /**
             * @property { boolean } ie8 ���������Ƿ���IE8�����
             * @warning ������������IE�� ���ֵΪundefined
             * @example
             * ```javascript
             * if ( browser.ie8 ) {
             *     console.log( '��ǰ�������IE8�����' );
             * }
             * ```
             */
            browser.ie8 = !!document.documentMode;

            /**
             * @property { boolean } ie8Compat ��������ģʽ�Ƿ�Ϊ IE8 ����ģʽ
             * @warning ������������IE�� ���ֵΪundefined
             * @example
             * ```javascript
             * if ( browser.ie8Compat ) {
             *     console.log( '��ǰ�����������IE8����ģʽ��' );
             * }
             * ```
             */
            browser.ie8Compat = document.documentMode == 8;

            /**
             * @property { boolean } ie7Compat ��������ģʽ�Ƿ�Ϊ IE7 ����ģʽ
             * @warning ������������IE�� ���ֵΪundefined
             * @example
             * ```javascript
             * if ( browser.ie7Compat ) {
             *     console.log( '��ǰ�����������IE7����ģʽ��' );
             * }
             * ```
             */
            browser.ie7Compat = ((version == 7 && !document.documentMode) || document.documentMode == 7);

            /**
             * @property { boolean } ie6Compat ��������ģʽ�Ƿ�Ϊ IE6 ģʽ ���߹���ģʽ
             * @warning ������������IE�� ���ֵΪundefined
             * @example
             * ```javascript
             * if ( browser.ie6Compat ) {
             *     console.log( '��ǰ�����������IE6ģʽ���߹���ģʽ��' );
             * }
             * ```
             */
            browser.ie6Compat = (version < 7 || browser.quirks);

            browser.ie9above = version > 8;

            browser.ie9below = version < 9;

            browser.ie11above = version > 10;

            browser.ie11below = version < 11;

        }

        // Gecko.
        if (browser.gecko) {
            var geckoRelease = agent.match(/rv:([\d\.]+)/);
            if (geckoRelease) {
                geckoRelease = geckoRelease[1].split('.');
                version = geckoRelease[0] * 10000 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
            }
        }

        /**
         * @property { Number } chrome ��⵱ǰ������Ƿ�ΪChrome, ����ǣ��򷵻�Chrome�Ĵ�汾��
         * @warning ������������chrome�� ���ֵΪundefined
         * @example
         * ```javascript
         * if ( browser.chrome ) {
         *     console.log( '��ǰ�������Chrome' );
         * }
         * ```
         */
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = +RegExp['\x241'];
        }

        /**
         * @property { Number } safari ��⵱ǰ������Ƿ�ΪSafari, ����ǣ��򷵻�Safari�Ĵ�汾��
         * @warning ������������safari�� ���ֵΪundefined
         * @example
         * ```javascript
         * if ( browser.safari ) {
         *     console.log( '��ǰ�������Safari' );
         * }
         * ```
         */
        if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
            browser.safari = +(RegExp['\x241'] || RegExp['\x242']);
        }


        // Opera 9.50+
        if (browser.opera)
            version = parseFloat(opera.version());

        // WebKit 522+ (Safari 3+)
        if (browser.webkit)
            version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);

        /**
         * @property { Number } version ��⵱ǰ������汾��
         * @remind
         * <ul>
         *     <li>IEϵ�з���ֵΪ5,6,7,8,9,10��</li>
         *     <li>geckoϵ�л᷵��10900��158900��</li>
         *     <li>webkitϵ�л᷵����build�� (�� 522��)</li>
         * </ul>
         * @example
         * ```javascript
         * console.log( '��ǰ������汾���ǣ� ' + browser.version );
         * ```
         */
        browser.version = version;

        /**
         * @property { String } name ���������
         */
        browser.name = browser.ie && 'IE' ||
                        browser.chrome && 'chrome' ||
                        browser.safari && 'safari' ||
                        browser.opera && 'opera' ||
                        'other';


        /**
         * @property { boolean } isCompatible ��⵱ǰ������Ƿ��ܹ���UEditor���ü���
         * @example
         * ```javascript
         * if ( browser.isCompatible ) {
         *     console.log( '�������UEditor�ܹ����ü���' );
         * }
         * ```
         */
        browser.isCompatible = !browser.mobile && (
            (browser.ie && version >= 6) ||
            (browser.gecko && version >= 10801) ||
            (browser.opera && version >= 9.5) ||
            (browser.air && version >= 1) ||
            (browser.webkit && version >= 522) ||
            false);
        return browser;
    }()

    return browser;
})
