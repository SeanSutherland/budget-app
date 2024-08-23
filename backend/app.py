from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import datetime
import bcrypt
import jwt
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
import os
from dotenv import load_dotenv

load_dotenv()
#Init app
app = Flask(__name__)
CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))

SEND_EMAIL_FROM = os.getenv('EMAIL_FROM')
SEND_EMAIL_PASS = os.getenv('EMAIL_PASS')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

app.json.sort_keys = False

BUDGET_START_DATE = datetime.datetime(2024,8,1)

#Initialize Database
db = SQLAlchemy(app)

#Initialize Schema Maker
ma = Marshmallow(app)

''' ******************************************** HELPER CLASSES ******************************************** '''

class AuthenticationError(Exception):
    code = 0
    message = ""
    
    def __init__(self, message, code):
        super().__init__(message)
        self.code = code
        self.message = message

''' ******************************************** DATABSE CLASSES ******************************************** '''

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(36), unique=True, nullable=False)

    users = db.relationship('User', backref='budget', lazy=True)
    categories = db.relationship('Category', backref='budget', lazy=True)
    funds = db.relationship('Fund',backref="budget",lazy=True)

    def __init__(self, name):
        self.name = name

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), unique=False, nullable=False)
    password = db.Column(db.String(100), unique=False, nullable=False)

    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=True)

    accounts = db.relationship('Account',backref='user', lazy=True)
    contributions  = db.relationship('Contribution',backref='user', lazy=True)


    def __init__(self, email, name, password, budget_id):
        self.email = email
        self.name = name
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password = hashed_pw
        self.budget_id = budget_id
    
    def check_pw(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password)

    def encode_auth_token(self,user_id,expiry_day=1, expiry_minute=0):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=expiry_day, minutes=expiry_minute),
                'iat': datetime.datetime.utcnow(),
                'sub': user_id
            }
            return jwt.encode(
                payload,
                app.config['SECRET_KEY'],
                algorithm="HS256"
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_auth_token(auth_token):
        payload = jwt.decode(auth_token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload['sub']

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transactions = db.relationship('Transaction',backref='account', lazy=True)

    def __init__(self, name, user_id):
        self.name = name
        self.user_id = user_id

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    monthly_spend = db.Column(db.Float, unique=False, nullable=True)
    essential = db.Column(db.Boolean, unique=False, nullable=True)
    
    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=True)
    transactions = db.relationship('Transaction',backref='category', lazy=True)
    #known_categories = db.relationship('KnownCategories',backref='category',lazy=True)


    def __init__(self, name, monthly_spend, essential, budget_id):
        self.name = name
        self.monthly_spend = monthly_spend
        self.essential = essential
        self.budget_id = budget_id

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    debit = db.Column(db.Float, unique=False, nullable=False)
    date = db.Column(db.DateTime, unique=False, nullable=False)
    income = db.Column(db.Boolean, unique=False, nullable=False)
    essential = db.Column(db.Boolean, unique=False, nullable=False, default=False)

    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=True)
    splits = db.relationship('Splits',backref='transaction', cascade="all,delete", lazy=True)

    def __init__(self, name, debit, date, income, account_id, category_id=None, essential=None):
        self.name = name
        self.debit = debit
        self.date = date
        self.income = income
        self.category_id = category_id
        self.account_id = account_id
        if essential == None:
            if category_id != None:
                self.essential = Category.query.get(category_id).essential
            else:
                self.essential = False
        else: 
            self.essential = essential

class Fund(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    goal = db.Column(db.Float, unique=False, nullable=False)
    balance = db.Column(db.Float, unique=False, nullable=False)

    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=False)
    contributions = db.relationship('Contribution',backref='fund',lazy=True)
    withdrawals = db.relationship('Withdrawal',backref='fund',lazy=True)

    def __init__(self, name, goal, budget_id, balance=0.00):
        self.name = name
        self.goal = goal
        self.budget_id = budget_id
        self.balance = balance

class Contribution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    debit = db.Column(db.Float, unique=False, nullable=False)
    date = db.Column(db.DateTime, unique=False, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)
    fund_id = db.Column(db.Integer, db.ForeignKey('fund.id'),nullable=False)

    def __init__(self, debit, date, user_id, fund_id):
        self.debit = debit
        self.date = date
        self.user_id = user_id
        self.fund_id = fund_id

class Withdrawal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    debit = db.Column(db.Float, unique=False, nullable=False)
    date = db.Column(db.DateTime, unique=False, nullable=False)

    fund_id = db.Column(db.Integer, db.ForeignKey('fund.id'),nullable=False)

class KnownCategories(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stem = db.Column(db.String(64), unique=True, nullable=False)

    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)

    def __init__(self, stem, category_id):
        self.stem = stem
        self.category_id = category_id

    @staticmethod
    def search(name):
        cats = KnownCategories.query.all()
        for cat in cats:
            if cat.stem in name:
                return cat.category_id
        return None

