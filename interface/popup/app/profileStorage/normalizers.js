import { DEFAULT_PROFILE_STORAGE_SETTINGS } from '../constants.js';

export function normalizeSettings(settings = {}) {
  const normalizedSettings = {
    ...DEFAULT_PROFILE_STORAGE_SETTINGS,
    ...(settings || {}),
  };

  return {
    acceptedInsecureHttpWarning: Boolean(
      normalizedSettings.acceptedInsecureHttpWarning
    ),
    configured: Boolean(normalizedSettings.configured),
    mode: normalizedSettings.mode === 'cloud' ? 'cloud' : 'local',
    serverUrl: String(normalizedSettings.serverUrl || '')
      .trim()
      .replace(/\/+$/, ''),
    token: String(normalizedSettings.token || '').trim(),
  };
}

export function normalizeProfile(profile = {}) {
  const now = new Date().toISOString();
  const createdAt = normalizeDate(
    profile.createdAt || profile.updatedAt || now
  );
  const updatedAt = normalizeDate(profile.updatedAt || createdAt);

  return {
    ...profile,
    groupName: profile.groupName || profile.group || 'Default',
    cookies: Array.isArray(profile.cookies) ? profile.cookies : [],
    createdAt,
    updatedAt,
  };
}

export function toRemoteProfile(profile) {
  return {
    id: isUuid(profile.id) ? profile.id : undefined,
    name: profile.name,
    group: profile.groupName || profile.group || 'Default',
    cookies: Array.isArray(profile.cookies) ? profile.cookies : [],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    tags: Array.isArray(profile.tags) ? profile.tags : [],
  };
}

function normalizeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
}
