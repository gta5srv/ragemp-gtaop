const gulp = require('gulp');
const fs = require('fs-extra');
const del = require('del');
const path = require('path');
const newer = require('gulp-newer');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const merge = require('merge-stream');
const spawn = require('cross-spawn');


if (!process.env.PROJECT_ROOT) {
  throw Error("Environmental variable 'PROJECT_ROOT' is required");
}


const PROJECT_ROOT = process.env.PROJECT_ROOT;


function clean (cb) {
  del.sync(path.join(PROJECT_ROOT, 'build/client/*'), {
    force: true
  });

  cb();
}


function gui (cb) {
  cb();
}


function typeScript () {
  const tsProject = ts.createProject('tsconfig.json');
  const tsConfig = require('./tsconfig.json');

  return browserify('./src/index.ts', {
      basedir: "./",
      debug: true,
      cache: {},
      packageCache: {}
    })
    .plugin(tsify, tsConfig.compilerOptions)
    .transform("babelify", {
       extensions: [".ts"]
     })
    .bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest('build/client', { cwd: PROJECT_ROOT }));
}


function static () {
  return merge(
    gulp.src([
        '**/*',
        '!**/*.ts'
      ], {
        cwd: 'src',
        nodir: true
      })
      .pipe(newer(path.join(PROJECT_ROOT, 'build/client')))
      .pipe(gulp.dest('build/client', { cwd: PROJECT_ROOT })),

    gulp.src('**/*', {
        cwd: 'gui/build',
        nodir: true
      })
      .pipe(newer(path.join(PROJECT_ROOT, 'build/client/gui')))
      .pipe(gulp.dest('build/client/gui', { cwd: PROJECT_ROOT }))
  );
}


function watch () {
  gulp.watch('**/*.ts', { cwd: 'src' }, typeScript);
  gulp.watch([
    '**/*',
    '!**/*.ts'
  ], { cwd: 'src' }, typeScript);
}


module.exports = {
  gui: gui,
  default: gulp.series(clean, gulp.parallel(typeScript, gui), static),
  watch: gulp.series(watch)
};