class Splits(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=True)

    original_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    split_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    original_user = db.relationship(User, foreign_keys=original_user_id)
    split_user = db.relationship(User, foreign_keys=split_user_id)

    debit = db.Column(db.Float, unique=False, nullable=False)
    paid = db.Column(db.Boolean, unique=False, nullable=False)

    def __init__(self, original_transaction_id,original_user_id, split_user_id,debit,paid):
        self.original_transaction_id = original_transaction_id
        self.original_user_id = original_user_id
        self.split_user_id = split_user_id
        self.debit = debit
        self.paid = paid

''' ******************************************** SCHEMAS ******************************************** '''

class BudgetSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','name')

budget_schema = BudgetSchema()

class UserSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','email','name','password')

user_schema = UserSchema()

class AccountSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','name','user.email')

account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)

class CategorySchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','name','monthly_spend','essential','budget.name')

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

class TransactionSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','name','debit','date','income','essential','category_id','account_id','category.name','account.name','account.user.name')

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)

class FundSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','name','goal','balance','budget.name')

fund_schema = FundSchema()
funds_schema = FundSchema(many=True)

class ContributionSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','debit','date','user.email','fund.name','fund.balance')

contribution_schema = ContributionSchema()
contributions_schema = ContributionSchema(many=True)

class KnownCategoriesSchema(ma.Schema):
    class Meta:
        ordered = True
        fields = ('id','stem','category.name')

known_categories_schema = KnownCategoriesSchema()
''' ******************************************** DASHBOARD ******************************************** '''
@app.get("/dashboard")
def dashboard():
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    payload = {}

    ## Recent Transactions ##
    recent_transactions = Transaction.query.order_by(Transaction.date.desc()).limit(5).all()

    payload_recent_transactions = []
    for trans in recent_transactions:
        transaction = {}
        transaction["title"] =  trans.name
        transaction["id"] =  trans.id
        transaction["time"] = trans.date.strftime("%m/%d/%Y")
        transaction["type"] = "order1"
        transaction["debit"] = trans.debit
        payload_recent_transactions.append(transaction)

    payload["recent_transactions"] = payload_recent_transactions

    ## Pie Chart ##
    category_totals = {}
    categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.monthly_spend.desc()).limit(3).all()
    for cat in categories:
        category_totals[cat.id] = {
            "label": cat.name, 
            "budget": cat.monthly_spend, 
            "value": 0.00,
            }

    today = datetime.datetime.now()
    first_of_month = datetime.datetime(today.year, today.month, 1)
    first_of_next_month = first_of_month_n_months_forward(first_of_month, 1)
    months_transactions = Transaction.query.filter(Transaction.date >= first_of_month, Transaction.date < first_of_next_month,Transaction.income == False ).all()

    total_other_spend_for_month = 0.00
    for trans in months_transactions:
        total_other_spend_for_month += trans.debit
        if trans.category_id in category_totals.keys():
            category_totals[trans.category_id]["value"] += trans.debit
            total_other_spend_for_month -= trans.debit

    payload_top_categories = []
    for item in category_totals.values():
        payload_top_categories.append(item)

    payload_top_categories.append({
        "label": "Other",
        "budget": 0.00,
        "value": total_other_spend_for_month,
    })
    
    payload["pie_chart"] = payload_top_categories

    ## Conversion Rates ##
    categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.monthly_spend.desc()).all()
    
    total_monthly_budget = 0.00
    for cat in categories:
        category_totals[cat.id] = {
            "label": cat.name, 
            "budget": cat.monthly_spend, 
            "value": 0.00,
            "spend":0.00,
            }
        total_monthly_budget += cat.monthly_spend

    total_other_spend_for_month = 0.00
    for trans in months_transactions:
        total_other_spend_for_month += trans.debit
        if trans.category_id in category_totals.keys():
            category_totals[trans.category_id]["spend"] += trans.debit
            total_other_spend_for_month -= trans.debit

    payload_all_categories = []
    for item in category_totals.values():
        if item["spend"] == 0.00:
            continue
        try:
            item["value"] = round(((item["spend"]/item["budget"])*100),2)
        except ZeroDivisionError as e:
            if item["spend"] == 0:
                item["value"] = 0
            else:
                item["value"] = 100.00
        payload_all_categories.append(item)

    if total_other_spend_for_month != 0:

        payload_all_categories.append({
            "label": "Uncategorized",
            "budget": 0.00,
            "value": 100.00,
            "spend": total_other_spend_for_month,
        })
    
    payload["spend_by_category"] = payload_all_categories

    ## Highlights ##
    total_month_spend = 0
    transaction_count = 0
    esential_spend = 0.00
    total_income = 0.00
    non_essential_spend = 0.00

    income_transactions = Transaction.query.filter(Transaction.date >= first_of_month, Transaction.date < first_of_next_month,Transaction.income == True).all()
    for trans in income_transactions:
        total_income += trans.debit

    for trans in months_transactions:
        transaction_count += 1
        total_month_spend += trans.debit
        if trans.essential:
            esential_spend += trans.debit
        else:
            non_essential_spend += trans.debit

    months_contributions = Contribution.query.filter(Contribution.date >= first_of_month).all()
    total_month_contrib = 0
    for contrib in months_contributions:
        total_month_contrib += contrib.debit

    payload_highlights = {"total_income":total_income,"total_spend": total_month_spend, "total_contribution": total_month_contrib, "transaction_count":transaction_count,"utilisation":round(100*total_month_spend/total_monthly_budget,2)}
    payload["highlights"] = payload_highlights

    ## Daily Spend ##
    first_of_last_month = first_of_month_n_months_ago(today, 1)
    last_months_transactions = Transaction.query.filter(Transaction.date >= first_of_last_month, Transaction.date < first_of_month ,Transaction.income == False).all()

    last_month_totals = [0]*31
    this_month_totals = [0]*31
    for trans in months_transactions:
        this_month_totals[trans.date.day-1] += round(trans.debit,2)
    for trans in last_months_transactions:
        last_month_totals[trans.date.day-1] += round(trans.debit,2)

    for i,item in enumerate(this_month_totals):
        if i == 0:
            continue
        else:
            this_month_totals[i] += this_month_totals[i-1]

    for i,item in enumerate(last_month_totals):
        if i == 0:
            continue
        else:
            last_month_totals[i] += last_month_totals[i-1]

    payload_daily_transactions = {"last_month":last_month_totals, "this_month":this_month_totals, "labels":list(range(1,32))}

    payload["daily_transactions"] = payload_daily_transactions

    ## Essential spending ##
    payload["essential_spending"] = [{"label":"Essential","value":esential_spend}, {"label":"Non-Essential","value":non_essential_spend}]

    ## Funds ##

    funds = Fund.query.filter(Fund.budget_id==current_user.budget_id)
    funds_payload = []
    for f in funds:
        funds_payload.append({"id":f.id,"name":f.name,"balance":f.balance,"percent":round(100*f.balance/f.goal,2)})

    payload["funds"] = funds_payload
    return payload

