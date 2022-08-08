/**
 * @author chuangwang
 * @since 2020-05-12
 */
const gulp = require('gulp');
const chalk = require('chalk');
const { gulpLunaUpload } = require('@tencent/luna-upload');
const rename = require("gulp-rename");
const clean = require("gulp-clean");
const _ = require('lodash');
const gutil = require('gulp-util');
const detectPort = require('detect-port');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const runSequence = require('run-sequence');
const cmd_exec = require('cross-spawn');
const webpackTestConf = require('./webpack.config.js');
const { appName } = require('./project.json');
const through = require('through2');
const jeditor = require("gulp-json-editor");

const CDN = {
    cdnPath: `//om.gtimg.cn/om/omadmin/xone/${appName}/`,
    cdnBaseUrl: 'https://om.gtimg.cn/',    // 配置 base地址，例如https://test.gtimg.com/
    origin: 'Origin_777',                  // 请在luna平台上获取
    passWord: 'UeM5lz2r',                  // 请在luna平台上获取
    dir: `om/omadmin/xone/${appName}/`,
    cwd: './build/',
    entry:'',
    store:''
}

gulp.task('build:test', function () {
    const compiler = webpack(webpackTestConf);
    return compiler.run(function (err, stats) {
        console.log('--gulo test  err stats --', err, '**', stats);
        console.log(chalk.green('打包完成！'));
    });
});
gulp.task('build:pro', function () {
    const compiler = webpack(webpackTestConf);
    compiler.run(function (err, stats) {
        //console.log('--gulo build  err stats --', err, '**', stats);
        console.log(chalk.green('打包完成！'), 'stats')
    });
});

gulp.task('upload', function () {
    const { cdnBaseUrl, origin, passWord, dir, cwd } = CDN;
    const params = {
        cdnBaseUrl,
        origin,
        passWord,
        dir
    };
    return gulp.src(['!*.html', '**/*.*'], {
        cwd,
        buffer: false
    }).pipe(gulpLunaUpload(params));
});

gulp.task('clean:serverPublic', function () {
    return gulp.src('*', { cwd: relaPath.serverPublic }).pipe(clean());
});

//同步到server/app/view 目录
gulp.task('moveHtmlToAppView', function () {

    return gulp.src(relaPath.distTemplate)
        .pipe(rename(function (path) {
            path.extname = '.ejs';
            path.basename = siteid;
        }))
        .pipe(gulp.dest(paths.serverView));
});

gulp.task('project', function () {
    return gulp.src('build/*.js')
        .pipe(through.obj(function(file,enc,cb){
            if(file.relative.split('.')[0] == 'singleSpaEntry'){
                CDN.entry = file.relative
            }else if(file.relative.split('.')[0] == 'store'){
                CDN.store = file.relative
            }
            cb()
            gulp.src("./project.json")
            .pipe(jeditor({
                'entry': CDN.cdnPath + CDN.entry,
                'store': CDN.cdnPath + CDN.store
            }))
            .pipe(gulp.dest("./"));
            console.log(chalk.green('配置文件更新成功！'))
        }))
});

//同步到server/app/public 目录
gulp.task('moveDistFilesToPublic', function () {
    return gulp.src(relaPath.distAll).pipe(gulp.dest(paths.serverPublic));
});

gulp.task('test', function (cb) {
    //cmd_exec.sync('gulp', ['clean:serverPublic'], {stdio: 'inherit'});
    cmd_exec.sync('gulp', ['build:test'], {stdio: 'inherit'});
    //cmd_exec.sync('gulp', ['moveHtmlToAppView'], {stdio: 'inherit'});
    //cmd_exec.sync('gulp', ['moveDistFilesToPublic'], {stdio: 'inherit'});
});
gulp.task('publish', function () {
    //cmd_exec.sync('gulp', ['clean:serverPublic'], {stdio: 'inherit'});
    cmd_exec.sync('gulp', ['build:pro'], {stdio: 'inherit'});
    cmd_exec.sync('gulp', ['upload'], {stdio: 'inherit'});
    // 生成子应用app1-project.json - 配置文件
    cmd_exec.sync('gulp', ['project'], {stdio: 'inherit'});
    //cmd_exec.sync('gulp', ['moveHtmlToAppView'], {stdio: 'inherit'});
});