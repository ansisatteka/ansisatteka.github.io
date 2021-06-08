export const name = 'git';

export async function gitGetLastFileVersion(file) {
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
