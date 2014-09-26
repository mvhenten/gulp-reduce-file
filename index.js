'use strict';

var through = require('through'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    File = gutil.File;

module.exports = function reduce(filename, fn, done, memo) {
    if (!filename) throw new PluginError('gulp-reduce-file', 'Missing target filenam for gulp-reduce-file');
    if (!fn instanceof Function) throw new PluginError('gulp-reduce-file', 'Missing iterator callback for gulp-reduce-file');
    if (!done instanceof Function) throw new PluginError('gulp-reduce-file', 'Missing done callback for gulp-reduce-file');

    memo = memo || '';

    function iterate(file) {
        memo = fn(file, memo);
    }

    function end() {
        var content = done(memo),
            target = new File();

        if (typeof content === 'string') content = new Buffer(content);
        if (!(content instanceof Buffer)) content = new Buffer(JSON.stringify(content, null, 2));

        target.path = filename;
        target.contents = content;


        this.emit('data', target);
        this.emit('end');
    }

    return through(iterate, end);
};
