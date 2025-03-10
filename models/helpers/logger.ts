/** simple log printing through console */
export class Logger {
    static info(message: string): void {
      console.log('[INFO]: ', message);
    }
  
    static warn(message: string): void {
      console.log('[WARN]: ', message);
    }
  
    static error(message: string): void {
      console.log('[ERROR]: ', message);
    }

    static api(message: string): void {
      console.log('[API]: ', message);
    }
  }