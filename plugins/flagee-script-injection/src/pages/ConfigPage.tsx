import React, { useEffect, useState } from 'react';
import { Alert, Button, Field, InlineField, InlineFieldRow, Spinner, Switch, TextArea } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { PLUGIN_ID } from '../constants';

interface PluginSettingsResponse {
  enabled: boolean;
  jsonData?: {
    injectEnabled?: boolean;
    css?: string;
    javascript?: string;
    scriptUrls?: string;
  };
}

export const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [injectEnabled, setInjectEnabled] = useState(true);
  const [css, setCss] = useState('');
  const [javascript, setJavascript] = useState('');
  const [scriptUrls, setScriptUrls] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const settings = (await getBackendSrv().get(
          `/api/plugins/${PLUGIN_ID}/settings`
        )) as PluginSettingsResponse;

        if (!mounted) {
          return;
        }

        setEnabled(settings.enabled ?? true);
        setInjectEnabled(settings.jsonData?.injectEnabled ?? true);
        setCss(settings.jsonData?.css ?? '');
        setJavascript(settings.jsonData?.javascript ?? '');
        setScriptUrls(settings.jsonData?.scriptUrls ?? '');
      } catch (err) {
        if (mounted) {
          setError('Falha ao carregar as configuracoes do plugin.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await getBackendSrv().post(`/api/plugins/${PLUGIN_ID}/settings`, {
        enabled,
        jsonData: {
          injectEnabled,
          css,
          javascript,
          scriptUrls,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError('Falha ao salvar as configuracoes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h3>Injecao de CSS e Javascript</h3>
      <p>Este app injeta CSS e Javascript em todas as paginas do Grafana.</p>
      <Alert title="Reinicio" severity="info">
        Atualize o navegador para aplicar alteracoes, se necessario.
      </Alert>

      {error && (
        <Alert title="Erro" severity="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert title="Salvo" severity="success">
          Configuracoes atualizadas com sucesso.
        </Alert>
      )}

      <InlineFieldRow>
        <InlineField label="Ativar injecao" labelWidth={20}>
          <Switch value={injectEnabled} onChange={(e) => setInjectEnabled(e.currentTarget.checked)} />
        </InlineField>
      </InlineFieldRow>

      <Field label="CSS" description="CSS inline a ser injetado">
        <TextArea value={css} onChange={(e) => setCss(e.currentTarget.value)} rows={10} />
      </Field>

      <Field label="Javascript" description="Javascript inline a ser executado">
        <TextArea value={javascript} onChange={(e) => setJavascript(e.currentTarget.value)} rows={10} />
      </Field>

      <Field label="Script URLs" description="Lista de URLs (uma por linha ou separadas por virgula)">
        <TextArea value={scriptUrls} onChange={(e) => setScriptUrls(e.currentTarget.value)} rows={6} />
      </Field>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};
