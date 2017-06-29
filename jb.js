var $loadMore = $('#loadMore');
var $noMore = $('#noMore');
var $listBox = $('#recordBox .p-ul');
var $lotteryBox = $('#lotteryBox');
var resultData,
  postData = {
    apo_id: 0
  };
var $moneyBox = $('#moneyBox');
var $recordBox = $('#recordBox');
var prizeInfoStr = '<div class="p-li">\n  <div class="li-left">\n    <img src="[IMG]">\n  </div>\n  <div class="li-rigth">\n    <p class="li-p1">[NAME]</p>\n    <p class="li-p2">联系方式: [ADDRESS]</p>\n    <p class="li-p3">有效期：[START] 至 [END]</p>\n  </div>\n</div>';
var moneyInfoStr = '<div class="p-li">\n  <div class="li-left">\n    <img src="../act/imgs/red_pack.png">\n  </div>\n  <div class="li-rigth">\n    <p class="li-p1">现金红包</p>\n    <p class="li-p2">[MONEY]元</p>\n    <p class="li-p3">现金红包已经发到您的微信</p>\n  </div>\n</div>';
var prizePagin = {offset: 0, limit: 10};
var B = 0.56;
var C = 0.66;
var canvasW = window.innerWidth;
//var canvasH = canvasW/B;
var canvasH = window.innerHeight;
if(canvasH > window.innerHeight) canvasH = window.innerHeight;
var canvasObj = $('#canvas');
canvasObj.css('margin-top',(window.innerHeight-canvasH)/2);
canvasObj.attr('width',canvasW);
canvasObj.attr('height',canvasH);
var ca=document.getElementById("canvas");

var ctx=ca.getContext("2d");
var bj1=new Image();

var player=new Image();
var coin=new Array();

bj1.src="../sprize/images/bj.jpg";
player.src="../sprize/images/ren.png";
var playerWidth =187*C;
var playerHeight =279*C;

var h=20;
var gk=1;
var sudu=10;
var zl=100;
var chi=0;
var shi=0;
var fs=0;
var sm=1;
var bj=bj1;
function object(){
  this.x=0;
  this.y=0;
  this.l=11;
  this.image=new Image();
}
var sprite=new object();
sprite.x=0;                                //人的坐标
sprite.y=canvasH-playerHeight-canvasH*0.13;
sprite.image=player;
var beginTime = new Date();
var gameTime = 15;
var remainTime;
var range = canvasW - 60*B;
var device = /android|iphone|ipad|ipod|webos|iemobile|opear mini|linux/i.test(navigator.userAgent.toLowerCase());
var startEvtName = device?"touchstart":"mousedown";
var moveEvtName = device?"touchmove":"mousemove";
var endEvtName = device?"touchend":"mouseup";
ca.addEventListener(startEvtName,function(){
    ca.addEventListener(moveEvtName,scratch,false);
},false);

ca.addEventListener(endEvtName,function(){
    ca.removeEventListener(moveEvtName,scratch,false);
},false);
$(function(){
    timer();
    var box = $('#box');
    box.css('width',window.innerWidth);
    box.css('height',window.innerHeight);
  $('#zj_chaxun').on('click', function () {
    $listBox.empty();
    prizePagin.offset = 0;
    $loadMore.show();
    $noMore.hide();
    loadMoreList();
    $recordBox.show();
  });
  $loadMore.on('click', function () {
    loadMoreList();
  });
  /* 关闭中奖纪录 */
  $('#recordBox .p-close').on('click', function () {
    $recordBox.hide();
  // shakePrize();
  });
   /* 放弃领奖 */
  $lotteryBox.find('.lose-prize').on('click', function () {
    utils.Dialog.confirm('提示', '确定要放弃领奖吗？', '否', '是').then(function (result) {
      if (result) {
        $lotteryBox.hide();
        losePrize();
        reenter = 1;
        timer();
      }
    });
  });
  /* 填写中奖信息 */
  $lotteryBox.find('.get-prize').on('click', function () {
    window.location.href = '../v/?act&r&i&a=' + postData.apo_id + '&appid=' + utils.queryString().appid;
  });
  /* 关闭中奖信息 */
  $lotteryBox.find('.ok-btn').on('click', function () {
    $lotteryBox.hide();
    reenter = 1;
  });
  /* 关闭中奖红包框 */
  $moneyBox.find('.m-btn').on('click', function () {
    $moneyBox.hide();
    reenter = 1;
    timer();
  });

});

