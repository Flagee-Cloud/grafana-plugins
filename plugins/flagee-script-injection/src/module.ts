import { AppPlugin } from '@grafana/data';

import { applyInjection } from './injection';
import { ConfigPage } from './pages/ConfigPage';
import { RootPage } from './pages/RootPage';

applyInjection();

export const plugin = new AppPlugin()
  .setRootPage(RootPage)
  .addConfigPage({
    title: 'Config',
    icon: 'cog',
    id: 'config',
    body: ConfigPage,
  });
