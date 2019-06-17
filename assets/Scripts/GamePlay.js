// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
export const EDirection = cc.Enum({
    TOP: 0,
    BOT: 1,
    TOP_LEFT: 2,
    BOT_LEFT: 3,
    TOP_RIGHT: 4,
    BOT_RIGHT: 5,
    COUNT: 6     
});

var Range = require('./Range');

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
            default: null,
            visible: false
        },
        marginBetweenHexa: 5,
        maxDifferenceWidthHeight: 4,
        //pieces - blocks
        piecePrefab:{
            default: null,
            type: cc.Prefab
        },
        blockPrefab:{
            default: null,
            type: cc.Prefab
        },
        shadowPrefab:{
            default: null,
            type: cc.Prefab
        },
        blockTypes:{
            default: [],
            type: cc.SpriteFrame
        },
        shadowTypes:{
            default: [],
            type: cc.SpriteFrame
        },
        hole:{
            default: null,
            type: cc.SpriteFrame
        },
        numberHoles:{
            type: Range,
            default: null,
            visible: false
        },
        numberPieces : {
            type: Range,
            default: null,
            visible: false
        },
        numberBlockEachPieces : {
            type: Range,
            default: null,
            visible: false
        },
        listHexagonsGroup : [], 
        resultNode : cc.Node,
        levelUnlockLabel: cc.Node,
        levelEffectLabel: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad(){
        window.gamePlay = this;
        this.actionHandler = this.node.getChildByName('ActionHandler').getComponent('ActionHandler');
        this.functionHandler = this.node.getChildByName('FunctionHandler').getComponent('FunctionHandler');
        this.levelMgr = this.node.getChildByName('LevelManager').getComponent('LevelManager');
        this.saveMgr = this.node.getChildByName('SaveManager').getComponent('SaveManager');
        this.tutorial = this.node.getChildByName('Toturial').getComponent('Tutorial');
        this.tutorial.load();
        this.grid = [];
        this.listPositionAvaiable = [];
        this.listHexagonsGroup = [];    //HexagonsGroup array
        this.listHoles = [];
        this.percentRotatablePiece = [];
        this.coin = this.node.getChildByName('Coin').getComponent('Coin');
    },

    start () {
        this.resultNode.active = false;
        this.isGenerating = true;
        this.realSizePlay = cc.size(this.maxSizePlayBoard.width, this.maxSizePlayBoard.height);
        this.sizeGenerate = cc.size(0, 0);
        this.positionStartGenHexa = {row : this.realSizePlay.height / 2, column : this.realSizePlay.width / 2};
        this.maxHexagon = this.realSizePlay.width * this.realSizePlay.height;
        this.generateGridPosition();
        if(this.levelMgr)this.levelMgr.preStart();
        if(this.functionHandler)this.functionHandler.preStart();
        this.nextLevel();
        this.createGame();
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{this.isGenerating = false;}, this)));
    },

    createGame(){
        this.isWin = false;
        this.resultNode.active = false;
        this.numberHexagons = this.getRandom(this.totalNumberHexagons.min, this.totalNumberHexagons.max);
        console.log("Number hexagon : " + this.numberHexagons);
        this.rangeGenerateHexa = this.calculateRangeGenHexa();
        console.log("rangeGenerateHexa : " + this.rangeGenerateHexa);
        this.generatePiece();
        this.arrangeHexagons();
        //save hint
        for(let group of this.listHexagonsGroup){
            for(let hexagon of group.hexagons)
                if(hexagon && hexagon.block){
                    let hintFrame = hexagon.block.getComponent('Block').hintFrame;
                    if(hintFrame)this.functionHandler.saveHint(hexagon, hintFrame);
                }
                    
            for(let piece of group.pieces)
                this.functionHandler.saveAuto(piece, piece.node.position);
        }
        this.setRotateForPieces();
        this.putPiecesToSelectionBar();
    },

    nextLevel(){
        if(this.levelMgr){
            let level = this.levelMgr.nextLevel();
            this.totalNumberHexagons.set(level.difficult.totalBlocks);
            this.numberPieces.set(level.difficult.pieces);
            this.numberBlockEachPieces.set(level.difficult.piecesBlocks);
            this.numberHoles = new Range();
            this.numberHoles.set(level.difficult.numberHoles);
            this.rateHole = level.difficult.rateHole;
            this.percentRotatablePiece = level.difficult.rotatablePieceRate;
        }
    },

    clearBoard(){
        this.functionHandler.history.length = 0;
        this.functionHandler.hints.length = 0;
        this.functionHandler.autoes.length = 0;
        if(this.listPositionAvaiable.length > 0){
            this.listPositionAvaiable.length = 0;
        }
        if(this.listHoles.length > 0){
            for(let hole of this.listHoles)hole.destroy();
            this.listHoles.length = 0;
        }
        if(this.listHexagonsGroup.length > 0){
            for(let group of this.listHexagonsGroup){
                group.clear();
                group.node.destroy();
            }
            this.listHexagonsGroup.length = 0;
        }

        this.tutorial.resetRotatePieceTutorial();
    },

    reset(){
        if(!this.isGenerating){
            this.functionHandler.offSuggestHint();
            this.isGenerating = true;
            this.clearBoard();
            this.node.getChildByName('SelectionBar').getComponent('SelectionBar').clear();
            this.createGame();
            this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(()=>{this.isGenerating = false;}, this)));
        }else{
            cc.log("BBoard is generating!");
        }
    },

    checkWin(){
        this.isWin = true; 
        for(let group of this.listHexagonsGroup){
            for(let hexagon of group.hexagons){
                if(hexagon.block == null){
                    this.isWin = false;
                    break;
                }
            }
        }
        if(this.isWin){
            //do something
            console.log("WIN");
            if(this.coin)this.coin.addCoin(100);
            this.nextLevel();
            this.saveMgr.saveData(this.levelMgr.currentLevel + 1, this.levelMgr.currentDifficult + 1, null);
            this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{
                this.clearBoard();
                this.resultNode.active = true;
                this.levelUnlockLabel.getComponent(cc.Label).string = "Level " + (this.levelMgr.currentLevel + 1) + " ";
                this.levelEffectLabel.getComponent(cc.Label).string = this.levelMgr.currentLevel + 1;
            }, this)));
        }
    },

    setRotateForPieces(){
        if(this.percentRotatablePiece.length > 0){
            let number = 0;
            for(let percent of this.percentRotatablePiece){
                if(~~(Math.random() * 100) < percent)number++;
            }        
            
            if(number > 0){
                let isRotateSame = piece =>{    //we have 3 case: triangle 3 blocks and triangle 4 blocks, hexagon 7 blocks
                    //case 1 
                    let pointsArray = array =>{
                        let length = Math.floor(array[array.length - 1].sub(array[0]).mag());
                        for(let i = 0; i < array.length - 1; i++){
                            let compare = Math.floor(array[i].sub(array[i+1]).mag());
                            if(compare != length)return false;
                        }
                        return true;
                    };
                    let getCenterIndex = piece =>{
                        let center = piece.blocks.findIndex(o =>{
                            let compare = Math.floor(o.position.sub(piece.blocks[0].position).mag());
                            if(compare == 0)compare = Math.floor(o.position.sub(piece.blocks[1].position).mag());
                            for(let b of piece.blocks){
                                let length = Math.floor(o.position.sub(b.position).mag());
                                if(length != 0 && compare != length)return false;
                            }
                            return true;
                        }, this);
                        return center;
                    };
                    if(piece.blocks.length == 3){
                        return pointsArray([piece.blocks[0].position, piece.blocks[1].position, piece.blocks[2].position]);
                    }else if(piece.blocks.length == 4){
                        let center = getCenterIndex(piece);
                        if(center != -1){
                            let around = [];
                            for(let i in piece.blocks)if(i!=center)around.push(piece.blocks[i].position);
                            return pointsArray(around);
                        }
                    }else if(piece.blocks.length == 7){
                        return getCenterIndex(piece) == -1;
                    }
                    return false;
                };
                let pieces = Array.from(this.listHexagonsGroup[0].pieces);
                // number = pieces.length;  //test same rotate
                while(number > 0 && pieces.length > 0){
                    if(pieces.length == 0)break;
                    let randomIndex = ~~(Math.random() * pieces.length);
                    let piece = pieces[randomIndex];
                    if(piece.blocks.length > 1 && piece.blocks.length < this.numberBlockEachPieces.max && !isRotateSame(piece)){
                        piece.canRotate = true;
                        let randomRo = ~~(Math.random() * 2);
                        for(let i = 0; i < randomRo; i++)this.actionHandler.rotatePiece(piece);
                        this.actionHandler.showCanRotate(piece);
                        number--;
                    }
                    pieces.splice(randomIndex, 1);
                }
            }
        }
    },

    putPiecesToSelectionBar(){
        let selectionBar = this.node.getChildByName('SelectionBar');
        if(selectionBar){
            let barCom = selectionBar.getComponent('SelectionBar');
            if(barCom){
                for(let group of this.listHexagonsGroup){
                    for(let piece of group.pieces){
                        piece.positionInGameBoard = cc.v2(9999,9999);
                        this.actionHandler.scalePiece(piece, this.actionHandler.selectionScale);
                        barCom.push(piece.getComponent('Piece'));
                    }
                    for(let hexa of group.hexagons){
                        hexa.block = null;
                    }
                }
                barCom.resize();
            }
        }
    },

    generatePiece(){
        function pieceCreation(){
            this.numberBlocks = 0;
            this.type = 0;
            this.piecePositions = [];
            this.group = null;
        };
        let arrayPieceCreations = [];
        //get number pieces
        let numberPieces = this.getRandom(this.numberPieces.min, this.numberPieces.max);
        for(let i = 0; i < numberPieces; ++i){
            arrayPieceCreations.push(new pieceCreation());
            arrayPieceCreations[arrayPieceCreations.length - 1].type = this.blockTypes[i];
        }
        cc.log("Number Piece : " + numberPieces);
        //get number blocks each piece : get value to arrayPieceCreations
        {
            if(this.numberHexagons % numberPieces == 0){
                let numberEachPiece = this.numberHexagons / numberPieces;
                for(let c of arrayPieceCreations)c.numberBlocks = numberEachPiece;
            }else{
                let divNumber = this.numberHexagons - (this.numberHexagons % numberPieces);
                let numberEachPiece = divNumber / numberPieces;
                for(let i = 0; i < arrayPieceCreations.length - 1; i++)arrayPieceCreations[i].numberBlocks = numberEachPiece;
                arrayPieceCreations[arrayPieceCreations.length - 1].numberBlocks = this.numberHexagons % numberPieces;
            }

            //get random
            let numberHexagonsTemp = this.numberHexagons;
            let maxBlocks = this.numberBlockEachPieces.max;
            let minBlocks = this.numberBlockEachPieces.min;
        }
        //get grid available to put block : out put to gridAvaiable
        let gridAvaiable = [];
        let rangerVertical = new Range(), rangerHorizontal = new Range();
        rangerVertical.min = this.positionStartGenHexa.row - this.rangeGenerateHexa.height / 2;
        rangerVertical.max = this.positionStartGenHexa.row + this.rangeGenerateHexa.height / 2;
        rangerHorizontal.min = this.positionStartGenHexa.column - this.rangeGenerateHexa.width / 2;
        rangerHorizontal.max = this.positionStartGenHexa.column + this.rangeGenerateHexa.width / 2;

        for(let row = 0; row < this.realSizePlay.height; row++)
            if(row >= ~~rangerVertical.min && row <= rangerVertical.max)
                for(let column = 0; column < this.realSizePlay.width; column++)
                    if(column >= ~~rangerHorizontal.min && column <= rangerHorizontal.max)
                        gridAvaiable.push({row, column});
                            
        let usedPosition = [];

        let positionAvailable = (row, column) =>{
            return gridAvaiable.findIndex(element =>{
                return element.row == row && element.column == column;
            });
        };
        let getRandomInArray = array => array[~~(Math.random() * array.length)];
    
        let getPositionAround = (row, column) =>{
            let result = [];
            for(let i = 0; i < EDirection.COUNT; i++){
                let position = this.getHexagonPosAtDirection(i, row, column);
                let index = positionAvailable(position.row, position.column);
                if(index != - 1)result.push(index);
            }
            return result;
        };
        //generate blocks
        let createPosBlocks = (indexAvailable, creation) =>{
            let position = gridAvaiable[indexAvailable];
            creation.piecePositions.push(position);
            usedPosition.push({row: position.row, column: position.column});
            creation.numberBlocks--;
            gridAvaiable.splice(indexAvailable, 1);
        };
        let createPosBlocksWithNumber = (number, creation) =>{
            let tempCreation = this.suffleArray(creation.piecePositions);
            let count = 1;
            for(count = 1; count <= number; count++){
                for(let start of tempCreation){
                    let around = getPositionAround(start.row, start.column);
                    if(around.length > 0){
                        let randomIndex = getRandomInArray(around);
                        createPosBlocks(randomIndex, creation);    
                        break;
                    }
                }
            }
            return count == number;
        };
        //start of each piece
        for(let i = 0; i < numberPieces;){
            if(i == 0){
                let center = positionAvailable(~~this.positionStartGenHexa.row, ~~this.positionStartGenHexa.column);
                createPosBlocks(center, arrayPieceCreations[i]);
                createPosBlocksWithNumber(this.numberBlockEachPieces.min - 1, arrayPieceCreations[i]);
                i++;
            }else{
                let index = ~~(Math.random() * i);
                let randomPiece = arrayPieceCreations[index];
                let firstBlockPos = randomPiece.piecePositions[~~(Math.random() * randomPiece.piecePositions.length)];
                let around = getPositionAround(firstBlockPos.row, firstBlockPos.column);
                if(around.length > 0){
                    let randomIndex = getRandomInArray(around);
                    createPosBlocks(randomIndex, arrayPieceCreations[i]);
                    let isFinish = createPosBlocksWithNumber(this.numberBlockEachPieces.min - 1, arrayPieceCreations[i]);
                    i++;
                }
            }
        }
        //full of each piece
        while(true){
            let isFinished = true;
            for(let creation of arrayPieceCreations){
                if(creation.numberBlocks > 0 && creation.piecePositions.length > 0){
                    let randomStart = getRandomInArray(creation.piecePositions);
                    let around = getPositionAround(randomStart.row, randomStart.column);
                    if(around.length > 0){
                        let randomIndex = getRandomInArray(around);
                        createPosBlocks(randomIndex, creation);
                        isFinished = false;
                    }
                }
            }
            if(isFinished)break;
        }

        let getArrayBlockAround = (row, column) =>{
            let count = [];
            for(let i = 0; i < EDirection.COUNT; i++){
                let position = this.getHexagonPosAtDirection(i, row, column);
                let index = usedPosition.findIndex(element =>{
                    return element.row == position.row && element.column == position.column;
                });
                if(index != - 1)count.push(position);
            }
            return count;
        }

        let numberHoles = this.getRandom(this.numberHoles.min, this.numberHoles.max);
        //for specical case
        for(let pos of gridAvaiable){
            let count = getArrayBlockAround(pos.row, pos.column).length;  
            if(count < EDirection.COUNT)continue;
            if(getPositionAround(pos.row, pos.column) == 0){
                let hole = this.createBlockAtPos(pos.row, pos.column, this.hole);
                this.listHoles.push(hole);
                numberHoles--;
            }
        }
        
        if(numberHoles > 0 && this.rateHole > 0){
            arrayPieceCreations = this.suffleArray(arrayPieceCreations);
            for(let creation of arrayPieceCreations){
                if(creation.piecePositions.length > this.numberBlockEachPieces.min){
                    for(let cp = 0; cp < creation.piecePositions.length; cp++){
                        let pos = creation.piecePositions[cp];
                        let around = getArrayBlockAround(pos.row, pos.column);
                        if(around.length >= EDirection.COUNT){
                            let countSame = 0;
                            for(let p of around){
                                if(creation.piecePositions.findIndex(e => e.row == p.row && e.column == p.column) != -1)
                                    countSame++;
                                if(countSame > 1)break;
                            }
                            if(countSame == 1){
                                let hole = this.createBlockAtPos(pos.row, pos.column, this.hole);
                                this.listHoles.push(hole);
                                creation.piecePositions.splice(cp, 1);
                                numberHoles--;
                                break;
                            }
                        }  
                    }
                    if(numberHoles == 0)break;
                }
            }
        }
    
        //create blocks
        this.listHexagonsGroup.length = 0;
        for(let groupI = 0; groupI < 1; groupI++){
            let group = cc.instantiate(this.hexagonGroupPrefab);
            let groupCom = group.getComponent('HexagonGroup');
            this.listHexagonsGroup.push(groupCom);
            for(let createI = 0; createI < arrayPieceCreations.length; createI++){
                let piece = cc.instantiate(this.piecePrefab);
                let pieceCom = piece.getComponent('Piece');
                this.node.addChild(piece, 1);
                groupCom.pieces.push(pieceCom);
                for(let pos of arrayPieceCreations[createI].piecePositions){
                    //hexagon
                    let hexagon = this.createHexagonsAt(pos.row, pos.column);
                    groupCom.push(hexagon);
                    let frameIndex = createI % this.blockTypes.length;
                    let block = this.createBlockAtPos(pos.row, pos.column, this.blockTypes[frameIndex], this.shadowTypes[frameIndex]);
                    pieceCom.pushBlock(block);
                    let hexagonCom = hexagon.getComponent('Hexagon');
                    hexagonCom.block = block;
                }
            }
        }
    },

    arrangeHexagons(){

    },

    //@Return : a node object which contains Block component
    createBlockAtPos(row, column, spriteFrame, hintFrame = null){
        let block = cc.instantiate(this.blockPrefab);
        block.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        if(hintFrame)block.getComponent('Block').hintFrame = hintFrame;
        block.setPosition(this.grid[row][column]);
        block.setContentSize(this.sizeHexagonOnBoard.width, this.sizeHexagonOnBoard.height);
        this.node.addChild(block, 1);
        return block;
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
                    this.listPositionAvaiable.push({row, column});
                    hexagon.setContentSize(this.sizeHexagonOnBoard);
                    this.node.addChild(hexagon, 0);
                    //create shadow
                    if(this.shadowPrefab){
                        hexagonCom.createShadowOn(this.shadowPrefab);
                    }
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
        for(let pos of this.listPositionAvaiable){
            if(pos.row == row && pos.column == column)
                return true;
        }
        return false;
    },

    //@direction : top - topleft - botleft - bot - botright - topright : represent for 6 edges
    getHexagonByDirection(direction, row, column, group){
        let position = this.getHexagonPosAtDirection(direction, row, column);
        return group.getHexagonAt(position.row, position.column);
    },

    //@return : a object with row and column
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
        return cc.size(side,side);
    },

    generateGridPosition(){
        //calculate size hexagon
        console.log(`Screen : ${this.node.width} - ${this.node.height}`);
        let measureScreenSide = this.node.width < this.node.height ? this.node.width : this.node.height;
        let measurePlaySide = (this.realSizePlay.width > this.realSizePlay.height ? this.realSizePlay.width : this.realSizePlay.height) + 1;
        this.sizeHexagonOnBoard = cc.size(measureScreenSide / (measurePlaySide - 0.4), measureScreenSide / (measurePlaySide - 0.4));

        //calculate realsize each block
        let obj = cc.instantiate(this.blockPrefab);
        let originSize = obj.getContentSize();
        let ratio = originSize.width / this.sizeHexagonOnBoard.width;
        this.sizeHexagonOnBoard.height = originSize.height / ratio;
        obj.destroy();

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

        //test grid
        // for(let row in this.grid)for(let column in this.grid)this.createHexagonsAt(row, column);

    },

    suffleArray(array){
        for (let i = array.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];    //swap
        }
        return array;
    },

    //@Return : list hexagon object
    isPieceFit(piece){
        let findHexagonNearVec2Position = (position , distanceFit) =>{
            try{
                for(let hexPos of this.listPositionAvaiable){
                    let readlPosition = this.grid[hexPos.row][hexPos.column];
                    if(readlPosition.sub(position).mag() <= distanceFit){
                        for(let group of this.listHexagonsGroup){
                            let result = group.getHexagonAt(hexPos.row, hexPos.column);
                            if(result!=null)return result;
                        }
                        return null;
                    }
                }
            }catch(error){}
            return null;
        };

        let listHexa = [];
        for(let i = 0; i < piece.blocks.length; ++i){
            let blockPos = this.convertToCanvasPosition(piece.blocks[i].parent, piece.blocks[i].position);
            let hexagon = findHexagonNearVec2Position(blockPos, this.sizeHexagonOnBoard.width / 2 - 10);
            if(hexagon && hexagon.block == null)listHexa.push(hexagon);
        }
        if(listHexa.length == piece.blocks.length && piece.blocks.length > 0){
            return listHexa;
        }
        listHexa.length = 0;
   
        return [];     
    },

    releasePieceFromHexagon(piece){
        this.listHexagonsGroup.forEach(group =>{
            if(piece.blocks.length > 0)
                group.releaseBlockOnHexa(piece.blocks[0].getComponent(cc.Sprite).spriteFrame);
        }, this);
    },

    setToNewHexagons(piece, listHexagons){
        piece.positionInGameBoard = this.convertToCanvasPosition(listHexagons[0].node.parent, listHexagons[0].node.position);
        for(let i = 0; i < listHexagons.length; ++i){
            listHexagons[i].block = piece.blocks[i];
        }
        //shadow
        let sprite = piece.blocks[0].getComponent('Block');
        if(sprite){
            listHexagons.forEach(hexa =>{
                hexa.setShadow(sprite.hintFrame);
            });
        }

        this.functionHandler.offSuggestHint();
    },

    hideAllShadow(force){
        this.listHexagonsGroup.forEach(group =>{
            group.hexagons.forEach(hexagon =>{
                hexagon.hideShadow(force);
            });
        });
    },

    convertToCanvasPosition(parentNode, position){
        let checkPos = parentNode.convertToWorldSpaceAR(position);
        return this.node.convertToNodeSpaceAR(checkPos);
    },

    getRandom(min, max){
        return ~~(Math.random() * (max - min + 1) + min);
    }
});
