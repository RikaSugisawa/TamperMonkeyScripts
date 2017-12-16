// ==UserScript==
// @name         OneKeyScore
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://zhsjk.e21.cn/score/teaScore.html
// @grant        none
// @require      https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @require      https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==
var first=true;
(function() {
    'use strict';
    $('head').prepend('<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">');
    //$('body').prepend('<button onclick="init()">Click</button>');
    // Your code here...
})();
waitForKeyElements('.red12[href^=edit]',init,true);
function init(){
    if(!first)return 0;
    first=false;
    var lnks=$('.red12[href^=edit]');
    var matte=[];
    for (var i=0;i<lnks.length;i++){
        var mhref=lnks[i].href;
        matte.push([lnks[i],mhref,parseInt(mhref.match(/\?t=(\d)&/)[1]),mhref.match(/&id=(\d*)$/)[1]]);
    }
    console.log(matte);
    for(i=0;i<matte.length;i++){
        $.get('http://zhsjk.e21.cn/score/teaGetScore.action?id='+matte[i][3]+'&t='+matte[i][2],callbackGet(matte,i));
    }
}
function callbackGet (matte,i){
    return function (data){
        var info=$.parseJSON(data);
        //console.log(data);
        var maxsc;
        if(matte[i][2]==1){maxsc=6;}else{maxsc=2;}
        var sendUrl='http://zhsjk.e21.cn/score/saveScore.action';
        var send={
            type:info.type,
            subid:info.subid,
            state:info.state,
            slist:[]
        };
        for(var stu=0;stu<info.stuList.length;stu++ ){
            send.slist.push({
                id:info.stuList[stu].id,
                xjsbm:info.stuList[stu].xjsbm,
                lev:'A',
                sc:maxsc
            });
        }
        $.post(sendUrl,{data:encodeURI(JSON.stringify(send))},callbackPost(i,matte,info));
    };
}
function callbackPost(i,matte,info){
    return function(data){
        var rs=$.parseJSON(data);
        var rs_out=[];
        if(rs.result=="1"){
            for(var j=0;j<rs.slist.length;j++){
                if(rs.slist[j].chk==1){
                    rs_out.push({
                        name:info.stuList[j].xm,
                        project:info.title,
                        state:"成功"
                    });
                }else{
                    rs_out.push({
                        name:info.stuList[j].xm,
                        project:info.title,
                        state:"失败",
                        err:rs.slist[j].err
                    });
                }
            }
        }
        var err_str="";
        var ok=true;
        for(var j=0;j<rs_out.length;j++)
            if(rs.slist[j].chk==0){ok=false;}
        var id=Math.random();
        if(ok){
            $('html').prepend('<div id="'+info.subid+'" class="alert alert-success h5" role="alert"><b>'+rs_out[0].project+'</b> 认定学分成功</div>');
            $('.red12[href$='+info.subid+']').parent().parent().css('background','#3c763d33');
            $.get('http://zhsjk.e21.cn/score/toSch.action?id='+info.subid+'&t='+matte[i][2],callbackCommit(i,matte,info));
        }else{
            $('html').prepend('<div id="'+info.subid+'" class="alert alert-danger h5" role="alert"><b>'+rs_out[0].project+'</b> 认定学分失败</div>');
            $('.red12[href$='+info.subid+']').parent().parent().css('background','#a9444233');
        }

        $('#'+info.subid).fadeOut(5000);

    };
}
function callbackCommit(i,matte,info){
    return function (data){
        var rsdata=$.parseJSON(data);
        var ok=(rsdata.result=="1");
        if(ok){
            $('html').prepend('<div id="'+info.subid+'" class="alert alert-success h5" role="alert"><b>'+info.title+'</b> 提交学校成功</div>');
            $('.red12[href$='+info.subid+']').parent().parent().css('background','#3c763d33');
        }else{
            $('html').prepend('<div id="'+info.subid+'" class="alert alert-danger h5" role="alert"><b>'+info.title+'</b> 提交学校失败,'+rsdata.msg+'</div>');
            $('.red12[href$='+info.subid+']').parent().parent().css('background','#a9444233');
        }
    };
}
