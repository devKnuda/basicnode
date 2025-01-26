# Basic Node Project

## Introduction

This project is part of the AppDev2 course, week 3. The goal is to practice working with Git, refactoring code, and using Express.js to handle HTTP requests.

## Objectives

1. Clone the repository from [demo25](https://github.com/mm-207/demo25).
2. Create a local copy of the repository.
3. Create a GitHub repository and link it to your local copy.
4. Implement the following features:
    - Return a poem at the URL `/tmp/poem`.
    - Return a random quote at the URL `/tmp/quote` (at least 5 different quotes).
    - Return the sum of two numbers at the URL `/tmp/sum/a/b` using the POST method.

## Instructions

### Cloning the Repository

1. Clone the repository from [demo25](https://github.com/mm-207/demo25) to your local machine.
2. Create a new repository on GitHub.
3. Link your local repository to the new GitHub repository.

### Implementing Features

1. **Poem Endpoint**: Implement code to return a poem at the URL `/tmp/poem`.
2. **Quote Endpoint**: Implement code to return a random quote at the URL `/tmp/quote`.
3. **Sum Endpoint**: Implement code to return the sum of two numbers at the URL `/tmp/sum/a/b` using the POST method.

### Resources

- [Express.js API](https://expressjs.com/en/api.html#app.get.method)
- [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [Express.js POST Method](https://expressjs.com/en/api.html#app.post.method)
- [Express.js Route Parameters](https://expressjs.com/en/guide/routing.html#route-parameters)

## Accessing the Endpoints

You can use `curl` to test the different endpoints of your application.

### Poem Endpoint

To get a poem, use the following command:

```sh
curl http://localhost:8000/tmp/poem
```

### Quote Endpoint

To get a random quote, use the following command:

```sh
curl http://localhost:8000/tmp/quote
```

### Sum Endpoint

To get the sum of two numbers, use the following command:

```sh
curl -X POST http://localhost:8000/tmp/sum/5/10
```

Replace `5` and `10` with any numbers you want to sum.

### Card Deck API

The application now includes a Card Deck API with the following endpoints:

#### Create a New Deck
```sh
curl -X POST http://localhost:8000/tmp/deck
```
Returns a deck_id that can be used for subsequent operations.

### Shuffle a Deck
```sh
curl -X PATCH http://localhost:8000/tmp/deck/shuffle/{deck_id}
```
Randomly shuffles all cards in the specified deck.

### View a Deck
```sh
curl http://localhost:8000/tmp/deck/{deck_id}
```
Returns all cards currently in the deck.

### Draw a Card
```sh
curl http://localhost:8000/tmp/deck/{deck_id}/card
```
Draws and returns the top card from the deck.