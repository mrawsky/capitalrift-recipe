<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <div class="chunk-guide" :class="{ 'chunk-guide--compact': compact }">
    <ol class="chunk-steps">
      <li><span>01</span><div><strong>Open the restaurant</strong><p>Select the restaurant or shop you want to optimize in Capital Rift.</p></div></li>
      <li><span>02</span><div><strong>Open DevTools → Network</strong><p>Use your browser developer tools, choose Network, then open the building again or refresh the view.</p></div></li>
      <li><span>03</span><div><strong>Select <code>building-info</code></strong><p>Look for a request beginning <code>building-info?ref=player%2F…</code> and open its <strong>Response</strong> tab.</p></div></li>
      <li><span>04</span><div><strong>Copy only <code>chunkId</code></strong><p>Copy the complete value in <code>zoom/tileX/tileY</code> format, including both slashes.</p></div></li>
    </ol>

    <div class="network-schematic network-schematic--real" role="img" aria-label="Capital Rift developer tools Network response with the building-info request selected and chunkId 15 slash 18179 slash 10741 highlighted">
      <div class="devtools-tabs">
        <span>Headers</span><span>Payload</span><span>Preview</span><strong>Response</strong><span>Initiator</span><span>Timing</span>
      </div>
      <div class="network-grid">
        <div class="request-list">
          <strong>Name</strong>
          <span class="active"><b aria-hidden="true">{}</b> building-info?ref=player%2F…</span>
          <span><b aria-hidden="true">{}</b> building-info?ref=player%2F…</span>
        </div>
        <pre>{
  "ref": "player/03d34d26-…",
  <mark>"chunkId": "15/18179/10741"</mark>,
  "label": "Shops",
  "archetype": "commercial",
  "subtype": "shop_block"
}</pre>
      </div>
    </div>

    <p class="guide-note"><strong>Sanity check:</strong> the same response should describe the building you selected. If you see another building or a neighboring map request, return to the game and reopen the restaurant.</p>
  </div>
</template>