''' ******************************************** TRANSACTIONS ******************************************** '''

@app.get("/transactions")
def get_transactions(): #Queries all transactions
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    all_categories = Category.query.filter(Category.budget_id == current_user.budget_id)
    categories_payload = []
    for cat in all_categories:
        categories_payload.append({
            "id":cat.id,
            "name":cat.name,
        })

    categories_payload.append({
            "id":0,
            "name":"Uncategorized",
        })

    all_users = User.query.filter(User.budget_id == current_user.budget_id)
    users_payload = []
    for user in all_users:
        users_payload.append({
            "id":user.id,
            "name":user.name,
        })

    month_diff = request.args.get('month')
    today = datetime.datetime.now()
    first_of_month = first_of_month_n_months_ago(today, month_diff)
    first_of_next_month = first_of_month_n_months_forward(first_of_month, 1)

    months_transactions = Transaction.query.filter(Transaction.date >= first_of_month, Transaction.date<first_of_next_month).order_by(Transaction.date.desc()).all()
    transactions_payload = []

    for trans in months_transactions:

        if trans.account.user.budget_id != current_user.budget_id:
            continue
        trans_serialized = {}
        trans_serialized["id"] = trans.id
        trans_serialized["name"] = trans.name
        trans_serialized["income"] = trans.income
        trans_serialized["essential"] = trans.essential
        trans_serialized["date"] = trans.date.strftime("%d %B %Y")
        trans_serialized["debit"] = trans.debit
        trans_serialized["user"] = trans.account.user.name
        if trans.category != None:
            trans_serialized["category"] = trans.category.name
        else:
            trans_serialized["category"] = ''
        transactions_payload.append(trans_serialized)
        
    payload = {}
    payload["transactions"] = transactions_payload
    payload["categories"] = categories_payload
    payload["users"] = users_payload

    return payload

## New Transaction Info ##
@app.get("/transaction/create")
def new_transaction_info():

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}
    
    accounts = Account.query.filter(Account.user_id == current_user.id).order_by(Account.name.desc()).all()
    other_users = [user.id for user in User.query.filter(User.budget_id == current_user.budget_id, User.id != current_user.id)]
    other_user_accounts = Account.query.filter(Account.user_id.in_(other_users)).order_by(Account.name.desc()).all()
    categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.name.asc()).all()
    payload = {}

    accounts_payload = []
    for account in accounts:
        accounts_payload.append({"id":account.id,"name":account.name})

    other_accounts_payload = []
    for account in other_user_accounts:
        other_accounts_payload.append({"id":account.id,"name":account.name})

    categories_payload = []
    for cat in categories:
        categories_payload.append({"id":cat.id,"name":cat.name})

    payload["other_accounts"] = other_accounts_payload
    payload["accounts"] = accounts_payload
    payload["categories"] = categories_payload

    return payload

