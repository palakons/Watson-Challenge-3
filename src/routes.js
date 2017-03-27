/**
 * Contains all application endpoints
 */

import TestController from './controllers/TestController';
import PersoanalityInsightsController from './controllers/PersoanalityInsightsController';
import TTSController from './controllers/TTSController';

export default {
  '/test': {
    get: {
      method: TestController.testMethod,
      public: true,
    },
  },
  '/insights': {
    get: {
      method: PersoanalityInsightsController.getPersonalityInsights,
      public: true,
    },
  },
  '/speak': {
    get: {
      method: TTSController.getVoice,
      public: true,
    },
  },
};
