**Show Login Page**
----

* **URL**

  /

* **Method:**
  
  `GET` 
  
* **Success Response:**

  * **Code:** 200
    **Content:** HTML page for Login
 
* **Sample Call:**

  ```curl http://<uri_root>:<port_num>/```



**Post Login Info**
----
* **URL**

  /v1/users

* **Method:**
  
  `POST`

* **Data Params**

  `username=[string]` 
  `password=[string]`

* **Success Response:**

  * **Code:** 300
    **Content:** redirect to main page
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED 
    **Content:** `{ error : "incorrect password" }` or `{ error : "no such account"}`

* **Sample Call:**
  
  ```javascript
    $.post({
      "/users",
      {username: username, password: password},
      success : function() {},
      "json"
    }).fail(function(data) {
      if(data['error'] == 'incorrect password') {
        // do something if user input incorrect password
      }
      else {
        // ask whether user want to create the account
      }
    });
  ```
  
**Put Register Info**
----
* **URL**

  /v1/users/&lt;username&gt;

* **Method:**

  `PUT`

* **Data Params**

  `password=[string]`

* **Success Response:**

  * **Code:** 300
    **Content:** redirect to main page

* **Sample Call:**

  ```javascript
    $.put({
      "/v1/users/<username>",
      {password: password},
      success : function(data) {},
      "json"
    });
  ```

**Show Users**
----

* **URL**

  /v1/users

* **Method:**

  `GET`

* **URL Params**

   **Required:**
 
  `sort=+state,+username`

  **Optional:**

  `offset=[integer]`
  `count=[integer]`

* **Success Response:**

  * **Code:** 200
    **Content:** `{ online : [object], offline : [object] }`
 

* **Sample Call:**

  `curl http://<uri_root>:<port_num>/v1/users?sort=+state,+username`

**Post a Message**
----

* **URL**

  /v1/rooms/0/messages

* **Method:**

  `POST`

* **Data Params**

  `message=[string]`

* **Success Response:**

  * **Code:** 201
    **Content:** NONE

* **Sample Call:**

  ```javascript
    $.post({"/messages", {message: message, username: username}, "json"
    });
  ```

**Get Messages**
----

* **URL**

  /v1/rooms/0/messages

* **Method:**

  `GET`

* **URL Params**

  **Required:**

  `sort=+timestamp`

  **Optional:**

  `count=[integer]`

* **Success Response:**

  * **Code:** 200
    **Content:** {message: [string]}

* **Sample Call:**

  `curl http://<uri_root>:<port_num>/v1/rooms/0/messages?sort=+timestamp`
