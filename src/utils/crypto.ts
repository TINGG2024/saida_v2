/**
 * SHA-256 密码哈希工具
 * 使用浏览器原生 crypto.subtle API
 */

// 预计算的常用密码哈希值（避免每次都要异步计算 mock 数据）
export const PRECOMPUTED_HASHES: Record<string, string> = {
  '123456': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'admin123': '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
};

/**
 * 对明文密码进行 SHA-256 哈希
 */
export async function hashPassword(password: string): Promise<string> {
  // 先检查预计算值
  if (PRECOMPUTED_HASHES[password]) {
    return PRECOMPUTED_HASHES[password];
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码是否匹配哈希值
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
