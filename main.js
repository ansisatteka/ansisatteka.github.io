import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'

var editor = null;


async function SetUpFilesystem() {
  window.fs = new LightningFS('fs')
  window.pfs = window.fs.promises

  window.dir = '/ansisatteka.github.io.git'
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
    url: 'https://github.com/ansisatteka/ansisatteka.github.io.git',
    ref: 'master',
    singleBranch: true,
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
  let ret1 = await pfs.readdir(path);

  for (let el of ret1) {
    let ret2 = await pfs.stat(path + el);
    let entry = document.createElement('div');
    let fp = path + el;
    let oldContent = ""
    entry.innerHTML = fp;
    entry.addEventListener("click", async function () {

      let sha = await git.resolveRef({ fs, dir: '/ansisatteka.github.io.git', ref: 'master' })
      console.log(sha)
      let commit = await git.readCommit({ fs, dir: '/ansisatteka.github.io.git', oid: sha })
      console.log(commit.commit.tree)
      let tree = await git.readObject({
        fs,
        dir: '/ansisatteka.github.io.git',
        oid: commit.commit.tree
      })
      let blob = tree.object.entries.find(b => b.path == el) //TODO: could be undefined
      if (blob) {
        let b = await git.readObject({
          fs,
          dir: '/ansisatteka.github.io.git',
          oid: blob.oid
        })
        oldContent = new TextDecoder().decode(b.object);
      }

      console.log(oldContent)

      document.getElementById("openFiles").innerHTML = fp
      let contents = await pfs.readFile(fp, { encoding: "utf8" })

      let lang = "javascript";
      if (el.endsWith(".js")) {
        lang = "javascript";
      } else if (el.endsWith(".css")) {
        lang = "css";
      } else if (el.endsWith(".html")) {
        lang = "html";
      }
      
      let model = monaco.editor.createModel(contents, lang);

      editor.setModel(model);

    });
    explorer.appendChild(entry);
    if (ret2.type == "dir") {
      await setUpExplorer(explorer, pfs, path + el + "/");
    }

  }
}

async function setUpEverything() {
  let pfs = await SetUpFilesystem()
  setUpExplorer(document.getElementById("explorer"), pfs, "/");
  setUpEditor("click on a file")
}

setUpEverything()