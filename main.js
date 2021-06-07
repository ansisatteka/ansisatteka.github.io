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

}

function editorInit(explorer, data) {

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

async function editorUpdateData() {
  let lang = "javascript";
  if (file.endsWith(".js")) {
    lang = "javascript";
  } else if (file.endsWith(".css")) {
    lang = "css";
  } else if (file.endsWith(".html")) {
    lang = "html";
  }
  //updateEditor(path, el);

  let old_model = monaco.editor.createModel(oldContent, lang);
  let model = monaco.editor.createModel(contents, lang);

  editor.setModel({
    original: old_model,
    modified: model
  });
}


var openFilesContainer = document.getElementById("openFilesContainer")
var activeTab = null;
var activeFiles = new Map()
var activeFile = ""


async function activeFileFocus() {

}

async function activeFileOpen(path, file) {
  let fullPath = path + file;
  let oldContent = ""

  let sha = await git.resolveRef({ fs, dir: '/ansisatteka.github.io.git', ref: 'master' })
  console.log(sha)
  let commit = await git.readCommit({ fs, dir: '/ansisatteka.github.io.git', oid: sha })
  console.log(commit.commit.tree)
  let tree = await git.readObject({
    fs,
    dir: '/ansisatteka.github.io.git',
    oid: commit.commit.tree
  })
  let blob = tree.object.entries.find(b => b.path == file) //TODO: could be undefined
  if (blob) {
    let b = await git.readObject({
      fs,
      dir: '/ansisatteka.github.io.git',
      oid: blob.oid
    })
    oldContent = new TextDecoder().decode(b.object);
  }

  console.log(oldContent)

  let contents = await pfs.readFile(fullPath, { encoding: "utf8" })

  let lang = "javascript";
  if (file.endsWith(".js")) {
    lang = "javascript";
  } else if (file.endsWith(".css")) {
    lang = "css";
  } else if (file.endsWith(".html")) {
    lang = "html";
  }
  //updateEditor(path, el);


  let old_model = monaco.editor.createModel(oldContent, lang);
  let model = monaco.editor.createModel(contents, lang);

  editor.setModel({
    original: old_model,
    modified: model
  });


  if (!activeFiles.has(fullPath)) {
    let newTab = document.createElement("div")

    newTab.innerHTML = fullPath;
    newTab.className = "openFile";

    newTab.addEventListener("dblclick", function () {
      pfs.writeFile(fullPath, model.getValue())
      openFilesContainer.removeChild(newTab);
      activeFiles.delete(fullPath)
    })
    newTab.addEventListener("click", function () {
      if (activeTab) {
        activeTab.id = "";
      }
      activeTab = newTab;
      newTab.id = "openFileActive";
      editor.setModel({
        original: old_model,
        modified: model
      });
    })
    if (!activeTab) {
      activeTab = newTab;
      newTab.id = "openFileActive";
    }
    openFilesContainer.appendChild(newTab);
    activeFiles.set(fullPath, {})
  }





}

function activeFileClose(path, file) {



}

function activFileSwitchMode(path, file) {
  let fullPath = path + file;

}

async function fileExplorerInit(explorer, path) {
  let ret1 = await pfs.readdir(path);

  for (let el of ret1) {
    /* Ignore GIT internal directories */
    if (el == ".git") {
      continue;
    }

    let fullPath = path + el
    let ret2 = await pfs.stat(fullPath);

    let entry = document.createElement('div');
    entry.innerHTML = fullPath;
    if (ret2.type == "file") {
      entry.addEventListener("click", async function () {
        activeFileOpen(path, el);
      });
    }
    explorer.appendChild(entry);
    /* Recursively go into child directories */
    if (ret2.type == "dir") {
      await fileExplorerInit(explorer, fullPath + "/");
    }

  }
}

async function setUpEverything() {
  await SetUpFilesystem()
  fileExplorerInit(document.getElementById("explorer"), "/");
  editorInit(document.getElementById('container'), "click on a file")
}

setUpEverything()