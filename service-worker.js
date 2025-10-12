
// v19.1 HOTFIX SW — cache killer / self-unregister
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', async event => {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch(e) {}
  try {
    const regs = await self.registration.unregister();
  } catch(e) {}
  // Claim clients so the page can continue without a SW
  self.clients.claim();
});
// Do NOT intercept fetch — allow network to bypass SW entirely.
