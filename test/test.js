'use strict';

var streamArray = require('stream-array'),
    File = require('gulp-util').File,
    test = require('tape'),
    streamAssert = require('stream-assert'),
    gulpReduceFile = require('../index');


function testfile() {
    var args = Array.prototype.slice.call(arguments);

    function create(contents) {
        return new File({
            contents: new Buffer(contents),
        });
    }

    return streamArray(args.map(create));
}

test('Memo is passed and wrapped into a file', function(assert) {
    var reduce = gulpReduceFile('out.js', function(file, memo) {
        return memo;
    }, function(memo) {
        assert.deepEqual(memo, {}, 'Got the memo unchanged');
        return memo;
    }, {});

    testfile('test')
        .pipe(reduce)
        .pipe(streamAssert.first(function(reduced) {
            assert.equal(reduced.contents.toString(), '{}', 'Memo was stringified');
            assert.end();
        }));
});
