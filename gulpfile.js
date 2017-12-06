var concat = require('gulp-concat');
var gulp = require('gulp');
var concatCss = require('gulp-concat-css');

var jsFiles = [
    "./src/client/app/Content/vendors/jquery/jquery-2.1.1.js",
    "./src/client/app/Content/vendors/jquery/jquery-1.11.3.js",
    "./src/client/app/Content/vendors/polyfills/excanvas.js",
    "./src/client/app/Content/vendors/easytimer/easytimer.js",
    "./src/client/app/Content/vendors/bootstrap/js/bootstrap.js",
    "./src/client/app/Content/vendors/loremjs/lorem.js",
    "./src/client/app/Content/vendors/jsoneditor/jquery.jsoneditor.js",
    "./src/client/app/Content/vendors/chartjs/chart.js",
    "./src/client/app/Content/vendors/progressbar/progressbar.js",
    "./src/client/app/Content/vendors/jssocials/js/jssocials.js",
    "./src/client/app/Content/app/application.js",
    "./src/client/app/focus_hyperactivity.js",
    "./src/client/app/local_script.js",
    "./src/client/app/app.js"
];

var cssFiles = [
    "./src/client/app/Content/vendors/bootstrap/css/bootstrap.css",
    "./src/client/app/Content/vendors/bootstrap/css/bootstrap-theme.css", ,
    "./src/client/app/Content/vendors/jsoneditor/jquery.jsoneditor.css", ,
    "./src/client/app/Content/vendors/jssocials/css/jssocials.css", ,
    "./src/client/app/Content/vendors/jssocials/css/jssocials-theme-flat.css",
    "./src/client/app/Content/vendors/animate/animate.css",
    "./src/client/app/Content/app/styles.css"
];

gulp.task('scripts', function () {
    return gulp.src(jsFiles)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./src/client/dist/'));
});

gulp.task('styles', function () {
    return gulp.src(cssFiles)
        .pipe(concatCss("bundle.css"))
        .pipe(gulp.dest('./src/client/dist/'));
});

gulp.task('copy-audio', function () {
    return gulp.src(['./src/client/app/focus_hyperactivity_4/**/*'])
      .pipe(gulp.dest('./src/client/dist/focus_hyperactivity_4'));
  });

  gulp.task('copy-html', function () {
    return gulp.src(['./src/client/app/index.html'])
      .pipe(gulp.dest('./src/client/dist/'));
  });
  

gulp.task("default", ["styles","scripts","copy-audio","copy-html"]);