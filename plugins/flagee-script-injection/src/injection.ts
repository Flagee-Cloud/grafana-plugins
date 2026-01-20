import { getBackendSrv } from '@grafana/runtime';

import { PLUGIN_ID, SCRIPT_ELEMENT_ID, SCRIPT_URL_ATTR, STYLE_ELEMENT_ID } from './constants';

interface PluginSettings {
  enabled: boolean;
  jsonData?: {
    injectEnabled?: boolean;
    css?: string;
    javascript?: string;
    scriptUrls?: string;
  };
}

const warnPrefix = `[${PLUGIN_ID}]`;

function normalizeScriptUrls(raw?: string): string[] {
  if (!raw) {
    return [];
  }

  const items = raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(items));
}

function ensureStyle(css?: string) {
  if (!css) {
    return;
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    head.appendChild(styleEl);
  }

  styleEl.textContent = css;
}

function ensureInlineScript(js?: string) {
  if (!js) {
    return;
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  let scriptEl = document.getElementById(SCRIPT_ELEMENT_ID) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = SCRIPT_ELEMENT_ID;
    scriptEl.type = 'text/javascript';
    head.appendChild(scriptEl);
  }

  scriptEl.text = js;
}

function ensureScriptUrls(urls: string[]) {
  if (!urls.length) {
    return;
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  const existing = new Set(
    Array.from(document.querySelectorAll(`script[${SCRIPT_URL_ATTR}]`)).map((el) =>
      (el as HTMLScriptElement).src.trim()
    )
  );

  for (const url of urls) {
    if (!url || existing.has(url)) {
      continue;
    }

    const scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.src = url;
    scriptEl.setAttribute(SCRIPT_URL_ATTR, 'true');
    head.appendChild(scriptEl);
  }
}

export async function applyInjection(): Promise<void> {
  try {
    const settings = (await getBackendSrv().get(`/api/plugins/${PLUGIN_ID}/settings`)) as PluginSettings;
    if (!settings?.enabled) {
      return;
    }

    if (settings.jsonData?.injectEnabled === false) {
      return;
    }

    ensureStyle(settings.jsonData?.css);
    ensureInlineScript(settings.jsonData?.javascript);
    ensureScriptUrls(normalizeScriptUrls(settings.jsonData?.scriptUrls));
  } catch (error) {
    // Avoid blocking Grafana load on failures.
    console.warn(`${warnPrefix} Failed to apply CSS/JS injection`, error);
  }
}
