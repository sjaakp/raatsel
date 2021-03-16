
/*!
 * Raatsel 1.0.0
 * (c) 2021 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/raatsel
 * https://sjaakpriester.nl
 */

/*
 * Timescale 2.3.0
 * (c) 2019-2020 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/timescale
 * https://sjaakpriester.nl
 */

function createDiv()
{
    var classNames = [], len = arguments.length;
    while ( len-- ) classNames[ len ] = arguments[ len ];

    return createElement.apply(void 0, [ 'div' ].concat( classNames ))
}

function createElement(tag)
{
    var ref;

    var classNames = [], len = arguments.length - 1;
    while ( len-- > 0 ) classNames[ len ] = arguments[ len + 1 ];
    var r = document.createElement(tag);
    (ref = r.classList).add.apply(ref, classNames);
    return r;
}

var loc = new URL(document.currentScript.src).pathname;

function Main(id, options, data) {
    var this$1 = this;

    if (! window.Worker)    {
        console.error('Deze browser ondersteunt geen Worker-threads');
        return;
    }

    // this.id = id;
    this.settings = Object.assign({ debug: false }, this.defaults, options);
    this.data = data;

    this.dir = loc.substring(0, loc.lastIndexOf('/') + 1);

    this.element = document.getElementById(id);
    this.element.classList.add('r-raatsel');

    this.currentButton = 'vast0';

    this.createBoard();

    this.createRibbon();
    this.createButtons();

    var load = createElement('button',  'btn', 'btn-outline-secondary', 'btn-sm', 'r-load' );
    load.innerText = 'Laad oplossing';
    load.addEventListener('click', function (e) { this$1.load(); });

    this.element.append(load);

    if (this.settings.debug)    {
        var save = createElement('button',  'btn', 'btn-outline-secondary', 'btn-sm', 'r-load', 'ml-2' );
        save.innerText = 'Toon oplossing in console';
        save.addEventListener('click', function (e) { this$1.query('oplossing(L).'); });
        this.element.append(save);
    }

    this.worker = new Worker(this.dir + 'raatwerk.js');
    this.worker.onmessage = function (e) {
        this$1[e.data.command].apply(this$1, e.data.pars);
    };
    console.log(this);
}

