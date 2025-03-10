import 'dotenv/config';
import { Logger } from '../logger';

import fetch from 'node-fetch';


interface HttpResponse<T> extends Response {
  parsedBody?: T,
}

export default class HttpClient {
  constructor() {
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  private getHeaders(){
    return {
      'Content-Type': 'application/json',
      'api_key': process.env.API_KEY,
    }
  }


  get<T>(path: string): Promise<{data: T, status: number}> {
    return this.http<T>(path, 'GET');
  }

  post<T>(path: string, body: any): Promise<{data: T, status: number}> {
    return this.http<T>(path, 'POST', body);
  }

  put<T>(path: string, body: any): Promise<{data: T, status: number}> {
    return this.http<T>(path, 'PUT', body);
  }


  private async http<T>(path: string, method: string, body?: any): Promise<{data: T, status: number, message?: string}> {
    Logger.api(`executing API|[${method}] request at: 
      ${path} with headers ${JSON.stringify(this.getHeaders())}`);
      
    let response: HttpResponse<T>;

    if (body) {
      response = await fetch(path, {
        method: method,
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
    } else {
      response = await fetch(path, {
        method: method,
        headers: this.getHeaders(),
      });
    }
    try {
      response.parsedBody = await response.json();
      Logger.info(`Response => ${JSON.stringify(response)}`)
    } catch (ex) { }
    if (!response.ok) {
      let errorMessage = response.parsedBody as any
      if (response.status == 401) {
        Logger.info(`Authentication token expired. Refreshing access token.`);
      }
      else if (response.status == 400) {
        Logger.info('Getting bad request response, status code 400');
        return {data: response.parsedBody, status: response.status, message: errorMessage.message};
      }
      else if (response.status == 404) {
        Logger.info('Getting not found response, status code 404');
        return {data: response.parsedBody, status: response.status, message: errorMessage.message};
      }
      else if (response.status == 422) {
        Logger.info('Getting unprocessable entity, status code 422');
        return {data: response.parsedBody, status: response.status, message: errorMessage.message};
      }
      else if (response.status == 500) {
        Logger.info('Getting Internal server error, status code 500');

        return {data: response.parsedBody, status: response.status, message: errorMessage.message};
      }
      throw new Error(`Request failed, see the info above. Code: ${response.status} -> ${response.statusText}`);
    }
    return {data: response.parsedBody, status: response.status};
  }
}
