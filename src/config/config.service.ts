import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const rootPath = path.resolve('.env');
const envPath = path.resolve(
  __dirname,
  `../../publish/${process.env.BUILD_ENV || 'dev'}.env`,
);

export class ConfigService {
  static instance: ConfigService;

  envConfig: { [key: string]: string };

  constructor(filePath = '.env') {
    if (ConfigService.instance) {
      return ConfigService.instance;
    }
    const configPath =
      process.env.NODE_ENV != 'production' && fs.existsSync(rootPath)
        ? rootPath
        : envPath;

    Logger.log(`use config path: ${configPath}`, ConfigService.name);

    if (fs.existsSync(configPath)) {
      const cfg = dotenv.config({
        path: configPath,
      });
      if (cfg.parsed) {
        this.envConfig = cfg.parsed;
      }
    }

    if (!this.envConfig) {
      this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    ConfigService.instance = this;

    return this;
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