function scratch(event){             //手指滑动小人
    var xi = device?event.touches[0].clientX:event.clientX;
    var yi = device?event.touches[0].clientY:event.clientY;
    sprite.x=xi-playerWidth/2;
    if(sprite.x+playerWidth>=canvasW) sprite.x=canvasW-playerWidth;
    else if(sprite.x<=0) sprite.x=0;
}
//金币生产
function productCoin(){
    if(shi%h==0){                                //20次执行一次
        for(var j=1*chi;j<1*(chi+1);j++){         //每次增加两个金币
            coin[j]=new object();
            var i=Math.round(Math.random()*range);
            if(j==1*chi+1)                                     //第偶数个金币x坐标离上一个奇数个金币x坐标距离不小于30
            {
                while(Math.abs(i-coin[1*chi].x)<100){
                    i=Math.round(Math.random()*range);
                }
            }
            var k=Math.round(Math.random()*zl);        //三种金币降落的概率
            if(k < 33){
                coin[j].image.src="../sprize/images/1.png";
                coin[j].q = 1;
            }else if(k < 66 && k > 33){
                coin[j].image.src="../sprize/images/2.png";
                coin[j].q = 2;
            }else if (k >66){
                coin[j].image.src="../sprize/images/3.png";
                coin[j].q = 3;
            }
            coin[j].x=i;
            coin[j].y=-Math.round(Math.random()*300);
        }
        chi++;
        if(chi==10) chi=0;
    }
    shi++;               //每一秒钟加1
}
//速度控制
function controlSpeed(){
        h=200;                        //h由20变为5
        sudu=2;
}

function draw(){
    controlSpeed();
    productCoin();
    for(var i=0;i<coin.length;i++){
        if(getCoin(sprite,coin[i])) {            //接到金币加分
          
            if(coin[i].q == 1){
                 //分数加1
            }else if(coin[i].q == 2){
                shakePrize();
            }else{
                shakePrize();
            }
            coin[i].y+=400;
        }else if(!getCoin(sprite,coin[i])){             //没接到金币加速
            //ctx.drawImage(coin[i].image,tu[i].x,tu[i].y,60*B,60*B);
            coin[i].y+=sudu;
        }
        var cwidth = coin[i].image.width;
        var cheight = coin[i].image.height;
        ctx.drawImage(coin[i].image,coin[i].x,coin[i].y,cwidth*B,cheight*B);
    }
}

function getCoin(sprite,coin){     //判断金币是否接到
    var c=sprite.x-coin.x;
    var d=sprite.y-coin.y;
    if(c < 0 && c>-sprite.image.width*C+coin.image.width*B  && d<0 && d>-sprite.image.height*C+coin.image.height*B){
        return true;        //x,y分别满足条件显示成功加分跳转加分函数
    }else{
        return false;          //金币速度加快     
    }
}

function stop(){
    clearInterval(interval);
}

function timer(){
  interval = setInterval(function(){
    ctx.clearRect(0,0,canvasW,canvasH);
    ctx.drawImage(bj,0,0,canvasW,canvasH);
    ctx.drawImage(sprite.image,sprite.x,sprite.y,playerWidth,playerHeight);
    draw();
    //checkTime();
    //if(remainTime==0) {stop()}
  },10);
}


/* 放弃领奖 */
function losePrize() {
  utils.ajaxJson('../v/?activity_pc&act_cfg3&quitPrize', 'GET', {a: postData.apo_id}).then(function (result) {
    if (result.isSuccess) {
      utils.Tip.show('弃奖成功！', 2);
    }
  });
}

