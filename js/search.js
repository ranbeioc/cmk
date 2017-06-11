/*
* Page: Search
* Date: 2012.06.24 21:08:20
* Auth: ranbei@msn.com
*/
Array.prototype.baoremove = function(dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    this.splice(dx, 1);
};
String.prototype.format = function(args) {
    var str = this;
    return str.replace(String.prototype.format.regex,
    function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

var searchEngine = (function() {

    var options = {};

    return {
        init: function(args) {

            options = {
                server : args.server,
                search : args.search,

                keywords : args.keywords,
                searchBtn : args.searchBtn,
                temps : args.temps,

                msg : args.msg,
                sug : args.sug,
                nosug : args.nosug,

                ptool : args.ptool,
                ahots : args.ahots,
                hisd : args.hisd,
                hist : args.hist,
                mbmore : args.mbmore,
                navt : args.navt
            };

            //this.loadHots();
            //this.getUserInfo();
            //this.siteVer();
            this.events();
            this.loadFavo();
            this.loadHist();
        },
        /*siteVer: function(){
            if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
                window.location = '/wap/search.html';
            };
        },*/
        /*
        getUserInfo: function(){
            var _url = decodeURI(window.location.toString());
            var _token = _url.slice(_url.indexOf('token=') + 6, _url.indexOf('&'));
            if(_token){
                var _options = {
                    appid: '59038denlmZkpgohMzu8IYP48MX8t6',
                    apikey: '$1$29761den$5i8lrkzkTatFFgKqDP1jq.',
                    token: _token,
                    timestamp: $.now(),
                    version: '1.0',
                    sign_type: 'MD5'
                };
                var _optstrs = [];
                _optstrs.push('appid=' + _options.appid);
                _optstrs.push('token=' + _options.token);
                _optstrs.push('timestamp=' + _options.timestamp);
                _optstrs.push('version=' + _options.version);
                _optstrs.push('sign_type=' + _options.sign_type);
                _optstrs.sort();
                _optstrs.push('api_key=' + _options.apikey);

                var geturl = 'http://open.denglu.cc/api/v4/user_info?' + 'appid=' + _options.appid + '&token=' + _options.token + '&timestamp=' + _options.timestamp + '&version=' + _options.version + '&sign_type=' + _options.sign_type + '&sign=' + hex_md5(_optstrs.join(''));

                console.log(_optstrs.join(''), geturl);
                
                $.ajax({
                    url: geturl,
                    type: 'get',
                    dataType: 'json',
                    success: function(data){
                        console.log(data);
                    }
                });

            };
        },*/
        events: function() {
            var _this = this;
            options.searchBtn.click(function() {
                var _key = options.keywords.val();
                if ($.trim(_key) == '') return;

                var _url = window.location.href.toString();
                var _surl = (_url.indexOf('search') > -1) ? _url.replace('search', 'searchlist') : (_url + 'searchlist.html');
                window.location = encodeURI(_surl + '?keywords=' + $.trim(_key) + '&page=1');
            });

            options.msg.click(function() {
                options.sug.slideToggle(400);
            });

            options.nosug.click(function() {
                options.sug.slideUp(400);
            });

            options.ptool.each(function() {
                $(this).click(function() {
                    var _a = ($(this).children())[0];
                    window.open($(_a).attr('href'));
                });
            });

            $(document).keydown(function(e) {
                if (e.keyCode == 13) {
                    $(options.searchBtn).trigger('click');
                    return false;
                };
            });
            /*
            .bind('contextmenu',
            function() {
                return false;
            }).bind('selectstart',
            function() {
                return false;
            });
            */
        },
        hideMore: function() {
            if (options.temps.children().length > 6) {
                var _gt5 = options.temps.children(':gt(5)');
                options.mbmore.toggle(function() {
                    $(this).text('局部显示');
                    _gt5.show();
                },
                function() {
                    $(this).text('全部显示');
                    _gt5.hide();
                });
            } else {
                options.temps.children().show();
                options.mbmore.unbind('click');
                options.mbmore.text('没有多余鸟哦');
            };
        },
        /*loadHots: function(){
            var _this = this;
            $.jsonp({
                url: options.server + options.search + '?format=json-p&callback=?',
                success: function(datas){
                    if(datas.length > 0){
                        var _dats = [];
                        for(var i = 0; i < datas.length; i++){
                            _dats.push('<li><a href="/searchlist.html?keywords=' + datas[i].keyphrase + '&page=1">' + datas[i].keyphrase + '</a></li>');
                        };
                    };
                    options.ahots.append(_dats.join(''));
                },
                error: function(){
                    options.ahots.find('li:lt(6)').show();
                }
            });
        },*/
        loadFavo: function() {
            var _urls = $.jStorage.get('favor_url');
            var _tlts = $.jStorage.get('favor_tlt');

            if (_urls != null && _tlts != null) {
                var _urlAry = _urls.split(',');
                var _tltAry = _tlts.split(',');
                if (_urlAry[_urlAry.length - 1] == "" || _tltAry[_tltAry.length - 1] == "") {
                    _urlAry.pop();
                    _tltAry.pop();
                };
                var _temps = [];
                if (_urlAry.length > 0) {
                    for (var i = 0; i < _urlAry.length; i++) {
                        var _tlt = _tltAry[i].length > 16 ? _tltAry[i].slice(0, 16) + '...': _tltAry[i];
                        _temps.push('<li index="{2}"><a href="{0}" target="_black">{1}</a><a href="javascript:void(0);" class="del">删除</a></li>'.format([_urlAry[i], _tlt, i]));
                    };
                    _temps.reverse();
                    //_temps.length = _temps.length > 6 ? 6 : _temps.length;
                    options.temps.html(_temps.join(''));

                    //options.navt.show();
                    //options.temps.show();
                };

                var _this = this;

                options.temps.children().each(function() {
                    if ($(this).parent().children().length > 6) {
                        $(this).parent().children(':gt(5)').hide();
                    };

                    $(this).hover(function() {
                        var _fav = $(this).children('.del');
                        $(this).css('background-color', '#fffff4');
                        _fav.show();
                    },
                    function() {
                        $(this).css('background-color', '#fff');
                        $(this).children('.del').hide();
                    });

                    $(this).children('.del').click(function() {
                        var r = confirm("你确定、一定，以及肯定要删除吗？啊？");
                        if (r == true) {
                            var _prt = $(this).parent();
                            var _idx = _prt.attr('index');

                            _urlAry.baoremove(_idx);
                            _tltAry.baoremove(_idx);

                            $.jStorage.set('favor_url', _urlAry.join(','));
                            $.jStorage.set('favor_tlt', _tltAry.join(','));

                            _prt.remove();

                            _this.hideMore();

                            alert('真的已经删除了哦！');
                        };
                    });
                });

                this.hideMore();
            };
            //else{
                //options.navt.hide();
                //options.temps.hide();
            //};
        },
        loadHist: function() {
            var _hit = $.jStorage.get('_history');

            if (_hit != null) {
                options.hisd.hide();
                var _hitAry = _hit.split(',').reverse();
                if (_hitAry[_hitAry.length - 1] == "") {
                    _hitAry.pop();
                };
                _hitAry.length = _hitAry.length > 5 ? 5 : _hitAry.length;
                options.hist.html(_hitAry.join(''));

                options.hist.prev().show();
                options.hist.show();

                $("img.lazy").lazyload({
                    effect: "fadeIn",
                    threshold: 100,
                    failure_limit: 10,
                    appear: function(){
                        if($(this).attr('src').indexOf('grey.gif') > -1){
                            $(this).attr('src', 'img/nopic.png');
                        };
                    }
                });

                options.hist.children('li').each(function() {
                    $(this).click(function() {
                        var _cid = $(this).attr('cid');
                        var _url = decodeURI(window.location.toString());
                        var _surl = (_url.indexOf('search') > -1) ? _url.replace('search', 'detailed') : (_url + 'detailed.html');
                        window.location = encodeURI(_surl + '?postid=' + _cid);
                    });
                });
            }else{
                options.hisd.show('fast', function(){
                    options.hisd.children('li').each(function() {
                        $(this).click(function() {
                            var _cid = $(this).attr('cid');
                            var _url = decodeURI(window.location.toString());
                            var _surl = (_url.indexOf('search') > -1) ? _url.replace('search', 'detailed') : (_url + 'detailed.html');
                            window.location = encodeURI(_surl + '?postid=' + _cid);
                        });
                    });
                });
                options.hist.prev().hide();
                options.hist.hide();
            };
        }
    };
} ());