// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import HexagonGroup from './HexagonGroup.js';

cc.Class({
    extends: cc.Component,

    properties: {
        group:{
            default: null,
            type: HexagonGroup,
            visible: false,
        },
        row: {
            default: -1,
            visible: false
        },
        column: {
            default: -1,
            visible: false
        },
        block: {    
            default: null,
            visible: false,
            type: cc.Node
        },
        shadow:{
            default: null,
            visible: false,
        },
        shadowOpacity : 120
    },
    // LIFE-CYCLE CALLBACKS:
    
    createShadowOn(prefab){
        this.shadow = cc.instantiate(prefab);
        this.shadow.setPosition(0,0);
        this.shadow.setContentSize(this.node.getContentSize());
        this.node.addChild(this.shadow);
        this.shadow.opacity = 0;
    },
    setShadow(spriteFrame){
        if(this.shadow && this.shadow.opacity == 0){
            let sprite = this.shadow.getComponent(cc.Sprite);
            if(sprite)sprite.spriteFrame = spriteFrame;
            this.shadow.setContentSize(this.node.getContentSize());
            this.shadow.opacity = this.shadowOpacity;
        }
    },
    hideShadow(){
        this.shadow.opacity = 0;
    }

});