@app.get("/transaction/edit/<id>")
def edit_transaction_info(id):

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    accounts = Account.query.filter(Account.user_id == current_user.id).order_by(Account.name.desc()).all()
    other_users = [user.id for user in User.query.filter(User.budget_id == current_user.budget_id, User.id != current_user.id)]
    other_user_accounts = Account.query.filter(Account.user_id.in_(other_users)).order_by(Account.name.desc()).all()
    
    transaction = Transaction.query.get(int(id))
    
    if(Account.query.get(transaction.account_id).user_id != current_user.id):
        return {"code":401,"message":"You are not authorized to edit this transaction."}
    
    accounts = Account.query.filter(Account.user_id == current_user.id).order_by(Account.name.asc()).all()
    categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.name.asc()).all()
    
    payload = {}

    accounts_payload = []
    for account in accounts:
        accounts_payload.append({"id":account.id,"name":account.name})

    other_accounts_payload = []
    for account in other_user_accounts:
        other_accounts_payload.append({"id":account.id,"name":account.name})

    categories_payload = []
    for cat in categories:
        categories_payload.append({"id":cat.id,"name":cat.name})

    
    payload["other_accounts"] = other_accounts_payload
    payload["accounts"] = accounts_payload
    payload["categories"] = categories_payload
    payload["transaction"] = {
        "id":transaction.id,
        "name":transaction.name,
        "date":transaction.date.strftime("%Y-%m-%d"),
        "income":transaction.income,
        "essential":transaction.essential,
        "category_id":transaction.category_id,
        "account_id":transaction.account_id,
        "debit":transaction.debit,
    }

    return payload

@app.post("/transaction/create")
def create_transaction():
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    account_id = request.json['account_id']

    if(Account.query.get(account_id).user_id != current_user.id):
        return {"code":401,"message":"You are not authorized to add transactions on this account."}

    joint_transaction = request.json["joint"]
    other_account = request.json["other_account"]


    if joint_transaction and other_account != None:
        name = request.json['name']
        debit = round(float(request.json['debit'])/2,2)
        date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
        income = request.json['income']
        category_id = request.json['category_id']
        essential = request.json['essential']

        new_transaction = Transaction(name, debit, date, income, account_id, category_id,essential)
        new_split_transaction = Transaction(name, debit, date, income, other_account, category_id,essential)
        db.session.add(new_transaction)
        db.session.add(new_split_transaction)

        other_user = Account.query.get(other_account).user_id

        new_split = Splits(new_transaction.id, current_user.id, other_user,round(float(request.json['debit'])/2,2), False)
        db.session.add(new_split)

        db.session.commit()

        return transaction_schema.jsonify(new_transaction)
        
    else:
        
        name = request.json['name']
        debit = request.json['debit']
        date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
        income = request.json['income']
        category_id = request.json['category_id']
        essential = request.json['essential']

        new_transaction = Transaction(name, debit, date, income, account_id, category_id,essential)
        db.session.add(new_transaction)
        db.session.commit()

        return transaction_schema.jsonify(new_transaction)

@app.post("/transaction/bulk-create/<account_id>")
def create_bulk_transaction(account_id):
    
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    try:
        uploaded_file = request.files["file"]
        if uploaded_file.filename != '' and uploaded_file.filename.endswith(".csv"):
            transactions = parsefile(uploaded_file)
        else:
            return {"code":415,"message":"Could not read file."}
    except Exception as e:
        return {"code":500,"message":"Could not read file."}

    income = False
    account_id = int(account_id)

    if(Account.query.get(account_id).user_id != current_user.id):
        return {"code":401,"message":"You are not authorized to add transactions on this account."}

    new_transactions = []

    for transaction in transactions:
        new_transaction = Transaction(transaction["name"][:-3], transaction["debit"], transaction["date"], income, account_id, transaction["category_id"])
        db.session.add(new_transaction)
        new_transactions.append(new_transaction)

    db.session.commit()

    return transactions_schema.jsonify(new_transactions)

@app.post("/transaction/edit")
def edit_transaction():
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    trans_id = request.json['id']
    transaction = Transaction.query.get(trans_id)
    account_id = request.json['account_id']

    if(Account.query.get(account_id).user_id != current_user.id):
        return {"code":401,"message":"You are not authorized to add transactions on this account."}

    
    joint_transaction = request.json["joint"]
    other_account = request.json["other_account"]

    if joint_transaction and other_account != None:
        transaction.name = request.json['name']
        transaction.debit = round(float(request.json['debit'])/2,2)
        transaction.date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
        transaction.income = request.json['income']
        transaction.essential = request.json['essential']
        transaction.category_id = request.json['category_id']
        transaction.account_id = account_id

        new_transaction = Transaction(
            request.json['name'], 
            round(float(request.json['debit'])/2,2), 
            datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d"),
            request.json['income'],
            other_account,
            request.json['category_id'],
            request.json['essential'])

        other_user = Account.query.get(other_account).user_id

        db.session.add(new_transaction)
        
        new_split = Splits(transaction.id, current_user.id, other_user,round(float(request.json['debit'])/2,2), False)
        db.session.add(new_split)
        db.session.commit()

        return transaction_schema.jsonify(transaction)

    else:

        transaction.name = request.json['name']
        transaction.debit = request.json['debit']
        transaction.date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
        transaction.income = request.json['income']
        transaction.essential = request.json['essential']
        transaction.category_id = request.json['category_id']
        transaction.account_id = account_id

        db.session.commit()

        return transaction_schema.jsonify(transaction)

