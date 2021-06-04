import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'

window.fs = new LightningFS('fs')
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
  await git.clone({
    fs,
    http,
    dir,
    corsProxy: 'https://cors.isomorphic-git.org',
    url: 'https://github.com/isomorphic-git/isomorphic-git',
    ref: 'main',
    singleBranch: true,
    depth: 2
  });

  // Now it should not be empty...
  return await pfs.readdir(dir);
}

function SetUpBrowser(data) {

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
      value: [data
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    });
  });

}

async function setUpEverything() {
  var data = await SetUpFilesystem()
  console.log(data);
  SetUpBrowser(data)
}

setUpEverything()