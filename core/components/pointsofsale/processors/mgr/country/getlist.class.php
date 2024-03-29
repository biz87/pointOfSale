<?php

class pointsOfSaleCountryGetListProcessor extends modObjectGetListProcessor
{
    public $objectType = 'pof_country';
    public $classKey = 'pof_country';
    public $defaultSortField = 'id';
    public $defaultSortDirection = 'DESC';
    //public $permission = 'list';


    /**
     * We do a special check of permissions
     * because our objects is not an instances of modAccessibleObject
     *
     * @return boolean|string
     */
    public function beforeQuery()
    {
        if (!$this->checkPermissions()) {
            return $this->modx->lexicon('access_denied');
        }

        return true;
    }


    /**
     * @param xPDOQuery $c
     *
     * @return xPDOQuery
     */
    public function prepareQueryBeforeCount(xPDOQuery $c)
    {
        $query = trim($this->getProperty('query'));
        if ($query) {
            $c->where([
                'country:LIKE' => "%{$query}%",
            ]);
        }

        return $c;
    }


    /**
     * @param xPDOObject $object
     *
     * @return array
     */
    public function prepareRow(xPDOObject $object)
    {
        $array = $object->toArray();
        $array['actions'] = [];

        // Edit
        $array['actions'][] = [
            'cls' => '',
            'icon' => 'icon icon-edit',
            'title' => $this->modx->lexicon('pointsofsale_country_update'),
            //'multiple' => $this->modx->lexicon('pointsofsale_items_update'),
            'action' => 'updateCountry',
            'button' => true,
            'menu' => true,
        ];

        if (!$array['active']) {
            $array['actions'][] = [
                'cls' => '',
                'icon' => 'icon icon-power-off action-green',
                'title' => $this->modx->lexicon('pointsofsale_country_enable'),
                'multiple' => $this->modx->lexicon('pointsofsale_countries_enable'),
                'action' => 'enableCountry',
                'button' => true,
                'menu' => true,
            ];
        } else {
            $array['actions'][] = [
                'cls' => '',
                'icon' => 'icon icon-power-off action-gray',
                'title' => $this->modx->lexicon('pointsofsale_country_disable'),
                'multiple' => $this->modx->lexicon('pointsofsale_countries_disable'),
                'action' => 'disableCountry',
                'button' => true,
                'menu' => true,
            ];
        }

        // Remove
        $array['actions'][] = [
            'cls' => '',
            'icon' => 'icon icon-trash-o action-red',
            'title' => $this->modx->lexicon('pointsofsale_country_remove'),
            'multiple' => $this->modx->lexicon('pointsofsale_countries_remove'),
            'action' => 'removeCountry',
            'button' => true,
            'menu' => true,
        ];

        return $array;
    }

}

return 'pointsOfSaleCountryGetListProcessor';