# Budget tracking app

1. Create the environment files
    
    .flaskenv
    ```
    FLASK_APP=app
    FLASK_DEBUG=True
    ```
    .env
    ```
    EMAIL_FROM=
    EMAIL_PASS=
    SECRET_KEY=
    ```
2. Create and active the virtual environment
    ```
    python -m venv ./myvenv
    .\myvenv\Scripts\Activate.ps1
    ```
3. Install the requirements
    ```
    pip install -r requirements.txt
    ```
4. Create tables (in Python shell)
    ```
    from app import app, db
    app.app_context().push()
    db.create_all()
    quit()
    ```

5. Run the api server
    ```
    flask run
    ```
    
6. Seed the tables
    ```
    python seed.py
    ```

The API server should be accessible on http://127.0.0.1:5000