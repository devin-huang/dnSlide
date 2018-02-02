var gulp = require('gulp'); 

var clean = require('gulp-clean');// 引入组件

var concat = require('gulp-concat');// 合并文件

var rename = require('gulp-rename');// 重命名

var compass = require('gulp-compass');// 校验JS代码

var htmlminify = require("gulp-html-minify");// HTML、CSS、JS优化
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
// 图片压缩
var imagemin = require('gulp-imagemin');
var tiny = require('gulp-tinypng-nokey');

// 增加hash码(rev、revCollector需要一起使用；参考http://www.cnblogs.com/1wen/p/5421212.html（文件、图片都可以）)
var rev = require('gulp-rev');

var revCollector = require('gulp-rev-collector');  // 路径替换

var route = 'dist';
var routeRev = 'rev';

// 自定义环境路径
var path = {
    // 开发环境
    dev: {
        html: 'dev/',
        sass: 'dev/sass',
        js: 'dev/js',
        css: 'dev/css',
        image: 'dev/images'
    },
    // 发布环境
    dist: {
        html: route+'/',
        css: route+'/css',
        js: route+'/js', 
        image: route+'/images'
    },
    //js,css添加版本后缀
    rev:{
        css:routeRev+'/css',
        js:routeRev+'/js',
        image:routeRev+'/images'
    }
};

// 清空文件夹，避免资源冗余
gulp.task('clean',function(){
    return gulp.src(route,{read: false}).pipe(clean());
});

// 对CSS/JS文件进行压缩、MD5编码
gulp.task("rev-css",function(){
    return gulp.src(path.dev.css + "/*.css")
        .pipe(cleanCSS())
/*        .pipe(rename({                  
            //prefix: "bonjour-",         
            suffix: "-min"              
         })) */
        .pipe(rev())
        .pipe(gulp.dest(path.dist.css))
        .pipe(rev.manifest())
        .pipe(gulp.dest(path.rev.css));
});

gulp.task("rev-js",function(){
    return gulp.src(path.dev.js +"/*.js")
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(path.dist.js))
        .pipe(rev.manifest())
        .pipe(gulp.dest(path.rev.js));
});

gulp.task('image', function() {
    gulp.src(path.dev.image + '/**/*.{gif,png}')
    .pipe(imagemin())
    .pipe(gulp.dest(path.dist.image));
     
    gulp.src(path.dev.image + '/**/*.{jpg,jpeg}')  
    .pipe(tiny())
    .pipe(gulp.dest(path.dist.image));
 
});

// 更新HTML中对应路径
gulp.task('rev-path-css',function(){
    gulp.src([path.rev.css + '/*.json' , path.dist.html + '/*.html'])
    .pipe(revCollector({
        replaceReved:true
    }))
    .pipe(gulp.dest(path.dist.html));
});

gulp.task('rev-path-js',function(){
    gulp.src([path.rev.js + '/*.json' , path.dist.html + '/*.html'])
    .pipe(revCollector({
        replaceReved:true
    }))
    .pipe(gulp.dest(path.dist.html));
});

//编译SASS
gulp.task('compass', function() {
  gulp.src(path.dev.sass + '/*.scss')
    .pipe(compass({
        css: path.dev.css,
        sass: path.dev.sass,
        image: path.dev.image
    }))
    .on('error', function(error) {
      console.log(error);
    })
    .pipe(gulp.dest(path.dev.css));
});

// 压缩HTML
gulp.task('html', function() {
    gulp.src(path.dev.html + '/*.html')
        .pipe(htmlminify())
        .pipe(gulp.dest(path.dist.html));
});


// 开启实时监听
gulp.task('compass-listen', function(){
    gulp.watch(path.dev.sass + '/*.scss', function(){
        gulp.run('compass');
    });    
});

gulp.task('image-listen', function(){
    gulp.watch(path.dev.image + '/**/*.{jpg,jpeg}', function(){
        gulp.run('image');
    });
});
 
/**
运行顺序 ( 务必按此顺序 ) 
1.gulp dist-clean
2.gulp main
3.gulp path-css 
4.gulp path-js
图片也可以进行MD5编码但是CSS内引用的不起作用，所以默认不使用
**/

gulp.task('all-clean', function(){
    gulp.start('clean');
});

gulp.task('main', function(){
    gulp.start('html','rev-css','rev-js','image');
});

gulp.task('path-css', function(){
    gulp.start('rev-path-css');
});

gulp.task('path-js', function(){
    gulp.start('rev-path-js');
});