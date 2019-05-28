// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var Hexagon = require('Hexagon.js') 

cc.Class({
    extends: cc.Component,

    properties: {
        hexagons: []    //Hexagon object array
    },

    onLoad () {
    },

    getHexagonAt(row, column){
        return this.hexagons.find(element =>{
            return element.row == row && element.column == column;
        }, this);
    },

    moveBy(offset){
        this.hexagons.forEach(element => {
            let curPos = element.node.getPosition();
            element.node.setPosition(curPos.x + offset.x, curPos.y + offset.y); 
        }, this);
    },

    push(hexagon){
        if(hexagon instanceof cc.Node){
            let hexagonCom = hexagon.getComponent('Hexagon');
            hexagonCom.setGroup(this);
            this.hexagons.push(hexagonCom);
        }
        else 
            cc.log("push wrong hexagon!");
    },

    getNumberHexagons(){
        return this.hexagons.length;
    }
});
