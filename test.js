import test from 'ava';
import base62 from './index.js';

test('encodeBytes / decodeBytes - round-trip', t => {
	const input = new Uint8Array([10, 20, 30, 40, 255]);
	const encoded = base62.encodeBytes(input);
	const decoded = base62.decodeBytes(encoded);
	t.deepEqual(decoded, input);
});

const testStringRoundtrip = (t, input, expected) => {
	const encoded = base62.encodeString(input);
	const decoded = base62.decodeString(encoded);
	t.is(encoded, expected);
	t.is(decoded, input);
};

const testStrings = new Map([
	['Hello, World!', '8nlogx6nlNdJhVT24v'],
	['Another example🏴', 'B6f8m2TtOhNkJuVfeJVXhKTPAi'],
	['1234567890', '7CipUfMcknk2uu'],
	['🦄', '95s3vg'],
	['😊🚀🌟💥', 'F7782ZaAxP6MFPZUluW18H'],
	['Special characters ~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\', 'BU3kOcSFw49tim4FMGq22KElf62dgQ6YAeCoc2XVcK32JQ5LoO2TfOn2cwCL5PPeRU9BE'],
	['', ''],
	['0', '4u'],
	['000x', '5ZNTk8'],
]);

for (const [string, expected] of testStrings) {
	test(`encodeString / decodeString - round-trip for "${string}"`, t => {
		testStringRoundtrip(t, string, expected);
	});
}

test('encodeInteger / decodeInteger - round-trip', t => {
	const input = 1_234_567_890;
	const encoded = base62.encodeInteger(input);
	const decoded = base62.decodeInteger(encoded);
	t.is(decoded, input);
});

test('encodeBigInt / decodeBigInt - round-trip', t => {
	const input = 123_456_789_012_345_678_901_234_567_890n;
	const encoded = base62.encodeBigInt(input);
	const decoded = base62.decodeBigInt(encoded);
	t.is(decoded, input);
});

test('encodeBytes - handles single byte edge cases', t => {
	const input = new Uint8Array([0, 0, 0, 1, 9, 10, 35, 61, 62, 255]);
	const encoded = base62.encodeBytes(input);
	const decoded = base62.decodeBytes(encoded);
	t.deepEqual(decoded, input);
});

test('encodeString - handles Unicode characters', t => {
	const input = '😊🚀🌟💥';
	const encoded = base62.encodeString(input);
	const decoded = base62.decodeString(encoded);
	t.is(decoded, input);
});

test('encodeInteger - handles small and large numbers', t => {
	const inputs = [
		0,
		1,
		12,
		123,
		1234,
		12_345,
		123_456,
		1_234_567,
		12_345_678,
		Number.MAX_SAFE_INTEGER,
	];

	for (const input of inputs) {
		const encoded = base62.encodeInteger(input);
		const decoded = base62.decodeInteger(encoded);
		t.is(decoded, input);
	}
});

test('encodeBigInt - handles very large BigInts', t => {
	const inputs = [
		0n,
		1n,
		12_345_678_901_234_567_890n,
		98_765_432_109_876_543_210n,
		0x1F_FF_FF_FF_FF_FF_FFn, // Close to Number.MAX_SAFE_INTEGER
		0xFF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FF_FFn,
	];

	for (const input of inputs) {
		const encoded = base62.encodeBigInt(input);
		const decoded = base62.decodeBigInt(encoded);
		t.is(decoded, input);
	}
});
