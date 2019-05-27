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
        //setting gameboard
        sizePlayBoard: cc.size(9,9),
        pointCenterPlayBoard: cc.v2(0,0),

        //setting objects in gameboard
        numberHexagons: 3,
        hexagonPrefab:{
            default: null,
            type: cc.Prefab
        },
        numberHexagonsGroup: 1,
        marginBetweenHexa: 5
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.grid = [];
        this.listHexagonsGroup = [];
        this.generateGridPosition();
        this.generateHexagons(this.numberHexagons, this.numberHexagonsGroup);
    },

    generateHexagons(numberObject, numberGroup){
        this.listHexagonsGroup.length = 0;
        if(this.hexagonPrefab && numberObject > 0 && numberGroup > 0){
            for(let row = 0; row < this.sizePlayBoard.height; ++row){
                for(let column = 0; column < this.sizePlayBoard.width; ++column){
                    let position = this.grid[row][column];
                    if(typeof position !== "undefined"){
                        let hexa = cc.instantiate(this.hexagonPrefab);
                        if(hexa){
                            hexa.setContentSize(this.sizeHexagonOnBoard);
                            hexa.setPosition(position);
                            this.node.addChild(hexa);
                        } 
                    }
                }
            }
        }
    },

    generateGridPosition(){
        //calculate size hexagon
        let measureSide = this.node.width < this.node.height ? this.node.width : this.node.height;
        this.sizeHexagonOnBoard = cc.size(measureSide / (this.sizePlayBoard.width + 1), measureSide / (this.sizePlayBoard.width + 1));

        this.grid.length = 0;
        let halfWidth = this.sizePlayBoard.width / 3.0; //3 because this is hexagon
        let halfHeight = this.sizePlayBoard.height / 3.0;
        let startX = this.pointCenterPlayBoard.x - halfWidth * this.sizeHexagonOnBoard.width - this.marginBetweenHexa * halfWidth;
        let startY = this.pointCenterPlayBoard.y - halfHeight * this.sizeHexagonOnBoard.height - this.marginBetweenHexa * halfHeight;
        let x = startX, y = startY;
        for(let row = 0; row < this.sizePlayBoard.height; ++row){
            this.grid.push(new Array);
            let width = row%2==0 ?  this.sizePlayBoard.width :  this.sizePlayBoard.width - 1;
            for(let column = 0; column < width / 2; ++column){
                this.grid[row].push(cc.v2(x, y));
                x+=this.sizeHexagonOnBoard.width*1.5 + this.marginBetweenHexa * 2;
            }
            y+= this.sizeHexagonOnBoard.height/2 + this.marginBetweenHexa;
            if(row%2==0)x = startX + this.sizeHexagonOnBoard.width * 0.75 + this.marginBetweenHexa;
            else x = startX;
        }
    },

    start () {

    },

    // update (dt) {},
});
