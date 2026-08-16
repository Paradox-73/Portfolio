/* ------------------------------------------------------------------------
   CRT screen effect — index.html

   The look itself is pure CSS (CSS/crt.css), driven by two attributes set
   once on the <html> tag in index.html:

     data-crt   off | subtle | full | heavy   overall strength
     data-scan  on | off                      the static horizontal scanlines

   Ships as heavy with the scanlines off. To change the look, edit those two
   attributes — there is no runtime switcher and nothing is stored.

   This file exists only for the one part CSS cannot do on its own:
   window.crtPowerOn(), the tube's power-on flash. indexscript.js calls it at
   the moment the loader lifts.
------------------------------------------------------------------------ */
(function (global) {
    'use strict';

    global.crtPowerOn = function () {
        var doc = global.document;
        if (doc.documentElement.getAttribute('data-crt') === 'off') return;
        if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var flash = doc.getElementById('crt-flash');
        if (!flash) {
            flash = doc.createElement('div');
            flash.id = 'crt-flash';
            flash.setAttribute('aria-hidden', 'true');
            doc.body.appendChild(flash);
        }
        // Restart the animation even if it fired earlier this session.
        flash.classList.remove('is-firing');
        void flash.offsetWidth;
        flash.classList.add('is-firing');
        global.setTimeout(function () { flash.classList.remove('is-firing'); }, 700);
    };
})(window);
