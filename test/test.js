'use strict';

var streamArray = require('stream-array'),
    File = require('gulp-util').File,
    test = require('tape'),
    async = require('async'),
    Faker = require('faker'),
    streamAssert = require('stream-assert'),
    reduce = require('../index');


function testfile() {
    var args = Array.prototype.slice.call(arguments);

    function create(contents) {
        return new File({
            path: contents,
            contents: new Buffer(contents),
        });
    }

    return streamArray(args.map(create));
}

test('Memo is passed and wrapped into a file', function(assert) {
    var iterator = reduce('out.js', function(file, memo) {
        return memo;
    }, function(memo) {
        assert.deepEqual(memo, {}, 'Got the memo unchanged');
        return memo;
    }, {});

    testfile('test')
        .pipe(iterator)
        .pipe(streamAssert.first(function(outfile) {
            assert.equal(outfile.contents.toString(), '{}', 'Memo was stringified');
            assert.end();
        }));
});

test('Just multiple files', function(assert) {
    var names = Faker.Lorem.words(),
        files = testfile.apply(null, names);

    var iterator = reduce('out.js', function(file, memo) {
        memo[file.relative] = true;
        return memo;

    }, function(memo) {
        return memo;
    }, {});

    files
        .pipe(iterator)
        .pipe(streamAssert.first(function(outfile) {
            var expect = names.reduce(function(expect, name) {
                expect[name] = true;
                return expect;
            }, {});

            assert.equal(outfile.contents.toString(), JSON.stringify(expect, null, 2));
            assert.end();
        }));
});

test('Memocan be a string, array, object', function(assert) {
    var name = Faker.Lorem.words().join('/');

    var cases = [
        {
            label: 'Memo can be a string',
            memo: '',
            file: name,
            outfile: 'Got: ' + name,
            iterator: function(file, memo) {
                return memo + 'Got: ' + file.relative;
            }
        },
        {
            label: 'Memo can be an array',
            memo: [],
            file: name,
            outfile: JSON.stringify([name], null, 2),
            iterator: function(file, memo) {
                memo.push(file.relative);
                return memo;
            }
        },
        {
            label: 'Memo can be an object',
            memo: {},
            file: name,
            get outfile() {
                var out = {};
                out[name] = true;
                return JSON.stringify(out, null, 2);
            },
            iterator: function(file, memo) {
                memo[file.relative] = true;
                return memo;
            }
        }
    ];

    async.each(cases, function(testCase, next) {
        var iterator = reduce('out.js', testCase.iterator, function(memo) {
            return memo;
        }, testCase.memo);

        testfile(testCase.file)
            .pipe(iterator)
            .pipe(streamAssert.first(function(outfile) {
                assert.equal(outfile.contents.toString(), testCase.outfile, testCase.label);
                next();
            }));

    }, assert.end);

});
