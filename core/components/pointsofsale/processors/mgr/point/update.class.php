<?php

class pointsOfSalePointUpdateProcessor extends modObjectUpdateProcessor
{
    public $objectType = 'pof_point';
    public $classKey = 'pof_point';
    public $languageTopics = ['pointsofsale'];
    //public $permission = 'save';


    /**
     * We doing special check of permission
     * because of our objects is not an instances of modAccessibleObject
     *
     * @return bool|string
     */
    public function beforeSave()
    {
        if (!$this->checkPermissions()) {
            return $this->modx->lexicon('access_denied');
        }

        return true;
    }


    /**
     * @return bool
     */
    public function beforeSet()
    {
        return parent::beforeSet();
    }
}

return 'pointsOfSalePointUpdateProcessor';
