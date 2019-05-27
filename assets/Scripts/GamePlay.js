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
        this.listHexagons = [];
        this.listHexagonsGroup = [];
        this.generateGridPosition();
        this.generateHexagons(this.numberHexagons, this.numberHexagonsGroup);
    },

    generateHexagons(numberObject, numberGroup){
        this.listHexagonsGroup.length = 0;
        if(this.hexagonPrefab && numberObject > 0 && numberGroup > 0){
            let number = this.numberHexagons;
            while(number > 0){
                if(this.listHexagonsGroup.length == 0){
                    // this.createHexagonsAt(this.sizePlayBoard.width / 2, this.sizePlayBoard.height / 4);
                    --number;
                }else{

                }
            }

            //@TODO: only test
            for(let row = 0; row <= (~~this.sizePlayBoard.height / 2); ++row){
                for(let column = 0; column < this.sizePlayBoard.width; ++column){
                    let position = this.grid[row][column];
                    if(typeof position !== "undefined" && position){
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

    createHexagonsAt(row, column){
        if(this.hexagonPrefab){
            let hexagon = cc.instantiate(this.hexagonPrefab);
            if(hexagon){
                let position = this.grid[~~row][~~column];
                if(typeof position !== "undefined" && position){
                    hexagon.setPosition(position);
                    hexagon.setContentSize(this.sizeHexagonOnBoard);
                    this.node.addChild(hexagon);
                }
            }else{
                return null;
            }
        }
        return null;
    },

    getDirectOfHexagon(direct, row, column){ //use "30 - 120 - 210 - 300 in direct param"
        switch(direct){
            case "30":
                break;
            case "120":
                break;
            case "210":
                break;
            case "300":
                break;      
        }
    },

    generateGridPosition(){
        //calculate size hexagon
        let measureSide = this.node.width < this.node.height ? this.node.width : this.node.height;
        this.sizeHexagonOnBoard = cc.size(measureSide / (this.sizePlayBoard.width + 1), measureSide / (this.sizePlayBoard.width + 1));

        //create grid
        this.grid.length = 0;
        let halfWidth = this.sizePlayBoard.width / 3.0; //3 because this is hexagon
        let halfHeight = this.sizePlayBoard.height / 3.0;
        let startX = this.pointCenterPlayBoard.x - halfWidth * this.sizeHexagonOnBoard.width - this.marginBetweenHexa * halfWidth;
        let startY = this.pointCenterPlayBoard.y - halfHeight * this.sizeHexagonOnBoard.height - this.marginBetweenHexa * halfHeight;
        let x = startX, y = startY;
        let distanceX = this.sizeHexagonOnBoard.width * 0.75 + this.marginBetweenHexa * 2;
        let distanceY = this.sizeHexagonOnBoard.height*0.5 + this.marginBetweenHexa;
        let distance2Row = this.sizeHexagonOnBoard.height + this.marginBetweenHexa * 2;
        let numberRows = ~~(this.sizePlayBoard.height / 2);
        for(let row = 0; row <= numberRows; ++row){
            this.grid.push(new Array);
            for(let column = 0; column < this.sizePlayBoard.width; ++column){
                if(row < numberRows || column%2==1){
                    let py = (column % 2 == 0) ? y : y - distanceY;
                    this.grid[row].push(cc.v2(x, py));
                }else{
                    this.grid[row].push(null);
                }
                x += distanceX;
            }
            y+= distance2Row;
            x = startX;
        }
    },



    start () {

    },

    // update (dt) {},
});
