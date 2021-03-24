<?php
/*
 * Timescale 2.2.0
 * (c) 2019-2020 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/timescale
 * https://sjaakpriester.nl
 */

namespace sjaakp\raatsel\project;

use Yii;
use yii\web\AssetBundle;

/**
 * Class TimescaleAsset
 * @package sjaakp\timescale
 * Helper class for developing and debugging
 */
class RaatselAsset extends AssetBundle
{
    public $css = [
        'raatsel.css'
    ];

    public $js = [
        'raatsel.js'
    ];

    public $publishOptions = [
        'forceCopy' => YII_DEBUG
    ];

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->sourcePath = Yii::getAlias('@sjaakp/raatsel') . DIRECTORY_SEPARATOR . 'dist';
        parent::init();
    }
}