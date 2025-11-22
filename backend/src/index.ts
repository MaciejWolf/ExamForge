import express, { Express } from 'express';
import { configureDesignModule, DesignModuleConfig } from './design/index';
import { createDesignRouter } from './design/http';

export type AppConfig = {
  designModule?: DesignModuleConfig;
};

export const createApp = (config: AppConfig = {}): Express => {
  const app = express();

  app.use(express.json());

  const designModule = configureDesignModule(config.designModule);
  app.use('/api/design', createDesignRouter(designModule));

  return app;
};

const app = createApp();
const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;

