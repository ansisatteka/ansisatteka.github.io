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
    value: 
      'console.log("Hello world!");',
    language: 'javascript',
    theme: 'vs-dark'
  });
});

import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'
const fs = new LightningFS('fs')

const dir = '/test-clone'
git.clone({ fs, http, dir, url: 'https://github.com/isomorphic-git/lightning-fs', corsProxy: 'https://cors.isomorphic-git.org' }).then(console.log)
