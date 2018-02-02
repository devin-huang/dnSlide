(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node / CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function ($) {

    'use strict';
    /* Defind Plugin */
    var _PLUGIN_    = 'dnSlide';
    var _VERSION_   = '1.0.0';

    if ( $[ _PLUGIN_ ] && $[ _PLUGIN_ ].version > _VERSION_ )
    {
        return;
    }

    /* Init Object */
    $[_PLUGIN_] = function($container,options){
        var self = this ;
        this.container = $container ;
        this.options   = options ;
        this.api       = [ "init", "destroy", "hide", "show"];
        this.init();
        return this ;
    };

    $[_PLUGIN_].version = _VERSION_;

    $[_PLUGIN_].defaults = {
        "isOddShow" : false ,          //偶数时是否复制一张，默认是需要复制防止错位
        "width"     : 800,             //dnSlide Total Width
        "height"    : 234,             //dnSlide Total Height
        "dnSlideFirstWidth" : 600,      //First Picture Width
        "dnSlideFirstHeight" : 234,     //First Picture Height
        "autoPlay"  : false,
        "delay"     : 5000,
        "scale"     : 0.9,
        "speed"     : 500,
        "verticalAlign" : "middle",
        "afterClickBtnFn" : null ,
    }; 

    /* Prototype Function */
    $[_PLUGIN_].prototype = {
        init : function (){
            var _this_ = this ;

            this.data();
            this.settingDOM();  
            this.isIE7 = /MSIE 6.0|MSIE 7.0/gi.test(window.navigator.userAgent);

            this.dnSlideItems = this.container.find('ul.dnSlide-list');
            this.firstItem   = this.container.find('ul.dnSlide-list > li:first-child');
            this.dnSlideItemsLength = this.container.find('ul.dnSlide-list>li').length;
            this.dnSlideFirstItem = this.container.find('ul.dnSlide-list>li:first-child');
            this.dnSlideLastItem = this.container.find('ul.dnSlide-list>li:last-child');
            if(this.options.isOddShow) this.isEvenPicNum();
            
            this.prevBtn = this.container.find('.dnSlide-left-btn');
            this.nextBtn = this.container.find('.dnSlide-right-btn');

            this.prevBtn =  this.container.find('div.dnSlide-left-btn');
            this.nextBtn =  this.container.find('div.dnSlide-right-btn');
            this.rotateFlag = true;

            this.countSettingValue();
            this.setPositionValue();

            this.prevBtn.off().on('click', function(event) {
                event.stopPropagation();
                var afterClickPrevBtn = _this_.options.afterClickPrevBtnFn;
                if(_this_.rotateFlag){
                    _this_.rotateFlag = false;
                    _this_.dnSlideRotate('right');
                }
                if( typeof afterClickPrevBtn === "function" && afterClickPrevBtn ) afterClickPrevBtn();
            });
            this.nextBtn.off().on('click', function(event) {
                event.stopPropagation();
                var afterClickNextBtn = _this_.options.afterClickNextBtnFn;
                if(_this_.rotateFlag){
                    _this_.rotateFlag = false;
                    _this_.dnSlideRotate('left') ;  
                }
                if( typeof afterClickNextBtn === "function" && afterClickNextBtn ) afterClickNextBtn();
            });

            if(this.options.autoPlay){
                this.autoPlay();
                this.container.hover(function(){
                    clearTimeout(_this_.timer);
                },function(){
                    _this_.autoPlay();
                });
            }
        },
        data : function(){
            var data = this.container.data(_PLUGIN_);   
            if(!data ) {
                this.container.data(_PLUGIN_, {
                   target : this.container,
                });
            }
        },
        destroy : function()
        {
            this.container.empty().html(this.defalutHtml);
        },
        hide : function(callback)
        {
            this.container.addClass('dnSlide-hide');
            if( callback && typeof callback === "function" ) callback();
        },
        show : function(callback)
        {
            this.container.removeClass('dnSlide-hide');
            if( callback && typeof callback === "function" ) callback();
        },    
        settingDOM : function (){
            var _this_ = this ;
            this.defalutHtml = this.container.html();

            this.resourceSrcArr = this.container.find('img').map(function(i,e){return e.src;});
            var ulDOM = this.container.html('<ul class="dnSlide-list"></ul>').find('.dnSlide-list');

            jQuery.each(this.resourceSrcArr , function(i,e){
                ulDOM.append('<li class="dnSlide-item"><a href="javascript:void(0)"><img src="'+_this_.resourceSrcArr[i]+'" width="100%"></a></li>');
            });
            ulDOM.parents('.dnSlide-main').append("<div class='dnSlide-btn dnSlide-left-btn'></div>","<div class='dnSlide-btn dnSlide-right-btn'></div>");
        },
        //是否带有自定义设置
        getCustomSetting : function(){
            var setting = this.setting ;
            if(setting && setting !== ""){
                return setting;
            }else{
                return {};
            }
        },
        //设置默认值主要是为了当用户修改默认属性后CSS也相对调整
        countSettingValue : function(){
            this.container.css({
                "width": this.options.width,
                "height": this.options.height
            });

            this.firstItem.css({
                "width": this.options.dnSlideFirstWidth,
                "height": this.options.dnSlideFirstHeight
            });

            this.prevBtn.css({
                "width": (this.options.width - this.options.dnSlideFirstWidth)/2,
                "height": this.options.height
            });

            this.nextBtn.css({
                "width": (this.options.width - this.options.dnSlideFirstWidth)/2,
                "height": this.options.height
            });

            this.dnSlideFirstItem.css({
                "left": (this.options.width - this.options.dnSlideFirstWidth)/2,
                "zIndex": Math.floor(this.dnSlideItemsLength/2)
            });

        },
        //设置默认加载进来时所有图片对应的位置
        setPositionValue : function(){
            var self_ = this ,
                level = Math.floor(this.dnSlideItemsLength/2) ,
                items = this.container.find('.dnSlide-list > li').slice(1),
                leftItems = items.slice( 0 , items.length/2 ),
                rightItems = items.slice( items.length/2 ),
                optionImgLeft = (this.options.width - this.options.dnSlideFirstWidth) / 2 ,
                gap = optionImgLeft / level,
                dw = this.options.dnSlideFirstWidth,
                dh = this.options.dnSlideFirstHeight;
 
            leftItems.each(function(i,e){
                dw *= self_.options.scale;
                dh *= self_.options.scale;
                var j = i ;
                $(e).css({
                    "width" : dw,
                    "height" : dh,
                    "zIndex" : --level, 
                    "opacity" : 1/(++j),
                    "left" : optionImgLeft + self_.options.dnSlideFirstWidth + ((++i) * gap ) - dw ,
                    "top" :  self_.settingVerticalAlign(dh)
                });
            });

            var rw = leftItems.last().width(),
                rh = leftItems.last().height(),
            oloop = Math.floor(this.dnSlideItemsLength/2);

            rightItems.each(function(i,e){

                $(e).css({
                    "width" : rw,
                    "height" : rh,
                    "zIndex" : level++, 
                    "opacity" : 1 / oloop--,
                    "left" : gap*i ,
                    "top" :  self_.settingVerticalAlign(rh)
                });
                rw = rw / self_.options.scale;
                rh = rh / self_.options.scale;
            });

        },
        //设置垂直居中位置
        settingVerticalAlign : function(height){
            var verticalAlign = this.options.verticalAlign,
                top;
            if( verticalAlign === 'middle' ){
                top = (this.options.height - height) / 2;
            }else if( verticalAlign === 'top' ){
                top = 0;
            }else if( verticalAlign === 'bottom' ){
                top = (this.options.height - height);
            }else{
                top = (this.options.height - height) / 2;
            }
            return top;
        },
        //向左向右事件
        dnSlideRotate : function(dir){
            var self_ = this ,
                indexArr = [] ,
                arr      = [] ;
            if(dir==='left'){
                this.dnSlideItems.find('li').each(function(index, el) {
                    var prev = $(el).prev().get(0) ? $(el).prev() : self_.dnSlideLastItem,
                        width = prev.width(),
                        height = prev.height(),
                        zIndex = prev.css('zIndex'),
                        top = prev.css('top'),
                        left = prev.css('left'),
                        opacity = prev.css('opacity');
                        indexArr.push(zIndex);

                        $(el).animate({
                            width: width,
                            height: height,
                            //zIndex: zIndex,
                            top: top,
                            left: left,
                            opacity: opacity
                        },self_.options.speed,function(){
                            self_.rotateFlag = true ;
                        });
                });
                //让z-index转化效果优先于别的提高交互
                this.dnSlideItems.find('li').each(function(i){
                    $(this).css("zIndex",indexArr[i]);
                    arr.push(parseInt(indexArr[i]));
                });
            }else if(dir==='right'){
                this.dnSlideItems.find('li').each(function(index, el) {
                    var next = $(el).next().get(0) ? $(el).next() : self_.dnSlideFirstItem,
                        width = next.width(),
                        height = next.height(),
                        zIndex = next.css('zIndex'),
                        top = next.css('top'),
                        left = next.css('left'),
                        opacity = next.css('opacity');
                        indexArr.push(zIndex);

                        $(el).animate({
                            width: width,
                            height: height,
                            //zIndex: zIndex,
                            top: top,
                            left: left,
                            opacity: opacity
                        },function(){
                            self_.rotateFlag = true ;
                        });
                });
                this.dnSlideItems.find('li').each(function(i){
                    $(this).css("zIndex",indexArr[i]);
                    arr.push(parseInt(indexArr[i]));
                });
            }
            var max =  Math.max.apply(null, arr);
            var i   =  jQuery.inArray(max,arr);
            this.options.afterClickBtnFn.apply(this,[i]);
        },
        //是否自动播放
        autoPlay : function(){ 
            var self_ = this;
            this.timer = setInterval(function(){
                self_.dnSlideRotate('left');
            } , self_.options.delay );
        },
        //防止上传的图片数量为基数（通过后插入方式保持偶数图片数量）
        isEvenPicNum:function(){
            if(this.dnSlideItemsLength%2 === 0){
                this.dnSlideItems.append(this.dnSlideFirstItem.clone());
                this.dnSlideItemsLength = this.dnSlide.find('ul.dnSlide-list>li').length;
                this.dnSlideFirstItem = this.dnSlide.find('ul.dnSlide-list>li:first-child');
                this.dnSlideLastItem = this.dnSlide.find('ul.dnSlide-list>li:last-child');
            }
        },   
        _api_: function()
        {
            var self_ = this,
                api = {};

            $.each( this.api,
                function( i )
                {
                    var fn = this;
                    api[ fn ] = function()
                    {   
                        var re = self_[ fn ].apply( self_, arguments );
                        return ( typeof re == 'undefined' ) ? api : re;
                    };
                }
            );
            return api;
        },
    };

    /* The jQuery plugin */
    $.fn[_PLUGIN_] = function(options){

        options = $.extend( true, {} , $[_PLUGIN_].defaults , options );
        return this.each(function(){
            $(this).data( _PLUGIN_, new $[_PLUGIN_]( $(this), options )._api_() );
            $(this).addClass('done');
        });

    };

}));
