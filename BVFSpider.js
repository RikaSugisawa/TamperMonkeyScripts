// ==UserScript==
// @name         志愿北京服务时长统计
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  一个同时组内成员服务时长的小工具
// @author       Rika
// @match        http://www.bv2008.cn/app/org/member.php
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var peoples = {};
    var num_pages = Number.parseInt($('.ptpage')[0].innerHTML);
    window.peoples = peoples;
    window.query_all = query_all;
    var action_button = $('<button id="query-all" class="but2">查询所有人员志愿工时</button>');
    var progress_bar = $('<progress id="prb" max="' + num_pages + '" value="0"></progress>');
    var download_link = $('<a href="#" download="data.csv">下载csv数据</a>');

    action_button.click(window.query_all);
    progress_bar.insertAfter('#search_form');
    action_button.insertAfter('#search_form');

    function query_all() {
        for (var i = 1; i <= num_pages; i++) {
            $.get('/app/org/member.php?&p=' + i)
                .then(function (body, code, res) {
                    if (code === 'success') {
                        progress_bar[0].value++;
                        var _html = $.parseHTML(body);
                        var _p = $('[href^="/app/sys/view.vol.php?uid="]', _html);
                        progress_bar[0].max += _p.length;
                        for (var j = 0; j < _p.length; j++) {
                            (function () {
                                var _uid = _p[j].href.split('?uid=')[1];
                                var _name = _p[j].innerText;//todo
                                var personal_activities = [];
                                peoples[_uid] = [_name, personal_activities];
                                $.get('/app/sys/view.vol.php?type=hour&uid=' + _uid)
                                    .then(function (body, code, res) {
                                        progress_bar[0].value++;
                                        if (code === 'success') {
                                            var _html = $.parseHTML(body);
                                            var _pages = Number.parseInt($('.ptpage', _html)[0].innerText);
                                            progress_bar[0].max += _pages;
                                            for (var k = 1; k <= _pages; k++) {
                                                $.get('/app/sys/view.vol.php?type=hour&uid=' + _uid + '&p=' + k)
                                                    .then(function (body, code, res) {
                                                        progress_bar[0].value++;
                                                        if (code === 'success') {
                                                            var _html = $.parseHTML(body);
                                                            var _tr = $('tr', _html);
                                                            progress_bar[0].max += _tr.length - 1;
                                                            for (var l = 1; l < _tr.length; l++) {
                                                                progress_bar[0].value++;
                                                                if ($(_tr[l]).find('td:nth-child(4)')[0].innerText === '已生效')
                                                                    peoples[_uid][1].push([$(_tr[l]).find('td:nth-child(2)')[0].innerText,
                                                                        $(_tr[l]).find('td:nth-child(5)')[0].innerText]);
                                                                progress_change()
                                                            }
                                                        } else {
                                                            console.log(res.statusText)
                                                        }
                                                    })
                                            }
                                        } else {
                                            console.log(res.statusText)
                                        }
                                    })
                            })();
                        }
                    } else {
                        console.log(res.statusText)
                    }
                })
        }

    }

    function progress_change() {
        if ($('#prb')[0].value < $('#prb')[0].max) return;
        var rs_str = 'data:text/csv;charset=utf-8,\ufeff';
        for (var p in window.peoples) {
            if (!window.peoples.hasOwnProperty(p)) continue;
            var _ = '';
            for (var t in window.peoples[p][1]) {
                if (!window.peoples[p][1].hasOwnProperty(t)) continue;
                _ += window.peoples[p][0] + ',' + window.peoples[p][1][t][0] + ',' + window.peoples[p][1][t][1] + '\n';
            }
            rs_str += encodeURIComponent(_);
        }
        download_link[0].href = rs_str;
        download_link.insertAfter('#prb');
    }

    // Your code here...
})();
