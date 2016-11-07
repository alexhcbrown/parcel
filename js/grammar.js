class Grammar {
    constructor() {
        this.ruleStates = {};
    }

    addRuleStates(grammarObject) {
        Object.keys(grammarObject).forEach((ruleName)=>{
            let ruleOptions = grammarObject[ruleName];
            this.ruleStates[ruleName] = this.makeState(ruleName);
            ruleOptions.forEach((optionArray) =>{
                this.ruleStates[ruleName].merge(
                    this.buildOption(optionArray).states
                );
            });
        });
    }

    buildOption(optionArray) {
        let opState = this.makeState("Option State");
        (function parse(ops,currState,op,n)  {
            op = ops.shift();
            n = this.makeState(op);
            currState.add([n]);
            if(ops.length > 0) parse.call(this,ops,n);
        }).call(this,optionArray,opState);
        return opState;
    }

    makeState(label) {
        return new State(label);
    }

}
