export async function fileExplorerInit(explorer, path, fileClick) {
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
      entry.addEventListener("click", async function () { fileClick(path, file) });
    }
    explorer.appendChild(entry);
    /* Recursively go into child directories */
    if (finfo.type == "dir") {
      await fileExplorerInit(explorer, fullPath + "/", fileClick);
    }

  }
}
