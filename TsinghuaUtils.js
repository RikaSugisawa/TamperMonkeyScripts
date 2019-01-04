// ==UserScript==
// @name         TsinghuaUtil
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  An util for tsinghua students
// @author       Rika
// @match        http://zhjw.cic.tsinghua.edu.cn/*
// @match        http://zhjwxk.cic.tsinghua.edu.cn/*
// @match        http://learn.tsinghua.edu.cn/*
// @match        http://tsinghua.xuetangx.com/courses/*
// @match        http://www.prettychemeng.tsinghua.edu.cn/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        none
// ==/UserScript==

(function () {
        'use strict';
        //选课自动跳转登陆界面
        if (location.pathname === "/xk/ts.html") {
            location.href = "http://zhjwxk.cic.tsinghua.edu.cn/xsxk_index.jsp";
        }
        //选课登陆界面自动填写用户名密码、验证码自动大写
        //此处需要在localStorage中设置用户名和密码
        if (location.pathname === "/xklogin.do") {
            document.querySelector('#j_username').value = localStorage.getItem("username");
            document.querySelector('#j_password').value = localStorage.getItem("password");
            document.getElementsByName('_login_image_')[0].oninput = function () {
                document.getElementsByName('_login_image_')[0].value = document.getElementsByName('_login_image_')[0].value.toUpperCase()
            };
            document.getElementsByName('_login_image_')[0].focus();
            document.getElementsByName('_login_image_')[0].value = '';
            document.getElementsByName('_login_image_')[0].onkeypress = function (e) {
                if (e.key === 'Enter') doLogin();
            }
        }
        //选课登录超时跳转重新登录界面
        if (document.body.innerHTML.indexOf('超时') > 0 && location.hostname.split('.')[0] === 'zhjwxk') {
            location.href = "http://zhjwxk.cic.tsinghua.edu.cn/xsxk_index.jsp";
        }
        //自动登录网络学堂
        if (location.host === 'learn.tsinghua.edu.cn') {
            if (document.getElementsByClassName('error_c').length > 0)
                top.document.location = '/index.jsp';
            $('input[name="重新登录网络学堂"]').click();
            //此处需要在localStorage中设置用户名和密码
            $('input[name="userid"]').val(localStorage.getItem('username_'));
            $('input[name="userpass"]').val(localStorage.getItem('password_'));
            $('input[name="submit1"]').click();
        }
        //慕课平台视频自动播放、跳转
        if (location.host === 'tsinghua.xuetangx.com' && location.pathname.indexOf('/courses') === 0) {

            let video;
            let code = setInterval(function () {
                const a_tags = $('a[href^="' + location.pathname.split('courseware')[0] + 'courseware/"]');
                if (a_tags.length === 0) return;
                // const now_a_tag = $('a[href="' + location.pathname + '"]');

                if ((video = $('video')).length === 0) {
                    if ($('.seq_video').length === 0) {
                        for (let i = 0; i < a_tags.length; i++)
                            if (a_tags[i].href === location.toString()) {
                                $(a_tags[i + 1]).click();
                                break;
                            }
                        return;
                    }
                    else
                        return;
                }
                clearInterval(code);
                console.log(video);
                $('.xt_video_player_quality ul li').click()
                video[0].playbackRate = 10;
                video[0].autoplay = true;
                video[0].oncanplay = function () {
                    const play_btn = $('.xt_video_player_play_btn');
                    if (!play_btn.hasClass('xt_video_player_play_btn_pause'))
                        play_btn.click();

                };
                video[0].onended = function () {
                    const next_button = $('li.next a');
                    if (!next_button.hasClass('disabled'))
                        next_button.click();
                    else {
                        for (let i = 0; i < a_tags.length; i++)
                            if (a_tags[i].href === location.toString()) {
                                $(a_tags[i + 1]).click();
                                location.href = a_tags[i + 1].href;
                                break;
                            }
                    }
                };
            }, 1000);
        }
        //美丽化工视频播放修复
        if (location.host === 'www.prettychemeng.tsinghua.edu.cn') {
            $('.info-title')[0].onclick = function () {
                $('#play_pc').css('display', 'none');
                const play = $('#play_mobile');
                play.css('display', '');
                play.css('width', '100%');
                play.css('height', '100%');
            }
            // Your code here...
        }
    }
)();
