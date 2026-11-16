<script>import { ui } from '../lib/state.svelte.js';</script>
{#if ui.sess && !ui.sess.done}<div class="banner"><span>Unfinished: {ui.sess.title} (question {ui.sess.i + 1} of {ui.sess.qs.length})</span><a class="btn dark" href="#quiz">Resume</a></div>{/if}
