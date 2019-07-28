var gulp = require('gulp');
var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var stylelint = require('stylelint');
var hogan = require('gulp-hogan');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var image = require('gulp-image');
var autoReload = require('gulp-auto-reload');
var autoPrefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify-es').default;

var outapp = "dist";

var svgSprite = require('gulp-svg-sprite'),
    svgSprites = require('gulp-svg-sprites'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

gulp.task('html', function(){
  return gulp.src(['src/templates/*.hogan','src/templates/**/*.hogan'])
    .pipe(hogan({handle: 'gnumanth'}, null, '.html'))
    .pipe(gulp.dest('dist'))
});

gulp.task('sass',function(){
    return gulp.src(['src/layout/styles/screen.scss', 'src/scss/components/**/*.scss'])
        .pipe(concat('screen.scss'))
        .pipe(gulp.dest('src/scss'));
});

gulp.task('css', ['sass'], function(){
  gulp.src('src/scss/screen.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoPrefixer({
        browsers: ">0.1%",
    }))
    .pipe(concat('stylesheets.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('svgMin', function () {
    return gulp.src('src/svg/*.svg')
        // minify svg
        .pipe(svgmin(function getOptions (file) {
            var prefix = file.relative.slice(0, -4);
            return {
                plugins: [{cleanupIDs: {
                    remove: false,
                    prefix: prefix + '-',
                    minify: true
                }}],
                js2svg: {
                    pretty: true
                }
            }
        }))
        .pipe(gulp.dest('src/svg/min/'))
        .pipe(gulp.dest('dist/svg/min/'))
});

gulp.task('svgMinMonocolor', function () {
    return gulp.src('src/svg/monocolor/*.svg')
        // minify svg
        .pipe(svgmin(function getOptions (file) {
            var prefix = file.relative.slice(0, -4);
            return {
                plugins: [{cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }}],
                js2svg: {
                    pretty: true
                }
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[styles]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(gulp.dest('src/svg/min/'))
});

gulp.task('image', function () {
  gulp.src(['src/images/*', 'src/images/**/*'])
    // .pipe(image({
    //   pngquant: true,
    //   optipng: false,
    //   zopflipng: true,
    //   jpegRecompress: false,
    //   mozjpeg: true,
    //   guetzli: false,
    //   gifsicle: true,
    //   svgo: true,
    //   concurrent: 10,
    //   quiet: true // defaults to false
    // }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('reloader', function() {
  console.log("reload");
  var reloader = autoReload();
  reloader.script()
    .pipe(gulp.dest(outapp));
  htmlInject = reloader.inject;
  gulp.watch(outapp + "/**/*", reloader.onChange);
});

gulp.task("scss-lint", function() {

  // Stylelint config rules
  var stylelintConfig = {
    "rules": {
      "block-no-empty": true,
      "color-no-invalid-hex": true,
      "declaration-colon-space-after": "always",
      "declaration-colon-space-before": "never",
      "function-comma-space-after": "always",
      "function-url-quotes": "always",
      "media-feature-colon-space-after": "always",
      "media-feature-colon-space-before": "never",
      "media-feature-name-no-vendor-prefix": true,
      "max-empty-lines": 5,
      "number-leading-zero": "never",
      "number-no-trailing-zeros": true,
      "property-no-vendor-prefix": true,
      "selector-list-comma-space-before": "never",
      "selector-list-comma-newline-after": "always",
      "string-quotes": "double",
      "value-no-vendor-prefix": true
    }
  }

  var processors = [
    stylelint(stylelintConfig),
    reporter({
      clearMessages: true,
      throwError: true
    })
  ];

  return gulp.src(
      'src/scss/screen.scss'
    )
    .pipe(postcss(processors, {syntax: syntax_scss}));
});

gulp.task('watch',function(){
  gulp.watch(['src/scss/components/**/*.scss', 'src/layout/styles/*.scss'], ['css']);
  gulp.watch(['src/staticscss*', 'src/staticscss/**/*'], ['static','staticscss'])
  gulp.watch('src/js/*.js', ['scripts']);
  gulp.watch(['src/templates/*.hogan','src/templates/**/*.hogan'], ['html']);
  gulp.watch(['src/images/*', 'src/images/**/*'], ['image']);
  gulp.watch('src/fonts/*', ['fonts']);
  gulp.watch('src/svg/*.svg', ['svgMin']);
});

gulp.task('data', function () {
  return gulp.src([
    'src/data/*'
    ])
    .pipe(gulp.dest('dist/data'))
});

gulp.task('scripts', function () {
  return gulp.src([
    'src/js/*.js',
    '!src/js/*.min.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
 });

gulp.task('min-scripts', function () {
  return gulp.src([
    'src/js/*.min.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
 });


gulp.task('fonts', function () {
  return gulp.src('src/fonts/*')
    .pipe(gulp.dest('dist/fonts'))
 });

gulp.task('default', [ 'data', 'reloader', 'watch', 'html', 'css', 'image', 'svgMin', 'svgMinMonocolor', 'scripts', 'min-scripts', 'fonts' ]);

gulp.task('build', [ 'data', 'html', 'css', 'image', 'svgMin', 'svgMinMonocolor', 'scripts', 'min-scripts', 'fonts' ]);
