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

var openFilesContainer = document.getElementById("openFilesContainer")
var activeTab = null;
var activeFiles = new Map()
var activeFile = ""


function getLangFromFile(file) {
  if (file.endsWith(".js")) {
    return "javascript";
  } else if (file.endsWith(".css")) {
    return "css";
  } else if (file.endsWith(".html")) {
    return "html";
  }
  return "text";
}

async function getGitVersion(file) {
  let oldContent = ""
  let sha = await git.resolveRef({ fs, dir: '/ansisatteka.github.io.git', ref: 'master' })
  let commit = await git.readCommit({ fs, dir: '/ansisatteka.github.io.git', oid: sha })
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
  return oldContent;
}

function editorRefocus(ttt) {
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

async function activeFileOpen(path, file) {
  let fullPath = path + file;

  if (!activeFiles.has(fullPath)) {
    /* File is not yet open */

    let oldContent = await getGitVersion(file)
    let contents = await pfs.readFile(fullPath, { encoding: "utf8" })

    let lang = getLangFromFile(file);
    let old_model = monaco.editor.createModel(oldContent, lang);
    let model = monaco.editor.createModel(contents, lang);


    let newTab = document.createElement("div")
    let fileSpan = document.createElement("span")
    let closeButton = document.createElement("button")

    fileSpan.innerHTML = fullPath;
    newTab.className = "openFile";

    let ttt = { elem: newTab, model: model, old_model: old_model }
    fileSpan.addEventListener("click", function () {
      editorRefocus(ttt)
    })
    closeButton.innerHTML = "x"
    closeButton.addEventListener("click", function () {
      pfs.writeFile(fullPath, model.getValue())
      openFilesContainer.removeChild(newTab);//TODO: does this leave dangling button html element?
      activeFiles.delete(fullPath)
      //TODO: need to call editorRefocus() with the file that was previously open
    })
    newTab.appendChild(fileSpan)

    newTab.appendChild(closeButton)
    openFilesContainer.appendChild(newTab);
    activeFiles.set(fullPath, ttt)
    editorRefocus(ttt)
  } else {
    /* File is already open. Just refocus */
    let ttt = activeFiles.get(fullPath)
    editorRefocus(ttt)

  }

}

async function fileExplorerInit(explorer, path) {
  let files = await pfs.readdir(path);

  for (let file of files) {
    /* Ignore GIT internal directories */
    if (file == ".git") {
      continue;
    }

    let fullPath = path + file
    let finfo = await pfs.stat(fullPath);

    let entry = document.createElement('div');
    entry.innerHTML = fullPath;
    if (finfo.type == "file") {
      entry.addEventListener("click", async function () {
        activeFileOpen(path, file);
      });
    }
    explorer.appendChild(entry);
    /* Recursively go into child directories */
    if (finfo.type == "dir") {
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