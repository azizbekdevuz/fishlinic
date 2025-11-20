def mod_exp(a, e, n):
    exponentBin = bin(e)[2:]
    rsd = 1
    pwr = a % n
    for bit in reversed(exponentBin):
        if bit == '1':
            rsd = (rsd * pwr) % n
        pwr = (pwr**2) % n
    return rsd

def extended_gcd(a, b):
    """Compute the 2 numbers' gcd using the Ext. Euclidean Alg.(and find the integers s and t such like gcd(a,b) = sa + tb)"""
    if b == 0:
        return (a, 1, 0)
    else:
        d, s1, t1 = extended_gcd(b, a % b)
        s = t1
        t1 = s1 - (a // b) * t1
        return (d, s, t1)

def crt(p, q, a, b):
    """Chinese remainder theorem"""
    num1 = q
    num2 = p
    x1 = extended_gcd(num1, p)[1]
    x2 = extended_gcd(num2, q)[1]
    N = a * num1 * x1 + b * num2 * x2
    return N % (p * q)

if __name__ == "__main__":
    print(mod_exp(5, 110, 131))
    print(mod_exp(3, 12345, 97))
    print(mod_exp(5, 123456789012345, 976))
    print(mod_exp(7, 1234567890123456789, 12345))
    print(crt(10, 21, 1, 2))
    print(crt(257, 293, 11, 13))
    print(crt(123, 457, 1, 34))
    print(crt(2**100, 3**100, 100, 200))