// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import HexagonGroup from 'HexagonGroup.js';
import {EDirection} from 'GamePlay.js';

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
            visible: false
        },
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END, event => {
            if(this.group){
                console.log("Touch at : " + this.row + "-" + this.column);

                //@TODO: test function only
                // let hexagon = window.gamePlay.getHexagonByDirection(EDirection.TOP, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`top : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                // hexagon = window.gamePlay.getHexagonByDirection(EDirection.TOP_LEFT, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`topleft : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                // hexagon = window.gamePlay.getHexagonByDirection(EDirection.TOP_RIGHT, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`topright : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                // hexagon = window.gamePlay.getHexagonByDirection(EDirection.BOT, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`bot : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                // hexagon = window.gamePlay.getHexagonByDirection(EDirection.BOT_LEFT, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`botleft : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                // hexagon = window.gamePlay.getHexagonByDirection(EDirection.BOT_RIGHT, this.row, this.column, this.group);
                // if(typeof hexagon !== "undefined" && hexagon){
                //     cc.log(`botright : ${hexagon.row} - ${hexagon.column}`);
                //     hexagon.node.runAction(cc.repeatForever(cc.fadeIn(1), cc.fadeOut(1)));
                // }
                //end Test

            }else{
                cc.log("group is null");
            }
        }, this)
    },

    setGroup(hexagroup){
        this.group = hexagroup;
    }

});
