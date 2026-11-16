<script>import { ui, S } from '../lib/state.svelte.js';</script>
{#if S.wx?.phase === 'run'}<div class="banner"><span>Written exam in progress</span><a class="btn dark" href="#wexam">Resume</a></div>{/if}
{#if ui.sess && !ui.sess.done}<div class="banner"><span>Unfinished: {ui.sess.title} (question {ui.sess.i + 1} of {ui.sess.qs.length})</span><a class="btn dark" href="#quiz">Resume</a></div>{/if}
