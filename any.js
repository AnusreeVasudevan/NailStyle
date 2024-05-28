class Animal{
    constructor(name,color,age){
        this.name=name
        this.age=age
        this.color=color
        this.famliy="mammalia"
    }
    printaaa(){
        console.log(this.name, this.age, this.color, this.famliy)
    }
}

let cat = new Animal("Tom","Black",2)
console.log(cat)
let dog = new Animal("Spike","Grey",4)
console.log(dog)
cat.printaaa()
dog.printaaa()

/*

class Animal{
    constructor(name,age,color){
        this.age=age
        this.name=name
        this.color=color
        this.famliy="mammalia"
    }
    printaaa(){
        console.log(this.name, this.age, this.color, this.famliy)
    }
}

let cat = new Animal("Tom",2,"Black")
console.log(cat)


*/