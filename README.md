gulp-reduce-file
================

Reduce files to one single output using custom callbacks.

This module provides (me) a little extra plumbing where `gulp-concat` or `gulp-compile-hogan` don't
provide the flexibility I need, while while abstracting the `streams` related boilerplate away.

## Usage

Trivial example of providing a directory listing as json object:

```javascript

    var gulp = require('gulp');
    var reduce = require('gulp-reduce-files');

    function collect( file, memo ){
        memo[file.relative] = true;
    }

    function end( memo ){
        return memo;
    }

    gulp.task('default', function () {
        return gulp.src('src/*')
            .pipe(reduce('filelist.json', collect, end, {} ) )
            .pipe(gulp.dest('dist'));
    });

    // produces a dist/filelist.json containing a list of files in src

```

### Examples

### 1. use case rendering templates

Suppose you have a view structure where partials per template are contained in a sub directory,
and you want to maintain that structure pre-rendered:

    views/index/template.html
    views/index/partials/head.html
    views/index/partials/foooter.html

```javascript
    var gulp = require('gulp');
    var reduce = require('gulp-reduce-files');

    function collect( file, templates ){
        var stack = templates,
            parts = file.relative.split('/'),
            compiled = hogan.compile( file.contents.toString('utf8'), { asString: true } );

        while( parts.length ){
            var part = parts.shift();
            if( parts.length == 0 ) stack[part] = compiled;
            stack = stack[part] = stack[part] || {};
        }

        return templates;
    }

    function end( templates ){
        return 'module.exports = ' + JSON.stringify(templates, null, 2) + ';';
    }

    gulp.task('templates', function () {
        return gulp.src('views/**/*.html')
            .pipe(reduce('translations.json', collect, end, {} ) )
            .pipe(gulp.dest('client'));
    });

```

### 2. concatinating translations

Suppose you'd want to bundle a bunch of `.json` translations into a single module:

    var gulp = require('gulp');
    var reduce = require('gulp-reduce-files');

    function collect( file, memo ){
        var locale = file.relative.split('/')[0];
        memo[locale] = JSON.parse( file.contents );
        return memo;
    }

    function end( memo ){
        return 'module.exports = ' + JSON.stringify(memo, null, 2);
    }

    gulp.task('translations', function () {
        return gulp.src('i18n/*.json')
            .pipe(reduce('translations.json', collect, end, {} ) )
            .pipe(gulp.dest('client'));
    });
