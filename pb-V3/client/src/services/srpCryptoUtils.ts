import sha1 from 'js-sha1';
import BN from 'bn.js';

export default {
    // (string, string, string, string, string, string) -> {A: string, M: string, K: string}
    generateClientKeys: function (I, P, N, g, s, B) {
        B = new BN(B, 16);
        N = new BN(N, 16);
        if (B.mod(N).isZero()) {
            throw new Error("B == 0 mod N");
        }
        g = new BN(g, 16);
        s = new BN(s, 16);

        var red = BN.red(N);
        var _g = g.toRed(red);

        let a = new BN(random());

        var _A = _g.redPow(a);
        var A = _A.fromRed();

        var u = new BN(SHA1(concat(pad(A, N), pad(B, N))));
        if (u.isZero()) {
            throw new Error("u == 0");
        }

        var x = new BN(derive(s, I, P));

        var k = new BN(SHA1(concat(N, pad(g, N))));
        var _k = k.toRed(red);

        var _B = B.toRed(red);

        // K = (B - (k * g^x)) ^ (a + (u * x)) % N
        var K = pad(_B.redSub(_k.redMul(_g.redPow(x))).redPow(a.add(u.mul(x))).fromRed(), N);

        var M1 = new BN(SHA1(concat(A, concat(B, K))));

        return { A: A.toString(16, 2), M1: M1.toString(16, 2), K: new BN(K).toString(16, 2) };
    },

    // (string, string, string, string) -> boolean
    verifyServerResponse: function (A, M1, K, M2) {
        A = new BN(A, 16);
        M1 = new BN(M1, 16);
        K = new BN(K, 16);
        M2 = new BN(M2, 16);
        let M = new BN(SHA1(concat(A, concat(M1, K))), 16);
        return M.eq(M2);
    }
}


function textEncode(str) {
    if (window.TextEncoder) {
        return new TextEncoder().encode(str);
    }
    var utf8 = unescape(encodeURIComponent(str));
    var result = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) {
        result[i] = utf8.charCodeAt(i);
    }
    return result;
}

// (string | Uint8Array | BN) -> Uint8Array
function SHA1(v) {
    if (typeof v == "string") {
        v = textEncode(v);
    }
    if (BN.isBN(v)) {
        v = v.toArrayLike(Uint8Array);
    }
    var digest = sha1.array(v);
    return new Uint8Array(digest);
}

// (BN | Uint8Array, BN | Uint8Array) -> Uint8Array
function concat(a, b) {
    if (BN.isBN(a)) {
        a = a.toArrayLike(Uint8Array);
    }
    if (BN.isBN(b)) {
        b = b.toArrayLike(Uint8Array);
    }
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}

// (BN, BN) -> Uint8Array
function pad(a, N) {
    return a.toArrayLike(Uint8Array, "be", N.byteLength());
}

function derive(s, I, P) {
    var s1 = SHA1(I + ":" + P);
    var s2 = SHA1(concat(s, s1));
    return s2;
}

function random() {
    return window.crypto.getRandomValues(new Uint8Array(32));
}

export const shortUniqueID = () => {
    return Math.random().toString(36).substring(7); // 6 chars
}