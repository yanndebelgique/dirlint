
# Directory linting

This is a simple tool to lint directories. It can be used to check for:
- missing files
- check for files or directories that should not be present
- check for directory structures

# Installation

```bash
npm install -g directory-lint
```

# Usage

```bash
dirlint <path to directory>
```

# examples

## example 1: directory can contain anything
```.dirrules.yaml
---
- '*' // * means anything goes aka. wildcard
```
### case 1.1: valid because dir rules allow anything
``` directory
-/example_1 # empty
```

```bash
> dirlint ./example_1
valid!
```

### case 1.2: valid because dir rules allow anything
``` directory
-/example_1
 - index.ts 
```

```bash
> dirlint ./example_1
valid!
```

## example 2: directory needs to contain file a.ts
```.dirrules.yaml
---
- '*'
- a.ts
```

### case 2.1: Invalid because there is no file a.ts 

``` directory
-/example_1
 - index.ts 
```
```bash
> dirlint ./case_2_1
{
  "item": {
    "item_type": "dir",
    "item_path": "test_directories/case_2_1"
  },
  "missing_items": [
    "a.ts"
  ]
}
invalid dir structure!
```

### case 2.2: Valid because there is a file a.ts

``` directory
-/example_1
 - index.ts 
 - a.ts
```
```bash
> dirlint ./case_2_2
valid!
```

## example 3: Directory can only contain camelcase directories
```.dirrules.yaml
---
- /<CamelCase>
```

### case 3.1: invalid because directory does not contain camelcase directory
``` directory
- index.ts
```

```bash
> dirlint ./case_3_1
{
  "item": {
    "item_type": "dir",
    "item_path": "test_directories/case_3_1"
  },
  "missing_items": [
    "<CamelCase>"
  ]
}
invalid dir structure!
```

### case 3.2: Valid because directory contains a camelcase directory 
``` directory
---
- /Hello
- index.ts 
```

```bash
> dirlint ./case_3_2
valid!
```
