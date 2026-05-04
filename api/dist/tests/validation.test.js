import test from 'node:test';
import assert from 'node:assert/strict';
import { assertMaxLength, parseSafeLimit, validateCommentText, validateRating, } from '../lib/validation.js';
test('parseSafeLimit clamps values to safe bounds', () => {
    assert.equal(parseSafeLimit('0'), 1);
    assert.equal(parseSafeLimit('500'), 100);
    assert.equal(parseSafeLimit('20'), 20);
    assert.equal(parseSafeLimit(undefined), 20);
    assert.equal(parseSafeLimit('invalid'), 20);
});
test('assertMaxLength returns error when over max length', () => {
    assert.equal(assertMaxLength('abc', 5, 'title'), null);
    assert.equal(assertMaxLength('abcdef', 5, 'title'), 'title cannot exceed 5 characters.');
});
test('validateCommentText validates empty and oversized comments', () => {
    assert.equal(validateCommentText('   ').error, 'text is required.');
    assert.equal(validateCommentText('a'.repeat(501)).error, 'text cannot exceed 500 characters.');
    assert.equal(validateCommentText('Looks great!').value, 'Looks great!');
});
test('validateRating validates accepted range', () => {
    assert.match(validateRating(undefined).error ?? '', /rating must/);
    assert.equal(validateRating(0).value, 0);
    assert.match(validateRating(6).error ?? '', /rating must/);
    assert.equal(validateRating(4).value, 4);
});