@app.delete('/transaction/delete')
def delete_transaction():

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    transaction = Transaction.query.get(request.json["id"])

    account = Account.query.get(transaction.account_id)

    if account.user_id == current_user.id:
        db.session.delete(transaction)
        db.session.commit()
        return {"code":200, "message": "Transaction Deleted."}

    return {"code":401, "message": "Unauthorized"}

@app.delete('/transaction/delete-group')
def delete_transactions():

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    try: 
        transactions = request.json["transactions"]

        for trans in transactions:

            transaction = Transaction.query.get(trans)

            account = Account.query.get(transaction.account_id)

            if account.user_id == current_user.id:
                db.session.delete(transaction)
        db.session.commit()
        
        return {"code":200, "message": "Transactions Deleted."}
    except:

        return {"code":401, "message": "Unauthorized"}

@app.get("/splits")
def get_splits(): #Queries all transactions
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    all_users = [user.id for user in User.query.filter(User.budget_id == current_user.budget_id)]

    all_splits = Splits.query.filter(Splits.original_user_id.in_(all_users)).order_by(Splits.paid.asc(), Splits.original_transaction_id.desc()).all()
    splits_payload = []

    balance_owing = 0.00
    balance_owed = 0.00

    for split in all_splits:
        trans = Transaction.query.get(split.original_transaction_id)
        if not trans:
            continue

        trans_serialized = {}
        trans_serialized["id"] = split.id
        trans_serialized["name"] = trans.name
        trans_serialized["date"] = trans.date.strftime("%d %B %Y")
        trans_serialized["debit"] = split.debit
        trans_serialized["user"] = split.original_user.name
        trans_serialized["paid"] = split.paid
        
        if current_user.id == split.split_user_id:
            trans_serialized["owed"] = True
            if not split.paid:
                balance_owing += split.debit
        else:
            trans_serialized["owed"] = False
            if not split.paid:
               balance_owed += split.debit

        if trans.category != None:
            trans_serialized["category"] = trans.category.name
        else:
            trans_serialized["category"] = ''
        splits_payload.append(trans_serialized)
        
    payload = {}
    payload["transactions"] = splits_payload
    payload["balance"] = balance_owing - balance_owed

    return payload

@app.post("/splits")
def get_splits_and_post(): #Queries all transactions
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    paid_split = Splits.query.get(request.json['id'])

    if paid_split.split_user_id == current_user.id:
        paid_split.paid = True
        print("Paying")
        db.session.add(paid_split)
        db.session.commit()

    all_users = [user.id for user in User.query.filter(User.budget_id == current_user.budget_id)]

    all_splits = Splits.query.filter(Splits.original_user_id.in_(all_users)).order_by().all()
    splits_payload = []

    balance_owing = 0.00
    balance_owed = 0.00

    for split in all_splits:
        trans = Transaction.query.get(split.original_transaction_id)
        if not trans:
            continue

        trans_serialized = {}
        trans_serialized["id"] = split.id
        trans_serialized["name"] = trans.name
        trans_serialized["date"] = trans.date.strftime("%d %B %Y")
        trans_serialized["debit"] = split.debit
        trans_serialized["user"] = split.original_user.name
        trans_serialized["paid"] = split.paid
        
        if current_user.id == split.split_user_id:
            trans_serialized["owed"] = True
            balance_owing += split.debit
        else:
            trans_serialized["owed"] = False
            balance_owed += split.debit

        if trans.category != None:
            trans_serialized["category"] = trans.category.name
        else:
            trans_serialized["category"] = ''
        splits_payload.append(trans_serialized)
        
    payload = {}
    payload["transactions"] = splits_payload
    payload["balance"] = balance_owing - balance_owed

    return payload

@app.post("/transaction/amex_bill")
def create_amex_bill(): # ADMIN

    name = request.json['name']
    amount_owed = float(request.json['debit'])
    debit = 0.00
    date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
    account_id = int(request.json['account_id'])
    payee_account_id = int(request.json['payee_account_id'])
    category_id = None
    essential = False
    income = False

    new_transaction = Transaction(name, debit, date, income, account_id, category_id,essential)
    db.session.add(new_transaction)

    other_user = Account.query.get(payee_account_id).user_id
    current_user = Account.query.get(account_id).user_id

    new_split = Splits(new_transaction.id, current_user, other_user,amount_owed, False)
    db.session.add(new_split)

    db.session.commit()

    return transaction_schema.jsonify(new_transaction)

