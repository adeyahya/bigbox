import crypto from "crypto"
import bcrypt from "bcrypt"

const algorithm = 'aes-256-cbc'
const saltRounds = 10;

export const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return reject(err)
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return reject(err)
        return resolve(hash)
      });
    });
  })
}

export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash)

export const encrypt = (text: string, password: string) => new Promise<string>((resolve, reject) => {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
    if (err) return reject(err);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const combinedData = `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted}`;
    resolve(combinedData)
  });
})

export const decrypt = async (encrypted: string, password: string) => new Promise<string>((resolve, reject) => {
  const [ivHex, saltHex, encryptedDataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const salt = Buffer.from(saltHex, 'hex');

  crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
    if (err) return reject(err);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    resolve(decrypted);
  });
})