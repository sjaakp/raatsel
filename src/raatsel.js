import './raatsel.scss';
import * as Utils from './Utils';

let loc = new URL(document.currentScript.src).pathname;

function Main(id, options, data) {
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

    let load = Utils.createElement('button',  'btn', 'btn-outline-secondary', 'btn-sm', 'r-load' );
    load.innerText = 'Laad oplossing';
    load.addEventListener('click', e => { this.load(); });

    this.element.append(load);

    if (this.settings.debug)    {
        let save = Utils.createElement('button',  'btn', 'btn-outline-secondary', 'btn-sm', 'r-load', 'ml-2' );
        save.innerText = 'Toon oplossing in console';
        save.addEventListener('click', e => { this.query('oplossing(L).'); });
        this.element.append(save);
    }

    this.worker = new Worker(this.dir + 'raatwerk.js');
    this.worker.onmessage = e => {
        this[e.data.command].apply(this, e.data.pars);
    };
    console.log(this);
}

Main.prototype = {

    defaults: {},

    createBoard() {
        this.board = Utils.createDiv('r-board');
        this.element.appendChild(this.board);

        this.createFixed();

        const nucs = [
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

        nucs.forEach((v, i) => {
            this.createCell('nuc' + i, 'nucleus', v.row, v.col);
        });
        cells.forEach((v, i) => {
            this.createCell('cel' + i, 'cell', v.row, v.col, v.clr);
        });
    },

    createCell(id, type, row, column, clr = 'white') {
        let wrap = Utils.createDiv('r-wrap', 'r-row-' + row, 'r-col-' + column),
            cel = Utils.createDiv('r-' + type, 'r-' + clr);
        cel.id = id;
        wrap.appendChild(cel);
        this.board.appendChild(wrap);
    },

    createFixed() {
        [
            {row: 0, col: 1, c: 'nw'},
            {row: 1, col: 0, c: 'w'},
            {row: 2, col: 1, c: 'ne'},
            {row: 2, col: 2, c: 'nw'},
            {row: 1, col: 3, c: 'e'},
            {row: 0, col: 2, c: 'ne'}
        ].forEach((v, i) => {
            let wrap = Utils.createDiv('r-fixed-wrap', 'r-fixed-row-' + v.row, 'r-fixed-col-' + v.col, 'r-fixed-' + v.c),
                cel = Utils.createDiv('r-fixed'),
                id = 'fix' + i;
            cel.id = id;
            wrap.appendChild(cel);
            this.board.appendChild(wrap);
        });
    },

    createRibbon()
    {
        let search = Utils.createElement('button',  'btn', 'btn-primary', 'r-search', 'mb-2' );
        search.innerText = 'Zoek';
        search.addEventListener('click', e => { this.search(); });

        this.indicator = Utils.createDiv('r-indicator');
        let source = Utils.createDiv('r-source');
        source.innerText = this.data.bron;

        let version = Utils.createDiv('r-version');
        version.id = 'version';

        this.element.append(search, this.indicator, source, version);
    },

    setChecks()
    {
        for (let i = 0; i < 30; i++)    {   // clear all checks
            document.getElementById('kleur_b' + i).checked = false;
        }
        this.query(`mag(${this.currentButton}, K).`);
    },

    createButtons()
    {
        let buttons = Utils.createDiv('r-buttons'),
            buttonsLeft = Utils.createDiv('r-buttons-left'),
            buttonsRight = Utils.createDiv('r-buttons-right');

        buttons.append(buttonsLeft, buttonsRight);
        buttonsLeft.addEventListener('change', e => {
            this.currentButton = e.target.value;
            this.setChecks();
        });
        buttonsRight.addEventListener('change', e => {
            let t = e.target;
            this.worker.postMessage({ command: t.checked ? 'plusMag' : 'minMag', pars: [ this.currentButton, t.value ]});
        });

        this.element.appendChild(buttons);

        for (let i = 0; i < 6; i++) {
            this.createButton(buttonsLeft, 'radio', 'vast', i, 'radio');
        }

        for (let i = 0; i < 7; i++) {
            this.createButton(buttonsLeft, 'radio', 'wit', i, 'radio');
        }

        for (let i = 0; i < 30; i++) {
            this.createButton(buttonsRight, 'checkbox', 'kleur', i);
        }
    },

    createButton(container, type, id, index, name = null)
    {
        let button = Utils.createElement('input'),
            label = Utils.createElement('label'),
            wrap = Utils.createDiv(),
            b_id = id + '_b' + index,
            txt = this.data[id][index];

        button.type = type;
        button.value = id + index;
        button.id = b_id;
        if (id === 'vast' && index === 0) button.checked = true;
        if (name) button.name = name;
        label.id = id + '_l' + index;
        label.htmlFor = b_id;
        label.innerText = txt; // id + index;
        wrap.append(button, label);
        container.append(wrap);
    },

    clearBoard() {
        document.querySelectorAll('.r-cell,.r-nucleus').forEach(v => {
            v.innerHTML = '';
        })
    },

    getText(atom)
    {
        let found = atom.match(/(\D+)(\d+)/);
        return this.data[found[1]][found[2]];
    },

    emptyCell(celAtom)
    {
        document.getElementById(celAtom).innerText = '';
    },

    fillCell(celAtom, textAtom)
    {
        document.getElementById(celAtom).innerText = this.getText(textAtom);
    },

    search()
    {
        this.found = false;
        this.then = Date.now();
        this.clearBoard();
        this.indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.query('zoek.');
    },

    load()
    {
        let opl = this.data.oplossing || [],
            oTxt = opl.reduce((acc, v) => acc + `mag(${v}).\n`, '');
        this.worker.postMessage({ command: 'laad', pars: [ oTxt ]})
    },

    query(q, maxAnsw = 10)
    {
        this.worker.postMessage({ command: 'query', pars: [ q, maxAnsw ]})
    },

    showAnswer(query, answer)
    {
        if (query === 'init.')  {
            this.query('current_prolog_flag(version_data, V).');
        }
        if (query === 'zoek.')  {
            let t = Date.now() - this.then;
            this.indicator.innerHTML = `<i class="r-ready far fa-thumbs-up"></i> ${t}ms`;
            this.found = true;
        }
        let m = answer.match(/tau\(.+\)/);
        if (m)  {
            document.getElementById('version').innerText = m[0];
            this.setChecks('vast0');
        }
        if (query.match(/mag\(\w+, K\)\./)) {
            let m = answer.match(/K = kleur(\d+)/);
            document.getElementById('kleur_b' + m[1]).checked = true;
        }
        console.log(query, answer);
    },

    failOrLimit(query, result)
    {
        if (query === 'zoek.' && ! this.found) {
            let t = Date.now() - this.then;
            this.indicator.innerHTML = `<i class="r-fail far fa-frown"></i> ${t}ms`;
        }
        console.log('***', query, result);
    }
}

let _raatsel;

window.raatsel = (id,options,data) => {
    _raatsel = new Main(id,options,data);
    return _raatsel;
}
