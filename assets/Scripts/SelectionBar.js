// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {EDirection} from 'GamePlay.js';
cc.Class({
    extends: cc.Component,

    properties: {
        grid:{
            default : [],
            visible : false,
        },
        pieces:{    
            default : [],   //number : size each piece
            visible : false,
        },
        margin : 10,

        testPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad () {
        // this.generateGrid();
    },

    clear(){
        this.pieces.length = 0;
        this.gridUse.length = 0;
        this.gridUse = Array.from(this.grid);
    },

    push(piece){
        if(piece.blocks.length > 0){
            // let toLeft = 0, toRight = 0, toUp = 0, toDown = 0;
            // let firstBlock = piece.blocks[0].position;
            // for(let i = 1; i < piece.blocks.length; ++i){
            //     let blockPos = piece.blocks[i].position;
            //     let horizontal = blockPos.x - firstBlock.x;
            //     let vertical = blockPos.y - firstBlock.y;
            //     if(horizontal > 0 && horizontal > toRight)toRight = horizontal;
            //     else if(horizontal < 0 && horizontal < toLeft)toLeft = horizontal;
            //     if(vertical > 0 && vertical > toUp)toUp = vertical;
            //     else if(vertical < 0 && vertical < toDown)toDown = vertical;
            // }
            // let position = cc.Vec2.ZERO;
            // if(rangeX > 0)
            //     position = cc.v2(this.rangeX - toRight, this.rangeY - toUp);
            // this.rangeX = position.x + toLeft - this.sizeHexagon.width;
            
            // this.rangeY = position.y 
            // console.log(`rangeX ${this.rangeX}`);
            // console.log(`to left ${toLeft} - to right ${toRight}`);
            // console.log(position);
            let position = this.grid[~~(Math.random() * this.grid.length)];

            position.addSelf(this.node.position);   //convert to canvas pos
            piece.positionPiecesArea = position;
            piece.revertToPieces(0, true);
        }
    },

    generateGrid(){
        let originalSizeHexagon = window.gamePlay.sizeHexagonOnBoard;
        this.sizeHexagon = cc.size(originalSizeHexagon.width / 2, originalSizeHexagon.height / 2);
        this.grid.length = 0;
        let center = cc.v2(0, 0);
        let distanceX = this.sizeHexagon.width * 0.75;
        let distanceY = this.sizeHexagon.height * 0.5;
        let distance2Row = this.sizeHexagon.height;
        this.rangeX = this.node.width / 2 - this.margin - this.sizeHexagon.width / 2;
        this.rangeY = this.node.height / 2 - this.margin - this.sizeHexagon.height / 2;

        let createColumnAt = startPoint =>{
            this.grid.push(startPoint.clone());
            let countHeight = 1;
            while(true){
                let up = cc.v2(startPoint.x, startPoint.y + distance2Row * countHeight);
                if(up.y < this.rangeY)this.grid.push(up);
                else break;

                let down = cc.v2(startPoint.x, startPoint.y - distance2Row * countHeight);
                if(down.y > -this.rangeY)this.grid.push(down);
                else break;
                countHeight++;
            }
        }

        let countColumn = 0;
        while(true){
            if(countColumn != 0){
                let changeY = countColumn % 2 == 1 ? distanceY : 0;
                let left = center.x - distanceX * countColumn;
                if(left > -this.rangeX)createColumnAt(cc.v2(left, center.y - changeY));
                else break;
                let right = center.x + distanceX * countColumn;
                if(right < this.rangeX)createColumnAt(cc.v2(right, center.y - changeY));
                else break;
            }else{
                createColumnAt(center);
            }
            countColumn++;
        }

        this.maxColumn = countColumn * 2 + 1;
        this.maxRow = ~~(this.grid.length / this.maxColumn);

        // For TEst
        // for(let pos of this.grid){
        //     let node =cc.instantiate(this.testPrefab);
        //     node.position = pos;
        //     node.setContentSize(this.sizeHexagon);
        //     this.node.addChild(node);
        // }
    }
});
