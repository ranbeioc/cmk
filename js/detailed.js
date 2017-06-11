/*
* Page: detailed
* Date: 2012.06.24 21:08:20
* Auth: ranbei@msn.com
*/
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
        };
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
                comics : args.comics,
                episodes : args.episodes,
                surl : args.surl,

                keywords : args.keywords,
                searchBtn : args.searchBtn,
                temps : args.temps,
                epds : args.epds,
                seaInfo : args.seaInfo,

                logo : args.logo,
                favLink : args.favLink,
                desc : args.desc,

                ptool : args.ptoo,
                ctk : args.ctk
            };

            this.getDatas();
            this.events();
        },
        getDatas: function() {
            var _url = decodeURI(window.location.toString());
            var _cid = _url.slice(_url.lastIndexOf('postid=') + 7);

            //var _comicTemp = $.jStorage.get('_comicTemp');
            //var _ctk = options.ctk;
            //_ctk.html("<script type='text/javascript' charset='utf-8' src='http://open.denglu.cc/connect/commentcode?appid=59038denlmZkpgohMzu8IYP48MX8t6&postid=" + _cid + "'></script>");

            var _comic = options.server + options.comics + _cid + '/';
            var _epdes = _comic + options.episodes.slice(1);

            //document.title = $.jStorage.get('fpage_tlt') + ' - 漫画控搜索';

            this.ajaxDatas(_comic, _cid, this.comicFun);

            this.ajaxDatas(_epdes, _cid, this.epdsFun);
        },
        noData: function() {
            options.seaInfo.text('哎呀！没有发现结果，或者不给力吔！再试试吧...');
            options.keywords.trigger('focus');
        },
        events: function() {
            var _this = this;
            options.searchBtn.click(function() {
                var _key = options.keywords.val();
                if ($.trim(_key) == '') return;

                var _url = window.location.href;
                var _surl = _url.slice(0, _url.indexOf('.html') + 5);
                window.location = encodeURI(_surl.replace('detailed', 'searchlist') + '?keywords=' + $.trim(_key) + '&page=1');
            });

            options.logo.click(function() {
                //var _url = decodeURI(window.location.toString());
                //var _surl = _url.slice(0, _url.lastIndexOf('/') + 1);
                //window.location = encodeURI(_surl);
                window.location = 'search.html';
            });

            $(document).keydown(function(e) {
                if (e.keyCode == 13) {
                    options.searchBtn.trigger('click');
                    return false;
                };
            });
        },
        ajaxDatas: function(url, cid, dataFun) {
            var _this = this;

            $.jsonp({
                //type: "GET",
                url: url + '?format=json-p&callback=?',
                //dataType: "jsonp",
                //beforeSend: function() {},
                success: function(data) {
                    dataFun(data, _this);
                },
                error: function() {
                    _this.noData();
                }
            });
        },
        comicFun: function(_datas, _this) {
            var _dats = _datas.comic;
            var _item = '<div class="pagevs"><img class="lazy" src="img/grey.gif" data-original="{2}" alt="{3}" /></div><div class="pageds"><a class="pagetlt" cid="{1}" href="{4}" target="_blank" title="{7}">{3}</a><p>漫画作者：{8}</p><p>更新剧集：{6}</p><p>来源网站：{5}</p></div><div class="pagergt"></div>';
            var _name = _dats.comic_name, _epn = _datas.max_episode_name;
            var _nam = _name.length > 6 ? _name.replace(_name.slice(6), '...') : _name;
            var _esp = _epn.length > 7 ? _epn.replace(_epn.slice(6), '...') : _epn;
            var _ath = (_dats.comic_author == '' || _dats.comic_author == null) ? '还不知道是谁喔！' : '<a class="ath" href="#">' + _dats.comic_author + '</a>';

            _item = _item.format([0, _dats.comic_id, _dats.comic_icon, _name, _datas.resource_url, _datas.site.site_name.toUpperCase(), _epn, _name, _ath]);
            options.temps.html(_item);

            document.title = _name + ' - 漫画控搜索';

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

            $('a.ath').click(function() {
                var _Aurl = decodeURI(window.location.toString());
                var _surl = _Aurl.slice(0, _Aurl.indexOf('=') + 1).replace('detailed','searchlist');

                window.location = _surl.replace('postid','keywords') + $(this).text() + '&page=1';

                return false;
            });

            options.favLink.val(_datas.resource_url);
            var _dsc = _dats.description.replace(/[\r\n]+/g, "<br />");
            options.desc.html(_dsc == '' ? '哎呀！没有找到简介信息吔！': _dsc);

            var _hit = $.jStorage.get('_history');

            var _his = '<li cid="{4}"><img class="lazy" src="img/grey.gif" data-original="{0}" alt="{1}" /><br /><a>{2}</a><br /><span>{3}</span></li>'
            _his = _his.format([_dats.comic_icon, _name, _nam, _esp, _dats.comic_id]);

            if (_hit == null) {
                $.jStorage.set('_history', _his + ',');
            } else if (_hit.indexOf(_dats.comic_id) == -1) {
                var _hitAry = _hit.split(',');
                if (_hitAry[_hitAry.length - 1] == "") {
                    _hitAry.pop();
                };
                _hitAry.push(_his);
                $.jStorage.set('_history', _hitAry.join(','));
            };
        },
        epdsFun: function(data, _this) {
            var _epds = [];

            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var _item = '<a class="p" href="{1}" target="_blank" title="{2}" sid="{3}" eid="{4}">{0}</a>';
                    _item = _item.format([data[i].episode_name, data[i].episode_url, '共' + data[i].pagecount + '页', data[i].sid, data[i].episode_id]);
                    _epds.push(_item);
                };
                options.epds.html(_epds.reverse().join(''));
            }else{
                options.epds.html('<div>没有找到任何剧集吔！去其它站点看看吧！</div>');
            };
        }
    };
} ());