import { BaseService } from './api';

class RootService extends BaseService {
  // Health and test endpoints
  async getHealthCheck() {
    return this.fetchApi('/health');
  }

  async getTest() {
    return this.fetchApi('/api/test');
  }
}

export const rootService = new RootService();
