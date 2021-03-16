
/*!
 * Raatsel 1.0.0
 * (c) 2021 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/raatsel
 * https://sjaakpriester.nl
 */

window = self;  // to keep tau-prolog.js happy; expects window != undefined

function Werk(id, options, data) {
    var this$1 = this;

    var loc = location.pathname;
    this.dir = loc.substring(0, loc.lastIndexOf('/') + 1);

    // importScripts  only works for local scripts!
    importScripts(this.dir + 'tau-prolog.js', this.dir + 'pl-sjaakp.js');

    this.session = pl.create(20000);

    this.session.consult(this.dir + 'raatsel.pl', {
        script: false,
        success: function () {
            this$1.query('init.');
        },
        error: function () { return console.log(' consult error', 'raatsel.pl'); }
    });
    this.session.consult(this.dir + 'oplossing.pl', {
        script: false,
    });
}

Werk.prototype = {

    query: function query(q, maxAnswers)
    {
        var this$1 = this;
        if ( maxAnswers === void 0 ) maxAnswers = 10;

        this.session.query(q, {
            success: function () {
                this$1.answers(q, maxAnswers);
            },
            error: function () { return console.log('query error', q); },
        });
    },

    answers: function answers(query, max)
    {
        var this$1 = this;
        if ( max === void 0 ) max = 10;

        if (max > 0)    {
            this.session.answer(
                {
                    success: function (a) {
                        if (query === 'retractall(mag(_,_)).')  {
                            this$1.session.consult(this$1.opl, {
                                script: false,
                                success: function () {
                                    postMessage({ command: 'setChecks', pars: [ ] });
                                },
                                error: function () { return console.log(' consult error', 'opl'); }
                            });
                        }
                        else { postMessage({ command: 'showAnswer', pars: [ query, this$1.session.format_answer(a) ] }); }
                        this$1.answers( query, max-1 );
                    },
                    error: function (e) { console.log(query, 'error', e); },
                    fail: function () {
                        postMessage({ command: 'failOrLimit', pars: [ query, 'fail' ] });
                        },
                    limit: function () {
                        postMessage({ command: 'failOrLimit', pars: [ query, 'limit' ] });
                        },
                }
            );
        }
    },

    plusMag: function plusMag(par1, par2)
    {
        this.query(("assertz(mag(" + par1 + ", " + par2 + "))."));
    },

    minMag: function minMag(par1, par2)
    {
        this.query(("retract(mag(" + par1 + ", " + par2 + "))."));
    },

    laad: function laad(opl)
    {
        this.opl = opl;
        this.query( 'retractall(mag(_,_)).');
        console.log('laad', opl);
    }
};

var werk = new Werk(0, 0, 0);

onmessage = function (e) {
    werk[e.data.command].apply(werk, e.data.pars);
};

leegCel = function (celAtom) {
    postMessage({ command: 'emptyCell', pars: [ celAtom ] });
};

vulCel = function (celAtom, txtAtom) {
    postMessage({ command: 'fillCell', pars: [ celAtom, txtAtom ] });
};

console.log('self', self);
console.log('pl', pl);
//# sourceMappingURL=raatwerk.js.map
