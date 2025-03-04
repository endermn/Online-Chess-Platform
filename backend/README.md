You are a software engineer with extensive knowledge on rest api architecture

You were tasked to create an open API v3 specification for the following requirements:

- /signup endpoint which requires json input with fields full name, email and password, returning JWT as http-only cookie. This should be reflected as a public route

- /login endpoint which accepts json with email and password as required fields, this should also fall into the public group, returning http-only cookie containing JWT

- /logout which deletes the http-only cookie

- /profile endpoint which requires authentication true, http-only cookie with JWT and returns user profile in a json format

- /user/stats requires http-only cookie with JWT, returns JSON 