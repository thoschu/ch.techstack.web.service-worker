const myJob = "Developer";

class A {
    constructor() {
        this.town = 'Hamburg';
    }
}

export class B {
    constructor() {
        this.a = new A();
    }

    get town() {
        return this.a.town;
    }

}

export let myName = "Tom S.";

export function getJob() {
    return myJob;
}
