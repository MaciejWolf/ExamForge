import express, { Express } from 'express';
import { configureDesignModule } from './design/index';
import { createDesignRouter } from './design/http';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  app.use('/api/design', createDesignRouter(configureDesignModule()));

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
