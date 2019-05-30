// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        grid:{
            default : [],
            visible : false,
        },
        margin : 10,

        testPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    onLoad () {
        // this.generateGrid();
    },

    push(piece){
        let randomPos = this.grid[~~(Math.random() * this.grid.length)];
        let position = window.gamePlay.convertToCanvasPosition(this.node, randomPos);
        console.log(position);
        piece.positionPiecesArea = position;
    },

    generateGrid(){
        let originalSizeHexagon = window.gamePlay.sizeHexagonOnBoard;
        let sizeHexagon = cc.size(originalSizeHexagon.width / 2, originalSizeHexagon.height / 2);
        this.grid.length = 0;
        let center = cc.v2(0,0);
        let distanceX = sizeHexagon.width * 0.75;
        let distanceY = sizeHexagon.height * 0.5;
        let distance2Row = sizeHexagon.height;
        let rangeX = this.node.width / 2 - this.margin - sizeHexagon.width / 2;
        let rangeY = this.node.height / 2 - this.margin - sizeHexagon.height / 2;

        let createColumnAt = startPoint =>{
            this.grid.push(startPoint.clone());
            let countHeight = 1;
            while(true){
                let up = cc.v2(startPoint.x, startPoint.y + distance2Row * countHeight);
                if(up.y < rangeY)this.grid.push(up);
                else break;

                let down = cc.v2(startPoint.x, startPoint.y - distance2Row * countHeight);
                if(down.y > -rangeY)this.grid.push(down);
                else break;
                countHeight++;
            }
        }

        let countColumn = 0;
        while(true){
            if(countColumn != 0){
                let changeY = countColumn % 2 == 1 ? distanceY : 0;
                let left = center.x - distanceX * countColumn;
                if(left > -rangeX)createColumnAt(cc.v2(left, center.y - changeY));
                else break;
                let right = center.x + distanceX * countColumn;
                if(right < rangeX)createColumnAt(cc.v2(right, center.y - changeY));
                else break;
            }else{
                createColumnAt(center);
            }
            countColumn++;
        }

        //For TEst
        // for(let pos of this.grid){
        //     let node =cc.instantiate(this.testPrefab);
        //     node.position = pos;
        //     node.setContentSize(sizeHexagon);
        //     this.node.addChild(node);
        // }
    }
});
