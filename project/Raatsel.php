<?php
/**
 * MIT licence
 * Version 2.0.0
 * Sjaak Priester, Amsterdam 05-07-2015 ... 15-08-2019.
 *
 * Widget for date related data in Yii 2.0 framework
 */

namespace sjaakp\raatsel\project;

use yii\base\Widget;
use yii\base\InvalidConfigException;
use yii\helpers\Html;
use yii\helpers\Json;

class Raatsel extends Widget {

    /**
     * @var array
     * Client options for the Raatsel widget.
     */
    public $options = [];

    /**
     * @var array
     * HTML options of the Raatsel container.
     * Use this if you want to explicitly set the ID.
     */
    public $htmlOptions = [];

    /**
     */
    public function init()  {
        if (isset($this->htmlOptions['id'])) {
            $this->setId($this->htmlOptions['id']);
        }
        else $this->htmlOptions['id'] = $this->getId();
        Html::addCssClass($this->htmlOptions, 'r-raatsel');
    }

    protected function renderButtons()  {
        $fixBtns = Html::radioList('fix', null,
            array_merge($this->fixedText, $this->nucText),
            [ 'id' => 'id-fix', 'class' => 'r-radios' ]);

        $celBtns = Html::checkboxList('cel', null, $this->celText,
            [ 'id' => 'id-cel', 'class' => 'r-checks',
                'item' => function($i, $label, $name, $checked, $val) {
                    $cb = Html::checkbox($name, $checked, [ 'id' => 'cel' . $i, 'value' =>$val ]);
                    return Html::label($cb . ' ' . $label);
                }]);

        $leftColumn = Html::tag('div', $fixBtns, [ 'class' => 'col-6' ]);
        $rightColumn = Html::tag('div', $celBtns, [ 'class' => 'col-6' ]);

        return Html::tag('div', $leftColumn . $rightColumn, [ 'class' => 'row' ]);
    }