function shakePrize() {
    utils.ajaxJson('../v/?activity_pc&act_cfg3&responseToUser', 'POST', null, {
      entrance: 1,
      info: ''
    }).then(function (result) {
      if (result.isSuccess) {
        resultData = result.data;
        /* 当前没有摇奖活动 */
        if (result.data.returnCode) {
          utils.Dialog.alert('提示', result.data.returnCode);
          return;
        }
        /* 当前有摇奖活动 */
        if (result.data.prizeInfo) {
          var prizeInfo = result.data.prizeInfo;

          postData.apo_id = prizeInfo.apo_id;

          /* 奖品类型(1,商户实体券,2随机红包,3定额红包) */
          if (prizeInfo.type == 1) {
            console.log("1");
            showLotteryBox(prizeInfo.extra);
          } else if (prizeInfo.type == 2) {
             console.log("2");
            // alert('恭喜你中了现金' + prizeInfo.extra.redpacketValue + '元');
            showMoneyBox(prizeInfo.extra.redpacketValue, result.data.extra.cutomer);
          } else if (prizeInfo.type == 3) {
             console.log("3");
            showMoneyBox(prizeInfo.extra.redpacketValue, result.data.extra.cutomer);
          }
          /* 判断用户是否需要登记，如果不需要则不用跳转。 */
          if(result.data.extra.redis == ''){
            $('.get-prize').hide();
            $('.ok-btn').show();
          }else{
            $('.get-prize').show();
            $('.ok-btn').hide();
          }
          showOppos(result.data.extra.leftInTimes);

        }
      }
    });
}

function showLotteryBox(extra) {
    $lotteryBox.find('.p-img img').attr('src', extra.img);
    $lotteryBox.find('.p-date').text('有效期：' + extra.goods_period_start + '至' + extra.goods_period_end);
    $lotteryBox.find('.p-name').text('恭喜你摇中“' + extra.goods_name + '”奖品！');
    $lotteryBox.show();
    stop();
}

function showMoneyBox(money, cutomer) {
    /*cutomer:*/
    $moneyBox.find('.m-count').html((+money) / 100 + '<span>元</span>');
    $moneyBox.find('.m-tips').html('本红包由' + cutomer + '提供');
    $moneyBox.show();
    stop();
}

function loadMoreList() {
  utils.ajaxJson('../v/?act&yj&getWinningRecord', 'POST', null, prizePagin).then(function (result) {
    // console.log(result);
    if (result.isSuccess) {
      /* 判断是否有更多数据 */
      prizePagin.offset += prizePagin.limit;
      if (prizePagin.offset >= result.data.total) {
        $loadMore.hide();
        $noMore.show();
      }

      $.each(result.data.rows, function (index, item) {
        if (+item.apo_prize_id > 0) {
          // 商户券
          $listBox.append(prizeInfoStr.replace('[IMG]', item.prize_info.img)
            .replace('[NAME]', item.prize_info.goods_name)
            .replace('[ADDRESS]', item.prize_info.goods_address)
            .replace('[START]', item.prize_info.goods_period_start)
            .replace('[END]', item.prize_info.goods_period_end));

        } else if (+item.apo_prize_id == -1) {
          // 随机红包
          $listBox.append(moneyInfoStr.replace('[MONEY]', +item.prize_info.mpr_value / 100));
        } else if (+item.apo_prize_id == -2) {
          // 定额红包
          $listBox.append(moneyInfoStr.replace('[MONEY]', (+item.prize_info.mpp_prize_info) / (+item.prize_info.mpp_prize_num * 100)));
        }
      });
    }
  });
}

function showOppos(num) {
    var yy_count = num;
    if (yy_count > -1 && yy_count < 100) {
      $('.headjis').html('您还有<span>' + yy_count + '</span>次摇奖机会');
    }
    if (yy_count > -1 && yy_count < 11) {
      var t = 'top_' + yy_count;
      var b = 'bottom_' + yy_count;
      $('#top_num').attr('class', t + ' num91 num19');
      $('#bottom_num').attr('class', b + ' num91');
      $('#top_num_r').attr('class', '');
      $('#bottom_num_r').attr('class', '');
    }

    else if (yy_count > 10 && yy_count < 100) {
      //console.log(yy_count);
      var s = yy_count.toString();
      var le = s.substr(0, 1);
      var ri = s.substr(1);
      var t1 = 'top_' + le;
      var b1 = 'bottom_' + le;
      var t2 = 'top_' + ri;
      var b2 = 'bottom_' + ri;
      $('#top_num').attr('class', t1 + ' num91 num19');
      $('#bottom_num').attr('class', b1 + ' num91');
      $('#top_num_r').attr('class', t2 + ' num91 num19');
      $('#bottom_num_r').attr('class', b2 + ' num91');
      if (ri == '7' || ri == '3' || ri == '9') {
        $('#top_num_r').addClass('left20');
        $('#bottom_num_r').addClass('left20');
      }
    }
    else if (yy_count > 99) {
      $('.headjis').html('');
      $('#top_num').attr('class', 'top_max');
      $('#bottom_num').attr('class', 'bottom_max');
    }
}