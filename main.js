import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'

import { gitGetLastFileVersion } from "./modules/git.js"
import { editorInit, editorRefocus, activeFiles } from "./modules/editor.js"
import { fileExplorerInit } from "./modules/explorer.js"


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




async function activeFileOpen(path, file) {
  let fullPath = path + file;

  if (activeFiles.has(fullPath)) {
    /* File is already open. Just refocus */

    let ttt = activeFiles.get(fullPath)
    editorRefocus(ttt)
  } else {
    /* File is not yet open */

    let oldContent = await gitGetLastFileVersion(file)
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
  }

}

async function setUpEverything() {
  await SetUpFilesystem()
  fileExplorerInit(document.getElementById("explorer"), "/", activeFileOpen, 1);
  editorInit(document.getElementById('container'), document.getElementById("openFilesContainer"), "click on a file")
}

setUpEverything()