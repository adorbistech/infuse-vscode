import * as vscode from 'vscode';

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('INFUSE');
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [INFO] ${message}`);
  }

  public debug(message: string): void {
    const config = vscode.workspace.getConfiguration('infuse');
    const logLevel = config.get<string>('logLevel', 'info');
    if (logLevel === 'debug') {
      const timestamp = new Date().toISOString();
      this.outputChannel.appendLine(`[${timestamp}] [DEBUG] ${message}`);
    }
  }

  public warn(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [WARN] ${message}`);
  }

  public error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    const details = error instanceof Error ? ` - ${error.message}` : error ? ` - ${String(error)}` : '';
    this.outputChannel.appendLine(`[${timestamp}] [ERROR] ${message}${details}`);
  }

  public show(): void {
    this.outputChannel.show(true);
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}
