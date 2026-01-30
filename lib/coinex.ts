
import crypto from 'crypto';

export class CoinExClient {
  private readonly baseUrl = 'https://api.coinex.com/v2';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private generateSignature(method: string, path: string, params: Record<string, any>, timestamp: number): string {
    // V2 API signature: Method + Path + Params + Timestamp
    const sortedKeys = Object.keys(params).sort();
    let queryStr = '';
    if (sortedKeys.length > 0) {
      queryStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    }
    
    const prepareStr = `${method}${path}${queryStr}${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(prepareStr)
      .digest('hex')
      .toLowerCase();
  }

  async request(method: 'GET' | 'POST', path: string, data: Record<string, any> = {}) {
    const timestamp = Date.now();
    const signature = this.generateSignature(method, path, data, timestamp);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-COINEX-KEY': this.apiKey,
      'X-COINEX-SIGN': signature,
      'X-COINEX-TIMESTAMP': timestamp.toString(),
    };

    const url = new URL(`${this.baseUrl}${path}`);
    if (method === 'GET' && Object.keys(data).length > 0) {
      Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    if (result.code !== 0) {
      throw new Error(result.message || 'CoinEx API Error');
    }
    return result.data;
  }

  static async getPublicTicker() {
    const res = await fetch('https://api.coinex.com/v2/spot/ticker');
    const data = await res.json();
    return data.data;
  }
}
