/* eslint-disable no-console,no-underscore-dangle,no-param-reassign */
const watchify = require('watchify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync');
const del = require('del');
const $ = require('gulp-load-plugins')();
const fs = require('fs');


function onError(err) {
	$.util.beep();
	$.util.log($.util.colors.red('Compilation Error\n'), err.toString());
	this.emit('end');
}

/**
 * This task removes all files inside the 'dist' directory.
 */
gulp.task('clean', () =>
	del.sync('./dist/**/*')
);

/**
 * Media
 */
gulp.task('buildmedia', () =>
	gulp.src(['./src/media/**'])
		.pipe($.plumber())
		.pipe(gulp.dest('./dist/media'))
);

/**
 * Layouts
 */
gulp.task('cleanhtml', del.bind(null, ['tmp/**/*.html']));


gulp.task('html', () =>
	gulp
		.src('./src/html/**/*.html')
		.pipe(gulp.dest('./tmp'))
		.pipe(browserSync.stream({ once: true }))
);


gulp.task('buildhtml', ['html'], () =>
	gulp
		.src('./tmp/**/*.html')
		.pipe($.htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('./dist'))
);

/**
 * Scripts
 */
gulp.task('cleanjs', del.bind(null, ['./tmp/js/**/*']));

function bundleJs(watch) {
	const customOpts = {
		entries: ['./src/es6/app.js'],
		transform: ['babelify'],
		debug: true, // Enables source maps
	};
	const opts = Object.assign({}, browserify.args, customOpts);
	const b =  watch ? watchify(browserify(opts)) : browserify(opts);

	return b.bundle()
		.on('error', onError)
		.pipe($.plumber())
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe($.sourcemaps.init({ loadMaps: true }))
		.pipe($.uglify())
		.pipe($.rename({
			extname: '.js',
		}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('./tmp/js'))
		.pipe(browserSync.stream({ once: true }));
}

gulp.task('js', ['cleanjs'], () => bundleJs());
gulp.task('watchjs', ['cleanjs'], () => bundleJs(true));

gulp.task('buildjs', ['js'], () =>
	gulp
		.src('./tmp/js/*.js')
		.pipe($.uglify())
		.pipe(gulp.dest('./dist/js'))
);

/**
 * Styles
 */
gulp.task('cleancss', del.bind(null, ['./tmp/css/**/*']));

gulp.task('css', ['cleancss'], () =>
	gulp
		.src('./src/scss/**/*.scss')
		.pipe($.plumber({
			errorHandler: onError,
		}))
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			outputStyle: 'compressed',
			onError: console.error.bind(console, 'Sass error:'),
		}))
		.pipe($.autoprefixer())
		.pipe($.sourcemaps.write(''))
		.pipe(gulp.dest('./tmp/css'))
		.pipe(browserSync.stream())
 );

gulp.task('buildcss', ['css'], () =>
	gulp
		.src('./tmp/css/*.css')
		.pipe($.uglifycss())
		.pipe(gulp.dest('./dist/css'))
);


/**
 * Main
 */
gulp.task('dev', ['html', 'js', 'css']);
gulp.task('build', ['buildhtml', 'buildjs', 'buildcss', 'buildmedia']);

gulp.task('clean', del.bind(null, ['tmp', 'dist']));


gulp.task('watch', ['dev', 'watchjs'], () => {
	gulp.watch('src/es6/**/*', ['js']);
	gulp.watch('src/scss/**/*', ['css']);
	gulp.watch('src/html/**/*', ['html']);
	gulp.watch('src/media/**/*').on('change', browserSync.reload);
});


function appendHtml(dir, req, res, next) {
	if (req.url.match(/\/[^.]+$/)) {
		fs.access(`${dir}${req.url}.html`, fs.F_OK, (err) => {
			if (!err) {
				req.url += '.html';
			}
			next();
		});
	} else {
		next();
	}
}

gulp.task('serve', ['watch'], () =>
	browserSync({
		server: {
			baseDir: ['./tmp', './src'],
			middleware: [
				appendHtml.bind(this, './tmp'),
			],
		},
	})
);

gulp.task('serve:dist', ['build'], () =>
	browserSync({
		server: {
			baseDir: ['./dist'],
			middleware: [
				appendHtml.bind(this, './dist'),
			],
		},
	})
);


gulp.task('default', ['serve']);
