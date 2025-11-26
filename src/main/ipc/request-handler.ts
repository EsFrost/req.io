import { exec } from 'child_process';
import { promisify } from 'util';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { Request, HttpResponse, KeyValue, NetworkInfo } from '../../shared/types';

const execAsync = promisify(exec);

export class RequestHandler {
  private buildCurlCommand(request: Request): string {
    let command = 'curl -i -s';
    
    // Add method
    if (request.method !== 'GET') {
      command += ` -X ${request.method}`;
    }
    
    // Add headers
    if (request.headers && request.headers.length > 0) {
      request.headers
        .filter(h => h.enabled && h.key && h.value)
        .forEach(header => {
          command += ` -H "${header.key}: ${this.escapeValue(header.value)}"`;
        });
    }
    
    // Add auth
    if (request.auth && request.auth.type !== 'none') {
      switch (request.auth.type) {
        case 'basic':
          if (request.auth.basic && request.auth.basic.username && request.auth.basic.password) {
            command += ` -u "${this.escapeValue(request.auth.basic.username)}:${this.escapeValue(request.auth.basic.password)}"`;
          }
          break;
        case 'bearer':
          if (request.auth.bearer && request.auth.bearer.token) {
            command += ` -H "Authorization: Bearer ${this.escapeValue(request.auth.bearer.token)}"`;
          }
          break;
        case 'api-key':
          if (request.auth.apiKey && request.auth.apiKey.key && request.auth.apiKey.value) {
            if (request.auth.apiKey.addTo === 'header') {
              command += ` -H "${this.escapeValue(request.auth.apiKey.key)}: ${this.escapeValue(request.auth.apiKey.value)}"`;
            }
          }
          break;
      }
    }
    
    // Build URL with query params
    let url = request.url;
    const enabledParams = request.queryParams?.filter(p => p.enabled && p.key) || [];
    if (enabledParams.length > 0) {
      const queryString = enabledParams
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    
    // Add API key to query if needed
    if (request.auth?.type === 'api-key' && 
        request.auth.apiKey?.addTo === 'query' && 
        request.auth.apiKey.key && 
        request.auth.apiKey.value) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}${encodeURIComponent(request.auth.apiKey.key)}=${encodeURIComponent(request.auth.apiKey.value)}`;
    }
    
    // Add body
    if (request.body && request.body.type !== 'none') {
      switch (request.body.type) {
        case 'json':
          if (request.body.json) {
            const jsonStr = typeof request.body.json === 'string' 
              ? request.body.json 
              : JSON.stringify(request.body.json);
            if (jsonStr.trim()) {
              command += ` -H "Content-Type: application/json"`;
              command += ` -d '${this.escapeValue(jsonStr)}'`;
            }
          }
          break;
        case 'raw':
          if (request.body.raw && request.body.raw.trim()) {
            command += ` -d '${this.escapeValue(request.body.raw)}'`;
          }
          break;
        case 'x-www-form-urlencoded':
          if (request.body.formData && request.body.formData.length > 0) {
            command += ` -H "Content-Type: application/x-www-form-urlencoded"`;
            const formStr = request.body.formData
              .filter(f => f.enabled && f.key)
              .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value || '')}`)
              .join('&');
            if (formStr) {
              command += ` -d '${formStr}'`;
            }
          }
          break;
        case 'form-data':
          if (request.body.formData && request.body.formData.length > 0) {
            request.body.formData
              .filter(f => f.enabled && f.key)
              .forEach(field => {
                command += ` -F "${this.escapeValue(field.key)}=${this.escapeValue(field.value || '')}"`;
              });
          }
          break;
      }
    }
    
    // Add timing, size info, and connection details
    command += ` -w "\\n__CURL_TIME__%{time_total}\\n__CURL_SIZE__%{size_download}\\n__CURL_HTTP_CODE__%{http_code}\\n__CURL_HTTP_VERSION__%{http_version}\\n__CURL_LOCAL_IP__%{local_ip}\\n__CURL_LOCAL_PORT__%{local_port}\\n__CURL_REMOTE_IP__%{remote_ip}\\n__CURL_REMOTE_PORT__%{remote_port}\\n__CURL_SSL_VERSION__%{ssl_version}"`;
    
    // Show errors but don't fail
    command += ` --fail-with-body`;
    
    // Add verbose flag to capture SSL/TLS info
    command += ` -v`;
    
    command += ` "${url}"`;
    
    return command;
  }
  
  private escapeValue(value: string): string {
    return value.replace(/'/g, "'\\''");
  }
  
  private parseHeaders(headerText: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const lines = headerText.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        headers[match[1].toLowerCase()] = match[2].trim();
      }
    }
    
    return headers;
  }
  
  private parseNetworkInfo(stderr: string, stdout: string): NetworkInfo {
    const networkInfo: NetworkInfo = {};
    
    // Extract HTTP version from curl write-out
    const httpVersionMatch = stdout.match(/__CURL_HTTP_VERSION__([^\n]+)/);
    if (httpVersionMatch) {
      const version = httpVersionMatch[1].trim();
      if (version === '2') {
        networkInfo.httpVersion = 'HTTP/2';
      } else if (version === '1.1') {
        networkInfo.httpVersion = 'HTTP/1.1';
      } else if (version === '1.0') {
        networkInfo.httpVersion = 'HTTP/1.0';
      } else if (version === '3') {
        networkInfo.httpVersion = 'HTTP/3';
      } else {
        networkInfo.httpVersion = `HTTP/${version}`;
      }
    }
    
    // Extract local address
    const localIpMatch = stdout.match(/__CURL_LOCAL_IP__([^\n]+)/);
    const localPortMatch = stdout.match(/__CURL_LOCAL_PORT__([^\n]+)/);
    if (localIpMatch && localPortMatch) {
      networkInfo.localAddress = `${localIpMatch[1].trim()}:${localPortMatch[1].trim()}`;
    }
    
    // Extract remote address
    const remoteIpMatch = stdout.match(/__CURL_REMOTE_IP__([^\n]+)/);
    const remotePortMatch = stdout.match(/__CURL_REMOTE_PORT__([^\n]+)/);
    if (remoteIpMatch && remotePortMatch) {
      networkInfo.remoteAddress = `${remoteIpMatch[1].trim()}:${remotePortMatch[1].trim()}`;
    }
    
    // Try to get SSL version from curl write-out
    const sslVersionMatch = stdout.match(/__CURL_SSL_VERSION__([^\n]+)/);
    if (sslVersionMatch && sslVersionMatch[1].trim()) {
      const sslVersion = sslVersionMatch[1].trim();
      if (sslVersion && sslVersion !== '' && sslVersion !== '0') {
        networkInfo.tlsProtocol = sslVersion;
      }
    }
    
    // Parse SSL/TLS information from verbose output (stderr)
    if (!networkInfo.tlsProtocol) {
      const tlsPatterns = [
        /SSL connection using (TLSv[\d.]+)\s*\/?\s*([^\r\n]*)/i,
        /SSL connection using (TLSv[\d.]+)/i,
        /schannel: (TLSv[\d.]+)/i,
        /\*\s+(TLSv[\d.]+)/i,
      ];
      
      for (const pattern of tlsPatterns) {
        const match = stderr.match(pattern);
        if (match) {
          networkInfo.tlsProtocol = match[1].trim();
          if (match[2] && match[2].trim()) {
            networkInfo.cipherName = match[2].trim();
          }
          break;
        }
      }
    }
    
    // Cipher patterns
    if (!networkInfo.cipherName) {
      const cipherPatterns = [
        /Cipher is ([^\r\n]+)/i,
        /cipher suite:\s*([^\r\n]+)/i,
        /((?:ECDHE|DHE|RSA)[-_](?:RSA|ECDSA)[-_](?:AES|CHACHA20)[-_][\w\-_]+)/i,
        /(TLS_[\w_]+)/,
      ];
      
      for (const pattern of cipherPatterns) {
        const match = stderr.match(pattern);
        if (match) {
          networkInfo.cipherName = match[1].trim();
          break;
        }
      }
    }
    
    // Certificate CN
    const certCNPatterns = [
      /\*\s+Subject:\s*CN\s*=\s*([^,\r\n]+)/i,
      /subject:\s*CN\s*=\s*([^,\r\n]+)/i,
    ];
    
    for (const pattern of certCNPatterns) {
      const match = stderr.match(pattern);
      if (match) {
        networkInfo.certificateCN = match[1].trim();
        break;
      }
    }
    
    // Issuer CN
    const issuerCNPatterns = [
      /\*\s+Issuer:.*CN\s*=\s*([^,\r\n]+)/i,
      /issuer:.*CN\s*=\s*([^,\r\n]+)/i,
    ];
    
    for (const pattern of issuerCNPatterns) {
      const match = stderr.match(pattern);
      if (match) {
        networkInfo.issuerCN = match[1].trim();
        break;
      }
    }
    
    // Valid until
    const expireDatePatterns = [
      /\*\s+Expire Date:\s*([^\r\n]+)/i,
      /expire date:\s*([^\r\n]+)/i,
      /Not After\s*:\s*([^\r\n]+)/i,
    ];
    
    for (const pattern of expireDatePatterns) {
      const match = stderr.match(pattern);
      if (match) {
        networkInfo.validUntil = match[1].trim();
        break;
      }
    }
    
    return networkInfo;
  }
  
  private async executeWithNodeHttps(request: Request): Promise<HttpResponse> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(request.url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        // Build request options
        const options: any = {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: request.method,
          headers: {},
          rejectUnauthorized: false, // Accept self-signed certificates
        };
        
        // Add headers
        if (request.headers && request.headers.length > 0) {
          request.headers
            .filter(h => h.enabled && h.key && h.value)
            .forEach(header => {
              options.headers[header.key] = header.value;
            });
        }
        
        // Add auth
        if (request.auth && request.auth.type !== 'none') {
          switch (request.auth.type) {
            case 'basic':
              if (request.auth.basic) {
                const auth = Buffer.from(`${request.auth.basic.username}:${request.auth.basic.password}`).toString('base64');
                options.headers['Authorization'] = `Basic ${auth}`;
              }
              break;
            case 'bearer':
              if (request.auth.bearer) {
                options.headers['Authorization'] = `Bearer ${request.auth.bearer.token}`;
              }
              break;
            case 'api-key':
              if (request.auth.apiKey) {
                if (request.auth.apiKey.addTo === 'header') {
                  options.headers[request.auth.apiKey.key] = request.auth.apiKey.value;
                }
              }
              break;
          }
        }
        
        let networkInfo: NetworkInfo = {};
        let requestBody = '';
        
        // Prepare body
        if (request.body && request.body.type !== 'none') {
          switch (request.body.type) {
            case 'json':
              if (request.body.json) {
                requestBody = typeof request.body.json === 'string' 
                  ? request.body.json 
                  : JSON.stringify(request.body.json);
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(requestBody);
              }
              break;
            case 'raw':
              if (request.body.raw) {
                requestBody = request.body.raw;
                options.headers['Content-Length'] = Buffer.byteLength(requestBody);
              }
              break;
            case 'x-www-form-urlencoded':
              if (request.body.formData && request.body.formData.length > 0) {
                requestBody = request.body.formData
                  .filter(f => f.enabled && f.key)
                  .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value || '')}`)
                  .join('&');
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                options.headers['Content-Length'] = Buffer.byteLength(requestBody);
              }
              break;
          }
        }
        
        const req = client.request(options, (res: any) => {
          const chunks: Buffer[] = [];
          
          // Capture TLS information for HTTPS
          if (isHttps && res.socket && (res.socket as any).getPeerCertificate) {
            const socket = res.socket as any;
            const tlsSocket = socket;
            
            // Get TLS version
            if (tlsSocket.getProtocol) {
              networkInfo.tlsProtocol = tlsSocket.getProtocol();
            }
            
            // Get cipher
            if (tlsSocket.getCipher) {
              const cipher = tlsSocket.getCipher();
              if (cipher && cipher.name) {
                networkInfo.cipherName = cipher.name;
              }
            }
            
            // Get certificate info
            try {
              const cert = tlsSocket.getPeerCertificate();
              if (cert && cert.subject) {
                networkInfo.certificateCN = cert.subject.CN;
              }
              if (cert && cert.issuer) {
                networkInfo.issuerCN = cert.issuer.CN;
              }
              if (cert && cert.valid_to) {
                networkInfo.validUntil = cert.valid_to;
              }
            } catch (err) {
              console.error('Error getting certificate:', err);
            }
            
            // Get local and remote addresses
            if (socket.localAddress && socket.localPort) {
              networkInfo.localAddress = `${socket.localAddress}:${socket.localPort}`;
            }
            if (socket.remoteAddress && socket.remotePort) {
              networkInfo.remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
            }
          }
          
          // Get HTTP version
          networkInfo.httpVersion = `HTTP/${res.httpVersion}`;
          
          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            const time = Date.now() - startTime;
            const size = Buffer.concat(chunks).length;
            
            // Parse response headers
            const headers: Record<string, string> = {};
            Object.keys(res.headers).forEach(key => {
              headers[key] = res.headers[key];
            });
            
            resolve({
              status: res.statusCode || 0,
              statusText: res.statusMessage || 'Unknown',
              headers,
              body,
              time,
              size,
              timestamp: Date.now(),
              networkInfo
            });
          });
        });
        
        req.on('error', (error: Error) => {
          reject(error);
        });
        
        if (requestBody) {
          req.write(requestBody);
        }
        
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async execute(request: Request): Promise<HttpResponse> {
    const startTime = Date.now();
    
    // For HTTPS requests, use Node.js native client to get full TLS details
    try {
      const url = new URL(request.url);
      if (url.protocol === 'https:') {
        console.log('Using Node.js HTTPS client for TLS details');
        return await this.executeWithNodeHttps(request);
      }
    } catch (urlError) {
      // If URL parsing fails, fall through to curl
      console.log('URL parsing failed, using curl');
    }
    
    // Fall back to curl for HTTP or if Node.js method fails
    try {
      const command = this.buildCurlCommand(request);
      console.log('Executing command:', command);
      
      let stdout = '';
      let stderr = '';
      
      try {
        const result = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (error: any) {
        stdout = error.stdout || '';
        stderr = error.stderr || '';
        
        if (!stdout) {
          if (stderr.includes('Could not resolve host')) {
            throw new Error('Could not resolve host. Check the URL.');
          } else if (stderr.includes('Failed to connect')) {
            throw new Error('Connection failed. Is the server running?');
          } else if (stderr.includes('Connection refused')) {
            throw new Error('Connection refused. Is the server running on this port?');
          } else if (stderr.includes('Timeout')) {
            throw new Error('Request timed out.');
          } else {
            throw new Error(stderr || error.message || 'Request failed');
          }
        }
      }
      
      if (!stdout) {
        throw new Error('No response received from server');
      }
      
      const networkInfo = this.parseNetworkInfo(stderr, stdout);
      
      const parts = stdout.split('\n\n');
      let headerSection = parts[0];
      let bodyParts = parts.slice(1);
      
      const statusLines = headerSection.split('\n').filter(line => line.startsWith('HTTP/'));
      if (statusLines.length > 1) {
        const lastStatusIndex = headerSection.lastIndexOf('HTTP/');
        headerSection = headerSection.substring(lastStatusIndex);
      }
      
      const timeMatch = stdout.match(/__CURL_TIME__([0-9.]+)/);
      const sizeMatch = stdout.match(/__CURL_SIZE__([0-9]+)/);
      const httpCodeMatch = stdout.match(/__CURL_HTTP_CODE__([0-9]+)/);
      
      let body = bodyParts.join('\n\n');
      body = body.replace(/__CURL_TIME__[0-9.]+\n?/g, '');
      body = body.replace(/__CURL_SIZE__[0-9]+\n?/g, '');
      body = body.replace(/__CURL_HTTP_CODE__[0-9]+\n?/g, '');
      body = body.replace(/__CURL_HTTP_VERSION__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_LOCAL_IP__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_LOCAL_PORT__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_REMOTE_IP__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_REMOTE_PORT__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_SSL_VERSION__[^\n]+\n?/g, '');
      body = body.trim();
      
      const statusLine = headerSection.split('\n')[0];
      const statusMatch = statusLine.match(/HTTP\/[\d.]+ (\d+) (.+)/);
      
      let status = httpCodeMatch ? parseInt(httpCodeMatch[1]) : 0;
      if (!status && statusMatch) {
        status = parseInt(statusMatch[1]);
      }
      
      const statusText = statusMatch ? statusMatch[2].trim() : 'Unknown';
      
      const headers = this.parseHeaders(headerSection);
      
      const time = timeMatch ? parseFloat(timeMatch[1]) * 1000 : Date.now() - startTime;
      const size = sizeMatch ? parseInt(sizeMatch[1]) : body.length;
      
      return {
        status: status || 0,
        statusText: statusText || 'No Response',
        headers,
        body: body || 'No response body',
        time,
        size,
        timestamp: Date.now(),
        networkInfo
      };
    } catch (error) {
      return {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: (error as Error).message,
        time: Date.now() - startTime,
        size: 0,
        timestamp: Date.now()
      };
    }
  }
}