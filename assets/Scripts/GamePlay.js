// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Hexagon from 'Hexagon.js';

export const EDirection = cc.Enum({
    TOP: 0,
    BOT: 1,
    TOP_LEFT: 2,
    BOT_LEFT: 3,
    TOP_RIGHT: 4,
    BOT_RIGHT: 5     
});

let Range = cc.Class({
    name: "Range",
    properties:{
        min: 0,
        max: 0
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        //setting gameboard
        maxSizePlayBoard: cc.size(9,9),    //use to modify properties panel easily, please use : this.realSizePlay for logic
        pointCenterPlayBoard: cc.v2(0,0),
        ignoreFinal : false,
        //setting objects in gameboard
        hexagonPrefab:{
            default: null,
            type: cc.Prefab
        },
        hexagonGroupPrefab:{
            default: null,
            type: cc.Prefab
        },
        numberHexagonsGroup: 1,
        totalNumberHexagons:{
            type: Range,
            default: null
        },
        marginBetweenHexa: 5,
        maxDifferenceWidthHeight: 4,
        //pieces - blocks
        blockPrefab:{
            default: null,
            type: cc.Prefab
        },
        blockTypes:{
            default: [],
            type: cc.Color
        },
        numberPieces : {
            type: Range,
            default: null
        },
        numberBlockEachPieces : {
            type: Range,
            default: null
        }
        
    },

    // LIFE-CYCLE CALLBACKS:

    start () {
        window.gamePlay = this;
        this.realSizePlay = cc.size(this.maxSizePlayBoard.width, this.maxSizePlayBoard.height);
        this.sizeGenerate = cc.size(0, 0);
        this.positionStartGenHexa = {row : this.realSizePlay.height / 2, column : this.realSizePlay.width / 2};
        this.numberHexagons = this.getRandom(this.totalNumberHexagons.min, this.totalNumberHexagons.max);
        this.rangeGenerateHexa = this.calculateRangeGenHexa();
        this.maxHexagon = this.realSizePlay.width * this.realSizePlay.height;
        this.grid = [];
        this.listHexagonsGroup = [];    //HexagonsGroup array
        this.generateGridPosition();
        console.log("Number hexagon : " + this.numberHexagons);
        this.generateHexagons(this.numberHexagons, this.numberHexagonsGroup);
        this.generatePieceOnHexagons();
    },

    generatePieceOnHexagons(){
        let listColors = Array.from(this.blockTypes);
        listColors = this.suffleArray(listColors);
        let numberPieces = this.getRandom(this.numberPieces.min, this.numberPieces.max);
        listColors.splice(numberPieces, listColors.length);
        let totalBlocks = this.numberHexagons;
        console.log("Number Pieces : " + numberPieces);
        let listHexagon = Array.from(this.listHexagonsGroup[0].hexagons);    //0 is Test!
        for(let i = 0; i < numberPieces - 1; ++i){
            let color = listColors[listColors.length - 1];
            let numberBlock = this.getRandom(this.numberBlockEachPieces.min, this.numberBlockEachPieces.max);
            //generate block
            for(let count = 0; count < numberBlock; ++count){
                this.createBlockAtHexagonNode(listHexagon[listHexagon.length - 1], color);
                listHexagon.pop();
            }
            listColors.pop();
            totalBlocks -= numberBlock;
        }
        //final pieces with the rest
        listHexagon.forEach(hexagon =>{
            this.createBlockAtHexagonNode(hexagon, listColors[0]);
        }, this);
    },

    //@param : hexagon : is a Hexagon object 
    createBlockAtHexagonNode(hexagon, color){
        let piece = cc.instantiate(this.blockPrefab);
        piece.color = color;
        piece.setPosition(hexagon.node.position);
        piece.setContentSize(this.sizeHexagonOnBoard.width * 0.9, this.sizeHexagonOnBoard.height * 0.9);
        this.node.addChild(piece);
        return piece;
    },

    generateHexagons(numberObject, numberGroup){
        this.listHexagonsGroup.length = 0;
        if(this.hexagonPrefab && this.hexagonGroupPrefab && numberObject > 0 && numberGroup > 0 && numberGroup < numberObject){
            if(numberObject > this.maxHexagon)numberObject = this.maxHexagon;
            if(numberObject > this.rangeGenerateHexa.width * this.rangeGenerateHexa.height)
                numberObject = this.rangeGenerateHexa.width * this.rangeGenerateHexa.height;
            let numberObjectTemp = numberObject;
            let maxSizeToGen = {row: this.positionStartGenHexa.row + this.rangeGenerateHexa.height / 2,
                                column: this.positionStartGenHexa.column + this.rangeGenerateHexa.width / 2};
            let minSizeToGen = {row: maxSizeToGen.row - this.rangeGenerateHexa.height,
                                column: maxSizeToGen.column - this.rangeGenerateHexa.width};
            // cc.debug("khanh");

            for(let i = 0; i < numberGroup; ++i){
                let hexagonsGroup = cc.instantiate(this.hexagonGroupPrefab);
                let hexagonsGroupCom = hexagonsGroup.getComponent('HexagonGroup');
                if(hexagonsGroupCom){
                    this.listHexagonsGroup.push(hexagonsGroupCom);
                    while(numberObjectTemp > 0){
                        let generate = (hexagonStart, number) =>{
                            if(hexagonStart){
                                let listGenerated = this.generateRandomAroundAHexagon(hexagonStart, number, minSizeToGen, maxSizeToGen);
                                listGenerated.forEach(hexagon =>{
                                    hexagonsGroupCom.push(hexagon);
                                }, this);
                                numberObjectTemp-= listGenerated.length;
                            }
                        };

                        if(hexagonsGroupCom.getNumberHexagons() == 0){
                            let hexagon = this.createHexagonsAt(this.positionStartGenHexa.row, this.positionStartGenHexa.column);
                            if(hexagon){
                                hexagonsGroupCom.push(hexagon);
                                --numberObjectTemp;
                            }
                        }else if(hexagonsGroupCom.getNumberHexagons() == 1){
                            if(numberObjectTemp > 6)generate(hexagonsGroupCom.hexagons[0], 6);
                            else generate(hexagonsGroupCom.hexagons[0], numberObjectTemp);
                        }else{
                            // console.log("con lai : " + numberObjectTemp);
                            let randomStart = hexagonsGroupCom.hexagons[~~(Math.random() * hexagonsGroupCom.hexagons.length - 1) + 1]
                            if(randomStart){
                                generate(randomStart, 1);
                            }
                        }
                    }
                    // this.listHexagonsGroup.push(hexagonsGroupCom);
                }
            }
        }

        //@TODO: only test Grid
        // let hexagonsGroup = cc.instantiate(this.hexagonGroupPrefab);
        // let hexagonsGroupCom = hexagonsGroup.getComponent('HexagonGroup');
        // if(hexagonsGroupCom){
        //     for(let row = 0; row < this.grid.length; ++row)
        //         for(let column = 0; column < this.grid[row].length; ++column){
        //             hexagonsGroupCom.push(this.createHexagonsAt(row, column));
        //         }
        //     this.listHexagonsGroup.push(hexagonsGroupCom);
        // }
        //end test
    },

    //@Return : a cc.Node included a Hexagon object
    createHexagonsAt(row, column){
        if(this.hexagonPrefab){
            let hexagon = cc.instantiate(this.hexagonPrefab);
            if(hexagon){
                row = ~~row;
                column = ~~column;
                try {
                    let position = this.grid[row][column];
                    let hexagonCom = hexagon.getComponent('Hexagon');
                    if(hexagonCom){
                        hexagonCom.row = row;
                        hexagonCom.column = column;
                    }
                    hexagon.setPosition(position);
                    hexagon.setContentSize(this.sizeHexagonOnBoard);
                    this.node.addChild(hexagon);
                    cc.log(`Created a hexagon at ${row} - ${column}`);
                    return hexagon;     
                } catch (error) {}
            }
        }
        return null;
    },

    //@param hexagon : is a Hexagon Object
    generateRandomAroundAHexagon(hexagonCom, numberGenerate, minRange, maxRange){
        let array = [];
        if(typeof hexagonCom != "undefined"){
            let direction = [EDirection.TOP, EDirection.BOT, EDirection.TOP_LEFT, EDirection.TOP_RIGHT, EDirection.BOT_LEFT, EDirection.BOT_RIGHT];
            direction = this.suffleArray(direction);
            while(numberGenerate > 0 && direction.length > 0){
                let position = this.getHexagonPosAtDirection(direction[direction.length - 1], hexagonCom.row, hexagonCom.column);
                if(position.row >= minRange.row && position.row <= maxRange.row && 
                    position.column >= minRange.column && position.column <= maxRange.column){
                    if(!this.isHexagonCreatedAt(position.row, position.column)){
                        let newHexagon = this.createHexagonsAt(position.row, position.column);
                        if(newHexagon != null){
                            array.push(newHexagon);
                            --numberGenerate;
                        }
                    }
                }
                direction.pop();
            }
        }
        return array;
    },

    isHexagonCreatedAt(row, column){
        for(let groupI in this.listHexagonsGroup){
            let group = this.listHexagonsGroup[groupI];
            if(typeof group != "undefined" && group){
                for(let hexaI in group.hexagons){
                    let hexa = group.hexagons[hexaI];
                    if(hexa.row == row && hexa.column == column){
                        return true;
                    }
                }
            }
        }
        return false;
    },

    //@direction : top - topleft - botleft - bot - botright - topright : represent for 6 edges
    getHexagonByDirection(direction, row, column, group){
        let position = this.getHexagonPosAtDirection(direction, row, column);
        return group.getHexagonAt(position.row, position.column);
    },

    //@return : a vec2 with x -> row and y -> column
    getHexagonPosAtDirection(direction, row, column){
        let findRow = row;
        let findCol = column;
        switch(direction){
            case EDirection.TOP:
                findRow += 1; 
                break;
            case EDirection.BOT:
                findRow -= 1;
                break;
            case EDirection.TOP_LEFT:
                findCol -= 1;
                if(column%2==0)findRow += 1;
                break;
            case EDirection.BOT_LEFT:
                findCol -= 1;
                if(column%2==1)findRow -= 1;
                break;
            case EDirection.TOP_RIGHT:     
                findCol += 1;
                if(column%2==0)findRow += 1;
                break;
            case EDirection.BOT_RIGHT:
                findCol += 1;
                if(column%2==1)findRow -= 1;
                break;     
            default:
                break;
        }
        let position = {row: findRow, column : findCol};
        return position;
    },

    //@return : a cc.Size
    calculateRangeGenHexa(){
        let side = 3;
        while(side*side < this.numberHexagons * 1.5 && side < this.realSizePlay.width && side < this.realSizePlay.height){
            ++side;
        }
        console.log("Range side : " + side);
        return cc.size(side,side);
    },

    generateGridPosition(){
        //calculate size hexagon
        let measureScreenSide = this.node.width < this.node.height ? this.node.width : this.node.height;
        let measurePlaySide = (this.realSizePlay.width > this.realSizePlay.height ? this.realSizePlay.width : this.realSizePlay.height) + 1;
        this.sizeHexagonOnBoard = cc.size(measureScreenSide / measurePlaySide, measureScreenSide / measurePlaySide);

        //create grid
        this.grid.length = 0;
        let halfWidth = this.realSizePlay.width / 3.0; //3 because this is hexagon
        let halfHeight = this.realSizePlay.height / 1.5;

        let distanceX = this.sizeHexagonOnBoard.width * 0.75 + this.marginBetweenHexa * 2;
        let distanceY = this.sizeHexagonOnBoard.height*0.5 + this.marginBetweenHexa;
        let distance2Row = this.sizeHexagonOnBoard.height + this.marginBetweenHexa * 2;

        let startX = this.pointCenterPlayBoard.x - halfWidth * this.sizeHexagonOnBoard.width - this.marginBetweenHexa * halfWidth;
        let startY = this.pointCenterPlayBoard.y - halfHeight * this.sizeHexagonOnBoard.height - this.marginBetweenHexa * halfHeight;
        let x = startX, y = startY;
        let numberRows = ~~this.realSizePlay.height;
        for(let row = 0; row < numberRows; ++row){
            this.grid.push(new Array);
            for(let column = 0; column < this.realSizePlay.width; ++column){
                if(row < numberRows || column%2==1 || !this.ignoreFinal){
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

    suffleArray(array){
        for (let i = array.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];    //swap
        }
        return array;
    },

    getRandom(min, max){
        return ~~(Math.random() * (max - min + 1) + min);
    }
});
