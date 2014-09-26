gulp-reduce-file
================

Reduce files to one single output using custom callbacks.


## Usage

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
