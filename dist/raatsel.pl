
% (c) maart 2021, Sjaak Priester, Amsterdam
% https://sjaakpriester.nl

% HTML id's van cellen in diagram:
% fix0... fix5      vaste randcellen
% nuc0... nuc6      witte 'nucleus'-cellen
% cel0... cel29     gekleurde cellen

% Inhoud:
% vast0... vast5    inhoud vaste randcellen (is al gegeven)
% wit0... wit6      inhoud witte 'nucleus'-cellen
% kleur0... kleur29 inhoud gekleurde cellen

% Opgave: verdeel wit- en kleuropties zodanig dat er geen conflicten ontstaan
% mag: vastX/witX enerzijds en kleurY anderzijds verdragen elkaar

:- use_module(library(lists)).
:- use_module(library(js)).

% bevat/3
% ===========
% Elke cel met inhoud heeft een fact bevat(CelId, InhId, Fixed)
% Fixed is true voor de vaste randcellen
:- dynamic(bevat/3).

% mag/2
% ==========
% Als een vast_xx of een wit_xx een kleur_yy naast zich verdraagt,
% zeggen we dat deze  de kleur 'mag'. Dat leggen we vast in dit fact.
:- dynamic(mag/2).

% vorm_atom/3
% ===========
% Vorm atom zoals kleur12 uit Base kleur en Index 12
vorm_atom(Base, Index, Atom) :-
    atom_codes(Base, Bcodes),
    number_codes(Index, Icodes),
    append(Bcodes, Icodes, Acodes),
	atom_codes(Atom, Acodes).

% vul_lijst/3
% ===========
% Vul lijst met K atoms op basis van Base: [ kleur0, kleur1, ... kleur(K-1) ]
vul_lijst(Base, K, Lijst) :-
	vul_lijst(Base, K, 0, Lijst).

vul_lijst(_, K, K, []) :- !.

vul_lijst(Base, K, N, [H|T]) :-
	vorm_atom(Base, N, H),
	succ(N, M),
    vul_lijst(Base, K, M, T).

% zet/3
% ===========
% Plaats een woord in een cel, bijv: zet(cel12, kleur5).
% Gevulde cellen, en dus de toestand van het spel, staan in facts 'bevat',
%   bijvoorbeeld: bevat(cel12, kleur5, false).
% We moeten er rekening mee houden dat er maar één inhoud in een cel kan
%   en dat een inhoud maar één keer geplaatst kan worden.
zet(CelId, _, _) :-
    retract(bevat(CelId, _, _)),            % verwijder eventuele inhoud van CelId
    sp_apply(leegCell, [Elders], _),        % zo ja, maak cel leeg
    fail.

zet(CelId, TxtAtom, _) :-
    bevat(Elders, TxtAtom, _),              % zit TxtAtom al ergens in een cel?
    sp_apply(leegCell, [Elders], _),        % zo ja, maak cel leeg
    retract(bevat(Elders, TxtAtom, _)),     % verwijder fact
    fail.

zet(CelId, TxtAtom, Fixed) :-
    sp_apply(vulCel, [CelId, TxtAtom], _),  % plaats inhoud in cel
    assertz(bevat(CelId, TxtAtom, Fixed)).  % voeg fact toe.

% init/0
% ===========
% Bereid de boel voor, zet de inhoud in de zes
% vaste randcellen, Fixed is true
init :-
    zet(fix0, vast0, true),
    zet(fix1, vast1, true),
    zet(fix2, vast2, true),
    zet(fix3, vast3, true),
    zet(fix4, vast4, true),
    zet(fix5, vast5, true).

% vul_cel/5
% ===========
% Vul Cel met een kandidaat uit Lijst
% zodanig dat het past naast Naast1 en Naast2
vul_cel(Lijst, Cel, Naast1, Naast2, RestLijst) :-
    select(Kandidaat, Lijst, RestLijst),    % kies een kandidaat
    zet(Cel, Kandidaat, false),             % zet de kandidaat in Cel, met Fixed is false
    bevat(Naast1, Inh1, _),                 % haal de inhoud van Naast1
    mag(Inh1, Kandidaat),                   % mag de inhoud de kandidaat?
    bevat(Naast2, Inh2, _),                 % zo ja, ga door en kijk naar Naast2
    mag(Inh2, Kandidaat).                   % als de inhoud van Naast2 de kandidaat ook mag...

