(function(w){

    let stateCount = 0;

    class State {
        constructor(label) {
            this.label = label;
            this.states = [];
            this.id = stateCount++;
        }

        addMerge(states) {

        }

        add(states) {
            this.states = this.states.concat(states);
        }
    }

    w.State = State;

})(window);
