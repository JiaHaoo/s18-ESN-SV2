**Show Home Page**
----

* **URL**

  /

* **Method:**
  
  `GET` 
  
* **Success Response:**

  * **Code:** 200
    **Content:** Home Page
 
* **Sample Call:**

  ```curl http://<uri_root>:<port_num>/```



**Show Login Page**
----

* **URL**

  /login

* **Method:**
  
  `GET` 
  
* **Success Response:**

  * **Code:** 200
    **Content:** Login Page
 
* **Sample Call:**

  ```curl http://<uri_root>:<port_num>/login```



**Logout to Return to Home Page**
----

* **URL**

  /sigout

* **Method:**
  
  `GET` 
  
* **Success Response:**

  * **Code:** 302
    **Content:** Home Page
 
* **Sample Call:**

  ```curl http://<uri_root>:<port_num>/sigout```


**Get Main Page After Login**
----

* **URL**

  /v1/users//&lt;username&gt;

* **Method:**
  
  `GET` 
  
* **Success Response:**

  * **Code:** 200
    **Content:** Main Page

  * **Coce:** 302
    **Content:** Login Page
 
* **Sample Call:**

  ```curl http://<uri_root>:<port_num>/v1/users/<username>```


**Show Users**
----

* **URL**

  /v1/users

* **Method:**

  `GET`

* **URL Params** 

  **Optional:**
  `sort=+online,+username`
  `offset=[integer, default: 0]`
  `count=[integer, default: 25]`

* **Success Response:**

  * **Code:** 200
    **Content:** `{ online : [object], offline : [object] }`

* **Error Response:**

  * **Code:** 400
    **Content:** `{ name : <specific_error_name>, message: <detailed_error_message> }` 
 

* **Sample Call:**

  `curl http://<uri_root>:<port_num>/v1/users?sort=+status,+username&offset=10&count=25`


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

  * **Code:** 200
    **Content:** redirected url
 
* **Error Response:**

  * **Code:** 401  
    **Content:** `{ name : <specific_error_name>, message: <detailed_error_message> }` 

  * **Code:** 503
    **Content:** `{ name : <specific_error_name>, message: <detailed_error_message> }`

* **Sample Call:**
  
  ```javascript
    $.post({
      "/users",
      {username: username, password: password},
      success : function() {},
      "json"
    }).fail(function(data) {
      if(data['name'] == 'IncorrectPasswordError') {
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

  * **Code:** 200
    **Content:** `{}`

* **Error Response:**

  * **Code:** 403
    **Content:** `{ name : <specific_error_name>, message: <detailed_error_message> }` 

* **Sample Call:**

  ```javascript
    $.put({
      "/v1/users/<username>",
      {password: password},
      success : function(data) {},
      "json"
    });
  ```


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

  `offset=[integer, default: 0]`
  `count=[integer, default: 25]`

* **Success Response:**

  * **Code:** 200
    **Content:** {message: [string]}

* **Sample Call:**

  `curl http://<uri_root>:<port_num>/v1/rooms/0/messages?sort=+timestamp`
