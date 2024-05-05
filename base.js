/* eslint-disable no-bitwise */

const BASE = 62;
const BASE_BIGINT = 62n;
const ALPHABET = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'];
const INDICES = new Map(ALPHABET.map((character, index) => [character, index]));

const cachedEncoder = new globalThis.TextEncoder();
const cachedDecoder = new globalThis.TextDecoder();

function assertString(value, label) {
	if (typeof value !== 'string') {
		throw new TypeError(`The \`${label}\` parameter must be a string, got \`${value}\` (${typeof value}).`);
	}
}

function getIndex(character) {
	const index = INDICES.get(character);

	if (index === undefined) {
		throw new TypeError(`Unexpected character for Base62 encoding: \`${character}\`.`);
	}

	return index;
}

export function encodeString(string) {
	assertString(string, 'string');
	return encodeBytes(cachedEncoder.encode(string));
}

export function decodeString(encodedString) {
	assertString(encodedString, 'encodedString');
	return cachedDecoder.decode(decodeBytes(encodedString));
}

export function encodeBytes(bytes) {
	if (!(bytes instanceof Uint8Array)) {
		throw new TypeError('The `bytes` parameter must be an instance of Uint8Array.');
	}

	if (bytes.length === 0) {
		return '';
	}

	// Prepend 0x01 to the byte array before encoding to ensure the BigInt conversion
	// does not strip any leading zeros and to prevent any byte sequence from being
	// interpreted as a numerically zero value.
	let value = 1n;

	for (const byte of bytes) {
		value = (value << 8n) | BigInt(byte);
	}

	return encodeBigInt(value);
}

export function decodeBytes(encodedString) {
	assertString(encodedString, 'encodedString');

	if (encodedString.length === 0) {
		return new Uint8Array();
	}

	let value = decodeBigInt(encodedString);

	const byteArray = [];
	while (value > 0n) {
		byteArray.push(Number(value & 0xFFn));
		value >>= 8n;
	}

	// Remove the 0x01 that was prepended during encoding.
	return Uint8Array.from(byteArray.reverse().slice(1));
}

export function encodeInteger(integer) {
	if (!Number.isInteger(integer)) {
		throw new TypeError(`Expected an integer, got \`${integer}\` (${typeof integer}).`);
	}

	if (integer < 0) {
		throw new TypeError('The integer must be non-negative.');
	}

	if (integer === 0) {
		return ALPHABET[0];
	}

	let encodedString = '';
	while (integer > 0) {
		encodedString = ALPHABET[integer % BASE] + encodedString;
		integer = Math.floor(integer / BASE);
	}

	return encodedString;
}

export function decodeInteger(encodedString) {
	assertString(encodedString, 'encodedString');

	let integer = 0;
	for (const character of encodedString) {
		integer = (integer * BASE) + getIndex(character);
	}

	return integer;
}

export function encodeBigInt(bigint) {
	if (typeof bigint !== 'bigint') {
		throw new TypeError(`Expected a bigint, got \`${bigint}\` (${typeof bigint}).`);
	}

	if (bigint < 0) {
		throw new TypeError('The bigint must be non-negative.');
	}

	if (bigint === 0n) {
		return ALPHABET[0];
	}

	let encodedString = '';
	while (bigint > 0n) {
		encodedString = ALPHABET[Number(bigint % BASE_BIGINT)] + encodedString;
		bigint /= BigInt(BASE);
	}

	return encodedString;
}

export function decodeBigInt(encodedString) {
	assertString(encodedString, 'encodedString');

	let bigint = 0n;
	for (const character of encodedString) {
		bigint = (bigint * BASE_BIGINT) + BigInt(getIndex(character));
	}

	return bigint;
}
