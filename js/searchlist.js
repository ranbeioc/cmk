/*
* Page: SearchList
* Date: 2012-11-14 15:42:11
* Chge: 2013-12-19 15:32:13
* Auth: ranbei@msn.com
*/

Array.prototype.delRepeat = function() {
    var newArray = [];
    var provisionalTable = {};
    for (var i = 0, item;
    (item = this[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
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
    var _urlTest = [];
    var _stdTest = [];

    var options = {};

    return {
        init: function(args) {

            options = {
                server : args.server,
                search : args.search,

                keywords : args.keywords,
                searchBtn : args.searchBtn,
                temps : args.temps,

                timeStart : 0,
                timeEnds : 0,

                pageTop : args.pageTop,
                pagetopnum : args.pagetopnum,
                topprv : args.topprv,
                topnext : args.topnext,
                topFrt : args.topFrt,
                btmEnd : args.btmEnd,

                pageindex : args.pageindex,
                seaInfo : args.seaInfo,
                pageAct : args.pageAct,
                logo : args.logo,
                ptool : args.ptool,

                aL: args.armL,
                aR: args.armR,
                bw6: function(){
                    if($.browser.msie && parseInt($.browser.version, 10) == 6){
                        return true;
                    }else{
                        return false;
                    };
                }
            };

            this.layterArms();
            this.events();
            this.pageSea();
        },
        events: function() {
            var _this = this;

            options.searchBtn.click(function() {
                var _key = options.keywords.val();
                if ($.trim(_key) == '') return;

                var _Aurl = decodeURI(window.location.toString());
                var _surl = _Aurl.slice(0, _Aurl.indexOf('=') + 1);
                window.location = _surl + $.trim(_key) + '&page=' + options.pageindex;
            });

            $(document).keydown(function(e) {
                if (e.keyCode == 13) {
                    options.searchBtn.trigger('click');
                    return false;
                };
            });

            options.topprv.click(function() {
                _this.changeUrl(_this, -1);
                return false;
            });
            options.topnext.click(function() {
                _this.changeUrl(_this, 1);
                return false;
            });
            options.topFrt.click(function() {
                _this.changeUrl(_this, null, 1);
                return false;
            });
            options.btmEnd.click(function() {
                _this.changeUrl(_this, null, $.jStorage.get('fpage_count'));
                return false;
            });
            options.logo.click(function() {
                //var _url = decodeURI(window.location.toString());
                //var _surl = _url.slice(0, _url.lastIndexOf('/') + 1);
                //window.location = encodeURI(_surl);
                window.location = 'search.html';
            });

            options.ptool.each(function() {
                $(this).click(function() {
                    var _a = ($(this).children())[0];
                    window.open($(_a).attr('href'));
                });
            });

            options.aL.click(function(){
                _this.changeUrl(_this, -1);
            });
            options.aR.click(function(){
                _this.changeUrl(_this, 1);
            });
            $(window).resize(function() {
                _this.layterArms();
            });
        },
        layterArms: function(){
            if(!options.bw6()){
                var _wh = ($(window).height() - 100) / 2;
                options.aL.css('top', _wh);
                options.aR.css('top', _wh);
            }else{
                options.aL.hide();
                options.aR.hide();
            };
        },
        changeUrl: function(_this, pagenum, all) {
            var _key = options.keywords.val();
            if ($.trim(_key) == '') return;
            var _url = decodeURI(window.location.toString());
            var _surl = _url.slice(0, _url.indexOf('=') + 1);
            var _key = _url.slice(_url.indexOf('keywords=') + 9, _url.indexOf('&page'));
            var _page = _url.slice(_url.indexOf('&page=') + 6);
            window.location = encodeURI(_surl + _key + '&page=' + (pagenum ? (_page * 1 + pagenum) : all));
        },
        pageSea: function() {
            var _url = decodeURI(window.location.toString());
            var _key = _url.slice(_url.indexOf('keywords=') + 9, _url.indexOf('&page'));
            var _page = parseInt(_url.slice(_url.indexOf('&page=') + 6), 10);
            document.title = _key + ' - 漫画控搜索';
            options.keywords.val(_key);
            this.ajaxDatas(options.server + options.search, _key, _page, this.searchFun);
        },
        ajaxDatas: function(url, keywords, page, dataFun) {
            var _this = this;
            var _url = url + '?keyphrase=' + keywords;
            var _pg = page ? 'page_index={0}'.format([page]) : '';

            $.jsonp({
                //type: "GET",
                url: _url + '&page_size=20&' + _pg + '&format=json-p&callback=?',
                //dataType: "jsonp",
                beforeSend: function() {
                    options.timeStart = _this.getTimes();
                },
                success: function(data) {
                    options.timeEnds = _this.getTimes();
                    options.pageAct.show();
                    options.aL.show();
                    options.aR.show();
                    dataFun(data, _this);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    _this.noData();
                    //_this.seaInfo.html(jqXHR.readyState + ' ' + jqXHR.status + ' ' + jqXHR.statusText +'<br />'+textStatus+'<br />'+ errorThrown);
                }
            });
        },
        noData: function() {
            options.pageAct.hide();
            options.aL.hide();
            options.aR.hide();
            options.temps.html('<li><p style="padding:200px 0px 200px 0px; font-size:16px; text-align:center;"><img src="img/nores.png" style="width:auto; height:auto; border:none; margin-bottom:15px;box-shadow:none;" /><br /><span id="seaInfo">哎呀！没有找到任何结果，或者不给力吔！再试试吧...</span></p></li>')
            options.keywords.trigger('focus');
        },
        getTimes: function() {
            var now = new Date();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            var milsecd = now.getMilliseconds();
            return [minute, second, milsecd];
        },
        
        searchFun: function(data, _this) {
            var seaAry = [];
            var _dats = data.comics;

            if (data.current_page == 1 && data.page_count == 1) {
                options.topnext.hide();
                options.topprv.hide();
                options.topFrt.hide();
                options.btmEnd.hide();
                options.aL.hide();
                options.aR.hide();
            } else if (data.current_page == 1) {
                options.topprv.hide();
                options.topFrt.hide();
                options.aL.hide();
            } else if (data.current_page == data.page_count) {
                options.topnext.hide();
                options.topprv.show();
                options.btmEnd.hide();
                options.aL.show();
                options.aR.hide();
            } else {
                options.topnext.show();
                options.topprv.show();
                options.aL.show();
                options.aR.show();
            };

            options.temps.empty();

            if (_dats.length > 0) {
                //v5.0
                for (var j = 0; j < _dats.length; j++) {
                    var _item = '<li index="{0}"><div class="pagevs"><img class="lazy" src="img/grey.gif" data-original="{1}" alt="{2}" /></div><div class="pageds"><a class="pagetlt" cid="{3}" href="javascript:void(0);">{4}</a><h3>[作者] {8} <br>[编号] {3} <br>[评级] {9}+<br>[评分] {10}（{11}人点评）<br>[更新] {12}</h3><h3>[简介]</h3><p class="dscs">{7}</p>'; /* <h3>[来源站点与剧集更新]</h3><div class="stdlinks">{6}</div><div class="stdepds">{5}</div></div><div class="pagergt"><h3>[来源站点参考速度]</h3><div class="speadtim"> */

                    var _name = _dats[j].comic_name;
                    var _nam = _name.length > 7 ? _name.replace(_name.slice(0,7), '...') : _name;
                    var _dc = _dats[j].description || '暂无简介信息哦！';
                    //var _dsc = _dc.length > 100 ? _dc.replace(_dc.slice(100), '...') : _dc;
                    var _ath = (_dats[j].comic_author == '' || _dats[j].comic_author == null) ? '还不知道是谁喔！' : '<a class="ath" href="#">' + _dats[j].comic_author + '</a>';

                    _item = _item.format([j, _dats[j].comic_cover, _name, _dats[j].comic_id, _name, '{0}', '{1}', _dc == '' ? '哎呀！没有找到简介信息吔！': _dc.toString(), _ath, _dats[j].rating, _dats[j].comic_score, _dats[j].comic_score_vote, _dats[j].last_update_date ? _dats[j].last_update_date : '待查询' ]);

                    /*
                    var _res = _dats[j].resources;
                    var _rmax = '';
                    var _rurl = '';
                    var _rste = '';
                    if(_res.length > 0){
                        for (var k = 0; k < _res.length; k++) {
                            _rmax += _res[k].max_episode_name + '<br />';
                            _rurl += '<a class="cres" url="{0}" cid="{2}" href="javascript:void(0);">{1}</a><br />'.format([_res[k].resource_url, _res[k].site.site_name.toUpperCase(), _res[k].resource_id]);

                            _urlTest.push(_res[k].site.site_url);

                            _rste += '<span idx="{0}" std="{1}" class="speed">正在测试中...</span><br />'.format([k, _res[k].site.site_id]);

                            _stdTest.push(_res[k].site.site_id);

                        };
                        
                    }else{
                        _rmax = '现在没有任何剧集吔！';
                        _rurl = '<a href="javascript:void(0);">现在没有吔！</a>';
                        _rste = '<span class="speed">现在没有任何站点吔！</span>';

                    };
                    */
                    //seaAry.push(_item.format([_rmax, _rurl]) + _rste + '</div></div></li>');

                    options.temps.append(function(i,t){
                        var _li = _item + '</li>';/* </div></div> */
                        return $(_li).show();
                    });

                };

                //options.temps.html(seaAry.join(''));

                $("img.lazy").lazyload({
                    effect: "fadeIn",
                    threshold: 50,
                    failure_limit: 10,
                    appear: function(){
                        if($(this).attr('src').indexOf('grey.gif') > -1){
                            $(this).attr('src', 'img/nopic.png');
                        };
                    }
                });

                options.temps.children('li').each(function() {
                    $(this).hover(function() {
                        $(this).css('background-color', '#fffff4');
                    },
                    function() {
                        $(this).css('background-color', '#fff');
                    });
                });

                //_this.getURLTest(_urlTest.delRepeat(), _stdTest.delRepeat());

                $('a.pagetlt').each(function() {
                    $(this).click(function() {
                        var cid = $(this).attr('cid');
                        if(cid){
                            var _url = decodeURI(window.location.toString());
                            var _surl = _url.slice(0, _url.indexOf('?'));

                            //$.jStorage.set('fpage_tlt', $(this).text());

                            window.open(encodeURI( _surl.replace('searchlist', 'oc_pc') + '?comic_id=' + cid ));
                            
                            //window.location = _surl.replace('searchlist', 'detailed') + '?postid=' + cid;

                            return false;
                        };
                    });
                });

                $('a.cres').each(function() {
                    $(this).click(function() {
                        var cid = $(this).attr('cid');
                        var _url = decodeURI(window.location.toString());
                        var _surl = _url.slice(0, _url.indexOf('?'));

                        //$.jStorage.set('fpage_tlt', $(this).parent().prevAll('a.pagetlt').text());

                        window.open(encodeURI(_surl.replace('searchlist', 'detailed') + '?postid=' + cid));

                        return false;
                    });
                });

                $('a.ath').each(function(){
                    $(this).click(function() {
                        var _Aurl = decodeURI(window.location.toString());
                        var _surl = _Aurl.slice(0, _Aurl.indexOf('=') + 1);
                        window.location = _surl + $(this).text() + '&page=' + options.pageindex;

                        return false;
                    });
                });

                /*$('div.pagergt').each(function() {
                    var _left = $(this).prev();
                    var _h3 = _left.children('h3:eq(1)').outerHeight();
                    var _lik = _left.children('.stdlinks').outerHeight();
                    $(this).children('h3:first').css('padding-top', _left.outerHeight() - _h3 - _lik);
                });*/
            } else {
                _this.noData();
            };

            var _time = parseFloat((options.timeEnds[0] - options.timeStart[0]) * 60 + (options.timeEnds[1] - options.timeStart[1]) + (options.timeEnds[2] - options.timeStart[2]) / 1000, 10);
            var _pages = '共找到 ' + data.comic_count + ' 条结果 用时 ' + (_time.toString()).substring(0, 4) + ' 秒';
            var _pagenum = '第 ' + data.current_page + '/' + data.page_count + ' 页';

            $.jStorage.set('fpage_count', data.page_count);

            options.pageTop.text(_pages);
            options.pagetopnum.text(_pagenum);

        }
    };
} ());