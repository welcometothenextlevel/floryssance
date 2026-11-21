(function () {
  var IG_DM = 'https://ig.me/m/floryssance_chay';
  var img = function (set, n, w) { return 'assets/img/' + set + '-' + n + '-' + (w || 1100) + '.jpg'; };

  /* header border on scroll */
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- composer ---------- */
  var form = document.getElementById('builder');
  var out = document.getElementById('message');
  var note = document.getElementById('copy-note');
  var pImg = document.getElementById('preview-img');
  var pCap = document.getElementById('preview-cap');

  var previews = {
    'rouge': ['rouge-initiale-l', 1, 'Vingt-cinq roses rouges, initiale L'],
    'rouge pailleté': ['rouge-paillete', 3, 'Dix roses rouges pailletées'],
    'fuchsia': ['fuchsia-initiale-m', 1, 'Vingt roses fuchsia, initiale M et couronne'],
    'rose et blanc': ['rose-blanc-lys', 1, 'Roses roses et blanches, avec lys'],
    'pêche et blanc': ['peche-lys', 1, 'Pêche et blanc, lys et carte « Merci »']
  };

  function val(name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function field(name) { return form.elements[name]; }

  function toggleFields() {
    field('rosesAutre').hidden = val('roses') !== 'autre';
    field('lettre').hidden = !field('initiale').checked;
    field('mot').hidden = !field('carte').checked;
  }

  function formatDate(v) {
    if (!v) return '';
    var d = new Date(v + 'T12:00:00');
    try { return d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' }); }
    catch (e) { return v; }
  }

  function buildMessage() {
    var roses = val('roses') === 'autre' ? (field('rosesAutre').value || '…') : val('roses');
    var lines = ['Bonjour Floryssance !', "J'aimerais commander un bouquet :", ''];
    lines.push('– ' + roses + ' roses, ' + val('couleur'));
    if (field('initiale').checked) lines.push('– Initiale en roses blanches : ' + (field('lettre').value.toUpperCase() || '…'));
    if (field('couronne').checked) lines.push('– Couronne en strass');
    if (field('lys').checked) lines.push('– Avec des lys');
    lines.push('– Papier ' + val('papier'));
    if (field('carte').checked) lines.push('– Carte : « ' + (field('mot').value.trim() || '…') + ' »');
    var d = formatDate(field('date').value);
    if (d) lines.push('', 'Pour le ' + d + '.');
    lines.push('', 'Merci !');
    return lines.join('\n');
  }

  var lastPreview = 'fuchsia';
  function updatePreview() {
    var c = val('couleur');
    var key = c;
    var p = previews[key];
    if (!p || lastPreview === key) return;
    lastPreview = key;
    pImg.classList.add('is-swapping');
    var next = new Image();
    next.onload = function () {
      pImg.src = next.src;
      pImg.classList.remove('is-swapping');
    };
    next.src = img(p[0], p[1]);
    pCap.textContent = 'Bouquet déjà réalisé : ' + p[2] + '.';
  }

  function refresh() { toggleFields(); out.textContent = buildMessage(); updatePreview(); }
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  refresh();

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', '');
      t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } finally { t.remove(); }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var w = window.open(IG_DM, '_blank', 'noopener');
    copy(buildMessage()).then(function () {
      note.textContent = 'Message copié. Collez-le dans la conversation Instagram qui vient de s’ouvrir.';
    }, function () {
      note.textContent = 'Copiez le message ci-dessus, puis collez-le dans la conversation Instagram.';
    });
    if (!w) location.href = IG_DM;
  });
  document.getElementById('copy-only').addEventListener('click', function () {
    copy(buildMessage()).then(function () { note.textContent = 'Message copié.'; }, function () { note.textContent = 'Sélectionnez le message pour le copier.'; });
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCount = document.getElementById('lb-count');
  var cur = { set: '', count: 1, i: 1, title: '' }, opener = null;

  function show(i) {
    cur.i = (i - 1 + cur.count) % cur.count + 1;
    lbImg.src = img(cur.set, cur.i);
    lbImg.alt = cur.title + ', photo ' + cur.i + ' sur ' + cur.count;
    lbCount.textContent = cur.i + ' / ' + cur.count;
    var multi = cur.count > 1;
    document.getElementById('lb-prev').hidden = !multi;
    document.getElementById('lb-next').hidden = !multi;
  }
  document.querySelectorAll('.card__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      opener = b;
      cur.set = b.dataset.set; cur.count = +b.dataset.count; cur.title = b.dataset.title;
      lbTitle.textContent = cur.title;
      show(+b.dataset.start || 1);
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      document.documentElement.style.overflow = 'hidden';
    });
  });
  function close() { if (lb.open) lb.close(); }
  lb.addEventListener('close', function () { document.documentElement.style.overflow = ''; if (opener) opener.focus(); });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { show(cur.i - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(cur.i + 1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(cur.i + 1);
    if (e.key === 'ArrowLeft') show(cur.i - 1);
  });
  lb.querySelector('.lightbox__frame').addEventListener('click', function (e) { if (e.target === e.currentTarget) close(); });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(cur.i + (dx < 0 ? 1 : -1));
  });
})();