% vul_hoek/10
% ===========
% Vul een van de zes hoeken van drie Cellen en een Nuc
% naast FixL en FixR, zodanig dat alles bij elkaar past
vul_hoek(Kleuren, Witten, CelL, CelM, CelR, Nuc, FixL, FixR, RestKleuren, RestWitten) :-
    vul_cel(Kleuren, CelM, FixL, FixR, K1), % zoek inhoud voor de middelste Cel
    bevat(CelM, InhM, _),                   % haal de inhoud van de middelste cel
    select(Wit, Witten, RestWitten),        % kies een kandidaat voor Nuc
    mag(Wit, InhM),                         % mag de kandidaat de inhoud van de middelste cel?
    zet(Nuc, Wit, false),                   % zo ja, zet de kandidaat in Nuc
    vul_cel(K1, CelL, FixL, Nuc, K2),       % zoek inhoud voor de linker-Cel...
    vul_cel(K2, CelR, FixR, Nuc, RestKleuren).  % ... en voor de rechter

% zoek/0
% ===========
% Zoek een complete oplossing
zoek :-
    retractall(bevat(_, _, false)),         % verwijder de restanten van een vorige zoekpoging

    vul_lijst(kleur, 30, Kleuren),          % maak lijsten met 30 kleuren en 7 witten
    vul_lijst(wit, 7, Witten),

    % vul de bovenste hoek, daarbij kiezend uit de compleet gevulde lijsten
    vul_hoek(Kleuren, Witten, cel13, cel12, cel29, nuc1, fix0, fix5, Kr1, Wr1),

    % vul de tweede hoek, daarbij kiezend uit de lijsten met restanten van de eerste hoek
    vul_hoek(Kr1, Wr1, cel16, cel15, cel14, nuc2, fix1, fix0, Kr2, Wr2),

    % enzovoorts
    vul_hoek(Kr2, Wr2, cel19, cel18, cel17, nuc3, fix2, fix1, Kr3, Wr3),
    vul_hoek(Kr3, Wr3, cel22, cel21, cel20, nuc4, fix3, fix2, Kr4, Wr4),
    vul_hoek(Kr4, Wr4, cel25, cel24, cel23, nuc5, fix4, fix3, Kr5, Wr5),
    vul_hoek(Kr5, Wr5, cel28, cel27, cel26, nuc6, fix5, fix4, Kr6, Wr6),
    % als we hier komen, zijn zes hoeken gevuld: 6 Nuc's en 6 * 3 = 18 cellen

    [H|_] = Wr6,                            % in de lijst Witten zit nog maar één kandidaat
    zet(nuc0, H, false),                    % zet die in de centrum-Nuc; we hebben 7 Nuc's

    vul_cel(Kr6, cel6, nuc1, nuc2, Kr7),    % vul de Cel tussen de eerste twee cirkel-Nucs
    vul_cel(Kr7, cel7, nuc2, nuc3, Kr8),    % enzovoorts
    vul_cel(Kr8, cel8, nuc3, nuc4, Kr9),
    vul_cel(Kr9, cel9, nuc4, nuc5, Kr10),
    vul_cel(Kr10, cel10, nuc5, nuc6, Kr11),
    vul_cel(Kr11, cel11, nuc6, nuc1, Kr12), % nu zijn 24 Cellen gevuld, nog 6 te gaan


    vul_cel(Kr12, cel0, nuc0, nuc1, Kr13),  % vul de cel tussen de centrum-Nuc en de eerste cirkel-Nuc
    vul_cel(Kr13, cel1, nuc0, nuc2, Kr14),  % ... de tweede...
    vul_cel(Kr14, cel2, nuc0, nuc3, Kr15),  % enzovoorts
    vul_cel(Kr15, cel3, nuc0, nuc4, Kr16),
    vul_cel(Kr16, cel4, nuc0, nuc5, Kr17),
    vul_cel(Kr17, cel5, nuc0, nuc6, _),     % nu zijn alle Cellen gevuld
    !.