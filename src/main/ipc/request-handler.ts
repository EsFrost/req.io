import { exec } from 'child_process';
import { promisify } from 'util';
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
    
    // Add timing, size info, and verbose output for connection details
    command += ` -w "\\n__CURL_TIME__%{time_total}\\n__CURL_SIZE__%{size_download}\\n__CURL_HTTP_CODE__%{http_code}\\n__CURL_HTTP_VERSION__%{http_version}\\n__CURL_LOCAL_IP__%{local_ip}\\n__CURL_LOCAL_PORT__%{local_port}\\n__CURL_REMOTE_IP__%{remote_ip}\\n__CURL_REMOTE_PORT__%{remote_port}"`;
    
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
      networkInfo.httpVersion = httpVersionMatch[1].trim();
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
    
    // Parse SSL/TLS information from verbose output (stderr)
    // TLS version
    const tlsVersionMatch = stderr.match(/SSL connection using (TLS[^\s]+)/i) || 
                           stderr.match(/TLSv[\d.]+/);
    if (tlsVersionMatch) {
      networkInfo.tlsProtocol = tlsVersionMatch[1] || tlsVersionMatch[0];
    }
    
    // Cipher name
    const cipherMatch = stderr.match(/Cipher is ([^\n]+)/i) || 
                       stderr.match(/SSL connection using [^\s]+ \/ ([^\n]+)/);
    if (cipherMatch) {
      networkInfo.cipherName = cipherMatch[1].trim();
    }
    
    // Certificate CN
    const certCNMatch = stderr.match(/subject: CN=([^,\n]+)/i) || 
                       stderr.match(/Server certificate:[\s\S]*?subject: [^\n]*CN=([^,\n]+)/i);
    if (certCNMatch) {
      networkInfo.certificateCN = certCNMatch[1].trim();
    }
    
    // Issuer CN
    const issuerCNMatch = stderr.match(/issuer: [^\n]*CN=([^,\n]+)/i);
    if (issuerCNMatch) {
      networkInfo.issuerCN = issuerCNMatch[1].trim();
    }
    
    // Valid until (expire date)
    const expireDateMatch = stderr.match(/expire date: ([^\n]+)/i);
    if (expireDateMatch) {
      networkInfo.validUntil = expireDateMatch[1].trim();
    }
    
    return networkInfo;
  }
  
  async execute(request: Request): Promise<HttpResponse> {
    const startTime = Date.now();
    
    try {
      const command = this.buildCurlCommand(request);
      console.log('Executing command:', command);
      
      let stdout = '';
      let stderr = '';
      
      try {
        const result = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (error: any) {
        // Curl returns non-zero exit code for HTTP errors, but we still get output
        stdout = error.stdout || '';
        stderr = error.stderr || '';
        
        // If there's no stdout at all, it's a real error (connection failed, etc.)
        if (!stdout) {
          // Check for common connection errors
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
      
      // If we still have no output, throw error
      if (!stdout) {
        throw new Error('No response received from server');
      }
      
      // Parse network information from verbose output
      const networkInfo = this.parseNetworkInfo(stderr, stdout);
      
      // Parse response
      const parts = stdout.split('\n\n');
      let headerSection = parts[0];
      let bodyParts = parts.slice(1);
      
      // Handle multiple HTTP responses (redirects, etc.)
      const statusLines = headerSection.split('\n').filter(line => line.startsWith('HTTP/'));
      if (statusLines.length > 1) {
        const lastStatusIndex = headerSection.lastIndexOf('HTTP/');
        headerSection = headerSection.substring(lastStatusIndex);
      }
      
      // Extract timing info
      const timeMatch = stdout.match(/__CURL_TIME__([0-9.]+)/);
      const sizeMatch = stdout.match(/__CURL_SIZE__([0-9]+)/);
      const httpCodeMatch = stdout.match(/__CURL_HTTP_CODE__([0-9]+)/);
      
      // Remove curl metadata from body
      let body = bodyParts.join('\n\n');
      body = body.replace(/__CURL_TIME__[0-9.]+\n?/g, '');
      body = body.replace(/__CURL_SIZE__[0-9]+\n?/g, '');
      body = body.replace(/__CURL_HTTP_CODE__[0-9]+\n?/g, '');
      body = body.replace(/__CURL_HTTP_VERSION__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_LOCAL_IP__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_LOCAL_PORT__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_REMOTE_IP__[^\n]+\n?/g, '');
      body = body.replace(/__CURL_REMOTE_PORT__[^\n]+\n?/g, '');
      body = body.trim();
      
      // Parse status line
      const statusLine = headerSection.split('\n')[0];
      const statusMatch = statusLine.match(/HTTP\/[\d.]+ (\d+) (.+)/);
      
      // Use curl's http_code if available, otherwise parse from headers
      let status = httpCodeMatch ? parseInt(httpCodeMatch[1]) : 0;
      if (!status && statusMatch) {
        status = parseInt(statusMatch[1]);
      }
      
      const statusText = statusMatch ? statusMatch[2].trim() : 'Unknown';
      
      // Parse headers
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
      // Return a proper error response
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