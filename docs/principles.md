# design principles

## dependency injection

Use as few `require`s as possible. Put your dependencies into parameters of your `export`ed functions.

## split routers and business logics

do not put any business logics (access to DB, verify params, ...) into routers. **Routers route, no other responsibilities**.

Typical router work:

```js
r.get('/:someparam', function(req, res, next) {
    //routers get param
    var someparam = req.someparam;

    //call controllers to do real work
    //controllers may be async
    somecontroller.someaction(someparam, function(somedata) {

        //routers do render
        res.render(somedata);
    });
}
```

## be aware of role of your piece of code

We define code roles:
- models: DAO objects to access to DB
- utilities: Tool functions WITHOUT states
- controllers: Manage states, mostly singleton
- routers: Route.

When you write anything, **be aware** of what role you are, and put it into corresponding folders/files.

## all exports should be dict or object, even if you just export one thing

To provide better extensibility (you may need to export more later)

## all non-router functions should have document comments

see [JSDoc](http://usejsdoc.org/).

tl;dr:

- use `/**` to start, `*/` to end
- use `@param <paramname> <type> <description>`
- use `@return <type> <description>`

## workflow

for each iteration:

- meeting to confirm
    - consent of goal
    - split to each task, and claim (github issue/ trello for each)
- `git checkout -b mengye/searchbar`
- design: module to add, function to add, funtion to change -> github issue
- write test
- write your code to pass the test
- github pull request, ask 2+ person to accept
    - naming: if not yet done, add `[WIP]`
        - e.g. `[WIP] add announcement page`
        - WIP for `Work In Progress`
- back to `master`, fix conflict, check CI
