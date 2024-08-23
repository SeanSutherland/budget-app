import requests as r
import json 

HOST = "localhost"

budget = {
    "name":"2024 Budget"
}

users = [
    {
        "email":"john.smith@gmail.com",
        "name":"John Smith",
        "password":"password",
        "budget_id":1,
    },
    {
        "email":"jane.doe@gmail.com",
        "name":"Jane Doe",
        "password":"password",
        "budget_id":1,
    }
]

accounts = [
    {
        "name":"John's Mastercard",
        "user_id":1,
    },
    {
        "name":"John's Debit Card",
        "user_id":1,
    },
    {
        "name":"Jane's Visa",
        "user_id":2,
    },
    {
        "name":"Jane's American Express",
        "user_id":2,
    },
]

categories = [
    { 
        "name":"Housing",
        "monthly_spend":2500.00,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Food",
        "monthly_spend":500.00,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Medical/Healthcare",
        "monthly_spend":250,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Phone/Internet",
        "monthly_spend":100,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Transportation",
        "monthly_spend":100,
        "essential":0,
        "budget_id":1,
    },
    { 
        "name":"Debt",
        "monthly_spend":300,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Education",
        "monthly_spend":100,
        "essential":1,
        "budget_id":1,
    },
    { 
        "name":"Clothing",
        "monthly_spend":100,
        "essential":0,
        "budget_id":1,
    },
    { 
        "name":"Entertainment/Subscriptions",
        "monthly_spend":100,
        "essential":0,
        "budget_id":1,
    },
]

funds = [
    {
        "name":"Trip Fund",
        "goal": 5000.00,
        "budget_id":1,
    },
    {
        "name":"Jane's Savings",
        "goal": 15000.00,
        "budget_id":1,
    },
    {
        "name":"John's Savings",
        "goal": 15000.00,
        "budget_id":1,
    },
]

known_cats = []


resp = r.post("http://"+HOST+":5000/budget/create", json=budget)
print(resp.text)

for user in users:
    resp = r.post("http://"+HOST+":5000/user/create", json=user)
    print(resp.text)

for account in accounts:
    resp = r.post("http://"+HOST+":5000/account/create", json=account)
    print(resp.text)

for cat in categories:
    resp = r.post("http://"+HOST+":5000/category/create", json=cat)
    print(resp.text)

for fund in funds:
    resp = r.post("http://"+HOST+":5000/fund/create", json=fund)
    print(resp.text)

'''
for cat in known_cats:
    resp = r.post("http://"+HOST+":5000/known-category/create", json=cat)
    print(resp.text)
'''
