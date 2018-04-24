var assert = require('assert');
describe('validation', function () {
    var validation = require('../utils/validations.js');
    describe('UsernameIsGood', function () {
        var UsernameIsGood = validation.UsernameIsGood;
        it('should not accept len < 3', function () {
            assert.equal(false, UsernameIsGood(''), 'less than 3');
            assert.equal(false, UsernameIsGood('a'), 'less than 3');
            assert.equal(false, UsernameIsGood('ab'), 'less than 3');
        });

        it('should not have strange chars', function () {
            assert.equal(false, UsernameIsGood('你好啊aaa'), 'unicode');
            assert.equal(false, UsernameIsGood('-aaa'), 'head dash');
            assert.equal(false, UsernameIsGood('a12aa-'), 'tail dash');
            assert.equal(false, UsernameIsGood(':"!#$$%^'), 'strange char');
        });

        it('should not accept reserved words', function () {
            assert.equal(false, UsernameIsGood('about'), 'about is reserved');
        });

        it('should accept all others', function () {
            assert.equal(true, UsernameIsGood('good'), 'good');
            assert.equal(true, UsernameIsGood('go-od'), 'good');
            assert.equal(true, UsernameIsGood('go-o123d'), 'good');
            assert.equal(true, UsernameIsGood('0go-od'), 'good');
            assert.equal(true, UsernameIsGood('go-od_'), 'good');
            assert.equal(true, UsernameIsGood('_go-od'), 'good');
        });
    });
});

