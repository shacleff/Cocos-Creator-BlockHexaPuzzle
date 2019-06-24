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
        shadowOpacity : 90
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        this.hinted = false;
    },
    
    createShadowOn(prefab){
        this.shadow = cc.instantiate(prefab);
        // this.shadow.setPosition(0,0);
        this.shadow.setPosition(this.node.position);
        this.shadow.setContentSize(this.node.getContentSize());
        // this.node.addChild(this.shadow);
        window.gamePlay.node.addChild(this.shadow, 2);
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
    setHint(spriteFrame){
        this.setShadow(spriteFrame);
        this.shadow.zIndex = 2;
        this.hinted = true;
    },
    hideShadow(force){
        if(!this.hinted || force)
            this.shadow.opacity = 0;
    },

    update(dt){
        if(this.hinted)
        {
            if(this.block){
                let blockCom = this.block.getComponent('Block');
                let hexaHint = this.shadow.getComponent(cc.Sprite);
                if(blockCom && hexaHint){
                    if(blockCom.isHold){
                        this.shadow.opacity = this.shadowOpacity;
                    }else if(blockCom.hintFrame && blockCom.hintFrame.name == hexaHint.spriteFrame.name){
                        this.shadow.opacity = 0;
                    }
                }else{
                    this.shadow.opacity = this.shadowOpacity;
                }
            }else{
                this.shadow.opacity = this.shadowOpacity;
            }
        }
    },

    clear(){
        this.shadow.destroy();
    }

});
