cc.Class({
    name: "Range",
    properties:{
        min: 0,
        max: 0
    },
    set(range){
        this.min = range.min;
        this.max = range.max;
    }
});