''' ******************************************** BUDGET ******************************************** '''
@app.get("/budget/<category_id>")
def category_view(category_id):
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    payload = {}
    all_budget_users = User.query.filter(User.budget_id == current_user.budget_id)

    user_select = request.args.get('users')
    selected_users = []
    if user_select != None:
        for u in list(user_select):
            selected_users.append(int(u))
    else:
        selected_users = [1] * all_budget_users.count()

    if selected_users == [0] * all_budget_users.count():
        selected_users = [1] * all_budget_users.count()

    users_payload = []

    for index,user in enumerate(all_budget_users):
        users_payload.append({"id":user.id,"name":user.name,"selected":True if selected_users[index] else False })
        
    
    selected_user_ids = []

    for index, user in enumerate(all_budget_users):
        if selected_users[index]:
            selected_user_ids.append(user.id)

    payload["users"] = users_payload
    
    ####
    query_accounts = []
    for acc in Account.query.filter(Account.user_id.in_(selected_user_ids)):
        query_accounts.append(acc.id)


    ## Recent Transactions ##
    recent_transactions = Transaction.query.filter(Transaction.category_id == category_id,Transaction.account_id.in_(query_accounts)).order_by(Transaction.date.desc()).limit(10).all()
    selected_category = Category.query.get(int(category_id))

    payload_recent_transactions = []
    for trans in recent_transactions:
        transaction = {}
        transaction["title"] =  trans.name
        transaction["id"] =  trans.id
        transaction["time"] = trans.date.strftime("%m/%d/%Y")
        transaction["essential"] = trans.essential
        transaction["debit"] = trans.debit
        payload_recent_transactions.append(transaction)

    payload["recent_transactions"] = payload_recent_transactions

    ## Pie Chart ##
    category_totals = {}
    categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.monthly_spend.desc()).limit(3).all()
    for cat in categories:
        category_totals[cat.id] = {
            "label": cat.name, 
            "budget": cat.monthly_spend, 
            "value": 0.00,
            }

    
    month_diff = request.args.get('month')
    today = datetime.datetime.now()
    
    first_of_month = first_of_month_n_months_ago(today, month_diff)
    first_of_next_month = first_of_month_n_months_forward(first_of_month, 1)
    months_transactions = Transaction.query.filter(Transaction.category_id == category_id,Transaction.date >= first_of_month, Transaction.date < first_of_next_month,Transaction.income == False,Transaction.account_id.in_(query_accounts) ).all()

    total_other_spend_for_month = 0.00
    for trans in months_transactions:
        total_other_spend_for_month += trans.debit
        if trans.category_id in category_totals.keys():
            category_totals[trans.category_id]["value"] += trans.debit
            total_other_spend_for_month -= trans.debit

    payload_top_categories = []
    for item in category_totals.values():
        payload_top_categories.append(item)

    payload_top_categories.append({
        "label": "Other",
        "budget": 0.00,
        "value": total_other_spend_for_month,
    })
    
    payload["pie_chart"] = payload_top_categories

    # Spend by User
    spend_by_user_payload = []
    for user in all_budget_users:
        user_total_spend = 0.00
        user_accounts = [account.id for account in Account.query.filter(Account.user_id == user.id)]
        temp_transactions = Transaction.query.filter(Transaction.category_id == category_id,Transaction.date >= first_of_month, Transaction.date < first_of_next_month,Transaction.income == False,Transaction.account_id.in_(user_accounts)).all()
        for trans in temp_transactions:
            user_total_spend += trans.debit
        spend_by_user_payload.append({"label":user.name,"value":user_total_spend})

    payload["user_spend"] = spend_by_user_payload
        

    ## Spend by Category ##
    vendor_names = []

    for trans in months_transactions:
        not_found = True
        for vendor in vendor_names:
            if trans.name.split('-')[0] == vendor["label"].split('-')[0]:
                vendor["spend"] += trans.debit
                not_found = False
                break
        if not_found:
            vendor_names.append({"label": trans.name.split('-')[0], "spend": trans.debit})

    payload["spend_by_name"] = vendor_names

    ## Highlights ##
    total_month_spend = 0
    transaction_count = 0
    esential_spend = 0.00
    total_income = 0.00
    non_essential_spend = 0.00
    total_monthly_budget = selected_category.monthly_spend

    total_months = dateDelta_in_months(BUDGET_START_DATE,datetime.datetime.now())
    year_budget = total_months*total_monthly_budget
    year_spend = 0.00

    all_transactions = Transaction.query.filter(Transaction.category_id == category_id,Transaction.account_id.in_(query_accounts), Transaction.date >= BUDGET_START_DATE).all()
    for trans in all_transactions:
        year_spend += trans.debit

    year_balance = year_budget - year_spend
    #if year_balance < 0:
    #    year_balance = 0


    income_transactions = Transaction.query.filter(Transaction.income == True,Transaction.account_id.in_(query_accounts)).all()
    for trans in income_transactions:
        total_income += trans.debit

    for trans in months_transactions:
        transaction_count += 1
        total_month_spend += trans.debit
        if trans.essential:
            esential_spend += trans.debit
        else:
            non_essential_spend += trans.debit

    payload_highlights = {"monthly_budget":total_monthly_budget,"total_spend": total_month_spend, "total_contribution": year_balance, "transaction_count":transaction_count,"utilisation":round(100*total_month_spend/total_monthly_budget,2)}
    payload["highlights"] = payload_highlights

    ## Daily Spend ##
    first_of_last_month = first_of_month_n_months_ago(today,1)
    last_months_transactions = Transaction.query.filter(Transaction.category_id == category_id,Transaction.date >= first_of_last_month, Transaction.date < first_of_month ,Transaction.income == False,Transaction.account_id.in_(query_accounts)).all()

    last_month_totals = [0]*31
    this_month_totals = [0]*31
    for trans in months_transactions:
        this_month_totals[trans.date.day-1] += round(trans.debit,2)
    for trans in last_months_transactions:
        last_month_totals[trans.date.day-1] += round(trans.debit,2)

    for i,item in enumerate(this_month_totals):
        if i == 0:
            continue
        else:
            this_month_totals[i] += this_month_totals[i-1]

    for i,item in enumerate(last_month_totals):
        if i == 0:
            continue
        else:
            last_month_totals[i] += last_month_totals[i-1]

    payload_daily_transactions = {"last_month":last_month_totals, "this_month":this_month_totals, "labels":list(range(1,32))}

    payload["daily_transactions"] = payload_daily_transactions

    ## Essential spending ##
    payload["essential_spending"] = [{"label":"Essential","value":esential_spend}, {"label":"Non-Essential","value":non_essential_spend}]

    ## Category name ##
    payload["category_id"] = selected_category.id
    payload["category_name"] = selected_category.name
    payload["month_name"] = today.strftime("%B")

    ## All Categories ##

    all_categories = Category.query.filter(Category.budget_id == current_user.budget_id).order_by(Category.name.asc()).all()
    categories_payload = []
    for cat in all_categories:
        categories_payload.append({"id":cat.id,"name":cat.name})
    payload["categories"] = categories_payload

    return payload

