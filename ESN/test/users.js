var assert = require('assert');
describe('user', function () {
    var user = require('../routes/users.js');
    describe('checkAvability', function () {
        var checkAvability = user.checkAvailability;
        it('should not accept len < 3', function () {
            assert.equal(false, checkAvability(''), 'less than 3');
            assert.equal(false, checkAvability('a'), 'less than 3');
            assert.equal(false, checkAvability('ab'), 'less than 3');
        });

        it('should not have strange chars', function () {
            assert.equal(false, checkAvability('你好啊aaa'), 'unicode');
            assert.equal(false, checkAvability('-aaa'), 'head dash');
            assert.equal(false, checkAvability('a12aa-'), 'tail dash');
            assert.equal(false, checkAvability(':"!#$$%^'), 'strange char');
        });

        it('should not accept reserved words', function () {
            assert.equal(false, checkAvability('about'), 'about is reserved');
        });

        it('should accept all others', function () {
            assert.equal(true, checkAvability('good'), 'good');
            assert.equal(true, checkAvability('go-od'), 'good');
            assert.equal(true, checkAvability('go-o123d'), 'good');
            assert.equal(true, checkAvability('0go-od'), 'good');
            assert.equal(true, checkAvability('go-od_'), 'good');
            assert.equal(true, checkAvability('_go-od'), 'good');
        });


    });
});

