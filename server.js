require('dotenv').config()
const fs = require('fs')

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
console.log(stripeSecretKey)

const express = require('express')
const app = express()
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/store', function (req, res) {
    fs.readFile('items.json', function (error, data) {
        if (error) {
            res.status(500)
        } else {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function (req, res) {
    fs.readFile('items.json', function (error, data) {
        if (error) {
            res.status(500)
        } else {
            const itemsJson = JSON.parse(data)
            const itemArray = itemsJson.music;
            let total = 0;
            req.body.items.forEach(element => {
                const itemJson = itemArray.find(function(i){
                    return i.id = element.id
                })

                total = total + itemJson.price * element.quantity
            });

            console.log("Total Charges " + total)

            stripe.charges.create({
                amount: total,
                source:req.body.stripeTokenId,
                currency:'usd'
            }).then(function(){
                console.log("charge successful")
                res.json({message:'successfully purchased'})
            }).catch(function(){
                console.log("charge failed")
                res.status(500).end()
            })
        }
    })
})

app.listen(3000)