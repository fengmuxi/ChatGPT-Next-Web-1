// 密钥对生成 http://web.chacuo.net/netrsakeypair

import JSEncrypt from "jsencrypt"

const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0aaRvba0ckpkUS2JfnFWBuLnJVlT++nWC+QZeyg9JST5sHe3i8sdK+NKwHeIEIT73c/L+UOV1sxDPbWGlWaq5SMAFINOQomUjdkGFBiBmBS9I6zOy4v7U3BjP3YFWPioZV9oTDt/zYqWndIhJBRvjY79z5KavgmL86ubwva7tt38MQFV1VdthopHGWOwPlHRAyb2z+52oP2E4XHcqdXZGzvXgVvAWOFR1l/ZrInDNUIn8X4iBKEl4DzyDTR/EiO/U9xNLyhMb7L/5WUr1UdSpQw8R4mnW9FI4DyrG7E7xA/04t6vhDFNO00DHycFqOgGNz9HRv09FErGfKs74dQUrwIDAQAB'

// 加密
export function encrypt(txt:string) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}