Main.prototype = {

    defaults: {},

    createBoard: function createBoard() {
        var this$1 = this;

        this.board = createDiv('r-board');
        this.element.appendChild(this.board);

        this.createFixed();

        var nucs = [
                {row: 8, col: 5},
                {row: 4, col: 5},
                {row: 6, col: 3},
                {row: 10, col: 3},
                {row: 12, col: 5},
                {row: 10, col: 7},
                {row: 6, col: 7}
            ],
            cells = [
                {row: 6, col: 5, clr: 'green'},    // 0
                {row: 7, col: 4, clr: 'aqua'},
                {row: 9, col: 4, clr: 'blue'},
                {row: 10, col: 5, clr: 'green'},
                {row: 9, col: 6, clr: 'aqua'},
                {row: 7, col: 6, clr: 'blue'},
                {row: 5, col: 4, clr: 'blue'},
                {row: 8, col: 3, clr: 'green'},
                {row: 11, col: 4, clr: 'aqua'},
                {row: 11, col: 6, clr: 'blue'},

                {row: 8, col: 7, clr: 'green'},    // 10
                {row: 5, col: 6, clr: 'aqua'},
                {row: 2, col: 5, clr: 'green'},
                {row: 3, col: 4, clr: 'aqua'},
                {row: 4, col: 3, clr: 'green'},
                {row: 5, col: 2, clr: 'aqua'},
                {row: 7, col: 2, clr: 'blue'},
                {row: 9, col: 2, clr: 'aqua'},
                {row: 11, col: 2, clr: 'blue'},
                {row: 12, col: 3, clr: 'green'},

                {row: 13, col: 4, clr: 'blue'},    // 20
                {row: 14, col: 5, clr: 'green'},
                {row: 13, col: 6, clr: 'aqua'},
                {row: 12, col: 7, clr: 'green'},
                {row: 11, col: 8, clr: 'aqua'},
                {row: 9, col: 8, clr: 'blue'},
                {row: 7, col: 8, clr: 'aqua'},
                {row: 5, col: 8, clr: 'blue'},
                {row: 4, col: 7, clr: 'green'},
                {row: 3, col: 6, clr: 'blue'}
            ];

        nucs.forEach(function (v, i) {
            this$1.createCell('nuc' + i, 'nucleus', v.row, v.col);
        });
        cells.forEach(function (v, i) {
            this$1.createCell('cel' + i, 'cell', v.row, v.col, v.clr);
        });
    },

    createCell: function createCell(id, type, row, column, clr) {
        if ( clr === void 0 ) clr = 'white';

        var wrap = createDiv('r-wrap', 'r-row-' + row, 'r-col-' + column),
            cel = createDiv('r-' + type, 'r-' + clr);
        cel.id = id;
        wrap.appendChild(cel);
        this.board.appendChild(wrap);
    },

    createFixed: function createFixed() {
        var this$1 = this;

        [
            {row: 0, col: 1, c: 'nw'},
            {row: 1, col: 0, c: 'w'},
            {row: 2, col: 1, c: 'ne'},
            {row: 2, col: 2, c: 'nw'},
            {row: 1, col: 3, c: 'e'},
            {row: 0, col: 2, c: 'ne'}
        ].forEach(function (v, i) {
            var wrap = createDiv('r-fixed-wrap', 'r-fixed-row-' + v.row, 'r-fixed-col-' + v.col, 'r-fixed-' + v.c),
                cel = createDiv('r-fixed'),
                id = 'fix' + i;
            cel.id = id;
            wrap.appendChild(cel);
            this$1.board.appendChild(wrap);
        });
    },

    createRibbon: function createRibbon()
    {
        var this$1 = this;

        var search = createElement('button',  'btn', 'btn-primary', 'r-search', 'mb-2' );
        search.innerText = 'Zoek';
        search.addEventListener('click', function (e) { this$1.search(); });

        this.indicator = createDiv('r-indicator');
        var source = createDiv('r-source');
        source.innerText = this.data.bron;

        var version = createDiv('r-version');
        version.id = 'version';

        this.element.append(search, this.indicator, source, version);
    },

    setChecks: function setChecks()
    {
        for (var i = 0; i < 30; i++)    {   // clear all checks
            document.getElementById('kleur_b' + i).checked = false;
        }
        this.query(("mag(" + (this.currentButton) + ", K)."));
    },

    createButtons: function createButtons()
    {
        var this$1 = this;

        var buttons = createDiv('r-buttons'),
            buttonsLeft = createDiv('r-buttons-left'),
            buttonsRight = createDiv('r-buttons-right');

        buttons.append(buttonsLeft, buttonsRight);
        buttonsLeft.addEventListener('change', function (e) {
            this$1.currentButton = e.target.value;
            this$1.setChecks();
        });
        buttonsRight.addEventListener('change', function (e) {
            var t = e.target;
            this$1.worker.postMessage({ command: t.checked ? 'plusMag' : 'minMag', pars: [ this$1.currentButton, t.value ]});
        });

        this.element.appendChild(buttons);

        for (var i = 0; i < 6; i++) {
            this.createButton(buttonsLeft, 'radio', 'vast', i, 'radio');
        }

        for (var i$1 = 0; i$1 < 7; i$1++) {
            this.createButton(buttonsLeft, 'radio', 'wit', i$1, 'radio');
        }

        for (var i$2 = 0; i$2 < 30; i$2++) {
            this.createButton(buttonsRight, 'checkbox', 'kleur', i$2);
        }
    },

    createButton: function createButton(container, type, id, index, name)
    {
        if ( name === void 0 ) name = null;

        var button = createElement('input'),
            label = createElement('label'),
            wrap = createDiv(),
            b_id = id + '_b' + index,
            txt = this.data[id][index];

        button.type = type;
        button.value = id + index;
        button.id = b_id;
        if (id === 'vast' && index === 0) { button.checked = true; }
        if (name) { button.name = name; }
        label.id = id + '_l' + index;
        label.htmlFor = b_id;
        label.innerText = txt; // id + index;
        wrap.append(button, label);
        container.append(wrap);
    },

    clearBoard: function clearBoard() {
        document.querySelectorAll('.r-cell,.r-nucleus').forEach(function (v) {
            v.innerHTML = '';
        });
    },

    getText: function getText(atom)
    {
        var found = atom.match(/(\D+)(\d+)/);
        return this.data[found[1]][found[2]];
    },

    emptyCell: function emptyCell(celAtom)
    {
        document.getElementById(celAtom).innerText = '';
    },

    fillCell: function fillCell(celAtom, textAtom)
    {
        document.getElementById(celAtom).innerText = this.getText(textAtom);
    },

    search: function search()
    {
        this.found = false;
        this.then = Date.now();
        this.clearBoard();
        this.indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.query('zoek.');
    },

    load: function load()
    {
        var opl = this.data.oplossing || [],
            oTxt = opl.reduce(function (acc, v) { return acc + "mag(" + v + ").\n"; }, '');
        this.worker.postMessage({ command: 'laad', pars: [ oTxt ]});
    },

    query: function query(q, maxAnsw)
    {
        if ( maxAnsw === void 0 ) maxAnsw = 10;

        this.worker.postMessage({ command: 'query', pars: [ q, maxAnsw ]});
    },

    showAnswer: function showAnswer(query, answer)
    {
        if (query === 'init.')  {
            this.query('current_prolog_flag(version_data, V).');
        }
        if (query === 'zoek.')  {
            var t = Date.now() - this.then;
            this.indicator.innerHTML = "<i class=\"r-ready far fa-thumbs-up\"></i> " + t + "ms";
            this.found = true;
        }
        var m = answer.match(/tau\(.+\)/);
        if (m)  {
            document.getElementById('version').innerText = m[0];
            this.setChecks('vast0');
        }
        if (query.match(/mag\(\w+, K\)\./)) {
            var m$1 = answer.match(/K = kleur(\d+)/);
            document.getElementById('kleur_b' + m$1[1]).checked = true;
        }
        console.log(query, answer);
    },

    failOrLimit: function failOrLimit(query, result)
    {
        if (query === 'zoek.' && ! this.found) {
            var t = Date.now() - this.then;
            this.indicator.innerHTML = "<i class=\"r-fail far fa-frown\"></i> " + t + "ms";
        }
        console.log('***', query, result);
    }
};

var _raatsel;

window.raatsel = function (id,options,data) {
    _raatsel = new Main(id,options,data);
    return _raatsel;
};
//# sourceMappingURL=raatsel.js.map
