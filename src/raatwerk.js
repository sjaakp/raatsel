
window = self;  // to keep tau-prolog.js happy; expects window != undefined

function Werk(id, options, data) {
    let loc = location.pathname;
    this.dir = loc.substring(0, loc.lastIndexOf('/') + 1);

    // importScripts  only works for local scripts!
    importScripts(this.dir + 'tau-prolog.js', this.dir + 'pl-sjaakp.js');

    this.session = pl.create(20000);

    this.session.consult(this.dir + 'raatsel.pl', {
        script: false,
        success: () => {
            this.query('init.');
        },
        error: () => console.log(' consult error', 'raatsel.pl')
    });
    this.session.consult(this.dir + 'oplossing.pl', {
        script: false,
    });
}

Werk.prototype = {

    query(q, maxAnswers = 10)
    {
        this.session.query(q, {
            success: () => {
                this.answers(q, maxAnswers);
            },
            error: () => console.log('query error', q),
        });
    },

    answers(query, max = 10)
    {
        if (max > 0)    {
            this.session.answer(
                {
                    success: (a) => {
                        if (query === 'retractall(mag(_,_)).')  {
                            this.session.consult(this.opl, {
                                script: false,
                                success: () => {
                                    postMessage({ command: 'setChecks', pars: [ ] });
                                },
                                error: () => console.log(' consult error', 'opl')
                            });
                        }
                        else postMessage({ command: 'showAnswer', pars: [ query, this.session.format_answer(a) ] });
                        this.answers( query, max-1 );
                    },
                    error: (e) => { console.log(query, 'error', e); },
                    fail: () => {
                        postMessage({ command: 'failOrLimit', pars: [ query, 'fail' ] });
                        },
                    limit: () => {
                        postMessage({ command: 'failOrLimit', pars: [ query, 'limit' ] });
                        },
                }
            );
        }
    },

    plusMag(par1, par2)
    {
        this.query(`assertz(mag(${par1}, ${par2})).`)
    },

    minMag(par1, par2)
    {
        this.query(`retract(mag(${par1}, ${par2})).`)
    },

    laad(opl)
    {
        this.opl = opl;
        this.query( 'retractall(mag(_,_)).');
        console.log('laad', opl);
    }
};

const werk = new Werk(0, 0, 0);

onmessage = e => {
    werk[e.data.command].apply(werk, e.data.pars);
};

leegCel = (celAtom) =>
{
    postMessage({ command: 'emptyCell', pars: [ celAtom ] });
}

vulCel = (celAtom, txtAtom) =>
{
    postMessage({ command: 'fillCell', pars: [ celAtom, txtAtom ] });
}

console.log('self', self);
console.log('pl', pl);
