var mysql = require('mysql');
var inquirer = require ('inquirer');

var connection = mysql.createConnection({
        host    : 'localhost',
        port    : 3306,
        user    : 'root',
        password: 'jeeho123', 
        database: 'bamazon'
});

connection.connect(function(err){
    if (err) throw err;
    initialDisplay();
});

function initialDisplay () {
    console.log("=====================WELCOME TO BAMAZON=======================");
    console.log("\n Please take a look at the products we have for sale. \n");
    connection.query("SELECT * FROM bamazon.products", function(err, res){
            if(err) throw err;
        console.log("================ID|PRODUCT NAME|PRICE(DOLLARS)================");
        for (var i = 0; i < res.length; i++){
            console.log(res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + res[i].price.toFixed(2) + "|" + res[i].stock_quantity);
        }
        console.log("===============================================================");
        promptUser();
    });
}

function promptUser(){
    inquirer
        .prompt ([
            {
                type: "input",
                message: "What is the ID of the product you want to buy?",
                name: "productID"
            },
            {
                type: "input",
                message: "How many units would you like to buy?",
                name: "unitCount"
            }
        ]).then(function(response){
            if(response.unitCount !== undefined || response.productID !== undefined){
            checkItem(response);
            }else {
            console.log("\n That is not a valid request. \n");
            promptUser();
            }
        });
}

function checkItem(response){
    connection.query("SELECT * FROM products WHERE ?", 
    {
        item_id: response.productID,
    }, function(err,res){
        if(err) throw err;
        if(response.productID >= 1 && response.productID <=10){
            checkStock(response);
        } else{
            console.log("You have requested an invalid product ID");
            promptUser();
        }
    });
}

function checkStock(response){
    connection.query("SELECT * FROM products WHERE ?", 
    {
        item_id: response.productID,
    }, function(err,res){
        if(res[0].stock_quantity >= response.unitCount){
            checkOut(response);
        }else{
            console.log("Sorry we don't have that many! We only have " + res[0].stock_quantity + " in stock!");
            promptUser();
        }
    });
}

function checkOut(response){
    connection.query("SELECT * FROM products WHERE ?", 
    {
        item_id: response.productID,
    },function(err,res){
            console.log("\n You have purchased... \n");
            console.log(response.unitCount + " order(s) of the item '" + res[0].product_name + "'.");
            updateStock(res, response);
    });
}

function updateStock(res, response){
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: (res[0].stock_quantity - response.unitCount)
            },
            {
                product_name: res[0].product_name
            }
        ],
        function(err,res){
            if(err) throw err;
            console.log("Quantity Updated!");
            console.log("Thank you come again!");
        });   
}