    /**
     * @return string|void
     */
    public function run()   {
        $view = $this->getView();

        $asset = new RaatselAsset();
        $asset->register($view);

        $cells = [];

        $fixed = [
            [ 1, 0, 'nw' ],
            [ 0, 1, 'w' ],
            [ 1, 2, 'ne'],
            [ 2, 2, 'nw' ],
            [ 3, 1, 'e' ],
            [ 2, 0, 'ne' ]
        ];

        $fixedNumber = 0;

        foreach ($fixed as $f)  {
            $wrapClasses = [
                'r-fixed-wrap',
                'r-fixed-col-' . $f[0],
                'r-fixed-row-' . $f[1],
                'r-fixed-' . $f[2],
            ];
            $classes = [
                'r-fixed',
            ];
            $id = 'fixed-' . $fixedNumber;
            $options = [ 'id' => $id ];
            Html::addCssClass($options, $classes);
            $wrapOptions = [];
            Html::addCssClass($wrapOptions, $wrapClasses);
            $inner = Html::tag('div', $this->fixedText['fix' . $fixedNumber], $options);
            $cells[] = Html::tag('div', $inner, $wrapOptions);
            $fixedNumber++;
        }

        $cellNumber = 0;
        $nucleusNumber = 0;

        for($nCells = 4, $beginRow = 5; $nCells <= 7; $nCells++, $beginRow += 2)    {
            $cells = array_merge($cells, $this->cellRow($nCells, 2, $beginRow, $cellNumber, $nucleusNumber));
        }
        for($nCells = 6, $beginCol = 3, $beginRow = 12; $nCells >= 4; $nCells--, $beginRow ++, $beginCol ++)    {
            $cells = array_merge($cells, $this->cellRow($nCells, $beginCol, $beginRow, $cellNumber, $nucleusNumber));
        }

        $id = $this->getId();
        $view->registerJs("
            raatsel('$id', 0, 0);
        ");

        echo Html::tag('div', implode("\n", $cells), $this->htmlOptions)
            . $this->renderButtons();
    }

    protected function cellRow($nCells, $beginCol, $beginRow, &$cellNumber, &$nucleusNumber)   {
        $colors = [ 'green', 'aqua', 'white', 'blue'];
        $r = [];
        for ($i = 0; $i < $nCells; $i++)    {
            $tint = $beginRow & 3;
            if ($beginCol >= 5) $tint ^= 2;
            if ($beginCol == 7) $tint ^= 2;
            if (abs($beginCol - 5) == 1) $tint ^= 2;
//            $tint += $beginRow & 1;
            $nucleus = $tint == 2;
            $wrapClasses = [
                'r-wrap',
                'r-col-' . $beginCol++,
                'r-row-' . $beginRow--
            ];
            $classes = [
                $nucleus ? 'r-nucleus' : 'r-cell',
                'r-' . $colors[$tint],
            ];
            $id = $nucleus ? 'nucleus-' . $nucleusNumber++ : 'cell-' . $cellNumber++;
            $wrapOptions = [];
            Html::addCssClass($wrapOptions, $wrapClasses);
            $options = [ 'id' => $id ];
            Html::addCssClass($options, $classes);
            $inner = Html::tag('div', $id, $options);
            $r[] = Html::tag('div', $inner, $wrapOptions);
        }
        return $r;
    }

    protected $nucleusCells = [
        [ 0, 1, 4, 5, 8, 9 ],
        [ 2, 3, 5, 6, 10, 11 ],
        [ 7, 8, 13, 14, 17, 18 ],
        [ 9, 10, 14, 15, 19, 20 ],
        [ 11, 12, 15, 16, 21, 22 ],
        [ 18, 19, 23, 24, 26, 27 ],
        [ 20, 21, 24, 25, 28, 29 ]
    ];

    protected $fixedCells = [
        [ 0, 1, 2, 3 ],
        [ 0, 4, 7, 13 ],
        [ 13, 17, 23, 26 ],
        [ 26, 27, 28, 29 ],
        [ 16, 22, 25, 29 ],
        [ 3, 6, 12, 16 ]
    ];

    protected $fixedText = [
        'fix0' => 'Begint met een L',
        'fix1' => 'Stripfiguur',
        'fix2' => 'Veel alcohol',
        'fix3' => 'Noord-Brabant',
        'fix4' => 'In China',
        'fix5' => 'Aan het hof',
    ];

    protected $nucText = [
        'nuc0' => 'Dier',
        'nuc1' => 'Dubbelop',
        'nuc2' => 'Jongensnaam',
        'nuc3' => 'Kapitein',
        'nuc4' => 'Oranje',
        'nuc5' => 'Taal',
        'nuc6' => 'Voetbal',
    ];
    
    protected $celText = [
        'cel0' => 'Aanvoerder',
        'cel1' => 'Aramees',
        'cel2' => 'Best',
        'cel3' => 'DirkJan',
        'cel4' => 'Drents',
        'cel5' => 'Frans',
        'cel6' => 'Garfield',
        'cel7' => 'Haddock',
        'cel8' => 'Jack Sparrow',
        'cel9' => 'Jean-Pierre',
        'cel10' => 'Kantonees',
        'cel11' => 'Kieft',
        'cel12' => 'Klaar-over',
        'cel13' => 'Koeman',
        'cel14' => 'Lamstraal',
        'cel15' => 'Linus',
        'cel16' => 'Lodewijk-Napoleon',
        'cel17' => 'Lucas',
        'cel18' => 'Made',
        'cel19' => 'Mandarijn',
        'cel20' => 'Maurits',
        'cel21' => 'Mikado',
        'cel22' => 'Nemo',
        'cel23' => 'Pekinees',
        'cel24' => 'Rob',
        'cel25' => 'Roodbaard',
        'cel26' => 'Slang',
        'cel27' => 'Spits',
        'cel28' => 'Willem II',
        'cel29' => 'Wouw',
    ];
}
