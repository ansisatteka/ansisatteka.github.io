export async function fileExplorerInit(explorer, path, fileClick, level) {
  let files = await pfs.readdir(path);

  for (let file of files) {
    /* Ignore GIT internal directories */
    if (file == ".git") {
      continue;
    }

    let fullPath = path + file
    let finfo = await pfs.stat(fullPath);
    let prefix = "|".repeat(level)

    let entry = document.createElement('div');
    entry.className = "fileExplorerEntry"

    if (finfo.type == "file") {
      entry.addEventListener("click", async function () { fileClick(path, file) });
    } else if (finfo.type == "dir") {
      entry.addEventListener("click", async function () { fileClick(path, file) });

      prefix += ">"
    }
    entry.innerHTML = prefix + file;

    explorer.appendChild(entry);
    /* Recursively go into child directories */
    if (finfo.type == "dir") {
      await fileExplorerInit(explorer, fullPath + "/", fileClick, level + 1);
    }

  }
}
