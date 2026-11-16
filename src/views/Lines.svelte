<script>let { rows } = $props(); // [label, percent, right-hand text]</script>
<div class="lines">{#each rows as [l, p, r]}<div class="ln"><span>{l}</span><span class="bar"><i style="width:{p}%"></i></span><span>{r}</span></div>{/each}</div>
