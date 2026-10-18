// Temporary Destiny download UI. Access is checked by the server only.
const openButton = document.getElementById('destinyDownload');
const dialog = document.getElementById('destinyDownloadDialog');
const form = document.getElementById('destinyDownloadForm');
const password = document.getElementById('destinyPassword');
const version = document.getElementById('destinyVersion');
const submit = document.getElementById('destinyConfirmDownload');
const closeButton = document.getElementById('destinyDialogClose');
const message = document.getElementById('destinyDialogMessage');
const status = document.getElementById('destinyDownloadStatus');

if (openButton && dialog && form && password && version && submit && closeButton && message && status) {
  let request = null;
  let attempt = 0;

  function setBusy(busy) {
    form.setAttribute('aria-busy', String(busy));
    submit.disabled = busy;
    password.disabled = busy;
    version.disabled = busy;
    submit.textContent = busy ? 'Preparing your download…' : 'Download workbook ZIP';
  }

  function clearDialog() {
    attempt += 1;
    request?.abort();
    request = null;
    form.reset();
    password.value = '';
    password.removeAttribute('aria-invalid');
    message.textContent = '';
    setBusy(false);
  }

  function errorMessage(code) {
    if (code === 401) return 'That password was not accepted. Check it and try again.';
    if (code === 403) return 'Please open this page on LINKS and try again.';
    if (code === 404) return 'This private workbook download is no longer available.';
    if (code === 429) return 'Too many attempts. Please wait 15 minutes and try again.';
    if (code === 503) return 'The private download is temporarily unavailable. Please try again shortly.';
    return 'Could not start the download. Check your connection and try again.';
  }

  openButton.addEventListener('click', () => {
    if (dialog.open) return;
    clearDialog();
    status.textContent = '';
    dialog.showModal();
    password.focus();
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', clearDialog);
  password.addEventListener('input', () => password.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    const selectedVersion = version.value;
    if (!['windows', 'mac'].includes(selectedVersion)) return;
    const currentAttempt = ++attempt;
    const activeRequest = new AbortController();
    request = activeRequest;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      activeRequest.abort();
    }, 60000);
    message.textContent = '';
    password.removeAttribute('aria-invalid');
    setBusy(true);
    try {
      const response = await fetch('/new-build/api/workbook-private-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/zip' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: activeRequest.signal,
        body: JSON.stringify({ version: selectedVersion, password: password.value })
      });
      if (currentAttempt !== attempt || !dialog.open) return;
      if (!response.ok) {
        if (response.status === 401) password.setAttribute('aria-invalid', 'true');
        throw new Error(errorMessage(response.status));
      }
      if (!/application\/(?:zip|x-zip-compressed|octet-stream)/i.test(response.headers.get('Content-Type') || '')) {
        throw new Error(errorMessage(503));
      }
      const blob = await response.blob();
      if (currentAttempt !== attempt || !dialog.open) return;
      if (!blob.size) throw new Error(errorMessage(503));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Destiny-NFL-Crew-${selectedVersion === 'mac' ? 'Mac' : 'Windows'}.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      // Confirm only after the full ZIP reached this browser and the save was
      // offered. This does not claim the user saved or opened the workbook.
      const receipt = response.headers.get('X-Workbook-Download-Receipt');
      if (receipt) void fetch('/new-build/api/workbook-private-download', {
        method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',keepalive:true,
        body:JSON.stringify({action:'received',receipt})
      }).catch(()=>{});
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      password.value = '';
      status.textContent = 'Your Destiny workbook download has started.';
      dialog.close();
    } catch (error) {
      if (currentAttempt !== attempt || !dialog.open) return;
      if (error?.name === 'AbortError') {
        if (timedOut) message.textContent = 'The download took too long. Check your connection and try again.';
        return;
      }
      message.textContent = error instanceof TypeError ? errorMessage(0) : error.message || errorMessage(0);
    } finally {
      window.clearTimeout(timeout);
      if (currentAttempt === attempt) {
        request = null;
        setBusy(false);
        if (dialog.open) {
          password.focus();
          password.select();
        }
      }
    }
  });

  window.addEventListener('pagehide', clearDialog);
}
