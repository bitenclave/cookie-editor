import { icon } from './icon.js';

export function toolsPanelTemplate() {
  return `
    <section class="tab-panel" id="tools-panel" data-tab="tools">
      ${exportSectionTemplate()}
      ${importSectionTemplate()}
    </section>
  `;
}

function exportSectionTemplate() {
  return `
    <section class="tool-section">
      <h2>Export</h2>
      <div class="tool-grid">
        <label>
          Format
          <select id="export-format">
            <option value="json">JSON</option>
            <option value="netscape">Netscape</option>
            <option value="headerstring">Headers</option>
          </select>
        </label>
        <label>
          Scope
          <select id="export-scope">
            <option value="all">All visible</option>
            <option value="selected">Selected</option>
            <option value="currentDomain">Current domain</option>
          </select>
        </label>
      </div>
      <div class="export-actions">
        <button class="button primary" id="copy-export" type="button">
          ${icon('copy')}
          <span>Copy</span>
        </button>
        <div class="download-actions" aria-label="Download export">
          <button class="button" type="button" data-download-export="json">
            JSON
          </button>
          <button class="button" type="button" data-download-export="netscape">
            Netscape .txt
          </button>
          <button
            class="button"
            type="button"
            data-download-export="headerstring">
            Headers .txt
          </button>
        </div>
      </div>
      <textarea
        id="export-output"
        class="code-area"
        readonly
        placeholder="Export output appears here"></textarea>
    </section>
  `;
}

function importSectionTemplate() {
  return `
    <section class="tool-section">
      <h2>Import</h2>
      <div id="dropzone" class="dropzone" tabindex="0">
        ${icon('file-import')}
        <span>Drop a cookie file or paste below</span>
      </div>
      <textarea
        id="import-input"
        class="code-area"
        placeholder='[{"name":"session","value":"..."}]'></textarea>
      <div class="import-meta">
        <span id="import-detected">No format detected</span>
        <span id="import-preview-count">0 cookies</span>
      </div>
      <div id="import-preview" class="preview-list"></div>
      <button class="button primary" id="run-import" type="button">
        Import Cookies
      </button>
    </section>
  `;
}