''' ******************************************** SAVINGS ******************************************** '''
@app.get('/funds')
def get_funds():

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    payload = {}
    funds_payload = []

    funds = Fund.query.filter(Fund.budget_id == current_user.budget_id)

    today = datetime.datetime.now()
    first_of_month = datetime.datetime(today.year, today.month, 1)

    
    for fund in funds:
        contributions_payload = []
        months_contributions = Contribution.query.filter(Contribution.date >= first_of_month, Contribution.fund_id == fund.id).order_by(Contribution.date.desc()).all()
        total_month_contrib = 0
        for contrib in months_contributions:
            total_month_contrib += contrib.debit
            contributions_payload.append({
                "debit":contrib.debit,
                "date":contrib.date,
                "name":User.query.get(contrib.user_id).name,
            })
        funds_payload.append({
            "name": fund.name,
            "id": fund.id,
            "goal":fund.goal,
            "balance":fund.balance,
            "month_contributions":total_month_contrib,
            "percent": round(100*fund.balance/fund.goal,0),
            "contributions": contributions_payload
        })
    
    payload["funds"] = funds_payload

    return payload

@app.get("/savings/contribute")
def new_contribution_info():

    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}
    
    funds = Fund.query.filter(Fund.budget_id == current_user.budget_id).order_by(Fund.name.desc()).all()
    payload = {}

    funds_payload = []
    for fund in funds:
        funds_payload.append({"id":fund.id,"name":fund.name})


    payload["funds"] = funds_payload

    return payload


@app.post("/savings/contribute")
def create_contribution():
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    debit = float(request.json['debit'])
    date = datetime.datetime.strptime(request.json['date'][0:10],"%Y-%m-%d")
    fund_id = int(request.json['fund_id'])

    fund = Fund.query.get(fund_id)
    if(fund.budget_id != current_user.budget_id):
        return {"code":401,"message":"You are not authorized to add transactions on this account."}

    new_contribution = Contribution(debit, date, current_user.id, fund_id)
    fund.balance += debit
    db.session.add(new_contribution)
    db.session.add(fund)
    db.session.commit()

    return contribution_schema.jsonify(new_contribution)


''' ******************************************** LOGIN ******************************************** '''
@app.post("/login")
def login():

    email = request.json['email']
    password = request.json['password']

    try:
        user = User.query.filter_by(email=email).first()
        if user.check_pw(password):
            auth_token = user.encode_auth_token(user.id)
            payload = {
                "code":200,
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "auth": auth_token
            }
            return jsonify(payload)
        else:
            return {"code":401,"Msg":"Incorrect Password"}
    except:
        return {"code":401,"Msg":"Incorrect Password"}

@app.post("/reset-password")
def reset_password():

    new_password = request.json['password']
    auth_token = request.json['auth']

    try:
        user_id = User.decode_auth_token(auth_token)
        current_user = User.query.get(user_id)
        current_user.password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        db.session.commit()
        return {"code":200, "Message":"Password was reset successfully."}
    except:
        return {"code":401, "Message":"Token invalid."}

