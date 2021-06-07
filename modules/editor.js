var editor = null;
var activeTab = null;
export var activeFiles = new Map()
var activeFile = ""

export function editorInit(explorer, data) {

  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
  window.MonacoEnvironment = { getWorkerUrl: () => proxy };

  let proxy = URL.createObjectURL(new Blob([`
    self.MonacoEnvironment = {
      baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
    };
    importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
  `], { type: 'text/javascript' }));

  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.createDiffEditor(explorer, {
      value: [data].join('\n'),
      language: 'javascript',
      theme: 'vs-dark',
      renderSideBySide: false
    });
  });

}

export function editorRefocus(ttt) {
  if (activeTab) {
    activeTab.elem.id = ""
  }

  activeTab = ttt;
  ttt.elem.id = "openFileActive";

  editor.setModel({
    original: ttt.old_model,
    modified: ttt.model
  });
}