---
author: Chris Gradwohl
date: 2023-12-12T16:53:53.226Z
title: Go Modules Explained
tags:
  - aws
  - serverless
description: A simple, effective and brief overview of Go Modules.
---

When I first started learning Go, I found it challenging to learn the basics of a Go project. I simply wanted to learn how to start a new project, add some dependencies, and compile the project. Yet, it was difficult to gain the basic knowledge I was looking for. So in this post, I will explain the primitives of all Go projects. We will cover Go modules and packages, and how to create them. This is the Hello World guide I wish I had when I first started writing Go.

## Prerequisites

Installing Go is pretty simple. Just follow the instructions here: https://go.dev/doc/install On gotcha that happened on my work machine was that the default directory for downloaded Go packages is `$HOME/go/bin` which I had to set in my PATH.

## GOPATH

Before we dive in, here is a brief history of Go development before Go modules.

Traditionally (before Go version 1.11), when starting a new Go project, developers had to work with the `$**GOPATH**` environment variable which points to a directory on your machine.

 A typical `$**GOPATH**` contains three subdirectories:

- `$**GOPATH/src**`: Contains Go source files. This is where your Go projects (and typically their Git repositories) reside. Each project is in its own subdirectory within **`src`**, usually structured as **`github.com/username/projectname`**.
- `$**GOPATH/pkg**`: Holds compiled package code. Go saves compiled versions of each package here to speed up subsequent compilations.
- `$**GOPATH/bin**`: Contains compiled binaries. When you build a Go project (e.g., using **`go install`**), the resulting executable is placed in this director

This made working on multiple go projects very awkward as almost everything was in global scope. If you wanted multiple Go workspaces, you can manage them in a couple of ways, but it's important to note that the Go tooling traditionally expects a single **`GOPATH`**. However, there are strategies to work with multiple workspaces

1. Manually change **`GOPATH`** as you switch between workspaces
- When working on projects in your first workspace:
    
    ```bash
    export GOPATH="/path/to/first/workspace"
    ```
    
- Then, when switching to another workspace:
    
    ```bash
    export GOPATH="/path/to/second/workspace"
    ```
    
2. **Directory-Specific Variables**: Use tools to automatically set **`GOPATH`** based on the current directory.
3. **Consolidate Workspaces**: Keep all projects under a single **`GOPATH`**, but organize them in separate directories.

## Modules

With Go version 1.11, Go introduced modules that allows you to work outside of the **`GOPATH`**

With Go Modules, developers now had first class support for the following:

1. **Dependency Management**: Modules provide a way to manage project dependencies. Each module specifies the dependencies it requires (other modules), and each dependency is versioned.
2. **go.mod File**: The core of a Go module is the **`go.mod`** file. This file is located in the root of your project and contains the module's name and its dependencies along with their versions.
3. **Versioning**: Modules support semantic versioning (semver). This makes it easier to manage dependencies, as you can specify exact versions, version ranges, or even use the latest version.
4. **Reproducible Builds**: With modules, builds are reproducible because the specific versions of dependencies are recorded and used for builds.
5. **Independence from GOPATH**: One of the major advantages of modules is that they allow you to work outside of the **`GOPATH`**. You can place your Go project in any directory on your file system.

Ok enough talking, let’s write some code!

## Creating a new Go Module

Create a new folder

```bash
mkdir myproject
cd myproject
```

Create a `go.mod` file in your directory and Initialize the Module. It’s common to use the following naming schema for Go modules.

```bash
go mod init github.com/yourusername/myproject
```

Congratulations. You now have a Go module. Inspect `go.mod` and note that modules name and Go language version have been added.

A Go module is simply a collection of packages with a `go.mod` at the root. There is always a `main` package that serves as the main entry into the program. Let’s make one now.

First create a `main.go` file. 

```bash
touch main.go
```

```go
// main.go

package main

import (
	"fmt"
)

func main() {
	result := "hello creature ..."
	fmt.Println(result)
}
```

Shweet, you now have a main program/package.

To compile your main program:

```bash
go build main.go
```

And then to execute it:

```go
./main
```

Next lets create a helper function to use in our main program. Create a new file called `is-even.go`.

```bash
touch is-even.go
```

```go
// is-even.go

package main

func isEven(number int) bool {
    return number%2 == 0
}
```

Note that the `isEven` function is declared as a private member of the main package, so no importing will be required to use it in `main.go`.

Update `main.go`

```go
// main.go

package main

import (
	"fmt"
)

func main() {
	result := isEven(2) // this function is part of the main package
	fmt.Println(result)
}
```

Notice we imported `fmt` package from [the Go standard library.](https://pkg.go.dev/fmt) Now in order to compile and execute the `main` package we also need to compile `is-even.go` which is part of the `main` package.

```bash
go build main.go is-even.go
./main
```

Alternatively, you can tell go to compile all .go files in your module ***and then execute*** `main.go` with one command.

```bash
go run *.go
```

So far… this is pretty mid. If we forget to include `is-even.go` in our compile step our main package will break. What if we want to add another helper called `is-odd.go`? Then we would need to include three files in the compile step. Not cool. To solve this we can create a new packages in our go module.

Lets create a new package called `utils` and import it into our main program. First create a new folder.

```bash
mkdir utils
cd utils
```

Create a file called `utils.go`

```bash
touch utils.go

cd ..
```

```go
package utils

func IsEven(number int) bool {
    return number%2 == 0
}

func IsOdd(number int) bool {
    return !IsEven(number)
}
```

Nioce. Now we have a `utils` package that exports two functions. ***Notice that we have to capitalize the function names. This is because Go only allows identifiers that start with a capital letter to be exported from a package.***

Let’s update `main.go` to import our new `utils` package.

```go
package main

import (
	"fmt"

	"github.com/yourusername/myproject/utils"
)

func main() {
	result_from_is_even := utils.IsEven(2)
	result_from_is_odd := utils.IsOdd(2)

	fmt.Println(result_from_is_even)
	fmt.Println(result_from_is_odd)
}
```

Finally we can compile and execute `main`. Because we explicitly imported the `utils` package into `main`, the `utils` package will now get compiled as part of the `go build main.go` process.

```bash
go build main.go
./main
```

There ya have it! Just like that you have created a new go module as well as `main` and `utils` packages. Almost all Go projects and modules build off of these concepts. I hope you enjoyed this tutorial and I will see you in the next one!
