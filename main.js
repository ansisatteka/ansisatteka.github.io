import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'

var editor = null;


async function SetUpFilesystem() {
  window.fs = new LightningFS('fs')
  window.pfs = window.fs.promises

  window.dir = '/SmolNoob7341.github.io.git'
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
    url: 'https://github.com/SmolNoob7341/SmolNoob7341.github.io.git',
    ref: 'SmolNoob',
    singleBranch: true,
    depth: 4
  });

  // Now it should not be empty...
  return pfs;
}

function setUpEditor(data) {

  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
  window.MonacoEnvironment = { getWorkerUrl: () => proxy };

  let proxy = URL.createObjectURL(new Blob([`
    self.MonacoEnvironment = {
      baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
    };
    importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
  `], { type: 'text/javascript' }));

  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById('container'), {
      value: [data
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    });
  });

}

async function setUpExplorer(explorer, pfs, path) {
  var ret1 = await pfs.readdir(path);
  for (var el of ret1) {
    var ret2 = await pfs.stat(path + el);
    var entry = document.createElement('div');
    var fp = path+el;
    entry.innerHTML = fp;
    entry.addEventListener("click", async function () {
      console.log(fp)
      var contents = await pfs.readFile(fp, { encoding: "utf8" })
      var model = monaco.editor.createModel(contents);

      editor.setModel(model);

    });
    explorer.appendChild(entry);
    if (ret2.type == "dir") {
      await setUpExplorer(explorer, pfs, path + el + "/");
    }

  }
}

async function setUpEverything() {
  var pfs = await SetUpFilesystem()
  setUpExplorer(document.getElementById("explorer"), pfs, "/");
  setUpEditor("click on a file")
}

setUpEverything()