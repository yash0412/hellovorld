var faker = require("faker");
console.log("####################\nMy Shop\n####################");
for(var i = 0; i < 10; i++) {
    console.log((i+1)+". "+faker.commerce.productName()+" - $"+faker.commerce.price());
}