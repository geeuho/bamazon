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
        console.log("Enter product ID '11' to restock");
        console.log("===============================================================");
        promptUser();
    });
}

function promptUser(){
    inquirer.prompt ([
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
            if(response.unitCount !== undefined && response.productID <= 10){
                checkItem(response);
            }else if (response.productID === "11") {
                restockInquire();
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
    }, function(err, res){
        if(err) throw err;
        if(response.productID >= 1 && response.productID <=10){
            checkStock(response);
        } else{
            console.log("You have requested an invalid ID");
            promptUser();
        }
    });
};

function checkStock(response){
    connection.query("SELECT * FROM products WHERE ?", 
    {
        item_id: response.productID,
    }, 
    function(err, res){
        if(err) throw err;
        if(res[0].stock_quantity >= response.unitCount){
            checkOut(response);
        }else{
            console.log("Sorry we don't have that many! We only have " + res[0].stock_quantity + " in stock!");
            promptUser();
        }
    });
};

function checkOut(response){
    connection.query("SELECT * FROM products WHERE ?", 
    {
        item_id: response.productID,
    },
    function(err, res){
        if(err) throw err;
            console.log(res);
            // console.log(res[1]);
            console.log("\n You have purchased... \n");
            console.log(response.unitCount + " order(s) of the item '" + res[0].product_name + "'. \n");
            console.log("That will cost you " + res[0].price * response.unitCount + " dollars. \n")
            console.log("Thank you for your purchase! \n");
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
        function(err, res){
            if(err) throw err;
            console.log("Quantity Updated!");
            reprompt();
        });   

}

function restockInquire(){
    inquirer.prompt([
        {
            type: "input",
            message: "Which product id number would you like to restock?",
            name: "product"
        },
        {
            type: "input",
            message: "How many items would you like to add?",
            name: "number"
        }
    ]).then (function(response){
        connection.query("SELECT * FROM products WHERE ?", 
            {
                item_id: response.product,
            }, function(err,res){
                if (err) throw err;
                restock(res, response);
            
        });        
    });
};

function restock(res, response){
    connection.query("UPDATE products SET ? WHERE ?",   
    [
        {
            stock_quantity: (res[0].stock_quantity + parseInt(response.number))
        }, 
        {
            product_name: res[0].product_name
        }
    ],
        function(err, res){
            if(err) throw err;
            console.log("Quanity Added!");
            initialDisplay();
        });
};


function reprompt(){
    inquirer.prompt ([
        {
            type: "confirm",
            message: "Would you like to buy anything else?",
            name: "reprompt"
        }
    ]).then (function(response){
        // console.log(response.reprompt );
        if (response.reprompt === true){
            initialDisplay();
        }else {
            console.log("Thank you come again!");
        }
    })
}