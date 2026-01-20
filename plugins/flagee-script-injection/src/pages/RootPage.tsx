import React from 'react';
import { Alert } from '@grafana/ui';

export const RootPage: React.FC = () => {
  return (
    <div>
      <h3>Flagee Script Injection</h3>
      <p>Use este app para injetar CSS e Javascript de forma nativa no Grafana.</p>
      <Alert title="Configuracao" severity="info">
        Acesse a pagina de configuracao do plugin para definir CSS/JS e URLs externas.
      </Alert>
    </div>
  );
};
