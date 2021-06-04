import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js' // Initialize isomorphic-git with a file system

window.fs = new LightningFS('fs') // I prefer using the Promisified version honestly
async function SetUpFilesystem() {
  window.pfs = window.fs.promises

  window.dir = '/tutorial'
  console.log(dir);
  try {
    await pfs.mkdir(dir);
  } catch (e) {

  }
  // Behold - it is empty!
  await pfs.readdir(dir);
}
SetUpFilesystem()

function SetUpBrowser() {

  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
  window.MonacoEnvironment = { getWorkerUrl: () => proxy };

  let proxy = URL.createObjectURL(new Blob([`
    self.MonacoEnvironment = {
      baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
    };
    importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
  `], { type: 'text/javascript' }));

  require(["vs/editor/editor.main"], function () {
    let editor = monaco.editor.create(document.getElementById('container'), {
      value: [
        'function x() {',
        '\tconsole.log("Hello world!");',
        '}'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    });
  });

}