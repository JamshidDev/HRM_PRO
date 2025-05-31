
//Destructuring Array and Object
const numbers = [1,2,3,4,5,6]
const person = {
    name: "John",
    age:21,
    course:{
        title:"Javascript",
        duration:100
    }
}

const [one, ,...others] = numbers

let result = []

const {name="Jahon",course:{title} } = person

console.log(title)