@app.post("/forgot-password")
def forgot_password():

    email = request.json['email']
    hostname = request.json['hostname']

    try:
        current_user = User.query.filter(User.email == email).first()

        auth_token = current_user.encode_auth_token(current_user.id,expiry_day=0, expiry_minute=30)
        
        subject = "Password Reset Request"
        body = "Click the link below to reset your password. If this was not you please disregard this message.\n\nhttp://"+hostname+"/reset-password?auth="+auth_token +"\n\nThe link is only valid for 30 minutes."
        sender = SEND_EMAIL_FROM
        recipients = [current_user.email,]
        password = SEND_EMAIL_PASS

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = formataddr(("KERNEL", sender))
        msg['To'] = ', '.join(recipients)
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
            smtp_server.login(sender, password)
            smtp_server.sendmail(sender, recipients, msg.as_string())
        

        return {"code":200, "Message":"Password was reset successfully."}
    except:
        return {"code":401, "Message":"Token invalid."}

@app.get("/nav")
def nav():
    
    try:
        current_user = getUser(request)
    except AuthenticationError as e:
        return {"code":e.code, "message":e.message}

    return {"code":200, "name":current_user.name,"id":current_user.id}


''' ******************************************** ADMIN API'S ******************************************** '''
@app.post("/known-category/create")
def create_known_category(): #ADMIN
    stem = request.json['stem']
    category_id = request.json['category_id']

    new_cat = KnownCategories(stem, category_id)
    db.session.add(new_cat)
    db.session.commit()

    return known_categories_schema.jsonify(new_cat)

@app.post("/fund/create")
def create_fund(): #ADMIN
    name = request.json['name']
    goal = request.json['goal']
    budget_id = request.json['budget_id']

    new_fund = Fund(name, goal, budget_id)
    db.session.add(new_fund)
    db.session.commit()

    return fund_schema.jsonify(new_fund)

@app.post("/account/create")
def create_account(): #ADMIN
    name = request.json['name']
    user_id = request.json['user_id']

    new_account = Account(name, user_id)
    db.session.add(new_account)
    db.session.commit()

    return account_schema.jsonify(new_account)

@app.post("/budget/create")
def create_budget(): #ADMIN
    name = request.json['name']

    new_budget = Budget(name)
    db.session.add(new_budget)
    db.session.commit()

    return budget_schema.jsonify(new_budget)

@app.post("/user/create")
def create_user(): #ADMIN
    email = request.json['email']
    name = request.json['name']
    password = request.json['password']
    budget_id = request.json['budget_id']

    new_user = User(email, name, password, budget_id)
    db.session.add(new_user)
    db.session.commit()

    return user_schema.jsonify(new_user)

@app.post("/category/create")
def create_category(): #ADMIN
    try:
        name = request.json['name']
        monthly_spend = request.json['monthly_spend']
        essential = request.json['essential']
        budget_id = request.json['budget_id']

        new_category = Category(name, monthly_spend, essential, budget_id)
        db.session.add(new_category)
        db.session.commit()

        return category_schema.jsonify(new_category)
    except Exception as e:
        return {"Msg":"An Error has occured"}

''' ******************************************** HELPER FUNCTIONS ******************************************** '''
def getUser(request):
    try:
        token = request.headers["auth"]
        user_id = User.decode_auth_token(token)
        return User.query.get(user_id)
    except jwt.ExpiredSignatureError:
        raise AuthenticationError('Signature expired. Please log in again.',401)
    except jwt.InvalidTokenError:
        raise AuthenticationError('Invalid token. Please log in again.',401)
    except Exception:
        raise AuthenticationError('Please log in first.',401)

def parsefile(file):
    file.readline()
    file.readline()
    file.readline()

    transactions = []
    while True:
        line = file.readline()
        if not line:
            break
        transaction = {}
        this_line = str(line).split(',')
        transaction["date"] = datetime.datetime.strptime(this_line[2],"%Y%m%d")
        transaction["debit"] = this_line[4]
        transaction["name"] = this_line[5]

        if transaction["debit"][0] == "-":
            continue
        else:
            transaction["category_id"] = KnownCategories.search(transaction["name"])
            transactions.append(transaction)
    file.close()
    return transactions

def dateDelta_in_months(date1, date2):
    months = 1
    months += (date2.year - date1.year)*12
    months += date2.month - date1.month
    return months

def first_of_month_n_months_ago(date, months):
    if months == None:
        months = 0
    months = int(months)

    new_date = datetime.datetime(date.year, date.month, 1)

    if (new_date.month - months < 1):
        new_date = new_date.replace(month=new_date.month-months+12, year=new_date.year-1)
    else:
        new_date = new_date.replace(month=new_date.month-months)
    return new_date



def first_of_month_n_months_forward(date, months):
    if months == None:
        months = 0
    months = int(months)

    new_date = datetime.datetime(date.year, date.month, 1)

    if (new_date.month + months > 12):
        new_date = new_date.replace(month=new_date.month+months-12, year=new_date.year+1)
    else:
        new_date = new_date.replace(month=new_date.month+months)
    return new_date